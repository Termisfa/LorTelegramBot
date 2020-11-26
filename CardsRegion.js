
module.exports = class CardsRegions {
    constructor () {
      this.piltover = 0
      this.noxus = 0
      this.freljord = 0
      this.isles = 0
      this.targon = 0
      this.bilgewater = 0
      this.demacia = 0
      this.jonia = 0
      this.regionsUsed = []
    }
  
    static from () {        
      return new this()
    }
    //Añade cartas a la región dada
    pushCard(region, qty)
    {
        switch(region)
        {
            case 'PZ': this.piltover += qty;break
            case 'NX': this.noxus += qty;break
            case 'FR': this.freljord += qty;break
            case 'SI': this.isles += qty;break
            case 'MT': this.targon += qty;break
            case 'BW': this.bilgewater += qty;break
            case 'DE': this.demacia += qty;break
            case 'IO': this.jonia += qty;break
        }
        //Sino hay ya una carta de esta región, la añade
        if(this.regionsUsed.indexOf(region) == -1)
            this.regionsUsed.push(region)
    }
    //Devuelve la cantidad de cartas que tiene dicha región
    getQtyRegion(region)
    {
        switch(region)
        {
            case 'PZ': return this.piltover
            case 'NX': return this.noxus
            case 'FR': return this.freljord
            case 'SI': return this.isles
            case 'MT': return this.targon
            case 'BW': return this.bilgewater
            case 'DE': return this.demacia
            case 'IO': return this.jonia
        }
    }
  }



  