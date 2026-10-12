export const sessions = [
  { id: 'focus', minutes: 25 },
  { id: 'short', minutes: 5 },
  { id: 'long', minutes: 15 },
  { id: 'deep', minutes: 50 },
] as const

export type Session = (typeof sessions)[number]

export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}
