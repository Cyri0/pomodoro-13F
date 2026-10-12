import { useEffect } from 'react'
import { Cube } from './components/Cube/Cube'
import { Footer } from './components/Footer/Footer'
import { Header } from './components/Header/Header'
import { ModeSelector } from './components/ModeSelector/ModeSelector'
import { TimerControls } from './components/TimerControls/TimerControls'
import { useTimerStore, facePositions } from './store/timerStore'
import styles from './App.module.css'

function App() {
  const faces = useTimerStore((state) => state.faces)
  const activeFace = useTimerStore((state) => state.activeFace)
  const isRunning = useTimerStore((state) => state.isRunning)
  const selectFace = useTimerStore((state) => state.selectFace)
  const toggleRunning = useTimerStore((state) => state.toggleRunning)
  const reset = useTimerStore((state) => state.reset)
  const adjustTime = useTimerStore((state) => state.adjustTime)
  const tick = useTimerStore((state) => state.tick)
  const active = faces.find((face) => face.id === activeFace) ?? faces[0]

  useEffect(() => {
    if (!isRunning) return
    const interval = window.setInterval(tick, 1000)
    return () => window.clearInterval(interval)
  }, [isRunning, tick])

  return (
    <main className={styles.appShell} style={{ '--active-tint': active.tint } as React.CSSProperties}>
      <Header />
      <section className={styles.workspace} aria-label="Pomodoro timer">
        <ModeSelector faces={faces} activeFace={activeFace} onSelect={selectFace} />
        <div className={styles.timerStage}>
          <div className={styles.stageCaption}><span>TURN THE CUBE</span><span>6 SIDES · 6 RHYTHMS</span></div>
          <Cube faces={faces} activeFace={activeFace} isRunning={isRunning} position={facePositions[activeFace]} onSelect={selectFace} />
          <TimerControls isRunning={isRunning} onToggle={toggleRunning} onReset={reset} onAdjust={adjustTime} />
        </div>
      </section>
      <Footer />
    </main>
  )
}

export default App