//Para juntar imágenes
const mergeImg = require('merge-img')
var Jimp = require('jimp');

let cardListImages = [] 
cardListImages.push('http://dd.b.pvp.net/2_3_0/set1/en_us/img/cards/01SI047.png')
cardListImages.push('http://dd.b.pvp.net/2_3_0/set1/en_us/img/cards/01SI047.png')


var x = (async() =>  {
var test = await Jimp.read({
    url: cardListImages[0],
    rejectUnauthorized : false
}).then((image) => {
    console.log('Leído1!');
})

console.log('h')

var test2 = await Jimp.read({
    url: cardListImages[1],
    rejectUnauthorized : false
}, function (err, image) {
    if (err) return console.log(err);
    console.log('Leído2!');
});

await mergeImg([test, test2]).catch((error) => {
    console.log(error);
  })
  .then((img) => { 
    img.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
    console.log('Success!');      
    });
  })

})();

x.then((y)=>{console.log(y)})

/*
mergeImg(['http://dd.b.pvp.net/2_3_0/set1/en_us/img/cards/01SI047.png', 'https://cdn-lor.mobalytics.gg/shared-decks/v1/Kindred-Elise-lor-deck-c104t917l6fri85bhbhg.png'])
  .then((img) => {
    // Save image as file
    img.write('out.png', () => console.log('done'));
  });
  */