import type { FaceId, FacePosition, TimerFace } from '../../types/timer'
import { formatTime } from '../../utils/formatTime'
import styles from './Cube.module.css'

type CubeProps = {
  faces: TimerFace[]
  activeFace: FaceId
  isRunning: boolean
  position: FacePosition
  onSelect: (id: FaceId) => void
}

const getFaceTransform = (id: FaceId) => id === 'focus' ? 'translateZ(150px)'
  : id === 'short' ? 'rotateX(-90deg) translateZ(150px)'
  : id === 'long' ? 'rotateX(180deg) translateZ(150px) rotateZ(180deg)'
  : id === 'deep' ? 'rotateX(90deg) translateZ(150px)'
  : id === 'admin' ? 'rotateY(90deg) translateZ(150px)'
  : 'rotateY(-90deg) translateZ(150px)'

export function Cube({ faces, activeFace, isRunning, position, onSelect }: CubeProps) {
  return (
    <div className={styles.cubeScene}>
      <div className={styles.cubeShadow} />
      <div className={styles.cube} style={{ transform: `rotateX(${position.x}deg) rotateY(${position.y}deg)` }}>
        {faces.map((face, index) => {
          const isActive = face.id === activeFace
          return (
            <button
              key={face.id}
              className={`${styles.cubeFace}${isActive ? ` ${styles.isCurrent}` : ''}`}
              style={{ transform: getFaceTransform(face.id), '--face-tint': face.tint } as React.CSSProperties}
              onClick={() => onSelect(face.id)}
              aria-label={`Select ${face.name}, ${formatTime(face.remaining)} remaining`}
              tabIndex={isActive ? 0 : -1}
            >
              <span className={styles.faceTopline}><span>TOCK / 0{index + 1}</span><span>{face.name.toUpperCase()}</span></span>
              <span className={styles.dial} style={{ '--dial-progress': `${(face.remaining / face.duration) * 100}%` } as React.CSSProperties}>
                <span className={styles.dialInner}>
                  <span className={styles.dialLabel}>{isActive && face.remaining === 0 ? 'TIME IS UP' : face.detail.toUpperCase()}</span>
                  <span className={styles.digitalTime}>{formatTime(face.remaining)}</span>
                  <span className={styles.dialState}>{isActive && isRunning ? 'IN SESSION' : 'READY WHEN YOU ARE'}</span>
                </span>
              </span>
              <span className={styles.faceBottomline}><span>FOCUS / REST / REPEAT</span><span>0{index + 1}</span></span>
              <span className={`${styles.cubeStud} ${styles.studOne}`} /><span className={`${styles.cubeStud} ${styles.studTwo}`} />
              <span className={`${styles.cubeStud} ${styles.studThree}`} /><span className={`${styles.cubeStud} ${styles.studFour}`} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
