import { PRESETS, SESSIONS_PER_CYCLE, selectFilledPips, selectIndex, useTimer } from '../store'

export function Controls() {
  const index = useTimer(selectIndex)
  const status = useTimer((s) => s.status)
  const completedFocus = useTimer((s) => s.completedFocus)
  const filledPips = useTimer(selectFilledPips)
  const { flipTo, flipBy, toggle, reset } = useTimer.getState()

  return (
    <section className="controls">
      <div className="modes" role="tablist" aria-label="Timer preset">
        {PRESETS.map((p, i) => (
          <button
            key={p.mode}
            role="tab"
            aria-selected={i === index}
            className={i === index ? 'chip active' : 'chip'}
            onClick={() => flipTo(i)}
          >
            {p.label}
            <small>{p.minutes}</small>
          </button>
        ))}
      </div>

      <div className="actions">
        <button className="ghost" onClick={() => flipBy(-1)} aria-label="Roll cube left">
          ↺
        </button>
        <button className="primary" onClick={toggle} disabled={status === 'done'}>
          {status === 'running' ? 'Pause' : status === 'paused' ? 'Resume' : 'Start'}
        </button>
        <button className="ghost" onClick={reset} disabled={status === 'idle'}>
          Reset
        </button>
        <button className="ghost" onClick={() => flipBy(1)} aria-label="Roll cube right">
          ↻
        </button>
      </div>

      <div className="sessions" aria-label={`${completedFocus} focus sessions completed`}>
        {Array.from({ length: SESSIONS_PER_CYCLE }, (_, i) => (
          <span key={i} className={i < filledPips ? 'pip on' : 'pip'} />
        ))}
        <span className="count">{completedFocus} done</span>
      </div>

      <p className="hint">
        <kbd>Space</kbd> start / pause · <kbd>←</kbd> <kbd>→</kbd> roll the cube · <kbd>R</kbd> reset · click a face to flip
        to it
      </p>
    </section>
  )
}
