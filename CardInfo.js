var RegionsHandler = require('./RegionsHandler')
var regionsHandler = RegionsHandler.from()

module.exports = class CardInfo {
    constructor (cardCode, name, imageUrl, relatedCards, elixirCost, cardType, factions) {
      this.cardCode = cardCode
      this.name = name
      this.imageUrl = imageUrl
      this.relatedCards = relatedCards
      this.elixirCost = elixirCost
      this.cardType = cardType 
      this.factions = this.transformFactionNamesIntoCode(factions)
      this.usedFaction = this.factions[0]
    }    

    transformFactionNamesIntoCode(factionNames)
    {
      var factionCodes = new Array()

      factionNames.forEach(factionName => {
        factionCodes.push(regionsHandler.translateRegionNameIntoCode(factionName))
      })

      return factionCodes
    }
  
    static from (cardCode, name, imageUrl, relatedCards, elixirCost, cardType, factions) {
      return new this(cardCode, name, imageUrl, relatedCards, elixirCost, cardType, factions)
    }
  }
  

