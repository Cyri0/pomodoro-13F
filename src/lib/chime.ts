let ctx: AudioContext | null = null

// Browsers only allow audio after a user gesture, so call this from a click/keypress.
export function unlockAudio() {
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
}

export function playChime() {
  if (!ctx) return
  const t0 = ctx.currentTime
  ;[0, 0.22, 0.44].forEach((offset, i) => {
    const osc = ctx!.createOscillator()
    const gain = ctx!.createGain()
    osc.type = 'sine'
    osc.frequency.value = i === 2 ? 1320 : 880
    gain.gain.setValueAtTime(0, t0 + offset)
    gain.gain.linearRampToValueAtTime(0.25, t0 + offset + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + offset + 0.35)
    osc.connect(gain).connect(ctx!.destination)
    osc.start(t0 + offset)
    osc.stop(t0 + offset + 0.4)
  })
}
