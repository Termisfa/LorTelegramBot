var CardsRegion = require('./CardsRegion')

module.exports = function(botLog){
  'use strict';
  const request = require('superagent');
  var yauzl = require("yauzl");
  const fs = require('fs');
  
  const CardInfo = require('./CardInfo')

  var lastModifiedZip = new Date()
  var sets = 6 //Cantidad de sets actuales

  const languages = ['es_es', 'en_us', 'es_mx']
  var arrayDownloadFinished

  var allCardsArray = new Array()
  for(var i = 0; i < languages.length; i++)
    allCardsArray.push(require('./allSets-' + languages[i] + '.json'))
  
  
  
  class Database
  {
      //Obtiene los idiomas
      static getLanguages()
      {
        return languages
      }

      //Fuerza los sets actuales al número de entrada
      static forceSets(number)
      {
        sets = number
      }

      //Inicia el proceso de actualización, comprobando si hay un set nuevo
      static update(number = (sets + 1)) 
      {
        arrayDownloadFinished = new Array()
        for(var i = 0; i < languages.length; i++)
        {
          arrayDownloadFinished[i] = new Array()
          for(var j = 0; j < number; j++)
            download(languages[i], i, j + 1)
        }
       
      }

      //Devuelve una lista de cartas con todas las que contengan un string, incluídas las no coleccionables
      static searchCardByName(cardName, includeNonCollectibles)
      {
          let infoCardsProv = []
          cardName = cardName.toLowerCase()
          cardName = removeAccents(cardName)
          //Busca las cartas en español
          allCardsArray[0].forEach(card => {
              if(removeAccents(card.name.toLowerCase()).includes(cardName) && (includeNonCollectibles || card.cardCode.length == 7))
              {
                infoCardsProv.push(CardInfo.from(card.cardCode, card.name, card.assets[0].gameAbsolutePath, 
                                                  card.associatedCardRefs, card.cost, getTypeOfCard(card), card.regionRefs))
              }
          });
          //Busca las cartas en los demás idiomas, comprueba que no estén ya encontradas, busca su id en español, e incluye esa carta
          for(var i = 1; i < languages.length; i++)
          {
            allCardsArray[i].forEach(card => {
              if(removeAccents(card.name.toLowerCase()).includes(cardName) && (includeNonCollectibles || card.cardCode.length == 7))
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
          }

          return infoCardsProv
      }

      //Devuelve la carta que coincida con un ID
      static searchCardById(cardId)
      {
          //Con for, porque foreach no admite breaks ni returns
          for(var i = 0; i < allCardsArray[0].length; i++)
          {
              if(allCardsArray[0][i].cardCode === cardId)
              {
                return CardInfo.from(allCardsArray[0][i].cardCode, allCardsArray[0][i].name, allCardsArray[0][i].assets[0].gameAbsolutePath, allCardsArray[0][i].associatedCardRefs,
                                      allCardsArray[0][i].cost, getTypeOfCard(allCardsArray[0][i]), allCardsArray[0][i].regionRefs)
              }                  
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

      //Arregla las regiones para evitar problemas con las multiregión y los campeones de runeterra
      static fixFactions(deck) 
      {
        var cardsRegion = CardsRegion.from()
        var anyCardMultiregion = false

        deck.forEach(cardInDeck => 
        {
          if(cardInDeck.card.factions.length > 1)
            anyCardMultiregion = true

          cardInDeck.card.factions.forEach(faction =>
          {
            cardsRegion.pushCard(faction, cardInDeck.count)
          });
        });

        var mostUsedRegion = cardsRegion.getMostUsedRegion(false)

        if(mostUsedRegion == "RU")
        {
          var secondMostUsedRegion = cardsRegion.getMostUsedRegion(true)

          deck.forEach(cardInDeck => 
          {
            if(cardInDeck.card.factions.includes(secondMostUsedRegion))
              cardInDeck.card.usedFaction = secondMostUsedRegion
            else
              cardInDeck.card.usedFaction = mostUsedRegion
          });
        }        
        else if(anyCardMultiregion && Object.keys(cardsRegion.regionsUsed).length > 1)
        {
          cardsRegion.sortRegions()

          var mainRegions = cardsRegion.regionsUsed
          mainRegions.shift()
          var secondMostUsedRegion = mainRegions.shift()[0]

          for(var i = 0; i < deck.length; i++)
          {
            if(deck[i].card.factions.includes(mostUsedRegion))
              deck[i].card.usedFaction = mostUsedRegion
            else if(deck[i].card.factions.includes(secondMostUsedRegion))
              deck[i].card.usedFaction = secondMostUsedRegion
          }
        }

        return deck;
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
  
  function download(lang, positionLang, set)
  {
    try
    {
      var downloadSave = "./set" + set + lang + ".zip"
      var jsonSave = "set" + set + "-" + lang + ".json"

      request
      .get('https://dd.b.pvp.net/latest/set' + set + '-lite-' + lang + '.zip')
      .on('error', function(error) {
        botlog(error, error, "download", true)
      })
      .pipe(fs.createWriteStream(downloadSave))
      .on('finish', function() {
        unzip(jsonSave, downloadSave, set, lang, positionLang)
      })
    }
    catch (error)  {  botlog(error, error, "download", true)   }
  }

  function unzip(jsonSave, downloadSave, set, lang, positionLang)
  {
    try 
    {
      yauzl.open(downloadSave, {lazyEntries: true, autoClose: true}, function(error, zipfile) {
        if (error) 
          fs.promises.unlink(downloadSave).catch(error => {
            botlog(error, error, "unzip", true)
          })        
        else
        {
          //En caso de que se descargue un nuevo set por primera vez
          if(sets < set)
          {
            botLog("Se ha aumentado el número de sets a " + set)
            sets = set
          }

          zipfile.readEntry();
          zipfile.on("entry", function(entry) {        
          if(entry.fileName == ( lang + "/data/" + jsonSave)) 
          {
            zipfile.openReadStream(entry, function(error, readStream) {
                if (error) 
                  botlog(error, error, "unzip", true)
                else
                {                      
                  readStream.pipe(fs.createWriteStream(jsonSave));
                  readStream.on("end", function() {
                    //Ya está creado el json, aquí lo leemos y guardamos en el array
                    fs.readFile(jsonSave, function(error, data){
                      if(error)
                        botlog(error, error, "unzip", true)
                      else
                      {
                        arrayDownloadFinished[positionLang].push(data)
                        readFinished(lang, positionLang)
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
    catch (error)  {  botlog(error, error, "unzip", true)   } 
  }

  function readFinished(lang, positionLang)
  {
    try
    {
      if(arrayDownloadFinished[positionLang].length == sets)
      {
        var data = "";
        for(var i = 0; i < sets; i++)
        {
          data += arrayDownloadFinished[positionLang][i];
          fs.promises.unlink("./set" + (i + 1) + lang + ".zip").catch(error => {
              botlog(error, error, "readFinished", true)
            })
          fs.promises.unlink("./set" + (i + 1) + "-" + lang + ".json").catch(error => {
             botlog(error, error, "readFinished", true)
            })
        }
        
        data = data.split('][').join(',');
        fs.writeFile('./allSets-' +  lang + '.json', data, () => { 
            botLog("Terminado proceso de update para " + lang)
            allCardsArray[positionLang] = JSON.parse(fs.readFileSync('./allSets-' +  lang + '.json'));
        } );
      }
    }
    catch (error)  {  botlog(error, error, "readFinished", true)   }    
  }
  
  
  return Database
}