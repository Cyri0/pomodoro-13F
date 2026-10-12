export type PeriodType = 'focus' | 'shortBreak' | 'longBreak'

export type TimerStatus = 'idle' | 'running' | 'paused'

export type TimerConfig = {
  focusSeconds: number
  shortBreakSeconds: number
  longBreakSeconds: number
  focusSessionsBeforeLongBreak: number
}

export type DurationParts = {
  minutes: number
  seconds: number
}

export type ValidationErrors = Partial<
  Record<
    | 'focusSeconds'
    | 'shortBreakSeconds'
    | 'longBreakSeconds'
    | 'focusSessionsBeforeLongBreak',
    string
  >
>

export type ConfigValidationResult =
  | { ok: true; config: TimerConfig }
  | { ok: false; errors: ValidationErrors }

export type CubeFaceId = 'front' | 'right' | 'back' | 'left' | 'top' | 'bottom'

export type CubeOrientation = {
  rotateX: number
  rotateY: number
}
