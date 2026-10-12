import { completedFocusInCycle, cycleLength, periodLabel, periodPrompt } from '../../lib/timerCycle.ts'
import { formatMmSs } from '../../lib/timeFormatting.ts'
import { useTimerStore } from '../../store/timerStore.ts'

export function TimerDisplay() {
  const remainingMs = useTimerStore((state) => state.remainingMs)
  const periodType = useTimerStore((state) => state.periodType)
  const cycleIndex = useTimerStore((state) => state.cycleIndex)
  const config = useTimerStore((state) => state.config)
  const position = (cycleIndex % cycleLength(config.focusSessionsBeforeLongBreak)) + 1
  const completed = completedFocusInCycle(cycleIndex, config.focusSessionsBeforeLongBreak)

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-sm text-zinc-400">
        Cycle step {position} of {cycleLength(config.focusSessionsBeforeLongBreak)} · {completed}/
        {config.focusSessionsBeforeLongBreak} focus sessions
      </p>
      <p className="sr-only">
        {periodLabel(periodType)} remaining {formatMmSs(remainingMs)}. {periodPrompt(periodType)}.
      </p>
    </div>
  )
}
