

module.exports = class Card {
  constructor (cardCode, name) {
    this.code = cardCode
    this.name = name
    this.imageLink = "https://cdn-lor.mobalytics.gg/production/images/set1/es_es/img/card/game/" + cardCode + ".webp"
  }

  
  static from (cardCode, name) {
    return new this(cardCode, name)
  }

  static newCard (numberSet, faction, numberId, name)
  {
    return new this(numberSet + faction + numberId, name)
  }

  //Codigo copiado de "CardInDeck"
  /*

  static fromCardString (cardString) {
    const [count, cardCode] = cardString.split(':')
    return new this(cardCode, parseInt(count))
  }

  get set () {
    return parseInt(this.code.substring(0, 2))
  }

  get faction () {
    return Faction.fromCode(this.code.substring(2, 4))
  }

  get id () {
    return parseInt(this.code.substring(4, 7))
  }
  */
}
