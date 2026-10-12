import { useEffect, useRef, useState, type PointerEvent } from 'react';
import styles from './Cube.module.css';
import { useTimerStore } from '../store/timerStore';

const faces = [
  { duration: 30, className: styles.harminc },
  { duration: 60, className: styles.hatvan },
  { duration: 10, className: styles.tiz },
  { duration: 20, className: styles.husz },
  { duration: 5, className: styles.ot },
  { duration: 45, className: styles.negyvenot },
];

type DragStart = {
  pointerId: number;
  x: number;
  y: number;
  rotationX: number;
  rotationY: number;
};



const Cube = () => {
  const selectedDuration = useTimerStore((state) => state.selectedDuration);
  const remainingSeconds = useTimerStore((state) => state.remainingSeconds);
  const selectDuration = useTimerStore((state) => state.selectDuration);
  const [rotation, setRotation] = useState({ x: -180, y: 15 });
  const dragStart = useRef<DragStart | null>(null);
  const dragged = useRef(false);

  useEffect(() => {
    if (selectedDuration === null) return;

    const intervalId = window.setInterval(() => {
      const timer = useTimerStore.getState();
      if (timer.remainingSeconds === null || timer.remainingSeconds <= 0) {
        window.clearInterval(intervalId);
        return;
      }

      timer.tickDown();
      if (useTimerStore.getState().remainingSeconds === 0) {
        window.clearInterval(intervalId);
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [selectedDuration]);

  useEffect(() => {
    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const start = dragStart.current;
      if (!start || event.pointerId !== start.pointerId) return;

      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;
      if (Math.abs(deltaX) + Math.abs(deltaY) > 4) dragged.current = true;

      setRotation({
        x: start.rotationX + deltaY * 0.5,
        y: start.rotationY - deltaX * 0.5,
      });
    };

    const stopDragging = (event: globalThis.PointerEvent) => {
      if (dragStart.current?.pointerId === event.pointerId) {
        dragStart.current = null;
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDragging);
      window.removeEventListener('pointercancel', stopDragging);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remaining = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remaining}`;
  };

  const faceLabel = (duration: number) =>
    selectedDuration === duration && remainingSeconds !== null
      ? formatTime(remainingSeconds)
      : duration;

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    dragged.current = false;
    dragStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      rotationX: rotation.x,
      rotationY: rotation.y,
    };
  };



  return (
    <div
      className={styles.cube}
      onPointerDown={handlePointerDown}
      style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(15deg)` }}
    >
      {faces.map(({ duration, className }) => (
        <button
          key={duration}
          type="button"
          aria-label={`${duration} perces időzítő indítása`}
          className={`${styles.side} ${className} ${selectedDuration === duration ? styles.active : ''}`}
          onClick={() => {
            if (dragged.current) return;
            selectDuration(duration);
          }}
        >
          {faceLabel(duration)}
        </button>
      ))}
    </div>
  );
}

export default Cube