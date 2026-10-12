import { useEffect, useRef } from 'react'
import { PRESETS, mod4, useTimer } from '../store'
import { Display } from './Display'

// Face index matches PRESETS: 0 top, 1 right, 2 bottom, 3 left.
const SIDE_FACES = [
  { cls: 'top', labelRotate: 0 },
  { cls: 'right', labelRotate: 90 },
  { cls: 'bottom', labelRotate: 180 },
  { cls: 'left', labelRotate: -90 },
]

// How much shade a face gets depending on where it currently sits (top, right, bottom, left).
const SHADE = [0, 0.07, 0.3, 0.16]

export function Cube() {
  const turns = useTimer((s) => s.turns)
  const flipTo = useTimer((s) => s.flipTo)
  const toggle = useTimer((s) => s.toggle)
  const liftRef = useRef<HTMLDivElement>(null)
  const shadowRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)

  // Hop the cube up while it rolls so its corners don't sink into the table.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const timing = { duration: 700, easing: 'cubic-bezier(.45,0,.35,1)' }
    liftRef.current?.animate(
      [{ transform: 'translateY(0)' }, { transform: 'translateY(-16%)' }, { transform: 'translateY(0)' }],
      timing,
    )
    shadowRef.current?.animate(
      [
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(.78)', opacity: 0.55 },
        { transform: 'scale(1)', opacity: 1 },
      ],
      timing,
    )
  }, [turns])

  return (
    <div className="stage">
      <div className="floor-shadow" ref={shadowRef} />
      <div className="lift" ref={liftRef}>
        <div className="view">
          <div className="cube" style={{ transform: `rotateZ(${-90 * turns}deg)` }}>
            {/* Slightly smaller square core fills the gaps left by the rounded face corners. */}
            {['front', 'back', 'top', 'bottom', 'right', 'left'].map((f) => (
              <div key={f} className={`core ${f}`} />
            ))}
            <div className="face front" onClick={toggle}>
              <div className="bezel">
                <div className="well">
                  {/* Counter-rotate so the screen stays upright, like the real thing's gyro. */}
                  <div className="upright" style={{ transform: `rotate(${90 * turns}deg)` }}>
                    <Display />
                  </div>
                </div>
              </div>
            </div>
            <div className="face back" />
            {SIDE_FACES.map((f, i) => {
              const position = mod4(i - turns)
              const preset = PRESETS[i]
              return (
                <div
                  key={f.cls}
                  className={`face ${f.cls} ${position === 0 ? 'active' : ''}`}
                  onClick={() => flipTo(i)}
                  title={`${preset.label} · ${preset.minutes} min`}
                >
                  <div className="label" style={{ transform: `rotate(${f.labelRotate}deg)` }}>
                    <span className="num">{preset.minutes}</span>
                    <span className="min">MIN</span>
                  </div>
                  <div className="shade" style={{ opacity: SHADE[position] }} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
