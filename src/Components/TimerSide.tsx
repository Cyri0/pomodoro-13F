import { useTimerStore, timerIntervals } from '../store/timerStore'

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remainder = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainder}`
}

export function TimerSide() {
  const remaining = useTimerStore((state) => state.remaining)
  const selectedId = useTimerStore((state) => state.selectedId)
  const status = useTimerStore((state) => state.status)
  const toggleTimer = useTimerStore((state) => state.toggleTimer)
  const selectedInterval = timerIntervals.find(({ id }) => id === selectedId) ?? timerIntervals[0]
  const selectedIndex = timerIntervals.findIndex(({ id }) => id === selectedId)
  const progress = status === 'ready' ? 1 : remaining / selectedInterval.seconds

  return (
    <button
      className="cube-timer-face"
      onClick={toggleTimer}
      aria-label={status === 'running' ? 'Pause timer' : 'Start timer'}
    >
      <div className={`display-ring display-ring-turn-${selectedIndex} ${status === 'finished' ? 'is-finished' : ''}`}>
        <svg className="progress-ring" viewBox="0 0 220 220" aria-hidden="true">
          <circle className="ring-track" cx="110" cy="110" r="99" />
          <circle
            className="ring-progress"
            cx="110"
            cy="110"
            r="99"
            style={{ strokeDashoffset: `${622 * (1 - progress)}` }}
          />
        </svg>
        <span className="display-time">{status === 'finished' ? 'DONE' : formatTime(remaining)}</span>
        <span className="display-caption">
          {status === 'running' ? 'KEEP GOING' : status === 'paused' ? 'PAUSED' : status === 'finished' ? 'NICE WORK' : 'READY WHEN YOU ARE'}
        </span>
      </div>
    </button>
  )
}