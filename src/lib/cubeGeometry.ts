import type { CubeFaceId, CubeOrientation, PeriodType } from '../types/timer.ts'
import { cycleLength, getPeriodTypeAt, normalizeCycleIndex } from './timerCycle.ts'

export const FACE_ORDER: CubeFaceId[] = ['front', 'right', 'back', 'left', 'top', 'bottom']

const EQUATORIAL_FACES: CubeFaceId[] = ['front', 'right', 'back', 'left']

export function getFaceForCycleIndex(
  cycleIndex: number,
  focusSessionsBeforeLongBreak: number,
): CubeFaceId {
  const length = cycleLength(focusSessionsBeforeLongBreak)
  const index = normalizeCycleIndex(cycleIndex, focusSessionsBeforeLongBreak)
  if (index === length - 1) return 'top'
  return EQUATORIAL_FACES[index % 4] ?? 'front'
}

export function facePeriodType(face: CubeFaceId): PeriodType | 'brand' {
  switch (face) {
    case 'front':
    case 'back':
      return 'focus'
    case 'right':
    case 'left':
      return 'shortBreak'
    case 'top':
      return 'longBreak'
    case 'bottom':
      return 'brand'
  }
}

function equatorialYaw(face: CubeFaceId): number | null {
  switch (face) {
    case 'front':
      return 0
    case 'right':
      return -90
    case 'back':
      return -180
    case 'left':
      return -270
    default:
      return null
  }
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360
}

function yawTowardFace(currentY: number, target: CubeFaceId): number {
  const targetYaw = equatorialYaw(target)
  if (targetYaw === null) return currentY
  const targetNorm = normalizeDegrees(targetYaw)
  const currentNorm = normalizeDegrees(currentY)
  let delta = currentNorm - targetNorm
  if (delta < 0) delta += 360
  if (delta === 0) return currentY
  return currentY - delta
}

export function getOrientation(
  cycleIndex: number,
  focusSessionsBeforeLongBreak: number,
): CubeOrientation {
  const length = cycleLength(focusSessionsBeforeLongBreak)
  let rotateX = 0
  let rotateY = 0

  for (let step = 0; step < cycleIndex; step += 1) {
    const currentPos = normalizeCycleIndex(step, focusSessionsBeforeLongBreak)
    const nextPos = normalizeCycleIndex(step + 1, focusSessionsBeforeLongBreak)
    const nextIsLong = nextPos === length - 1
    const currentIsLong = currentPos === length - 1

    if (nextIsLong) {
      rotateX -= 90
    } else if (currentIsLong) {
      rotateX += 90
      const targetFace = getFaceForCycleIndex(step + 1, focusSessionsBeforeLongBreak)
      rotateY = yawTowardFace(rotateY, targetFace)
    } else {
      rotateY -= 90
    }
  }

  return { rotateX, rotateY }
}

export function visibleFaceFromOrientation(orientation: CubeOrientation): CubeFaceId {
  const { rotateX, rotateY } = orientation
  const pitch = normalizeDegrees(rotateX)
  if (pitch === 270) return 'top'
  if (pitch === 90) return 'bottom'

  const yaw = normalizeDegrees(rotateY)
  if (yaw === 0) return 'front'
  if (yaw === 270) return 'right'
  if (yaw === 180) return 'back'
  if (yaw === 90) return 'left'
  return 'front'
}

export function periodMatchesFace(
  cycleIndex: number,
  focusSessionsBeforeLongBreak: number,
): boolean {
  const face = getFaceForCycleIndex(cycleIndex, focusSessionsBeforeLongBreak)
  const period = getPeriodTypeAt(cycleIndex, focusSessionsBeforeLongBreak)
  const mapped = facePeriodType(face)
  return mapped === period
}
