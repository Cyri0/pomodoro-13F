import { useCallback, useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent, TransitionEvent as ReactTransitionEvent } from 'react'
import { CubeFace } from './CubeFace'
import { TimerDisplay } from './TimerDisplay'
import { useTimerStore } from '../store/timerStore'

const DEGREES_PER_PIXEL = 0.58
const SETTLE_DURATION_MS = 900
const VIEW_TILT_X = -22

type DragOrigin = { pointerId: number; clientX: number; rotationZ: number }

export function Cube() {
  const durations = useTimerStore((state) => state.durations)
  const currentFace = useTimerStore((state) => state.currentFace)
  const remainingSeconds = useTimerStore((state) => state.remainingSeconds)
  const hasCompleted = useTimerStore((state) => state.hasCompleted)
  const rotationZ = useTimerStore((state) => state.rotationZ)
  const isRotating = useTimerStore((state) => state.isRotating)
  const isSettling = useTimerStore((state) => state.isSettling)
  const beginRotation = useTimerStore((state) => state.beginRotation)
  const updateRotation = useTimerStore((state) => state.updateRotation)
  const prepareRotation = useTimerStore((state) => state.prepareRotation)
  const completeRotation = useTimerStore((state) => state.completeRotation)
  const dragOrigin = useRef<DragOrigin | null>(null)
  const settleTimeout = useRef<number | null>(null)

  const finishSettling = useCallback(() => {
    if (settleTimeout.current !== null) {
      window.clearTimeout(settleTimeout.current)
      settleTimeout.current = null
    }
    completeRotation()
  }, [completeRotation])

  useEffect(() => () => {
    if (settleTimeout.current !== null) window.clearTimeout(settleTimeout.current)
  }, [])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isSettling || (event.pointerType === 'mouse' && event.button !== 0)) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragOrigin.current = { pointerId: event.pointerId, clientX: event.clientX, rotationZ }
    beginRotation()
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = dragOrigin.current
    if (origin === null || origin.pointerId !== event.pointerId) return
    const deltaX = event.clientX - origin.clientX
    updateRotation(origin.rotationZ + deltaX * DEGREES_PER_PIXEL)
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = dragOrigin.current
    if (origin === null || origin.pointerId !== event.pointerId) return
    dragOrigin.current = null
    const deltaX = event.clientX - origin.clientX
    const targetZ = origin.rotationZ + deltaX * DEGREES_PER_PIXEL
    prepareRotation(targetZ)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)

    const targetRotationZ = Math.round(targetZ / 90) * 90
    if (Math.abs(targetRotationZ - rotationZ) < 0.5) {
      finishSettling()
      return
    }
    if (settleTimeout.current !== null) window.clearTimeout(settleTimeout.current)
    settleTimeout.current = window.setTimeout(finishSettling, SETTLE_DURATION_MS)
  }

  const handleTransitionEnd = (event: ReactTransitionEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && event.propertyName === 'transform' && isSettling) finishSettling()
  }

  return (
    <div className="cube-interaction" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} aria-label="Six-sided focus timer cube" role="group">
      <div className="cube-scene">
        <div className={`cube${isRotating && !isSettling ? ' cube--dragging' : ''}`} style={{ transform: `rotateY(-16deg) rotateX(${VIEW_TILT_X}deg) rotateZ(${rotationZ}deg)` }} onTransitionEnd={handleTransitionEnd}>
          {durations.map((minutes, index) => (
            <CubeFace
              key={index}
              faceIndex={index as 0 | 1 | 2 | 3 | 4 | 5}
              minutes={minutes}
              isActive={currentFace === index}
              rotationZ={rotationZ}
              timer={index === 1 ? (
                <TimerDisplay
                  remainingSeconds={remainingSeconds}
                  totalSeconds={durations[currentFace] * 60}
                  isCompleted={hasCompleted}
                  variant="cube"
                />
              ) : null}
            />
          ))}
        </div>
      </div>
    </div>
  )
}