const CardInfo = require('./CardInfo')
var bodyParser = require('body-parser')
var app = express()

var allCardsInfo

class Database
{
    static buildDatabase()
    {
        allCardsInfo = require('./allSets-es_es.json')

        app.use(bodyParser.json()) // for parsing application/json
        app.use(
        bodyParser.urlencoded({
            extended: true
        })
        ) // for parsing application/x-www-form-urlencoded
    }

    static searchCardByName(cardName)
    {
        let infoCardsProv = []
        allCardsInfo.forEach(element => {
            if(element.name.toLowerCase().includes(msgReceived.toLowerCase()) && element.cardCode.length == 7)
                infoCardsProv.push([element.name, element.assets[0].gameAbsolutePath])    
          });
    }
}

