import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TimerControls } from './TimerControls.tsx'
import { useTimerStore } from '../../store/timerStore.ts'

describe('TimerControls', () => {
  it('starts, pauses, and resumes from the control panel', async () => {
    const user = userEvent.setup()
    render(<TimerControls />)
    await user.click(screen.getByRole('button', { name: 'Start' }))
    expect(useTimerStore.getState().status).toBe('running')
    await user.click(screen.getByRole('button', { name: 'Pause' }))
    expect(useTimerStore.getState().status).toBe('paused')
    await user.click(screen.getByRole('button', { name: 'Resume' }))
    expect(useTimerStore.getState().status).toBe('running')
  })
})
