
module.exports = class CardsRegions {
    constructor () {
      this.regionsUsed = {}; 
    }
  
    static from () {        
      return new this()
    }

    //Añade cartas a la región dada
    pushCard(region, qty)
    {
      if(this.regionsUsed[region] != undefined)
        this.regionsUsed[region] += qty;
      else  
        this.regionsUsed[region] = qty;
    }

    //Devuelve la cantidad de cartas que tiene dicha región
    getQtyRegion(region)
    {
      return this.regionsUsed[region];
    }

    //Devuelve la region que tenga más cartas
    getMostUsedRegion()
    {
      if("RU" in this.regionsUsed)
        return "RU"
        
      return Object.entries(this.regionsUsed).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    }
  }