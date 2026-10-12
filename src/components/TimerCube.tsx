import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { sessions, useTimerStore } from '../timerStore'
import TimerFace from './TimerFace'

const TimerCube = () => {
  const selectedId = useTimerStore((state) => state.selectedId)
  const remainingSeconds = useTimerStore((state) => state.remainingSeconds)
  const rotationX = useTimerStore((state) => state.rotationX)
  const rotationY = useTimerStore((state) => state.rotationY)
  const setRotation = useTimerStore((state) => state.setRotation)
  const snapToFace = useTimerStore((state) => state.snapToFace)
  const dragOrigin = useRef<{ x: number; y: number; rotationX: number; rotationY: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

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
        {sessions.map((session, index) => (
          <TimerFace
            key={session.id}
            session={session}
            index={index}
            selected={session.id === selectedId}
            remainingSeconds={remainingSeconds}
          />
        ))}
      </div>
    </div>
  )
}

export default TimerCube