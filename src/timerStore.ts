import { create } from 'zustand'

export const sessions = [
  { id: 'focus', name: 'Focus', minutes: 25, note: 'Deep work, no distractions' },
  { id: 'short-break', name: 'Short break', minutes: 5, note: 'Step away for a moment' },
  { id: 'long-break', name: 'Pause', minutes: null, note: 'Timer paused. Take a moment.' },
  { id: 'deep-work', name: 'Deep work', minutes: 50, note: 'Settle into the hard thing' },
  { id: 'reset', name: 'Reset', minutes: 10, note: 'Breathe, stretch, begin again' },
  { id: 'sprint', name: 'Quick sprint', minutes: 15, note: 'One small thing, all in' },
] as const

export type Session = (typeof sessions)[number]
export type SessionId = Session['id']

type TimerState = {
  selectedId: SessionId
  remainingSeconds: number | null
  isRunning: boolean
  rotationX: number
  rotationY: number
  setRotation: (x: number, y: number) => void
  snapToFace: () => void
  tick: () => void
}

const initialSession = sessions[0]

const uprightRotations: Record<SessionId, [number, number]> = {
  focus: [0, 0],
  'short-break': [0, -90],
  'long-break': [0, 180],
  'deep-work': [0, 90],
  reset: [-90, 0],
  sprint: [90, 0],
}

const faceNormals: Record<SessionId, [number, number, number]> = {
  focus: [0, 0, 1],
  'short-break': [1, 0, 0],
  'long-break': [0, 0, -1],
  'deep-work': [-1, 0, 0],
  reset: [0, -1, 0],
  sprint: [0, 1, 0],
}

const nearestTurn = (target: number, current: number) => target + 360 * Math.round((current - target) / 360)

export const useTimerStore = create<TimerState>((set) => ({
  selectedId: initialSession.id,
  remainingSeconds: initialSession.minutes * 60,
  isRunning: false,
  rotationX: -14,
  rotationY: -18,
  setRotation: (rotationX, rotationY) => set({ rotationX, rotationY }),
  snapToFace: () => set((state) => {
    const rotationX = Math.round(state.rotationX / 90) * 90
    const rotationY = Math.round(state.rotationY / 90) * 90
    const radiansX = rotationX * Math.PI / 180
    const radiansY = rotationY * Math.PI / 180
    const frontFace = sessions.reduce((front, session) => {
      const [x, y, z] = faceNormals[session.id]
      const rotatedZBeforeX = -x * Math.sin(radiansY) + z * Math.cos(radiansY)
      const rotatedZ = y * Math.sin(radiansX) + rotatedZBeforeX * Math.cos(radiansX)
      return rotatedZ > front.depth ? { id: session.id, depth: rotatedZ } : front
    }, { id: 'focus' as SessionId, depth: -Infinity })
    const session = sessions.find((item) => item.id === frontFace.id) ?? initialSession
    const [uprightX, uprightY] = uprightRotations[session.id]

    return {
      rotationX: nearestTurn(uprightX, state.rotationX),
      rotationY: nearestTurn(uprightY, state.rotationY),
      selectedId: session.id,
      remainingSeconds: session.minutes === null ? null : session.minutes * 60,
      isRunning: session.minutes !== null,
    }
  }),
  tick: () => set((state) => {
    if (!state.isRunning || state.remainingSeconds === null) return state
    const remainingSeconds = Math.max(0, state.remainingSeconds - 1)
    return { remainingSeconds, isRunning: remainingSeconds > 0 }
  }),
}))