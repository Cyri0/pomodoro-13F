export type FaceId = 'focus' | 'short-break' | 'long-break' | 'reset' | 'deep-work' | 'custom'
export type FacePosition = 'front' | 'right' | 'back' | 'left' | 'top' | 'bottom'

type FaceNormal = {
  id: FaceId
  x: number
  y: number
  z: number
}

const FACE_NORMALS: FaceNormal[] = [
  { id: 'focus', x: 0, y: 0, z: 1 },
  { id: 'short-break', x: 1, y: 0, z: 0 },
  { id: 'long-break', x: 0, y: 0, z: -1 },
  { id: 'reset', x: -1, y: 0, z: 0 },
  { id: 'deep-work', x: 0, y: -1, z: 0 },
  { id: 'custom', x: 0, y: 1, z: 0 },
]

function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360
}

export function getTopFace(rotationX: number, rotationY: number): FaceId {
  void rotationY
  const radiansX = (normalizeDegrees(rotationX) * Math.PI) / 180
  const sinX = Math.sin(radiansX)
  const cosX = Math.cos(radiansX)

  let topFace = FACE_NORMALS[0]
  let highestUpwardScore = Number.NEGATIVE_INFINITY

  for (const face of FACE_NORMALS) {
    const rotatedY = cosX * face.y - sinX * face.z
    const upwardScore = -rotatedY

    if (upwardScore > highestUpwardScore) {
      highestUpwardScore = upwardScore
      topFace = face
    }
  }

  return topFace.id
}

export function getFrontFace(rotationX: number, rotationY: number): FaceId {
  const radiansX = (normalizeDegrees(rotationX) * Math.PI) / 180
  const radiansY = (normalizeDegrees(rotationY) * Math.PI) / 180
  const sinX = Math.sin(radiansX)
  const cosX = Math.cos(radiansX)
  const sinY = Math.sin(radiansY)
  const cosY = Math.cos(radiansY)

  let frontFace = FACE_NORMALS[0]
  let highestForwardScore = Number.NEGATIVE_INFINITY

  for (const face of FACE_NORMALS) {
    const rotatedZ = -sinY * face.x + cosY * (sinX * face.y + cosX * face.z)

    if (rotatedZ > highestForwardScore) {
      highestForwardScore = rotatedZ
      frontFace = face
    }
  }

  return frontFace.id
}

export function getFaceUprightAngle(
  position: FacePosition,
  rotationX: number,
  rotationY: number,
): number {
  const localXByFace: Record<FacePosition, [number, number, number]> = {
    front: [1, 0, 0],
    right: [0, 0, -1],
    back: [-1, 0, 0],
    left: [0, 0, 1],
    top: [1, 0, 0],
    bottom: [1, 0, 0],
  }
  const radiansX = (normalizeDegrees(rotationX) * Math.PI) / 180
  const radiansY = (normalizeDegrees(rotationY) * Math.PI) / 180
  const [localX, localY, localZ] = localXByFace[position]
  const rotatedX = Math.cos(radiansY) * localX
    + Math.sin(radiansY) * (Math.sin(radiansX) * localY + Math.cos(radiansX) * localZ)
  const projectedY = Math.cos(radiansX) * localY - Math.sin(radiansX) * localZ

  return -(Math.atan2(projectedY, rotatedX) * 180) / Math.PI
}
