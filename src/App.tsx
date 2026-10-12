import { useEffect } from 'react'
import { SiteHeader } from './components/SiteHeader'
import { TimerPanel } from './components/TimerPanel'
import { MODES, TIMER_PRESETS } from './constants'
import { useTimerStore } from './stores/timerStore'
import { formatTime } from './utils'

function App() {
  const mode = useTimerStore((state) => state.mode)
  const secondsLeft = useTimerStore((state) => state.secondsLeft)
  const isRunning = useTimerStore((state) => state.isRunning)
  const completedSessions = useTimerStore((state) => state.completedSessions)
  const customDuration = useTimerStore((state) => state.customDuration)
  const tick = useTimerStore((state) => state.tick)
  const selectDuration = useTimerStore((state) => state.selectDuration)
  const toggleTimer = useTimerStore((state) => state.toggleTimer)
  const resetTimer = useTimerStore((state) => state.resetTimer)
  const selectedMinutes = Math.round((customDuration ?? MODES[mode].duration) / 60)

  useEffect(() => {
    if (!isRunning) {
      return
    }

    const interval = window.setInterval(tick, 200)
    return () => window.clearInterval(interval)
  }, [isRunning, tick])

  useEffect(() => {
    document.title = `${formatTime(secondsLeft)} · ${MODES[mode].label} — Little Timer`
  }, [mode, secondsLeft])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault()
        const currentIndex = TIMER_PRESETS.indexOf(selectedMinutes)
        const direction = event.key === 'ArrowRight' ? 1 : -1
        const nextIndex = (currentIndex + direction + TIMER_PRESETS.length) % TIMER_PRESETS.length
        selectDuration(TIMER_PRESETS[nextIndex])
      } else if (target instanceof HTMLElement && target.closest('button, a')) {
        return
      } else if (event.code === 'Space') {
        event.preventDefault()
        toggleTimer()
      } else if (event.key.toLowerCase() === 'r') {
        resetTimer()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [resetTimer, selectDuration, selectedMinutes, toggleTimer])

  return (
    <main className="app-shell">
      <SiteHeader />

      <section className="timer-space">
        <div className="intro">
          <span className="eyebrow">EGY KIS IDŐ, JÓL ELTÖLTVE</span>
          <h1>Adj időt<br /><span>annak, ami</span><br />számít.</h1>
          <p>Fordítsd el a kockát az idő beállításához.<br />Figyelj arra, ami most előtted van.</p>
        </div>

        <TimerPanel />

        <div className="side-note">
          <span className="side-note-mark" aria-hidden="true">✳</span>
          <span>NÉGY FÓKUSZIDŐ UTÁN<br />HOSSZÚ SZÜNET JÁR</span>
          <span className="completed-count">
            {completedSessions.toString().padStart(2, '0')} <small>KÉSZ</small>
          </span>
        </div>
      </section>

      <footer className="page-footer">
        <span>EGYSZERRE CSAK EGY DOLOG</span>
        <span>SZÓKÖZ: INDÍTÁS <i>·</i> R: ÚJRAINDÍTÁS <i>·</i> NYILAK: IDŐBEÁLLÍTÁS</span>
        <span>TARTS EGY KIS SZÜNETET</span>
      </footer>
    </main>
  )
}

export default App
