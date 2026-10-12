import { useEffect, useRef, useState } from 'react'
import { create } from 'zustand'

type FaceId = 'front' | 'right' | 'back' | 'left' | 'top' | 'bottom'
type FacePreset = { minutes: number; label: string; kicker: string }
type PomodoroState = {
  activeFace: FaceId
  duration: number
  secondsLeft: number
  isRunning: boolean
  completed: number
  cubeX: number
  cubeY: number
  setFace: (face: FaceId, snap?: boolean) => void
  toggleRunning: () => void
  reset: () => void
  tick: () => void
  setCubeRotation: (cubeX: number, cubeY: number) => void
}

const FACE_PRESETS: Record<FaceId, FacePreset> = {
  front: { minutes: 25, label: 'Focus', kicker: 'FOCUS' },
  right: { minutes: 5, label: 'Short break', kicker: 'BREAK' },
  back: { minutes: 15, label: 'Long break', kicker: 'LONG' },
  left: { minutes: 50, label: 'Deep focus', kicker: 'DEEP' },
  top: { minutes: 10, label: 'Sprint', kicker: 'SPRINT' },
  bottom: { minutes: 60, label: 'Deep work', kicker: 'HOUR' },
}
const FACE_SNAP: Record<FaceId, { x: number; y: number }> = {
  front: { x: -12, y: -22 },
  right: { x: -16, y: -48 },
  back: { x: -10, y: 158 },
  left: { x: -16, y: 28 },
  top: { x: -42, y: -18 },
  bottom: { x: 28, y: -16 },
}
const FACE_ORDER: FaceId[] = ['front', 'right', 'back', 'left', 'top', 'bottom']
const FACE_NORMALS: Record<FaceId, [number, number, number]> = {
  front: [0, 0, 1], back: [0, 0, -1], right: [1, 0, 0], left: [-1, 0, 0], top: [0, 1, 0], bottom: [0, -1, 0],
}

const rotateY = (v: { x: number; y: number; z: number }, deg: number) => {
  const a = (deg * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  return { x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c }
}
const rotateX = (v: { x: number; y: number; z: number }, deg: number) => {
  const a = (deg * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  return { x: v.x, y: v.y * c - v.z * s, z: v.y * s + v.z * c }
}

const getFacingFace = (cubeX: number, cubeY: number) => {
  let best: FaceId = 'front'
  let bestZ = -Infinity
  for (const face of FACE_ORDER) {
    const [nx, ny, nz] = FACE_NORMALS[face]
    const rotated = rotateX(rotateY({ x: nx, y: ny, z: nz }, cubeY), cubeX)
    if (rotated.z > bestZ) {
      bestZ = rotated.z
      best = face
    }
  }
  return { face: best, minutes: FACE_PRESETS[best].minutes, towardCameraZ: Number(bestZ.toFixed(3)) }
}

const applyFaceState = (face: FaceId, snap: boolean, cubeX: number, cubeY: number) => {
  const preset = FACE_PRESETS[face]
  const duration = preset.minutes * 60
  const pose = snap ? FACE_SNAP[face] : { x: cubeX, y: cubeY }
  return { activeFace: face, duration, secondsLeft: duration, cubeX: pose.x, cubeY: pose.y }
}

const usePomodoroStore = create<PomodoroState>((set) => ({
  activeFace: 'front',
  duration: FACE_PRESETS.front.minutes * 60,
  secondsLeft: FACE_PRESETS.front.minutes * 60,
  isRunning: true,
  completed: 0,
  cubeX: FACE_SNAP.front.x,
  cubeY: FACE_SNAP.front.y,
  setFace: (face, snap = true) => set((state) => applyFaceState(face, snap, state.cubeX, state.cubeY)),
  toggleRunning: () => set((state) => ({ isRunning: !state.isRunning })),
  reset: () => set((state) => {
    const pose = FACE_SNAP[state.activeFace]
    return { secondsLeft: state.duration, isRunning: false, cubeX: pose.x, cubeY: pose.y }
  }),
  tick: () => set((state) => {
    if (!state.isRunning) return state
    if (state.secondsLeft <= 1) return { ...state, secondsLeft: state.duration, isRunning: false, completed: state.completed + 1 }
    return { ...state, secondsLeft: state.secondsLeft - 1 }
  }),
  setCubeRotation: (cubeX, cubeY) => set((state) => {
    const facing = getFacingFace(cubeX, cubeY)
    if (facing.face === state.activeFace) return { cubeX, cubeY }
    return { ...applyFaceState(facing.face, false, cubeX, cubeY), cubeX, cubeY }
  }),
}))

const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
const formatPreset = (minutes: number) => `${minutes.toString().padStart(2, '0')}:00`
const getTickStyle = (index: number, progress: number) => ({ transform: `rotate(${index * 6}deg) translateY(-132px)`, opacity: index < progress * 60 ? 1 : 0.18 })

const debugLog = (location: string, message: string, data: Record<string, unknown>, hypothesisId: string, runId = 'post-fix') => {
  // #region agent log
  fetch('http://127.0.0.1:7372/ingest/2bd0b727-d602-4d11-ad78-6084620acfa3', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '328bba' }, body: JSON.stringify({ sessionId: '328bba', location, message, data, timestamp: Date.now(), hypothesisId, runId }) }).catch(() => {})
  // #endregion
}

function App() {
  const clockRef = useRef<HTMLDivElement>(null)
  const pointerRef = useRef({ x: 0, y: 0 })
  const cubeRotationRef = useRef({ x: FACE_SNAP.front.x, y: FACE_SNAP.front.y })
  const lastLoggedFace = useRef<FaceId>('front')
  const [isDragging, setIsDragging] = useState(false)
  const { activeFace, duration, secondsLeft, isRunning, completed, cubeX, cubeY, setFace, toggleRunning, reset, tick, setCubeRotation } = usePomodoroStore()
  const progress = Math.max(0, Math.min(1, 1 - secondsLeft / duration))
  const activePreset = FACE_PRESETS[activeFace]

  useEffect(() => {
    const interval = window.setInterval(tick, 1000)
    return () => window.clearInterval(interval)
  }, [tick])

  useEffect(() => {
    cubeRotationRef.current = { x: cubeX, y: cubeY }
  }, [cubeX, cubeY])

  const updateRotation = (clientX: number, clientY: number) => {
    const deltaX = clientX - pointerRef.current.x
    const deltaY = clientY - pointerRef.current.y
    pointerRef.current = { x: clientX, y: clientY }
    const nextX = Math.max(-90, Math.min(90, cubeRotationRef.current.x - deltaY * 0.45))
    const nextY = cubeRotationRef.current.y + deltaX * 0.65
    cubeRotationRef.current = { x: nextX, y: nextY }
    const facing = getFacingFace(nextX, nextY)
    setCubeRotation(nextX, nextY)
    if (facing.face !== lastLoggedFace.current) {
      lastLoggedFace.current = facing.face
      debugLog('App.tsx:updateRotation', 'facing face changed', { nextX, nextY, facingFace: facing.face, facingMinutes: facing.minutes, towardCameraZ: facing.towardCameraZ, previousFace: activeFace, duration, secondsLeft }, 'C')
    }
  }
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => { if (isDragging || event.buttons === 1) updateRotation(event.clientX, event.clientY) }
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    pointerRef.current = { x: event.clientX, y: event.clientY }
    setIsDragging(true)
    debugLog('App.tsx:pointerDown', 'drag start', { cubeX, cubeY, activeFace, secondsLeft, duration }, 'C')
  }
  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId)
    setIsDragging(false)
    const facing = getFacingFace(cubeRotationRef.current.x, cubeRotationRef.current.y)
    const snap = FACE_SNAP[facing.face]
    cubeRotationRef.current = snap
    setFace(facing.face, true)
    debugLog('App.tsx:pointerUp', 'drag end applied face', { cubeX: snap.x, cubeY: snap.y, facingFace: facing.face, facingMinutes: facing.minutes, durationAfter: FACE_PRESETS[facing.face].minutes * 60, setFaceCalled: true }, 'C')
  }
  const faceTime = (face: FaceId) => (activeFace === face ? formatTime(secondsLeft) : formatPreset(FACE_PRESETS[face].minutes))

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark"><span className="brand-dot" />tempo</div>
        <div className="header-status"><span className="status-dot" />{isRunning ? 'In session' : 'Paused'}<span className="status-divider" />{completed.toString().padStart(2, '0')} sessions</div>
        <button className="icon-button" aria-label="Open settings"><span className="menu-lines" /></button>
      </header>
      <section className="workspace">
        <div className="intro-copy"><p className="eyebrow">A little room to think</p><h1>Make time<br /><em>intentional.</em></h1><p className="intro-detail">A focused rhythm for deep work,<br />designed to disappear when you do.</p></div>
        <div className="clock-stage">
          <div ref={clockRef} className={`clock-object ${isDragging ? 'is-dragging' : ''}`} style={{ '--cube-x': `${cubeX}deg`, '--cube-y': `${cubeY}deg` } as React.CSSProperties} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} role="slider" aria-label="Rotate cube to change timer duration" aria-valuemin={5} aria-valuemax={60} aria-valuenow={activePreset.minutes}>
            <div className="cube-face cube-front">
              <div className="clock-top-label">{activePreset.minutes} MIN</div>
              <div className="clock-face"><div className="ticks" aria-hidden="true">{Array.from({ length: 60 }, (_, index) => <span key={index} style={getTickStyle(index, progress)} />)}</div><div className="face-content"><span className="face-mode">{activePreset.label}</span><strong>{formatTime(secondsLeft)}</strong><span className="face-caption">{isRunning ? 'Stay in the moment' : 'Ready when you are'}</span></div><div className="face-glow" /></div>
              <div className="clock-side-label">POMO / 01</div>
            </div>
            <div className="cube-face cube-top"><span>{faceTime('top')}</span><small>{FACE_PRESETS.top.kicker}</small></div>
            <div className="cube-face cube-right"><span>{faceTime('right')}</span><small>{FACE_PRESETS.right.kicker}</small></div>
            <div className="cube-face cube-back"><span>{faceTime('back')}</span><small>{FACE_PRESETS.back.kicker}</small></div>
            <div className="cube-face cube-left"><span>{faceTime('left')}</span><small>{FACE_PRESETS.left.kicker}</small></div>
            <div className="cube-face cube-bottom"><span>{faceTime('bottom')}</span><small>{FACE_PRESETS.bottom.kicker}</small></div>
          </div>
          <div className="clock-shadow" /><p className="rotate-hint"><span className="cursor-icon">↔</span> Rotate to change the time</p>
        </div>
        <aside className="control-panel">
          <div className="panel-heading"><span className="panel-kicker">Current rhythm</span><span className="panel-value">{Math.round(progress * 100)}%</span></div>
          <div className="progress-line"><span style={{ width: `${progress * 100}%` }} /></div>
          <div className="mode-switcher" role="tablist" aria-label="Timer duration">{FACE_ORDER.map((face) => <button key={face} className={activeFace === face ? 'active' : ''} onClick={() => setFace(face, true)} role="tab" aria-selected={activeFace === face}><span>{FACE_PRESETS[face].label}</span><small>{FACE_PRESETS[face].minutes} min</small></button>)}</div>
          <div className="panel-actions"><button className={`primary-action ${isRunning ? 'pause' : ''}`} onClick={toggleRunning}><span className="action-icon">{isRunning ? 'Ⅱ' : '▶'}</span>{isRunning ? 'Pause session' : 'Start session'}</button><button className="reset-action" onClick={reset} aria-label="Reset timer">↻</button></div>
          <p className="panel-note"><span className="spark">✦</span> Rotate the cube so a different face is toward you</p>
        </aside>
      </section>
      <footer className="footer-note"><span>© 2024 tempo</span><span className="footer-center">Built for the beautifully focused</span><span>25 / 05 / 15 / 10 / 50 / 60</span></footer>
    </main>
  )
}

export default App
