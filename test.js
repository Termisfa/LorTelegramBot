const fs = require('fs')
const request = require('request')

const download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url)
      .pipe(fs.createWriteStream(path))
      .on('close', callback)
  })
}

const url = 'https://dd.b.pvp.net/1_12_0/set3/es_es/img/cards/03MT041.png'
const path = './image.png'

download(url, path, () => {
  console.log('✅ Done!')
})