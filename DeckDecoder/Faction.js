var RegionsHandler = require('../RegionsHandler')
var regionsHandler = RegionsHandler.from()

class Faction {
  constructor (code, id) 
  {
    this.shortCode = code
    this.id = id
  }

  static fromCode (code) 
  {
    return new this(code, regionsHandler.fromCode(code))
  }

  static fromID (id) 
  {
    return new this(regionsHandler.fromID(id), id)
  }
}


module.exports = Faction
