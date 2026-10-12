import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { timerPresets, useTimerStore, type TimerSide } from "./timerStore";

const sidesAtTop: TimerSide[] = ["top", "left", "bottom", "right"];

const sideAtTop = (angle: number) => {
  const quarterTurns = Math.round(angle / 90);
  const sideIndex = ((quarterTurns % sidesAtTop.length) + sidesAtTop.length) % sidesAtTop.length;

  return sidesAtTop[sideIndex];
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
};

export const TimerCube = () => {
  const secondsRemaining = useTimerStore((state) => state.secondsRemaining);
  const isRunning = useTimerStore((state) => state.isRunning);
  const selectSide = useTimerStore((state) => state.selectSide);
  const [rotationZ, setRotationZ] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ pointerId: number; x: number; angle: number } | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = window.setInterval(() => {
      useTimerStore.getState().tick();
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      angle: rotationZ,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    if (!start || start.pointerId !== event.pointerId) return;

    setRotationZ(start.angle + (event.clientX - start.x) * 0.5);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    if (!start || start.pointerId !== event.pointerId) return;

    const angle = start.angle + (event.clientX - start.x) * 0.5;
    const snappedAngle = Math.round(angle / 90) * 90;
    setRotationZ(snappedAngle);
    selectSide(sideAtTop(snappedAngle));
    dragStart.current = null;
    setIsDragging(false);
  };

  const handlePointerCancel = () => {
    dragStart.current = null;
    setIsDragging(false);
  };

  return (
    <div
      aria-label="Húzd az egeret balra vagy jobbra a kocka forgatásához"
      className={`container${isDragging ? " is-dragging" : ""}`}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="group"
    >
      <div
        className="cube"
        style={{ transform: `rotateX(-30deg) rotateY(30deg) rotateZ(${rotationZ}deg)` }}
      >
        <div className="face front" aria-live="off">
          <span
            className="timer-label"
            style={{ transform: `rotateZ(${-rotationZ}deg) rotateY(-30deg) rotateX(30deg)` }}
          >
            {formatTime(secondsRemaining)}
          </span>
        </div>
        <div className="face top">{timerPresets.top}</div>
        <div className="face right">{timerPresets.right}</div>
        <div className="face left">{timerPresets.left}</div>
        <div className="face bottom">{timerPresets.bottom}</div>
      </div>
    </div>
  );
};