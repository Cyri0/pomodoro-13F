import { create } from "zustand";

export type TimerSide = "left" | "right" | "top" | "bottom";

export const timerPresets: Record<TimerSide, number> = {
  left: 10,
  right: 60,
  top: 5,
  bottom: 30,
};

type TimerState = {
  selectedSide: TimerSide;
  secondsRemaining: number;
  isRunning: boolean;
  selectSide: (side: TimerSide) => void;
  tick: () => void;
};

export const useTimerStore = create<TimerState>((set) => ({
  selectedSide: "top",
  secondsRemaining: timerPresets.top * 60,
  isRunning: true,
  selectSide: (side) =>
    set({
      selectedSide: side,
      secondsRemaining: timerPresets[side] * 60,
      isRunning: true,
    }),
  tick: () =>
    set((state) => {
      if (state.secondsRemaining <= 1) {
        return { secondsRemaining: 0, isRunning: false };
      }

      return { secondsRemaining: state.secondsRemaining - 1 };
    }),
}));