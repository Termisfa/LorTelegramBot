const dotenv = require('dotenv');
dotenv.config();

const TelegramBot = require('node-telegram-bot-api');
// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.BOT_TOKEN

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

const chatIdLogs = -333076382; //Id of the group LogBots


  bot.sendMessage(chatIdLogs, "Bot iniciado").catch((error) => {
    botLog(error.response.body.description, "Inicio", true)
 })


function botLog(msg, method, error = false)
 {
    if(!error)
      bot.sendMessage(chatIdLogs, msg + "\n").catch((error) => {
        console.log(error)
     })
    else
      bot.sendMessage(chatIdLogs, "ERROR EN " + method + ":\n" + msg +"\n").catch((error) => {
        console.log(error)
     })
 }

var Database = require('./Database')(botLog)
var DeckImage = require('./DeckImage')

//Para juntar imágenes
const mergeImg = require('merge-img')
var Jimp = require('jimp');

//Para que funcione el DeckDecoder
const  DeckEncoder  = require('./DeckDecoder/DeckEncoder')

//Para convertir html a imagen
const nodeHtmlToImage = require('node-html-to-image')

//Listener para que enseñe errores de sintaxis
bot.on("polling_error", (error) => {
  //console.log(error)
  botLog(error, "PollingError", true)
});



//Para hacer tests
bot.onText(/^\!t (.+)/i, (msg, match) => {
  if(checkAdmin(msg))
    Database.checkIfUpdated()
});




//Comando para cafe
bot.onText(/^\/cafe/i, (msg) => {  
  const chatId = msg.chat.id;
  var aux = "Te gusta este bot? Me puedes ayudar donando una pequeña cantidad de dinero por Paypal, "
  aux += "o simplemente compartirlo en otros grupos y redes sociales. Muchas gracias!! paypal.me/Termisfa"
  bot.sendMessage(chatId, aux, {parse_mode: 'Markdown'}).catch((error) => {
    botLog(error.response.body.description, "Cafe", true)
 })
});

//Comando para info
bot.onText(/^\/info/i, (msg) => {  
  const chatId = msg.chat.id;
  var aux = "*Listado de comandos:* \n"
  aux += "`!Deck code`: Muestra imagen de un deck \n"
  aux += "`!Vertical code`: Muestra imagen de un deck en vertical \n"
  aux += "`!Carta nombre`: Muestra carta buscada \n"
  aux += "*Modo inline:* \n"
  aux += "En cualquier chat (sin necesidad de que el bot esté dentro) usa @LorTermisBot seguido del nombre de una carta, o de el código de un deck. Después de esperar 2 o 3 segundos como mucho, aparecerá la imagen o imágenes como resultados. Selecciona el deseado, y el bot responderá en ese chat con la imagen."
  bot.sendMessage(chatId, aux, {parse_mode: 'Markdown'}).catch((error) => {
    botLog(error.response.body.description, "Info", true)
 })
});

/*
//Para conseguir la info de un mensaje
bot.on("message", (msg) => {  
  console.log(msg)
});
*/

var intervalActivated = true
var interval = setInterval(() => Database.checkIfUpdated(), 86400000) //Cada día 86400000

//Comando para activar o desactivar las actualizaciones automáticas
bot.onText(/^\!auto$/i, (msg, match) => {
  if(checkAdmin(msg))
  {
    if(intervalActivated)
      clearInterval(interval)
    else
      interval = setInterval(() => Database.checkIfUpdated(), 86400000)
    
    interval = !interval
    bot.sendMessage(msg.chat.id, "Ahora las actualizaciones automáticas están " + (interval ? "activadas" : "desactivadas")).catch((error) => {
      botLog(error.response.body.description, "auto", true)
   })
  }
});

//Comando para mirar si están activadas las actualizaciones automáticas
bot.onText(/^\!checkauto$/i, (msg, match) => {
  if(checkAdmin(msg))
    bot.sendMessage(msg.chat.id, "Las actualizaciones automáticas están " + (interval ? "activadas" : "desactivadas")).catch((error) => {
      botLog(error.response.body.description, "checkauto", true)
   })
});

//Comando para obtener el json actual
bot.onText(/^\!getjson$/i, (msg, match) => {
  if(checkAdmin(msg))
  {
    bot.sendDocument(msg.chat.id, './allSetsEsp.json').catch((error) => {
      botLog(error.response.body.description, "GetJson", true)
   })
   bot.sendDocument(msg.chat.id, './allSetsEng.json').catch((error) => {
    botLog(error.response.body.description, "GetJson", true)
 })
  }
});

//Comando para actualizar la base de datos
bot.onText(/^\!update$/i, (msg, match) => {
  if(checkAdmin(msg))
  {
    Database.update()
    bot.sendMessage(msg.chat.id, "Iniciada actualización").catch((error) => {
      botLog(error.response.body.description, "update", true)
   })
  }
});

//Comando para forzar el número de sets actuales
bot.onText(/^\!sets (.+)/i, (msg, match) => {
  if(checkAdmin(msg))
  {
    var text = match[0]
    if(!isNaN(text))
    {
      Database.forceSets(parseInt(text))
      bot.sendMessage(msg.chat.id, "Sets cambiados a " + text).catch((error) => {
        botLog(error.response.body.description, "sets", true)
     })
    }
    else
      bot.sendMessage(msg.chat.ig, "Error, '" + text + "' no es un número válido").catch((error) => {
        botLog(error.response.body.description, "sets", true)
     })
  }
});



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

      DeckImage.createDeckImage(deck).catch((error) => {
        botLog(error, "isDeckInline", true)
     })
     .then((htmlCode) => {
        const promise = nodeHtmlToImage({
          html: htmlCode,         
          puppeteerArgs: {executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox'] } 
        });
        promise
        .catch((error) => {
          botLog(error, "isDeckInline", true)
         })
        .then((img) => {
          //-437983251 es el ID del grupo donde escupe los resultados
          var promise2 = bot.sendPhoto(-437983251, img).catch((error) => {
            botLog(error.response.body.description, "isDeckInline", true)
          })
          promise2.catch((error) => {
            botLog(error, "isDeckInline", true)
          })
          .then((result) => {
            bot.answerInlineQuery(msg.id, [
              {
                id: '0',
                type: "photo",
                photo_file_id: result.photo[1].file_id
              }
            ]).catch((error) => {
              botLog(error.response.body.description, "isDeckInline", true)
           })
          })
        })
      })      
    }
    catch(error)
    {
      botLog(error, "isDeckInline", true)
      return false
    }    
  }
  return true
}



//Comandos para buscar decks
bot.onText(/^\!Deck (.+)/i, (msg, match) => {
  searchDeckCommand(msg, match)
});
bot.onText(/^\!D (.+)/i, (msg, match) => {
  searchDeckCommand(msg, match)
});

//Comandos para buscar decks
bot.onText(/^\!Vertical (.+)/i, (msg, match) => {
  searchDeckCommandVertical(msg, match)
});
bot.onText(/^\!V (.+)/i, (msg, match) => {
  searchDeckCommandVertical(msg, match)
});

//Para buscar decks
function searchDeckCommand(msg, match)
{
  const chatId = msg.chat.id;

  var deck = DeckEncoder.decode(match[1])
  if(deck == "InvalidDeck" || !deck)
    bot.sendMessage(chatId, "`" + match[1] + "` no es un código válido de deck", {parse_mode: 'Markdown'}).catch((error) => {
      botLog(error.response.body.description, "searchDeckCommand", true)
   })
  else
  {
    try
    {
      deck = Database.sortDeckByElixir(deck)   

      
      DeckImage.createDeckImage(deck).catch((error) => {
        botLog(error, "searchDeckCommand", true)
      })
      .then((htmlCode) => {
        //console.log(htmlCode)
        const promise =  nodeHtmlToImage({
          html: htmlCode,
          puppeteerArgs: {executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox'] } 
        });
        promise.catch((error) => {
          botLog(error, "searchDeckCommand", true)
        })
        .then((img) => {
          //console.log(img)
          bot.sendPhoto(chatId, img).catch((error) => {
            botLog(error.response.body.description, "searchDeckCommand", true)
          })
        })
      }) 
    }
    catch(error)
    {
      bot.sendMessage(chatId, "`" + match[1] + "` no es un código válido de deck", {parse_mode: 'Markdown'}).catch((error) => {
        botLog(error.response.body.description, "searchDeckCommand", true)
      })
    } 
  }
}

function searchDeckCommandVertical(msg, match)
{
  const chatId = msg.chat.id;

  var deck = DeckEncoder.decode(match[1])
  if(deck == "InvalidDeck" || !deck)
    bot.sendMessage(chatId, "`" + match[1] + "` no es un código válido de deck", {parse_mode: 'Markdown'}).catch((error) => {
      botLog(error.response.body.description, "searchDeckVertical", true)
    })
  else
  {
    try
    {     
      deck = Database.sortDeckByElixir(deck) 
      DeckImage.createDeckImageVertical(deck).catch((error) => {
        botLog(error, "searchDeckCommandVertical", true)
      })
      .then((htmlCode) => {
        //console.log(htmlCode)
        const promise =  nodeHtmlToImage({
          html: htmlCode,
          puppeteerArgs: {executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox'] } 
        });
        promise.catch((error) => {
          botLog(error, "searchDeckCommandVertical", true)
        })
        .then((img) => {
          //console.log(img)
          bot.sendPhoto(chatId, img).catch((error) => {
            botLog(error.response.body.description, "searchDeckCommandVertical", true)
          })
        })
      }) 
    }
    catch(error)
    {
      bot.sendMessage(chatId, "`" + match[1] + "` no es un código válido de deck", {parse_mode: 'Markdown'}).catch((error) => {
        botLog(error.response.body.description, "searchDeckCommandVertical", true)
      })
    } 
  }
}


//Comandos para buscar cartas
bot.onText(/^\!Carta (.+)/i, (msg, match) => {
  searchCardCommand(msg, match)
});
bot.onText(/^\!C (.+)/i, (msg, match) => {
  searchCardCommand(msg, match)
});

// Para buscar cartas
function searchCardCommand(msg, match)
{
  try {
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
  } catch (error) {
    botLog(error, "searchCardCommand", true)
  }  
}


//Actualizar comandos
bot.onText(/^\/updateCommands$/i, (msg) => {  
  const chatId = msg.chat.id;
  const opts = [
    {command: 'info', description: 'Info sobre comandos'},
    {command: 'cafe', description: 'Cómprame un café'}
   ];
   
   bot.setMyCommands(opts).then( () => {
       bot.sendMessage(chatId, "Comandos actualizados").catch((error) => {
        botLog(error.response.body.description, "Actualizar comandos", true)
          })
        }).catch((error) => {
          botLog(error.response.body.description, "Actualizar comandos", true)
        })
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
      bot.sendPhoto(chatId, buffer).catch((error) => {
        botLog(error.response.body.description, "mergeImagesAndSend", true)
      })
    });
  })
}



function checkCorrectName(infoCardsProv, msgReceived, chatId)
{
  try { 
    //Si no ha encontrado ninguna carta 
    if(infoCardsProv.length == 0)
    {
      bot.sendMessage(chatId, "No se ha encontrado ninguna carta que incluya en el nombre '" + msgReceived + "'").catch((error) => {
        botLog(error.response.body.description, "checkCorrectName", true)
     })
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
      bot.sendMessage(chatId, aux).catch((error) => {
        botLog(error.response.body.description, "checkCorrectName", true)
     })
      return false
    }
    //Si todo es correcto
    return true
  } catch (error) {
    botLog(error, "checkCorrectName", true)
  }
  return false
}

//Devuelve true si el usuario tiene permisos de admin
function checkAdmin(msg)
{
  //Mi id (78306827), grupo de inline (-437983251), grupo de logs (chatIdLogs)
  if(msg.chat.id == -437983251 || msg.from.id == 78306827 || msg.from.id == chatIdLogs) 
    return true;
  else
    return false 
}

process.stdin.resume();//so the program will not close instantly

async function exitHandler(options, exitCode) {
  
  await bot.sendMessage(chatIdLogs, "EL BOT HA DEJADO DE FUNCIONAR. \nSino se inicia solo de nuevo, reiniciar a mano")


    if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));