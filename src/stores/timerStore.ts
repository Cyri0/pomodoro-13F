import { create } from 'zustand'
import { MODES, type Mode } from '../constants'

type TimerStore = {
  mode: Mode
  secondsLeft: number
  customDuration: number | null
  isRunning: boolean
  completedSessions: number
  notice: string
  deadline: number | null
  setNotice: (notice: string) => void
  selectDuration: (minutes: number) => void
  selectMode: (mode: Mode) => void
  toggleTimer: () => void
  resetTimer: () => void
  skipSession: () => void
  tick: () => void
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  mode: 'focus',
  secondsLeft: MODES.focus.duration,
  customDuration: null,
  isRunning: false,
  completedSessions: 0,
  notice: 'Fordítsd el a kockát az idő beállításához.',
  deadline: null,
  setNotice: (notice) => set({ notice }),
  selectDuration: (minutes) => {
    const { mode } = get()
    const seconds = minutes * 60
    set({
      isRunning: false,
      deadline: null,
      customDuration: seconds,
      secondsLeft: seconds,
      notice: `${minutes} perc ${mode === 'focus' ? 'fókuszidő' : 'szünet'} kiválasztva.`,
    })
  },
  selectMode: (mode) => set({
    isRunning: false,
    deadline: null,
    mode,
    customDuration: null,
    secondsLeft: MODES[mode].duration,
    notice: `${MODES[mode].label} kiválasztva.`,
  }),
  toggleTimer: () => {
    const state = get()
    if (state.isRunning) {
      const remaining = state.deadline
        ? Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000))
        : state.secondsLeft
      set({
        isRunning: false,
        deadline: null,
        secondsLeft: remaining,
        notice: 'Az időzítő szünetel.',
      })
      return
    }

    const duration = state.customDuration ?? MODES[state.mode].duration
    const remaining = state.secondsLeft === 0 ? duration : state.secondsLeft
    set({
      isRunning: true,
      deadline: Date.now() + remaining * 1000,
      secondsLeft: remaining,
      notice: 'Elindult az időzítő. Menni fog!',
    })
  },
  resetTimer: () => {
    const { mode, customDuration } = get()
    set({
      isRunning: false,
      deadline: null,
      secondsLeft: customDuration ?? MODES[mode].duration,
      notice: 'Az időzítő újraindítva.',
    })
  },
  skipSession: () => {
    const nextMode = get().mode === 'focus' ? 'shortBreak' : 'focus'
    get().selectMode(nextMode)
  },
  tick: () => {
    const { deadline, mode, completedSessions } = get()
    if (deadline === null) return

    const secondsLeft = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
    if (secondsLeft > 0) {
      set({ secondsLeft })
      return
    }

    if (mode === 'focus') {
      const finishedCount = completedSessions + 1
      const nextMode: Mode = finishedCount % 4 === 0 ? 'longBreak' : 'shortBreak'
      set({
        isRunning: false,
        deadline: null,
        customDuration: null,
        completedSessions: finishedCount,
        mode: nextMode,
        secondsLeft: MODES[nextMode].duration,
        notice: `A fókuszidő lejárt. Következik: ${MODES[nextMode].label.toLowerCase()}.`,
      })
      return
    }

    set({
      isRunning: false,
      deadline: null,
      customDuration: null,
      mode: 'focus',
      secondsLeft: MODES.focus.duration,
      notice: 'A szünet véget ért. Jöhet egy újabb fókuszidő?',
    })
  },
}))
