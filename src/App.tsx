import { useEffect, useRef, useState } from 'react'

const PRESETS = [5, 10, 30, 60]

const CUBE_FACES = [
  { key: 'front', label: '5 min', minutes: 5, transform: 'rotateY(0deg) translateZ(120px)' },
  { key: 'right', label: '10 min', minutes: 10, transform: 'rotateY(90deg) translateZ(120px)' },
  { key: 'back', label: '30 min', minutes: 30, transform: 'rotateY(180deg) translateZ(120px)' },
  { key: 'left', label: '60 min', minutes: 60, transform: 'rotateY(-90deg) translateZ(120px)' },
  { key: 'top', label: 'Focus', minutes: 0, transform: 'rotateX(90deg) translateZ(120px)' },
  { key: 'bottom', label: 'Timer', minutes: 0, transform: 'rotateX(-90deg) translateZ(120px)' },
] as const

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const rotateVector = (vector: { x: number; y: number; z: number }, rotationX: number, rotationY: number) => {
  const rx = (rotationX * Math.PI) / 180
  const ry = (rotationY * Math.PI) / 180

  const cosY = Math.cos(ry)
  const sinY = Math.sin(ry)
  const x1 = vector.x * cosY + vector.z * sinY
  const z1 = -vector.x * sinY + vector.z * cosY

  const cosX = Math.cos(rx)
  const sinX = Math.sin(rx)
  const y2 = vector.y * cosX - z1 * sinX
  const z2 = vector.y * sinX + z1 * cosX
  //ezt az egesz kodot az ai irta es en csak bemasolom, hogy mukodjon a 3d kocka, de nem ertem a matekot benne. btw meleg vagyok

  return { x: x1, y: y2, z: z2 }
}

const getActivePresetIndex = (rotationX: number, rotationY: number) => {
  const faces = [
    { index: 0, normal: { x: 0, y: 0, z: 1 } },
    { index: 1, normal: { x: 1, y: 0, z: 0 } },
    { index: 2, normal: { x: 0, y: 0, z: -1 } },
    { index: 3, normal: { x: -1, y: 0, z: 0 } },
  ]

  let bestIndex = 0
  let bestScore = -Infinity

  faces.forEach(({ index, normal }) => {
    const rotated = rotateVector(normal, rotationX, rotationY)
    const score = rotated.z - Math.abs(rotated.x) * 0.35 - Math.abs(rotated.y) * 0.2

    if (score > bestScore) {
      bestScore = score
      bestIndex = index
    }
  })

  return bestIndex
}

const App = () => {
  const [timeLeft, setTimeLeft] = useState(PRESETS[0] * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [rotationY, setRotationY] = useState(-45)
  const [rotationX, setRotationX] = useState(18)
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

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      rotationY,
      rotationX,
    }
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) {
      return
    }

    const deltaX = event.clientX - dragStart.current.x
    const deltaY = event.clientY - dragStart.current.y

    setRotationY(dragStart.current.rotationY + deltaX * 1.1)
    setRotationX(Math.max(-90, Math.min(90, dragStart.current.rotationX - deltaY * 0.9)))
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
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

  const getFaceTime = (minutes: number) => {
    if (minutes === selectedMinutes) {
      return formatTime(timeLeft)
    }

    return formatTime(minutes * 60)
  }

  return (
    <main className="app-shell">
      <div className="timer-card">
        <div className="timer-header">
          <span className="eyebrow">Pomodoro</span>
          <h1>3D focus cube</h1>
        </div>

        <div className="cube-panel">
          <div
            className="cube-stage"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <div
              className={`cube ${isDragging ? 'dragging' : ''}`}
              style={{ transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)` }}
            >
              {CUBE_FACES.map((face, index) => {
                const isTimerFace = index < PRESETS.length
                const isActive = activeIndex === index

                return (
                  <div
                    key={face.key}
                    className={`cube-face ${isActive ? 'active' : ''}`}
                    style={{ transform: face.transform }}
                  >
                    <span className="face-label">{isTimerFace ? `${face.minutes} min` : face.label}</span>
                    <strong className="face-time">
                      {isTimerFace ? getFaceTime(face.minutes) : face.label}
                    </strong>
                  </div>
                )
              })}
            </div>
          </div>

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