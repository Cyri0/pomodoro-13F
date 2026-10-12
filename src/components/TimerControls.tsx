import { timerPresets, useTimerStore, type TimerSide } from "./timerStore";

const sides: TimerSide[] = ["top", "left", "bottom", "right"];

export const TimerControls = () => {
  const selectedSide = useTimerStore((state) => state.selectedSide);
  const selectSide = useTimerStore((state) => state.selectSide);

  return (
    <div className="controls" aria-label="Időtartam kiválasztása">
      {sides.map((side) => (
        <button
          aria-pressed={selectedSide === side}
          className={`btn${selectedSide === side ? " is-selected" : ""}`}
          key={side}
          onClick={() => selectSide(side)}
          type="button"
        >
          {timerPresets[side]} perc
        </button>
      ))}
    </div>
  );
};