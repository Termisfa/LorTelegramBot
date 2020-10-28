const CardInfo = require('./CardInfo')
var bodyParser = require('body-parser')
var express = require('express')
var app = express()

const allCardsInfo = require('./allSets-es_es.json')

app.use(bodyParser.json()) // for parsing application/json
app.use(
bodyParser.urlencoded({
    extended: true
})
) // for parsing application/x-www-form-urlencoded

class Database
{
    static searchCardByName(cardName)
    {
        let infoCardsProv = []
        allCardsInfo.forEach(element => {
            if(element.name.toLowerCase().includes(msgReceived.toLowerCase()) && element.cardCode.length == 7)
                infoCardsProv.push([element.name, element.assets[0].gameAbsolutePath])    
          });
    }
}

