const Database = require('../Database')("")

module.exports = class CardInDeck {
  constructor (cardCode, count) {
    this.card = Database.searchCardById(cardCode)
    this.count = count
  }

  static from (setString, factionString, numberString, count) {
    return new this(setString + factionString + numberString, count)
  }

  static fromCardString (cardString) {
    const [count, cardCode] = cardString.split(':')
    return new this(cardCode, parseInt(count))
  }

  get set () {
    return parseInt(this.code.substring(0, 2))
  }


  get id () {
    return parseInt(this.code.substring(4, 7))
  }
}
