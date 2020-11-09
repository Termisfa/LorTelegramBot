const TelegramBot = require('node-telegram-bot-api');
var Database = require('./Database')
var DeckImage = require('./DeckImage')

//Para juntar imágenes
const mergeImg = require('merge-img')
var Jimp = require('jimp');

//Para que funcione el DeckDecoder
const  DeckEncoder  = require('./DeckDecoder/DeckEncoder')

//Para convertir html a imagen
const nodeHtmlToImage = require('node-html-to-image')

// replace the value below with the Telegram token you receive from @BotFather
const token = '1336055457:AAHmjUZ0xHbpS3pPytR8luhixlFsvBEc_Cs';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

//Listener para que enseñe errores de sintaxis
bot.on("polling_error", console.log);


//Para hacer tests
bot.onText(/\/t (.+)/, (msg, match) => {
  const chatId = msg.chat.id;

  const promise = nodeHtmlToImage({
    html: match[1],
    puppeteerArgs: { args: ['--no-sandbox'] } 
  });
  promise.then((img) => {
    //console.log(img)
    bot.sendPhoto(chatId, img)
  })
  //console.log(img)
  //bot.sendPhoto(chatId, img)
});

//Para buscar decks
bot.onText(/\/deck (.+)/, (msg, match) => {
  const chatId = msg.chat.id;

  var deck = DeckEncoder.decode(match[1])
  deck = Database.sortDeckByElixir(deck)
  /*
  let aux = "Deck: \n"
  deck.forEach(element => {
    aux += "x"+ element.count + " " + element.card.name + "(" + element.card.elixirCost + ")" + "\n"
  });
  bot.sendMessage(chatId, aux)
  */

  

  const promise = nodeHtmlToImage({
    html: DeckImage.createDeckImage(deck),
    puppeteerArgs: { args: ['--no-sandbox'] } 
  });
  promise.then((img) => {
    //console.log(img)
    bot.sendPhoto(chatId, img)
  })
});


// Para buscar cartas
bot.onText(/\/carta (.+)/, (msg, match) => {
  let infoCardsProv = Database.searchCardByName(match[1])  

  const chatId = msg.chat.id;
  if(checkCorrectName(infoCardsProv, match[1], chatId))
  {
    //Si solo hay una coincidencia
    if(infoCardsProv.length == 1)
    {
      infoCardsProv = Database.getListByCardId(infoCardsProv[0])
      mergeImagesAndSend(chatId, infoCardsProv)
    }      
    //Si hay varias
    else
    {
      mergeImagesAndSend(chatId, infoCardsProv)
    }   
  }
});



//Junta imagenes en una desde una lista de cartas y la manda
function mergeImagesAndSend(chatId, cardList)
{
  let cardListImages = [] 

  cardList.forEach(element => {
    cardListImages.push(element.imageUrl)
  });   

  mergeImg(cardListImages)
  .then((img) => { 
    img.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
      bot.sendPhoto(chatId, buffer)
    });
  })
}

function checkCorrectName(infoCardsProv, msgReceived, chatId)
{
  try { 
    //Si no ha encontrado ninguna carta
    if(infoCardsProv.length == 0)
    {
      bot.sendMessage(chatId, "No se ha encontrado ninguna carta que incluya en el nombre '" + msgReceived + "'") 
      return false
    }
    //Si ha encontrado más de 5 cartas que contenga ese nombre
    else if(infoCardsProv.length > 5)
    {
      let aux = "Se han encontrado " + infoCardsProv.length + " cartas que incluyen en el nombre '" + msgReceived + "'. "
      if(infoCardsProv.length > 15)
        aux += "Especifica más por favor."
      else
      {
        aux += "Listado de cartas encontradas: "
        infoCardsProv.forEach(element => {
          aux += "'" + element.name + "', "      
        });
        //Quitamos la coma y el espacio final
        aux.substring(0, aux.length - 2)
      }
      bot.sendMessage(chatId, aux)
      return false
    }
    //Si todo es correcto
    return true
  } catch (error) {
    console.log("Error en checkCorrectName")
    console.log(error)
  }
  return false
}