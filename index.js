var express = require('express')
var app = express()
var bodyParser = require('body-parser')
const axios = require('axios')

'use strict'
const allCardsInfo = require('./allSets-es_es.json')

app.use(bodyParser.json()) // for parsing application/json
app.use(
  bodyParser.urlencoded({
    extended: true
  })
) // for parsing application/x-www-form-urlencoded

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
      
      let infoCardsProv = []

      allCardsInfo.forEach(element => {
        if(element.name.toLowerCase().includes(msgReceived.toLowerCase()) && element.cardCode.length == 7)
            infoCardsProv.push([element.name, element.assets[0].gameAbsolutePath])    
      });
      //Si no ha encontrado ninguna carta
      if(infoCardsProv.length == 0)
      {
        postMessage(message, "No se ha encontrado ninguna carta que incluya en el nombre '" + msgReceived + "'", res)
      }
      //Si ha encontrado más de 2 cartas que contenga ese nombre
      else if(infoCardsProv.length > 2)
      {
        let aux = "Se han encontrado " + infoCardsProv.length + " cartas que incluyen en el nombre '" + msgReceived + "'. "
        if(infoCardsProv.length > 10)
          aux += "Especifica más por favor."
        else
        {
          aux += "Listado de cartas encontradas: "
          infoCardsProv.forEach(element => {
            aux += "'" + element [0] + "', "      
          });
          //Quitamos la coma y el espacio final
          aux.substring(0, aux.length - 2)
        }
        postMessage(message, aux, res)
      }
      else
      {
        console.log("Tamaño de infoCardsProv = " + infoCardsProv.length)
        infoCardsProv.forEach(element => {
          console.log(element[1])
          postMessage(message, element[1], res)
        });
      
      }
    }
  } catch (error) {
    console.log("Error en app.post")
    console.log(error)
    res.end()
  }
  
})

function postMessage(message, result, res)
{
  try {   
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
      console.log('Entra en respuesta')
      console.log('Respuesta de telegram: ' + response.ok)
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

// Finally, start our server
app.listen(3000, function() {
  console.log('Telegram app listening on port 3000!')
})

