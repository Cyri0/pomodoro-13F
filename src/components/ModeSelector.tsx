import { POMODORO_MODES, usePomodoroStore } from '../store/pomodoroStore'
import { formatTime } from '../utils/formatTime'
import type { FaceId } from '../utils/getTopFace'
import './TimerPanel.css'

type ModeSelectorProps = {
  onSelectMode: (modeId: FaceId) => void
}

function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  const activeMode = usePomodoroStore((state) => state.activeMode)
  const timers = usePomodoroStore((state) => state.timers)

  return (
    <div className="mode-selector" aria-label="Válassz időzítő módot">
      {POMODORO_MODES.map((mode) => {
        const timer = timers[mode.id]
        const percentage = Math.round((timer.remainingSeconds / (mode.minutes * 60)) * 100)

        return (
          <button
            className={`mode-option${activeMode === mode.id ? ' is-selected' : ''}`}
            key={mode.id}
            type="button"
            onClick={() => onSelectMode(mode.id)}
            aria-pressed={activeMode === mode.id}
          >
            <span className={`mode-symbol mode-symbol--${mode.category}`} aria-hidden="true">
              {mode.category === 'focus' ? '◌' : mode.category === 'break' ? '⌁' : '↺'}
            </span>
            <span className="mode-copy">
              <span className="mode-title">{mode.name}</span>
              <span className="mode-subtitle">{mode.minutes} perc</span>
            </span>
            <span className="mode-option-time">{formatTime(timer.remainingSeconds)}</span>
            <span className="mode-progress" aria-hidden="true">
              <span style={{ width: `${percentage}%` }} />
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default ModeSelector
