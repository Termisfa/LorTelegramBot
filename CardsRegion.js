
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
    getMostUsedRegion(ignoreRuneterraRegion)
    {
      if("RU" in this.regionsUsed && !ignoreRuneterraRegion)
        return "RU"
        
      return Object.entries(this.regionsUsed).reduce((a, b) => a[1] > b[1] ? a : b)[0]
    }

    //Ordena las regiones por mayor número de cartas a menor
    sortRegions()
    {
      this.regionsUsed = Object.entries(this.regionsUsed).sort(([_a, a], [_b, b]) => b - a)
    }
  }