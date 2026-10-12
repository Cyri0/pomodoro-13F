import { MODES, MODE_OPTIONS, TIMER_PRESETS } from '../constants'
import { useTimerStore } from '../stores/timerStore'
import { formatTime } from '../utils'
import { CubeScene } from './CubeScene'

export function TimerPanel() {
  const mode = useTimerStore((state) => state.mode)
  const secondsLeft = useTimerStore((state) => state.secondsLeft)
  const customDuration = useTimerStore((state) => state.customDuration)
  const isRunning = useTimerStore((state) => state.isRunning)
  const completedSessions = useTimerStore((state) => state.completedSessions)
  const notice = useTimerStore((state) => state.notice)
  const selectDuration = useTimerStore((state) => state.selectDuration)
  const selectMode = useTimerStore((state) => state.selectMode)
  const toggleTimer = useTimerStore((state) => state.toggleTimer)
  const resetTimer = useTimerStore((state) => state.resetTimer)
  const skipSession = useTimerStore((state) => state.skipSession)
  const duration = customDuration ?? MODES[mode].duration
  const selectedMinutes = Math.round(duration / 60)
  return (
    <section className="timer-panel" aria-label="Pomodoro-időzítő">
      <div className="panel-topline">
        <span className="session-label">{mode === 'focus' ? 'FÓKUSZIDŐ' : 'ITT AZ IDEJE PIHENNI'}</span>
        <span className={`running-indicator ${isRunning ? 'is-running' : ''}`}>
          <span /> {isRunning ? 'ELINDÍTVA' : 'INDULÁSRA KÉSZ'}
        </span>
      </div>

      <div className="cube-wrap">
        <div className="cube-shadow" />
        <CubeScene />
        <span className="drag-hint"><span aria-hidden="true">↻</span> FORGASD EL</span>
      </div>

      <div className="selected-time">
        <strong>{selectedMinutes}<span> perc</span></strong>
        <span className="selected-description">{mode === 'focus' ? 'elmélyült munkára' : 'feltöltődésre'}</span>
      </div>

      <div className="preset-picker" aria-label="Időtartam kiválasztása">
        {TIMER_PRESETS.map((minutes) => (
          <button
            key={minutes}
            className={minutes === selectedMinutes ? 'is-selected' : ''}
            onClick={() => selectDuration(minutes)}
            aria-pressed={minutes === selectedMinutes}
          >
            {minutes}
          </button>
        ))}
        <span>PERC</span>
      </div>

      <div className="mode-picker" role="group" aria-label="Időzítő módjának kiválasztása">
        {MODE_OPTIONS.map((option) => (
          <button
            key={option}
            className={mode === option ? 'is-selected' : ''}
            onClick={() => selectMode(option)}
            aria-pressed={mode === option}
          >
            {MODES[option].label}
          </button>
        ))}
      </div>

      <div className="timer-controls">
        <button className="primary-control" onClick={toggleTimer}>
          <span aria-hidden="true">{isRunning ? 'Ⅱ' : '▶'}</span>
          {isRunning ? 'Szünet' : 'Indítás'}
        </button>
        <button className="icon-control" onClick={resetTimer} aria-label="Időzítő újraindítása" title="Újraindítás">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.2 7.2A6.4 6.4 0 1 1 3.7 11M4.2 3.8v3.7H8" /></svg>
        </button>
        <button className="icon-control" onClick={skipSession} aria-label="Ugrás a következő időszakra" title="Következő időszak">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 4 8 6-8 6zM15 4v12" /></svg>
        </button>
      </div>

      <p className="timer-notice" aria-live="polite">{notice}</p>
      <p className="sr-only">
        {MODES[mode].label}: {formatTime(secondsLeft)} van hátra. {completedSessions} fókuszidő teljesítve.
      </p>
    </section>
  )
}
