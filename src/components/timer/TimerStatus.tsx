import { useTimerStore } from '../../store/timerStore.ts'
import { periodLabel } from '../../lib/timerCycle.ts'

const STATUS_LABEL = {
  idle: 'Idle',
  running: 'Running',
  paused: 'Paused',
} as const

export function TimerStatus() {
  const status = useTimerStore((state) => state.status)
  const periodType = useTimerStore((state) => state.periodType)

  return (
    <p className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-zinc-400">
      <span
        className={`size-1.5 rounded-full ${
          status === 'running' ? 'bg-[var(--accent)]' : status === 'paused' ? 'bg-amber-300' : 'bg-zinc-500'
        }`}
        aria-hidden="true"
      />
      <span>
        {STATUS_LABEL[status]} · {periodLabel(periodType)}
      </span>
    </p>
  )
}
