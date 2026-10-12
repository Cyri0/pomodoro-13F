import { MODES, MODE_OPTIONS, TIMER_PRESETS, type Mode } from '../constants'
import { formatTime } from '../utils'
import { CubeScene } from './CubeScene'

type TimerPanelProps = {
  mode: Mode
  secondsLeft: number
  selectedMinutes: number
  progress: number
  isRunning: boolean
  completedSessions: number
  notice: string
  onPresetSelect: (minutes: number) => void
  onModeSelect: (mode: Mode) => void
  onToggle: () => void
  onReset: () => void
  onSkip: () => void
}

export function TimerPanel({
  mode,
  secondsLeft,
  selectedMinutes,
  progress,
  isRunning,
  completedSessions,
  notice,
  onPresetSelect,
  onModeSelect,
  onToggle,
  onReset,
  onSkip,
}: TimerPanelProps) {
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
        <CubeScene
          mode={mode}
          seconds={secondsLeft}
          progress={progress}
          selectedMinutes={selectedMinutes}
          onPresetSelect={onPresetSelect}
        />
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
            onClick={() => onPresetSelect(minutes)}
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
            onClick={() => onModeSelect(option)}
            aria-pressed={mode === option}
          >
            {MODES[option].label}
          </button>
        ))}
      </div>

      <div className="timer-controls">
        <button className="primary-control" onClick={onToggle}>
          <span aria-hidden="true">{isRunning ? 'Ⅱ' : '▶'}</span>
          {isRunning ? 'Szünet' : 'Indítás'}
        </button>
        <button className="icon-control" onClick={onReset} aria-label="Időzítő újraindítása" title="Újraindítás">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.2 7.2A6.4 6.4 0 1 1 3.7 11M4.2 3.8v3.7H8" /></svg>
        </button>
        <button className="icon-control" onClick={onSkip} aria-label="Ugrás a következő időszakra" title="Következő időszak">
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
