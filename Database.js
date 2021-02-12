

module.exports = function(botLog){
  'use strict';
  const admZip = require('adm-zip');
  const request = require('superagent');
  const fs = require('fs');
  
  const CardInfo = require('./CardInfo')
  
  var allCardsInfo = require('./allSetsEsp.json')
  var allCardsInfoEng = require('./allSetsEng.json')
  var arrayDataEsp
  var arrayDataEng
  var size;
  
  
  
  
  class Database
  {
      //Actualiza los datos desde los json
      static update(number) 
      {
        botLog("Iniciadas descargas")

        size = number;
        arrayDataEsp = new Array()
        for(var i = 0; i < number; i++)
            downloadUnzipEsp(i + 1);

        arrayDataEng = new Array()
        for(var i = 0; i < number; i++)
            downloadUnzipEng(i + 1);          
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
                      if(card.cardCode == element.cardCode)
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
  
  
  
  function downloadUnzipEsp(number)
  {
    var downloadSave = "./set" + number + "Esp.zip"
    request
    .get('https://dd.b.pvp.net/latest/set' + number + '-lite-es_es.zip')
    .on('error', function(error) {
      console.log(error);
    })
    .pipe(fs.createWriteStream(downloadSave))
    .on('finish', function() {
      botLog("Terminada descarga Esp " + number)
      var zip = new admZip(downloadSave);
      zip.extractEntryTo("es_es/data/set"+ number + "-es_es.json", "./", false, true);
    })
    .on('close', function() {
        fs.readFile("./set" + number + "-es_es.json", function(err, data){
          if(err)
          {
            console.log(err)
          }
          arrayDataEsp.push(data);
          readFinishedEsp()
        })
      })
  }
  
  function readFinishedEsp()
  {
    if(arrayDataEsp.length == size)
    {
      var data = "";
      for(var i = 0; i < size; i++)
      {
        data += arrayDataEsp[i];
        fs.promises.unlink("./set" + (i + 1) + "Esp.zip")
          .catch(err => {
            botLog('Something wrong happened removing the file ' + err)
          })
        fs.promises.unlink("./set" + (i + 1) + "-es_es.json")
          .catch(err => {
            botLog('Something wrong happened removing the file ' + err)
          })
      }    
      
      data = data.split('][').join(',');
      fs.writeFile('./allSetsEsp.json', data, () => { 
          botLog("Terminado proceso de update en español")
          allCardsInfo = JSON.parse(fs.readFileSync('./allSetsEsp.json'));
      } );
    }
  }
  
  
  
  function downloadUnzipEng(number)
  {
    var downloadSave = "./set" + number + "Eng.zip"
    botLog("Iniciada descarga Eng " + number)
    request
    .get('https://dd.b.pvp.net/latest/set' + number + '-lite-en_us.zip')
    .on('error', function(error) {
      console.log(error);
    })
    .pipe(fs.createWriteStream(downloadSave))
    .on('finish', function() {
      botLog("Terminada descarga Eng " + number)
      var zip = new admZip(downloadSave);
      zip.extractEntryTo("en_us/data/set"+ number + "-en_us.json", "./", false, true);     
    })
    .on('close', function() {
        fs.readFile("./set" + number + "-en_us.json", function(err, data){
          if(err)
          {
            console.log(err)
          }
          arrayDataEng.push(data);
          readFinishedEng()
        })
      })
  }
  
  function readFinishedEng()
  {
    if(arrayDataEng.length == size)
    {
      var data = "";
      for(var i = 0; i < size; i++)
      {
        data += arrayDataEng[i];
        fs.promises.unlink("./set" + (i + 1) + "Eng.zip")
          .catch(err => {
            botLog('Something wrong happened removing the file ' + err)
          })
        fs.promises.unlink("./set" + (i + 1) + "-en_us.json")
          .catch(err => {
            botLog('Something wrong happened removing the file ' + err)
          })
      }    
      
      data = data.split('][').join(',');
      fs.writeFile('./allSetsEng.json', data, () => {
        botLog("Terminado proceso de update en inglés")
        allCardsInfoEng = JSON.parse(fs.readFileSync('./allSetsEng.json'));        
       } );
    }
  }

  return Database
}

