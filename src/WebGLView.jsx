import { useEffect, useRef } from "react";

import { mat4 } from "gl-matrix";
import { initShaderProgram } from "./glHelper";
import vsSource from "./shaders/vertex.glsl?raw";
import fsSource from "./shaders/fragment.glsl?raw";

function WebGLView() {
  const glCanvasRef = useRef(null);
  const glObjectsRef = useRef(null);

  const shapeCanvasRef = useRef(null);
  const shapeObjectsRef = useRef(null);

  const plotStatusRef = useRef(null);

  function initBuffers(gl) {
    const positionBuffer = initPositionBuffer(gl);

    return {
      position: positionBuffer,
    };
  }

  function initPositionBuffer(gl) {
    // Create a buffer for the square's positions.
    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now create an array of positions for the square.
    const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return positionBuffer;
  }

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  function setPositionAttribute(gl, buffers, programInfo) {
    const numComponents = 2; // pull out 2 values per iteration
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset,
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  }

  function drawGl() {
    if (!glObjectsRef.current || !plotStatusRef.current) throw new Error();
    const gl = glObjectsRef.current.gl;
    const programInfo = glObjectsRef.current.programInfo;
    const buffers = glObjectsRef.current.buffers;
    const plotStatus = plotStatusRef.current;

    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const projectionMatrix = mat4.create();

    const modelViewMatrix = mat4.create();

    setPositionAttribute(gl, buffers, programInfo);

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix,
    );
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix,
    );

    gl.uniform1f(programInfo.uniforms.uX1Min, plotStatus.x1Min);
    gl.uniform1f(programInfo.uniforms.uX1Max, plotStatus.x1Max);
    gl.uniform1f(programInfo.uniforms.uX2Min, plotStatus.x2Min);
    gl.uniform1f(programInfo.uniforms.uX2Max, plotStatus.x2Max);

    gl.uniform2f(programInfo.uniforms.uCoefficients0, plotStatus.coefficients[0][0], plotStatus.coefficients[0][1]);
    gl.uniform2f(programInfo.uniforms.uCoefficients1, plotStatus.coefficients[1][0], plotStatus.coefficients[1][1]);
    gl.uniform2f(programInfo.uniforms.uCoefficients2, plotStatus.coefficients[2][0], plotStatus.coefficients[2][1]);
    gl.uniform2f(programInfo.uniforms.uCoefficients3, plotStatus.coefficients[3][0], plotStatus.coefficients[3][1]);

    {
      const offset = 0;
      const vertexCount = 4;
      gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
  }

  function initGl() {
    if (!glCanvasRef.current) throw new Error();
    const canvas = glCanvasRef.current;

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 2
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;

    // Initialize the GL context
    /** @type {WebGL2RenderingContext} */
    const gl = canvas.getContext("webgl2");

    if (gl === null) throw new Error("Unable to initialize WebGL. Your browser or machine may not support it.");

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
      },
      uniforms: {
        uX1Min: gl.getUniformLocation(shaderProgram, "uX1Min"),
        uX1Max: gl.getUniformLocation(shaderProgram, "uX1Max"),
        uX2Min: gl.getUniformLocation(shaderProgram, "uX2Min"),
        uX2Max: gl.getUniformLocation(shaderProgram, "uX2Max"),
        uCoefficients0: gl.getUniformLocation(shaderProgram, "uCoefficients[0]"),
        uCoefficients1: gl.getUniformLocation(shaderProgram, "uCoefficients[1]"),
        uCoefficients2: gl.getUniformLocation(shaderProgram, "uCoefficients[2]"),
        uCoefficients3: gl.getUniformLocation(shaderProgram, "uCoefficients[3]"),
      }
    };

    const buffers = initBuffers(gl);
    glObjectsRef.current = { gl, programInfo, buffers };

    plotStatusRef.current = {
      x1Min: -1.5,
      x1Max: 1.5,
      x2Min: -1.5,
      x2Max: 1.5,
      coefficients: [
        [0.0, 0.0],
        [0.0, 0.0],
        [0.0, 0.0],
        [1.0, 0.0],
      ],
    };
  }

  function initShapes() {
    if (!shapeCanvasRef.current) throw new Error();
    const canvas = shapeCanvasRef.current;

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 2
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("ctx is null");

    shapeObjectsRef.current = { ctx };
  }

  function drawShapes() {
    if (!shapeCanvasRef.current || !shapeObjectsRef.current || !plotStatusRef.current) throw new Error();
    const canvas = shapeCanvasRef.current;
    const ctx = shapeObjectsRef.current.ctx;
    const plotStatus = plotStatusRef.current;

    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < plotStatus.coefficients.length; i++) {
      const x = canvas.width / (plotStatus.x1Max - plotStatus.x1Min) * (plotStatus.coefficients[i][0] - plotStatus.x1Min);
      const y = canvas.height / (plotStatus.x2Min - plotStatus.x2Max) * (plotStatus.coefficients[i][1] - plotStatus.x1Max);

      ctx.lineWidth = 3;
      ctx.strokeStyle = "white";
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.font = "italic 35px Times New Roman";
      ctx.fillStyle = "white";
      ctx.fillText(String.fromCharCode(plotStatus.coefficients.length - i - 1 + 97), x - 8, y + 45);
    }
  }

  function init() {
    initGl();
    initShapes();

    function render(time) {
      if (!plotStatusRef.current) throw new Error();
      const plotStatus = plotStatusRef.current;

      plotStatus.coefficients[0][0] = Math.cos(time * 0.0015) * Math.pow(0.8, 3);
      plotStatus.coefficients[0][1] = Math.sin(time * 0.0015) * Math.pow(0.8, 3);

      drawShapes();
      drawGl();

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <div id="view">
        <canvas ref={glCanvasRef} />
        <canvas ref={shapeCanvasRef} />
      </div>
    </>
  );
}

export default WebGLView;