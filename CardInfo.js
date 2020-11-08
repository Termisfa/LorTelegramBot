

module.exports = class CardInfo {
    constructor (cardCode, name, imageUrl, relatedCards, elixirCost, cardType) {
      this.cardCode = cardCode
      this.name = name
      this.imageUrl = imageUrl
      this.relatedCards = relatedCards
      this.elixirCost = elixirCost
      this.cardType = cardType 
      this.faction = cardCode.substring(2,4)
    }
  
    static from (cardCode, name, imageUrl, relatedCards, elixirCost, cardType) {
      return new this(cardCode, name, imageUrl, relatedCards, elixirCost, cardType)
    }
  }
  