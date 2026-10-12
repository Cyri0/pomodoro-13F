import { usePomodoroStore, POMODORO_MODES } from '../store/pomodoroStore'
import { formatTime } from '../utils/formatTime'
import type { FaceId } from '../utils/getTopFace'
import ModeSelector from './ModeSelector'
import './TimerPanel.css'

type TimerPanelProps = {
  onSelectMode: (modeId: FaceId) => void
}

function TimerPanel({ onSelectMode }: TimerPanelProps) {
  const activeMode = usePomodoroStore((state) => state.activeMode)
  const timer = usePomodoroStore((state) => state.timers[state.activeMode])
  const toggleActiveTimer = usePomodoroStore((state) => state.toggleActiveTimer)
  const resetActiveTimer = usePomodoroStore((state) => state.resetActiveTimer)
  const mode = POMODORO_MODES.find((item) => item.id === activeMode)

  if (!mode) {
    throw new Error(`Unknown active Pomodoro mode: ${activeMode}`)
  }

  const progress = Math.max(0, Math.min(100, (timer.remainingSeconds / (mode.minutes * 60)) * 100))

  return (
    <div className="timer-panel">
      <div className="timer-heading">
        <div>
          <p className="panel-kicker"><span /> AKTUÁLIS MENET</p>
          <h2>{mode.name}</h2>
        </div>
        <div className={`timer-state${timer.isRunning ? ' is-running' : ''}`}>
          <span />
          {timer.isComplete ? 'Kész' : timer.isRunning ? 'Fókuszban' : 'Kezdésre kész'}
        </div>
      </div>

      <div className="timer-readout" aria-live="off" aria-label={`${formatTime(timer.remainingSeconds)} hátralévő idő`}>
        {formatTime(timer.remainingSeconds)}
      </div>

      <div
        className="timer-progress"
        role="progressbar"
        aria-label="Hátralévő idő"
        aria-valuemin={0}
        aria-valuemax={mode.minutes * 60}
        aria-valuenow={timer.remainingSeconds}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="timer-progress-labels">
        <span>{timer.isComplete ? 'A MENET VÉGET ÉRT' : 'HÁTRALÉVŐ IDŐ'}</span>
        <span>{mode.minutes} PERC</span>
      </div>

      <div className="timer-actions">
        <button className="start-button" type="button" onClick={toggleActiveTimer}>
          <span aria-hidden="true">{timer.isRunning ? 'Ⅱ' : '▶'}</span>
          {timer.isRunning ? 'Szüneteltetés' : 'Indítás'}
        </button>
        <button className="reset-button" type="button" onClick={resetActiveTimer} aria-label={`${mode.name} időzítő visszaállítása`}>
          <span aria-hidden="true">↺</span>
          Visszaállítás
        </button>
      </div>

      <div className="mode-list-heading">
        <span>A TE RITMUSOD</span>
        <span>VÁLASSZ MÓDOT</span>
      </div>
      <ModeSelector onSelectMode={onSelectMode} />
    </div>
  )
}

export default TimerPanel
