import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG } from '../lib/timerCycle.ts'
import { useTimerStore } from './timerStore.ts'

const FOCUS_MS = DEFAULT_CONFIG.focusSeconds * 1000
const SHORT_MS = DEFAULT_CONFIG.shortBreakSeconds * 1000
const LONG_MS = DEFAULT_CONFIG.longBreakSeconds * 1000

describe('timer store', () => {
  it('starts with the configured duration', () => {
    const origin = 1_000_000
    useTimerStore.getState().start(origin)
    const state = useTimerStore.getState()
    expect(state.status).toBe('running')
    expect(state.remainingMs).toBe(FOCUS_MS)
    expect(state.deadlineAt).toBe(origin + FOCUS_MS)
    expect(state.periodType).toBe('focus')
  })

  it('freezes remaining time while paused', () => {
    const origin = 1_000_000
    useTimerStore.getState().start(origin)
    useTimerStore.getState().tick(origin + 8_000)
    useTimerStore.getState().pause(origin + 8_000)
    const paused = useTimerStore.getState().remainingMs
    expect(paused).toBe(FOCUS_MS - 8_000)
    useTimerStore.getState().tick(origin + 40_000)
    expect(useTimerStore.getState().remainingMs).toBe(paused)
    expect(useTimerStore.getState().status).toBe('paused')
  })

  it('resumes from the exact remaining time', () => {
    const origin = 1_000_000
    useTimerStore.getState().start(origin)
    useTimerStore.getState().tick(origin + 12_000)
    useTimerStore.getState().pause(origin + 12_000)
    useTimerStore.getState().resume(origin + 80_000)
    useTimerStore.getState().tick(origin + 81_000)
    expect(useTimerStore.getState().remainingMs).toBe(FOCUS_MS - 13_000)
    expect(useTimerStore.getState().status).toBe('running')
  })

  it('resets to the initial timer state', () => {
    const origin = 1_000_000
    useTimerStore.getState().start(origin)
    useTimerStore.getState().skip(origin + 1000)
    useTimerStore.getState().reset()
    const state = useTimerStore.getState()
    expect(state.status).toBe('idle')
    expect(state.cycleIndex).toBe(0)
    expect(state.periodType).toBe('focus')
    expect(state.remainingMs).toBe(FOCUS_MS)
    expect(state.completedFocusTotal).toBe(0)
    expect(state.deadlineAt).toBeNull()
  })

  it('advances a completed focus period to a short break', () => {
    const origin = 1_000_000
    useTimerStore.getState().start(origin)
    useTimerStore.getState().tick(origin + FOCUS_MS)
    const state = useTimerStore.getState()
    expect(state.periodType).toBe('shortBreak')
    expect(state.remainingMs).toBe(SHORT_MS)
    expect(state.completedFocusTotal).toBe(1)
    expect(state.cycleIndex).toBe(1)
    expect(state.status).toBe('running')
  })

  it('advances a short break to the next focus period', () => {
    const origin = 1_000_000
    useTimerStore.getState().skip(origin)
    expect(useTimerStore.getState().periodType).toBe('shortBreak')
    useTimerStore.getState().tick(origin + SHORT_MS)
    const state = useTimerStore.getState()
    expect(state.periodType).toBe('focus')
    expect(state.cycleIndex).toBe(2)
    expect(state.completedFocusTotal).toBe(0)
  })

  it('starts a long break after the configured focus sessions and then a new cycle', () => {
    const origin = 1_000_000
    for (let i = 0; i < 7; i += 1) {
      useTimerStore.getState().skip(origin + i)
    }
    expect(useTimerStore.getState().periodType).toBe('longBreak')
    expect(useTimerStore.getState().cycleIndex).toBe(7)
    useTimerStore.getState().tick(origin + 7 + LONG_MS)
    expect(useTimerStore.getState().periodType).toBe('focus')
    expect(useTimerStore.getState().cycleIndex).toBe(8)
  })

  it('does not count skipped focus sessions as complete', () => {
    useTimerStore.getState().skip(1_000_000)
    expect(useTimerStore.getState().completedFocusTotal).toBe(0)
    expect(useTimerStore.getState().periodType).toBe('shortBreak')
  })

  it('rejects invalid configuration values', () => {
    const result = useTimerStore.getState().applyConfig({
      focusSeconds: 1,
      shortBreakSeconds: 300,
      longBreakSeconds: 900,
      focusSessionsBeforeLongBreak: 4,
    })
    expect(result.ok).toBe(false)
    expect(useTimerStore.getState().config.focusSeconds).toBe(DEFAULT_CONFIG.focusSeconds)
  })

  it('triggers exactly one transition when a period expires', () => {
    const origin = 1_000_000
    useTimerStore.getState().start(origin)
    useTimerStore.getState().tick(origin + FOCUS_MS)
    useTimerStore.getState().tick(origin + FOCUS_MS)
    useTimerStore.getState().tick(origin + FOCUS_MS + 250)
    const state = useTimerStore.getState()
    expect(state.cycleIndex).toBe(1)
    expect(state.periodType).toBe('shortBreak')
    expect(state.transitionId).toBe(1)
    expect(state.remainingMs).toBeGreaterThan(0)
  })

  it('does not display negative time after a background delay', () => {
    const origin = 1_000_000
    useTimerStore.getState().start(origin)
    useTimerStore.getState().tick(origin + FOCUS_MS + 45 * 60 * 1000)
    const state = useTimerStore.getState()
    expect(state.remainingMs).toBeGreaterThanOrEqual(0)
    expect(state.periodType).toBe('shortBreak')
    expect(state.cycleIndex).toBe(1)
    expect(state.transitionId).toBe(1)
  })
})
