var buffersTunnel;
const ellipseRatio = 1, bigR = 50;

var textureTunnel;
function initBuffersTunnel(gl, level) {
	// Create a buffer for the tunnel's vertex positions.
	var texturePath;
	if (level==1)
		texturePath = './assets/Tunnel1.jpg'
	else if (level==2)
		texturePath = './assets/Tunnel2.jpg'
	else if (level==3)
		texturePath = './assets/Tunnel3.gif'
	else if (level==4)
		texturePath = './assets/Tunnel4.jpg'

	const positionBuffer = gl.createBuffer();
	textureTunnel = loadTexture(gl, texturePath);
	console.log("Tunnel Texture Loaded")

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	// create an array of positions for the tunnel.
	const positions = new Array(12*8*20);
	const texCods = new Array(8*8*20);
	const ang = (90*(Math.PI/180))/20;

	for (var i = 0; i < 20; i++) {
		for (var j = 0; j < 8; j++) {
			positions[12*(i*8 + j) + 0] = 5*Math.cos((j*Math.PI/4)+Math.PI/8);
			positions[12*(i*8 + j) + 1] = bigR + (bigR+5*Math.sin((j*Math.PI/4)+Math.PI/8))*Math.sin(-Math.PI/2 + ang * i);
			positions[12*(i*8 + j) + 2] = -(ellipseRatio*bigR+5*Math.sin((j*Math.PI/4)+Math.PI/8))*Math.cos(-Math.PI/2 + ang * i);

			positions[12*(i*8 + j) + 3] = 5*Math.cos(((j+1)*Math.PI/4)+Math.PI/8);
			positions[12*(i*8 + j) + 4] = bigR + (bigR+5*Math.sin(((j+1)*Math.PI/4)+Math.PI/8))*Math.sin(-Math.PI/2 + ang * i);
			positions[12*(i*8 + j) + 5] = -(ellipseRatio*bigR+5*Math.sin(((j+1)*Math.PI/4)+Math.PI/8))*Math.cos(-Math.PI/2 + ang * i);

			positions[12*(i*8 + j) + 6] = 5*Math.cos(((j+1)*Math.PI/4)+Math.PI/8);
			positions[12*(i*8 + j) + 7] = bigR + (bigR+5*Math.sin(((j+1)*Math.PI/4)+Math.PI/8))*Math.sin(-Math.PI/2 + ang * (i + 1));
			positions[12*(i*8 + j) + 8] = -(ellipseRatio*bigR+5*Math.sin(((j+1)*Math.PI/4)+Math.PI/8))*Math.cos(-Math.PI/2 + ang * (i + 1));

			positions[12*(i*8 + j) + 9] = 5*Math.cos((j*Math.PI/4)+Math.PI/8);
			positions[12*(i*8 + j) + 10] = bigR + (bigR+5*Math.sin((j*Math.PI/4)+Math.PI/8))*Math.sin(-Math.PI/2 + ang * (i + 1));
			positions[12*(i*8 + j) + 11] = -(ellipseRatio*bigR+5*Math.sin((j*Math.PI/4)+Math.PI/8))*Math.cos(-Math.PI/2 + ang * (i + 1));


			var tempX = Math.floor(Math.random()*3)/3;
			var tempY = Math.floor(Math.random()*3)/3;
			texCods[8*(i*8 + j) + 0] = tempX+0.01;
			texCods[8*(i*8 + j) + 1] = tempY+0.01;

			texCods[8*(i*8 + j) + 2] = tempX+1/3-0.01;
			texCods[8*(i*8 + j) + 3] = tempY+0.01;

			texCods[8*(i*8 + j) + 4] = tempX+0.01;
			texCods[8*(i*8 + j) + 5] = tempY+1/3-0.01;

			texCods[8*(i*8 + j) + 6] = tempX+1/3-0.01;
			texCods[8*(i*8 + j) + 7] = tempY+1/3-0.01;
		}
		console.log("init tunnel")
	}

	// pass the list of positions into WebGL
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


	const textureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCods), gl.STATIC_DRAW);

	// Build the element array buffer; this specifies the indices
	// into the vertex arrays for each face's vertices.

	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	// This array defines each face as two triangles, using the
	// indices into the vertex array to specify each triangle's
	// position.

	var indices = [];

	for (var i = 0; i < positions.length/3; i += 4) {
		indices.push(i+0, i+1, i+2, i+0, i+2, i+3);
	}


	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
			new Uint16Array(indices), gl.STATIC_DRAW);

	buffersTunnel = {
		position: positionBuffer,
		textureCoord: textureCoordBuffer,
		indices: indexBuffer,
		length: indices.length,
	};
}

function drawTunnel(gl, programInfo, tunnelInfo) {
	// Set the drawing position to the "identity" point, which is
	// the center of the scene.
	const modelViewMatrix = mat4.create();


	mat4.translate(modelViewMatrix,modelViewMatrix,tunnelInfo.position);

	mat4.rotate(modelViewMatrix, modelViewMatrix, tunnelInfo.rotation,tunnelInfo.dirVector);

	mat4.rotate(modelViewMatrix, modelViewMatrix,tunnelInfo.rotAngle1,tunnelInfo.rotVector1);

	mat4.rotate(modelViewMatrix,modelViewMatrix,tunnelInfo.rotAngle2,tunnelInfo.rotVector2);

	{
		const numComponents = 3;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffersTunnel.position);
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
		gl.bindBuffer(gl.ARRAY_BUFFER, buffersTunnel.textureCoord);
		gl.vertexAttribPointer(
			programInfo.attribLocations.textureCoord,
			numComponents,
			type,
			normalize,
			stride,
			offset);
		gl.enableVertexAttribArray(
			programInfo.attribLocations.textureCoord);

		// console.log("draw tunnel")
	}


	// Tell WebGL which indices to use to index the vertices
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffersTunnel.indices);

	// Tell WebGL to use our program when drawing

	gl.uniformMatrix4fv(
			programInfo.uniformLocations.modelViewMatrix,
			false,
			modelViewMatrix);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textureTunnel);

	// Tell the shader we bound the textureTunnel to textureTunnel unit 0
	gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

	{
		const vertexCount = buffersTunnel.length;
		const type = gl.UNSIGNED_SHORT;
		const offset = 0;
		gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
	}
}

function makeTunnel(_position, _dirVector) {
	this.position = _position;
	this.dirVector = _dirVector;
	this.rotation = Math.floor(Math.random()*8) * (Math.PI/2);

	this.rotVector1 = vec3.fromValues(0, -1, 0);
	this.rotAngle1 = Math.atan2(_dirVector[2], _dirVector[0]) + Math.PI/2;
	if(Math.abs(_dirVector[0]) + Math.abs(_dirVector[2]) < 0.01) {
		this.rotAngle1 = 0;
	}

	this.rotVector2 = vec3.fromValues(-1, 0, 0);
	this.rotAngle2 = Math.acos(_dirVector[1]/vec3.length(_dirVector)) - Math.PI/2;

	const tempRotation = mat4.create();
	mat4.identity(tempRotation);
	mat4.rotate(tempRotation, tempRotation, this.rotation, this.dirVector);
	mat4.rotate(tempRotation, tempRotation, this.rotAngle1, this.rotVector1);
	mat4.rotate(tempRotation, tempRotation, this.rotAngle2, this.rotVector2);

	this.perDirVector = vec3.fromValues(0, 1, 0);
	// console.log(this.perDirVector)
	vec3.transformMat4(this.perDirVector, this.perDirVector, tempRotation);
	this.normVector = vec3.create();
	vec3.cross(this.normVector, this.dirVector, this.perDirVector);
}

function getPosition(tunnelInfo, ang) {
	var ans = vec3.create();
	vec3.scaleAndAdd(ans, tunnelInfo.position, tunnelInfo.dirVector, bigR*ellipseRatio*Math.sin(Math.PI/180*(ang)));
	vec3.scaleAndAdd(ans, ans, tunnelInfo.perDirVector, bigR-bigR*Math.cos(Math.PI/180*(ang)));
	return ans;
}

function getForwardDirection(tunnelInfo, ang) {
	var ans = vec3.create();
	const tempRotation = mat4.create();
	mat4.identity(tempRotation);
	mat4.rotate(tempRotation, tempRotation, ang*Math.PI/180, tunnelInfo.normVector);
	vec3.transformMat4(ans, tunnelInfo.dirVector, tempRotation);
	// console.log("get Forward" + ans)
	return ans;

}

function getUpDirection(tunnelInfo, ang, ang2) {
	var ans = vec3.create();
	const tempRotation = mat4.create();
	mat4.identity(tempRotation);
	mat4.rotate(tempRotation, tempRotation, ang*Math.PI/180, tunnelInfo.normVector);
	mat4.rotate(tempRotation, tempRotation, ang2, tunnelInfo.dirVector);
	vec3.transformMat4(ans, tunnelInfo.perDirVector, tempRotation);
	return ans;
}

