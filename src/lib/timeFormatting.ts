export function formatMmSs(totalMs: number): string {
  const clamped = Math.max(0, Math.floor(totalMs / 1000))
  const minutes = Math.floor(clamped / 60)
  const seconds = clamped % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function secondsToParts(totalSeconds: number): { minutes: number; seconds: number } {
  const safe = Math.max(0, Math.floor(totalSeconds))
  return {
    minutes: Math.floor(safe / 60),
    seconds: safe % 60,
  }
}

export function partsToSeconds(minutes: number, seconds: number): number {
  return minutes * 60 + seconds
}

export function formatDurationLabel(totalSeconds: number): string {
  const { minutes, seconds } = secondsToParts(totalSeconds)
  if (minutes > 0 && seconds > 0) return `${minutes}m ${seconds}s`
  if (minutes > 0) return `${minutes} min`
  return `${seconds}s`
}
