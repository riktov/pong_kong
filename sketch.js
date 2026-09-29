const BLOCK_WIDTH = 4 ;
const INITIAL_BALLS = 8 ;
const TEAM_LAND = 0 ;
const TEAM_SEA = 1 ;
const BLOCK_HALF_WIDTH = BLOCK_WIDTH / 2 ;
const AGE_LIMIT = 512 ;
const AGE_MAX = AGE_LIMIT - 1 ;

let toBlockCenter = null ;
const landRedConverter = new RangeConverter(0, 255, 127, 64) ;
const landGreenConverter = new RangeConverter(0, 255, 63, 255) ;

let balls = [] ;
let blocks = [] ;
let blockAges = [] ;
// let blockChanges = [] ;

let changedBlocks = [] ;

let COLOR_LAND ;
let COLOR_SEA ;
let isFlatColor = false ;     
let isShowBalls = true ;
let isShowBlocks = true ;
let isRecording = true ;

let img ; 
let titleImg = null ;

let imgOldBlockLand ;
let imgOldBlockSea ;
let canvasElt = null ;

let numLand = 0 ;

function setup() {
  // frameRate(15) ;
  let canvas = createCanvas(512, 512) ;
  canvasElt = canvas.elt ;
  toBlockCenter = createVector(BLOCK_HALF_WIDTH, BLOCK_HALF_WIDTH) ;

  titleImg = generateTitle() ;
  
  // COLOR_LAND = color(0, 255, 0) ;
  COLOR_SEA = color(63, 63, 255) ;  
	COLOR_LAND = blockColor(TEAM_LAND, 8192) ;

  // COLOR_SEA = blockColor(TEAM_SEA, AGE_MAX) ;
  imgOldBlockLand = createImage(BLOCK_WIDTH, BLOCK_WIDTH) ;
  imgOldBlockSea = createImage(BLOCK_WIDTH, BLOCK_WIDTH) ;

  drawSingleBlock(COLOR_LAND, 0, 0, imgOldBlockLand) ;
  drawSingleBlock(COLOR_SEA, 0, 0, imgOldBlockSea) ;
  imgOldBlockLand.updatePixels() ;
  imgOldBlockSea.updatePixels() ;

  //initialize balls
  for(let i = 0 ; i < INITIAL_BALLS ; i++) {
    const landBall = new Ball(
      createVector(width / 2, height / 2), 
      createVector(2, 2), 
      TEAM_LAND,
      color(255, 255, 0)) ;
    const seaBall = new Ball(
      createVector(width / 2, height / 2), 
      createVector(-2, -2), 
      TEAM_SEA,
      color(255, 0, 0)) ;
    
		//The coordinate is the center
		// landBall.position = landBall.position.add(toBlockCenter) ;
		// seaBall.position = landBall.position.add(toBlockCenter) ;
		landBall.position.add(toBlockCenter) ;
		landBall.position.add(toBlockCenter) ;
		// print("Pos: ", landBall.position)

    // landBall.speed.setHeading((i + 1) * QUARTER_PI * 0.2) ;
    // seaBall.speed.setHeading((i + 1) * QUARTER_PI * -0.2) ;
    balls.push(landBall) ;
    balls.push(seaBall) ;
  }
  
  //randomize heading
  balls.forEach(b => {
    b.speed.rotate(random(0, TWO_PI / 90)) ;
  }) ;
  
  //initialize grids
  const gridWidth  = floor(width / BLOCK_WIDTH) ;
  const gridHeight = floor(height / BLOCK_WIDTH);
  
  //console.log(gridHeight) ;
  
  //blocks = Array.from(Array(gridHeight), () => new Array(gridWidth).fill(TEAM_SEA)) ;
  img = createImage(width, height) ;
  
  
  for(let row = 0 ; row < gridHeight ; row++) {
    blocks[row] = [] ;
    blockAges[row] = [] ;
    for(let col = 0 ; col < gridWidth ; col++) {
      // blocks[row][col] = (col + row) % 2 == 0 ? TEAM_SEA : TEAM_LAND ;
      // blocks[row][col] = col < gridWidth / 2 ? TEAM_SEA : TEAM_LAND ;
      blocks[row][col] = col + row < 512 ? TEAM_SEA : TEAM_LAND ;
      // blocks[row][col] = row < gridHeight / 2 ? TEAM_SEA : TEAM_LAND ;
      
      blockAges[row][col] = 8192 ;
    }
  } 
}



function draw() {
	background(127) ;

	fill(255) ;
	noStroke() ;

  if(isShowBlocks) {
    drawAllBlocks() ;
  }
	
	if(isShowBalls) {
		balls.forEach(b => {
			fill(b.col) ;
			rect(b.position.x - BLOCK_HALF_WIDTH, b.position.y - BLOCK_HALF_WIDTH, BLOCK_WIDTH, BLOCK_WIDTH) ;
		}) ;
	}
  
  setFavicon(canvasElt) ;

	advance() ;
}

function advance() {
  balls.forEach(b => {
    b.move() ;

    if(b.position.x < 0) {
      b.position.x = 0;
      b.bounceX() ;
    }
    
    if(b.position.x + BLOCK_WIDTH >= width) {
      b.position.x = width - BLOCK_WIDTH;
      b.bounceX() ;
    }

    if(b.position.y < 0) {
      b.position.y = 0 ;
      b.bounceY() ;
    }
    
    if(b.position.y + BLOCK_WIDTH >= height) {
      b.position.y = height - BLOCK_WIDTH;
      b.bounceY() ;
    }

    //hit blocks
    
    const [gx, gy] = gridPos(b.position) ;

    let bl = blocks[gy][gx] ;    
        
    if(bl == b.team) {
      blocks[gy][gx] = (b.team + 1) % 2  ;

			blockAges[gy][gx] = 0 ;
      //const ballCenter = b.position ; //+ toBlockCenter ;
      //const blockCenter = createVector(gx * BLOCK_WIDTH, gy * BLOCK_WIDTH); // + toBlockCenter ;
      const diffX = abs(b.position.x - gx * BLOCK_WIDTH - BLOCK_HALF_WIDTH) ;
      const diffY = abs(b.position.y - gy * BLOCK_WIDTH - BLOCK_HALF_WIDTH) ;
      
      if(diffX == diffY) {
        b.bounceX() ;
        b.bounceY() ;
      } else if(diffX < diffY) {
        b.bounceX() ;
      } else {
        b.bounceY() ;
      }
      
      //slightly shift direction so we don't get long drills
			b.speed.rotate(random(PI / -90, PI / 90)) ;




			let colr ;

			const team = blocks[gy][gx] ;

			if(isFlatColor) {
	      colr = team == TEAM_LAND ? COLOR_LAND : COLOR_SEA ;
			}
			else {
				const age = blockAges[gy][gx] ;

				colr = blockColor(team, age) ;
			}

			changedBlocks.push([colr, gy, gx])
			// drawSingleBlock(colr, gy, gx) ;
    } 
		
		// print(blockColor(TEAM_LAND, frameCount));
  }) ;


	for(let row = 0 ; row < blocks.length ; row++) {
    for(let col = 0 ; col < blocks[0].length ; col++) {
      const age = blockAges[row][col] + 1 ;
      blockAges[row][col] = age ;      
    }
  }
}

function drawAllBlocks() {
  const nrows = blocks.length ;
  const ncols = blocks[0].length ;
  
  loadPixels() ;

  for(let row = 0 ; row < nrows ; row++) {
    for(let col = 0 ; col < ncols ; col++) {
      const team = blocks[row][col] ;
      
      let colr ;

			if(isFlatColor) {
	      colr = team == TEAM_LAND ? COLOR_LAND : COLOR_SEA ;
        // const blockImage = team == TEAM_LAND ? imgOldBlockLand : imgOldBlockSea ;
        // image(blockImage, col * BLOCK_WIDTH, row * BLOCK_WIDTH) ;
        drawSingleBlock(colr, col, row) ;
			}	else {
				const age = blockAges[row][col] ;

				colr = blockColor(team, age) ;
        drawSingleBlock(colr, col, row) ;
			}

    }
  }
  updatePixels() ;
}

function drawSingleBlockOnPixels(colr, col, row) {
  const BYTES_PER_PIXEL = 4 ; //RBGA
  const BYTES_PER_ROW = width * BYTES_PER_PIXEL ;

  const startOffset = row * BYTES_PER_ROW + col * BYTES_PER_PIXEL

  let runOffset = startOffset ;

	for(let by = 0 ; by < BLOCK_WIDTH ; by++) {
    for(let bx = 0 ; bx < BLOCK_WIDTH ; bx++) {
      const pixelOffset = runOffset + (bx * BYTES_PER_PIXEL) ;
      // pixels[pixelOffset] = 
    }
    runOffset += BYTES_PER_ROW ;
  }  
}

function drawSingleBlock(colr, col, row, targetImg=null) {

	for(let by = 0 ; by < BLOCK_WIDTH ; by++) {
		for(let bx = 0 ; bx < BLOCK_WIDTH ; bx++) {
      const coordX = col * BLOCK_WIDTH + bx ;
      const coordY = row * BLOCK_WIDTH + by ;

      // const linOffset = row * BLOCK_WIDTH * 
      if(targetImg) {
        targetImg.set(col * BLOCK_WIDTH + bx, row * BLOCK_WIDTH + by, colr) ;
      } else {
        set(coordX, coordY, colr) ;
      }
		}
	}

}

function drawChangedBlocks() {
	changedBlocks.forEach(block =>  {
		const [colr, row, col] = block ;
		drawSingleBlock(colr, col, row) ;
	}) ;
	changedBlocks = [] ;
}

function drawBlocksImage() {
  const nrows = blocks.length ;
  const ncols = blocks[0].length ;
  img.loadPixels() ;
  
  for(let row = 0 ; row < nrows ; row++) {
    for(let col = 0 ; col < ncols ; col++) {
      const colr = blocks[row][col] == TEAM_LAND ? COLOR_LAND : COLOR_SEA ;
      const offset = (ncols * col) + col ;
    }
  }  
  
  img.updatePixels() ;
  image(img, 0, 0) ;
}

function isInBoundsX(ball) {
  return ball.position.x >= 0 && ball.position.x < width - BLOCK_WIDTH ;
}

function isInBoundsY(ball) {
  return ball.position.y >= 0 && ball.position.y < height - BLOCK_WIDTH ;
}

function gridPos(ballPos) {
  const ballCenter = ballPos ;
  const xpos = floor(ballCenter.x / BLOCK_WIDTH) ;
  const ypos = floor(ballCenter.y / BLOCK_WIDTH) ;
  
  if(ypos > 127) {
    // print("Bad ypos", ballPos.y)
  }
  
  if(xpos >= blocks[0].length) {
    xpos =  blocks[0].length - 1 ;
  }
  if(ypos >= blocks.length) {
    ypos =  blocks.length - 1 ;
  }
  if(xpos < 0) {
    xpos =  0 ;
  }
  if(ypos < 0) {
    ypos = 0 ;
  }

  return [xpos, ypos];
}

/**
 * 
 * @param {*} team Land or Sea
 * @param {*} age number
 * @returns 
 */
function blockColor(team, age) {
	var colr ;

	const ageNorm = age / 2 ;
	// const ageNorm = age ;
	
	if(team == TEAM_SEA) {
		const bGreen = 63 + (3 / 4 * (255 - ageNorm)) ; //255 ~ 0 
		colr = color(63, bGreen, 255) ;
	}

	if(team == TEAM_LAND) {
		if(age < 256) {
			// brown (127, 63, 0) to green (64, 255, 63)
			
			let gRed = 63 + ((64 * (AGE_MAX - age)) / AGE_LIMIT) ;  //127 -> 64
			gRed = landRedConverter.convert(age) ;
			let gGreen = 63 + ((age * 192) / AGE_LIMIT) ; // 64 -> 255
			gGreen = landGreenConverter.convert(age) ;
			
			const gBlue = ((age * 64) / AGE_LIMIT) ; // 0 -> 63
			colr = color(gRed, gGreen, gBlue) ;
		} else {
			//from 256 to 8192, linearly decrease the intensity 
			const gVal = 255 - (age / 32) ;
			if(gVal > 63) {
				colr = color(gVal / 4, gVal, gVal / 4) ;
			} else {
				colr = color (15, 63, 15) ;
			}
		}
	}  
	return colr ;
}

function keyPressed() {
  switch(key) {
    case 'v':
      isShowBalls = !isShowBalls ;
      break ;
    case 'c':
      isFlatColor = !isFlatColor ;
      break ;
    case 'b':
      isShowBlocks = !isShowBlocks ;
      break ;
    case 'r':
      isRecording = !isRecording ;
      break ;    
    // case 'x':
    //   balls.clear() ;
  }	

  if(isRecording) {
    // saveGif('my-animation', 240, { units: 'frames' });
  }
}

function generateTitle() {
  const titleImage = createImage(5 * 5 * 4, 2 * 5 * 4) ;

  titleImage.loadPixels() ;

  const colYellow = color('yellow') ;

  const points = [] ;
  /*
  const points = [
    [0, 0], [1, 0], [2, 0], [3, 0],
    [0, 1],                 [3, 1],
    [0, 2], [1, 2], [2, 2], [3, 2],
    [0, 3],  
    
    [5, 0], [6, 0], [7, 0], [8, 0],
    [5, 1],                 [8, 1],
    [5, 2],                 [8, 2],
    [5, 3], [6, 3], [7, 3], [8, 3],

    [9, 0], [10, 0], [11, 0], [12, 0],
    [9, 1],                 [12, 1],
    [9, 2],                 [12, 2],
    [9, 3], [10, 3], [11, 3], [12, 3],

  ]
  */

  points.forEach( pt =>
    drawSingleBlock(colYellow, pt[0], pt[1], titleImage) 
  ) ;

  titleImage.updatePixels() ;

  return titleImage ;
  
}

