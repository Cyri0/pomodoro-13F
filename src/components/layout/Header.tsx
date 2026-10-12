import { Hexagon, Settings, Volume2, VolumeX } from 'lucide-react'
import { IconButton } from '../ui/IconButton.tsx'
import { useTimerStore } from '../../store/timerStore.ts'

type HeaderProps = {
  onOpenSettings: () => void
}

export function Header({ onOpenSettings }: HeaderProps) {
  const soundEnabled = useTimerStore((state) => state.soundEnabled)
  const setSoundEnabled = useTimerStore((state) => state.setSoundEnabled)

  return (
    <header className="flex items-center justify-between gap-4 px-1">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-[var(--accent)]">
          <Hexagon className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-zinc-500">Instrument</p>
          <h1 className="text-lg font-semibold tracking-[0.18em]">FOCUS CUBE</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <IconButton
          label={soundEnabled ? 'Mute completion sound' : 'Enable completion sound'}
          icon={soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          aria-pressed={soundEnabled}
          onClick={() => setSoundEnabled(!soundEnabled)}
        />
        <IconButton
          label="Open settings"
          icon={<Settings className="size-4" />}
          onClick={onOpenSettings}
        />
      </div>
    </header>
  )
}
