import confettiLib from 'canvas-confetti'

let redeemAudio: HTMLAudioElement | null = null

/** Remove any broken custom confetti canvases from earlier experiments. */
function scrubLegacyCanvases() {
  if (typeof document === 'undefined') return
  document.querySelectorAll('[data-bol-confetti]').forEach((node) => node.remove())
}

function resolvePrimary(): string {
  if (typeof window === 'undefined') return '#ee3536'
  const computed = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()
  return computed || '#ee3536'
}

/** Normalised 0–1 origin from an element, using layout viewport (not visualViewport). */
function originFromElement(el: HTMLElement): { x: number; y: number } {
  const r = el.getBoundingClientRect()
  const x = (r.left + r.width / 2) / window.innerWidth
  const y = (r.top + r.height / 2) / window.innerHeight
  return {
    x: Math.min(0.92, Math.max(0.08, x)),
    y: Math.min(0.85, Math.max(0.12, y)),
  }
}

/** BOL SHAD `playSound('redeem')`. */
export function playVipClaimSound() {
  try {
    if (!redeemAudio) {
      redeemAudio = new Audio('/sound/redeem.mp3')
      redeemAudio.preload = 'auto'
    }
    redeemAudio.pause()
    redeemAudio.currentTime = 0
    redeemAudio.volume = 0.85
    void redeemAudio.play().catch(() => {
      /* autoplay blocked */
    })
  } catch {
    /* ignore */
  }
}

/**
 * Multi-colour claim burst from the claim button.
 * Uses the library default canvas only — no custom canvas (that was firing on the left).
 */
export function fireVipConfetti(origin?: { x: number; y: number }) {
  if (typeof window === 'undefined') return
  scrubLegacyCanvases()

  const primary = resolvePrimary()
  const colors = [primary, '#ffffff', '#fef3c7', '#fde68a', '#fbbf24', '#f87171']
  const o = origin ?? { x: 0.75, y: 0.45 }

  try {
    void confettiLib({
      particleCount: 64,
      startVelocity: 36,
      spread: 68,
      ticks: 200,
      gravity: 0.95,
      scalar: 0.95,
      origin: o,
      colors,
      shapes: ['square', 'circle'],
      zIndex: 250,
      disableForReducedMotion: true,
    })

    window.setTimeout(() => {
      void confettiLib({
        particleCount: 28,
        angle: 60,
        spread: 50,
        origin: { x: Math.max(0.08, o.x - 0.12), y: o.y },
        colors,
        shapes: ['square', 'circle'],
        zIndex: 250,
        disableForReducedMotion: true,
      })
      void confettiLib({
        particleCount: 28,
        angle: 120,
        spread: 50,
        origin: { x: Math.min(0.92, o.x + 0.12), y: o.y },
        colors,
        shapes: ['square', 'circle'],
        zIndex: 250,
        disableForReducedMotion: true,
      })
    }, 100)
  } catch {
    /* cosmetic only */
  }
}

export function celebrateVipClaim(button?: HTMLElement | null) {
  playVipClaimSound()
  const origin =
    button && button.isConnected && button.getClientRects().length > 0
      ? originFromElement(button)
      : { x: 0.78, y: 0.42 }
  fireVipConfetti(origin)
}
