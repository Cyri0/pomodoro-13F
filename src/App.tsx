import { useEffect } from 'react'
import { Cube } from './components/Cube'
import { SessionPicker } from './components/SessionPicker'
import { useTimerStore } from './features/timer/timerStore'

function App() {
  const isRunning = useTimerStore((state) => state.isRunning)

  useEffect(() => {
    if (!isRunning) return

    const intervalId = window.setInterval(() => {
      useTimerStore.getState().tick()
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [isRunning])

  return (
    <main className="app-shell">
      <section className="timer" aria-label="Pomodoro időzítő">
        <Cube />
        <SessionPicker />
      </section>
    </main>
  )
}

export default App
