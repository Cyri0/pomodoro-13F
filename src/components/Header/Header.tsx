import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.topbar}>
      <a className={styles.wordmark} href="#home" aria-label="Tock home"><span className={styles.wordmarkMark}>T</span> TOCK</a>
      <div className={styles.topbarNote}><span className={styles.statusLight} /> A little time, well spent</div>
      <div className={styles.sessionCount}>01 <span>/ 06</span></div>
    </header>
  )
}
