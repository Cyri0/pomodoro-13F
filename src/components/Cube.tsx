import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useTimerStore } from '../features/timer/timerStore'
import { formatTime, sessions } from '../features/timer/sessions'

const cubeFaces = [
  { className: 'cube-top', sessionIndex: 0 },
  { className: 'cube-right', sessionIndex: 1 },
  { className: 'cube-bottom', sessionIndex: 2 },
  { className: 'cube-left', sessionIndex: 3 },
]

const faceRotations = [0, -90, -180, -270]

type RotationDirection = -1 | 1
type CubeDrag = {
  pointerId: number
  startX: number
  startY: number
  rotation: number
}

function sessionAtTop(rotation: number) {
  return ((Math.round(-rotation / 90) % sessions.length) + sessions.length) % sessions.length
}

function nearestAngle(current: number, target: number) {
  return current + ((((target - current) % 360) + 540) % 360) - 180
}

export function Cube() {
  const selectedId = useTimerStore((state) => state.selectedId)
  const remaining = useTimerStore((state) => state.remaining)
  const isRunning = useTimerStore((state) => state.isRunning)
  const selectSession = useTimerStore((state) => state.selectSession)
  const toggle = useTimerStore((state) => state.toggle)
  const [rotation, setRotation] = useState(faceRotations[0])
  const [isDragging, setIsDragging] = useState(false)
  const cubeDrag = useRef<CubeDrag | null>(null)

  function startCubeDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return

    event.currentTarget.setPointerCapture(event.pointerId)
    cubeDrag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      rotation,
    }
    setIsDragging(true)
  }

  function moveCube(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = cubeDrag.current
    if (!drag || drag.pointerId !== event.pointerId) return

    setRotation(drag.rotation + (event.clientX - drag.startX) * 0.8)
  }

  function finishCubeDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = cubeDrag.current
    if (!drag || drag.pointerId !== event.pointerId) return

    cubeDrag.current = null
    setIsDragging(false)
    const deltaX = event.clientX - drag.startX
    const distance = Math.hypot(deltaX, event.clientY - drag.startY)
    if (distance < 5) {
      toggle()
      return
    }
    if (Math.abs(deltaX) < 5) return

    const topSession = sessions[sessionAtTop(rotation)]
    setRotation(nearestAngle(rotation, faceRotations[sessions.indexOf(topSession)]))
    if (topSession.id !== selectedId) selectSession(topSession)
  }

  function rotateWithKeyboard(direction: RotationDirection) {
    const nextRotation = rotation + direction * 90
    const topSession = sessions[sessionAtTop(nextRotation)]
    setRotation(nearestAngle(nextRotation, faceRotations[sessions.indexOf(topSession)]))
    if (topSession.id !== selectedId) selectSession(topSession)
  }

  return (
    <div className="cube-stage">
      <div
        className={`cube-rotator${isDragging ? ' is-dragging' : ''}`}
        style={{ transform: `rotateX(-30deg) rotateY(-18deg) rotateZ(${rotation}deg)` }}
        onPointerDown={startCubeDrag}
        onPointerMove={moveCube}
        onPointerUp={finishCubeDrag}
        onPointerCancel={finishCubeDrag}
        onKeyDown={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault()
            toggle()
            return
          }
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
          event.preventDefault()
          rotateWithKeyboard(event.key === 'ArrowLeft' ? -1 : 1)
        }}
        tabIndex={0}
        role="button"
        aria-label={`Időzítő: ${formatTime(remaining)}. Vízszintesen forgatható; kattintás: ${isRunning ? 'szüneteltetés' : 'indítás'}.`}
      >
        <div className="cube">
          {cubeFaces.map(({ className, sessionIndex }) => {
            const session = sessions[sessionIndex]

            return (
              <div className={`cube-face ${className}`} key={className}>
                <span className="cube-time" style={{ transform: `rotateZ(${-rotation}deg)` }}>
                  <span className="cube-minutes">{session.minutes}</span>
                  <span className="cube-minute-unit">PERC</span>
                </span>
              </div>
            )
          })}
          <div className="cube-face cube-front">
            <span
              className="cube-time"
              aria-live="off"
              style={{ transform: `rotateZ(${-rotation}deg)` }}
            >
              {formatTime(remaining)}
            </span>
          </div>
          <div className="cube-face cube-back" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
