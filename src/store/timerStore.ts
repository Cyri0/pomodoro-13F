import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TimerMode = 'focus' | 'short' | 'long'

type TimerSettings = Record<TimerMode, number>

interface TimerState {
  mode: TimerMode
  settings: TimerSettings
  remainingSeconds: number
  isRunning: boolean
  endsAt: number | null
  selectedPresetMinutes: number | null
  completedSessions: number
  focusTask: string
  message: string
  setMode: (mode: TimerMode) => void
  start: () => void
  pause: () => void
  reset: () => void
  skip: () => void
  setDuration: (mode: TimerMode, minutes: number) => void
  selectPreset: (minutes: number) => void
  setFocusTask: (task: string) => void
}

const defaultSettings: TimerSettings = { focus: 25, short: 5, long: 15 }
let ticker: ReturnType<typeof setInterval> | undefined

function stopTicker() {
  if (ticker !== undefined) {
    clearInterval(ticker)
    ticker = undefined
  }
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      mode: 'focus',
      settings: defaultSettings,
      remainingSeconds: defaultSettings.focus * 60,
      isRunning: false,
      endsAt: null,
      selectedPresetMinutes: null,
      completedSessions: 0,
      focusTask: '',
      message: '',
      setMode: (mode) => {
        stopTicker()
        set((state) => ({
          mode,
          remainingSeconds: state.settings[mode] * 60,
          isRunning: false,
          endsAt: null,
          selectedPresetMinutes: null,
          message: '',
        }))
      },
      start: () => {
        const state = get()
        if (state.isRunning) return
        const endsAt = Date.now() + state.remainingSeconds * 1000
        set({ isRunning: true, endsAt, message: '' })
        stopTicker()
        ticker = setInterval(() => {
          const current = get()
          if (current.endsAt === null) return
          const remainingSeconds = Math.max(0, Math.ceil((current.endsAt - Date.now()) / 1000))
          set({ remainingSeconds })
          if (remainingSeconds === 0) {
            stopTicker()
            const completedSessions = current.mode === 'focus'
              ? current.completedSessions + 1
              : current.completedSessions
            const nextMode: TimerMode = current.mode === 'focus'
              ? completedSessions % 4 === 0 ? 'long' : 'short'
              : 'focus'
            set((latest) => ({
              mode: nextMode,
              remainingSeconds: latest.settings[nextMode] * 60,
              isRunning: false,
              endsAt: null,
              selectedPresetMinutes: null,
              completedSessions,
              message: current.mode === 'focus'
                ? 'Focus session complete. Take a break.'
                : 'Break complete. Ready to focus again.',
            }))
          }
        }, 250)
      },
      pause: () => {
        const state = get()
        if (!state.isRunning || state.endsAt === null) return
        stopTicker()
        set({
          remainingSeconds: Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000)),
          isRunning: false,
          endsAt: null,
        })
      },
      reset: () => {
        stopTicker()
        set((state) => {
          const duration = state.selectedPresetMinutes ?? state.settings[state.mode]
          return {
            settings: { ...state.settings, [state.mode]: duration },
            remainingSeconds: duration * 60,
            isRunning: false,
            endsAt: null,
            selectedPresetMinutes: null,
            message: '',
          }
        })
      },
      skip: () => {
        stopTicker()
        set((state) => {
          const nextMode: TimerMode = state.mode === 'focus'
            ? (state.completedSessions + 1) % 4 === 0 ? 'long' : 'short'
            : 'focus'
          return {
            mode: nextMode,
            remainingSeconds: state.settings[nextMode] * 60,
            isRunning: false,
            endsAt: null,
            selectedPresetMinutes: null,
            message: `Skipped to ${nextMode === 'focus' ? 'focus' : 'your break'}.`,
          }
        })
      },
      setDuration: (mode, minutes) => {
        if (!Number.isFinite(minutes)) return
        const duration = Math.min(120, Math.max(1, Math.round(minutes)))
        set((state) => ({
          settings: { ...state.settings, [mode]: duration },
          selectedPresetMinutes: null,
          ...(state.mode === mode
            ? { remainingSeconds: duration * 60, endsAt: state.isRunning ? Date.now() + duration * 60_000 : null }
            : {}),
        }))
      },
      selectPreset: (minutes) => {
        const duration = Math.min(120, Math.max(1, Math.round(minutes)))
        set((state) => ({
          selectedPresetMinutes: duration,
          ...(!state.isRunning
            ? {
                settings: { ...state.settings, [state.mode]: duration },
                remainingSeconds: duration * 60,
                endsAt: null,
                message: '',
              }
            : {}),
        }))
      },
      setFocusTask: (focusTask) => set({ focusTask }),
    }),
    {
      name: 'tempo-pomodoro-settings',
      partialize: (state) => ({
        mode: state.mode,
        settings: state.settings,
        completedSessions: state.completedSessions,
        focusTask: state.focusTask,
      }),
      merge: (persistedState, currentState) => {
        const stored = persistedState as Partial<Pick<TimerState, 'mode' | 'settings' | 'completedSessions' | 'focusTask'>>
        const settings = { ...defaultSettings, ...stored.settings }
        const mode = stored.mode ?? currentState.mode
        return {
          ...currentState,
          ...stored,
          mode,
          settings,
          remainingSeconds: settings[mode] * 60,
          isRunning: false,
          endsAt: null,
        }
      },
    },
  ),
)