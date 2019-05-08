var tunnel1, tunnel2;
var obstacle1, obstacle2, obstacle3;
var placedObstacle = false;
var gameStarted = false; var paused = false;
var Score = 0, Level = 1, Distance = 0, distCount = 0;

const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

if (!gl) {
	alert('Unable to initialize WebGL. Your browser or machine may not support it.');
}
else {
	// Initialize a shader program;
	// Establish all lighting
	const shaderProgram = initShaderProgram(gl, vertShaderSource, fragShaderSource);

	// Collect the information needed to use the shader program.
	const programInfo = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
			textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
			uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
			grFlag: gl.getUniformLocation(shaderProgram, 'grFlag'),
			vFlash: gl.getUniformLocation(shaderProgram, 'vFlash'),
			camPos: gl.getUniformLocation(shaderProgram, 'camPos'),
		},
	};

	//init buffers
	initBuffersTunnel(gl, 1);
	initBuffersObstacle(gl, 1);
	tunnel1 = new makeTunnel([0, 0, -6], vec3.fromValues(0, 0, -1));
	tunnel2 = new makeTunnel(getPosition(tunnel1, 90), tunnel1.perDirVector);
	console.log(tunnel1.perDirVector)

	obstacle1 = new makeObstacle([0, 0, 100], [0, 1, 0], 0, [7, 1, 1], 0, 0);
	obstacle2 = new makeObstacle([0, 0, 100], [0, 1, 0], 0, [7, 1, 1], 0, 0);
	obstacle3 = new makeObstacle([0, 0, 100], [0, 1, 0], 0, [7, 1, 1], 0, 0);


	// Iteration
	var then = 0;
	function render(now) {
		now *= 0.0007;  // convert to seconds
		const deltaTime = now - then;
		then = now;

		drawScene(gl, programInfo, deltaTime);
		requestAnimationFrame(render);
	}

		requestAnimationFrame(render);
}

var cameraPosition = 0, cameraAngle = 0, radius = 3.8, radiusVel = 0, cameraPosSpeed = 18;
var currentlyPressedKeys = {};


function gameStart() {
	gameStarted = true;
	document.getElementById("start-game").style.display = "none";
	console.log("Start Game!")
}

function restartGame() {
	location.reload();
}

// Drawing the scene
function drawScene(gl, programInfo, deltaTime) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
	gl.clearDepth(1.0);                 // Clear everything
	gl.enable(gl.DEPTH_TEST);           // Enable depth testing
	gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

	// Clear the canvas before we start drawing on it.

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Create a perspective matrix, a special matrix that is
	// used to simulate the distortion of perspective in a camera.
	// Our field of view is 45 degrees, with a width/height
	// ratio that matches the display size of the canvas
	// and we only want to see objects between 0.1 units
	// and 100 units away from the camera.

	const fieldOfView = 90 * Math.PI / 180;   // in radians
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const zNear = 0.1;
	const zFar = 1000.0;
	const projectionMatrix = mat4.create();
	const tempMatrix = mat4.create();

	mat4.perspective(projectionMatrix,
									 fieldOfView,
									 aspect,
									 zNear,
									 zFar);

	var curCentre = getPosition(tunnel1, cameraPosition);
	var nxtCentre = vec3.create();
	var ForwardDir = vec3.create();
	ForwardDir = getForwardDirection(tunnel1, cameraPosition);
	var RadialDir = getUpDirection(tunnel1, cameraPosition, cameraAngle);
	var cameraPos = vec3.create();
	vec3.scaleAndAdd(cameraPos, curCentre, RadialDir, radius);
	vec3.add(nxtCentre, cameraPos, ForwardDir);
	mat4.lookAt(tempMatrix, cameraPos, nxtCentre, [curCentre[0] - cameraPos[0], curCentre[1] - cameraPos[1], curCentre[2] - cameraPos[2]]);
	// mat4.lookAt(tempMatrix, [0, 0, 300], [0, 0, -6], [0, 1, 0]);
	mat4.multiply(projectionMatrix, projectionMatrix, tempMatrix);

	gl.useProgram(programInfo.program);

	// Set the shader uniforms

	gl.uniformMatrix4fv(
			programInfo.uniformLocations.projectionMatrix,
			false,
			projectionMatrix);

	if(currentlyPressedKeys[66]) {
		gl.uniform1i(programInfo.uniformLocations.grFlag, 1);
	}
	else {
		gl.uniform1i(programInfo.uniformLocations.grFlag, 0);
	}
	if(Distance%300<=17 && !(Distance<=20)) {
		gl.uniform1f(programInfo.uniformLocations.vFlash, 5 - (cameraPosition)/5);
		document.getElementById("new-level").style.display = "block";
		setTimeout(() => {
			document.getElementById("new-level").style.display = "none";
		}, 700);
	} else
		gl.uniform1f(programInfo.uniformLocations.vFlash, 1);
	// }
	gl.uniform3f(programInfo.uniformLocations.camPos, cameraPos[0], cameraPos[1], cameraPos[2]);

	drawObstacle(gl, programInfo, obstacle1);
	drawObstacle(gl, programInfo, obstacle2);
	drawObstacle(gl, programInfo, obstacle3);
	// drawObstacle(gl, programInfo, obstacle4);
	drawTunnel(gl, programInfo, tunnel1);
	drawTunnel(gl, programInfo, tunnel2);

	if (!gameStarted)
		return;

	obstacle1.rotation += obstacle1.angularSpeed * deltaTime;
	obstacle2.rotation += obstacle2.angularSpeed * deltaTime;
	obstacle3.rotation += obstacle3.angularSpeed * deltaTime;
	// Update the rotation for the next draw

	if(isColliding(cameraPos, curCentre, ForwardDir, obstacle1)&&cameraPosition>=28&&cameraPosition<=31) {
		console.log("hit number 1")
		console.log(cameraPosition)
		cameraPosSpeed = 0;
		gameStarted = false;
		document.getElementById("game-over").style.display = "block";
	} else {
		var curCentre = getPosition(tunnel1, cameraPosition);
		var cameraPos = vec3.create();
		vec3.scaleAndAdd(cameraPos, curCentre, RadialDir, radius);
		ForwardDir = getForwardDirection(tunnel1, cameraPosition);
	}
	if(isColliding(cameraPos, curCentre, ForwardDir, obstacle2)&&cameraPosition>=58&&cameraPosition<=61) {
		console.log("hit number 2")
		console.log(cameraPosition)
		cameraPosSpeed = 0;
		gameStarted = false;
		document.getElementById("game-over").style.display = "block";
	} else {
		var curCentre = getPosition(tunnel1, cameraPosition);
		var cameraPos = vec3.create();
		vec3.scaleAndAdd(cameraPos, curCentre, RadialDir, radius);
		ForwardDir = getForwardDirection(tunnel1, cameraPosition);
	}
	if(isColliding(cameraPos, curCentre, ForwardDir, obstacle3)&&cameraPosition>=88&&cameraPosition<=91) {
		console.log("hit number 3")
		console.log(cameraPosition)
		cameraPosSpeed = 0;
		gameStarted = false;
		document.getElementById("game-over").style.display = "block";
	} else {
		var curCentre = getPosition(tunnel1, cameraPosition);
		var cameraPos = vec3.create();
		vec3.scaleAndAdd(cameraPos, curCentre, RadialDir, radius);
		ForwardDir = getForwardDirection(tunnel1, cameraPosition);
	}



	cameraPosition += (1 + (Level*1.7)/4)*cameraPosSpeed*deltaTime;
	Distance = (distCount*90 + cameraPosition)*0.8333;
	// console.log(tunnel1.dirVector, tunnel1.perDirVector)
	// console.log(getForwardDirection(tunnel1, 30))
	document.getElementById("info").innerHTML = 'Distance: ' + Math.floor(Distance) + '<br/>Level: ' + Level;
	if(cameraPosition >= 90) {
		distCount++;
		var tempDiff = vec3.angle(getUpDirection(tunnel1, cameraPosition, cameraAngle), getUpDirection(tunnel2, cameraPosition-90, cameraAngle));
		if(vec3.angle(getUpDirection(tunnel1, cameraPosition, cameraAngle), getUpDirection(tunnel2, cameraPosition-90, cameraAngle - tempDiff)) < vec3.angle(getUpDirection(tunnel1, cameraPosition, cameraAngle), getUpDirection(tunnel2, cameraPosition-90, cameraAngle + tempDiff))) {
			cameraAngle -= tempDiff;
		}
		else {
			cameraAngle += tempDiff;
		}
		cameraPosition = cameraPosition - 90;
		tunnel1 = tunnel2;
		tunnel2 = new makeTunnel(getPosition(tunnel1, 90), tunnel1.perDirVector);
		console.log(cameraPosition, "    , and Tunnel swaped")
		placedObstacle = false;
		Score += 1;
		if(Score == Level*4) {
			Level += 1;
			if(Level == 5) Level = 4;
			initBuffersTunnel(gl, Level);
			initBuffersObstacle(gl, Level);
		}
	}
	if(!placedObstacle && cameraPosition >= 2) {
		placedObstacle = true;
		obstacle1 = new makeObstacle(getPosition(tunnel1, 30), getForwardDirection(tunnel1, 30), Math.floor(Math.random()*Level));
		obstacle2 = new makeObstacle(getPosition(tunnel1, 60), getForwardDirection(tunnel1, 60), Math.floor(Math.random()*Level));
		obstacle3 = new makeObstacle(getPosition(tunnel1, 90), tunnel1.perDirVector, Math.floor(Math.random()*Level));
	}
	radius += radiusVel;
	radiusVel += 0.02;
	if(radius >= 3.8) radius = 3.8;
	if (cameraPosSpeed > 1 && (currentlyPressedKeys[37] || currentlyPressedKeys[65])) {
		// Left cursor key
		cameraAngle -= -0.02;
    }
    if (cameraPosSpeed > 1 && (currentlyPressedKeys[39] || currentlyPressedKeys[68])) {
		// Right cursor key
		cameraAngle += -0.02;
		}
		

}

document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;
var oldSpeed = 0;

function handleKeyDown(event) {
	currentlyPressedKeys[event.keyCode] = true;
	if (event.keyCode == 74 && radius >= 3.8) {
		radiusVel = -0.36;
	}
	if (event.keyCode == 32) {
		if (gameStarted) {
			var temp = oldSpeed;
			oldSpeed = cameraPosSpeed;
			cameraPosSpeed = temp;
			paused = paused? false: true;
			document.getElementById("game-paused").style.display = paused? "block": "none";
			console.log("Toggle Pause");
		}
	}
}

function handleKeyUp(event) {
	currentlyPressedKeys[event.keyCode] = false;
}



