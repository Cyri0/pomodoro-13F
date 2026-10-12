import type { ChangeEvent } from 'react'

type DurationInputProps = {
  id: string
  label: string
  minutes: number
  seconds: number
  disabled?: boolean
  error?: string
  onMinutesChange: (value: number) => void
  onSecondsChange: (value: number) => void
}

function parseNonNegative(raw: string): number {
  if (raw === '') return 0
  const next = Number(raw)
  return Number.isFinite(next) ? next : 0
}

export function DurationInput({
  id,
  label,
  minutes,
  seconds,
  disabled = false,
  error,
  onMinutesChange,
  onSecondsChange,
}: DurationInputProps) {
  const minutesId = `${id}-minutes`
  const secondsId = `${id}-seconds`
  const errorId = `${id}-error`

  const handleMinutes = (event: ChangeEvent<HTMLInputElement>) => {
    onMinutesChange(parseNonNegative(event.target.value))
  }

  const handleSeconds = (event: ChangeEvent<HTMLInputElement>) => {
    onSecondsChange(parseNonNegative(event.target.value))
  }

  return (
    <fieldset className="grid gap-2 border-0 p-0">
      <legend className="text-sm font-medium text-zinc-200">{label}</legend>
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1 text-xs text-zinc-400" htmlFor={minutesId}>
          Minutes
          <input
            id={minutesId}
            inputMode="numeric"
            min={0}
            max={90}
            step={1}
            disabled={disabled}
            value={Number.isFinite(minutes) ? minutes : 0}
            onChange={handleMinutes}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="min-h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-base text-white outline-none transition focus:border-[var(--accent)] disabled:opacity-50"
          />
        </label>
        <label className="grid gap-1 text-xs text-zinc-400" htmlFor={secondsId}>
          Seconds
          <input
            id={secondsId}
            inputMode="numeric"
            min={0}
            max={59}
            step={1}
            disabled={disabled}
            value={Number.isFinite(seconds) ? seconds : 0}
            onChange={handleSeconds}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="min-h-11 rounded-xl border border-white/10 bg-black/25 px-3 text-base text-white outline-none transition focus:border-[var(--accent)] disabled:opacity-50"
          />
        </label>
      </div>
      {error ? (
        <p id={errorId} className="text-xs text-rose-300">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
