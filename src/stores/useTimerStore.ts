import { create } from 'zustand';
import { INITIAL_BOTTOM, INITIAL_TOP, OPPOSITE_DURATION } from '../utils/cubeConfig';

const durationSeconds = (minutes) => minutes * 60;

export const useTimerStore = create((set, get) => ({
  rotation: 0,
  topDuration: INITIAL_TOP,
  bottomDuration: INITIAL_BOTTOM,
  remainingSeconds: durationSeconds(INITIAL_TOP),
  timerStatus: 'idle', // idle | running | paused | finished
  isRotating: false,
  startedAt: null,
  endsAt: null,
  pausedRemaining: null,

  rotateCube: () => {
    const state = get();
    if (state.isRotating) return false;
    // Rotation selects the next face; timer is reset and never auto-starts.
    const cycle = [20, 10, 5, 30];
    const currentIndex = cycle.indexOf(state.topDuration);
    const nextTop = cycle[(currentIndex + 1) % cycle.length];
    const nextBottom = OPPOSITE_DURATION[nextTop];
    set({
      isRotating: true,
      rotation: state.rotation + 90,
      bottomDuration: nextBottom,
      topDuration: nextTop,
      remainingSeconds: durationSeconds(nextTop),
      timerStatus: 'idle',
      startedAt: null,
      endsAt: null,
      pausedRemaining: null,
    });
    return true;
  },

  finishRotation: () => set({ isRotating: false }),

  setOrientation: (rotation) => set({ rotation }),

  startTimer: () => {
    const state = get();
    if (state.timerStatus === 'running' || state.isRotating || state.timerStatus === 'finished') return;
    const remaining = state.timerStatus === 'paused' && state.pausedRemaining != null
      ? state.pausedRemaining
      : state.remainingSeconds;
    const now = Date.now();
    set({
      timerStatus: 'running',
      remainingSeconds: remaining,
      startedAt: now,
      endsAt: now + remaining * 1000,
      pausedRemaining: null,
    });
  },

  pauseTimer: () => {
    const state = get();
    if (state.timerStatus !== 'running') return;
    const remaining = Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000));
    set({
      timerStatus: remaining === 0 ? 'finished' : 'paused',
      remainingSeconds: remaining,
      pausedRemaining: remaining,
      startedAt: null,
      endsAt: null,
    });
  },

  resumeTimer: () => get().startTimer(),

  resetTimer: () => {
    const { topDuration } = get();
    set({
      remainingSeconds: durationSeconds(topDuration),
      timerStatus: 'idle',
      startedAt: null,
      endsAt: null,
      pausedRemaining: null,
    });
  },

  tick: () => {
    const state = get();
    if (state.timerStatus !== 'running' || state.endsAt == null) return;
    const remaining = Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000));
    if (remaining === 0) {
      set({
        remainingSeconds: 0,
        timerStatus: 'finished',
        startedAt: null,
        endsAt: null,
        pausedRemaining: null,
      });
    } else if (remaining !== state.remainingSeconds) {
      set({ remainingSeconds: remaining });
    }
  },

  finishTimer: () => set({
    remainingSeconds: 0,
    timerStatus: 'finished',
    startedAt: null,
    endsAt: null,
    pausedRemaining: null,
  }),
}));
