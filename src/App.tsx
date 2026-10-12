import { useEffect, useState, type FormEvent } from 'react'
import { TimerScene } from './components/TimerScene'
import { useTimerStore, type TimerMode } from './store/timerStore'

const modeLabels: Record<TimerMode, string> = {
  focus: 'Focus',
  shortBreak: 'Short break',
  longBreak: 'Long break',
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [taskDraft, setTaskDraft] = useState('')
  const mode = useTimerStore((state) => state.mode)
  const remainingSeconds = useTimerStore((state) => state.remainingSeconds)
  const isRunning = useTimerStore((state) => state.isRunning)
  const completedSessions = useTimerStore((state) => state.completedSessions)
  const durations = useTimerStore((state) => state.durations)
  const tasks = useTimerStore((state) => state.tasks)
  const tick = useTimerStore((state) => state.tick)
  const toggleTimer = useTimerStore((state) => state.toggleTimer)
  const resetTimer = useTimerStore((state) => state.resetTimer)
  const setMode = useTimerStore((state) => state.setMode)
  const selectFocusDuration = useTimerStore((state) => state.selectFocusDuration)
  const skipMode = useTimerStore((state) => state.skipMode)
  const setModeDuration = useTimerStore((state) => state.setModeDuration)
  const addTask = useTimerStore((state) => state.addTask)
  const toggleTask = useTimerStore((state) => state.toggleTask)
  const removeTask = useTimerStore((state) => state.removeTask)

  useEffect(() => {
    tick()
    if (!isRunning) return
    const interval = window.setInterval(tick, 250)
    return () => window.clearInterval(interval)
  }, [isRunning, tick])

  useEffect(() => {
    document.title = `${formatTime(remainingSeconds)} · ${modeLabels[mode]} | Stilltime`
  }, [mode, remainingSeconds])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return
      if (event.code === 'Space') {
        event.preventDefault()
        toggleTimer()
      }
      if (event.key.toLowerCase() === 'r') resetTimer()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [resetTimer, toggleTimer])

  const handleAddTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedTask = taskDraft.trim()
    if (!trimmedTask) return
    addTask(trimmedTask)
    setTaskDraft('')
  }

  const progress = Math.min(1, Math.max(0, 1 - remainingSeconds / (durations[mode] * 60)))
  const activeTask = tasks.find((task) => !task.completed)

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="#home" aria-label="Stilltime home">
          <span className="wordmark-mark" aria-hidden="true"><span /></span>
          <span>stilltime</span>
        </a>
        <div className="topbar-right">
          <span className="today-label"><span className="status-dot" /> YOUR QUIET CORNER</span>
          <button
            className={`settings-trigger${settingsOpen ? ' is-open' : ''}`}
            type="button"
            aria-label="Timer settings"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen((open) => !open)}
          >
            <span aria-hidden="true">&#9881;</span>
          </button>
        </div>
        {settingsOpen && (
          <section className="settings-popover" aria-label="Timer settings">
            <div className="popover-heading">
              <div><span className="eyebrow">PREFERENCES</span><h2>Timer lengths</h2></div>
              <button type="button" className="close-settings" onClick={() => setSettingsOpen(false)} aria-label="Close settings">×</button>
            </div>
            {(['focus', 'shortBreak', 'longBreak'] as const).map((timerMode) => (
              <label className="duration-field" key={timerMode}>
                <span>{modeLabels[timerMode]}</span>
                <span className="duration-input-wrap">
                  <input
                    aria-label={`${modeLabels[timerMode]} duration in minutes`}
                    type="number"
                    min="1"
                    max="90"
                    value={durations[timerMode]}
                    onChange={(event) => setModeDuration(timerMode, Number(event.target.value))}
                  />
                  <span>min</span>
                </span>
              </label>
            ))}
            <p className="settings-note">Changes apply to the next timer.</p>
          </section>
        )}
      </header>

      <div className="workspace" id="home">
        <section className="timer-column" aria-label="Pomodoro timer">
          <div className="focus-heading">
            <div>
              <p className="eyebrow"><span className="eyebrow-line" /> THE POMODORO METHOD</p>
              <h1>Make room<br />for <em>one thing.</em></h1>
            </div>
            <div className="session-count" aria-label={`${completedSessions} focus sessions completed`}>
              <span className="session-number">{String(completedSessions).padStart(2, '0')}</span>
              <span className="session-caption">SESSIONS<br />TODAY</span>
            </div>
          </div>

          <div className="timer-stage">
            <div className="stage-wash" aria-hidden="true" />
            <TimerScene
              progress={progress}
              time={formatTime(remainingSeconds)}
              mode={mode}
              onSelectDuration={selectFocusDuration}
              running={isRunning}
            />
            <div className="stage-caption" aria-hidden="true">
              <span>01</span><span className="caption-rule" /><span>SETTLE IN</span>
            </div>
          </div>

          <div className="timer-controls">
            <div className="mode-switch" role="tablist" aria-label="Timer mode">
              {(['focus', 'shortBreak', 'longBreak'] as const).map((timerMode) => (
                <button
                  key={timerMode}
                  type="button"
                  role="tab"
                  aria-selected={mode === timerMode}
                  className={mode === timerMode ? 'active' : ''}
                  onClick={() => setMode(timerMode)}
                >
                  {modeLabels[timerMode]}
                </button>
              ))}
            </div>
            <div className="action-row">
              <button className="start-button" type="button" onClick={toggleTimer}>
                <span className="play-glyph" aria-hidden="true">{isRunning ? 'Ⅱ' : '▶'}</span>
                {isRunning ? 'Pause session' : mode === 'focus' ? 'Start focusing' : 'Start break'}
              </button>
              <button className="secondary-button" type="button" onClick={resetTimer}>Reset</button>
              <button className="secondary-button skip-button" type="button" onClick={skipMode}>Skip</button>
            </div>
            <p className="keyboard-hint"><kbd>SPACE</kbd> {isRunning ? 'to pause' : 'to begin'} <span>·</span> <kbd>R</kbd> to reset</p>
          </div>
        </section>

        <aside className="side-column" aria-label="Focus plan">
          <section className="now-section">
            <div className="section-heading">
              <div><p className="eyebrow">RIGHT NOW</p><h2>Your focus</h2></div>
              <span className="live-mark" aria-hidden="true" />
            </div>
            <div className="current-task">
              <span className="task-marker" aria-hidden="true"><span /></span>
              <div>
                <span className="eyebrow">{activeTask ? 'UP NEXT' : 'A CLEAR DESK'}</span>
                <p>{activeTask?.title ?? 'Choose one small thing to begin.'}</p>
              </div>
            </div>
            <form className="task-form" onSubmit={handleAddTask}>
              <label className="sr-only" htmlFor="new-task">Add a focus task</label>
              <input id="new-task" value={taskDraft} onChange={(event) => setTaskDraft(event.target.value)} placeholder="Add a task to focus on..." maxLength={80} />
              <button type="submit" aria-label="Add task">+</button>
            </form>
            {tasks.length > 0 && (
              <ul className="task-list">
                {tasks.map((task) => (
                  <li className={task.completed ? 'task-item is-complete' : 'task-item'} key={task.id}>
                    <label>
                      <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} />
                      <span>{task.title}</span>
                    </label>
                    <button type="button" onClick={() => removeTask(task.id)} aria-label={`Remove ${task.title}`}>×</button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rhythm-section">
            <div className="section-heading rhythm-heading">
              <div><p className="eyebrow">YOUR RHYTHM</p><h2>One step at a time.</h2></div>
            </div>
            <div className="cycle-track" aria-label={`Pomodoro cycle: ${completedSessions % 4} of 4 focus sessions completed`}>
              {[0, 1, 2, 3].map((step) => (
                <span className={step < completedSessions % 4 ? 'cycle-step complete' : 'cycle-step'} key={step}>
                  <span className="cycle-dot" />
                  <span className="cycle-label">{step + 1}</span>
                </span>
              ))}
              <span className="cycle-long-break">LONG<br />BREAK</span>
            </div>
            <div className="rhythm-footer">
              <span>{completedSessions % 4} OF 4 SESSIONS</span>
              <span>THEN A LONGER REST</span>
            </div>
          </section>

          <div className="small-note">
            <span className="note-spark" aria-hidden="true">✳</span>
            <p>Progress is made in the minutes you give your full attention.</p>
          </div>
        </aside>
      </div>

      <footer className="page-footer">
        <span>STILLTIME <span className="footer-dot">/</span> A LITTLE MORE PRESENT</span>
        <span>{mode === 'focus' ? 'FOCUS TIME' : 'REST TIME'} <span className="footer-dot">/</span> {durations[mode]} MINUTES</span>
      </footer>
    </main>
  )
}

export default App