export type FaceId = 'focus' | 'short' | 'long' | 'deep' | 'admin' | 'read'

export type TimerFace = {
  id: FaceId
  name: string
  detail: string
  duration: number
  remaining: number
  tint: string
}

export type FacePosition = { x: number; y: number }
