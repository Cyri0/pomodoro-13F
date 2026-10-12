import { describe, expect, it } from 'vitest'
import {
  completedFocusInCycle,
  cycleLength,
  DEFAULT_CONFIG,
  durationSecondsFor,
  getPeriodTypeAt,
} from './timerCycle.ts'
import { getFaceForCycleIndex, getOrientation, periodMatchesFace, visibleFaceFromOrientation } from './cubeGeometry.ts'
import { validateTimerConfig } from './validation.ts'

describe('timer cycle', () => {
  it('uses the default 25/5/15/4 configuration', () => {
    expect(DEFAULT_CONFIG).toEqual({
      focusSeconds: 1500,
      shortBreakSeconds: 300,
      longBreakSeconds: 900,
      focusSessionsBeforeLongBreak: 4,
    })
  })

  it('advances focus to a short break', () => {
    expect(getPeriodTypeAt(0, 4)).toBe('focus')
    expect(getPeriodTypeAt(1, 4)).toBe('shortBreak')
  })

  it('advances a short break to the next focus period', () => {
    expect(getPeriodTypeAt(1, 4)).toBe('shortBreak')
    expect(getPeriodTypeAt(2, 4)).toBe('focus')
  })

  it('starts a long break after the configured number of focus sessions', () => {
    expect(getPeriodTypeAt(6, 4)).toBe('focus')
    expect(getPeriodTypeAt(7, 4)).toBe('longBreak')
    expect(completedFocusInCycle(7, 4)).toBe(4)
    expect(durationSecondsFor('longBreak', DEFAULT_CONFIG)).toBe(900)
  })

  it('starts a new cycle after a long break', () => {
    expect(getPeriodTypeAt(8, 4)).toBe('focus')
    expect(completedFocusInCycle(8, 4)).toBe(0)
  })

  it('honors a custom focus-session count', () => {
    expect(cycleLength(3)).toBe(6)
    expect(getPeriodTypeAt(4, 3)).toBe('focus')
    expect(getPeriodTypeAt(5, 3)).toBe('longBreak')
    expect(getPeriodTypeAt(6, 3)).toBe('focus')
  })
})

describe('validation', () => {
  it('rejects invalid configuration values', () => {
    const result = validateTimerConfig({
      focusSeconds: 0,
      shortBreakSeconds: -5,
      longBreakSeconds: 5,
      focusSessionsBeforeLongBreak: 0,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.focusSeconds).toBeTruthy()
      expect(result.errors.shortBreakSeconds).toBeTruthy()
      expect(result.errors.longBreakSeconds).toBeTruthy()
      expect(result.errors.focusSessionsBeforeLongBreak).toBeTruthy()
    }
  })

  it('accepts the default configuration', () => {
    expect(validateTimerConfig(DEFAULT_CONFIG).ok).toBe(true)
  })
})

describe('cube mapping', () => {
  it('shows the face that matches the current period and cycle position', () => {
    for (let index = 0; index < 16; index += 1) {
      expect(periodMatchesFace(index, 4)).toBe(true)
      const orientation = getOrientation(index, 4)
      expect(visibleFaceFromOrientation(orientation)).toBe(getFaceForCycleIndex(index, 4))
    }
  })

  it('rotates to top for a long break and returns to an equatorial focus face', () => {
    expect(getFaceForCycleIndex(7, 4)).toBe('top')
    expect(getFaceForCycleIndex(8, 4)).toBe('front')
    expect(visibleFaceFromOrientation(getOrientation(7, 4))).toBe('top')
    expect(visibleFaceFromOrientation(getOrientation(8, 4))).toBe('front')
  })
})
