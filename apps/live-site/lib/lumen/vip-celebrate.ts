import confettiLib from 'canvas-confetti'

let redeemAudio: HTMLAudioElement | null = null
let numbersAudio: HTMLAudioElement | null = null
let numbersFadeTimer = 0
let numbersStopTimer = 0

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

/**
 * Soft messenger “pop” when the welcome inbox springs open
 * (Intercom-style notification cue — Web Audio, no asset).
 */
export function playMessengerPopSound() {
  if (typeof window === 'undefined') return
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    const ctx = new AC()
    const now = ctx.currentTime

    const makeBeep = (freq: number, start: number, dur: number, gainPeak: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, start)
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(gainPeak, start + 0.018)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + dur + 0.02)
    }

    /* Two quiet rising tones ≈ Intercom messenger pop (kept soft vs redeem). */
    makeBeep(620, now, 0.09, 0.11)
    makeBeep(880, now + 0.07, 0.12, 0.09)

    window.setTimeout(() => {
      void ctx.close().catch(() => {})
    }, 400)
  } catch {
    /* ignore */
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

const NUMBERS_PLAY_MS = 1000
const NUMBERS_FADE_MS = 420
const NUMBERS_VOLUME = 0.5

function clearNumbersTimers() {
  if (numbersFadeTimer) {
    window.clearInterval(numbersFadeTimer)
    numbersFadeTimer = 0
  }
  if (numbersStopTimer) {
    window.clearTimeout(numbersStopTimer)
    numbersStopTimer = 0
  }
}

/**
 * BOL SHAD jackpot number roll-up — coins hit VIP crown.
 * Clip is long; play ~2s then fade out.
 */
export function playVipNumbersSound() {
  if (typeof window === 'undefined') return
  try {
    clearNumbersTimers()
    if (!numbersAudio) {
      numbersAudio = new Audio('/sound/jackpot-numbers.mp3')
      numbersAudio.preload = 'auto'
    }
    const audio = numbersAudio
    audio.pause()
    audio.currentTime = 0
    audio.volume = NUMBERS_VOLUME
    void audio.play().catch(() => {
      /* autoplay blocked */
    })

    const fadeStart = Math.max(0, NUMBERS_PLAY_MS - NUMBERS_FADE_MS)
    numbersStopTimer = window.setTimeout(() => {
      const startVol = audio.volume
      const started = performance.now()
      numbersFadeTimer = window.setInterval(() => {
        const t = Math.min(1, (performance.now() - started) / NUMBERS_FADE_MS)
        audio.volume = Math.max(0, startVol * (1 - t))
        if (t >= 1) {
          clearNumbersTimers()
          audio.pause()
          audio.currentTime = 0
          audio.volume = NUMBERS_VOLUME
        }
      }, 32)
    }, fadeStart)
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

/**
 * BOL shad join confirmation — side cannons + centre pop above the auth modal.
 * Same redeem sound as VIP claim confetti.
 */
export function fireJoinWelcomeConfetti() {
  if (typeof window === 'undefined') return
  scrubLegacyCanvases()
  playVipClaimSound()

  const primary = resolvePrimary()
  const colors = [primary, '#ffffff', '#ffb3b3', '#ff7a7a']
  const zIndex = 500

  try {
    void confettiLib({
      particleCount: 90,
      angle: 60,
      spread: 60,
      startVelocity: 55,
      origin: { x: 0.12, y: 0.65 },
      colors,
      ticks: 220,
      zIndex,
      disableForReducedMotion: true,
    })
    void confettiLib({
      particleCount: 90,
      angle: 120,
      spread: 60,
      startVelocity: 55,
      origin: { x: 0.88, y: 0.65 },
      colors,
      ticks: 220,
      zIndex,
      disableForReducedMotion: true,
    })
    window.setTimeout(() => {
      void confettiLib({
        particleCount: 120,
        spread: 100,
        startVelocity: 40,
        gravity: 0.9,
        scalar: 1.05,
        origin: { x: 0.5, y: 0.45 },
        colors,
        ticks: 240,
        zIndex,
        disableForReducedMotion: true,
      })
    }, 300)
  } catch {
    /* cosmetic only */
  }
}

const RAKEBACK_COIN_COUNT = 6
const RAKEBACK_FLY_MS = 1100
/** Crown shake runs 0.55s × 2 — toast waits until after. */
export const RAKEBACK_SHAKE_MS = 1200
/** Sampled points along each cubic toss path (more = smoother arc). */
const RAKEBACK_PATH_STEPS = 7

export type RakebackOrigin = { x: number; y: number; fromTile?: boolean }

type RakebackFlyHandlers = {
  /** Viewport point coins emerge from (game tile or page bottom). */
  origin?: RakebackOrigin | null
  /** Coins hit the VIP icon — bump amount + shake now. */
  onImpact?: () => void
  /** After shake finishes — show toast. */
  onComplete?: () => void
}

/** Snapshot a concrete tile / card element (click target). */
export function originFromTileEl(el: HTMLElement | null | undefined): RakebackOrigin | null {
  if (!el?.isConnected) return null
  const r = el.getBoundingClientRect()
  if (r.width <= 0 || r.height <= 0) return null
  return {
    x: r.left + r.width / 2,
    y: r.top + r.height * 0.62,
    fromTile: true,
  }
}

/**
 * Prefer the most-visible tile with this game id (duplicates across shelves).
 * Falls back to bottom-center of the viewport.
 */
export function resolveRakebackOrigin(gameId?: string | null): RakebackOrigin {
  if (typeof window === 'undefined') return { x: 0, y: 0, fromTile: false }

  if (gameId) {
    const safeId =
      typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
        ? CSS.escape(gameId)
        : gameId.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    const tiles = document.querySelectorAll<HTMLElement>(
      `[data-casino-game-id="${safeId}"]`,
    )
    const vh = window.innerHeight
    const vw = window.innerWidth
    let best: { score: number; x: number; y: number } | null = null
    tiles.forEach((tile) => {
      const r = tile.getBoundingClientRect()
      const ix = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0))
      const iy = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0))
      const score = ix * iy
      if (score < 48) return
      if (!best || score > best.score) {
        best = {
          score,
          x: r.left + r.width / 2,
          y: r.top + r.height * 0.62,
        }
      }
    })
    if (best) return { x: best.x, y: best.y, fromTile: true }
  }

  return {
    x: window.innerWidth / 2,
    y: window.innerHeight - 56,
    fromTile: false,
  }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/** Cubic Bézier sample — natural toss arcs (not a straight mid-point). */
function cubic(
  t: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number,
) {
  const u = 1 - t
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
}

type PathPoint = { x: number; y: number; scale: number; opacity: number; offset: number }

/**
 * Build a loose cubic toss from floor → VIP: lift, sideways drift, ease into crown.
 */
function buildCoinPath(
  fromX: number,
  fromY: number,
  endX: number,
  endY: number,
  side: number,
): PathPoint[] {
  const dx = endX - fromX
  const dy = endY - fromY
  const dist = Math.hypot(dx, dy) || 1
  /* Perpendicular unit — bulge the arc left or right. */
  const px = (-dy / dist) * side
  const py = (dx / dist) * side

  const lift = 90 + Math.random() * 70
  const bulge = 70 + Math.random() * 90
  const launchDrift = (20 + Math.random() * 36) * side

  /* Control 1: rise + kick sideways (leave the pile). */
  const c1x = fromX + dx * 0.18 + px * (bulge * 0.35) + launchDrift
  const c1y = fromY - lift * (0.55 + Math.random() * 0.25)
  /* Control 2: high/side approach, then settle into VIP. */
  const c2x = endX - dx * 0.12 + px * bulge * 0.85
  const c2y = endY - lift * (0.35 + Math.random() * 0.2) + py * 8

  const points: PathPoint[] = []
  for (let i = 0; i <= RAKEBACK_PATH_STEPS; i++) {
    const t = i / RAKEBACK_PATH_STEPS
    /* Ease time along path — linger on the rise, settle into the crown. */
    const te = t * t * (3 - 2 * t)
    const x = cubic(te, fromX, c1x, c2x, endX)
    const y = cubic(te, fromY, c1y, c2y, endY)
    const scale = t < 0.12 ? lerp(0.88, 1, t / 0.12) : t > 0.82 ? lerp(1, 0.4, (t - 0.82) / 0.18) : 1
    const opacity =
      t < 0.08 ? lerp(0, 0.92, t / 0.08) : t > 0.88 ? lerp(0.92, 0, (t - 0.88) / 0.12) : 0.92
    points.push({ x, y, scale, opacity, offset: t })
  }
  return points
}

function keyframesFromPath(path: PathPoint[], scaleMul = 1, opacityMul = 1): Keyframe[] {
  return path.map((p) => ({
    transform: `translate(${p.x}px, ${p.y}px) scale(${p.scale * scaleMul})`,
    opacity: p.opacity * opacityMul,
    offset: p.offset,
  }))
}

function resolveVipTarget(): { x: number; y: number; el: HTMLElement | null } {
  const el = document.querySelector<HTMLElement>('[data-shell-vip]')
  if (el) {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) {
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, el }
    }
  }
  /* Fallback: top-right chrome if VIP button not in DOM yet. */
  return {
    x: Math.max(48, window.innerWidth - 120),
    y: 44,
    el: null,
  }
}

function spawnImpactBurst(layer: HTMLElement, x: number, y: number) {
  const burst = document.createElement('span')
  burst.className = 'rakeback-impact-burst'
  burst.style.left = `${x}px`
  burst.style.top = `${y}px`
  layer.appendChild(burst)
  window.setTimeout(() => burst.remove(), 650)

  for (let i = 0; i < 5; i++) {
    const spark = document.createElement('span')
    spark.className = 'rakeback-impact-spark'
    spark.style.left = `${x}px`
    spark.style.top = `${y}px`
    const angle = (Math.PI * 2 * i) / 5 + Math.random() * 0.2
    const dist = 10 + Math.random() * 10
    layer.appendChild(spark)
    spark.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.75 },
        {
          transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(0.35)`,
          opacity: 0,
        },
      ],
      { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' },
    )
    window.setTimeout(() => spark.remove(), 340)
  }
}

/**
 * Demo: after closing a casino game, gold coins arc into the header VIP crown with trails.
 * `onImpact` when coins land (shake). `onComplete` after shake — then toast.
 */
export function flyRakebackCoinsToVip(handlers?: RakebackFlyHandlers | (() => void)) {
  const onImpact = typeof handlers === 'function' ? handlers : handlers?.onImpact
  const onComplete = typeof handlers === 'function' ? undefined : handlers?.onComplete
  const originOpt = typeof handlers === 'function' ? null : handlers?.origin

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    onImpact?.()
    onComplete?.()
    return
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    playVipNumbersSound()
    onImpact?.()
    window.setTimeout(() => onComplete?.(), 300)
    return
  }

  const { x: endX, y: endY, el: vipEl } = resolveVipTarget()
  const origin = originOpt ?? resolveRakebackOrigin(null)
  const startX = origin.x
  const startY = origin.y

  document.querySelectorAll('[data-rakeback-coins]').forEach((node) => node.remove())

  const layer = document.createElement('div')
  layer.setAttribute('data-rakeback-coins', '')
  layer.setAttribute('aria-hidden', 'true')
  document.body.appendChild(layer)

  let impacted = false
  let numbersPlayed = false
  const hit = () => {
    if (impacted) return
    impacted = true
    spawnImpactBurst(layer, endX, endY)
    if (vipEl) {
      vipEl.classList.add('vip-rakeback-impact')
      window.setTimeout(() => vipEl.classList.remove('vip-rakeback-impact'), 500)
    }
    onImpact?.()
    window.setTimeout(() => {
      layer.remove()
      onComplete?.()
    }, RAKEBACK_SHAKE_MS)
  }

  for (let i = 0; i < RAKEBACK_COIN_COUNT; i++) {
    /* Tight cluster — reads as emerging from the tile / bottom, not a mid-screen spawn. */
    const jitterX = (Math.random() - 0.5) * 36
    const jitterY = (Math.random() - 0.5) * 20
    const fromX = startX + jitterX
    const fromY = startY + jitterY
    /* Alternate arc sides so the flock fans instead of stacking. */
    const side = (i % 2 === 0 ? 1 : -1) * (0.75 + Math.random() * 0.55)
    const path = buildCoinPath(fromX, fromY, endX, endY, side)
    const delay = 50 + i * 85 + Math.round(Math.random() * 40)
    const duration = RAKEBACK_FLY_MS + Math.round(Math.random() * 160)

    /* Soft trail — follows the same curve, slightly behind. */
    for (let t = 0; t < 2; t++) {
      const ghost = document.createElement('span')
      ghost.className = 'rakeback-fly-coin rakeback-fly-coin--trail'
      ghost.style.left = '0'
      ghost.style.top = '0'
      layer.appendChild(ghost)
      const ghostAnim = ghost.animate(keyframesFromPath(path, 0.75 - t * 0.1, 0.28 - t * 0.08), {
        duration,
        delay: delay + 24 + t * 28,
        /* Linear between samples — the path already carries the ease. */
        easing: 'linear',
        fill: 'forwards',
      })
      ghostAnim.finished.then(() => ghost.remove()).catch(() => ghost.remove())
    }

    const coin = document.createElement('span')
    coin.className = 'rakeback-fly-coin'
    coin.style.left = '0'
    coin.style.top = '0'
    layer.appendChild(coin)

    /* Cue ~150ms before first coin lands — impact felt a hair late. */
    if (i === 0) {
      window.setTimeout(() => {
        if (numbersPlayed) return
        numbersPlayed = true
        playVipNumbersSound()
      }, Math.max(0, delay + duration - 150))
    }

    const anim = coin.animate(keyframesFromPath(path), {
      duration,
      delay,
      easing: 'linear',
      fill: 'forwards',
    })

    anim.finished
      .then(() => {
        coin.remove()
        if (!numbersPlayed) {
          numbersPlayed = true
          playVipNumbersSound()
        }
        if (i === RAKEBACK_COIN_COUNT - 1) hit()
      })
      .catch(() => {
        coin.remove()
        if (!numbersPlayed) {
          numbersPlayed = true
          playVipNumbersSound()
        }
        if (i === RAKEBACK_COIN_COUNT - 1) hit()
      })
  }

  /* Safety net if WAAPI finished promises stall. */
  window.setTimeout(hit, 50 + (RAKEBACK_COIN_COUNT - 1) * 85 + RAKEBACK_FLY_MS + 280)
}

const BET_DOT_FLY_MS = 720
/** Wait for the new leg to mount before flying (React commit + open animation). */
const BET_DOT_TARGET_TRIES = 24

function rectCenter(el: HTMLElement): { x: number; y: number; el: HTMLElement } | null {
  const r = el.getBoundingClientRect()
  if (r.width <= 0 || r.height <= 0) return null
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, el }
}

function isBetslipDrawerOpen() {
  return Boolean(
    document.querySelector<HTMLElement>(
      '[data-name="soccer-betslip"][data-state="open"]',
    ),
  )
}

/** True when the floating dock has slid into view (not mid scroll-hide). */
function isInViewport(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect()
  if (r.width <= 0 || r.height <= 0) return false
  const vh = window.innerHeight
  const vw = window.innerWidth
  /* Dock sits near bottom — reject off-screen / still translating below fold. */
  return r.top < vh - 4 && r.bottom > 4 && r.left < vw - 4 && r.right > 4
}

/**
 * Prefer the red badge on Betslip — only when the dock is actually on-screen.
 * (Hidden dock uses translateY(100%+2rem); reading it then sends the dot off-screen.)
 */
function resolveNavBetslipTarget(): { x: number; y: number; el: HTMLElement } | null {
  const badge = document.querySelector<HTMLElement>(
    '[data-betslip-fly-target="dock"]',
  )
  if (badge && isInViewport(badge)) {
    const hit = rectCenter(badge)
    if (hit) return hit
  }

  const nav = document.querySelector<HTMLElement>(
    'nav[data-name="nav-menu-icon-solid"] [data-shell-betslip]',
  )
  if (nav && isInViewport(nav)) {
    /* Aim at badge corner of the icon slot when badge not ready yet. */
    const icon = nav.querySelector<HTMLElement>('.relative')
    const slot = icon ?? nav
    if (isInViewport(slot)) {
      const r = slot.getBoundingClientRect()
      return {
        x: r.right - 6,
        y: r.top + 6,
        el: badge && isInViewport(badge) ? badge : slot,
      }
    }
  }

  return null
}

/**
 * Open drawer → pick leg. Closed → mobile nav Betslip (or desktop Selection dock).
 * Never the whole open panel (its center lands on Place Bet).
 */
function resolveBetslipTarget(
  pickId?: string,
  preferNav = false,
): { x: number; y: number; el: HTMLElement | null } {
  if (preferNav || !isBetslipDrawerOpen()) {
    const navHit = resolveNavBetslipTarget()
    if (navHit) return navHit

    const dock = document.querySelector<HTMLElement>(
      '[data-name="soccer-betslip-dock"][data-shell-betslip]',
    )
    const dockHit = dock ? rectCenter(dock) : null
    if (dockHit) return dockHit
  }

  if (pickId) {
    const leg = document.querySelector<HTMLElement>(
      `[data-betslip-leg="${CSS.escape(pickId)}"]`,
    )
    const hit = leg ? rectCenter(leg) : null
    if (hit) return hit
  }

  const firstLeg = document.querySelector<HTMLElement>('[data-betslip-leg]')
  const legHit = firstLeg ? rectCenter(firstLeg) : null
  if (legHit) return legHit

  const flyMark = document.querySelector<HTMLElement>('[data-betslip-fly-target]')
  const markHit = flyMark ? rectCenter(flyMark) : null
  if (markHit) return markHit

  const navHit = resolveNavBetslipTarget()
  if (navHit) return navHit

  /* Fallback: floating sports dock mid-right. */
  return {
    x: Math.min(window.innerWidth - 72, window.innerWidth / 2 + 88),
    y: window.innerHeight - 52,
    el: null,
  }
}

function runBetDotFlight(
  originEl: HTMLElement | null | undefined,
  pickId?: string,
  preferNav = false,
) {
  const { x: endX, y: endY } = resolveBetslipTarget(pickId, preferNav)
  let startX = window.innerWidth / 2
  let startY = window.innerHeight * 0.45
  if (originEl?.isConnected) {
    const r = originEl.getBoundingClientRect()
    if (r.width > 0 && r.height > 0) {
      startX = r.left + r.width / 2
      startY = r.top + r.height / 2
    }
  }

  document.querySelectorAll('[data-betslip-fly]').forEach((node) => node.remove())

  const layer = document.createElement('div')
  layer.setAttribute('data-betslip-fly', '')
  layer.setAttribute('aria-hidden', 'true')
  document.body.appendChild(layer)

  const side = startX < endX ? 1 : -1
  const path = buildCoinPath(startX, startY, endX, endY, side * (0.55 + Math.random() * 0.35))

  let impacted = false
  const hit = () => {
    if (impacted) return
    impacted = true
    window.setTimeout(() => layer.remove(), 80)
  }

  for (let t = 0; t < 3; t++) {
    const ghost = document.createElement('span')
    ghost.className = 'betslip-fly-dot betslip-fly-dot--trail'
    ghost.style.left = '0'
    ghost.style.top = '0'
    layer.appendChild(ghost)
    const ghostAnim = ghost.animate(keyframesFromPath(path, 0.7 - t * 0.12, 0.32 - t * 0.08), {
      duration: BET_DOT_FLY_MS,
      delay: 18 + t * 32,
      easing: 'linear',
      fill: 'forwards',
    })
    ghostAnim.finished.then(() => ghost.remove()).catch(() => ghost.remove())
  }

  const dot = document.createElement('span')
  dot.className = 'betslip-fly-dot'
  dot.style.left = '0'
  dot.style.top = '0'
  layer.appendChild(dot)

  const anim = dot.animate(keyframesFromPath(path), {
    duration: BET_DOT_FLY_MS,
    easing: 'linear',
    fill: 'forwards',
  })

  anim.finished
    .then(() => {
      dot.remove()
      hit()
    })
    .catch(() => {
      dot.remove()
      hit()
    })

  window.setTimeout(hit, BET_DOT_FLY_MS + 80)
}

function waitForLegThenFly(originEl: HTMLElement | null | undefined, pickId?: string) {
  const launch = () => runBetDotFlight(originEl, pickId, false)
  if (!pickId) {
    launch()
    return
  }
  let tries = 0
  const waitForLeg = () => {
    const leg = document.querySelector(`[data-betslip-leg="${CSS.escape(pickId)}"]`)
    if (leg || tries >= BET_DOT_TARGET_TRIES) {
      launch()
      return
    }
    tries += 1
    window.requestAnimationFrame(waitForLeg)
  }
  window.requestAnimationFrame(waitForLeg)
}

/**
 * Odds → betslip: one primary dot + soft trail ghosts (same arc family as rakeback coins).
 * Desktop: instant (leg / Selection dock). Mobile closed: reveal dock, then fly to badge.
 */
export function flyBetDotToSlip(originEl?: HTMLElement | null, pickId?: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const drawerOpen = isBetslipDrawerOpen()
  const desktop = window.matchMedia('(min-width: 1024px)').matches

  /* Desktop — no dock-reveal delay; fly as soon as leg or Selection dock exists. */
  if (desktop) {
    if (drawerOpen) {
      waitForLegThenFly(originEl, pickId)
      return
    }
    let tries = 0
    const tick = () => {
      const leg = pickId
        ? document.querySelector(`[data-betslip-leg="${CSS.escape(pickId)}"]`)
        : null
      const deskDock = document.querySelector<HTMLElement>(
        '[data-name="soccer-betslip-dock"][data-shell-betslip]',
      )
      const mark = document.querySelector<HTMLElement>(
        '[data-name="soccer-betslip"][data-state="open"] [data-betslip-fly-target]',
      )
      if (leg || mark) {
        runBetDotFlight(originEl, pickId, false)
        return
      }
      if (deskDock && rectCenter(deskDock)) {
        runBetDotFlight(originEl, pickId, true)
        return
      }
      if (tries >= BET_DOT_TARGET_TRIES) {
        runBetDotFlight(originEl, pickId, false)
        return
      }
      tries += 1
      window.requestAnimationFrame(tick)
    }
    window.requestAnimationFrame(tick)
    return
  }

  /* Mobile closed slip: reveal dock, wait until badge is on-screen, then fly. */
  if (!drawerOpen) {
    window.dispatchEvent(
      new CustomEvent('shell-reveal-dock', { detail: { holdMs: 3200 } }),
    )
    const started = performance.now()
    /* Dock transition is 300ms — don't sample while still below the fold. */
    const waitForVisibleDock = () => {
      const nav = resolveNavBetslipTarget()
      const elapsed = performance.now() - started
      if (nav && elapsed >= 280) {
        runBetDotFlight(originEl, pickId, true)
        return
      }
      if (elapsed >= 900) {
        runBetDotFlight(originEl, pickId, true)
        return
      }
      window.requestAnimationFrame(waitForVisibleDock)
    }
    window.requestAnimationFrame(waitForVisibleDock)
    return
  }

  waitForLegThenFly(originEl, pickId)
}
