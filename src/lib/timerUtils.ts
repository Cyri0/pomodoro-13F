export function remainingFromDeadline(deadlineAt: number, now: number): number {
  return Math.max(0, deadlineAt - now)
}

export function isExpired(deadlineAt: number | null, now: number): boolean {
  return deadlineAt !== null && now >= deadlineAt
}
