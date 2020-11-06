module.exports = {
  DeckEncoder: require('./DeckEncoder'),
  CardInDeck: require('./CardInDeck'),
  Faction: require('./Faction')
}


const { DeckEncoder } = require('runeterra')
const CardList = require('./CardList')



//CEAQ2AIAAYEQWDISCMKBKFQXDANB2AABAEAQAAI
const deck = DeckEncoder.decode('CEAQ2AIAAYEQWDISCMKBKFQXDANB2AABAEAQAAI')
for(const CardInDeck of deck)
{
  console.log(CardInDeck.code)
}

/*

const deck = DeckEncoder.decode('CEBQOAYJDMRSSM2WLRQAIAQCAMCQMCIBAEBDCAIBAMBBIAICAMERGVI')
/*
[ CardInDeck { code: '01PZ019', count: 2 },
  CardInDeck { code: '01PZ027', count: 2 },
  CardInDeck { code: '01PZ028', count: 2 },
  CardInDeck { code: '01PZ040', count: 2 },
  CardInDeck { code: '01PZ045', count: 2 },
  CardInDeck { code: '01PZ052', count: 2 },
  CardInDeck { code: '01PZ055', count: 2 },
  CardInDeck { code: '01PZ059', count: 2 },
  CardInDeck { code: '01IO006', count: 2 },
  CardInDeck { code: '01IO009', count: 2 },
  CardInDeck { code: '01IO012', count: 2 },
  CardInDeck { code: '01IO018', count: 2 },
  CardInDeck { code: '01IO026', count: 2 },
  CardInDeck { code: '01IO036', count: 2 },
  CardInDeck { code: '01IO045', count: 2 },
  CardInDeck { code: '01IO057', count: 2 },
  CardInDeck { code: '01PZ013', count: 1 },
  CardInDeck { code: '01PZ039', count: 1 },
  CardInDeck { code: '01PZ042', count: 1 },
  CardInDeck { code: '01PZ044', count: 1 },
  CardInDeck { code: '01IO023', count: 1 },
  CardInDeck { code: '01IO029', count: 1 },
  CardInDeck { code: '01IO030', count: 1 },
  CardInDeck { code: '01IO043', count: 1 } ]
*/

/*
// CardInDeck
deck[0].code    // "01PZ019"
deck[0].count   // 2
deck[0].set     // 1
deck[0].id      // 19
deck[0].faction // Faction { id: 4, shortCode: "PZ" }


const code = DeckEncoder.encode(deck)
// CEAAECABAQJRWHBIFU2DOOYIAEBAMCIMCINCILJZAICACBANE4VCYBABAILR2HRL

*/