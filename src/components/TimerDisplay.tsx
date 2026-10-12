type TimerDisplayProps = { remainingSeconds: number; totalSeconds: number; isCompleted: boolean; variant?: 'panel' | 'cube' }

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remaining = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remaining}`
}

export function TimerDisplay({ remainingSeconds, totalSeconds, isCompleted, variant = 'panel' }: TimerDisplayProps) {
  const progress = totalSeconds === 0 ? 0 : Math.min(1, Math.max(0, remainingSeconds / totalSeconds))
  const circumference = 283
  return (
    <div className={`timer-display timer-display--${variant}`}>
      <div className={`timer-digits timer-digits--${variant}${isCompleted ? ' timer-digits--complete' : ''}`} role="timer" aria-label={`Time remaining ${formatTime(remainingSeconds)}`} aria-live={isCompleted ? 'polite' : 'off'}>{formatTime(remainingSeconds)}</div>
      <div className={`timer-caption timer-caption--${variant}`}><span>TIME REMAINING</span><strong>{Math.round(progress * 100)}%</strong></div>
      {variant === 'cube' ? (
        <svg className="timer-progress timer-progress--cube" viewBox="0 0 100 100" aria-hidden="true">
          <circle className="timer-progress-track" cx="50" cy="50" r="45" pathLength="100" strokeDasharray="1.1 0.82" />
          <circle className="timer-progress-value" cx="50" cy="50" r="45" pathLength="100" strokeDasharray="1.1 0.82" strokeDashoffset={100 * (1 - progress)} />
        </svg>
      ) : (
        <svg className="timer-progress" viewBox="0 0 283 2" preserveAspectRatio="none" aria-hidden="true">
          <path className="timer-progress-track" d="M1 1H282" />
          <path className="timer-progress-value" d="M1 1H282" pathLength={circumference} strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} />
        </svg>
      )}
    </div>
  )
}