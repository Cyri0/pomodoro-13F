import { useEffect } from 'react'
import { Controls } from './components/Controls'
import { Cube } from './components/Cube'
import { formatClock, selectPreset, selectRemaining, useTimer } from './store'

const App = () => {
  const status = useTimer((s) => s.status)
  const label = useTimer((s) => selectPreset(s).label)
  const clock = useTimer((s) => formatClock(selectRemaining(s)))

  useEffect(() => {
    document.title = status === 'idle' ? 'Pomodoro Cube' : `${clock} · ${label}`
  }, [clock, status, label])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.repeat) return
      const s = useTimer.getState()
      if (e.code === 'Space') {
        e.preventDefault()
        s.toggle()
      } else if (e.key === 'ArrowRight') s.flipBy(1)
      else if (e.key === 'ArrowLeft') s.flipBy(-1)
      else if (e.key.toLowerCase() === 'r') s.reset()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <main className="app">
      <header className="brand">
        <span className="dot" /> pomodoro<b>cube</b>
      </header>
      <Cube />
      <Controls />
    </main>
  )
}

export default App
