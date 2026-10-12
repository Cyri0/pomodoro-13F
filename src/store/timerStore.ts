import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak'

export interface FocusTask {
  id: string
  title: string
  completed: boolean
}

type Durations = Record<TimerMode, number>

interface TimerState {
  mode: TimerMode
  remainingSeconds: number
  isRunning: boolean
  endsAt: number | null
  completedSessions: number
  sessionDay: string
  durations: Durations
  tasks: FocusTask[]
  tick: () => void
  toggleTimer: () => void
  resetTimer: () => void
  setMode: (mode: TimerMode) => void
  selectFocusDuration: (minutes: number) => void
  skipMode: () => void
  setModeDuration: (mode: TimerMode, minutes: number) => void
  addTask: (title: string) => void
  toggleTask: (id: string) => void
  removeTask: (id: string) => void
}

const initialDurations: Durations = { focus: 25, shortBreak: 5, longBreak: 15 }
const durationInSeconds = (mode: TimerMode, durations: Durations) => durations[mode] * 60
const localDayKey = () => {
  const date = new Date()
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export const useTimerStore = create<TimerState>()(persist((set, get) => ({
  mode: 'focus',
  remainingSeconds: 25 * 60,
  isRunning: false,
  endsAt: null,
  completedSessions: 0,
  sessionDay: localDayKey(),
  durations: initialDurations,
  tasks: [],

  tick: () => {
    let state = get()
    const today = localDayKey()
    if (state.sessionDay !== today) {
      set({ sessionDay: today, completedSessions: 0 })
      state = get()
    }
    if (!state.isRunning || state.endsAt === null) return
    const secondsLeft = Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000))
    if (secondsLeft > 0) {
      if (secondsLeft !== state.remainingSeconds) set({ remainingSeconds: secondsLeft })
      return
    }

    const completedSessions = state.mode === 'focus' ? state.completedSessions + 1 : state.completedSessions
    const nextMode: TimerMode = state.mode === 'focus'
      ? completedSessions % 4 === 0 ? 'longBreak' : 'shortBreak'
      : 'focus'
    set({
      mode: nextMode,
      remainingSeconds: durationInSeconds(nextMode, state.durations),
      isRunning: false,
      endsAt: null,
      completedSessions,
    })
  },

  toggleTimer: () => {
    const state = get()
    if (state.isRunning) {
      const remainingSeconds = state.endsAt === null
        ? state.remainingSeconds
        : Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000))
      if (remainingSeconds === 0) {
        state.tick()
        return
      }
      set({ isRunning: false, endsAt: null, remainingSeconds })
      return
    }
    set({ isRunning: true, endsAt: Date.now() + state.remainingSeconds * 1000 })
  },

  resetTimer: () => {
    const { mode, durations } = get()
    set({ remainingSeconds: durationInSeconds(mode, durations), isRunning: false, endsAt: null })
  },

  setMode: (mode) => {
    const { durations } = get()
    set({ mode, remainingSeconds: durationInSeconds(mode, durations), isRunning: false, endsAt: null })
  },

  selectFocusDuration: (minutes) => {
    const state = get()
    const focusMinutes = Math.min(90, Math.max(1, Math.round(minutes)))
    if (state.mode === 'focus' && state.durations.focus === focusMinutes && state.isRunning) return
    const durations = { ...state.durations, focus: focusMinutes }
    const remainingSeconds = focusMinutes * 60
    const today = localDayKey()
    set({
      mode: 'focus',
      durations,
      remainingSeconds,
      isRunning: true,
      endsAt: Date.now() + remainingSeconds * 1000,
      sessionDay: today,
      completedSessions: state.sessionDay === today ? state.completedSessions : 0,
    })
  },

  skipMode: () => {
    const state = get()
    const nextMode: TimerMode = state.mode === 'focus' ? 'shortBreak' : 'focus'
    set({ mode: nextMode, remainingSeconds: durationInSeconds(nextMode, state.durations), isRunning: false, endsAt: null })
  },

  setModeDuration: (mode, minutes) => {
    if (!Number.isFinite(minutes)) return
    const safeMinutes = Math.min(90, Math.max(1, Math.round(minutes)))
    const durations = { ...get().durations, [mode]: safeMinutes }
    const update = get().mode === mode && !get().isRunning
      ? { durations, remainingSeconds: durationInSeconds(mode, durations) }
      : { durations }
    set(update)
  },

  addTask: (title) => set((state) => ({
    tasks: [...state.tasks, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title, completed: false }],
  })),

  toggleTask: (id) => set((state) => ({
    tasks: state.tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task),
  })),

  removeTask: (id) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),
}), { name: 'stilltime-pomodoro' }))