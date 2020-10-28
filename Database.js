

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
}

module.exports = Database

