import { Brain, Coffee, Hexagon, Moon } from 'lucide-react'
import type { ReactNode } from 'react'
import { facePeriodType } from '../../lib/cubeGeometry.ts'
import { durationSecondsFor, periodHeadline, periodPrompt } from '../../lib/timerCycle.ts'
import { formatMmSs } from '../../lib/timeFormatting.ts'
import type { CubeFaceId, PeriodType, TimerConfig } from '../../types/timer.ts'

type CubeFaceProps = {
  face: CubeFaceId
  isActive: boolean
  remainingMs: number
  config: TimerConfig
}

const FACE_TRANSFORM: Record<CubeFaceId, string> = {
  front: 'cube-face-front',
  right: 'cube-face-right',
  back: 'cube-face-back',
  left: 'cube-face-left',
  top: 'cube-face-top',
  bottom: 'cube-face-bottom',
}

function FaceIcon({ kind }: { kind: PeriodType | 'brand' }): ReactNode {
  const className = 'size-5 opacity-80'
  switch (kind) {
    case 'focus':
      return <Brain className={className} aria-hidden="true" />
    case 'shortBreak':
      return <Coffee className={className} aria-hidden="true" />
    case 'longBreak':
      return <Moon className={className} aria-hidden="true" />
    case 'brand':
      return <Hexagon className={className} aria-hidden="true" />
  }
}

export function CubeFace({ face, isActive, remainingMs, config }: CubeFaceProps) {
  const kind = facePeriodType(face)
  const displayMs =
    kind === 'brand'
      ? remainingMs
      : isActive
        ? remainingMs
        : durationSecondsFor(kind, config) * 1000

  const title = kind === 'brand' ? 'FOCUS CUBE' : periodHeadline(kind)
  const prompt = kind === 'brand' ? 'A calm cycle' : periodPrompt(kind)
  const palette = kind === 'brand' ? 'brand' : kind

  return (
    <article
      data-face={face}
      data-active={isActive ? 'true' : 'false'}
      className={`cube-face ${FACE_TRANSFORM[face]} cube-face-${palette} ${isActive ? 'is-active' : 'opacity-90'}`}
      aria-hidden={!isActive}
    >
      <div className="relative z-10 flex flex-col items-center gap-2 text-center">
        <FaceIcon kind={kind} />
        <p className="text-[0.68rem] font-semibold tracking-[0.28em]">{title}</p>
        <p className="font-mono text-[clamp(1.85rem,8.4cqi,2.75rem)] font-semibold leading-none tracking-tight tabular-nums">
          {formatMmSs(displayMs)}
        </p>
        <p className="max-w-[12ch] text-[0.72rem] tracking-wide text-current/70">{prompt}</p>
      </div>
    </article>
  )
}
