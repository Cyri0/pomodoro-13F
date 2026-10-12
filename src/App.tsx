import { useCallback, useEffect, useRef, useState } from 'react'
import { SiteHeader } from './components/SiteHeader'
import { TimerPanel } from './components/TimerPanel'
import { MODES, TIMER_PRESETS, type Mode } from './constants'
import { formatTime } from './utils'

function App() {
  const [mode, setMode] = useState<Mode>('focus')
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.duration)
  const [customDuration, setCustomDuration] = useState<number | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [notice, setNotice] = useState('Fordítsd el a kockát az idő beállításához.')
  const deadlineRef = useRef<number | null>(null)
  const startRemainingRef = useRef(secondsLeft)

  const duration = customDuration ?? MODES[mode].duration
  const selectedMinutes = Math.round(duration / 60)
  const progress = 1 - secondsLeft / duration

  useEffect(() => {
    if (!isRunning) {
      deadlineRef.current = null
      return
    }

    deadlineRef.current = Date.now() + startRemainingRef.current * 1000
    const interval = window.setInterval(() => {
      const seconds = Math.max(0, Math.ceil((deadlineRef.current! - Date.now()) / 1000))
      setSecondsLeft(seconds)
      if (seconds > 0) return

      window.clearInterval(interval)
      setIsRunning(false)
      setCustomDuration(null)
      if (mode === 'focus') {
        const finishedCount = completedSessions + 1
        setCompletedSessions(finishedCount)
        const nextMode: Mode = finishedCount % 4 === 0 ? 'longBreak' : 'shortBreak'
        setMode(nextMode)
        setSecondsLeft(MODES[nextMode].duration)
        setNotice(`A fókuszidő lejárt. Következik: ${MODES[nextMode].label.toLowerCase()}.`)
      } else {
        setMode('focus')
        setSecondsLeft(MODES.focus.duration)
        setNotice('A szünet véget ért. Jöhet egy újabb fókuszidő?')
      }
    }, 200)

    return () => window.clearInterval(interval)
  }, [completedSessions, isRunning, mode])

  useEffect(() => {
    document.title = `${formatTime(secondsLeft)} · ${MODES[mode].label} — Little Timer`
  }, [mode, secondsLeft])

  const selectDuration = useCallback((minutes: number) => {
    setIsRunning(false)
    setCustomDuration(minutes * 60)
    setSecondsLeft(minutes * 60)
    setNotice(`${minutes} perc ${mode === 'focus' ? 'fókuszidő' : 'szünet'} kiválasztva.`)
  }, [mode])

  const selectMode = useCallback((nextMode: Mode) => {
    setIsRunning(false)
    setMode(nextMode)
    setCustomDuration(null)
    setSecondsLeft(MODES[nextMode].duration)
    setNotice(`${MODES[nextMode].label} kiválasztva.`)
  }, [])

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      const remaining = deadlineRef.current
        ? Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000))
        : secondsLeft
      setSecondsLeft(remaining)
      setIsRunning(false)
      setNotice('Az időzítő szünetel.')
      return
    }

    if (secondsLeft === 0) setSecondsLeft(duration)
    startRemainingRef.current = secondsLeft === 0 ? duration : secondsLeft
    setIsRunning(true)
    setNotice('Elindult az időzítő. Menni fog!')
  }, [duration, isRunning, secondsLeft])

  const resetTimer = useCallback(() => {
    setIsRunning(false)
    setSecondsLeft(duration)
    setNotice('Az időzítő újraindítva.')
  }, [duration])

  const skipSession = useCallback(() => {
    const nextMode: Mode = mode === 'focus' ? 'shortBreak' : 'focus'
    selectMode(nextMode)
  }, [mode, selectMode])

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
      <SiteHeader onHelp={() => setNotice('A kockát elforgatva választhatsz időtartamot.')} />

      <section className="timer-space">
        <div className="intro">
          <span className="eyebrow">EGY KIS IDŐ, JÓL ELTÖLTVE</span>
          <h1>Adj időt<br /><span>annak, ami</span><br />számít.</h1>
          <p>Fordítsd el a kockát az idő beállításához.<br />Figyelj arra, ami most előtted van.</p>
        </div>

        <TimerPanel
          mode={mode}
          secondsLeft={secondsLeft}
          selectedMinutes={selectedMinutes}
          progress={progress}
          isRunning={isRunning}
          completedSessions={completedSessions}
          notice={notice}
          onPresetSelect={selectDuration}
          onModeSelect={selectMode}
          onToggle={toggleTimer}
          onReset={resetTimer}
          onSkip={skipSession}
        />

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
