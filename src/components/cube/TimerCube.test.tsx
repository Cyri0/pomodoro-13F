import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG } from '../../lib/timerCycle.ts'
import { getFaceForCycleIndex } from '../../lib/cubeGeometry.ts'
import { TimerCube } from './TimerCube.tsx'
import './cube.css'

describe('TimerCube', () => {
  it('displays the face corresponding to the current period and cycle position', () => {
    const cycleIndex = 7
    const { container } = render(
      <TimerCube
        cycleIndex={cycleIndex}
        focusSessionsBeforeLongBreak={4}
        remainingMs={15 * 60 * 1000}
        config={DEFAULT_CONFIG}
        justCompleted={false}
      />,
    )
    const cube = container.querySelector('.cube')
    expect(cube).toHaveAttribute('data-active-face', getFaceForCycleIndex(cycleIndex, 4))
    expect(cube).toHaveAttribute('data-active-face', 'top')
    const active = container.querySelector('[data-face="top"]')
    expect(active).toHaveAttribute('data-active', 'true')
    expect(container.querySelector('[data-face="front"]')).toHaveAttribute('data-active', 'false')
  })
})
