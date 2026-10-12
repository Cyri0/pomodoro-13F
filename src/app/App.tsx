import { CubeScene } from '../components/cube/CubeScene.tsx'
import { MainLayout } from '../components/layout/MainLayout.tsx'
import { TimerControls } from '../components/timer/TimerControls.tsx'
import { TimerDisplay } from '../components/timer/TimerDisplay.tsx'
import { TimerProgress } from '../components/timer/TimerProgress.tsx'
import { TimerStatus } from '../components/timer/TimerStatus.tsx'
import { useTimer } from '../hooks/useTimer.ts'
import { periodPrompt } from '../lib/timerCycle.ts'
import { useTimerStore } from '../store/timerStore.ts'

function AppContent() {
  useTimer()
  const periodType = useTimerStore((state) => state.periodType)

  return (
    <MainLayout>
      <TimerStatus />
      <CubeScene />
      <p className="max-w-sm text-center text-sm text-zinc-400">{periodPrompt(periodType)}</p>
      <TimerDisplay />
      <TimerControls />
      <TimerProgress />
    </MainLayout>
  )
}

export default function App() {
  return <AppContent />
}
