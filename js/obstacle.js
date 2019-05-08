var buffersObstacle;

var textureObstacle;
function initBuffersObstacle(gl, level) {

	var texturePath;
	if (level==1)
		texturePath = './assets/Obs1.png'
	else if (level==2)
		texturePath = './assets/Obs2.jpg'
	else if (level==3)
		texturePath = './assets/Obs3.jpg'
	else if (level==4)
		texturePath = './assets/Obs4.jpg'
	// Create a buffer for the cube's vertex positions.

	const positionBuffer = gl.createBuffer();
	textureObstacle = loadTexture(gl, texturePath);

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	// create an array of positions for the cube.

	const positions = [
		// Front face
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0,
		 1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,

		// Back face
		-1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0, -1.0, -1.0,

		// Top face
		-1.0,  1.0, -1.0,
		-1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
		 1.0,  1.0, -1.0,

		// Bottom face
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		 1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,

		// Right face
		 1.0, -1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0,  1.0,  1.0,
		 1.0, -1.0,  1.0,

		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		-1.0,  1.0, -1.0,
	];

	// Float32 Array

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


	const texCods = [
		// Front
		0.0,  0.0,
		1.0,  0.0,
		1.0,  1.0,
		0.0,  1.0,
		// Back
		0.0,  0.0,
		1.0,  0.0,
		1.0,  1.0,
		0.0,  1.0,
		// Top
		0.0,  0.0,
		1.0,  0.0,
		1.0,  1.0,
		0.0,  1.0,
		// Bottom
		0.0,  0.0,
		1.0,  0.0,
		1.0,  1.0,
		0.0,  1.0,
		// Right
		0.0,  0.0,
		1.0,  0.0,
		1.0,  1.0,
		0.0,  1.0,
		// Left
		0.0,  0.0,
		1.0,  0.0,
		1.0,  1.0,
		0.0,  1.0,
	];

	const textureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCods), gl.STATIC_DRAW);


	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	// This array defines each face as two triangles, using the
	// indices into the vertex array to specify each triangle's
	// position.

	const indices = [
		0,  1,  2,      0,  2,  3,    // front
		4,  5,  6,      4,  6,  7,    // back
		8,  9,  10,     8,  10, 11,   // top
		12, 13, 14,     12, 14, 15,   // bottom
		16, 17, 18,     16, 18, 19,   // right
		20, 21, 22,     20, 22, 23,   // left
	];


	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
			new Uint16Array(indices), gl.STATIC_DRAW);

	buffersObstacle = {
		position: positionBuffer,
		textureCoord: textureCoordBuffer,
		indices: indexBuffer,
	};

	console.log("init cube")
}

function drawObstacle(gl, programInfo, cubeInfo) {
	const modelViewMatrix = mat4.create();

	// Now move the drawing position a bit to where we want to
	// start drawing the square.

	mat4.translate(modelViewMatrix, modelViewMatrix, cubeInfo.position); 

	mat4.rotate(modelViewMatrix,modelViewMatrix,cubeInfo.rotation, cubeInfo.dirVector); 
	mat4.rotate(modelViewMatrix, modelViewMatrix, cubeInfo.rotAngle1,cubeInfo.rotVector1); 
	mat4.rotate(modelViewMatrix, modelViewMatrix,cubeInfo.rotAngle2,cubeInfo.rotVector2); 
	mat4.scale(modelViewMatrix, modelViewMatrix, cubeInfo.scale);

	mat4.translate(modelViewMatrix,  modelViewMatrix,[0, cubeInfo.displaced, 0]);

	{
		const numComponents = 3;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffersObstacle.position);
		gl.vertexAttribPointer(
				programInfo.attribLocations.vertexPosition,
				numComponents,
				type,
				normalize,
				stride,
				offset);
		gl.enableVertexAttribArray(
				programInfo.attribLocations.vertexPosition);
	}

	{
		const numComponents = 2;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffersObstacle.textureCoord);
		gl.vertexAttribPointer(
			programInfo.attribLocations.textureCoord,
			numComponents,
			type,
			normalize,
			stride,
			offset);
		gl.enableVertexAttribArray(
			programInfo.attribLocations.textureCoord);
	}

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffersObstacle.indices);


	gl.uniformMatrix4fv(
			programInfo.uniformLocations.modelViewMatrix,
			false,
			modelViewMatrix);

	gl.activeTexture(gl.TEXTURE0);

	gl.bindTexture(gl.TEXTURE_2D, textureObstacle);

	gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

	{
		const vertexCount = 36;
		const type = gl.UNSIGNED_SHORT;
		const offset = 0;
		gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
	}
	// console.log("draw cube")
}

function makeObstacle(_position, _dirVector, _type) {

	this.position = _position;

	if(_type == 0) {
		this.rotation = Math.random()*2*Math.PI;
		this.scale = [7, 1, 1];
		this.angularSpeed = 0;
		this.displaced = 0;
	}
	else if(_type == 1) {
		this.rotation = Math.random()*2*Math.PI;
		this.scale = [7, 1, 1];
		this.angularSpeed = Math.PI/4;
		this.displaced = 0;
	}
	else if(_type == 2) {
		this.rotation = Math.random()*2*Math.PI;
		this.scale = [7, 4, 1];
		this.angularSpeed = 0;
		this.displaced = 1 + Math.random() * 1;
	}
	else if(_type == 3) {
		this.rotation = Math.random()*2*Math.PI;
		this.scale = [7, 4, 1];
		this.angularSpeed = Math.PI/4;
		this.displaced = 1 + Math.random() * 1;
	}

	this.dirVector = _dirVector;

	this.rotVector1 = vec3.fromValues(0, -1, 0);
	this.rotAngle1 = Math.atan2(_dirVector[2], _dirVector[0]) + Math.PI/2;
	if(Math.abs(_dirVector[0]) + Math.abs(_dirVector[2]) < 0.01) {
		this.rotAngle1 = 0;
	}

	this.rotVector2 = vec3.fromValues(-1, 0, 0);
	this.rotAngle2 = Math.acos(_dirVector[1]/vec3.length(_dirVector)) - Math.PI/2;
}


function isColliding(_camPos, _curCentre, _forwardDir, cubeInfo) {
	var tempRotation = mat4.create();
	mat4.translate(tempRotation, tempRotation, cubeInfo.position);

	mat4.rotate(tempRotation,tempRotation,cubeInfo.rotAngle1,cubeInfo.rotVector1); 
	mat4.rotate(tempRotation, tempRotation,cubeInfo.rotAngle2,cubeInfo.rotVector2);

	mat4.scale(tempRotation, tempRotation, cubeInfo.scale);
	mat4.translate(tempRotation, tempRotation, [0, cubeInfo.displaced, 0]); 

	var bottomLeft = vec3.fromValues(-1, -1, -1);
	var topRight = vec3.fromValues(1, 1, 1);
	vec3.transformMat4(bottomLeft, bottomLeft, tempRotation);
	vec3.transformMat4(topRight, topRight, tempRotation);

	tempRotation = mat4.create();
	const tempVec = vec3.create();
	vec3.negate(tempVec, cubeInfo.position);
	mat4.translate(tempRotation, tempRotation,cubeInfo.position); 
	mat4.rotate(tempRotation,tempRotation,-cubeInfo.rotation,cubeInfo.dirVector); 
	mat4.translate(tempRotation,tempRotation,tempVec);

	vec3.transformMat4(_camPos, _camPos, tempRotation);

	if(inBetween(bottomLeft[0], topRight[0], _camPos[0]) && inBetween(bottomLeft[1], topRight[1], _camPos[1]) && inBetween(bottomLeft[2], topRight[2], _camPos[2])) {
		return true;
	}
	else {
		return false;
	}
}