class Ball {
  constructor(position, speed, team, col) {
    //super() ;
    this.position = position ;
    this.speed = speed ;
    this.team = team;
    this.col = col
  }
  
  move() {
    this.position.x += this.speed.x ; 
    this.position.y += this.speed.y ; 
    // this.speed.rotate(random(HALF_PI / -32, HALF_PI / 32)) ;
    // this.speed.rotate(HALF_PI / 32) ;
  }
  
  bounceX() {
    this.speed.x = -1 * this.speed.x ;
  }

  bounceY() {
    this.speed.y = -1 * this.speed.y ;
  }

}