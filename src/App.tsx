import { useEffect, useRef, type PointerEvent } from 'react'
import { TimeIntervalSide } from './Components/TimeIntervalSide'
import { TimerSide } from './Components/TimerSide'
import { timerIntervals, useTimerStore } from './store/timerStore'

const cubeFaces = ['top', 'right', 'bottom', 'left'] as const

function App() {
  const rotationStep = useTimerStore((state) => state.rotationStep)
  const status = useTimerStore((state) => state.status)
  const tick = useTimerStore((state) => state.tick)
  const rollCube = useTimerStore((state) => state.rollCube)
  const dragStart = useRef<number | null>(null)
  const ignoreClickUntil = useRef(0)

  useEffect(() => {
    if (status !== 'running') return
    const interval = window.setInterval(tick, 200)
    return () => window.clearInterval(interval)
  }, [status, tick])

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    dragStart.current = event.clientX
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>) {
    if (dragStart.current === null) return
    const distance = event.clientX - dragStart.current
    dragStart.current = null
    if (Math.abs(distance) < 35) return
    ignoreClickUntil.current = Date.now() + 400
    rollCube(distance < 0 ? 1 : -1)
  }

  return (
    <main
      className="app-shell"
      aria-label="Timer cube. Swipe left or right to choose a duration."
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { dragStart.current = null }}
      onClickCapture={(event) => {
        if (Date.now() >= ignoreClickUntil.current) return
        ignoreClickUntil.current = 0
        event.preventDefault()
        event.stopPropagation()
      }}
    >
      <div className="cube-stage">
        <div className="cube-scene" aria-label="Timer cube">
          <div
            className="cube-shell"
            style={{ transform: `rotateX(-22deg) rotateY(-25deg) rotateZ(${-rotationStep * 90}deg)` }}
          >
            {timerIntervals.map((interval, index) => (
              <TimeIntervalSide
                key={interval.id}
                interval={interval}
                side={cubeFaces[index]}
              />
            ))}
            <TimerSide />
          </div>
        </div>
      </div>
    </main>
  )
}

export default App
