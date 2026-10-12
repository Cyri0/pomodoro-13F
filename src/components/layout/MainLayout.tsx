import { useState, type ReactNode } from 'react'
import { Header } from './Header.tsx'
import { SettingsDialog } from '../settings/SettingsDialog.tsx'
import { useTimerStore } from '../../store/timerStore.ts'
import { useReducedMotion } from '../../hooks/useReducedMotion.ts'

type MainLayoutProps = {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const periodType = useTimerStore((state) => state.periodType)
  const announce = useTimerStore((state) => state.announce)
  const reducedMotion = useReducedMotion()

  return (
    <div
      data-period={periodType}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      className="app-shell min-h-dvh px-4 py-5 sm:px-8 sm:py-8"
    >
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-5xl flex-col gap-8">
        <Header onOpenSettings={() => setSettingsOpen(true)} />
        <main className="flex flex-1 flex-col items-center justify-center gap-8">{children}</main>
      </div>
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announce}
      </div>
    </div>
  )
}
