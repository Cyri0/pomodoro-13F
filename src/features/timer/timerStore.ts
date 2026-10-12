import { create } from 'zustand'
import { sessions } from './sessions'
import type { Session } from './sessions'

type TimerStore = {
  selectedId: Session['id']
  remaining: number
  isRunning: boolean
  selectSession: (session: Session) => void
  toggle: () => void
  tick: () => void
}

export const useTimerStore = create<TimerStore>((set) => ({
  selectedId: sessions[0].id,
  remaining: sessions[0].minutes * 60,
  isRunning: false,
  selectSession: (session) => set({
    selectedId: session.id,
    remaining: session.minutes * 60,
    isRunning: false,
  }),
  toggle: () => set((state) => {
    const session = sessions.find((item) => item.id === state.selectedId)

    return {
      remaining: state.remaining === 0 && session
        ? session.minutes * 60
        : state.remaining,
      isRunning: !state.isRunning,
    }
  }),
  tick: () => set((state) => {
    if (!state.isRunning) return state
    if (state.remaining <= 1) return { remaining: 0, isRunning: false }

    return { remaining: state.remaining - 1 }
  }),
}))
