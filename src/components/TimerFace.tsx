import type { CSSProperties } from 'react'
import type { Session } from '../timerStore'

type TimerFaceProps = {
  session: Session
  index: number
  selected: boolean
  remainingSeconds: number | null
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remainder = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainder}`
}

const TimerFace = ({ session, index, selected, remainingSeconds }: TimerFaceProps) => {
  const totalSeconds = session.minutes === null ? null : session.minutes * 60
  const faceTime = session.minutes === null
    ? null
    : selected && remainingSeconds !== null ? remainingSeconds : totalSeconds
  const progress = totalSeconds === null || faceTime === null
    ? 0
    : Math.min(100, Math.max(0, (1 - faceTime / totalSeconds) * 100))

  return (
    <div
      className={`cube-face face-${session.id}`}
      aria-label={session.minutes === null ? `${session.name}, timer paused` : `${session.name}, ${session.minutes} minutes`}
    >
      <span className="face-index">0{index + 1} <span>/</span> {session.minutes === null ? 'PAUSE' : 'TIMER'}</span>
      <div className="face-copy">
        <span className="face-name">{session.name}</span>
        <div className={`timer-display${faceTime === null ? ' is-paused' : ''}`}>
          <div
            className="timer-ring"
            style={{ '--timer-progress': `${progress}%` } as CSSProperties}
            aria-hidden="true"
          />
          <div className="timer-screen">
            {faceTime === null ? (
              <>
                <span className="pause-symbol" aria-hidden="true">Ⅱ</span>
                <span className="pause-label">PAUSED</span>
              </>
            ) : (
              <span className="face-time" aria-live={selected ? 'polite' : undefined}>
                {formatTime(faceTime)}
              </span>
            )}
          </div>
        </div>
        <span className="face-note">{session.note}</span>
      </div>
    </div>
  )
}

export default TimerFace