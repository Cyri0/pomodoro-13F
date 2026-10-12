import { DurationInput } from './DurationInput.tsx'
import { Button } from '../ui/Button.tsx'
import { partsToSeconds, secondsToParts } from '../../lib/timeFormatting.ts'
import type { TimerConfig, ValidationErrors } from '../../types/timer.ts'

type SettingsPanelProps = {
  draft: TimerConfig
  errors: ValidationErrors
  locked: boolean
  onChange: (next: TimerConfig) => void
  onApply: () => void
  onCancel: () => void
}

export function SettingsPanel({
  draft,
  errors,
  locked,
  onChange,
  onApply,
  onCancel,
}: SettingsPanelProps) {
  const focus = secondsToParts(draft.focusSeconds)
  const shortBreak = secondsToParts(draft.shortBreakSeconds)
  const longBreak = secondsToParts(draft.longBreakSeconds)

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        onApply()
      }}
    >
      <DurationInput
        id="focus-duration"
        label="Focus duration"
        minutes={focus.minutes}
        seconds={focus.seconds}
        disabled={locked}
        error={errors.focusSeconds}
        onMinutesChange={(minutes) =>
          onChange({ ...draft, focusSeconds: partsToSeconds(minutes, focus.seconds) })
        }
        onSecondsChange={(seconds) =>
          onChange({ ...draft, focusSeconds: partsToSeconds(focus.minutes, seconds) })
        }
      />
      <DurationInput
        id="short-break-duration"
        label="Short break"
        minutes={shortBreak.minutes}
        seconds={shortBreak.seconds}
        disabled={locked}
        error={errors.shortBreakSeconds}
        onMinutesChange={(minutes) =>
          onChange({ ...draft, shortBreakSeconds: partsToSeconds(minutes, shortBreak.seconds) })
        }
        onSecondsChange={(seconds) =>
          onChange({ ...draft, shortBreakSeconds: partsToSeconds(shortBreak.minutes, seconds) })
        }
      />
      <DurationInput
        id="long-break-duration"
        label="Long break"
        minutes={longBreak.minutes}
        seconds={longBreak.seconds}
        disabled={locked}
        error={errors.longBreakSeconds}
        onMinutesChange={(minutes) =>
          onChange({ ...draft, longBreakSeconds: partsToSeconds(minutes, longBreak.seconds) })
        }
        onSecondsChange={(seconds) =>
          onChange({ ...draft, longBreakSeconds: partsToSeconds(longBreak.minutes, seconds) })
        }
      />
      <label className="grid gap-1 text-sm font-medium text-zinc-200" htmlFor="focus-sessions">
        Focus sessions before long break
        <input
          id="focus-sessions"
          inputMode="numeric"
          min={1}
          max={12}
          step={1}
          disabled={locked}
          value={draft.focusSessionsBeforeLongBreak}
          onChange={(event) =>
            onChange({
              ...draft,
              focusSessionsBeforeLongBreak: Number(event.target.value),
            })
          }
          aria-invalid={Boolean(errors.focusSessionsBeforeLongBreak)}
          aria-describedby={
            errors.focusSessionsBeforeLongBreak ? 'focus-sessions-error' : 'focus-sessions-help'
          }
          className="min-h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-base font-normal text-white outline-none transition focus:border-[var(--accent)] disabled:opacity-50"
        />
        <span id="focus-sessions-help" className="text-xs font-normal text-zinc-500">
          Cycle: Focus → Short Break, repeating until this many focus sessions, then a Long Break.
        </span>
        {errors.focusSessionsBeforeLongBreak ? (
          <span id="focus-sessions-error" className="text-xs font-normal text-rose-300">
            {errors.focusSessionsBeforeLongBreak}
          </span>
        ) : null}
      </label>
      {locked ? (
        <p className="text-xs text-amber-200">Pause the timer to edit durations.</p>
      ) : (
        <p className="text-xs text-zinc-500">
          Applying while paused restarts the current period with the new duration. Reset returns the cube to the
          first focus face and clears completed sessions.
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={locked}>
          Apply
        </Button>
      </div>
    </form>
  )
}
