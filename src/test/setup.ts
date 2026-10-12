import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { useTimerStore } from '../store/timerStore.ts'

afterEach(() => {
  cleanup()
  useTimerStore.getState().reset()
  useTimerStore.setState({
    config: {
      focusSeconds: 25 * 60,
      shortBreakSeconds: 5 * 60,
      longBreakSeconds: 15 * 60,
      focusSessionsBeforeLongBreak: 4,
    },
    soundEnabled: true,
  })
})
