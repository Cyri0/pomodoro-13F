import { useEffect } from 'react'
import TimerCube from './components/TimerCube'
import { useTimerStore } from './timerStore'

const App = () => {
  const isRunning = useTimerStore((state) => state.isRunning)
  const tick = useTimerStore((state) => state.tick)

  useEffect(() => {
    if (!isRunning) return
    const interval = window.setInterval(tick, 1000)
    return () => window.clearInterval(interval)
  }, [isRunning, tick])

  return (
    <main className="timer-app">
      <TimerCube />
    </main>
  )
}

export default App
