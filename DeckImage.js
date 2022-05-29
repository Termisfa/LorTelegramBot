const { rejects } = require('assert');
var fs = require('fs').promises;
const { resolve } = require('path');
var CardsRegion = require('./CardsRegion')
var cardsRegion
var cardMostUsed
var htmlString

var RegionsHandler = require('./RegionsHandler')
var regionsHandler = RegionsHandler.from()


class DeckImage
{
    //Devuelve el HTML completo en String
    static createDeckImage(deckList)
    {
        cardMostUsed = 0
        cardsRegion = CardsRegion.from()
        
        return (async() =>  {
            htmlString = ""
            htmlString += "<html>"
            htmlString += "<head><style>"
            await readFileCSS().then((data) => htmlString += data)
            htmlString += "</style></head>"
            htmlString += "<body><div class='imgBackg'></div><div class='content'>"
            htmlString += "<div class='column' id='column1'>"
            htmlString += createDiv(deckList, "Campeón")
            htmlString += createDiv(deckList, "Hito")   
            //Uso placeholderRegions para sustituirlo luego por las regiones 
            htmlString += "placeholderRegions"                    
            htmlString += "</div><div class='column' id='column2'>"
            htmlString += createDiv(deckList, "Unidad")
            htmlString += "</div><div class='column' id='column3'>"
            htmlString += createDiv(deckList, "Hechizo")
            htmlString += "</div></div></body></html>"

            //Sustituimos el placeholder de regiones
            htmlString = htmlString.replace("placeholderRegions", createDivRegions())

            replaceBckgImg()

            //Reemplazamos el height del body según el tipo de carta más usada
            cardMostUsed = cardMostUsed * 45 + 50
            if(cardMostUsed > 550)
                htmlString = htmlString.replace("body {width: 1000px;height: 550px;", "body {width: 1000px;height: " + cardMostUsed + "px;")

            return htmlString
         })();
    } 

    
    static createDeckImageVertical(deckList)
    {
        cardMostUsed = 0
        cardsRegion = CardsRegion.from()
        
        return (async() =>  {
            htmlString = ""
            htmlString += "<html>"
            htmlString += "<head><style>"
            await readFileCSS().then((data) => htmlString += data)
            htmlString += "</style></head>"
            htmlString += "<body><div class='imgBackg'></div><div class='content'>"
            htmlString += "<div class='columnV' id='columnV'>"
            htmlString += createDivVertical(deckList)
            htmlString += "</div></div></body></html>"

            //Sustituimos el placeholder de regiones
            htmlString = htmlString.replace("placeholderRegions", createDivRegions())

            //Reemplazamos el height del body según el tipo de carta más usada
            cardMostUsed = cardMostUsed * 43
            if(cardMostUsed > 550)
                htmlString = htmlString.replace("body {width: 1000px;height: 550px;", "body {width: 300px;height: " + cardMostUsed + "px;")

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

function createDivVertical(deckList)
{
    var divString = ""
    var countAll = 0
    var countDifferent = 1
    deckList.forEach(cardInDeck => {
        countDifferent ++
        divString += createDivCard(cardInDeck)
        countAll += cardInDeck.count           
        cardsRegion.pushCard(cardInDeck.card.faction, cardInDeck.count)         
    });
    divString += "</div>"

    if(cardMostUsed < countDifferent)
        cardMostUsed = countDifferent

    //Agregamos al inicio de la cadena
    //divString = divString.replace(/^/, "<div><div class = 'title'><div class = 'titleLineLeft'></div><div class = 'titleText'>" + selectNameForTitle(typeOfCard) + " " + countAll + "</div><div class = 'titleLineRight'></div></div>")
    
    if(countAll == 0)
        return ""

    return divString
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
            cardsRegion.pushCard(cardInDeck.card.faction, cardInDeck.count)
           
        }
    });
    divString += "</div>"

    if(cardMostUsed < countDifferent)
        cardMostUsed = countDifferent

    //Agregamos al inicio de la cadena
    divString = divString.replace(/^/, "<div><div class = 'title'><div class = 'titleLineLeft'></div><div class = 'titleText'>" + selectNameForTitle(typeOfCard) + " " + countAll + "</div><div class = 'titleLineRight'></div></div>")
    
    if(countAll == 0)
        return ""

    return divString
}

//Devuelve el div completo en String de una carta
function createDivCard(cardInDeck)
{
    //console.log(cardInDeck)
    var color = regionsHandler.getColorRgb(cardInDeck.card.cardCode.slice(2,4))
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

//Devuelve el div completo con las regiones
function createDivRegions()
{
    var regionsUsed = Object.keys(cardsRegion.regionsUsed).length;
    var divString = ""
    divString = "<div class = 'title'><div class = 'titleLineLeft'></div><div class = 'titleText'>Regiones</div><div class = 'titleLineRight'></div></div>"
    divString += "<div class='regions'>"
    if(regionsUsed == 2)//Si hay 2 regiones, añadimos una vacía por estética
        divString += "<div class='regionCentered'></div>"
    else
        htmlString = htmlString.replace("4, minmax(min-content, 25%)", regionsUsed + ", minmax(min-content, " + 100/regionsUsed + "%)")
    
    for (var region in cardsRegion.regionsUsed) 
    {
        divString += createDivOneRegion(region)
    }

    divString += "</div>"
    return divString
}

//Devuelve el div de una región
function createDivOneRegion(region)
{
    divString = "<div class='regionCentered'><div class='region'>"
    divString += "<img src='https://cdn-lor.mobalytics.gg/production/images/svg/region/" + region + ".svg' class='imgRegion'>"
    divString += "<div class='regionQty'>" + cardsRegion.getQtyRegion(region) + "</div>"
    divString += "</div></div>"
    
    return divString
}

function replaceBckgImg()
{
    var mostUsedRegion = cardsRegion.getMostUsedRegion();
    var bckImgUrl

    switch(mostUsedRegion)
    {
        case "DE": bckImgUrl = "https://image5.uhdpaper.com/wallpaper-hd/lux-garen-galio-demacia-lol-season-2020-uhdpaper.com-hd-5.1836.jpg"; break;
        case "FR": bckImgUrl = "https://lol-stats.net/uploads/MS5NogIhWY99fLnw7uoYnJJm1z0FtY8M1aMYEOmm.jpeg"; break;
        case "IO": bckImgUrl = "https://i.pinimg.com/originals/d5/c8/6b/d5c86b2ef855a35077f4da8a7fbcdb99.png"; break;
        case "NX": bckImgUrl = "https://images.contentstack.io/v3/assets/blt187521ff0727be24/blt9d0c487b98ba6b42/60ee0ffb975ffd4ff25ec2f5/noxus_splash.jpg"; break;
        case "PZ": bckImgUrl = "https://1.bp.blogspot.com/-vAFMm7NKeLs/X4wrFQFWKoI/AAAAAAAAEEc/XZOV9aCtXqYOlcz1U52-0BsnHuSeih_PACNcBGAsYHQ/w919/jinx-lol-piltover-zaun-lor-landscape-scenery-uhdpaper.com-4K-8.525-wp.thumbnail.jpg"; break;
        case "SI": bckImgUrl = "https://lol-stats.net/uploads/QxIeaTC3dFSW5dihRqCZrbsteNzwMRUhk3BKW7Rl.jpeg"; break;
        case "BW": bckImgUrl = "https://www.wallpaperflare.com/static/964/108/32/bilgewater-league-of-legends-online-game-wallpaper.jpg"; break;
        case "SH": bckImgUrl = "https://i.pinimg.com/originals/ca/65/55/ca65555c1a1f815713415f0a85c47340.png"; break;
        case "MT": bckImgUrl = "https://i.pinimg.com/originals/b7/d9/39/b7d93983f7e9c35d12b5909d25245132.jpg"; break;
        case "BC": bckImgUrl = "https://image-1.uhdpaper.com/b/pc-4k/the-bandle-tree-lor-bandle-city-4k-wallpaper-3840x2160-uhdpaper.com-270.1_b.jpg"; break;
        case "RU": 
                {
                    if(htmlString.includes("Jhin"))
                        bckImgUrl = "https://i.pinimg.com/originals/7a/38/c9/7a38c91f79695688247c9e341669c5d1.jpg"
                    else if(htmlString.includes("Bard"))
                        bckImgUrl = "https://wallpaperaccess.com/full/3290609.jpg"
                }
    }

    htmlString = htmlString.replace("placeholderBckgImg", bckImgUrl)
}


module.exports = DeckImage