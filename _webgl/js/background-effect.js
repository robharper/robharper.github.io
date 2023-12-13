window.addEventListener("load", startup, false);

const scaleFactor = 2;

function compileShader(id, type) {
  const code = document.getElementById(id).firstChild.nodeValue;
  const shader = gl.createShader(type);

  gl.shaderSource(shader, code);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(
      `Error compiling ${
        type === gl.VERTEX_SHADER ? "vertex" : "fragment"
      } shader:`
    );
    console.log(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function buildShaderProgram(shaderInfo) {
  const program = gl.createProgram();

  shaderInfo.forEach((desc) => {
    const shader = compileShader(desc.id, desc.type);

    if (shader) {
      gl.attachShader(program, shader);
    }
  });

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log("Error linking shader program:");
    console.log(gl.getProgramInfoLog(program));
  }

  return program;
}

function startup() {
  glCanvas = document.getElementById("background");
  gl = glCanvas.getContext("webgl");

  const shaderSet = [
    {
      type: gl.VERTEX_SHADER,
      id: "vertex-shader",
    },
    {
      type: gl.FRAGMENT_SHADER,
      id: "fragment-shader",
    },
  ];

  const shaderProgram = buildShaderProgram(shaderSet);
  gl.useProgram(shaderProgram);

  const uScalingFactor = gl.getUniformLocation(shaderProgram, "uScalingFactor");
  const uScale = gl.getUniformLocation(shaderProgram, "u_scale");
  const uOffset = gl.getUniformLocation(shaderProgram, "u_offset");
  const uTime = gl.getUniformLocation(shaderProgram, "u_time");

  const vertexArray = new Float32Array([
    1, 1, 0,
    -1, 1, 0,
    1, -1, 0,
    -1, -1, 0
  ]);
  const vertexCount = vertexArray.length / 3;

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

  const aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(aVertexPosition);

  render();

  function render() {
    const [width, height] = [glCanvas.clientWidth/scaleFactor, glCanvas.clientHeight/scaleFactor];
    if (glCanvas.width !== width || glCanvas.height !== height) {
      glCanvas.width  = width;
      glCanvas.height = height;
    }

    let scale, offset;
    if (width > height) {
      vertexScale = [1.0, width/height];
      scale = [height, height];
      offset = [(width/height - 1) / 2, 0];
    } else {
      vertexScale = [height/width, 1.0];
      scale = [width, width];
      offset = [(height/width - 1) / 2, 0];
    }

    gl.uniform2fv(uScalingFactor, scale);
    gl.uniform2fv(uScale, scale);
    gl.uniform2fv(uOffset, offset);
    gl.uniform1f(uTime, performance.now() / 1.0);

    gl.viewport(0, 0, width, height);
    gl.clearColor(0.8, 0.9, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.vertexAttribPointer(aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexCount);

    requestAnimationFrame(render);
  }
}