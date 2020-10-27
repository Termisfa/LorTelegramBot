const mergeImg = require('merge-img')

const fs = require('fs')
const request = require('request')

const download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url)
      .pipe(fs.createWriteStream(path))
      .on('close', callback)
  })
}

download('https://dd.b.pvp.net/1_12_0/set3/es_es/img/cards/03MT041.png', './image.png', () => {
  console.log('✅ Done1!')
})

download('https://dd.b.pvp.net/1_12_0/set3/es_es/img/cards/03MT005.png', './image1.png', () => {
  console.log('✅ Done2!')
})

mergeImg(['image.png', 'image1.png'])
.then((img) => {
  // Save image as file
  img.write('out.png', () => console.log('done3'));
});


 
