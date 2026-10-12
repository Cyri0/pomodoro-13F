import { create } from 'zustand'
import { playChime, unlockAudio } from './lib/chime'

export type Mode = 'focus' | 'short' | 'long' | 'deep'
export type Status = 'idle' | 'running' | 'paused' | 'done'

export interface Preset {
  mode: Mode
  label: string
  minutes: number
}

// Index = cube face: 0 top, 1 right, 2 bottom, 3 left.
// After `turns` quarter-turns, face `turns mod 4` is on top and is the active preset.
export const PRESETS: Preset[] = [
  { mode: 'focus', label: 'Focus', minutes: 25 },
  { mode: 'short', label: 'Short break', minutes: 5 },
  { mode: 'long', label: 'Long break', minutes: 15 },
  { mode: 'deep', label: 'Deep work', minutes: 50 },
]

export const SESSIONS_PER_CYCLE = 4
const TICK_MS = 200
const DONE_HOLD_MS = 2400 // how long 00:00 blinks before the cube rolls on

export const mod4 = (n: number) => ((n % 4) + 4) % 4
const msFor = (index: number) => PRESETS[index].minutes * 60_000
const isWork = (mode: Mode) => mode === 'focus' || mode === 'deep'

// Timer handles live outside the state: they're not something components render.
let tickId: ReturnType<typeof setInterval> | undefined
let advanceId: ReturnType<typeof setTimeout> | undefined

function stopTimers() {
  clearInterval(tickId)
  clearTimeout(advanceId)
  tickId = advanceId = undefined
}

interface TimerState {
  turns: number
  status: Status
  durationMs: number
  remainingMs: number // authoritative while not running
  endsAt: number | null // authoritative while running
  now: number
  completedFocus: number

  flipBy: (delta: number) => void
  flipTo: (index: number) => void
  start: () => void
  pause: () => void
  toggle: () => void
  reset: () => void
  tick: () => void
  finish: () => void
  advance: () => void
}

export const useTimer = create<TimerState>()((set, get) => ({
  turns: 0,
  status: 'idle',
  durationMs: msFor(0),
  remainingMs: msFor(0),
  endsAt: null,
  now: Date.now(),
  completedFocus: 0,

  flipBy: (delta) => {
    stopTimers()
    const turns = get().turns + delta
    const ms = msFor(mod4(turns))
    set({ turns, status: 'idle', durationMs: ms, remainingMs: ms, endsAt: null })
  },

  flipTo: (index) => {
    const current = mod4(get().turns)
    if (index === current) return
    // Shortest way round; a half turn goes clockwise.
    let delta = mod4(index - current)
    if (delta === 3) delta = -1
    get().flipBy(delta)
  },

  start: () => {
    const { status, remainingMs } = get()
    if (status === 'running' || status === 'done') return
    unlockAudio()
    if ('Notification' in window && Notification.permission === 'default') void Notification.requestPermission()
    const now = Date.now()
    set({ status: 'running', endsAt: now + remainingMs, now })
    tickId = setInterval(() => get().tick(), TICK_MS)
  },

  pause: () => {
    const { status, endsAt } = get()
    if (status !== 'running' || endsAt === null) return
    stopTimers()
    set({ status: 'paused', remainingMs: Math.max(0, endsAt - Date.now()), endsAt: null })
  },

  toggle: () => (get().status === 'running' ? get().pause() : get().start()),

  reset: () => {
    stopTimers()
    set({ status: 'idle', remainingMs: get().durationMs, endsAt: null })
  },

  tick: () => {
    const now = Date.now()
    set({ now })
    const { endsAt } = get()
    if (endsAt !== null && now >= endsAt) get().finish()
  },

  finish: () => {
    stopTimers()
    const { turns, completedFocus } = get()
    const preset = PRESETS[mod4(turns)]
    set({
      status: 'done',
      remainingMs: 0,
      endsAt: null,
      completedFocus: isWork(preset.mode) ? completedFocus + 1 : completedFocus,
    })
    playChime()
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Time is up', { body: `${preset.label} finished.` })
    }
    advanceId = setTimeout(() => get().advance(), DONE_HOLD_MS)
  },

  // After a finished session: roll to the next phase of the pomodoro cycle.
  advance: () => {
    const { turns, completedFocus } = get()
    let next: Mode = 'focus'
    if (isWork(PRESETS[mod4(turns)].mode)) next = completedFocus % SESSIONS_PER_CYCLE === 0 ? 'long' : 'short'
    const index = PRESETS.findIndex((p) => p.mode === next)
    if (index === mod4(turns)) get().reset()
    else get().flipTo(index)
  },
}))

// ---------- Selectors ----------

type S = TimerState

export const selectIndex = (s: S) => mod4(s.turns)
export const selectPreset = (s: S) => PRESETS[mod4(s.turns)]
export const selectRemaining = (s: S) =>
  s.status === 'running' && s.endsAt !== null ? Math.max(0, s.endsAt - s.now) : s.remainingMs

// Pips filled in the current cycle of 4; show a full row while on the long break it earned.
export const selectFilledPips = (s: S) => {
  const pos = s.completedFocus % SESSIONS_PER_CYCLE
  const earnedLong = pos === 0 && s.completedFocus > 0 && (s.status === 'done' || selectPreset(s).mode === 'long')
  return earnedLong ? SESSIONS_PER_CYCLE : pos
}

export const formatClock = (ms: number) => {
  const sec = Math.ceil(ms / 1000)
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}
