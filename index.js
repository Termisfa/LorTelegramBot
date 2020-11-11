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
//const token = process.env.BotToken

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

//Listener para que enseñe errores de sintaxis
bot.on("polling_error", console.log);

/*
//Para hacer tests
bot.onText(/^\/t (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const opts = [
    {command: 'eat', description: 'Command for eat'},
    {command: 'run', description: 'Command for run'},
    {command: 'run', description: 'Command for run'}
   ];
   
   bot.setMyCommands(opts).then(function (info) {
       console.log(info)
     });;
  //console.log(bot.getMyCommands())
});
*/

//Comando para cafe
bot.onText(/^\/cafe/, (msg) => {  
  const chatId = msg.chat.id;
  var aux = "Te gusta este bot? Me puedes ayudar donando una pequeña cantidad de dinero por Paypal, "
  aux += "o simplemente compartirlo en otros grupos y redes sociales. Muchas gracias!! paypal.me/Termisfa"
  bot.sendMessage(chatId, aux, {parse_mode: 'Markdown'})
});

//Comando para info
bot.onText(/^\/info/, (msg) => {  
  const chatId = msg.chat.id;
  var aux = "*Listado de comandos:* \n"
  aux += "`!Deck code`: Muestra imagen de un deck \n"
  aux += "`!Carta nombre`: Muestra carta buscada \n"
  bot.sendMessage(chatId, aux, {parse_mode: 'Markdown'})
});


//Comandos para buscar decks
bot.onText(/^\!Deck (.+)/, (msg, match) => {
  searchDeckCommand(msg, match)
});
bot.onText(/^\!deck (.+)/, (msg, match) => {
  searchDeckCommand(msg, match)
});
bot.onText(/^\!D (.+)/, (msg, match) => {
  searchDeckCommand(msg, match)
});
bot.onText(/^\!d (.+)/, (msg, match) => {
  searchDeckCommand(msg, match)
});

//Para buscar decks
function searchDeckCommand(msg, match)
{
  const chatId = msg.chat.id;

  var deck = DeckEncoder.decode(match[1])
  if(deck == "InvalidDeck" || !deck)
    bot.sendMessage(chatId, "`" + match[1] + "` no es un código válido de deck", {parse_mode: 'Markdown'})
  else
  {
    try
    {
      deck = Database.sortDeckByElixir(deck)   

      const promise = nodeHtmlToImage({
        html: DeckImage.createDeckImage(deck),
        puppeteerArgs: { args: ['--no-sandbox'] } 
      });
      promise.then((img) => {
        //console.log(img)
        bot.sendPhoto(chatId, img)
      })
    }
    catch(error)
    {
      bot.sendMessage(chatId, "`" + match[1] + "` no es un código válido de deck", {parse_mode: 'Markdown'})
    }
    
  }

}


//Comandos para buscar cartas
bot.onText(/^\!Carta (.+)/, (msg, match) => {
  searchCardCommand(msg, match)
});
bot.onText(/^\!carta (.+)/, (msg, match) => {
  searchCardCommand(msg, match)
});
bot.onText(/^\!C (.+)/, (msg, match) => {
  searchCardCommand(msg, match)
});
bot.onText(/^\!c (.+)/, (msg, match) => {
  searchCardCommand(msg, match)
});

// Para buscar cartas
function searchCardCommand(msg, match)
{
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
}


//Actualizar comandos
bot.onText(/^\/updateCommands$/, (msg) => {  
  const chatId = msg.chat.id;
  const opts = [
    {command: 'info', description: 'Info sobre comandos'},
    {command: 'cafe', description: 'Cómprame un café'}
   ];
   
   bot.setMyCommands(opts).then( () => {
       bot.sendMessage(chatId, "Comandos actualizados")
     });
  //console.log(bot.getMyCommands())
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