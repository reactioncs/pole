import { useEffect, useRef, useState } from "react";

const CIRCLE_RADIUS = 12;

function InteractiveView({ plotStatus, setPlotStatus }) {
  const plotStatusRef = useRef(plotStatus);

  /** @type {React.RefObject<HTMLCanvasElement>} */
  const canvasRef = useRef(null);
  /** @type {React.RefObject<CanvasRenderingContext2D>} */
  const contextRef = useRef(null);

  function resize() {
    if (!canvasRef.current) throw new Error();
    const canvas = canvasRef.current;

    const dpr = window.devicePixelRatio || 2
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
  }

  function init() {
    if (!canvasRef.current) throw new Error();
    const canvas = canvasRef.current;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("ctx is null");

    contextRef.current = ctx;
  }

  function draw() {
    if (!canvasRef.current || !contextRef.current) throw new Error();
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    const plotStatus = plotStatusRef.current;

    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < plotStatus.coefficients.length; i++) {
      const canvasX = (plotStatus.coefficients[i][0] - plotStatus.centerX + canvas.width / plotStatus.scale / 2) * plotStatus.scale;
      const canvasY = (plotStatus.centerY + canvas.height / plotStatus.scale / 2 - plotStatus.coefficients[i][1]) * plotStatus.scale;

      ctx.lineWidth = 3;
      ctx.strokeStyle = "white";
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, CIRCLE_RADIUS, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.font = "italic 35px Times New Roman, Serif";
      ctx.fillStyle = "white";
      ctx.fillText(String.fromCharCode(plotStatus.coefficients.length - i - 1 + 97), canvasX - 8, canvasY + 45);
    }
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

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [activePoint, setActivePoint] = useState(null);

  function updateActive(e) {
    if (!canvasRef.current) throw new Error();
    const canvas = canvasRef.current;

    setActivePoint(null);
    for (let i = 0; i < plotStatus.coefficients.length; i++) {
      const canvasX = (plotStatus.coefficients[i][0] - plotStatus.centerX + canvas.width / plotStatus.scale / 2) * plotStatus.scale;
      const canvasY = (plotStatus.centerY + canvas.height / plotStatus.scale / 2 - plotStatus.coefficients[i][1]) * plotStatus.scale;
      const dx = e.clientX / canvas.clientWidth * canvas.width - canvasX;
      const dy = e.clientY / canvas.clientHeight * canvas.height - canvasY;
      if (dx * dx + dy * dy < CIRCLE_RADIUS * CIRCLE_RADIUS) {
        setActivePoint(i);
        return i;
      }
    }
    return null;
  }

  function handleMouseDown(e) {
    e.preventDefault();
    updateActive(e);
    setIsMouseDown(true);
  }

  function handleMouseUp(e) {
    e.preventDefault();
    updateActive(e);
    setIsMouseDown(false);
  }

  function handleMouseMove(e) {
    e.preventDefault();
    if (activePoint !== null && isMouseDown) {
      const canvas = canvasRef.current;
      const canvasX = e.clientX / canvas.clientWidth * canvas.width;
      const canvasY = e.clientY / canvas.clientHeight * canvas.height;
      const x = canvasX / plotStatus.scale + plotStatus.centerX - canvas.width / plotStatus.scale / 2;
      const y = plotStatus.centerY + canvas.height / plotStatus.scale / 2 - canvasY / plotStatus.scale;
      setPlotStatus(s => {
        s.coefficients[activePoint][0] = x;
        s.coefficients[activePoint][1] = y;
        return { ...s };
      });
    } else {
      updateActive(e);
    }
  }

  return <canvas
    style={{ cursor: activePoint !== null ? 'pointer' : 'default' }}
    ref={canvasRef}
    onMouseDown={handleMouseDown}
    onMouseUp={handleMouseUp}
    onMouseMove={handleMouseMove}
  />;
}

export default InteractiveView;