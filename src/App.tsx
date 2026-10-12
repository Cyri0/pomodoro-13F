import { useEffect } from 'react'
import { Cube } from './components/Cube'
import { useTimerStore } from './store/timerStore'

const SESSION_NAMES = ['Fókusz', 'Rövid szünet', 'Újratöltés', 'Mély munka', 'Pihenő', 'Hosszú szünet'] as const

function App() {
  const currentFace = useTimerStore((state) => state.currentFace)
  const durations = useTimerStore((state) => state.durations)
  const remainingSeconds = useTimerStore((state) => state.remainingSeconds)
  const isRunning = useTimerStore((state) => state.isRunning)
  const hasCompleted = useTimerStore((state) => state.hasCompleted)
  const toggleTimer = useTimerStore((state) => state.toggleTimer)
  const resetTimer = useTimerStore((state) => state.resetTimer)
  const syncClock = useTimerStore((state) => state.syncClock)
  const deadline = useTimerStore((state) => state.deadline)

  useEffect(() => {
    if (!isRunning || deadline === null) return

    const updateClock = () => useTimerStore.getState().syncClock()
    const intervalId = window.setInterval(updateClock, 250)
    document.addEventListener('visibilitychange', updateClock)
    updateClock()

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', updateClock)
    }
  }, [deadline, isRunning, syncClock])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return
      const target = event.target
      if (target instanceof HTMLElement && target.closest('button, input, textarea, select, [contenteditable="true"]')) return

      if (event.code === 'Space') {
        event.preventDefault()
        toggleTimer()
      } else if (event.key.toLowerCase() === 'r') {
        resetTimer()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [resetTimer, toggleTimer])

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#home" aria-label="Turn timer home">
          <span className="wordmark-mark" aria-hidden="true"><span /></span>
          <span>TURN<span className="wordmark-period">.</span></span>
        </a>
        <div className="topbar-note"><span className="status-dot" /> Egy fordulat, új ritmus</div>
        <div className="topbar-index">HAT OLDAL <span>/</span> EGY CÉL</div>
      </header>

      <section className="workspace" id="home" aria-label="Pomodoro timer">
        <p className="visually-hidden" role="timer" aria-label={`Time remaining ${Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:${(remainingSeconds % 60).toString().padStart(2, '0')}`} aria-live={hasCompleted ? 'polite' : 'off'}>
          {Math.floor(remainingSeconds / 60).toString().padStart(2, '0')}:{(remainingSeconds % 60).toString().padStart(2, '0')}
        </p>
        <div className="intro">
          <p className="eyebrow"><span>01</span> A TE FÓKUSZIDŐD</p>
          <h1>Egy fordulat.<br /><em>Teljes fókusz.</em></h1>
          <p className="intro-copy">Fordítsd oldalra a kockát,<br className="desktop-break" /> és indul az új időzítő.</p>
          <div className="session-summary" aria-live="polite">
            <span className={`session-indicator${hasCompleted ? ' session-indicator--complete' : isRunning ? '' : ' session-indicator--paused'}`} />
            <strong>{SESSION_NAMES[currentFace]}</strong>
            <span>{durations[currentFace]} perc</span>
            <span className="session-state">{hasCompleted ? 'KÉSZ' : isRunning ? 'FUT' : 'SZÜNETEL'}</span>
          </div>
        </div>

        <div className="object-stage">
          <div className="stage-label"><span>HÚZD OLDALRA</span><span className="stage-cross" aria-hidden="true">+</span></div>
          <Cube />
          <div className="stage-ground" aria-hidden="true" />
          <div className="stage-coordinate" aria-hidden="true">X<span> / </span>Y</div>
        </div>
      </section>
    </main>
  )
}

export default App