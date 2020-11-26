const { rejects } = require('assert');
var fs = require('fs').promises;
const { resolve } = require('path');
var ColorRegion = require('./ColorRegion')
var colorRegion = ColorRegion.from()

var cardMostUsed

class DeckImage
{
    //Devuelve el HTML completo en String
    static createDeckImage(deckList)
    {
        cardMostUsed = 0
        return (async() =>  {
            var htmlString = ""
            htmlString += "<html>"
            htmlString += "<head><style>"
            await readFileCSS().then((data) => htmlString += data)
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
            
            //Reemplazamos el height del body según el tipo de carta más usada
            cardMostUsed = cardMostUsed * 45 + 50
            if(cardMostUsed > 550)
                htmlString = htmlString.replace("body {width: 1000px;height: 550px;", "body {width: 1000px;height: " + cardMostUsed + "px;")

            return htmlString
         })();
    } 
}

//Lee el css y devuelve una promesa, cuando se resuelva será el String del CSS
function readFileCSS()
{    
    try 
    {
        return fs.readFile('./style.css', 'utf8', function (err,data) {});
    } 
    catch (error) {
        console.log("Error :" + error)
    }   
}

//Devuelve el div completo en String de las cartas
function createDiv(deckList, typeOfCard)
{
    var divString = ""
    //countAll cuenta el total de cartas del mismo tipo. countDifferent cuenta cuantas cartas diferentes hay del mismo tipo
    var countAll = 0
    var countDifferent = 1
    deckList.forEach(cardInDeck => {
        if(cardInDeck.card.cardType == typeOfCard)
        {
            divString += createDivCard(cardInDeck)
            countAll += cardInDeck.count
            countDifferent ++
        }
    });
    divString += "</div>"

    if(cardMostUsed < countDifferent)
        cardMostUsed = countDifferent

    //Agregamos al inicio de la cadena
    divString = divString.replace(/^/, "<div><div class = 'title'><div class = 'titleLineLeft'></div><div class = 'titleText'>" + selectNameForTitle(typeOfCard) + " " + countAll + "</div><div class = 'titleLineRight'></div></div>")

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