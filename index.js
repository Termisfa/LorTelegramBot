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
const token = process.env.BotToken

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

//Listener para que enseñe errores de sintaxis
bot.on("polling_error", console.log);
bot.ed


//Para hacer tests
bot.onText(/^\!t (.+)/, (msg, match) => {
    
});






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
  aux += "*Modo inline:* \n"
  aux += "En cualquier chat (sin necesidad de que el bot esté dentro) usa @LorTermisBot seguido del nombre de una carta, o de el código de un deck. Después de esperar 2 o 3 segundos como mucho, aparecerá la imagen o imágenes como resultados. Selecciona el deseado, y el bot responderá en ese chat con la imagen."
  bot.sendMessage(chatId, aux, {parse_mode: 'Markdown'})
});

/*
bot.on("message", (msg) => {  
  console.log(msg)
});
*/

//Modo inline
bot.on('inline_query', msg => {
  
  if(!isDeckInline(msg))
  {
    let infoCardsProv = Database.searchCardByNameAll(msg.query) 

    if(infoCardsProv.length > 0)
    {
      let listInlineQueryToSend = []
      for(var i = 0; i < infoCardsProv.length; i++) {
        var inlineQueryResultPhoto = {
          id: infoCardsProv[i].cardCode,
          type: "photo",
          photo_url: infoCardsProv[i].imageUrl,
          thumb_url: infoCardsProv[i].imageUrl,
          title: infoCardsProv[i].name,
          photo_height: 70,
          photo_width: 48
          
        }
        listInlineQueryToSend.push(inlineQueryResultPhoto)
        if(i == 49)
          break;
      };
      bot.answerInlineQuery(msg.id, listInlineQueryToSend)
    }
    else
    {           
      bot.answerInlineQuery(msg.id, [
        {
          id: '0',
          type: "article",
          title: "Error",
          description: "No se ha encontrado ninguna carta ni deck",
          message_text: "No se ha encontrado ninguna carta ni deck"
        }
      ]);
    }
  }

})

function isDeckInline(msg)
{
  var deck = DeckEncoder.decode(msg.query)
  if(deck == "InvalidDeck" || !deck)
    return false
  else
  {
    try
    {
      deck = Database.sortDeckByElixir(deck)   

      DeckImage.createDeckImage(deck).then((htmlCode) => {
        const promise = nodeHtmlToImage({
          html: htmlCode,
          puppeteerArgs: { args: ['--no-sandbox'] } 
        });
        promise.then((img) => {
          //-437983251 es el ID del grupo donde escupe los resultados
          var promise2 = bot.sendPhoto(-437983251, img)
          promise2.then((result) => {
            bot.answerInlineQuery(msg.id, [
              {
                id: '0',
                type: "photo",
                photo_file_id: result.photo[1].file_id
              }
            ]);
          })
        })
      })      
    }
    catch(error)
    {
      return false
    }    
  }
  return true
}



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

      
      DeckImage.createDeckImage(deck).then((htmlCode) => {
        //console.log(htmlCode)
        const promise =  nodeHtmlToImage({
          html: htmlCode,
          puppeteerArgs: { args: ['--no-sandbox'] } 
        });
        promise.then((img) => {
          //console.log(img)
          bot.sendPhoto(chatId, img)
        })
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