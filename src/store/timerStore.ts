import { create } from 'zustand'

export type CubeFaceIndex = 0 | 1 | 2 | 3 | 4 | 5

const INITIAL_DURATIONS = [25, 5, 15, 50, 10, 45] as const
const INITIAL_REMAINING = INITIAL_DURATIONS[0] * 60
const TOP_FACE_ORDER: ReadonlyArray<CubeFaceIndex> = [0, 4, 5, 2]

function getTopFace(rotationZ: number): CubeFaceIndex {
  const turns = Math.round(rotationZ / 90)
  const index = ((turns % TOP_FACE_ORDER.length) + TOP_FACE_ORDER.length) % TOP_FACE_ORDER.length
  return TOP_FACE_ORDER[index]
}

type TimerStore = {
  currentFace: CubeFaceIndex
  durations: typeof INITIAL_DURATIONS
  rotationZ: number
  isRotating: boolean
  isSettling: boolean
  remainingSeconds: number
  isRunning: boolean
  deadline: number | null
  hasCompleted: boolean
  beginRotation: () => void
  updateRotation: (rotationZ: number) => void
  prepareRotation: (rotationZ: number) => void
  completeRotation: () => void
  toggleTimer: () => void
  resetTimer: () => void
  syncClock: () => void
}

function getRemainingSeconds(deadline: number): number {
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  currentFace: 0,
  durations: INITIAL_DURATIONS,
  rotationZ: 0,
  isRotating: false,
  isSettling: false,
  remainingSeconds: INITIAL_REMAINING,
  isRunning: true,
  deadline: Date.now() + INITIAL_REMAINING * 1000,
  hasCompleted: false,

  beginRotation: () => set({ isRotating: true, isSettling: false }),
  updateRotation: (rotationZ) => {
    if (!get().isRotating || get().isSettling) return
    set({ rotationZ })
  },
  prepareRotation: (rotationZ) => set({
    rotationZ: Math.round(rotationZ / 90) * 90,
    isSettling: true,
  }),
  completeRotation: () => {
    const state = get()
    if (!state.isSettling) return
    const currentFace = getTopFace(state.rotationZ)
    if (currentFace === state.currentFace) {
      set({ isRotating: false, isSettling: false })
      return
    }
    const remainingSeconds = state.durations[currentFace] * 60
    set({
      currentFace,
      remainingSeconds,
      isRunning: true,
      deadline: Date.now() + remainingSeconds * 1000,
      hasCompleted: false,
      isRotating: false,
      isSettling: false,
    })
  },
  toggleTimer: () => {
    const state = get()
    if (state.isRunning && state.deadline !== null) {
      const remainingSeconds = getRemainingSeconds(state.deadline)
      set({ remainingSeconds, isRunning: false, deadline: null, hasCompleted: remainingSeconds === 0 })
      return
    }
    if (state.remainingSeconds === 0) return
    set({ isRunning: true, deadline: Date.now() + state.remainingSeconds * 1000, hasCompleted: false })
  },
  resetTimer: () => {
    const state = get()
    const remainingSeconds = state.durations[state.currentFace] * 60
    set({ remainingSeconds, isRunning: true, deadline: Date.now() + remainingSeconds * 1000, hasCompleted: false })
  },
  syncClock: () => {
    const state = get()
    if (!state.isRunning || state.deadline === null) return
    const remainingSeconds = getRemainingSeconds(state.deadline)
    if (remainingSeconds === 0) {
      set({ remainingSeconds: 0, isRunning: false, deadline: null, hasCompleted: true })
      return
    }
    if (remainingSeconds !== state.remainingSeconds) set({ remainingSeconds })
  },
}))