import { create } from 'zustand'
import type { FaceId } from '../utils/getTopFace'

export type PomodoroMode = {
  id: FaceId
  name: string
  shortName: string
  minutes: number
  position: 'front' | 'right' | 'back' | 'left' | 'top' | 'bottom'
  category: 'focus' | 'break' | 'reset'
}

export const POMODORO_MODES: PomodoroMode[] = [
  { id: 'focus', name: 'Focus', shortName: 'Focus', minutes: 50, position: 'front', category: 'focus' },
  { id: 'short-break', name: 'Short Break', shortName: 'Short break', minutes: 5, position: 'right', category: 'break' },
  { id: 'long-break', name: 'Long Break', shortName: 'Long break', minutes: 15, position: 'back', category: 'break' },
  { id: 'reset', name: 'Reset', shortName: 'Reset', minutes: 1, position: 'left', category: 'reset' },
  { id: 'deep-work', name: 'Deep Work', shortName: 'Deep work', minutes: 25, position: 'top', category: 'focus' },
  { id: 'custom', name: 'Custom', shortName: 'Custom', minutes: 10, position: 'bottom', category: 'reset' },
]

export type TimerState = {
  remainingSeconds: number
  isRunning: boolean
  isComplete: boolean
}

type PomodoroState = {
  activeMode: FaceId
  timers: Record<FaceId, TimerState>
  setActiveMode: (modeId: FaceId) => void
  toggleActiveTimer: () => void
  resetActiveTimer: () => void
  tick: () => void
}

const initialTimers = Object.fromEntries(
  POMODORO_MODES.map((mode) => [
    mode.id,
    { remainingSeconds: mode.minutes * 60, isRunning: false, isComplete: false },
  ]),
) as Record<FaceId, TimerState>

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  activeMode: 'focus',
  timers: initialTimers,

  setActiveMode: (modeId) => {
    set((state) => {
      if (state.activeMode === modeId) return state

      const previousMode = POMODORO_MODES.find((mode) => mode.id === state.activeMode)
      if (!previousMode) {
        throw new Error(`Unknown active Pomodoro mode: ${state.activeMode}`)
      }

      const selectedTimer = state.timers[modeId]
      const shouldRun = selectedTimer.remainingSeconds > 0 && !selectedTimer.isComplete

      return {
        activeMode: modeId,
        timers: Object.fromEntries(
          POMODORO_MODES.map((mode) => [
            mode.id,
            mode.id === state.activeMode
              ? {
                  remainingSeconds: previousMode.minutes * 60,
                  isRunning: false,
                  isComplete: false,
                }
              : {
                  ...state.timers[mode.id],
                  isRunning: mode.id === modeId && shouldRun,
                },
          ]),
        ) as Record<FaceId, TimerState>,
      }
    })
  },

  toggleActiveTimer: () => {
    set((state) => {
      const activeTimer = state.timers[state.activeMode]
      const shouldRun = !activeTimer.isRunning && activeTimer.remainingSeconds > 0 && !activeTimer.isComplete

      return {
        timers: {
          ...state.timers,
          [state.activeMode]: { ...activeTimer, isRunning: shouldRun },
        },
      }
    })
  },

  resetActiveTimer: () => {
    const activeMode = get().activeMode
    const mode = POMODORO_MODES.find((item) => item.id === activeMode)

    if (!mode) {
      throw new Error(`Unknown Pomodoro mode: ${activeMode}`)
    }

    set((state) => ({
      timers: {
        ...state.timers,
        [activeMode]: {
          remainingSeconds: mode.minutes * 60,
          isRunning: false,
          isComplete: false,
        },
      },
    }))
  },

  tick: () => {
    set((state) => {
      const activeTimer = state.timers[state.activeMode]

      if (!activeTimer.isRunning) return state

      const remainingSeconds = Math.max(0, activeTimer.remainingSeconds - 1)
      const isComplete = remainingSeconds === 0

      return {
        timers: {
          ...state.timers,
          [state.activeMode]: {
            remainingSeconds,
            isRunning: !isComplete,
            isComplete,
          },
        },
      }
    })
  },
}))
