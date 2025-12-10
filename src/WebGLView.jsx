import { useEffect, useRef } from "react";

import { mat4 } from "gl-matrix";
import { initShaderProgram } from "./glHelper";
import vsSource from "./shaders/vertex.glsl?raw";
import fsSource from "./shaders/fragment.glsl?raw";

function WebGLView({ plotStatus }) {
  const plotStatusRef = useRef(plotStatus);

  /** @type {React.RefObject<CanvasRenderingContext2D>} */
  const canvasRef = useRef(null);
  const glObjectsRef = useRef(null);

  function resize() {
    if (!canvasRef.current) throw new Error();
    const canvas = canvasRef.current;

    const dpr = window.devicePixelRatio || 2
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
  }

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
    const positions = [
      0.5, 0.5, -0.5, 0.5, 0.5, -0.5,
      -0.5, 0.5, 0.5, -0.5, -0.5, -0.5
    ];

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

  function draw() {
    if (!glObjectsRef.current) throw new Error();
    /** @type {WebGL2RenderingContext} */
    const gl = glObjectsRef.current.gl;
    const programInfo = glObjectsRef.current.programInfo;
    const buffers = glObjectsRef.current.buffers;

    const plotStatus = plotStatusRef.current;
    const canvasWidth = gl.canvas.width;
    const canvasHeight = gl.canvas.height;

    gl.viewport(0, 0, canvasWidth, canvasHeight);

    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const projectionMatrix = mat4.create();
    mat4.ortho(
      projectionMatrix,
      plotStatus.centerX - canvasWidth / plotStatus.scale / 2,
      plotStatus.centerX + canvasWidth / plotStatus.scale / 2,
      plotStatus.centerY - canvasHeight / plotStatus.scale / 2,
      plotStatus.centerY + canvasHeight / plotStatus.scale / 2,
      -1.0,
      1.0
    );

    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [plotStatus.centerX, plotStatus.centerY, 0.0]);
    mat4.scale(modelViewMatrix, modelViewMatrix, [canvasWidth / plotStatus.scale, canvasHeight / plotStatus.scale, 1.0]);

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

    gl.uniform2f(programInfo.uniforms.uCoefficients0, plotStatus.coefficients[0][0], plotStatus.coefficients[0][1]);
    gl.uniform2f(programInfo.uniforms.uCoefficients1, plotStatus.coefficients[1][0], plotStatus.coefficients[1][1]);
    gl.uniform2f(programInfo.uniforms.uCoefficients2, plotStatus.coefficients[2][0], plotStatus.coefficients[2][1]);
    gl.uniform2f(programInfo.uniforms.uCoefficients3, plotStatus.coefficients[3][0], plotStatus.coefficients[3][1]);

    {
      const offset = 0;
      const vertexCount = 6;
      gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
    }
  }

  function init() {
    if (!canvasRef.current) throw new Error();
    const canvas = canvasRef.current;

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
        uCoefficients0: gl.getUniformLocation(shaderProgram, "uCoefficients[0]"),
        uCoefficients1: gl.getUniformLocation(shaderProgram, "uCoefficients[1]"),
        uCoefficients2: gl.getUniformLocation(shaderProgram, "uCoefficients[2]"),
        uCoefficients3: gl.getUniformLocation(shaderProgram, "uCoefficients[3]"),
      }
    };

    const buffers = initBuffers(gl);
    glObjectsRef.current = { gl, programInfo, buffers };
  }

  useEffect(() => {
    resize();
    init();

    const observer = new ResizeObserver(() => {
      resize();
      draw();
    });
    observer.observe(canvasRef.current);

    function render() {
      draw();
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }, []);

  useEffect(() => { plotStatusRef.current = plotStatus; }, [plotStatus]);

  return <canvas ref={canvasRef} />;
}

export default WebGLView;