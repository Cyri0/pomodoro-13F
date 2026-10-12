import { selectPreset, selectRemaining, useTimer } from '../store'
import { Digit } from './SevenSegment'

const TICKS = 60

export function Display() {
  const remainingMs = useTimer(selectRemaining)
  const durationMs = useTimer((s) => s.durationMs)
  const status = useTimer((s) => s.status)
  const mode = useTimer((s) => selectPreset(s).mode)

  const totalSec = Math.ceil(remainingMs / 1000)
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0')
  const ss = String(totalSec % 60).padStart(2, '0')
  const lit = Math.ceil((remainingMs / durationMs) * TICKS)
  const accent = mode === 'focus' || mode === 'deep' ? 'work' : 'rest'

  return (
    <div className={`screen ${accent} ${status}`}>
      <svg className="ring" viewBox="-100 -100 200 200" aria-hidden>
        {Array.from({ length: TICKS }, (_, i) => (
          <rect
            key={i}
            x={-2.6}
            y={-95}
            width={5.2}
            height={15}
            rx={1}
            transform={`rotate(${i * (360 / TICKS)})`}
            className={i < lit ? 'tick on' : 'tick'}
          />
        ))}
      </svg>
      <div className="digits">
        <Digit value={mm[0]} />
        <Digit value={mm[1]} />
        <span className="colon">
          <i />
          <i />
        </span>
        <Digit value={ss[0]} />
        <Digit value={ss[1]} />
      </div>
    </div>
  )
}
