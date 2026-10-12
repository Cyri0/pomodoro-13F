import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react'
import { Button } from '../ui/Button.tsx'
import { useTimerStore } from '../../store/timerStore.ts'

export function TimerControls() {
  const status = useTimerStore((state) => state.status)
  const start = useTimerStore((state) => state.start)
  const pause = useTimerStore((state) => state.pause)
  const resume = useTimerStore((state) => state.resume)
  const reset = useTimerStore((state) => state.reset)
  const skip = useTimerStore((state) => state.skip)

  const togglePause = () => {
    if (status === 'running') pause()
    else if (status === 'paused') resume()
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        variant="primary"
        onClick={() => start()}
        disabled={status === 'running'}
        icon={<Play className="size-4" aria-hidden="true" />}
      >
        Start
      </Button>
      <Button
        onClick={togglePause}
        disabled={status === 'idle'}
        aria-pressed={status === 'paused'}
        icon={
          status === 'paused' ? (
            <Play className="size-4" aria-hidden="true" />
          ) : (
            <Pause className="size-4" aria-hidden="true" />
          )
        }
      >
        {status === 'paused' ? 'Resume' : 'Pause'}
      </Button>
      <Button
        onClick={reset}
        icon={<RotateCcw className="size-4" aria-hidden="true" />}
      >
        Reset
      </Button>
      <Button
        onClick={() => skip()}
        icon={<SkipForward className="size-4" aria-hidden="true" />}
      >
        Skip
      </Button>
    </div>
  )
}
