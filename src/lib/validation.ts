import type { ConfigValidationResult, TimerConfig, ValidationErrors } from '../types/timer.ts'

export const CONFIG_LIMITS = {
  minDurationSeconds: 10,
  maxFocusSeconds: 90 * 60,
  maxShortBreakSeconds: 30 * 60,
  maxLongBreakSeconds: 60 * 60,
  minFocusSessions: 1,
  maxFocusSessions: 12,
} as const

function durationError(
  value: number,
  max: number,
  label: string,
): string | undefined {
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return `${label} must be a whole number of seconds.`
  }
  if (value < CONFIG_LIMITS.minDurationSeconds) {
    return `${label} must be at least ${CONFIG_LIMITS.minDurationSeconds} seconds.`
  }
  if (value > max) {
    return `${label} cannot exceed ${Math.floor(max / 60)} minutes.`
  }
  return undefined
}

export function validateTimerConfig(input: TimerConfig): ConfigValidationResult {
  const errors: ValidationErrors = {}

  const focusError = durationError(input.focusSeconds, CONFIG_LIMITS.maxFocusSeconds, 'Focus')
  if (focusError) errors.focusSeconds = focusError

  const shortError = durationError(
    input.shortBreakSeconds,
    CONFIG_LIMITS.maxShortBreakSeconds,
    'Short break',
  )
  if (shortError) errors.shortBreakSeconds = shortError

  const longError = durationError(
    input.longBreakSeconds,
    CONFIG_LIMITS.maxLongBreakSeconds,
    'Long break',
  )
  if (longError) errors.longBreakSeconds = longError

  const sessions = input.focusSessionsBeforeLongBreak
  if (!Number.isFinite(sessions) || !Number.isInteger(sessions)) {
    errors.focusSessionsBeforeLongBreak = 'Session count must be a whole number.'
  } else if (
    sessions < CONFIG_LIMITS.minFocusSessions ||
    sessions > CONFIG_LIMITS.maxFocusSessions
  ) {
    errors.focusSessionsBeforeLongBreak = `Use ${CONFIG_LIMITS.minFocusSessions}–${CONFIG_LIMITS.maxFocusSessions} focus sessions before a long break.`
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return { ok: true, config: input }
}
