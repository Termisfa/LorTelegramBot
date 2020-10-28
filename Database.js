

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
        allCardsInfo.forEach(card => {
            if(card.name.toLowerCase().includes(cardName.toLowerCase()) && card.cardCode.length == 7)
                infoCardsProv.push(CardInfo.from(card.cardCode, card.name, card.assets[0].gameAbsolutePath, card.associatedCardRefs))
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
                return CardInfo.from(allCardsInfo[i].cardCode, allCardsInfo[i].name, allCardsInfo[i].assets[0].gameAbsolutePath, allCardsInfo[i].associatedCardRefs)
        }
    }
}

module.exports = Database

/*
//Para tests
app.listen(3000, function() {
    console.log(Database.searchCardById('01PZ040T2'))
    console.log('Telegram app listening on port 3000!')
  })
*/