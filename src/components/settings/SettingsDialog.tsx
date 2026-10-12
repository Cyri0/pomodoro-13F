import { useEffect, useId, useRef, useState } from 'react'
import { SettingsPanel } from './SettingsPanel.tsx'
import { useTimerStore } from '../../store/timerStore.ts'
import type { TimerConfig, ValidationErrors } from '../../types/timer.ts'

type SettingsDialogProps = {
  open: boolean
  onClose: () => void
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const config = useTimerStore((state) => state.config)
  const status = useTimerStore((state) => state.status)
  const applyConfig = useTimerStore((state) => state.applyConfig)
  const [draft, setDraft] = useState<TimerConfig>(config)
  const [errors, setErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      setDraft(config)
      setErrors({})
    }
    if (!open && dialog.open) {
      dialog.close()
    }
  }, [open, config])

  const locked = status === 'running'

  const handleApply = () => {
    const result = applyConfig(draft)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    setErrors({})
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={onClose}
      className="w-[min(100%,28rem)] rounded-3xl border border-white/10 bg-[#16181f] p-0 text-zinc-100 shadow-2xl backdrop:bg-black/65"
    >
      <div className="grid gap-5 p-6">
        <div className="grid gap-1">
          <h2 id={titleId} className="text-lg font-semibold tracking-tight">
            Session settings
          </h2>
          <p className="text-sm text-zinc-400">Durations apply on start or when you press Apply.</p>
        </div>
        <SettingsPanel
          draft={draft}
          errors={errors}
          locked={locked}
          onChange={setDraft}
          onApply={handleApply}
          onCancel={onClose}
        />
      </div>
    </dialog>
  )
}
