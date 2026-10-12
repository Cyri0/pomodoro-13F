const W = 60
const H = 100
const T = 11 // segment thickness
const G = 2.5 // gap between segments

function hSeg(yc: number) {
  const x1 = T / 2 + G
  const x2 = W - T / 2 - G
  const h = T / 2
  return `${x1},${yc} ${x1 + h},${yc - h} ${x2 - h},${yc - h} ${x2},${yc} ${x2 - h},${yc + h} ${x1 + h},${yc + h}`
}

function vSeg(xc: number, y1: number, y2: number) {
  const h = T / 2
  return `${xc},${y1} ${xc + h},${y1 + h} ${xc + h},${y2 - h} ${xc},${y2} ${xc - h},${y2 - h} ${xc - h},${y1 + h}`
}

const SEGMENTS = {
  a: hSeg(T / 2),
  b: vSeg(W - T / 2, T / 2 + G, H / 2 - G),
  c: vSeg(W - T / 2, H / 2 + G, H - T / 2 - G),
  d: hSeg(H - T / 2),
  e: vSeg(T / 2, H / 2 + G, H - T / 2 - G),
  f: vSeg(T / 2, T / 2 + G, H / 2 - G),
  g: hSeg(H / 2),
} as const

type Seg = keyof typeof SEGMENTS

const DIGITS: Record<string, string> = {
  '0': 'abcdef',
  '1': 'bc',
  '2': 'abged',
  '3': 'abgcd',
  '4': 'fgbc',
  '5': 'afgcd',
  '6': 'afgedc',
  '7': 'abc',
  '8': 'abcdefg',
  '9': 'abcdfg',
}

export function Digit({ value }: { value: string }) {
  const on = DIGITS[value] ?? ''
  return (
    <svg className="digit" viewBox={`-2 -2 ${W + 4} ${H + 4}`} aria-hidden>
      {(Object.keys(SEGMENTS) as Seg[]).map((s) => (
        <polygon key={s} points={SEGMENTS[s]} className={on.includes(s) ? 'seg on' : 'seg'} />
      ))}
    </svg>
  )
}
