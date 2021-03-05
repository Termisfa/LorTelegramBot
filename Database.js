

module.exports = function(botLog){
  'use strict';
  const request = require('superagent');
  var yauzl = require("yauzl");
  const fs = require('fs');
  
  const CardInfo = require('./CardInfo')
  
  var allCardsInfo = require('./allSetsEsp.json')
  var allCardsInfoEng = require('./allSetsEng.json')

  var lastModifiedZip = new Date()
  var sets = 4 //Cantidad de sets actuales



  var arrayDataEsp
  var arrayDataEng
  
  
  
  
  class Database
  {
      //Fuerza los sets actuales al número de entrada
      static forceSets(number)
      {
        sets = number
      }

      //Actualiza los datos desde los json
      static update(number = (sets + 1)) 
      {
        arrayDataEsp = new Array()
        for(var i = 0; i < number; i++)
            downloadEsp(i + 1);

        arrayDataEng = new Array()
        for(var i = 0; i < number; i++)
            downloadEng(i + 1);          
      }

      //Devuelve una lista de cartas coleccionables con todas las que contengan un string
      static searchCardByName(cardName)
      {
          let infoCardsProv = []
          cardName = cardName.toLowerCase()
          cardName = removeAccents(cardName)
          //Busca las cartas en español
          allCardsInfo.forEach(card => {
              if(removeAccents(card.name.toLowerCase()).includes(cardName) && card.cardCode.length == 7)
                  infoCardsProv.push(CardInfo.from(card.cardCode, card.name, card.assets[0].gameAbsolutePath, card.associatedCardRefs, card.cost, getTypeOfCard(card)))
          });
          //Busca las cartas en inglés, comprueba que no estén ya encontradas, busca su id en español, e incluye esa carta
          allCardsInfoEng.forEach(card => {
              if(removeAccents(card.name.toLowerCase()).includes(cardName) && card.cardCode.length == 7)
              {
                  let bool = false
                  infoCardsProv.forEach(element => {
                      if(card.cardCode == element.cardCode)
                          bool = true
                  });
                  if(!bool)
                      infoCardsProv.push(this.searchCardById(card.cardCode))
              }   
          });
          return infoCardsProv
      }

      //Devuelve una lista de cartas con todas las que contengan un string, incluídas las no coleccionables
      static searchCardByNameAll(cardName)
      {
          let infoCardsProv = []
          cardName = cardName.toLowerCase()
          cardName = removeAccents(cardName)
          //Busca las cartas en español
          allCardsInfo.forEach(card => {
              if(removeAccents(card.name.toLowerCase()).includes(cardName))
                  infoCardsProv.push(CardInfo.from(card.cardCode, card.name, card.assets[0].gameAbsolutePath, card.associatedCardRefs, card.cost, getTypeOfCard(card)))
          });
          //Busca las cartas en inglés, comprueba que no estén ya encontradas, busca su id en español, e incluye esa carta
          allCardsInfoEng.forEach(card => {
              if(removeAccents(card.name.toLowerCase()).includes(cardName))
              {
                  let bool = false
                  infoCardsProv.forEach(element => {
                      if(element != null && card.cardCode == element.cardCode)
                          bool = true
                  });
                  if(!bool)
                      infoCardsProv.push(this.searchCardById(card.cardCode))
              }   
          });
          return infoCardsProv
      }

      //Devuelve la carta que coincida con un ID
      static searchCardById(cardId)
      {
          //Con for, porque foreach no admite breaks ni returns
          for(var i = 0; i < allCardsInfo.length; i++)
          {
              if(allCardsInfo[i].cardCode === cardId)
                  return CardInfo.from(allCardsInfo[i].cardCode, allCardsInfo[i].name, allCardsInfo[i].assets[0].gameAbsolutePath, allCardsInfo[i].associatedCardRefs, allCardsInfo[i].cost, getTypeOfCard(allCardsInfo[i]))
          }
      }
      //Busca cartas relacionadas con una y devuelve la lista
      static getListByCardId(card)
      {
          let cardListImages = [] 
          cardListImages.push(card)
          card.relatedCards.forEach(element => {
              var newCard = Database.searchCardById(element)
              //El if es para evitar que salga la misma carta en la imagen, como el caso de la crujivid que se referencia a sí misma
              if(card.cardCode != newCard.cardCode)
              cardListImages.push(newCard)
          });   
          return cardListImages
      }
      //Ordena las cartas de un deck por su coste de elixir y la devuelve
      static sortDeckByElixir(deckUnsorted) 
      {
          var deckSorted =  []
          var elixirCost = 0
          while(deckUnsorted.length != 0)
          {
              for(var i = 0; i < deckUnsorted.length; i++)
              {
                  if(deckUnsorted[i].card.elixirCost == elixirCost)
                  {
                      deckSorted.push(deckUnsorted.splice(i, 1)[0])
                      i--
                  }
              }
              elixirCost++
          }        
          return deckSorted
      }

      //Descarga el último set, comprueba su fecha, y si es diferente a la actual hace update
      static checkIfUpdated(number = sets)
      {
        try
        {
          var downloadSave = "./test.zip"    
    
          request
          .get('https://dd.b.pvp.net/latest/set' + number + '-lite-es_es.zip')
          .on('error', function(error) {
            botlog(error, error, "checkIfUpdated", true)
          })
          .pipe(fs.createWriteStream(downloadSave))
          .on('finish', function() 
          {
            yauzl.open(downloadSave, {lazyEntries: true, autoClose: true}, function(error, zipfile) {
              if (error) 
                botlog(error, error, "checkIfUpdated", true)
              else
              {
                zipfile.readEntry();
                zipfile.on("entry", function(entry) {        
                  if(lastModifiedZip.getTime() == entry.getLastModDate().getTime())    
                    botLog("Los json están al día") 
                  else
                  {
                    lastModifiedZip = entry.getLastModDate()
                    botLog("Los json no están al día, iniciando actualización")
                    Database.update()
                  }        
                  zipfile.close()             
                })
              }  
              fs.promises.unlink(downloadSave).catch(error => {
                botlog(error, error, "checkIfUpdated", true)
              })            
            })
          })
        }
        catch (error)  {  botlog(error, error, "checkIfUpdated", true)   }   
      }
  }
  
  //Devuelve qué tipo de carta es
  function getTypeOfCard(card)
  {
      if(card.rarityRef == "Champion")
          return "Campeón"
      else
          return card.type
  }
  
  //Elimina los acentos de un string
  function removeAccents(text)
  {
      const accentsList = {'á':'a','é':'e','í':'i','ó':'o','ú':'u','Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U'};
      return text.split('').map( char => accentsList[char] || char).join('').toString();	
  }
  
  
  
  function downloadEsp(number)
  {
    try {
      var downloadSave = "./set" + number + "Esp.zip"
      var jsonSave = "set" + number + "-es_es.json"


      request
      .get('https://dd.b.pvp.net/latest/set' + number + '-lite-es_es.zip')
      .on('error', function(error) {
        botlog(error, error, "downloadEsp", true)
      })
      .pipe(fs.createWriteStream(downloadSave))
      .on('finish', function() {
        unzipEsp(jsonSave, downloadSave, number)
      })
    }
    catch (error)  {  botlog(error, error, "unzipEsp", true)   }   
    
  }

  function unzipEsp(jsonSave, downloadSave, number)
  {
    try 
    {
      yauzl.open(downloadSave, {lazyEntries: true, autoClose: true}, function(error, zipfile) {
        if (error) 
          fs.promises.unlink(downloadSave).catch(error => {
            botlog(error, error, "unzipEsp", true)
          })        
        else
        {
          //En caso de que se descargue un nuevo set por primera vez
          if(sets < number)
          {
            botLog("Se ha aumentado el número de sets a " + number)
            sets = number
          }

          zipfile.readEntry();
          zipfile.on("entry", function(entry) {        
          if(entry.fileName == ( "es_es/data/" + jsonSave)) 
          {
            zipfile.openReadStream(entry, function(error, readStream) {
                if (error) 
                  botlog(error, error, "unzipEsp", true)
                else
                {                      
                  readStream.pipe(fs.createWriteStream(jsonSave));
                  readStream.on("end", function() {
                    //Ya está creado el json, aquí lo leemos y guardamos en el array
                    fs.readFile(jsonSave, function(error, data){
                      if(error)
                        botlog(error, error, "unzipEsp", true)
                      else
                      {
                        arrayDataEsp.push(data);
                        readFinishedEsp()
                      }                          
                    })
                  })
                }                  
              });
              zipfile.close()
            }
            else
                zipfile.readEntry();              
          })
        }      
      })
    } 
    catch (error)  {  botlog(error, error, "unzipEsp", true)   }    
  }

  
  function readFinishedEsp()
  {
    try
    {
      if(arrayDataEsp.length == sets)
      {
        var data = "";
        for(var i = 0; i < sets; i++)
        {
          data += arrayDataEsp[i];
          fs.promises.unlink("./set" + (i + 1) + "Esp.zip").catch(error => {
              botlog(error, error, "readFinishedEsp", true)
            })
          fs.promises.unlink("./set" + (i + 1) + "-es_es.json").catch(error => {
             botlog(error, error, "readFinishedEsp", true)
            })
        }
        
        data = data.split('][').join(',');
        fs.writeFile('./allSetsEsp.json', data, () => { 
            botLog("Terminado proceso de update en español")
            allCardsInfo = JSON.parse(fs.readFileSync('./allSetsEsp.json'));
        } );
      }
    }
    catch (error)  {  botlog(error, error, "readFinishedEsp", true)   }    
  }
  
  
  
  function downloadEng(number)
  {
    try
    {
      var downloadSave = "./set" + number + "Eng.zip"
      var jsonSave = "set" + number + "-en_us.json"
  
  
      request
      .get('https://dd.b.pvp.net/latest/set' + number + '-lite-en_us.zip')
      .on('error', function(error) {
        botlog(error, error, "downloadEng", true) 
      })
      .pipe(fs.createWriteStream(downloadSave))
      .on('finish', function() {
        unzipEng(jsonSave, downloadSave)     
      })
    }
    catch (error)  {  botlog(error, error, "downloadEng", true)   }    
  }

  function unzipEng(jsonSave, downloadSave)
  {
    try 
    {
      yauzl.open(downloadSave, {lazyEntries: true, autoClose: true}, function(error, zipfile) {
        if (error) 
        {
          fs.promises.unlink(downloadSave).catch(error => {
            botlog(error, error, "unzipEng", true)
          }) 
        }                 
        else
        {
          zipfile.readEntry();
          zipfile.on("entry", function(entry) {        
            if(entry.fileName == ("en_us/data/" + jsonSave))
            {
              zipfile.openReadStream(entry, function(error, readStream) {
                  if (error) 
                    botlog(error, error, "unzipEng", true)
                  else
                  {                      
                    readStream.pipe(fs.createWriteStream(jsonSave));
                    readStream.on("end", function() {
                      //Ya está creado el json, aquí lo leemos y guardamos en el array
                      fs.readFile(jsonSave, function(error, data){
                        if(error)
                          botlog(error, error, "unzipEng", true)
                        else
                        {
                          arrayDataEng.push(data);
                          readFinishedEng()
                        }                          
                      })
                    })
                  }                  
                });
                zipfile.close()
            }
            else
                zipfile.readEntry();              
          })
        }      
      })
    } 
    catch (error)  {  botlog(error, error, "unzipEng", true)   }    
  }

  function readFinishedEng()
  {
    try
    {
      if(arrayDataEng.length == sets)
      {
        var data = "";
        for(var i = 0; i < sets; i++)
        {
          data += arrayDataEng[i];
          fs.promises.unlink("./set" + (i + 1) + "Eng.zip").catch(error => {
              botlog(error, error, "readFinishedEng", true)
            })
          fs.promises.unlink("./set" + (i + 1) + "-en_us.json").catch(error => {
             botlog(error, error, "readFinishedEng", true)
            })
        }    
        
        data = data.split('][').join(',');
        fs.writeFile('./allSetsEng.json', data, () => { 
            botLog("Terminado proceso de update en inglés")
            allCardsInfoEng = JSON.parse(fs.readFileSync('./allSetsEng.json'));
        } );
      }
    }
    catch (error)  {  botlog(error, error, "readFinishedEng", true)   }    
  }
  



  return Database
}