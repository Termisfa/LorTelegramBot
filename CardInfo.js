

module.exports = class CardInfo {
    constructor (cardCode, name, imageUrl, relatedCards) {
      this.code = cardCode
      this.name = name
      this.imageUrl = imageUrl
      this.relatedCards = relatedCards
    }
  
    static from (cardCode, name, imageUrl, relatedCards) {
      return new this(cardCode, name, imageUrl, relatedCards)
    }
  }
  