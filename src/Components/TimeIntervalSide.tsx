import { useTimerStore, type TimerInterval } from '../store/timerStore'

type CubeSide = 'top' | 'right' | 'bottom' | 'left'

type TimeIntervalSideProps = {
  interval: TimerInterval
  side: CubeSide
}

export function TimeIntervalSide({ interval, side }: TimeIntervalSideProps) {
  const selectInterval = useTimerStore((state) => state.selectInterval)
  const [number, unit] = interval.shortLabel.split(' ')

  return (
    <button
      className={`cube-interval-face cube-interval-${side}`}
      onClick={() => selectInterval(interval)}
      aria-label={`Select ${interval.label}`}
    >
      <span className="face-number">{number}</span>
      <span className="face-unit">{unit}</span>
    </button>
  )
}