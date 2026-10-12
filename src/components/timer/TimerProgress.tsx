import { completedFocusInCycle } from '../../lib/timerCycle.ts'
import { useTimerStore } from '../../store/timerStore.ts'

export function TimerProgress() {
  const cycleIndex = useTimerStore((state) => state.cycleIndex)
  const config = useTimerStore((state) => state.config)
  const completedFocusTotal = useTimerStore((state) => state.completedFocusTotal)
  const periodType = useTimerStore((state) => state.periodType)
  const completed = completedFocusInCycle(cycleIndex, config.focusSessionsBeforeLongBreak)
  const markers = Array.from({ length: config.focusSessionsBeforeLongBreak }, (_, index) => index)

  return (
    <section className="mx-auto flex w-full max-w-md flex-col items-center gap-3 px-4" aria-label="Session progress">
      <div className="flex items-center gap-2" role="list">
        {markers.map((index) => {
          const filled = index < completed
          const current = periodType === 'focus' && index === completed
          return (
            <span
              key={index}
              role="listitem"
              className={`h-2.5 rounded-full transition-all duration-500 ${
                filled ? 'w-7 bg-[var(--accent)]' : current ? 'w-5 bg-[var(--accent)]/50' : 'w-2.5 bg-white/15'
              }`}
              aria-label={
                filled
                  ? `Focus session ${index + 1} complete`
                  : current
                    ? `Focus session ${index + 1} in progress`
                    : `Focus session ${index + 1} remaining`
              }
            />
          )
        })}
      </div>
      <p className="text-xs tracking-wide text-zinc-500">
        {completedFocusTotal} focus {completedFocusTotal === 1 ? 'session' : 'sessions'} completed this run
      </p>
    </section>
  )
}
