import { useEffect } from "react";
import { useTimerStore } from "../../store/useTimerStore";

function Face({ duration, className, children }) {
  return (
    <div className={`cube-face ${className}`}>
      {children || (
        <span className="face-duration">
          {duration}
          <small>MIN</small>
        </span>
      )}
    </div>
  );
}

export default function Cube() {
  const rotation = useTimerStore((s) => s.rotation);
  const isRotating = useTimerStore((s) => s.isRotating);
  const finishRotation = useTimerStore((s) => s.finishRotation);
  const remaining = useTimerStore((s) => s.remainingSeconds);
  const topDuration = useTimerStore((s) => s.topDuration);

  const total = topDuration * 60;
  const progress = total > 0 ? remaining / total : 0;

  const display = `${String(Math.floor(remaining / 60)).padStart(
    2,
    "0"
  )}:${String(remaining % 60).padStart(2, "0")}`;

  useEffect(() => {
    if (!isRotating) return undefined;

    const timeout = window.setTimeout(finishRotation, 760);
    return () => window.clearTimeout(timeout);
  }, [isRotating, rotation, finishRotation]);

  // A kockatest kizárólag a saját Y tengelye körül forog.
  const rotationStyle = {
    transform: `rotateY(${rotation}deg)`,
  };

  return (
    <div className="cube-stage">
      <div className="cube-shadow" />

      <div className="cube-perspective">
        <div
          className={`cube ${isRotating ? "is-rotating" : ""}`}
          style={rotationStyle}
        >
          {/* A négy számozott oldal */}
          <Face duration={5} className="face-front" />
          <Face duration={10} className="face-right" />
          <Face duration={20} className="face-back" />
          <Face duration={30} className="face-left" />

          {/* A felső és alsó lap nem változtatja a dőlésszögét */}

          <Face className="face-top">
            <span className="top-mark">
              {topDuration}
              <small> MIN</small>
            </span>
          </Face>

          <Face className="face-bottom">
            <span className="bottom-mark">DESIGNED FOR FOCUS</span>
          </Face>
        </div>

        {/* A kijelző nem forog el a kockatesttel */}
        <div
          className="fixed-display-face"
          aria-label={`Hátralévő idő: ${display}`}
        >
          <div className="face-label">
            {topDuration} <small>MIN</small>
          </div>

          <div className="dial">
            <div className="dial-ticks" aria-hidden="true">
              {Array.from({ length: 36 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    transform: `rotate(${i * 10}deg) translateY(-83px)`,
                    opacity: i / 36 > 1 - progress ? 1 : 0.2,
                  }}
                />
              ))}
            </div>

            <div className="dial-screen">
              <span className="screen-caption">FOCUS TIMER</span>
              <strong>{display}</strong>
              <span className="screen-state">
                {remaining === 0 ? "TIME COMPLETE" : "MINUTES : SECONDS"}
              </span>
            </div>
          </div>

          <div className="face-bottom-mark">POMODORO · 01</div>
        </div>
      </div>

      <div className="cube-caption">
        <span className="caption-dot" />
        <span>AKTÍV IDŐTARTAM</span>
        <strong>{topDuration} PERC</strong>
      </div>
    </div>
  );
}
