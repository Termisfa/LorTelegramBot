

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
        allCardsInfo.forEach(element => {
            if(element.name.toLowerCase().includes(cardName.toLowerCase()) && element.cardCode.length == 7)
                infoCardsProv.push([element.name, element.assets[0].gameAbsolutePath])    
          });
        return infoCardsProv
    }
}

