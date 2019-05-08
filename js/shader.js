//
// Initialize a shader program
var vertShaderSource = `
attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec2 vTextureCoord;
varying highp vec3 vVertexPos;

void main(void) {
	vVertexPos = (uModelViewMatrix * aVertexPosition).xyz;
	gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
	vTextureCoord = aTextureCoord;
}
`

var fragShaderSource = `
varying highp vec2 vTextureCoord;
varying highp vec3 vVertexPos;
uniform highp float vColor;
uniform highp vec3 camPos;
uniform highp float vFlash;
uniform sampler2D uSampler;
uniform int grFlag;
void main(void) {
	gl_FragColor = texture2D(uSampler, vTextureCoord);
	highp float factor = 1.0/clamp(length(camPos - vVertexPos)/7.5, 0.8, 1000.0);
	gl_FragColor = vec4(gl_FragColor.r * factor, gl_FragColor.g * factor, gl_FragColor.b * factor, 1.0);
	gl_FragColor = gl_FragColor * vFlash;
	if(grFlag!=0) {
		lowp float gray = (0.2*gl_FragColor.r+0.7*gl_FragColor.g+0.07*gl_FragColor.b);
		gl_FragColor = vec4(gray, gray, gray, 1.0);
	}
}
`


function initShaderProgram(gl, vsSource, fsSource) {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

	// Create the shader program
	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	// If creating the shader program failed, alert
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}

	return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
	const shader = gl.createShader(type);

	// Send the source to the shader object

	gl.shaderSource(shader, source);

	// Compile the shader program
	gl.compileShader(shader);

	// See if it compiled successfully
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}
