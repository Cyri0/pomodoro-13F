import { useEffect } from 'react'
import './PomodoroCube.css'
import { MINUTES, formatTime, selectedFromAngle, usePomodoroStore } from './pomodoroStore'

const EASE = 'transform 0.45s cubic-bezier(.2,.8,.2,1)'

export default function PomodoroCube() {
    const angle = usePomodoroStore((s) => s.angle)
    const dragging = usePomodoroStore((s) => s.dragging)
    const status = usePomodoroStore((s) => s.status)
    const remaining = usePomodoroStore((s) => s.remaining)
    const toggle = usePomodoroStore((s) => s.toggle)
    const tick = usePomodoroStore((s) => s.tick)
    const beginDrag = usePomodoroStore((s) => s.beginDrag)
    const moveDrag = usePomodoroStore((s) => s.moveDrag)
    const endDrag = usePomodoroStore((s) => s.endDrag)

    const selected = selectedFromAngle(angle)
    const totalMs = MINUTES[selected] * 60_000

    useEffect(() => {
        usePomodoroStore.setState({ status: 'idle' })
    }, [selected])

    useEffect(() => {
        if (status !== 'running') return
        const id = setInterval(tick, 100)
        return () => clearInterval(id)
    }, [status, tick])

    const onPointerDown = (e: React.PointerEvent) => {
        const rect = e.currentTarget.getBoundingClientRect()
        beginDrag(rect.left + rect.width / 2, rect.top + rect.height / 2, e.clientX, e.clientY)
        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const display = status === 'idle' ? totalMs : remaining
    const buttonLabel =
        status === 'idle' ? 'Start' : status === 'running' ? 'Szünet' : status === 'paused' ? 'Folytatás' : 'Újra'
    const transition = dragging ? 'none' : EASE

    return (
        <div
            className={`pc-scene${dragging ? ' dragging' : ''}`}
            onPointerDown={onPointerDown}
            onPointerMove={(e) => moveDrag(e.clientX, e.clientY)}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
        >
            <div className="pc-tilt">
                <div className="pc-cube" style={{ transform: `rotateZ(${angle}deg)`, transition }}>
                    <div className="pc-face pc-front">
                        <div className="pc-front-inner" style={{ transform: `rotateZ(${-angle}deg)`, transition }}>
                            <span className={`pc-time ${status}`}>{formatTime(display)}</span>
                            <button
                                className={`pc-button ${status}`}
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={toggle}
                            >
                                {buttonLabel}
                            </button>
                        </div>
                    </div>

                    {MINUTES.map((min, i) => (
                        <div
                            key={min}
                            className={`pc-face pc-side${i === selected ? ' selected' : ''}`}
                            style={{ transform: `rotateZ(${i * 90}deg) rotateX(90deg) translateZ(calc(var(--s) / 2))` }}
                        >
                            <span className="pc-number">{min}</span>
                            <span className="pc-unit">perc</span>
                        </div>
                    ))} 

                    <div className="pc-face pc-back" style={{ transform: 'rotateY(180deg) translateZ(calc(var(--s) / 2))' }} />
                </div>
            </div>

        </div>
    )
}