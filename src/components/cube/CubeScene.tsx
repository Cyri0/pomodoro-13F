import { useTimerStore } from '../../store/timerStore.ts'
import { TimerCube } from './TimerCube.tsx'
import './cube.css'

export function CubeScene() {
  const cycleIndex = useTimerStore((state) => state.cycleIndex)
  const remainingMs = useTimerStore((state) => state.remainingMs)
  const config = useTimerStore((state) => state.config)
  const justCompletedType = useTimerStore((state) => state.justCompletedType)

  return (
    <div className="relative grid place-items-center px-4 py-10 sm:py-12">
      <div className="cube-scene">
        <TimerCube
          cycleIndex={cycleIndex}
          focusSessionsBeforeLongBreak={config.focusSessionsBeforeLongBreak}
          remainingMs={remainingMs}
          config={config}
          justCompleted={justCompletedType !== null}
        />
      </div>
      <div
        className="pointer-events-none absolute -bottom-5 h-10 w-[68%] rounded-[100%] bg-black/50 blur-2xl"
        aria-hidden="true"
      />
    </div>
  )
}
