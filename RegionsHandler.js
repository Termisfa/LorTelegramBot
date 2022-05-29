
const fs = require('fs');
var jsonData;


module.exports = class RegionsHandler {
    constructor () {
      jsonData = '';
      this.UpdateRegions();
    }

    UpdateRegions()
    {
        fs.readFile('./regions.json', function(error, data){
            jsonData = JSON.parse(data).regions;
        // console.log(jsonData)
        })
    }

    static from () {
      return new this()
    }
    //From a string with the region code in it, return the RGB associated
    getColorRgb(region)
    {
      for(var i = 0; i < jsonData.length; i++)
      {
        if(jsonData[i].ShortName == region)
            return jsonData[i].Color;
      }
    }

    fromID (id) 
    {
        for(var i = 0; i < jsonData.length; i++)
        {
          if(jsonData[i].Id == id)
              return jsonData[i].ShortName;
        } 
    }

    fromCode (code) 
    {
        for(var i = 0; i < jsonData.length; i++)
        {
          if(jsonData[i].ShortName == code)
              return jsonData[i].Id;
        } 
    }
    
  }



  