var width = window.innerWidth,
    height = window.innerHeight;

console.log(width, height)

	var size = {
x : width,
	y : height
	};

var renderer = PIXI.autoDetectRenderer(size.x, size.y, {backgroundColor:0xdddddd, antialias: true });
document.body.appendChild(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

stage.interactive = true;

var gridX = 20,
	gridY = 15,
	distanceX = size.x / (gridX - 1),
	distanceY = size.y / (gridY - 1),
	variationX = (size.x / (gridX - 1)) / 2,
	variationY = (size.y / (gridY - 1)) / 2,
	gapX = variationX / 2,
	gapY = variationY /2;
console.log(distanceX,variationX, gapX);

// generate matrix
var matrix = new Array(gridX);
for(var i = 0; i < gridX; i++) {
	matrix[i] = new Array(gridY);
}

var graphics = new PIXI.Graphics();

for(var i = 0, lenY = gridY; i < lenY; i++){
	for(var j = 0, lenX = gridX; j < lenX; j++){

		// Declare positions with coeficient distance
		var position = {
x : ((j * distanceX) - gapX) + (Math.random() * variationX),
	y : ((i * distanceY) - gapY) + (Math.random() * variationY)
		}

		// X = 0 or X at last
		if(j == 0){ position.x = 0; }
		else if( j == lenX-1){ position.x = size.x; }
		// Y == 0 or Y at last
		if(i == 0){ position.y = 0; } else if(i == lenY-1){ position.y = size.y; }

		matrix[j][i] = position; // matrix[x][y]
	}
}

// Generating

// X
for (var i = 0; i < matrix.length - 1; i++){
	// Y
	for(var j = 0; j < matrix[0].length - 1; j++){


		// top triangle
		var c = parseInt(Math.random()*7)-1;
		var color = '0x'+c+c+c+c+c+c;
		graphics.beginFill(color);
		graphics.lineStyle(0);
		graphics.moveTo(matrix[i][j].x, matrix[i][j].y);
		graphics.lineTo(matrix[i][j+1].x, matrix[i][j+1].y);
		graphics.lineTo(matrix[i+1][j].x, matrix[i+1][j].y);
		graphics.lineTo(matrix[i][j].x, matrix[i][j].y);
		graphics.endFill();

		// bottom triangle
		var c = parseInt(Math.random()*2);
		var color = '0x'+c+c+c+c+c+c;
		graphics.beginFill(color);
		graphics.lineStyle(0);
		graphics.moveTo(matrix[i][j+1].x, matrix[i][j+1].y);
		graphics.lineTo(matrix[i+1][j+1].x, matrix[i+1][j+1].y);
		graphics.lineTo(matrix[i+1][j].x, matrix[i+1][j].y);
		graphics.lineTo(matrix[i][j+1].x, matrix[i][j+1].y);
		graphics.endFill();


	}
}




stage.addChild(graphics);

// run the render loop
window.onresize = animate;
animate();

function animate() {
	renderer.render(stage);
	requestAnimationFrame( animate );
}

