var express = require('express')
var app = express()
var bodyParser = require('body-parser')
const axios = require('axios')
var Database = require('./Database')
var CardInfo = require('./CardInfo')
'use strict'


//Esta parte es necesaria para que el bot funcione
app.use(bodyParser.json()) // for parsing application/json
app.use(
bodyParser.urlencoded({
    extended: true
})
) // for parsing application/x-www-form-urlencoded


//Código necesario para descargar
const mergeImg = require('merge-img')

const fs = require('fs')
const request = require('request')
const { info } = require('console')

const download = (url, path) => {
  return new Promise( function(resolve, reject)  { request.head(url, (err, res, body) => {
    request(url)
      .pipe(fs.createWriteStream(path))
      .on('close', () => resolve(path))
  }) })
}


//This is the route the API will call
app.post('/', function(req, res) {
  try {     
    const { message } = req.body

    //Each message contains "text" and a "chat" object, which has an "id" which is the chat id

    var botActivator = 'bot '
    
    if(!message)
    {
      console.log('llega hasta !message')
      return res.end()
    }

    if(message.text.length <= botActivator.length)
    {
      console.log('llega hasta mensaje es demasiado corto')
      return res.end()
    }

    

    if (message.text.toLowerCase().substring(0, botActivator.length) !== botActivator) {
      return res.end()
    }
    else
    {
      var msgReceived = message.text.substring(botActivator.length) 

      var relatedActivator = "rel"
      //Si lleva la palabra rel, para cartas relacionadas
      if(msgReceived.substring(0, relatedActivator.length) === relatedActivator)
      {
        msgReceived = msgReceived.substring(relatedActivator.length)

        let infoCardsProv = Database.searchCardByName(msgReceived)


      } 

      //No lleva la palabra rel
      else
      {      
        let infoCardsProv = Database.searchCardByName(msgReceived)       

        if(checkCorrectName(infoCardsProv, msgReceived, res, message))
        {
          //Si solo hay una coincidencia, simplemente la envía
          if(infoCardsProv.length == 1)
            sendPhoto(message, infoCardsProv[0].imageUrl, res)
          //Si hay varias coincidencias, entrar a merge
          else
          {  
            var promisesArrayProv = []
            /*   
            infoCardsProv.forEach(element => {
              promisesArrayProv.push(download(element.imageUrl,"./" + element.code + ".png"))
            });           
                  
            var imagePath = mergeAndDeleteImgs(promisesArrayProv)
            sendPhoto(message, imagePath, res)
            */
            console.log(infoCardsProv[0])
          }
        }
      }
    }
  } catch (error) {
    console.log("Error en app.post")
    console.log(error)
    res.end()
  }  
  res.end()
})


//Merge imagen, y borrado de las auxiliares. Devuelve ruta a enviar
function mergeAndDeleteImgs(promisesArrayProv)
{
  try {
    var txtOut = 'out.png'
    Promise.all(promisesArrayProv).then( (values) => { mergeImg(values)
      .then((img) => {
        img.write(txtOut, () => {
          console.log('done3')
          /*
          values.forEach(element => {
            fs.unlinkSync(element)
          });              
          */                                      
        });
    })})
    return txtOut

  } catch (error) {
    console.log("Error en mergeImg")
    console.log(error)
    return null
  }
}


//Mensajes a enviar cuando no encuentra carta o encuentra demasiadas. Devuelve true si es correcto
function checkCorrectName(infoCardsProv, msgReceived, res, message)
{
  try { 
    //Si no ha encontrado ninguna carta
    if(infoCardsProv.length == 0)
    {
      postMessage(message, "No se ha encontrado ninguna carta que incluya en el nombre '" + msgReceived + "'", res)
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
      postMessage(message, aux, res)
      return false
    }
    //Si todo es correcto
    return true
  } catch (error) {
    console.log("Error en checkCorrectName")
    console.log(error)
    return null
  }
}


//Para mandar un mensaje
function postMessage(message, result, res)
{
  try {  
    console.log(res)
    console.log(result) 
    axios
    .post(
      'https://api.telegram.org/bot1336055457:AAHWh5XS1CkeaObc-JKA6yY2TX9pKHxOj-s/sendMessage',
      {
        chat_id: message.chat.id,
        text: result
      }
    )
    .then(response => {
      // We get here if the message was successfully posted
      console.log('Entra en respuesta texto OK')
      console.log('Respuesta de telegram: ' + response.info)
      res.end('ok')
    })
    .catch(err => {
      // ...and here if it was not
      console.log('Error :', err)
      res.end('Error :' + err)
    })
  } catch (error) {
    console.log("Error en postMessage")
    console.log(error)
    res.end()
  }
}

//Para mandar foto. Result puede ser una url o la ruta a la imagen
function sendPhoto(message, result, res)
{
  try {   
    axios
    .post(
      'https://api.telegram.org/bot1336055457:AAHWh5XS1CkeaObc-JKA6yY2TX9pKHxOj-s/sendPhoto',
      {
        chat_id: message.chat.id,
        photo: result
      }
    )
    .then(response => {
      // We get here if the message was successfully posted
      console.log('Entra en respuesta foto OK')
      res.end('ok')
    })
    .catch(err => {
      // ...and here if it was not
      console.log('Error :', err)
      res.end('Error :' + err)
    })
  } catch (error) {
    console.log("Error en sendPhoto")
    console.log(error)
    res.end()
  }
}

// Finally, start our server
app.listen(3000, function() {
  /*

  var promise1 = download('https://dd.b.pvp.net/1_12_0/set3/es_es/img/cards/03MT041.png', './image.png')
  var promise2 = download('https://dd.b.pvp.net/1_12_0/set3/es_es/img/cards/03MT005.png', './image1.png')
  let promisesArrayProv = []
  promisesArrayProv.push(promise1)
  promisesArrayProv.push(promise2)

  Promise.all(promisesArrayProv).then( (values) => { mergeImg(values)
    .then((img) => {
      img.write('out.png', () => {
        console.log('done3')                                                        
      });
  })})
  */
  console.log('Telegram app listening on port 3000!')
})

