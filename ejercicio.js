// <============================================ EJERCICIOS ============================================>
// a) Implementar la función:
//
//      GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY)
//
//    Si la implementación es correcta, podrán hacer rotar la caja correctamente (como en el video). IMPORTANTE: No
//    es recomendable avanzar con los ejercicios b) y c) si este no funciona correctamente. 
//
// b) Implementar los métodos:
//
//      setMesh(vertPos, texCoords)
//      swapYZ(swap)
//      draw(trans)
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado, asi como también intercambiar 
//    sus coordenadas yz. Para reenderizar cada fragmento, en vez de un color fijo, pueden retornar: 
//
//      gl_FragColor = vec4(1,0,gl_FragCoord.z*gl_FragCoord.z,1);
//
//    que pintará cada fragmento con un color proporcional a la distancia entre la cámara y el fragmento (como en el video).
//    IMPORTANTE: No es recomendable avanzar con el ejercicio c) si este no funciona correctamente. 
//
// c) Implementar los métodos:
//
//      setTexture(img)
//      showTexture(show)
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado y su textura.
//
// Notar que los shaders deberán ser modificados entre el ejercicio b) y el c) para incorporar las texturas.  
// <=====================================================================================================>



// Esta función recibe la matriz de proyección (ya calculada), una traslación y dos ángulos de rotación
// (en radianes). Cada una de las rotaciones se aplican sobre el eje x e y, respectivamente. La función
// debe retornar la combinación de las transformaciones 3D (rotación, traslación y proyección) en una matriz
// de 4x4, representada por un arreglo en formato column-major. El parámetro projectionMatrix también es 
// una matriz de 4x4 alamcenada como un arreglo en orden column-major. En el archivo project4.html ya está
// implementada la función MatrixMult, pueden reutilizarla. 

function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY)
{
	var rotXMatrix = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), Math.sin(rotationX), 0,
		0, -Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1
	];
	var rotYMatrix = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1
	];
	// Matriz de traslación
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	
	var mvp = MatrixMult(projectionMatrix, MatrixMult(trans, MatrixMult(rotYMatrix, rotXMatrix)));
	return mvp;
}

class MeshDrawer
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias. 
	constructor()
	{
		this.prog   = InitShaderProgram(meshVS, meshFS);

		this.swap = gl.getUniformLocation(this.prog, 'swap');
		this.mvp = gl.getUniformLocation(this.prog, 'mvp');
		this.vert = gl.getAttribLocation(this.prog, 'pos');
		this.textCoord = gl.getAttribLocation(this.prog, 'tc');
		this.bufferPos = gl.createBuffer();
		this.bufferText = gl.createBuffer();
		this.texture = gl.createTexture(); 
		
	}
	
	// Esta función se llama cada vez que el usuario carga un nuevo archivo OBJ.
	// En los argumentos de esta función llegan un areglo con las posiciones 3D de los vértices
	// y un arreglo 2D con las coordenadas de textura. Todos los items en estos arreglos son del tipo float. 
	// Los vértices se componen de a tres elementos consecutivos en el arreglo vertexPos [x0,y0,z0,x1,y1,z1,..,xn,yn,zn]
	// De manera similar, las cooredenadas de textura se componen de a 2 elementos consecutivos y se 
	// asocian a cada vértice en orden. 
	setMesh(vertPos, texCoords)
	{
		console.log(vertPos);
		this.numTriangles = vertPos.length / 3;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPos);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferText);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
	}
	
	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Intercambiar Y-Z'
	// El argumento es un boleano que indica si el checkbox está tildado
	swapYZ(swap)
	{
		gl.useProgram(this.prog);
		gl.uniform1i(this.swap, swap);
	}
	
	// Esta función se llama para dibujar la malla de triángulos
	// El argumento es la matriz de transformación, la misma matriz que retorna GetModelViewProjection
	draw(trans)
	{
		gl.useProgram(this.prog);
		
		gl.uniformMatrix4fv(this.mvp, false, trans);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPos);
		gl.vertexAttribPointer(this.vert, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.vert);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferText);
		gl.vertexAttribPointer(this.textCoord, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.textCoord);

		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles * 3);
	}
	
	// Esta función se llama para setear una textura sobre la malla
	// El argumento es un componente <img> de html que contiene la textura. 
	setTexture(img)
	{
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGB,
			gl.RGB,
			gl.UNSIGNED_BYTE,
			img
		);
		gl.generateMipmap(gl.TEXTURE_2D);
	}
					
	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Mostrar textura'
	// El argumento es un boleano que indica si el checkbox está tildado
	showTexture(show)
	{
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		var sampler = gl.getUniformLocation(this.prog, 'texGPU');
		gl.useProgram(this.prog);
		gl.uniform1i (sampler, 0);
	}

}

// Vertex Shader
// Si declaras las variables pero no las usas es como que no las declaraste y va a tirar error. Siempre va punto y coma al finalizar la sentencia. 
// Las constantes en punto flotante necesitan ser expresadas como x.y, incluso si son enteros: ejemplo, para 4 escribimos 4.0
var meshVS = `	
	uniform int swap;
	attribute vec3 pos;
	uniform mat4 mvp;
	attribute vec2 tc;
	varying vec2 textCoord;
	void main()
	{ 
		textCoord = tc;
		if(swap == 0){
			gl_Position = mvp * vec4(pos,1);
		}else{
			gl_Position = mvp * vec4(pos.x,pos.z,pos.y,1);
		}
	}
`;

// Fragment Shader
var meshFS = `
	precision mediump float;
	uniform sampler2D textGPU;
	varying vec2 textCoord;
	void main()
	{	
		//gl_FragColor = vec4(1,0,gl_FragCoord.z*gl_FragCoord.z,1);	
		gl_FragColor = texture2D(textGPU,textCoord);
	}
`;
