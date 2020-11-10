const { rejects } = require('assert');
var fs = require('fs');
const { resolve } = require('path');
var ColorRegion = require('./ColorRegion')
var colorRegion = ColorRegion.from()


class DeckImage
{
    //Devuelve el HTML completo en String
    static createDeckImage(deckList)
    {
        //console.log(readFileCSS())
        var htmlString = "<html>"
        htmlString += "<head><style>"
        htmlString += cssMalHecho()
        htmlString += "</style></head>"
        htmlString += "<body><div class='imgBackg'></div><div class='content'>"
        htmlString += "<div class='column' id='column1'>"
        htmlString += createDiv(deckList, "Campeón")
        htmlString += createDiv(deckList, "Hito")
        htmlString += "</div><div class='column' id='column2'>"
        htmlString += createDiv(deckList, "Unidad")
        htmlString += "</div><div class='column' id='column3'>"
        htmlString += createDiv(deckList, "Hechizo")


        htmlString += "</div></div></body></html>"
        //console.log(htmlString)

        return htmlString
    } 
}

function cssMalHecho()
{
    var aux = ""
    aux += ".imgBackg { background: url('https://sm.ign.com/ign_es/screenshot/default/maxresdefault_ee6u.jpg') no-repeat center center fixed;webkit-background-size: cover;-moz-background-size: cover;-o-background-size: cover;background-size: cover;opacity: 0.4;top: 0;left: 0;bottom: 0;right: 0;position: absolute;z-index: -1;  }"
    aux += "body {width: 1000px; font-family: Arial, Helvetica, sans-serif;}"
    aux += ".column {float: left;width: 33.33%; text-align: center; }"
    aux += "  /* Clear floats after the columns */.content:after {content: '';display: table;clear: both;}"
    aux += " img {border-radius: 6px;}"
    aux += "  .boxImg {width: 300px; position: relative;margin: 3px auto;}"
    aux += "  .image {height: 20px;display: flex;justify-content: space-between;align-items: center;padding: 10px;border-radius: 6px;color: rgb(255, 255, 255);    }"
    aux += ".elixirCostBox {display: inline-grid;justify-content: center;align-items: center;border-radius: 100%;border: 1px solid rgb(189, 158, 89);box-shadow: rgba(20, 11, 36, 0.8) 0px 0px 6px 0px, black 0px 0px 0px 2px inset;background-image: linear-gradient(138deg, rgb(160, 223, 246) 18%, rgba(41, 150, 164, 0) 35%, rgba(41, 150, 164, 0) 67%, rgb(160, 223, 246) 82%), radial-gradient(circle at 50% 50%, rgb(47, 79, 143), rgb(41, 70, 129) 44%, rgb(9, 127, 149) 73%, rgb(45, 165, 183) 76%);width: 20px;height: 20px;flex: 0 0 auto;margin-right: 16px;}"
    aux += ".elixirCost {font-size: 12px;line-height: 20px;font-weight: bold;text-align: center;color: rgb(255, 255, 255);}"
    aux += ".cardName {text-align: left;font-size: 14px;line-height: 20px;font-weight: bold;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;flex: 0 1 auto;padding-right: 4px;width: 100%;align-self: flex-start;text-shadow: rgb(0, 0, 0) 0px 1px 3px;letter-spacing: 0.25px;}"
    aux += ".boxOutQty {border: 1px solid rgba(189, 158, 89, 0.6);background: linear-gradient(313.24deg, rgb(56, 43, 33) 0%, rgb(46, 33, 33) 100%);box-shadow: rgba(20, 11, 36, 0.6) 0px 0px 4px 0px;border-radius: 3px;overflow: hidden;flex: 0 0 auto;}"
    aux += ".boxInQty {border: 1px solid rgb(189, 158, 89);background: linear-gradient(313.24deg, rgb(56, 43, 33) 0%, rgb(46, 33, 33) 100%);margin: 2px;padding: 0px 4px;border-radius: 3px;box-sizing: border-box;}"
    aux += ".textQtyX {margin-top: 2px;margin-right: 5px;font-size: 8px;font-weight: 700;display: inline-block;line-height: 1px;vertical-align: middle;}"
    aux += ".textQty {font-size: 12px;font-weight: 700;display: inline-block;line-height: 1px;vertical-align: middle;margin-left: -3px;}"

    return aux
}

//Para sacar image random entre 1 y 6
function imgRandom()
{
    return Math.floor(Math.random() * 6) + 1 
}


//Lee el css y lo devuelve como string
async function readFileCSS()
{    
    var aux = "No ha funcionado"
    try {
        await fs.readFile('./style.css', 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            console.log(data)
            aux = data
            });
    } catch (error) {
        console.log("Error :" + error)
    }
    return await  aux
    
}



//Devuelve el div completo en String de las cartas
function createDiv(deckList, typeOfCard)
{
    var divString = ""
    var count = 0
    deckList.forEach(cardInDeck => {
        if(cardInDeck.card.cardType == typeOfCard)
        {
            divString += createDivCard(cardInDeck)
            count += cardInDeck.count
        }
    });
    divString += "</div>"

    //Agregamos al inicio de la cadena
    divString = divString.replace(/^/, "<div><h1>" + selectNameForTitle(typeOfCard) + " " + count + "</h1>")

    return divString
}

//Devuelve el div completo en String de una carta
function createDivCard(cardInDeck)
{
    var color = colorRegion.getColorRgb(cardInDeck.card.cardCode.slice(2,4))
    var divString = "<div class='boxImg'>"
    divString += "<div class='image' style='background: linear-gradient(90deg, rgb(" + color + ") 35%, rgba(" + color + ", 0) 70%), url(https://cdn-lor.mobalytics.gg/production/images/cards-preview/" + cardInDeck.card.cardCode + ".webp) right center no-repeat;'>"
    divString += "<div class='elixirCostBox'><span class='elixirCost'>" + cardInDeck.card.elixirCost + "</span></div>"
    divString += "<span class='cardName'>" + cardInDeck.card.name + "</span>"
    divString += "<div class='boxOutQty'><div class='boxInQty'><span class='textQtyX'>X</span><p class='textQty'>" + cardInDeck.count + "</p></div></div>"
    divString += "</div></div>"

    return divString
}

function selectNameForTitle(typeOfCard)
{
    switch(typeOfCard)
    {
        case "Campeón": return "Campeones"
        case "Hito": return "Hitos"
        case "Unidad": return "Adeptos"
        case "Hechizo": return "Hechizos"
    }
}


module.exports = DeckImage