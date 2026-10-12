import styles from './TimerControls.module.css'

type TimerControlsProps = {
  isRunning: boolean
  onToggle: () => void
  onReset: () => void
  onAdjust: (amount: number) => void
}

export function TimerControls({ isRunning, onToggle, onReset, onAdjust }: TimerControlsProps) {
  return (
    <>
      <div className={styles.cubeControls}>
        <button className={styles.adjustButton} onClick={() => onAdjust(-60)} aria-label="Subtract one minute">−</button>
        <button className={styles.playButton} onClick={onToggle} aria-label={isRunning ? 'Pause timer' : 'Start timer'}>
          <span className={`${styles.playIcon}${isRunning ? ` ${styles.isPause}` : ''}`} />
          {isRunning ? 'PAUSE SESSION' : 'START SESSION'}
        </button>
        <button className={styles.adjustButton} onClick={() => onAdjust(60)} aria-label="Add one minute">+</button>
      </div>
      <div className={styles.secondaryControls}>
        <button className={styles.resetButton} onClick={onReset}><span className={styles.resetIcon}>↺</span> Reset this side</button>
        <span className={styles.keyHint}>YOUR OTHER TIMERS STAY PUT</span>
      </div>
    </>
  )
}
