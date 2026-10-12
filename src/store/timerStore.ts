import { create } from 'zustand';

type TimerState = {
  selectedDuration: number | null;
  remainingSeconds: number | null;
  selectDuration: (duration: number) => void;
  tickDown: () => void;
};

export const useTimerStore = create<TimerState>((set) => ({
  selectedDuration: null,
  remainingSeconds: null,
  selectDuration: (duration) =>
    set({ selectedDuration: duration, remainingSeconds: duration * 60 }),
  tickDown: () =>
    set((state) => ({
      remainingSeconds:
        state.remainingSeconds === null
          ? null
          : Math.max(0, state.remainingSeconds - 1),
    })),
}));