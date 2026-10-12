import { create } from 'zustand'

export type TimerInterval = {
  id: string
  label: string
  shortLabel: string
  seconds: number
}

export const timerIntervals: TimerInterval[] = [
  { id: '10s', label: '10 seconds', shortLabel: '10 sec', seconds: 10 },
  { id: '30s', label: '30 seconds', shortLabel: '30 sec', seconds: 30 },
  { id: '1m', label: '1 minute', shortLabel: '1 min', seconds: 60 },
  { id: '5m', label: '5 minutes', shortLabel: '5 min', seconds: 300 },
]

type TimerStatus = 'ready' | 'running' | 'paused' | 'finished'

type TimerState = {
  selectedId: string
  rotationStep: number
  remaining: number
  deadline: number | null
  status: TimerStatus
  selectInterval: (interval: TimerInterval) => void
  rollCube: (direction: 1 | -1) => void
  toggleTimer: () => void
  resetTimer: () => void
  tick: () => void
}

export const useTimerStore = create<TimerState>((set, get) => ({
  selectedId: timerIntervals[0].id,
  rotationStep: 0,
  remaining: timerIntervals[0].seconds,
  deadline: null,
  status: 'ready',
  selectInterval: (interval) => {
    const { selectedId, rotationStep } = get()
    const currentIndex = timerIntervals.findIndex(({ id }) => id === selectedId)
    const nextIndex = timerIntervals.findIndex(({ id }) => id === interval.id)
    const count = timerIntervals.length
    let rotationDelta = (nextIndex - currentIndex + count) % count
    if (rotationDelta > count / 2) rotationDelta -= count

    set({
      selectedId: interval.id,
      rotationStep: rotationStep + rotationDelta,
      remaining: interval.seconds,
      deadline: Date.now() + interval.seconds * 1000,
      status: 'running',
    })
  },
  rollCube: (direction) => {
    const { selectedId, rotationStep } = get()
    const currentIndex = timerIntervals.findIndex(({ id }) => id === selectedId)
    const nextIndex = (currentIndex + direction + timerIntervals.length) % timerIntervals.length
    const interval = timerIntervals[nextIndex]
    set({
      selectedId: interval.id,
      rotationStep: rotationStep + direction,
      remaining: interval.seconds,
      deadline: Date.now() + interval.seconds * 1000,
      status: 'running',
    })
  },
  toggleTimer: () => {
    const { status, remaining, selectedId } = get()
    if (status === 'running') {
      set({ status: 'paused', deadline: null })
      return
    }
    if (status === 'finished') {
      const interval = timerIntervals.find(({ id }) => id === selectedId) ?? timerIntervals[0]
      set({
        remaining: interval.seconds,
        deadline: Date.now() + interval.seconds * 1000,
        status: 'running',
      })
      return
    }
    set({ status: 'running', deadline: Date.now() + remaining * 1000 })
  },
  resetTimer: () => {
    const interval = timerIntervals.find(({ id }) => id === get().selectedId) ?? timerIntervals[0]
    set({ remaining: interval.seconds, deadline: null, status: 'ready' })
  },
  tick: () => {
    const { deadline, status } = get()
    if (status !== 'running' || deadline === null) return
    const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
    set({
      remaining,
      status: remaining === 0 ? 'finished' : 'running',
      deadline: remaining === 0 ? null : deadline,
    })
  },
}))
