/**
 * Shared confetti helper that always renders **above the Vaul drawer**.
 *
 * The default `canvas-confetti` API creates a single global canvas the first
 * time it's called and locks its `z-index` to whatever value that first call
 * supplied. That made our drawer-launched bursts (claim a reward, win a spin)
 * unpredictable: depending on which feature ran first, the canvas could end
 * up beneath the drawer (z-index 9999) and the celebration would be hidden.
 *
 * To dodge that, we own our own `<canvas>` parked at the maximum allowable
 * z-index, attach it to `document.body`, and route all bursts through a
 * dedicated `confetti.create(...)` instance. Anywhere in the app that wants
 * "drawer-aware" confetti should import `fireConfetti` from here instead of
 * calling `canvas-confetti` directly.
 */

import confettiLib from 'canvas-confetti'

type ConfettiOptions = Parameters<typeof confettiLib>[0]
type ConfettiInstance = (opts?: ConfettiOptions) => Promise<null> | null

let cachedInstance: ConfettiInstance | null = null

function ensureInstance(): ConfettiInstance | null {
  if (typeof window === 'undefined') return null
  if (cachedInstance) return cachedInstance

  const canvas = document.createElement('canvas')
  canvas.setAttribute('data-bol-confetti', 'true')
  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    // 2^31 - 2 — one below the int32 ceiling so Sonner toasts (which set 1 ↑
    // higher in their own portal) can still render above if needed.
    zIndex: '2147483646',
  })
  document.body.appendChild(canvas)

  cachedInstance = confettiLib.create(canvas, {
    resize: true,
    useWorker: true,
  }) as ConfettiInstance
  return cachedInstance
}

/**
 * Fire a confetti burst on the shared "always-on-top" canvas. Mirrors the
 * `canvas-confetti` call signature.
 */
export function fireConfetti(opts?: ConfettiOptions): void {
  const instance = ensureInstance()
  if (!instance) return
  try {
    instance(opts)
  } catch {
    // confetti is purely cosmetic — never let it break the host UI
  }
}
