import type { FaceId, TimerFace } from '../../types/timer'
import styles from './ModeSelector.module.css'

type ModeSelectorProps = {
  faces: TimerFace[]
  activeFace: FaceId
  onSelect: (id: FaceId) => void
}

export function ModeSelector({ faces, activeFace, onSelect }: ModeSelectorProps) {
  return (
    <div className={styles.introBlock}>
      <p className={styles.eyebrow}>YOUR TIME, TURNED</p>
      <h1 className={styles.heading}>Make this<br /><em>moment</em> count.</h1>
      <p className={styles.introCopy}>Choose a side. Give it your attention.<br />The rest can wait.</p>
      <div className={styles.faceList} role="tablist" aria-label="Timer modes">
        {faces.map((face, index) => (
          <button
            className={`${styles.faceTab}${activeFace === face.id ? ` ${styles.isSelected}` : ''}`}
            key={face.id}
            role="tab"
            aria-selected={activeFace === face.id}
            onClick={() => onSelect(face.id)}
          >
            <span className={styles.faceIndex}>0{index + 1}</span>
            <span>{face.name}</span>
            <span className={styles.faceTabTime}>{Math.floor(face.duration / 60)}m</span>
          </button>
        ))}
      </div>
    </div>
  )
}
