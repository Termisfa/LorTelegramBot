const mergeImg = require('merge-img')

const fs = require('fs')
const request = require('request')

const download = (url, path) => {
  return new Promise( function(resolve, reject)  { request.head(url, (err, res, body) => {
    request(url)
      .pipe(fs.createWriteStream(path))
      .on('close', () => resolve(path))
  }) })
}

/*
var promise1 = download('https://dd.b.pvp.net/1_12_0/set3/es_es/img/cards/03MT041.png', './image.png')

var promise2 = download('https://dd.b.pvp.net/1_12_0/set3/es_es/img/cards/03MT005.png', './image1.png')

let promisesArrayProv = []
promisesArrayProv.push(promise1)
promisesArrayProv.push(promise2)
*/



mergeImg(['https://dd.b.pvp.net/1_12_0/set3/es_es/img/cards/03MT041.png', 'https://dd.b.pvp.net/1_12_0/set3/es_es/img/cards/03MT005.png'])
                                                .then((img) => {
                                                  img.write('out.png', () => {
                                                    console.log('done3')
                                                    console.log(img)
                                                    });                                                    
                                                  });
                                                  

//Ejemplo de download + merge funcional
/*
const mergeImg = require('merge-img')

const fs = require('fs')
const request = require('request')

const download = (url, path) => {
  return new Promise( function(resolve, reject)  { request.head(url, (err, res, body) => {
    request(url)
      .pipe(fs.createWriteStream(path))
      .on('close', () => resolve(path))
  }) })
}


var promise1 = download('https://dd.b.pvp.net/1_12_0/set3/es_es/img/cards/03MT041.png', './image.png')

var promise2 = download('https://dd.b.pvp.net/1_12_0/set3/es_es/img/cards/03MT005.png', './image1.png')

let promisesArrayProv = []
promisesArrayProv.push(promise1)
promisesArrayProv.push(promise2)




Promise.all(promisesArrayProv).then( (values) => { mergeImg(values)
                                                .then((img) => {
                                                  img.write('out.png', () => {
                                                    console.log('done3')
                                                    values.forEach(element => {
                                                      fs.unlinkSync(element)
                                                    });                                                    
                                                  });
})})
*/

//Promise.all([promise1, promise2]).then( (values) => {console.log(values[0])})

 
