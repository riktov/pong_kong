class RangeConverter {
  constructor(loIn, hiIn, loOut, hiOut) {
    this.loIn = loIn ;
    this.loOut = loOut ;    
    this.factor = (1.0 * hiOut - loOut) / (hiIn - loIn) ; //<>//
  }
  
  convert(val) {
    return Math.round(((val - this.loIn) * this.factor) + this.loOut) ;
  }
}
