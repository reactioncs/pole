import { useEffect, useRef, useState } from "react";
import InteractiveView from "./InteractiveView";
import WebGLView from "./WebGLView";

function App() {
  const [plotStatus, setPlotStatus] = useState({
    x1Min: -1.0,
    x1Max: 1.0,
    x2Min: -1.0,
    x2Max: 1.0,
    coefficients: [
      [0.0, -1.0],
      [-1.0, 0.0],
      [0.0, 1.0],
      [1.0, 0.0],
    ],
  });

  const divRef = useRef(null);

  function resize() {
    if (!divRef.current) throw new Error();
    const div = divRef.current;

    setPlotStatus(s => ({
      ...s,
      x1Min: -div.clientWidth / 500.0,
      x1Max: div.clientWidth / 500.0,
      x2Min: -div.clientHeight / 500.0,
      x2Max: div.clientHeight / 500.0,
    }));
  }

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      resize();
    });
    observer.observe(divRef.current);

    // const coefficients = plotStatus.coefficients;
    // function render(time) {
    //   coefficients[0][0] = Math.cos(time * 0.0015) * 1.0;
    //   coefficients[0][1] = Math.sin(time * 0.0015) * 1.0;
    //   coefficients[1][0] = Math.cos(-time * 0.002) * 0.6;
    //   coefficients[1][1] = Math.sin(-time * 0.002) * 0.6;
    //   setPlotStatus(s => ({ ...s, coefficients, }));
    //   requestAnimationFrame(render);
    // }
    // requestAnimationFrame(render);
  }, []);

  function resetCoefficients() {
    if (!divRef.current) throw new Error();
    const div = divRef.current;

    setPlotStatus({
      x1Min: -div.clientWidth / 500.0,
      x1Max: div.clientWidth / 500.0,
      x2Min: -div.clientHeight / 500.0,
      x2Max: div.clientHeight / 500.0,
      coefficients: [
        [0.0, -1.0],
        [-1.0, 0.0],
        [0.0, 1.0],
        [1.0, 0.0],
      ],
    });
  }

  const displays = plotStatus.coefficients.map((coefficient, i) => {
    const re = coefficient[0];
    const im = coefficient[1];
    const name = String.fromCharCode(plotStatus.coefficients.length - i - 1 + 97);
    return `${name} = ${re.toFixed(2)} ${im > 0 ? "+" : "-"} ${Math.abs(im).toFixed(2)}i`;
  });

  return (
    <>
      <div ref={divRef} id="view">
        <WebGLView plotStatus={plotStatus} />
        <InteractiveView plotStatus={plotStatus} setPlotStatus={setPlotStatus} />
        <div className="info">
          <button onClick={resetCoefficients}>reset coefficients</button>
          {displays.map((d, i) => <p key={i}>{d}</p>).reverse()}
        </div>
      </div>
      <footer>
        <p>link to</p>
        <p><a target="_blank" href="https://www.youtube.com/watch?v=9HIy5dJE-zQ">orignal video</a></p>
        <p>|</p>
        <p><a target="_blank" href="https://github.com/reactioncs/pole">github page</a></p>
      </footer>
    </>
  );
}

export default App;

