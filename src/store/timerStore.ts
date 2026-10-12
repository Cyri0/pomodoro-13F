import { create } from 'zustand'
import type { FaceId, TimerFace } from '../types/timer'

type TimerStore = {
  faces: TimerFace[]
  activeFace: FaceId
  isRunning: boolean
  selectFace: (id: FaceId) => void
  toggleRunning: () => void
  reset: () => void
  adjustTime: (amount: number) => void
  tick: () => void
}

const initialFaces: TimerFace[] = [
  { id: 'focus', name: 'Focus', detail: 'One thing at a time', duration: 25 * 60, remaining: 25 * 60, tint: '#f07c43' },
  { id: 'short', name: 'Short break', detail: 'Step away a little', duration: 5 * 60, remaining: 5 * 60, tint: '#63a88b' },
  { id: 'long', name: 'Long break', detail: 'Make room to reset', duration: 15 * 60, remaining: 15 * 60, tint: '#5a9eaa' },
  { id: 'deep', name: 'Deep work', detail: 'Settle into the hard part', duration: 50 * 60, remaining: 50 * 60, tint: '#dcaa4a' },
  { id: 'admin', name: 'Quick task', detail: 'Clear the small stuff', duration: 10 * 60, remaining: 10 * 60, tint: '#d97968' },
  { id: 'read', name: 'Reading', detail: 'Follow the thread', duration: 30 * 60, remaining: 30 * 60, tint: '#9a87b6' },
]

export const facePositions: Record<FaceId, { x: number; y: number }> = {
  focus: { x: 0, y: 0 },
  short: { x: 90, y: 0 },
  long: { x: 0, y: -180 },
  deep: { x: -90, y: 0 },
  admin: { x: 0, y: -90 },
  read: { x: 0, y: 90 },
}

export const useTimerStore = create<TimerStore>((set) => ({
  faces: initialFaces,
  activeFace: 'focus',
  isRunning: false,
  selectFace: (id) => set({ activeFace: id, isRunning: false }),
  toggleRunning: () => set((state) => {
    const active = state.faces.find((face) => face.id === state.activeFace)
    if (!active) return state
    if (active.remaining === 0) {
      return {
        isRunning: true,
        faces: state.faces.map((face) => face.id === state.activeFace ? { ...face, remaining: face.duration } : face),
      }
    }
    return { isRunning: !state.isRunning }
  }),
  reset: () => set((state) => ({
    isRunning: false,
    faces: state.faces.map((face) => face.id === state.activeFace ? { ...face, remaining: face.duration } : face),
  })),
  adjustTime: (amount) => set((state) => ({
    isRunning: false,
    faces: state.faces.map((face) => face.id === state.activeFace
      ? { ...face, duration: Math.max(60, face.duration + amount), remaining: Math.max(60, face.remaining + amount) }
      : face),
  })),
  tick: () => set((state) => {
    if (!state.isRunning) return state
    const active = state.faces.find((face) => face.id === state.activeFace)
    if (!active || active.remaining <= 1) {
      return {
        isRunning: false,
        faces: state.faces.map((face) => face.id === state.activeFace ? { ...face, remaining: 0 } : face),
      }
    }
    return {
      faces: state.faces.map((face) => face.id === state.activeFace ? { ...face, remaining: face.remaining - 1 } : face),
    }
  }),
}))
