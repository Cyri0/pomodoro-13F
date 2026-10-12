import { useTimerStore } from '../features/timer/timerStore'
import { formatTime, sessions } from '../features/timer/sessions'

export function SessionPicker() {
  const selectedId = useTimerStore((state) => state.selectedId)
  const selectSession = useTimerStore((state) => state.selectSession)

  return (
    <div className="session-picker" aria-label="Időtartam kiválasztása">
      {sessions.map((session) => (
        <button
          className={`session-option${selectedId === session.id ? ' is-selected' : ''}`}
          key={session.id}
          onClick={() => selectSession(session)}
          aria-label={`${session.minutes} perc`}
          aria-pressed={selectedId === session.id}
        >
          {formatTime(session.minutes * 60)}
        </button>
      ))}
    </div>
  )
}
