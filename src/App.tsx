import { useEffect, useRef, useState } from 'react'
import PomodoroCube from './components/PomodoroCube'
import TimerPanel from './components/TimerPanel'
import { usePomodoroStore } from './store/pomodoroStore'
import type { FaceId } from './utils/getTopFace'

type ModeRequest = { modeId: FaceId; requestId: number }

function App() {
  const activeMode = usePomodoroStore((state) => state.activeMode)
  const isRunning = usePomodoroStore((state) => state.timers[state.activeMode].isRunning)
  const tick = usePomodoroStore((state) => state.tick)
  const isComplete = usePomodoroStore((state) => state.timers[state.activeMode].isComplete)
  const [modeRequest, setModeRequest] = useState<ModeRequest | null>(null)
  const requestIdRef = useRef(0)

  const requestMode = (modeId: FaceId) => {
    requestIdRef.current += 1
    setModeRequest({ modeId, requestId: requestIdRef.current })
  }

  useEffect(() => {
    if (!isRunning) return

    const intervalId = window.setInterval(tick, 1000)
    return () => window.clearInterval(intervalId)
  }, [isRunning, activeMode, tick])

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Pomodoro Cube kezdőlap">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>pomodoro<span className="brand-light">cube</span></span>
        </a>
        <div className="topbar-note">
          <span className="status-dot" />
          Fókuszálj, egyetlen fordulattal
        </div>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow"><span /> A FÓKUSZ IDEJE</p>
          <h1 id="page-title">Adj időt<br />annak, ami <em>számít.</em></h1>
          <p className="hero-description">
            Egyetlen fordítás elég. Válassz egy oldalt, helyezkedj el kényelmesen,
            és szánj néhány percet magadra.
          </p>
          <div className="hero-caption">
            <span className="caption-line" />
            <span>Fordítsd el a kockát a ritmusváltáshoz</span>
          </div>
        </div>

        <div className="cube-column">
          <PomodoroCube selectionRequest={modeRequest} />
          <div className="cube-shadow" aria-hidden="true" />
          <p className="drag-hint"><span aria-hidden="true">↔</span> HÚZD A FORGATÁSHOZ</p>
        </div>
      </section>

      <section className="workspace" aria-label="Pomodoro időzítő">
        <TimerPanel onSelectMode={requestMode} />
        <aside className="session-note" aria-live="polite">
          <span className={`session-note-icon${isComplete ? ' is-complete' : ''}`} aria-hidden="true">
            {isComplete ? '✓' : '✳'}
          </span>
          <span>
            <strong>{isComplete ? 'Szép munka.' : 'Egyszerre csak egy dologra.'}</strong>
            <small>
              {isComplete
                ? 'A menet véget ért. Tarts egy rövid szünetet.'
                : 'Nem kell mindent most megoldanod. Elég a következő lépés.'}
            </small>
          </span>
        </aside>
      </section>

      <footer className="page-footer">
        <span>HELY A MÉLY MUNKÁHOZ</span>
        <span>A TE PILLANATODRA HANGOLVA <i>·</i> 01</span>
      </footer>
    </main>
  )
}

export default App
