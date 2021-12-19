
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
  }



  