import { useEffect, useRef } from 'react'
import { playPeriodCompleteChime } from '../lib/sound.ts'
import { useTimerStore } from '../store/timerStore.ts'

const TICK_MS = 100

export function useTimer(): void {
  const status = useTimerStore((state) => state.status)
  const tick = useTimerStore((state) => state.tick)
  const transitionId = useTimerStore((state) => state.transitionId)
  const lastAdvanceReason = useTimerStore((state) => state.lastAdvanceReason)
  const soundEnabled = useTimerStore((state) => state.soundEnabled)
  const clearCompletionCue = useTimerStore((state) => state.clearCompletionCue)
  const previousTransition = useRef(0)

  useEffect(() => {
    if (status !== 'running') return undefined

    const intervalId = window.setInterval(() => {
      tick(Date.now())
    }, TICK_MS)

    const onVisibility = () => {
      tick(Date.now())
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', onVisibility)

    tick(Date.now())

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', onVisibility)
    }
  }, [status, tick])

  useEffect(() => {
    if (transitionId === 0 || transitionId === previousTransition.current) return
    previousTransition.current = transitionId
    if (soundEnabled && lastAdvanceReason !== 'skipped') {
      void playPeriodCompleteChime()
    }
    const timeoutId = window.setTimeout(() => {
      clearCompletionCue()
    }, 900)
    return () => window.clearTimeout(timeoutId)
  }, [transitionId, lastAdvanceReason, soundEnabled, clearCompletionCue])
}
