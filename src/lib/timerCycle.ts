import type { PeriodType, TimerConfig } from '../types/timer.ts'

export const DEFAULT_CONFIG: TimerConfig = {
  focusSeconds: 25 * 60,
  shortBreakSeconds: 5 * 60,
  longBreakSeconds: 15 * 60,
  focusSessionsBeforeLongBreak: 4,
}

export function cycleLength(focusSessionsBeforeLongBreak: number): number {
  return focusSessionsBeforeLongBreak * 2
}

export function normalizeCycleIndex(cycleIndex: number, focusSessionsBeforeLongBreak: number): number {
  const length = cycleLength(focusSessionsBeforeLongBreak)
  return ((cycleIndex % length) + length) % length
}

export function getPeriodTypeAt(
  cycleIndex: number,
  focusSessionsBeforeLongBreak: number,
): PeriodType {
  const length = cycleLength(focusSessionsBeforeLongBreak)
  const index = normalizeCycleIndex(cycleIndex, focusSessionsBeforeLongBreak)
  if (index === length - 1) return 'longBreak'
  return index % 2 === 0 ? 'focus' : 'shortBreak'
}

export function durationSecondsFor(periodType: PeriodType, config: TimerConfig): number {
  switch (periodType) {
    case 'focus':
      return config.focusSeconds
    case 'shortBreak':
      return config.shortBreakSeconds
    case 'longBreak':
      return config.longBreakSeconds
  }
}

export function completedFocusInCycle(
  cycleIndex: number,
  focusSessionsBeforeLongBreak: number,
): number {
  const n = focusSessionsBeforeLongBreak
  const index = normalizeCycleIndex(cycleIndex, n)
  const length = cycleLength(n)
  if (index === length - 1) return n
  if (index % 2 === 0) return index / 2
  return Math.ceil(index / 2)
}

export function periodLabel(periodType: PeriodType): string {
  switch (periodType) {
    case 'focus':
      return 'Focus'
    case 'shortBreak':
      return 'Short Break'
    case 'longBreak':
      return 'Long Break'
  }
}

export function periodPrompt(periodType: PeriodType): string {
  switch (periodType) {
    case 'focus':
      return 'Stay focused'
    case 'shortBreak':
      return 'Take a breath'
    case 'longBreak':
      return 'Recharge fully'
  }
}

export function periodHeadline(periodType: PeriodType): string {
  switch (periodType) {
    case 'focus':
      return 'FOCUS'
    case 'shortBreak':
      return 'SHORT BREAK'
    case 'longBreak':
      return 'LONG BREAK'
  }
}
