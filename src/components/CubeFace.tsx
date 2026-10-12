import type { ReactNode } from 'react'
import type { CubeFaceIndex } from '../store/timerStore'

const FACE_PRESENTATION: ReadonlyArray<{ index: CubeFaceIndex; placement: string; category: string }> = [
  { index: 0, placement: 'top', category: 'FOCUS' },
  { index: 1, placement: 'front', category: 'SHORT REST' },
  { index: 2, placement: 'right', category: 'RESET' },
  { index: 3, placement: 'back', category: 'DEEP WORK' },
  { index: 4, placement: 'left', category: 'PAUSE' },
  { index: 5, placement: 'bottom', category: 'LONG REST' },
]

type CubeFaceProps = { faceIndex: CubeFaceIndex; minutes: number; isActive: boolean; rotationZ: number; timer: ReactNode }

export function CubeFace({ faceIndex, minutes, isActive, rotationZ, timer }: CubeFaceProps) {
  const presentation = FACE_PRESENTATION[faceIndex]
  const showMinutes = faceIndex !== 1 && faceIndex !== 3

  return (
    <div className={`cube-face cube-face--${presentation.placement}${isActive ? ' cube-face--active' : ''}`} aria-label={`${minutes} minute ${presentation.category.toLowerCase()}`} aria-hidden="true">
      {timer === null ? (
        <>
          {showMinutes && <span className="face-minutes">{minutes}<span className="face-unit">MIN</span></span>}
          <span className="face-category">{presentation.category}</span>
        </>
      ) : (
        <div className="face-content" style={{ transform: `rotateZ(${-rotationZ}deg)` }}>
          {timer}
        </div>
      )}
      <span className="face-marker" aria-hidden="true"><i /><i /><i /></span>
    </div>
  )
}