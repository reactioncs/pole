import { useEffect, useRef } from "react";

function InteractiveView({ plotStatus }) {
  const plotStatusRef = useRef(plotStatus);

  const canvasRef = useRef(null);
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
      const x = canvas.width / (plotStatus.x1Max - plotStatus.x1Min) * (plotStatus.coefficients[i][0] - plotStatus.x1Min);
      const y = canvas.height / (plotStatus.x2Min - plotStatus.x2Max) * (plotStatus.coefficients[i][1] - plotStatus.x2Max);

      ctx.lineWidth = 3;
      ctx.strokeStyle = "white";
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.font = "italic 35px Times New Roman, Serif";
      ctx.fillStyle = "white";
      ctx.fillText(String.fromCharCode(plotStatus.coefficients.length - i - 1 + 97), x - 8, y + 45);
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

  return <canvas ref={canvasRef} />;
}

export default InteractiveView;