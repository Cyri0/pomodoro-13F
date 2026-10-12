import { useEffect, useRef, useState, type PointerEvent, type CSSProperties } from 'react'

type FaceName = 'front' | 'back' | 'right' | 'left' | 'top' | 'bottom'
type Vector = [number, number, number]

const FACE_DETAILS: Record<FaceName, { duration: number; normal: Vector; up: Vector }> = {
  front: { duration: 5, normal: [0, 0, 1], up: [0, 1, 0] },
  back: { duration: 5, normal: [0, 0, -1], up: [0, 1, 0] },
  right: { duration: 60, normal: [1, 0, 0], up: [0, 1, 0] },
  left: { duration: 60, normal: [-1, 0, 0], up: [0, 1, 0] },
  top: { duration: 25, normal: [0, 1, 0], up: [0, 0, -1] },
  bottom: { duration: 25, normal: [0, -1, 0], up: [0, 0, 1] },
}

const FACE_NAMES = Object.keys(FACE_DETAILS) as FaceName[]
const DURATIONS = [5, 25, 60]
const INITIAL_ROTATION: [number, number] = [-90, 0]

function rotateVector([x, y, z]: Vector, rotateX: number, rotateY: number): Vector {
  const radiansX = (-rotateX * Math.PI) / 180
  const radiansY = (rotateY * Math.PI) / 180
  const afterY: Vector = [
    Math.cos(radiansY) * x + Math.sin(radiansY) * z,
    y,
    -Math.sin(radiansY) * x + Math.cos(radiansY) * z,
  ]

  return [
    afterY[0],
    Math.cos(radiansX) * afterY[1] - Math.sin(radiansX) * afterY[2],
    Math.sin(radiansX) * afterY[1] + Math.cos(radiansX) * afterY[2],
  ]
}

function getDisplayFace(rotateX: number, rotateY: number): FaceName {
  return FACE_NAMES.reduce((closest, face) => {
    const normal = rotateVector(FACE_DETAILS[face].normal, rotateX, rotateY)
    const closestNormal = rotateVector(FACE_DETAILS[closest].normal, rotateX, rotateY)
    return normal[2] > closestNormal[2] ? face : closest
  }, 'front')
}

function getScreenRotation(face: FaceName, rotateX: number, rotateY: number): number {
  const [horizontal, vertical] = rotateVector(FACE_DETAILS[face].up, rotateX, rotateY)
  return (-Math.atan2(horizontal, vertical) * 180) / Math.PI
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

function TimerScreen({ timeLeft, duration, running }: { timeLeft: number; duration: number; running: boolean }) {
  const progress = duration > 0 ? timeLeft / duration : 0
  const circumference = 2 * Math.PI * 73

  return (
    <div className="timer-screen" aria-label={`${formatTime(timeLeft)} remaining`}>
      <svg className="timer-ring" viewBox="0 0 180 180" aria-hidden="true">
        <circle className="ring-track" cx="90" cy="90" r="73" />
        {Array.from({ length: 60 }, (_, index) => {
          const angle = (index / 60) * 360
          const isMajor = index % 5 === 0
          return (
            <line
              className={`ring-tick${isMajor ? ' ring-tick-major' : ''}`}
              key={index}
              x1="90"
              y1={isMajor ? '5' : '8'}
              x2="90"
              y2={isMajor ? '17' : '14'}
              transform={`rotate(${angle} 90 90)`}
            />
          )
        })}
        <circle
          className="ring-progress"
          cx="90"
          cy="90"
          r="73"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
      </svg>
      <div className="screen-readout">
        <span className="screen-time">{formatTime(timeLeft)}</span>
        <span className="screen-caption">{running ? 'FOCUSING' : 'READY'}</span>
      </div>
    </div>
  )
}

function PlayIcon({ paused = false }: { paused?: boolean }) {
  return paused ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.5v13l10-6.5z" fill="currentColor" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 6v12M16 6v12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

const App = () => {
  const [rotation, setRotation] = useState<[number, number]>(INITIAL_ROTATION)
  const [selectedDuration, setSelectedDuration] = useState(25)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [dragging, setDragging] = useState(false)
  const dragOrigin = useRef<{ x: number; y: number; rotateX: number; rotateY: number } | null>(null)
  const displayFace = getDisplayFace(rotation[0], rotation[1])
  const screenRotation = getScreenRotation(displayFace, rotation[0], rotation[1])

  useEffect(() => {
    if (!running) return
    const timer = window.setTimeout(() => {
      if (timeLeft <= 1) {
        setTimeLeft(0)
        setRunning(false)
      } else {
        setTimeLeft(timeLeft - 1)
      }
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [running, timeLeft])

  const setDuration = (duration: number) => {
    const targetRotation: [number, number] =
      duration === 5 ? [0, 0] : duration === 60 ? [0, -90] : [-90, 0]
    setRotation(targetRotation)
    setSelectedDuration(duration)
    setTimeLeft(duration * 60)
    setRunning(false)
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragOrigin.current = {
      x: event.clientX,
      y: event.clientY,
      rotateX: rotation[0],
      rotateY: rotation[1],
    }
    setDragging(true)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragOrigin.current) return
    const deltaX = event.clientX - dragOrigin.current.x
    const deltaY = event.clientY - dragOrigin.current.y
    setRotation([
      dragOrigin.current.rotateX - deltaY * 0.72,
      dragOrigin.current.rotateY + deltaX * 0.72,
    ])
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragOrigin.current) return
    const rotateX = dragOrigin.current.rotateX - (event.clientY - dragOrigin.current.y) * 0.72
    const rotateY = dragOrigin.current.rotateY + (event.clientX - dragOrigin.current.x) * 0.72
    dragOrigin.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    const snappedRotation: [number, number] = [
      Math.round(rotateX / 90) * 90,
      Math.round(rotateY / 90) * 90,
    ]
    setRotation(snappedRotation)
    const faceDuration = FACE_DETAILS[getDisplayFace(...snappedRotation)].duration
    if (faceDuration !== selectedDuration) {
      setSelectedDuration(faceDuration)
      setTimeLeft(faceDuration * 60)
      setRunning(false)
    }
  }

  const cubeStyle: CSSProperties & {
    '--rotation-x': string
    '--rotation-y': string
    '--screen-rotation': string
  } = {
    '--rotation-x': `${rotation[0]}deg`,
    '--rotation-y': `${rotation[1]}deg`,
    '--screen-rotation': `${screenRotation}deg`,
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="wordmark" href="#" aria-label="Tempo home">
          <span className="wordmark-icon"><span /></span>
          TEMPO
        </a>
        <span className="topbar-note">A LITTLE MORE FOCUS.</span>
        <button
          className="sound-button"
          type="button"
          aria-label="Sound is off"
          title="Sound is off"
          disabled
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4.5 10v4h3l4 3V7l-4 3h-3Z" />
            <path d="m16 9 5 6m0-6-5 6" />
          </svg>
        </button>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow"><span /> YOUR TIME, IN YOUR HANDS</p>
          <h1 id="page-title">Find your<br /><span>flow state.</span></h1>
          <p className="intro">One small turn. One clear mind.<br />Make space for what matters.</p>
        </div>

        <div className="timer-stage">
          <div className={`cube-interaction${dragging ? ' is-dragging' : ''}`} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
            <div className="cube-shadow" />
            <div className="cube" style={cubeStyle} aria-label={`Tempo cube, ${selectedDuration} minute setting is on top`}>
              {FACE_NAMES.map((face) => (
                <div className={`cube-face face-${face}`} key={face}>
                  <span className="face-kicker">TEMPO</span>
                  {face === displayFace && (
                    <div className="screen-counter-rotation">
                      <TimerScreen timeLeft={timeLeft} duration={selectedDuration * 60} running={running} />
                    </div>
                  )}
                  <span className="face-duration">
                    <strong>{FACE_DETAILS[face].duration}</strong>
                    <small>MIN</small>
                  </span>
                  <span className="face-index">0{DURATIONS.indexOf(FACE_DETAILS[face].duration) + 1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="drag-hint"><span className="drag-hint-icon">↔</span> DRAG TO TURN</div>
          <span className="stage-caption">TURN A SIDE UP TO SET YOUR SESSION</span>
        </div>

        <aside className="session-panel" aria-label="Timer controls">
          <div className="session-heading">
            <span className="eyebrow">YOUR SESSION</span>
            <span className="session-state"><span className={running ? 'state-dot is-running' : 'state-dot'} />{running ? 'IN FOCUS' : 'STANDING BY'}</span>
          </div>
          <div className="duration-options" role="group" aria-label="Choose a session length">
            {DURATIONS.map((duration) => (
              <button
                className={`duration-option${selectedDuration === duration ? ' is-selected' : ''}`}
                key={duration}
                onClick={() => setDuration(duration)}
                type="button"
                aria-pressed={selectedDuration === duration}
              >
                <span>{duration}</span><small>MIN</small>
              </button>
            ))}
          </div>
          <div className="session-actions">
            <button
              className="start-button"
              type="button"
              onClick={() => {
                if (running) {
                  setRunning(false)
                  return
                }
                if (timeLeft === 0) setTimeLeft(selectedDuration * 60)
                setRunning(true)
              }}
            >
              <PlayIcon paused={!running} />
              {running ? 'Pause session' : timeLeft === 0 || timeLeft === selectedDuration * 60 ? 'Start session' : 'Resume session'}
            </button>
            <button
              className="reset-button"
              type="button"
              aria-label="Reset timer"
              title="Reset timer"
              onClick={() => {
                setRunning(false)
                setTimeLeft(selectedDuration * 60)
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 11a8 8 0 1 1 2.3 5.7M4 5v6h6" />
              </svg>
            </button>
          </div>
          <div className="session-footnote"><span className="footnote-icon">↻</span> Turn the cube to change your focus time.</div>
        </aside>
      </section>

      <footer className="footer">
        <div className="footer-rule" />
        <span>LESS DISTRACTION. MORE INTENTION.</span>
        <span className="footer-right">DESIGNED FOR DEEP WORK <span>·</span> 01 / 03</span>
      </footer>
    </main>
  )
}

export default App
