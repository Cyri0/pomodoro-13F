let audioContext: AudioContext | null = null

function getContext(): AudioContext | null {
  const AudioCtx = window.AudioContext
  if (!AudioCtx) return null
  if (!audioContext) {
    audioContext = new AudioCtx()
  }
  return audioContext
}

export async function playPeriodCompleteChime(): Promise<void> {
  const ctx = getContext()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }

  const now = ctx.currentTime
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.07, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55)
  gain.connect(ctx.destination)

  const first = ctx.createOscillator()
  first.type = 'sine'
  first.frequency.setValueAtTime(523.25, now)
  first.connect(gain)
  first.start(now)
  first.stop(now + 0.28)

  const second = ctx.createOscillator()
  second.type = 'sine'
  second.frequency.setValueAtTime(659.25, now + 0.16)
  second.connect(gain)
  second.start(now + 0.16)
  second.stop(now + 0.55)
}
