import { useEffect, useRef, useState } from 'react'

const PRESETS = [5, 10, 30, 60]

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const getActivePresetIndex = (rotationX: number, rotationY: number) => {
  const normalizedY = ((rotationY % 360) + 360) % 360
  const normalizedX = ((rotationX % 360) + 360) % 360

  if (normalizedX > 180) {
    return 3
  }

  if (normalizedY < 90) return 0
  if (normalizedY < 180) return 1
  if (normalizedY < 270) return 2
  return 3
}

const App = () => {
  const [timeLeft, setTimeLeft] = useState(PRESETS[0] * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [rotationY, setRotationY] = useState(0)
  const [rotationX, setRotationX] = useState(-18)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef<{ x: number; y: number; rotationY: number; rotationX: number } | null>(null)

  const activeIndex = getActivePresetIndex(rotationX, rotationY)
  const selectedMinutes = PRESETS[activeIndex]

  useEffect(() => {
    setTimeLeft(PRESETS[activeIndex] * 60)
    setIsRunning(false)
  }, [activeIndex])

  useEffect(() => {
    if (!isRunning) {
      return
    }

    const intervalId = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId)
          setIsRunning(false)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isRunning])

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      rotationY,
      rotationX,
    }
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStart.current) {
      return
    }

    const deltaX = event.clientX - dragStart.current.x
    const deltaY = event.clientY - dragStart.current.y

    setRotationY(dragStart.current.rotationY + deltaX * 1.1)
    setRotationX(Math.max(-90, Math.min(90, dragStart.current.rotationX - deltaY * 0.9)))
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStart.current) {
      return
    }

    dragStart.current = null
    setIsDragging(false)
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const handleStartPause = () => {
    if (timeLeft === 0) {
      setTimeLeft(selectedMinutes * 60)
    }

    setIsRunning((current) => !current)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(selectedMinutes * 60)
  }

  const getDisplayValue = () => {
    if (selectedMinutes === 5) return '5 min'
    if (selectedMinutes === 10) return '10 min'
    if (selectedMinutes === 30) return '30 min'
    return '60 min'
  }

  return (
    <main className="app-shell">
      <div className="emoji-rain" aria-hidden="true">
        {['✨', '🌈', '🎉', '🔥', '🚀', '💫', '🌟', '🪩', '🎊', '⚡', '🌙', '🎵'].map((emoji, index) => (
          <span key={`${emoji}-${index}`} style={{ '--i': index } as React.CSSProperties}>{emoji}</span>
        ))}
      </div>
      <div className="dance-crew" aria-hidden="true">
        <span>🕺🏿</span>
        <span>💃🏿</span>
        <span>🕺🏾</span>
        <span>💃🏾</span>
        <span>🙆🏿‍♀️</span>
        <span>🕴🏿</span>
        <span>🙋🏾‍♂️</span>
        <span>💃🏿</span>
      </div>

      <div className="timer-card">
        <div className="timer-header">
          <span className="eyebrow">Pomodoro</span>
          <h1>rainbow triangle</h1>
        </div>

        <div className="button-panel">
          <button
            type="button"
            className={`timer-button ${isDragging ? 'dragging' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)` }}
          >
            <span className="duration-label">{getDisplayValue()}</span>
            <strong className="duration-time">{formatTime(timeLeft)}</strong>
          </button>
          <p className="drag-hint">drag to rotate</p>
        </div>

        <div className="actions">
          <button type="button" className="primary" onClick={handleStartPause}>
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button type="button" className="secondary" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>
    </main>
  )
}

export default App