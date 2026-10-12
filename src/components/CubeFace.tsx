import type { CSSProperties } from 'react'
import { POMODORO_MODES, usePomodoroStore, type PomodoroMode } from '../store/pomodoroStore'
import { formatTime } from '../utils/formatTime'
import { getFaceUprightAngle } from '../utils/getTopFace'

type CubeFaceProps = {
  mode: PomodoroMode
  rotationX: number
  rotationY: number
}

function CubeFace({ mode, rotationX, rotationY }: CubeFaceProps) {
  const remainingSeconds = usePomodoroStore((state) => state.timers[mode.id].remainingSeconds)
  const activeMode = usePomodoroStore((state) => state.activeMode)
  const isActive = activeMode === mode.id
  const activeModeDefinition = POMODORO_MODES.find((item) => item.id === activeMode)
  const isCountdown = isActive && activeModeDefinition !== undefined
  const tickMarks = isCountdown ? Array.from({ length: 48 }, (_, index) => index) : []
  const contentStyle = {
    '--content-roll': `${getFaceUprightAngle(mode.position, rotationX, rotationY)}deg`,
  } as CSSProperties

  return (
    <div
      className={`cube-face cube-face--${mode.position}${isActive ? ' is-active' : ''}`}
      style={contentStyle}
      aria-label={isCountdown
        ? `${mode.name}, ${formatTime(remainingSeconds)} hátralévő idő`
        : `${mode.name}, ${mode.minutes} perces időzítő`}
    >
      <div className="face-content">
        <div className="face-label">
          <span className="face-name">{mode.name}</span>
        </div>
        <div className={`face-display${isCountdown ? ' is-countdown' : ' is-duration'}`} aria-hidden="true">
          {isCountdown && (
            <div className="display-ticks">
              {tickMarks.map((mark) => (
                <span
                  className={`display-tick${mark < Math.ceil((remainingSeconds / (mode.minutes * 60)) * 48) ? ' is-lit' : ''}`}
                  key={mark}
                  style={{ transform: `rotate(${mark * 7.5}deg) translateY(calc(var(--tick-radius) * -1))` }}
                />
              ))}
            </div>
          )}
          <span className="face-time">
            {isCountdown ? formatTime(remainingSeconds) : String(mode.minutes).padStart(2, '0')}
          </span>
          <span className="face-mode">{isCountdown ? mode.shortName : 'PERC'}</span>
        </div>
        <span className="face-active-indicator" aria-hidden="true" />
      </div>
    </div>
  )
}

export default CubeFace
