import * as THREE from 'three'

export type Mode = 'focus' | 'shortBreak' | 'longBreak'

export const MODES: Record<Mode, { label: string; duration: number }> = {
  focus: { label: 'Fókusz', duration: 25 * 60 },
  shortBreak: { label: 'Rövid szünet', duration: 5 * 60 },
  longBreak: { label: 'Hosszú szünet', duration: 15 * 60 },
}

export const MODE_OPTIONS: Mode[] = ['focus', 'shortBreak', 'longBreak']
export const TIMER_PRESETS = [5, 10, 15, 25, 30, 50]
export const CUBE_FACE_PRESETS = [30, 10, 50, 5, 25, 15]

export const CUBE_FACE_NORMALS = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1),
]

export const CUBE_FACE_UP = [
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, -1),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 1, 0),
]
