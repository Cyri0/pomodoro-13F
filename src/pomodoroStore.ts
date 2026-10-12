import { create } from 'zustand'

export const MINUTES = [5, 15, 30, 60] as const

export type Status = 'idle' | 'running' | 'paused' | 'done'

const mod4 = (n: number) => ((n % 4) + 4) % 4

export const selectedFromAngle = (angle: number) => mod4(-Math.round(angle / 90))

export function formatTime(ms: number) {
    const totalSec = Math.ceil(ms / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const normalize = (deg: number) => {
    if (deg > 180) return deg - 360
    if (deg < -180) return deg + 360
    return deg
}

interface PomodoroState {
    angle: number
    dragging: boolean
    status: Status
    remaining: number
    endAt: number

    toggle: () => void
    tick: () => void
    beginDrag: (cx: number, cy: number, x: number, y: number) => void
    moveDrag: (x: number, y: number) => void
    endDrag: () => void
}

export const usePomodoroStore = create<PomodoroState>()((set, get) => {
    const drag = { active: false, cx: 0, cy: 0, lastAngle: 0, startAngle: 0, moved: false }

    const pointerAngle = (x: number, y: number) =>
        (Math.atan2(y - drag.cy, x - drag.cx) * 180) / Math.PI

    return {
        angle: 0,
        dragging: false,
        status: 'idle',
        remaining: 0,
        endAt: 0,

        toggle: () => {
            const { status, angle, remaining, endAt } = get()
            const now = Date.now()
            const totalMs = MINUTES[selectedFromAngle(angle)] * 60_000

            if (status === 'idle') {
                set({ remaining: totalMs, endAt: now + totalMs, status: 'running' })
            } else if (status === 'running') {
                set({ remaining: Math.max(0, endAt - now), status: 'paused' })
            } else if (status === 'paused') {
                set({ endAt: now + remaining, status: 'running' })
            } else {
                set({ status: 'idle' })
            }
        },

        tick: () => {
            const left = get().endAt - Date.now()
            if (left <= 0) set({ remaining: 0, status: 'done' })
            else set({ remaining: left })
        },

        beginDrag: (cx, cy, x, y) => {
            drag.active = true
            drag.cx = cx
            drag.cy = cy
            drag.moved = false
            const a = pointerAngle(x, y)
            drag.lastAngle = a
            drag.startAngle = a
            set({ dragging: true })
        },

        moveDrag: (x, y) => {
            if (!drag.active) return
            const a = pointerAngle(x, y)
            const delta = normalize(a - drag.lastAngle)
            drag.lastAngle = a

            const total = normalize(a - drag.startAngle)
            if (!drag.moved && Math.abs(total) > 2) {
                drag.moved = true
                set({ status: 'idle' })
            }
            if (drag.moved) set((s) => ({ angle: s.angle + delta }))
        },

        endDrag: () => {
            if (!drag.active) return
            drag.active = false
            set((s) => ({ dragging: false, angle: Math.round(s.angle / 90) * 90 }))
        },
    }
})