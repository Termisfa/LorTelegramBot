

const CardInfo = require('./CardInfo')

const allCardsInfo = require('./allSets-es_es.json')
const allCardsInfoEng = require('./allSets-en_us.json')



class Database
{
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



module.exports = Database

/*
//Para tests
app.listen(3000, function() {
    console.log(Database.searchCardById('01PZ040T2'))
    console.log('Telegram app listening on port 3000!')
  })
*/