import { useEffect, useRef } from "react";

import { mat4 } from "gl-matrix";
import { initShaderProgram } from "./glHelper";
import vsSource from "./shaders/vertex.glsl?raw";
import fsSource from "./shaders/fragment.glsl?raw";

function WebGLView() {
  const canvasRef = useRef(null);

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

  function drawScene(gl, programInfo, buffers, algoInfo) {
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

    gl.uniform1f(programInfo.uniforms.uX1Min, algoInfo.x1Min);
    gl.uniform1f(programInfo.uniforms.uX1Max, algoInfo.x1Max);
    gl.uniform1f(programInfo.uniforms.uX2Min, algoInfo.x2Min);
    gl.uniform1f(programInfo.uniforms.uX2Max, algoInfo.x2Max);

    gl.uniform1f(programInfo.uniforms.uA1, algoInfo.a1);
    gl.uniform1f(programInfo.uniforms.uA2, algoInfo.a2);
    gl.uniform1f(programInfo.uniforms.uB1, algoInfo.b1);
    gl.uniform1f(programInfo.uniforms.uB2, algoInfo.b2);
    gl.uniform1f(programInfo.uniforms.uC1, algoInfo.c1);
    gl.uniform1f(programInfo.uniforms.uC2, algoInfo.c2);

    {
      const offset = 0;
      const vertexCount = 4;
      gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
  }

  function initComponent() {
    const canvas = canvasRef.current;

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 2
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;

    // Initialize the GL context
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
        uA1: gl.getUniformLocation(shaderProgram, "uA1"),
        uA2: gl.getUniformLocation(shaderProgram, "uA2"),
        uB1: gl.getUniformLocation(shaderProgram, "uB1"),
        uB2: gl.getUniformLocation(shaderProgram, "uB2"),
        uC1: gl.getUniformLocation(shaderProgram, "uC1"),
        uC2: gl.getUniformLocation(shaderProgram, "uC2"),
      }
    };

    const buffers = initBuffers(gl);

    let algoInfo = {
      x1Min: -10,
      x1Max: 10,
      x2Min: -10,
      x2Max: 10,
      a1: 1.0,
      a2: 0.0,
      b1: 0.0,
      b2: 0.0,
      c1: 25.0,
      c2: 0.0,
    };

    function render(time) {
      algoInfo.c1 = Math.sin(time * 0.002) * 50;
      algoInfo.c2 = Math.cos(time * 0.002) * 50;

      drawScene(gl, programInfo, buffers, algoInfo);

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  useEffect(() => {
    initComponent();
  }, []);

  return (
    <>
      <canvas ref={canvasRef} />
    </>
  );
}

export default WebGLView;