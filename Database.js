

const CardInfo = require('./CardInfo')
var bodyParser = require('body-parser')
var express = require('express')
var app = express()

const allCardsInfo = require('./allSets-es_es.json')



class Database
{
    static searchCardByName(cardName)
    {
        let infoCardsProv = []
        cardName = cardName.toLowerCase()
        cardName = removeAccents(cardName)
        allCardsInfo.forEach(card => {
            if(removeAccents(card.name.toLowerCase()).includes(cardName) && card.cardCode.length == 7)
                infoCardsProv.push(CardInfo.from(card.cardCode, card.name, card.assets[0].gameAbsolutePath, card.associatedCardRefs, card.cost, card.type))
            //infoCardsProv.push([element.name, element.assets[0].gameAbsolutePath])    
          });
        return infoCardsProv
    }
    static searchCardById(cardId)
    {
        //Con for, porque foreach no admite breaks ni returns
        for(var i = 0; i < allCardsInfo.length; i++)
        {
            if(allCardsInfo[i].cardCode === cardId)
                return CardInfo.from(allCardsInfo[i].cardCode, allCardsInfo[i].name, allCardsInfo[i].assets[0].gameAbsolutePath, allCardsInfo[i].associatedCardRefs, allCardsInfo[i].cost, allCardsInfo[i].type)
        }
    }
}

function removeAccents(text){
	const accentsList = {'á':'a','é':'e','í':'i','ó':'o','ú':'u','Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U'};
	return text.split('').map( char => accentsList[char] || char).join('').toString();	
}

module.exports = Database

/*
//Para tests
app.listen(3000, function() {
    console.log(Database.searchCardById('01PZ040T2'))
    console.log('Telegram app listening on port 3000!')
  })
*/