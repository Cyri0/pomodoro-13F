import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { create } from 'zustand'

const sessions = [
  { id: 'focus', name: 'Focus', minutes: 25, note: 'Deep work, no distractions' },
  { id: 'short-break', name: 'Short break', minutes: 5, note: 'Step away for a moment' },
  { id: 'long-break', name: 'Pause', minutes: null, note: 'Timer paused. Take a moment.' },
  { id: 'deep-work', name: 'Deep work', minutes: 50, note: 'Settle into the hard thing' },
  { id: 'reset', name: 'Reset', minutes: 10, note: 'Breathe, stretch, begin again' },
  { id: 'sprint', name: 'Quick sprint', minutes: 15, note: 'One small thing, all in' },
] as const

type SessionId = (typeof sessions)[number]['id']
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

const useTimerStore = create<TimerState>((set) => ({
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
    const faceNormals: Record<SessionId, [number, number, number]> = {
      focus: [0, 0, 1],
      'short-break': [1, 0, 0],
      'long-break': [0, 0, -1],
      'deep-work': [-1, 0, 0],
      reset: [0, -1, 0],
      sprint: [0, 1, 0],
    }
    const frontFace = sessions.reduce((front, session) => {
      const [x, y, z] = faceNormals[session.id]
      const rotatedZBeforeX = -x * Math.sin(radiansY) + z * Math.cos(radiansY)
      const rotatedZ = y * Math.sin(radiansX) + rotatedZBeforeX * Math.cos(radiansX)
      return rotatedZ > front.depth ? { id: session.id, depth: rotatedZ } : front
    }, { id: 'focus' as SessionId, depth: -Infinity })
    const session = sessions.find((item) => item.id === frontFace.id) ?? initialSession
    const uprightRotations: Record<SessionId, [number, number]> = {
      focus: [0, 0],
      'short-break': [0, -90],
      'long-break': [0, 180],
      'deep-work': [0, 90],
      reset: [-90, 0],
      sprint: [90, 0],
    }
    const [uprightX, uprightY] = uprightRotations[session.id]
    const nearestTurn = (target: number, current: number) => target + 360 * Math.round((current - target) / 360)
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

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remainder = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainder}`
}

const App = () => {
  const { selectedId, remainingSeconds, isRunning, rotationX, rotationY, setRotation, snapToFace, tick } = useTimerStore()
  const dragOrigin = useRef<{ x: number; y: number; rotationX: number; rotationY: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (!isRunning) return
    const interval = window.setInterval(tick, 1000)
    return () => window.clearInterval(interval)
  }, [isRunning, tick])

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    dragOrigin.current = { x: event.clientX, y: event.clientY, rotationX, rotationY }
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsDragging(true)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragOrigin.current) return
    const deltaX = event.clientX - dragOrigin.current.x
    const deltaY = event.clientY - dragOrigin.current.y
    setRotation(dragOrigin.current.rotationX - deltaY, dragOrigin.current.rotationY + deltaX)
  }

  const finishDrag = () => {
    if (!dragOrigin.current) return
    dragOrigin.current = null
    setIsDragging(false)
    snapToFace()
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    finishDrag()
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <main className="timer-app">
      <div
        className={`scene${isDragging ? ' is-dragging' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onLostPointerCapture={finishDrag}
      >
        <div className="cube-shadow" />
        <div
          className="cube"
          style={{ transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)` }}
          role="group"
          aria-label="Drag to choose a timer"
        >
          {sessions.map((session, index) => {
            const faceTime = session.id === selectedId
              ? remainingSeconds
              : session.minutes === null ? null : session.minutes * 60
            return (
              <div
                key={session.id}
                className={`cube-face face-${session.id}`}
                style={{ '--face-index': index + 1 } as CSSProperties}
                aria-label={session.minutes === null ? `${session.name}, timer paused` : `${session.name}, ${session.minutes} minutes`}
              >
                <span className="face-index">0{index + 1} <span>/</span> {session.minutes === null ? 'PAUSE' : 'TIMER'}</span>
                <div className="face-copy">
                  <span className="face-name">{session.name}</span>
                  {session.minutes !== null && faceTime !== null && (
                    <span className="face-time" aria-live={session.id === selectedId ? 'polite' : undefined}>
                      {formatTime(faceTime)}
                    </span>
                  )}
                  <span className="face-note">{session.note}</span>
                </div>
                <span className="face-mark" aria-hidden="true">✳</span>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}

export default App