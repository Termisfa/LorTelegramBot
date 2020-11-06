

const Card = require('./Card')
const cardList = []


cardList.push(Card.from("01DE001", "Abanderado de vanguardia"))
cardList.push(Card.from("01DE002", "Tianna Crownguard"))
cardList.push(Card.from("01DE003", "Guardafilos Laurent"))
cardList.push(Card.from("01DE004", "Vanguardia alargéntea")) 
cardList.push(Card.from("01DE006", "Sargento de la Vanguardia"))//01DE005 no existe
cardList.push(Card.from("01DE007", "Juicio")) 
cardList.push(Card.from("01DE009", "Guarda de acero radiante")) //01DE008 no existe
cardList.push(Card.from("01DE010", "Lancero raudo"))
cardList.push(Card.from("01DE011", "Pupilo Laurent"))
cardList.push(Card.from("01DE012", "Garen"))
cardList.push(Card.from("01DE013", "Chaleco de cadenas"))
cardList.push(Card.from("01DE014", "Refuerzos"))
cardList.push(Card.from("01DE015", "Guardiana radiante"))
cardList.push(Card.from("01DE016", "Vanguardia Impertérrita"))
cardList.push(Card.from("01DE017", "Entereza"))
cardList.push(Card.from("01DE018", "Golpe radiante"))
cardList.push(Card.from("01DE019", "En marcha"))
cardList.push(Card.from("01DE020", "Defensora de la Vanguardia"))
cardList.push(Card.from("01DE021", "Persecución implacable"))
cardList.push(Card.from("01DE022", "Lucian"))
cardList.push(Card.from("01DE023", "Investigadora de los cazadores de magos"))
cardList.push(Card.from("01DE024", "Procurador de los cazadores de magos"))
cardList.push(Card.from("01DE025", "Arresto"))
cardList.push(Card.from("01DE026", "Combate único"))
cardList.push(Card.from("01DE027", "¡En guardia!"))
cardList.push(Card.from("01DE028", "Caballería de la Vanguardia"))
cardList.push(Card.from("01DE029", "Rastreador plumaveloz"))












cardList.forEach(element => {
    console.log(element.code)
    console.log(element.name)
});
console.log(cardList.length)



/* Plan B para generar las cartas, no funciona porque 01DE005 no existe

//Set 1 Demacia
const arrayCardListProv = [
                            "Abanderado de vanguardia",
                            "Tianna Crownguard", 
                            "Guardafilos Laurent", 
                            "Vanguardia alargéntea",
                            "etc"
]
pushIntoCards("01", "DE", arrayCardListProv);




function pushIntoCards(numberSet, faction, arrayCardListProv)
{
    for (i = 1; i <= arrayCardListProv.length; i++)
    {
        var idProv = i.toString()
        if(i < 10)
            idProv = "00" + idProv
        else if (i < 100)
            idProv = "0" + idProv
        
        cardList.push(Card.newCard(numberSet, faction, idProv, arrayCardListProv[i - 1]))
    }
}
*/






