
module.exports = class ColorRegion {
    constructor () {
      this.piltover = '226, 159, 118'
      this.noxus = '160, 82, 79'
      this.freljord = '160, 223, 246'
      this.isles = '59, 125, 111'
      this.targon = '109, 213, 208'
      this.bilgewater = '180, 86, 58'
      this.demacia = '191, 176, 131'
      this.jonia = '207, 130, 155'
    }
  
    static from () {
      return new this()
    }
    //From a string with the region code in it, return the RGB associated
    getColorRgb(region)
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



  