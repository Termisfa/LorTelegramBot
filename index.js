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
    var result = message.text.substring(botActivator.length) 

    postMessage(message, result)

  }
  
})

function postMessage(message, result)
{
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
}

// Finally, start our server
app.listen(3000, function() {
  console.log('Telegram app listening on port 3000!')
})

