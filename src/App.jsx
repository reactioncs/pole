import { useRef, useState } from "react";
import InteractiveView from "./InteractiveView";
import WebGLView from "./WebGLView";

function App() {
  const [plotStatus, setPlotStatus] = useState({
    centerX: 0.0,
    centerY: 0.0,
    scale: 500.0,
    coefficients: [
      [0.0, -1.0],
      [-1.0, 0.0],
      [0.0, 1.0],
      [1.0, 0.0],
    ],
  });

  const divRef = useRef(null);

  function resetCoefficients() {
    setPlotStatus(s => ({
      ...s,
      coefficients: [
        [0.0, -1.0],
        [-1.0, 0.0],
        [0.0, 1.0],
        [1.0, 0.0],
      ],
    }));
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

