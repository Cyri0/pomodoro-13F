import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { useTimerStore, type TimerMode } from './store/timerStore'

const modes: { id: TimerMode; label: string }[] = [
  { id: 'focus', label: 'Focus' },
  { id: 'short', label: 'Short break' },
  { id: 'long', label: 'Long break' },
]

const cubeFaces = [
  { minutes: 5, normal: new THREE.Vector3(1, 0, 0), background: '#d97855', foreground: '#fffaf3' },
  { minutes: 10, normal: new THREE.Vector3(-1, 0, 0), background: '#384d46', foreground: '#f7f3e9' },
  { minutes: 15, normal: new THREE.Vector3(0, 1, 0), background: '#aebc9d', foreground: '#263126' },
  { minutes: 45, normal: new THREE.Vector3(0, -1, 0), background: '#eee6d5', foreground: '#39362e' },
  { minutes: 25, normal: new THREE.Vector3(0, 0, 1), background: '#c8a86e', foreground: '#363127' },
  { minutes: 60, normal: new THREE.Vector3(0, 0, -1), background: '#537b75', foreground: '#fbf9f0' },
]

function createCubeFace(label: string, index: number, background: string, foreground: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const context = canvas.getContext('2d')
  if (context === null) return new THREE.MeshStandardMaterial({ color: background })

  context.fillStyle = background
  context.fillRect(0, 0, 512, 512)
  context.strokeStyle = `${foreground}35`
  context.lineWidth = 1.5
  context.strokeRect(24, 24, 464, 464)
  context.fillStyle = foreground
  context.font = '600 21px monospace'
  context.textAlign = 'left'
  context.fillText('TEMPO', 56, 76)
  context.textAlign = 'right'
  context.fillStyle = `${foreground}b0`
  context.fillText(`PRESET 0${index + 1}`, 456, 76)
  context.strokeStyle = `${foreground}35`
  context.beginPath()
  context.moveTo(56, 104)
  context.lineTo(456, 104)
  context.stroke()
  context.fillStyle = foreground
  context.font = '600 76px monospace'
  context.textAlign = 'center'
  context.fillText(label, 256, 285)
  context.strokeStyle = `${foreground}35`
  context.beginPath()
  context.moveTo(56, 340)
  context.lineTo(456, 340)
  context.stroke()
  context.fillStyle = foreground
  context.font = '600 17px monospace'
  context.fillText('TIMER PRESET', 256, 390)
  for (let dot = 0; dot < cubeFaces.length; dot += 1) {
    context.beginPath()
    context.fillStyle = dot === index ? '#f47745' : `${foreground}75`
    context.arc(216 + dot * 16, 438, dot === index ? 4.5 : 3, 0, Math.PI * 2)
    context.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.48, metalness: 0.03 })
}

function TimerCube() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const cubeRef = useRef<THREE.Mesh | null>(null)
  const renderRef = useRef<() => void>(() => {})
  const selectedFaceRef = useRef(25)
  const remainingSeconds = useTimerStore((state) => state.remainingSeconds)
  const mode = useTimerStore((state) => state.mode)
  const settings = useTimerStore((state) => state.settings)
  const isRunning = useTimerStore((state) => state.isRunning)
  const selectedPresetMinutes = useTimerStore((state) => state.selectedPresetMinutes)
  const selectPreset = useTimerStore((state) => state.selectPreset)
  const currentState = useRef({ selectPreset })
  const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, '0')
  const seconds = (remainingSeconds % 60).toString().padStart(2, '0')
  currentState.current = { selectPreset }

  useEffect(() => {
    const mount = canvasRef.current
    if (mount === null) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
    camera.position.set(0, 0, 5.2)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x5e554c, 1.4))
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4)
    keyLight.position.set(-3, 4, 5)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xffaa75, 0.9)
    fillLight.position.set(4, -2, 3)
    scene.add(fillLight)

    const materials = cubeFaces.map(({ minutes, background, foreground }, index) =>
      createCubeFace(`${minutes.toString().padStart(2, '0')}:00`, index, background, foreground),
    )
    const geometry = new RoundedBoxGeometry(1.8, 1.8, 1.8, 6, 0.12)
    const cube = new THREE.Mesh(geometry, materials)
    cubeRef.current = cube
    cube.rotation.set(-0.36, 0.55, 0)
    scene.add(cube)

    let dragging = false
    let dragOrigin: { pointerId: number; x: number; y: number } | null = null

    const render = () => renderer.render(scene, camera)
    renderRef.current = render
    const resize = () => {
      const { width, height } = mount.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      render()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(mount)
    resize()

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      event.preventDefault()
      currentState.current.selectPreset(selectedFaceRef.current)
      dragging = true
      dragOrigin = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      }
      renderer.domElement.setPointerCapture(event.pointerId)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging || dragOrigin === null || dragOrigin.pointerId !== event.pointerId) return
      const deltaX = event.clientX - dragOrigin.x
      const deltaY = event.clientY - dragOrigin.y
      cube.rotation.y += deltaX * 0.012
      cube.rotation.x += deltaY * 0.012
      dragOrigin.x = event.clientX
      dragOrigin.y = event.clientY
      const facingFace = cubeFaces.reduce((frontFace, face) => {
        const faceDepth = face.normal.clone().applyQuaternion(cube.quaternion).z
        const frontDepth = frontFace.normal.clone().applyQuaternion(cube.quaternion).z
        return faceDepth > frontDepth ? face : frontFace
      })
      if (facingFace.minutes !== selectedFaceRef.current) {
        selectedFaceRef.current = facingFace.minutes
        currentState.current.selectPreset(selectedFaceRef.current)
      }
      render()
    }
    const onPointerUp = (event: PointerEvent) => {
      if (dragOrigin?.pointerId !== event.pointerId) return
      dragging = false
      dragOrigin = null
    }
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('pointerup', onPointerUp)
    renderer.domElement.addEventListener('pointercancel', onPointerUp)

    return () => {
      observer.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      renderer.domElement.removeEventListener('pointercancel', onPointerUp)
      cubeRef.current = null
      renderRef.current = () => {}
      geometry.dispose()
      materials.forEach((material) => {
        material.map?.dispose()
        material.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const presetMinutes = cubeFaces.map((face) => face.minutes).sort((first, second) => first - second)
    const currentPreset = selectedPresetMinutes ?? settings[mode]
    const currentIndex = presetMinutes.reduce((closest, minutes, index) =>
      Math.abs(minutes - currentPreset) < Math.abs(presetMinutes[closest] - currentPreset) ? index : closest,
    0)
    let nextIndex = currentIndex

    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') nextIndex = Math.min(presetMinutes.length - 1, currentIndex + 1)
    else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') nextIndex = Math.max(0, currentIndex - 1)
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = presetMinutes.length - 1
    else return

    event.preventDefault()
    const nextFace = cubeFaces.find((face) => face.minutes === presetMinutes[nextIndex])
    if (nextFace === undefined) return
    selectedFaceRef.current = nextFace.minutes
    selectPreset(nextFace.minutes)

    const cube = cubeRef.current
    if (cube !== null) {
      const faceDirection = nextFace.normal.clone().applyQuaternion(cube.quaternion)
      const viewingDirection = new THREE.Vector3(0.16, 0.12, 0.98).normalize()
      cube.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors(faceDirection, viewingDirection))
      renderRef.current()
    }
  }

  return (
    <div className="cube-control">
      <div
        ref={canvasRef}
        className={`cube-stage ${isRunning ? 'cube-running' : 'cube-adjustable'}`}
        role="slider"
        aria-label="Select timer preset"
        aria-valuemin={1}
        aria-valuemax={120}
        aria-valuenow={selectedPresetMinutes ?? settings[mode]}
        aria-valuetext={isRunning
          ? `${selectedPresetMinutes ?? settings[mode]} minute preset; ${minutes}:${seconds} remaining`
          : `${selectedPresetMinutes ?? settings[mode]} minutes`}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      />
      <div className="cube-readout" aria-live="off">
        <span className="cube-time" role={isRunning ? 'timer' : undefined}>{minutes}:{seconds}</span>
        <span className="cube-caption">{mode === 'focus' ? 'FOCUS TIME' : 'BREAK TIME'}</span>
      </div>
    </div>
  )
}

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const mode = useTimerStore((state) => state.mode)
  const isRunning = useTimerStore((state) => state.isRunning)
  const completedSessions = useTimerStore((state) => state.completedSessions)
  const focusTask = useTimerStore((state) => state.focusTask)
  const settings = useTimerStore((state) => state.settings)
  const message = useTimerStore((state) => state.message)
  const setMode = useTimerStore((state) => state.setMode)
  const start = useTimerStore((state) => state.start)
  const pause = useTimerStore((state) => state.pause)
  const reset = useTimerStore((state) => state.reset)
  const skip = useTimerStore((state) => state.skip)
  const setFocusTask = useTimerStore((state) => state.setFocusTask)
  const setDuration = useTimerStore((state) => state.setDuration)
  const todayMinutes = completedSessions * settings.focus

  return (
    <main className={`app-shell mode-${mode}`}>
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Tempo home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>tempo<span className="wordmark-period">.</span></span>
        </a>
        <div className="topbar-right">
          <span className="day-label">A LITTLE SPACE FOR FOCUS</span>
          <button
            className="settings-button"
            type="button"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen((open) => !open)}
          >
            <span aria-hidden="true">☼</span> Settings
          </button>
        </div>
      </header>

      {settingsOpen && (
        <section className="settings-panel" aria-label="Timer settings">
          <div className="settings-heading">
            <div><span className="eyebrow">MAKE IT YOURS</span><h2>Timer lengths</h2></div>
            <button className="close-settings" type="button" onClick={() => setSettingsOpen(false)} aria-label="Close settings">×</button>
          </div>
          <div className="duration-fields">
            {modes.map((item) => (
              <label key={item.id}>
                <span>{item.label}</span>
                <span className="duration-input-wrap">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={settings[item.id]}
                    aria-label={`${item.label} duration in minutes`}
                    onChange={(event) => setDuration(item.id, Number(event.target.value))}
                  />
                  <span>min</span>
                </span>
              </label>
            ))}
          </div>
          <p className="settings-note">Durations are saved on this device.</p>
        </section>
      )}

      <section className="workspace" id="top">
        <div className="timer-column">
          <div className="intro-row">
            <div>
              <span className="eyebrow">YOUR DAILY RHYTHM</span>
              <h1>One thing<br />at a time<span className="heading-period">.</span></h1>
            </div>
            <div className="session-counter" aria-label={`${completedSessions} focus sessions completed`}>
              <span className="counter-number">{String(completedSessions).padStart(2, '0')}</span>
              <span className="counter-label">SESSIONS<br />TODAY</span>
            </div>
          </div>

          <div className="timer-console">
            <div className="mode-tabs" role="tablist" aria-label="Timer mode">
              {modes.map((item) => (
                <button
                  key={item.id}
                  className={`mode-tab ${mode === item.id ? 'selected' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={mode === item.id}
                  onClick={() => setMode(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <TimerCube />

            <div className="timer-controls">
              <button className="reset-button" type="button" onClick={reset} aria-label="Reset timer" title="Reset timer">
                <span aria-hidden="true">↺</span>
              </button>
              <button className="start-button" type="button" onClick={isRunning ? pause : start}>
                <span className="play-symbol" aria-hidden="true">{isRunning ? 'Ⅱ' : '▶'}</span>
                {isRunning ? 'Pause' : 'Start focus'}
              </button>
              <button className="skip-button" type="button" onClick={skip} aria-label="Skip to next timer" title="Skip to next timer">
                <span aria-hidden="true">↠</span>
              </button>
            </div>
            <p className="timer-message" aria-live="polite">{message || (isRunning ? 'You’re in a focus session. Keep going.' : 'Ready when you are.')}</p>
          </div>
        </div>

        <aside className="focus-column">
          <div className="focus-heading">
            <span className="eyebrow">STAY ON TRACK</span>
            <span className="today-dot" aria-hidden="true" />
          </div>
          <label className="task-label" htmlFor="focus-task">WHAT ARE YOU WORKING ON?</label>
          <input
            id="focus-task"
            className="task-input"
            type="text"
            maxLength={80}
            placeholder="Name your focus..."
            value={focusTask}
            onChange={(event) => setFocusTask(event.target.value)}
          />

          <div className="focus-divider" />
          <div className="daily-progress-heading">
            <div><span className="eyebrow">TODAY SO FAR</span><h2>A steady pace</h2></div>
            <span className="progress-sun" aria-hidden="true">✳</span>
          </div>
          <div className="stat-line">
            <span>Focus time</span>
            <strong>{todayMinutes}<small> min</small></strong>
          </div>
          <div className="progress-track" role="progressbar" aria-label="Sessions completed toward four-session goal" aria-valuenow={Math.min(completedSessions, 4)} aria-valuemin={0} aria-valuemax={4}>
            <span style={{ width: `${Math.min(completedSessions / 4, 1) * 100}%` }} />
          </div>
          <div className="progress-foot"><span>{completedSessions} of 4 sessions</span><span>{Math.max(0, 4 - completedSessions)} to goal</span></div>

          <div className="focus-divider lower-divider" />
          <div className="rhythm-note">
            <span className="note-mark" aria-hidden="true">“</span>
            <p>Small, focused steps add up to remarkable things.</p>
          </div>
          <span className="minutes-today">{todayMinutes} FOCUSED MINUTES TODAY</span>
        </aside>
      </section>

      <footer className="page-footer">
        <span>FIND YOUR PACE.</span>
        <span className="footer-rule" />
        <span>COME BACK REFRESHED.</span>
      </footer>
    </main>
  )
}

export default App