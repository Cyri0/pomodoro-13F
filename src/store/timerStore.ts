import { create } from 'zustand'
import { getPeriodTypeAt, DEFAULT_CONFIG, durationSecondsFor, periodLabel } from '../lib/timerCycle.ts'
import { remainingFromDeadline } from '../lib/timerUtils.ts'
import { validateTimerConfig } from '../lib/validation.ts'
import type { PeriodType, TimerConfig, TimerStatus, ValidationErrors } from '../types/timer.ts'

export type AdvanceReason = 'completed' | 'skipped'

type TimerStoreState = {
  status: TimerStatus
  config: TimerConfig
  remainingMs: number
  deadlineAt: number | null
  periodType: PeriodType
  cycleIndex: number
  completedFocusTotal: number
  soundEnabled: boolean
  transitionId: number
  lastAdvanceReason: AdvanceReason | null
  justCompletedType: PeriodType | null
  announce: string
}

type TimerStoreActions = {
  start: (now?: number) => void
  pause: (now?: number) => void
  resume: (now?: number) => void
  reset: () => void
  skip: (now?: number) => void
  tick: (now?: number) => void
  applyConfig: (config: TimerConfig) => { ok: true } | { ok: false; errors: ValidationErrors }
  setSoundEnabled: (enabled: boolean) => void
  clearCompletionCue: () => void
}

export type TimerStore = TimerStoreState & TimerStoreActions

const nowOr = (now?: number) => now ?? Date.now()

function announcementFor(periodType: PeriodType, durationSeconds: number, reason: AdvanceReason): string {
  const minutes = Math.max(1, Math.round(durationSeconds / 60))
  const durationText = durationSeconds < 60 ? `${durationSeconds} seconds` : `${minutes} minutes`
  if (reason === 'skipped') {
    return `Skipped to ${periodLabel(periodType)}. ${durationText} remaining.`
  }
  return `${periodLabel(periodType)} started. ${durationText} remaining.`
}

function createInitialState(): TimerStoreState {
  return {
    status: 'idle',
    config: DEFAULT_CONFIG,
    remainingMs: DEFAULT_CONFIG.focusSeconds * 1000,
    deadlineAt: null,
    periodType: 'focus',
    cycleIndex: 0,
    completedFocusTotal: 0,
    soundEnabled: true,
    transitionId: 0,
    lastAdvanceReason: null,
    justCompletedType: null,
    announce: 'Focus cube ready. Configure your session, then press start.',
  }
}

function advancePeriod(
  state: TimerStoreState,
  options: { countFocus: boolean; reason: AdvanceReason; now: number },
): TimerStoreState {
  const completedFocusTotal =
    options.countFocus && state.periodType === 'focus'
      ? state.completedFocusTotal + 1
      : state.completedFocusTotal

  const nextIndex = state.cycleIndex + 1
  const nextType = getPeriodTypeAt(nextIndex, state.config.focusSessionsBeforeLongBreak)
  const durationMs = durationSecondsFor(nextType, state.config) * 1000

  return {
    ...state,
    completedFocusTotal,
    cycleIndex: nextIndex,
    periodType: nextType,
    remainingMs: durationMs,
    status: 'running',
    deadlineAt: options.now + durationMs,
    transitionId: state.transitionId + 1,
    lastAdvanceReason: options.reason,
    justCompletedType: options.reason === 'skipped' ? null : state.periodType,
    announce: announcementFor(nextType, durationSecondsFor(nextType, state.config), options.reason),
  }
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  ...createInitialState(),

  start: (now) => {
    const state = get()
    if (state.status === 'running') return
    if (state.status === 'paused') {
      get().resume(now)
      return
    }
    const timestamp = nowOr(now)
    set({
      status: 'running',
      deadlineAt: timestamp + state.remainingMs,
      announce: `${periodLabel(state.periodType)} running.`,
      justCompletedType: null,
      lastAdvanceReason: null,
    })
  },

  pause: (now) => {
    const state = get()
    if (state.status !== 'running') return
    const timestamp = nowOr(now)
    const remainingMs = state.deadlineAt === null ? state.remainingMs : remainingFromDeadline(state.deadlineAt, timestamp)
    set({
      status: 'paused',
      remainingMs,
      deadlineAt: null,
      announce: `${periodLabel(state.periodType)} paused.`,
    })
  },

  resume: (now) => {
    const state = get()
    if (state.status !== 'paused') return
    const timestamp = nowOr(now)
    set({
      status: 'running',
      deadlineAt: timestamp + state.remainingMs,
      announce: `${periodLabel(state.periodType)} resumed.`,
    })
  },

  reset: () => {
    const { config, soundEnabled } = get()
    set({
      ...createInitialState(),
      config,
      soundEnabled,
      remainingMs: config.focusSeconds * 1000,
      announce: 'Timer reset. Ready for a new session.',
    })
  },

  skip: (now) => {
    const timestamp = nowOr(now)
    set((state) => advancePeriod(state, { countFocus: false, reason: 'skipped', now: timestamp }))
  },

  tick: (now) => {
    const state = get()
    if (state.status !== 'running' || state.deadlineAt === null) return
    const timestamp = nowOr(now)
    if (timestamp < state.deadlineAt) {
      const remainingMs = remainingFromDeadline(state.deadlineAt, timestamp)
      if (remainingMs !== state.remainingMs) {
        set({ remainingMs })
      }
      return
    }
    set((current) => {
      if (current.status !== 'running' || current.deadlineAt === null || timestamp < current.deadlineAt) {
        return current
      }
      return advancePeriod(current, { countFocus: true, reason: 'completed', now: timestamp })
    })
  },

  applyConfig: (config) => {
    const result = validateTimerConfig(config)
    if (!result.ok) return result
    const state = get()
    if (state.status === 'running') {
      return { ok: false, errors: { focusSeconds: 'Pause the timer before changing durations.' } }
    }
    const nextType = getPeriodTypeAt(state.cycleIndex, result.config.focusSessionsBeforeLongBreak)
    const remainingMs = durationSecondsFor(nextType, result.config) * 1000
    set({
      config: result.config,
      periodType: nextType,
      remainingMs,
      deadlineAt: null,
      announce: 'Settings applied to the current period.',
    })
    return { ok: true }
  },

  setSoundEnabled: (enabled) => {
    set({
      soundEnabled: enabled,
      announce: enabled ? 'Sound on.' : 'Sound off.',
    })
  },

  clearCompletionCue: () => {
    if (get().justCompletedType !== null) {
      set({ justCompletedType: null })
    }
  },
}))

export const getTimerSnapshot = () => useTimerStore.getState()
