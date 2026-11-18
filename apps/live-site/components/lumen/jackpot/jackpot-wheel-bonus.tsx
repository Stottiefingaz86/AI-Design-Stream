'use client'

import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { flushSync } from 'react-dom'
import { fireConfetti } from '@/lib/confetti'
import { motion, AnimatePresence, animate, useMotionValue } from 'framer-motion'
import {
  JACKPOT_FINAL_SEGMENT_MAX_MS,
  JACKPOT_TICKER_TIERS,
  JACKPOT_TRANSITION_FADE_MS,
  JACKPOT_TRANSITION_MAX_MS,
  JACKPOT_POST_FLASH_BEAT_MS,
  JACKPOT_WINNER_FLASH_MS,
  JACKPOT_WINNER_PULSE_COUNT,
  JACKPOT_WINNER_PULSE_MS,
  type JackpotTickerTierConfig,
  type JackpotTickerTierId,
} from '@/lib/jackpot/constants'
import { DAILY_SPIN_BY_TIER, pickDailySpinTier } from '@/lib/lumen/daily-spin'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  afterSound,
  ensureJackpotWheelSpinMusic,
  ensureWheelTickBuffersReady,
  fadeOutSound,
  playSpinNowSound,
  playSound,
  preloadJackpotWheelAudio,
  preloadJackpotWinHandoffAudio,
  playWheelHighlightTick,
  preloadWheelHighlightTicks,
  resumeWheelTickAudio,
  startJackpotIntroAudio,
  stopSound,
  stopWheelHighlightTicks,
  swapJackpotBedForWheelSpin,
  unlockAudioPlayback,
} from '@/lib/sounds'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const SEGMENTS_PER_TIER = 2
const SEGMENT_COUNT = JACKPOT_TICKER_TIERS.length * SEGMENTS_PER_TIER
const SEGMENT_ANGLE = 360 / SEGMENT_COUNT
// Anticipation-forward spin: one turn into the slowdown — same crawl speed as before,
// without the long multi-revolution wind-up.
const SPIN_DURATION_MS = 18000
const EXTRA_SPINS = 1
/** Last N segment crossings: louder + higher pitch each step — the anticipation run. */
const EXCITE_SEGMENTS = 10
/** Land mid-slice so the wheel comes to rest dead-centre under the pointer. */
const LAND_SEGMENT_FRACTION = 0.5
/** Begin the final centre nudge once the winning slice is close enough. */
const LAND_SNAP_TOLERANCE_DEG = SEGMENT_ANGLE * 0.32
/** Spring settle into dead centre — smooth ease, no overshoot (avoids segment flicker). */
const LAND_SETTLE_MS = 520
/** Camera push-in once we're into the slow tail (most of this spin is that tail). */
const CLOSE_IN_AT = 0.22
/** Camera push duration (seconds) — keep in sync with remaining spin after CLOSE_IN_AT. */
const CLOSE_IN_DURATION_S = ((1 - CLOSE_IN_AT) * SPIN_DURATION_MS) / 1000
/** final-segment → transition → overlay → wipe */
const WIPE_DURATION_MS = 920
const JACKPOT_BG_VOLUME = 0.30
const JACKPOT_WHEEL_SPIN_VOLUME = 0.38
/** Desktop zoom pushes into the top arc; mobile uses much lower scale so the
    wheel stays inside the viewport instead of clipping off-screen. */
const DESKTOP_WHEEL_LAYOUT = {
  introScale: 0.82,
  zoomScale: 2.65,
  closeScale: 2.88,
  introY: '0%',
  zoomY: '40%',
  closeY: '46%',
  wheelSizeClass: 'h-[min(92vw,420px)] w-[min(92vw,420px)]',
  pointerClass: 'h-[58px] w-[40px]',
} as const

const MOBILE_WHEEL_LAYOUT = {
  introScale: 0.72,
  // Intro: full wheel centred. After Spin: centre pinned to bottom edge (top arc only).
  zoomScale: 2.85,
  closeScale: 2.92,
  introY: '0%',
  zoomY: '50%',
  closeY: '50%',
  wheelSizeClass: 'h-[min(100vw,420px)] w-[min(100vw,420px)]',
  pointerClass: 'h-[46px] w-[32px]',
} as const

/** Daily Spin popup — fills the right column at idle, then grows into the top
    arc on spin like the jackpot wheel (stage is overflow-hidden). */
const DAILY_SPIN_DESKTOP_LAYOUT = {
  introScale: 0.98,
  zoomScale: 2.4,
  closeScale: 2.62,
  introY: '0%',
  zoomY: '38%',
  closeY: '44%',
  wheelSizeClass: 'h-[min(100%,420px)] w-[min(100%,420px)]',
  pointerClass: 'h-[52px] w-[36px]',
} as const

const DAILY_SPIN_MOBILE_LAYOUT = {
  introScale: 0.94,
  zoomScale: 2.5,
  closeScale: 2.66,
  introY: '0%',
  zoomY: '42%',
  closeY: '46%',
  wheelSizeClass: 'h-[min(88vw,380px)] w-[min(88vw,380px)]',
  pointerClass: 'h-[48px] w-[34px]',
} as const

/**
 * Daily Spin wedges — BetOnline red / cream like the brand art.
 * Alternating by segment index (not jackpot tier colors).
 */
const DAILY_SPIN_WEDGE_A = {
  hub: '#b01018',
  mid: '#dc1f28',
  rim: '#ee3536',
  neon: '#ff5a5a',
  accent: '#ee3536',
  text: '#ffffff',
} as const
const DAILY_SPIN_WEDGE_B = {
  hub: '#e4d9c8',
  mid: '#f3ebe0',
  rim: '#faf6f0',
  neon: '#ffffff',
  accent: '#d4af37',
  text: '#1a1a1a',
} as const
const DAILY_SPIN_RIM = {
  gold: '#d4af37',
  goldSoft: '#f0d78c',
  red: '#ee3536',
} as const

const WHEEL_CX = 200
const WHEEL_CY = 200

/** Figma jackpot-wheel segment fills (Casino — Jackpot in Game Header). */
const SEGMENT_PALETTE: Record<
  JackpotTickerTierId,
  { hub: string; mid: string; rim: string; neon: string }
> = {
  mini: { hub: '#1a3d28', mid: '#2b613f', rim: '#58cc83', neon: '#7dde9f' },
  major: { hub: '#5a1058', mid: '#d02ac5', rim: '#dd57e1', neon: '#f0abfc' },
  mega: { hub: '#6b2410', mid: '#dc5c31', rim: '#ebb532', neon: '#fcd34d' },
  minor: { hub: '#1a1520', mid: '#2a2433', rim: '#5b5266', neon: '#9ca3af' },
}

/**
 * Vertical tier wordmarks. Every source PNG is the same native width, so the
 * letters stay one size across tiers and only the height varies with the word
 * length. Filenames contain spaces, hence the encoding.
 */
const TIER_WORDMARK_NATIVE_W = 156
const TIER_WORDMARK: Record<JackpotTickerTierId, { src: string; nativeH: number }> = {
  mini: { src: encodeURI('/WHEEL_LOGO/M I N I.png'), nativeH: 431 },
  major: { src: encodeURI('/WHEEL_LOGO/M A J O R.png'), nativeH: 535 },
  mega: { src: encodeURI('/WHEEL_LOGO/M E G A.png'), nativeH: 431 },
  minor: { src: encodeURI('/WHEEL_LOGO/M I N O R.png'), nativeH: 535 },
}

/** Clockwise order from top — matches Figma: Mini → Major → Mega → Minor. */
const WHEEL_TIER_ORDER: JackpotTickerTierId[] = ['mini', 'major', 'mega', 'minor']

type WheelPhase = 'intro' | 'zoom' | 'spin' | 'landed' | 'wipe'

type WheelSegment = {
  index: number
  tier: JackpotTickerTierConfig
  shade: number
}

function buildSegments(): WheelSegment[] {
  const segments: WheelSegment[] = []
  let index = 0
  // Interleave by shade first so the copies of each tier are spaced evenly
  // around the wheel (e.g. the two Mini slices end up directly opposite each
  // other) rather than sitting next to each other.
  const tiersById = Object.fromEntries(
    JACKPOT_TICKER_TIERS.map((tier) => [tier.id, tier])
  ) as Record<JackpotTickerTierId, JackpotTickerTierConfig>
  for (let shade = 0; shade < SEGMENTS_PER_TIER; shade++) {
    for (const id of WHEEL_TIER_ORDER) {
      segments.push({ index: index++, tier: tiersById[id], shade })
    }
  }
  return segments
}

const WHEEL_SEGMENTS = buildSegments()

/** Toggle segment highlight via DOM — avoids React re-renders on every tick. */
function applyWheelSegmentHighlight(
  svgRoot: SVGSVGElement | null,
  prevIndex: number | null,
  nextIndex: number | null,
  isMobile: boolean
) {
  const setLit = (idx: number, lit: boolean) => {
    const g = svgRoot?.querySelector(`[data-seg="${idx}"]`)
    if (g) {
      g.querySelector('.seg-mute')?.setAttribute('opacity', lit ? '0' : '0.46')
      g.querySelector('.seg-logo')?.setAttribute('opacity', lit ? '1' : '0.5')
    }
    // Overlay layer (drawn above all base slices) carries the bright lit edge.
    const top = svgRoot?.querySelector(`[data-seg-top="${idx}"]`)
    if (top) {
      top.querySelector('.seg-sheen')?.setAttribute('opacity', lit ? '1' : '0')
      const edge = top.querySelector('.seg-edge-top')
      if (edge) {
        edge.setAttribute('stroke-opacity', lit ? '0.58' : '0')
        if (lit && !isMobile) {
          edge.setAttribute('filter', 'url(#litGlow)')
        } else {
          edge.removeAttribute('filter')
        }
      }
    }
  }
  if (prevIndex != null && prevIndex !== nextIndex) setLit(prevIndex, false)
  if (nextIndex != null) setLit(nextIndex, true)
}

function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360
}

function pickWinTier(): JackpotTickerTierId {
  const r = Math.random()
  if (r < 0.45) return 'mega'
  if (r < 0.72) return 'major'
  if (r < 0.88) return 'minor'
  return 'mini'
}

function rotationToLandOnSegment(segmentIndex: number): number {
  // Land in the middle of the slice so the wheel rests dead-centre under the pointer.
  const offsetFromTop =
    segmentIndex * SEGMENT_ANGLE + SEGMENT_ANGLE * LAND_SEGMENT_FRACTION
  return EXTRA_SPINS * 360 + normalizeAngle(360 - offsetFromTop)
}

/** Which segment sits under the fixed top pointer at this wheel rotation. */
function segmentAtPointer(rotationDeg: number): number {
  const offsetFromTop = normalizeAngle(-rotationDeg)
  return Math.floor(offsetFromTop / SEGMENT_ANGLE) % SEGMENT_COUNT
}

/**
 * Single continuous ease — velocity never resets mid-spin.
 *
 * Brief launch, then the long decel (anticipation) that used to sit at the
 * end of the multi-revolution spin. Fewer revolutions; same crawl feel.
 */
const SPIN_ACCEL_FRAC = 0.10
const SPIN_DECEL_POW = 2.75
const SPIN_TWO_OVER_PI = 2 / Math.PI
const SPIN_DECEL_SPAN = 1 - SPIN_ACCEL_FRAC
const SPIN_PEAK_V =
  SPIN_DECEL_POW /
  (SPIN_DECEL_SPAN + SPIN_DECEL_POW * SPIN_ACCEL_FRAC * SPIN_TWO_OVER_PI)
const SPIN_ACCEL_DIST = SPIN_PEAK_V * SPIN_ACCEL_FRAC * SPIN_TWO_OVER_PI
const SPIN_DECEL_DIST = 1 - SPIN_ACCEL_DIST

function spinEase(t: number): number {
  if (t >= 1) return 1
  if (t <= 0) return 0
  if (t < SPIN_ACCEL_FRAC) {
    return (
      SPIN_PEAK_V *
      SPIN_ACCEL_FRAC *
      SPIN_TWO_OVER_PI *
      (1 - Math.cos((Math.PI / 2) * (t / SPIN_ACCEL_FRAC)))
    )
  }
  const p = (t - SPIN_ACCEL_FRAC) / SPIN_DECEL_SPAN
  return SPIN_ACCEL_DIST + SPIN_DECEL_DIST * (1 - Math.pow(1 - p, SPIN_DECEL_POW))
}

/** Smooth decel into centre — no overshoot (overshoot caused segment/tick flicker). */
function easeOutCubic(t: number): number {
  if (t >= 1) return 1
  if (t <= 0) return 0
  return 1 - Math.pow(1 - t, 3)
}

/** Segments left before the wheel reaches target — stable, no early rounding. */
function segmentsUntilStop(currentRotation: number, targetRotation: number): number {
  const remainingDeg = Math.max(0, targetRotation - currentRotation)
  if (remainingDeg <= 0.5) return 0
  return Math.ceil(remainingDeg / SEGMENT_ANGLE - 1e-4)
}

function adjustHex(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, Math.max(0, (n >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amount))
  const b = Math.min(255, Math.max(0, (n & 0xff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/**
 * Centre of the tier wordmark, on the wedge bisector. Sits outside the midpoint
 * because a wedge narrows towards the hub — the tall wordmark needs the wider
 * end of the slice to clear the dividers.
 */
function segmentLabelPosition(cx: number, cy: number, outerR: number, midAngle: number) {
  return polarToCartesian(cx, cy, outerR * 0.6, midAngle)
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeSegment(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number
) {
  const startOuter = polarToCartesian(cx, cy, outerR, startAngle)
  const endOuter = polarToCartesian(cx, cy, outerR, endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  if (innerR <= 0) {
    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
      `L ${cx} ${cy}`,
      'Z',
    ].join(' ')
  }
  const startInner = polarToCartesian(cx, cy, innerR, endAngle)
  const endInner = polarToCartesian(cx, cy, innerR, startAngle)
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ')
}

function FanDuelBackground({
  phase,
  isMobile,
}: {
  phase: WheelPhase
  isMobile: boolean
}) {
  const spotlightY = isMobile && phase !== 'intro' ? '72%' : '46%'

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 120% 95% at 50% 40%, #18102a 0%, #0e0818 50%, #06040c 100%)',
        }}
      />

      {/* Soft static spotlight — hidden on intro so the wheel + logo stay clean */}
      {phase !== 'intro' && (
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            top: spotlightY,
            width: isMobile ? '88%' : '64%',
            height: isMobile ? '46%' : '50%',
            background:
              'radial-gradient(circle, rgba(109,40,217,0.18) 0%, rgba(56,189,248,0.05) 42%, transparent 72%)',
            filter: 'blur(40px)',
          }}
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/55" />
    </div>
  )
}

function WheelPointer({
  active,
  pointerClass,
}: {
  active: boolean
  pointerClass: string
  showPinMount?: boolean
}) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-0 z-40 -translate-x-1/2 -translate-y-[18%]">
      <motion.div
        className="absolute left-1/2 top-[55%] h-10 w-16 -translate-x-1/2 rounded-full blur-2xl"
        animate={{
          opacity: active ? 0.85 : 0.2,
          scale: active ? 1.12 : 0.88,
        }}
        transition={{ duration: 0.12 }}
        style={{
          background:
            'radial-gradient(circle, rgba(255,85,85,0.55) 0%, rgba(255,85,85,0.18) 50%, transparent 72%)',
        }}
      />
      <motion.img
        src="/jackpot/wheel-pointer.svg"
        alt=""
        aria-hidden
        draggable={false}
        className={cn(
          'relative block drop-shadow-[0_5px_4px_rgba(255,255,255,0.25)]',
          pointerClass
        )}
        animate={active ? { y: [0, 3, 0] } : { y: 0 }}
        transition={
          active
            ? { duration: 0.16, ease: 'easeOut' }
            : { duration: 0.2 }
        }
      />
    </div>
  )
}

function IntroConfetti({ active }: { active: boolean }) {
  const firedRef = useRef(false)

  useEffect(() => {
    if (!active || firedRef.current) return
    firedRef.current = true

    const colors = ['#FFD700', '#FFDF00', '#F5E6A3', '#D4AF37', '#FFF8DC', '#ffffff', '#FFA500', '#E8C547']
    const defaults = {
      ticks: 220,
      gravity: 0.72,
      scalar: 1.35,
      colors,
    }

    // Full-width ceiling burst across the entire viewport.
    ;[0.06, 0.2, 0.35, 0.5, 0.65, 0.8, 0.94].forEach((x) => {
      fireConfetti({
        ...defaults,
        particleCount: 52,
        spread: 115,
        startVelocity: 50,
        origin: { x, y: 0.22 },
      })
    })

    // Big centre bloom behind the wheel.
    fireConfetti({
      ...defaults,
      particleCount: 150,
      spread: 360,
      startVelocity: 54,
      scalar: 1.5,
      origin: { x: 0.5, y: 0.4 },
    })

    const sideTimer = setTimeout(() => {
      fireConfetti({
        ...defaults,
        particleCount: 95,
        angle: 62,
        spread: 90,
        startVelocity: 60,
        scalar: 1.4,
        origin: { x: 0, y: 0.58 },
      })
      fireConfetti({
        ...defaults,
        particleCount: 95,
        angle: 118,
        spread: 90,
        startVelocity: 60,
        scalar: 1.4,
        origin: { x: 1, y: 0.58 },
      })
    }, 160)

    // Sustained full-screen gold rain.
    let rainCount = 0
    const rainInterval = setInterval(() => {
      fireConfetti({
        ...defaults,
        particleCount: 48,
        spread: 160,
        startVelocity: 36,
        scalar: 1.25,
        origin: { x: Math.random(), y: 0.02 },
      })
      rainCount += 1
      if (rainCount >= 12) clearInterval(rainInterval)
    }, 380)

    return () => {
      clearTimeout(sideTimer)
      clearInterval(rainInterval)
    }
  }, [active])

  return null
}

function WheelSvg({
  highlightedIndex,
  phase,
  wheelSizeClass,
  isMobile = false,
  wheelGroupRef,
  wheelSvgRef,
  prizeLabels = false,
  brandWedges = false,
}: {
  highlightedIndex: number | null
  phase: WheelPhase
  wheelSizeClass: string
  isMobile?: boolean
  wheelGroupRef?: RefObject<SVGGElement>
  wheelSvgRef?: RefObject<SVGSVGElement>
  /** Daily Spin — prize copy on wedges ($5 / Miss / Free Spins / $100). */
  prizeLabels?: boolean
  /** Daily Spin — red/cream brand wedges + gold rim (not jackpot neon). */
  brandWedges?: boolean
}) {
  const cx = WHEEL_CX
  const cy = WHEEL_CY
  const outerR = 178
  // Full pie slices to the centre — no donut hole or hub competing with segments.
  const segInnerR = 0
  const showHighlight = phase === 'spin' || phase === 'landed' || phase === 'wipe'
  // Only during spin — landed/wipe use React state so the winner slice stays lit.
  const domDrivenHighlight = phase === 'spin'
  // Wordmarks are sized by width so the letters match across tiers; height then
  // follows each PNG's own aspect ratio.
  const logoW = isMobile ? 32 : 31
  const logosEntering = phase === 'zoom'

  return (
    <svg ref={wheelSvgRef} viewBox="0 0 400 400" className={cn('max-w-none', wheelSizeClass)}>
      <defs>
        <filter id="segGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="wheelShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.55" />
        </filter>
        <linearGradient
          id="rimGradient"
          gradientUnits="userSpaceOnUse"
          x1="200"
          y1="22"
          x2="200"
          y2="378"
        >
          {brandWedges ? (
            <>
              <stop offset="0%" stopColor={DAILY_SPIN_RIM.gold} stopOpacity="0.45" />
              <stop offset="22%" stopColor={DAILY_SPIN_RIM.goldSoft} stopOpacity="1" />
              <stop offset="48%" stopColor={DAILY_SPIN_RIM.red} stopOpacity="1" />
              <stop offset="72%" stopColor={DAILY_SPIN_RIM.goldSoft} stopOpacity="1" />
              <stop offset="100%" stopColor={DAILY_SPIN_RIM.gold} stopOpacity="0.45" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="18%" stopColor="#67e8f9" stopOpacity="1" />
              <stop offset="38%" stopColor="#c084fc" stopOpacity="1" />
              <stop offset="58%" stopColor="#34d399" stopOpacity="1" />
              <stop offset="78%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.35" />
            </>
          )}
          <animateTransform
            attributeName="gradientTransform"
            type="rotate"
            from="0 200 200"
            to="360 200 200"
            dur="10s"
            repeatCount="indefinite"
          />
        </linearGradient>

        <linearGradient
          id="rimGradientAlt"
          gradientUnits="userSpaceOnUse"
          x1="378"
          y1="200"
          x2="22"
          y2="200"
        >
          {brandWedges ? (
            <>
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="40%" stopColor={DAILY_SPIN_RIM.goldSoft} stopOpacity="0.9" />
              <stop offset="70%" stopColor={DAILY_SPIN_RIM.red} stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.15" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="40%" stopColor="#a5f3fc" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#f0abfc" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.12" />
            </>
          )}
          <animateTransform
            attributeName="gradientTransform"
            type="rotate"
            from="360 200 200"
            to="0 200 200"
            dur="14s"
            repeatCount="indefinite"
          />
        </linearGradient>

        {/* Subtle glossy top crescent — light, so it never washes colours to pastel */}
        <radialGradient id="wheelSheen" cx="50%" cy="14%" r="52%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* Lit-segment sheen — a clean bright bloom from the outer rim that
            fades inward, so the active slice reads as illuminated, not painted. */}
        <radialGradient id="litSheen" cx="50%" cy="6%" r="92%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="32%" stopColor="#ffffff" stopOpacity="0.34" />
          <stop offset="70%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* Soft white glow for the lit slice's edge. */}
        <filter id="litGlow" x="-90%" y="-90%" width="280%" height="280%">
          <feGaussianBlur stdDeviation="5.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <clipPath id="wheelFaceClip">
          <circle cx="200" cy="200" r="178" />
        </clipPath>

        {/* Segment fills — jackpot neon OR Daily Spin red/cream. */}
        {brandWedges
          ? WHEEL_SEGMENTS.map((seg) => {
              const p = seg.index % 2 === 0 ? DAILY_SPIN_WEDGE_A : DAILY_SPIN_WEDGE_B
              return (
                <radialGradient
                  key={`ds-${seg.index}`}
                  id={`segGrad-ds-${seg.index}`}
                  gradientUnits="userSpaceOnUse"
                  cx="200"
                  cy="200"
                  r="178"
                >
                  <stop offset="0%" stopColor={p.hub} />
                  <stop offset="42%" stopColor={p.mid} />
                  <stop offset="82%" stopColor={p.rim} />
                  <stop offset="100%" stopColor={p.neon} />
                </radialGradient>
              )
            })
          : WHEEL_TIER_ORDER.map((tierId) => {
              const p = SEGMENT_PALETTE[tierId]
              return [0, 1].map((shade) => (
                <radialGradient
                  key={`${tierId}-${shade}`}
                  id={`segGrad-${tierId}-${shade}`}
                  gradientUnits="userSpaceOnUse"
                  cx="200"
                  cy="200"
                  r="178"
                >
                  <stop offset="0%" stopColor={adjustHex(p.hub, shade === 0 ? 0 : -10)} />
                  <stop offset="42%" stopColor={adjustHex(p.mid, shade === 0 ? 0 : -12)} />
                  <stop offset="82%" stopColor={p.rim} />
                  <stop offset="100%" stopColor={p.neon} />
                </radialGradient>
              ))
            })}
      </defs>

      <g filter={isMobile ? undefined : 'url(#wheelShadow)'}>
        <circle cx={cx} cy={cy} r={outerR + 12} fill={brandWedges ? "#1a1a1a" : "#0c0616"} />

        {/* Animated outer rim — gradients rotate around the wheel */}
        <circle
          cx={cx}
          cy={cy}
          r={outerR + 10}
          fill="none"
          stroke="url(#rimGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.95"
        />
        <circle
          className="jackpot-rim-dash"
          cx={cx}
          cy={cy}
          r={outerR + 10}
          fill="none"
          stroke="url(#rimGradientAlt)"
          strokeWidth="1.5"
          strokeDasharray="10 18 6 22"
          strokeLinecap="round"
          opacity="0.75"
        />
        <circle
          cx={cx}
          cy={cy}
          r={outerR + 5}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1.5"
        />

        <g ref={wheelGroupRef} style={{ willChange: 'transform' }} clipPath="url(#wheelFaceClip)">
          {WHEEL_SEGMENTS.map((seg) => {
            const start = seg.index * SEGMENT_ANGLE - 90
            const end = start + SEGMENT_ANGLE
            const midAngle = start + SEGMENT_ANGLE / 2
            const label = segmentLabelPosition(cx, cy, outerR, midAngle)
            const wordmark = prizeLabels ? null : TIER_WORDMARK[seg.tier.id]
            const logoH = wordmark
              ? (logoW * wordmark.nativeH) / TIER_WORDMARK_NATIVE_W
              : 0
            const isWinner =
              (phase === 'landed' || phase === 'wipe') &&
              highlightedIndex != null &&
              highlightedIndex === seg.index
            const isWinnerFlash = phase === 'landed' && isWinner
            const isUnderPointer =
              !domDrivenHighlight &&
              showHighlight &&
              highlightedIndex != null &&
              highlightedIndex === seg.index &&
              !isWinnerFlash
            const segmentPath = describeSegment(cx, cy, outerR, segInnerR, start, end)
            const brandWedge = seg.index % 2 === 0 ? DAILY_SPIN_WEDGE_A : DAILY_SPIN_WEDGE_B
            const fillId = brandWedges
              ? `segGrad-ds-${seg.index}`
              : `segGrad-${seg.tier.id}-${seg.shade % 2}`
            const neon = brandWedges ? brandWedge.neon : SEGMENT_PALETTE[seg.tier.id].neon
            const prize = prizeLabels ? DAILY_SPIN_BY_TIER[seg.tier.id] : null

            return (
              <g key={seg.index} data-seg={seg.index} data-neon={neon}>
                {/* Vivid, fully-saturated base slice */}
                <path
                  d={segmentPath}
                  fill={`url(#${fillId})`}
                  stroke="rgba(6,2,12,0.55)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {showHighlight && (
                  <path
                    className="seg-mute"
                    d={segmentPath}
                    fill="#05010a"
                    fillOpacity="0.46"
                    stroke="none"
                    opacity={domDrivenHighlight ? 0.46 : isUnderPointer ? 0 : 0.46}
                  />
                )}
                {/* Soft neon resting edge */}
                <path
                  d={segmentPath}
                  fill="none"
                  stroke={neon}
                  strokeOpacity="0.35"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                {/* Daily Spin: readable prize copy only — no multicolored icons. */}
                {prizeLabels && prize ? (
                  <text
                    className="seg-logo"
                    x={label.x}
                    y={label.y}
                    fill={brandWedges ? brandWedge.text : '#ffffff'}
                    fontSize={prize.labelLine2 ? 13 : 18}
                    fontWeight={800}
                    letterSpacing="0.02em"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${midAngle + 90} ${label.x} ${label.y})`}
                    opacity={
                      prize.kind === 'none'
                        ? domDrivenHighlight
                          ? 0.4
                          : isUnderPointer
                            ? 0.75
                            : showHighlight
                              ? 0.4
                              : 0.7
                        : domDrivenHighlight
                          ? 0.55
                          : isUnderPointer
                            ? 1
                            : showHighlight
                              ? 0.55
                              : 0.95
                    }
                    style={{
                      pointerEvents: 'none',
                      paintOrder: 'stroke fill',
                      stroke:
                        brandWedges && seg.index % 2 === 1
                          ? 'rgba(255,255,255,0.55)'
                          : 'rgba(0,0,0,0.5)',
                      strokeWidth: 2.5,
                    }}
                  >
                    {prize.labelLine2 ? (
                      <>
                        <tspan x={label.x} dy="-0.55em">
                          {prize.label}
                        </tspan>
                        <tspan x={label.x} dy="1.15em" fontSize="10">
                          {prize.labelLine2}
                        </tspan>
                      </>
                    ) : (
                      prize.label
                    )}
                  </text>
                ) : wordmark ? (
                  <image
                    className="seg-logo"
                    href={wordmark.src}
                    x={label.x - logoW / 2}
                    y={label.y - logoH / 2}
                    width={logoW}
                    height={logoH}
                    preserveAspectRatio="xMidYMid meet"
                    transform={`rotate(${midAngle + 90} ${label.x} ${label.y})`}
                    opacity={
                      domDrivenHighlight
                        ? 0.55
                        : isUnderPointer
                          ? 1
                          : showHighlight
                            ? 0.55
                            : 0.95
                    }
                    style={{
                      pointerEvents: 'none',
                      animation: logosEntering
                        ? 'seg-logo-in 0.6s ease-out both'
                        : undefined,
                      filter:
                        !domDrivenHighlight && isUnderPointer
                          ? 'drop-shadow(0 0 6px rgba(255,255,255,0.55))'
                          : undefined,
                    }}
                  />
                ) : null}
              </g>
            )
          })}

          {/* Overlay pass — lit sheen + bright white edge for the active slice,
              drawn after every base slice so the highlight is never clipped by
              the neighbouring segments. */}
          {showHighlight &&
            WHEEL_SEGMENTS.map((seg) => {
              const start = seg.index * SEGMENT_ANGLE - 90
              const end = start + SEGMENT_ANGLE
              const isWinner =
                (phase === 'landed' || phase === 'wipe') &&
                highlightedIndex != null &&
                highlightedIndex === seg.index
              const isWinnerFlash = phase === 'landed' && isWinner
              const isUnderPointer =
                !domDrivenHighlight &&
                highlightedIndex != null &&
                highlightedIndex === seg.index &&
                !isWinnerFlash
              const segmentPath = describeSegment(cx, cy, outerR, segInnerR, start, end)
              return (
                <g key={`top-${seg.index}`} data-seg-top={seg.index}>
                  <path
                    className={cn('seg-sheen', isWinnerFlash && 'jackpot-winner-sheen-burst')}
                    d={segmentPath}
                    fill="url(#litSheen)"
                    stroke="none"
                    opacity={domDrivenHighlight ? 0 : isWinnerFlash ? undefined : isUnderPointer ? 1 : 0}
                  />
                  {isWinner && (
                    <path
                      className={cn(
                        'seg-winner-fill',
                        phase === 'landed'
                          ? 'jackpot-winner-flash-burst'
                          : 'jackpot-winner-fill'
                      )}
                      d={segmentPath}
                      fill="#ffffff"
                      stroke="none"
                    />
                  )}
                  <path
                    className="seg-edge-top"
                    d={segmentPath}
                    fill="none"
                    stroke="#ffffff"
                    strokeOpacity={
                      domDrivenHighlight || isWinnerFlash ? 0 : isUnderPointer ? 0.58 : 0
                    }
                    strokeWidth={isWinner ? 3 : 2.5}
                    strokeLinejoin="round"
                    filter={
                      !domDrivenHighlight && isUnderPointer && !isMobile
                        ? 'url(#litGlow)'
                        : undefined
                    }
                  />
                  {isWinner && (
                    <path
                      className={cn(
                        'seg-winner-edge',
                        phase === 'landed'
                          ? 'jackpot-winner-edge-burst'
                          : 'jackpot-winner-edge'
                      )}
                      d={segmentPath}
                      fill="none"
                      stroke="#ffffff"
                      strokeOpacity={0.55}
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                  )}
                </g>
              )
            })}
        </g>

        {/* Unified glossy sheen — fixed light from the top, doesn't rotate */}
        <circle
          cx={cx}
          cy={cy}
          r={outerR}
          fill="url(#wheelSheen)"
          stroke="none"
          style={{ pointerEvents: 'none' }}
        />

        {/* Figma centre hub — fixed, does not spin with segments */}
        <image
          href="/jackpot/wheel-center.svg"
          x={cx - 12}
          y={cy - 12}
          width="24"
          height="24"
          preserveAspectRatio="xMidYMid meet"
          style={{ pointerEvents: 'none' }}
        />
      </g>
    </svg>
  )
}

const MemoWheelSvg = memo(WheelSvg, (prev, next) => {
  if (prev.phase === 'spin' && next.phase === 'spin') {
    return (
      prev.isMobile === next.isMobile &&
      prev.wheelSizeClass === next.wheelSizeClass &&
      prev.prizeLabels === next.prizeLabels &&
      prev.brandWedges === next.brandWedges
    )
  }
  return (
    prev.highlightedIndex === next.highlightedIndex &&
    prev.phase === next.phase &&
    prev.isMobile === next.isMobile &&
    prev.wheelSizeClass === next.wheelSizeClass &&
    prev.prizeLabels === next.prizeLabels &&
    prev.brandWedges === next.brandWedges
  )
})

export interface JackpotWheelBonusProps {
  onComplete: (tier: JackpotTickerTierId) => void
  /** Fired when the wipe begins — mount the win overlay underneath before the wheel peels away. */
  onWipeStart?: (tier: JackpotTickerTierId) => void
  winTier?: JackpotTickerTierId
  className?: string
  /** Override result title — Daily Spin maps tiers → cash / free spins / nothing. */
  resultTitleForTier?: (tier: JackpotTickerTierId) => string
  /** CTA on intro — default Spin To Win. */
  spinLabel?: string
  /**
   * `daily-spin` — no wipe / no extreme zoom; land → prize card → done.
   * Default jackpot keeps the full handoff for the casino jackpot flow.
   */
  variant?: 'jackpot' | 'daily-spin'
}

export function JackpotWheelBonus({
  onComplete,
  onWipeStart,
  winTier: winTierProp,
  className,
  resultTitleForTier,
  spinLabel = 'Spin To Win',
  variant = 'jackpot',
}: JackpotWheelBonusProps) {
  const isDailySpin = variant === 'daily-spin'
  const [phase, setPhase] = useState<WheelPhase>('intro')
  const [rotation, setRotation] = useState(0)
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
  const [pointerActive, setPointerActive] = useState(false)
  const completedRef = useRef(false)
  const startedRef = useRef(false)
  const spinStartedRef = useRef(false)
  const spinRafRef = useRef<number | null>(null)
  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handoffCancelRef = useRef<(() => void) | null>(null)
  const lastLitIndexRef = useRef<number | null>(null)
  const lastFrameRotationRef = useRef(0)
  const rotationDegRef = useRef(0)
  const wheelGroupRef = useRef<SVGGElement>(null)
  const wheelSvgRef = useRef<SVGSVGElement>(null)
  const closingInStartedRef = useRef(false)
  const isMobile = useIsMobile()
  const layout = isDailySpin
    ? isMobile
      ? DAILY_SPIN_MOBILE_LAYOUT
      : DAILY_SPIN_DESKTOP_LAYOUT
    : isMobile
      ? MOBILE_WHEEL_LAYOUT
      : DESKTOP_WHEEL_LAYOUT
  const wheelScaleMV = useMotionValue<number>(layout.introScale)
  const wheelYMV = useMotionValue<string>(layout.introY)
  const layoutRef = useRef(layout)
  layoutRef.current = layout

  const applyWheelRotation = useCallback((deg: number) => {
    rotationDegRef.current = deg
    wheelGroupRef.current?.setAttribute(
      'transform',
      `rotate(${deg} ${WHEEL_CX} ${WHEEL_CY})`
    )
  }, [])

  // React re-renders can wipe SVG transform attrs — re-apply after each commit.
  useLayoutEffect(() => {
    if (phase === 'spin' || phase === 'landed' || phase === 'wipe') {
      applyWheelRotation(rotationDegRef.current)
    }
  })

  const winTier = useMemo(() => {
    if (winTierProp) return winTierProp
    return isDailySpin ? pickDailySpinTier() : pickWinTier()
  }, [winTierProp, isDailySpin])

  const winningSegmentIndex = useMemo(() => {
    // Shade-0 copy of a tier sits at its index in WHEEL_TIER_ORDER.
    const tierIndex = WHEEL_TIER_ORDER.findIndex((id) => id === winTier)
    if (tierIndex < 0) return 0
    return tierIndex
  }, [winTier])

  const finish = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    onComplete(winTier)
  }, [onComplete, winTier])

  useEffect(() => {
    if (phase !== 'zoom') return
    const l = layoutRef.current
    animate(wheelScaleMV, l.zoomScale, { duration: 1, ease: [0.22, 1, 0.36, 1] })
    animate(wheelYMV, l.zoomY, { duration: 1, ease: [0.22, 1, 0.36, 1] })
  }, [phase, wheelScaleMV, wheelYMV])

  // Preload FX on mount. Jackpot beds only for full jackpot flow — Daily Spin is FX-only.
  useLayoutEffect(() => {
    preloadWheelHighlightTicks()
    void ensureWheelTickBuffersReady()
    preloadJackpotWinHandoffAudio()
    if (!isDailySpin) {
      preloadJackpotWheelAudio(JACKPOT_BG_VOLUME)
      startJackpotIntroAudio(JACKPOT_BG_VOLUME)
    }
    stopWheelHighlightTicks()
    applyWheelRotation(0)
  }, [applyWheelRotation, isDailySpin])

  useEffect(() => {
    return () => {
      if (introTimerRef.current) clearTimeout(introTimerRef.current)
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current)
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current)
      handoffCancelRef.current?.()
      handoffCancelRef.current = null
      if (spinRafRef.current) cancelAnimationFrame(spinRafRef.current)
      stopSound('jackpot-bg')
      stopSound('jackpot-wheel-spin')
      stopSound('jackpot-transition')
      stopWheelHighlightTicks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Spin CTA on all devices: tap unlocks audio, then zoom → spin.
  const handleStartSpin = useCallback(() => {
    if (startedRef.current) return
    startedRef.current = true
    playSpinNowSound(0.85)
    unlockAudioPlayback()
    resumeWheelTickAudio()
    void ensureWheelTickBuffersReady()
    stopWheelHighlightTicks()
    stopSound('jackpot-transition')
    if (!isDailySpin) {
      swapJackpotBedForWheelSpin(JACKPOT_WHEEL_SPIN_VOLUME, 500)
    }
    setPhase('zoom')
    setPointerActive(true)
    setHighlightedIndex(segmentAtPointer(0))
    zoomTimerRef.current = setTimeout(() => setPhase('spin'), 900)
  }, [isDailySpin])

  useEffect(() => {
    if (phase !== 'spin') return
    // Guard against ever starting a second spin loop (which would double up the
    // highlight ticks / desync the sound). The wheel only spins once.
    if (spinStartedRef.current) return
    spinStartedRef.current = true

    closingInStartedRef.current = false

    // Wheel bed is jackpot-only; Daily Spin keeps ticks + win stings only.
    if (!isDailySpin) {
      ensureJackpotWheelSpinMusic(JACKPOT_WHEEL_SPIN_VOLUME)
    }
    resumeWheelTickAudio()
    stopWheelHighlightTicks()

    const targetRotation = rotationToLandOnSegment(winningSegmentIndex)
    const startRotation = rotation
    const totalTravel = targetRotation - startRotation
    const totalCrossings = Math.max(1, Math.ceil(totalTravel / SEGMENT_ANGLE))
    const startTime = performance.now()

    lastLitIndexRef.current = segmentAtPointer(startRotation)
    lastFrameRotationRef.current = startRotation
    rotationDegRef.current = startRotation
    applyWheelRotation(startRotation)
    applyWheelSegmentHighlight(
      wheelSvgRef.current,
      null,
      lastLitIndexRef.current,
      isMobile
    )

    let exciteStep = 0

    /** Tick in the same RAF frame as the segment light-up — sound + highlight stay locked. */
    const playLightTick = (segmentsRemaining: number) => {
      const progress = 1 - segmentsRemaining / totalCrossings

      if (segmentsRemaining > EXCITE_SEGMENTS) {
        exciteStep = 0
        playWheelHighlightTick(0, {
          variant: 'spin',
          volume: 0.14 + progress * 0.36,
          playbackRate: 0.72 + progress * 0.22,
        })
        return
      }

      const step = exciteStep
      exciteStep = Math.min(exciteStep + 1, EXCITE_SEGMENTS)
      const rise = step / Math.max(1, EXCITE_SEGMENTS - 1)

      playWheelHighlightTick(step, {
        variant: 'anticipation',
        volume: 0.58 + rise * 0.42,
        playbackRate: 0.92 + rise * 1.12,
      })
    }

    let spinComplete = false
    let settling = false
    let settleFromRotation = 0
    let settleStartTime = 0

    const finishWinHandoff = () => {
      if (spinComplete) return
      spinComplete = true
      if (spinRafRef.current) {
        cancelAnimationFrame(spinRafRef.current)
        spinRafRef.current = null
      }

      applyWheelRotation(targetRotation)
      setRotation(targetRotation)
      if (winningSegmentIndex !== lastLitIndexRef.current) {
        lastLitIndexRef.current = winningSegmentIndex
        applyWheelSegmentHighlight(
          wheelSvgRef.current,
          null,
          winningSegmentIndex,
          isMobile
        )
      }

      flushSync(() => {
        setHighlightedIndex(winningSegmentIndex)
        setPhase('landed')
      })

      fadeOutSound('jackpot-wheel-spin', 500)
      stopWheelHighlightTicks()

      handoffCancelRef.current?.()
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current)

      /* Daily Spin: one sting + prize card — no wipe / riser / peel (that handoff is jackpot-only). */
      if (isDailySpin) {
        playSound('jackpot-final-segment', { volume: 0.88 })
        playSound('final-selection-win', { volume: 0.9 })
        onWipeStart?.(winTier)
        finishTimerRef.current = setTimeout(() => {
          finish()
        }, 700)
        handoffCancelRef.current = () => {
          if (finishTimerRef.current) clearTimeout(finishTimerRef.current)
        }
        return
      }

      const winnerPulseTimers: ReturnType<typeof setTimeout>[] = []
      for (let i = 0; i < JACKPOT_WINNER_PULSE_COUNT; i++) {
        winnerPulseTimers.push(
          setTimeout(() => {
            playSound('jackpot-final-segment', { volume: 0.88 })
            playSound('final-selection-win', { volume: 0.9 })
          }, i * JACKPOT_WINNER_PULSE_MS)
        )
      }

      handoffCancelRef.current = () => {
        for (const t of winnerPulseTimers) clearTimeout(t)
        if (finishTimerRef.current) clearTimeout(finishTimerRef.current)
      }

      // Winner segment pulses 3×, then riser + overlay mount, then wipe.
      finishTimerRef.current = setTimeout(() => {
        onWipeStart?.(winTier)

        let cancelTransition: (() => void) | null = null
        let riserFadeTimer: ReturnType<typeof setTimeout> | null = null
        const prevCancel = handoffCancelRef.current
        handoffCancelRef.current = () => {
          prevCancel?.()
          cancelTransition?.()
          if (riserFadeTimer) clearTimeout(riserFadeTimer)
        }

        const transitionAudio = playSound('jackpot-transition', { volume: 0.48 })
        const riserFadeAt = Math.max(
          0,
          JACKPOT_TRANSITION_MAX_MS - JACKPOT_TRANSITION_FADE_MS
        )
        riserFadeTimer = setTimeout(
          () => fadeOutSound('jackpot-transition', JACKPOT_TRANSITION_FADE_MS),
          riserFadeAt
        )
        cancelTransition = afterSound(
          transitionAudio,
          JACKPOT_TRANSITION_MAX_MS,
          () => {
            stopSound('jackpot-transition')
          }
        )

        finishTimerRef.current = setTimeout(() => {
          setPhase('wipe')
          finishTimerRef.current = setTimeout(finish, WIPE_DURATION_MS)
        }, JACKPOT_POST_FLASH_BEAT_MS)
      }, JACKPOT_WINNER_FLASH_MS)
    }

    const beginLandSettle = (fromRotation: number) => {
      if (spinComplete || settling) return
      settling = true
      settleFromRotation = fromRotation
      settleStartTime = performance.now()
    }

    const tick = (now: number) => {
      if (settling) {
        const settleT = Math.min(1, (now - settleStartTime) / LAND_SETTLE_MS)
        const settled =
          settleFromRotation +
          (targetRotation - settleFromRotation) * easeOutCubic(settleT)
        applyWheelRotation(settled)

        if (settleT < 1) {
          spinRafRef.current = requestAnimationFrame(tick)
          return
        }

        finishWinHandoff()
        return
      }

      const elapsed = now - startTime
      const t = Math.min(1, elapsed / SPIN_DURATION_MS)
      const current = startRotation + totalTravel * spinEase(t)

      // Slow camera push-in once we're into the decel tail (jackpot only).
      if (t >= CLOSE_IN_AT && !closingInStartedRef.current) {
        closingInStartedRef.current = true
        const l = layoutRef.current
        animate(wheelScaleMV, l.closeScale, {
          duration: CLOSE_IN_DURATION_S,
          ease: [0.33, 0, 0.15, 1],
        })
        animate(wheelYMV, l.closeY, {
          duration: CLOSE_IN_DURATION_S,
          ease: [0.33, 0, 0.15, 1],
        })
      }

      applyWheelRotation(current)

      const prevRot = lastFrameRotationRef.current
      const prevIndex = segmentAtPointer(prevRot)
      const litIndex = segmentAtPointer(current)

      if (litIndex !== prevIndex) {
        const prev = lastLitIndexRef.current
        lastLitIndexRef.current = litIndex
        // Audio first — Web Audio starts in the same turn; highlight paints on the next composite.
        playLightTick(segmentsUntilStop(current, targetRotation))
        applyWheelSegmentHighlight(wheelSvgRef.current, prev, litIndex, isMobile)
      }

      lastFrameRotationRef.current = current

      const remainingDeg = Math.max(0, targetRotation - current)
      const onWinner = litIndex === winningSegmentIndex
      const centredEnough = remainingDeg <= LAND_SNAP_TOLERANCE_DEG

      if (onWinner && centredEnough) {
        beginLandSettle(current)
        spinRafRef.current = requestAnimationFrame(tick)
        return
      }

      if (t < 1) {
        spinRafRef.current = requestAnimationFrame(tick)
        return
      }

      beginLandSettle(current)
      spinRafRef.current = requestAnimationFrame(tick)
    }

    spinRafRef.current = requestAnimationFrame(tick)

    return () => {
      if (spinRafRef.current) cancelAnimationFrame(spinRafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, winningSegmentIndex, applyWheelRotation])

  const zoomed = phase !== 'intro'
  // Figma shows the pointer on the idle wheel as well as during the spin.
  const showPointer = true
  // Mobile half-wheel: bottom-pinned centre only after Spin — intro stays centred.
  // Daily Spin keeps the full wheel centred (no jackpot half-wheel crop).
  const mobileBottomWheel = !isDailySpin && isMobile && zoomed

  return (
    <motion.div
      className={cn(
        isDailySpin
          ? 'relative z-0 size-full overflow-hidden'
          : 'absolute inset-0 z-[100010] overflow-hidden',
        !isDailySpin && (isMobile ? 'rounded-none' : 'rounded-2xl'),
        className
      )}
      initial={false}
      animate={{
        clipPath:
          phase === 'wipe' ? 'inset(0 0 0 100%)' : 'inset(0 0 0 0)',
      }}
      transition={{
        duration: phase === 'wipe' ? WIPE_DURATION_MS / 1000 : 0,
        ease: [0.45, 0, 0.15, 1],
      }}
      style={{ willChange: phase === 'wipe' ? 'clip-path' : undefined }}
    >
      {isDailySpin ? (
        <div className="absolute inset-0 z-0 bg-background" />
      ) : (
        <FanDuelBackground phase={phase} isMobile={isMobile} />
      )}
      {!isDailySpin ? <IntroConfetti active={phase === 'intro'} /> : null}

      {/* Gold flash — 3 pulses on the winner before handoff */}
      <AnimatePresence>
        {phase === 'landed' && (
          <motion.div
            initial={{ opacity: 0.95 }}
            animate={{ opacity: [0.95, 0.4, 0.95, 0.4, 0.95, 0.4, 0.25] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: JACKPOT_WINNER_FLASH_MS / 1000,
              times: [0, 0.14, 0.28, 0.42, 0.56, 0.7, 1],
              ease: 'easeInOut',
            }}
            className="pointer-events-none absolute inset-0 z-[15]"
            style={{
              background:
                'radial-gradient(circle at 50% 38%, rgba(255,215,0,0.48) 0%, rgba(212,175,55,0.16) 42%, transparent 68%)',
            }}
          />
        )}
      </AnimatePresence>

      <div
        className={cn(
          'absolute inset-0 z-10 overflow-hidden',
          !mobileBottomWheel && 'flex items-center justify-center'
        )}
      >
        <motion.div
          className={cn(
            'relative flex items-center justify-center',
            mobileBottomWheel && 'absolute bottom-0 left-1/2'
          )}
          style={{
            scale: wheelScaleMV,
            y: wheelYMV,
            x: mobileBottomWheel ? '-50%' : 0,
            transformOrigin: mobileBottomWheel ? '50% 50%' : undefined,
          }}
        >
          {showPointer && (
            <WheelPointer
              active={pointerActive}
              pointerClass={layout.pointerClass}
            />
          )}

          {phase === 'intro' ? (
            <div
              role="button"
              tabIndex={0}
              aria-label="Spin to Win"
              onClick={handleStartSpin}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleStartSpin()
                }
              }}
              className="relative cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              {/* Idle pulse — opacity glow only (nested scale jitters against SVG rotation). */}
              {isDailySpin ? (
                <>
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-[-14%] rounded-full"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(238,53,54,0.42) 0%, rgba(212,175,55,0.2) 42%, transparent 72%)',
                    }}
                    animate={{ opacity: [0.35, 1, 0.35] }}
                    transition={{
                      duration: 2.1,
                      repeat: Infinity,
                      ease: [0.45, 0, 0.55, 1],
                    }}
                  />
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-[-3%] rounded-full border-2 border-[#d4af37]/60"
                    animate={{ opacity: [0.25, 0.95, 0.25] }}
                    transition={{
                      duration: 2.1,
                      repeat: Infinity,
                      ease: [0.45, 0, 0.55, 1],
                    }}
                  />
                </>
              ) : (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-[-6%] rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(56,189,248,0.22) 0%, transparent 68%)',
                  }}
                  animate={{ opacity: [0.45, 0.9, 0.45] }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: [0.45, 0, 0.55, 1],
                  }}
                />
              )}
              <MemoWheelSvg
                highlightedIndex={highlightedIndex}
                phase={phase}
                wheelSizeClass={layout.wheelSizeClass}
                isMobile={isMobile}
                wheelGroupRef={wheelGroupRef}
                wheelSvgRef={wheelSvgRef}
                prizeLabels={isDailySpin}
                brandWedges={isDailySpin}
              />
            </div>
          ) : (
            <div className="relative">
              <MemoWheelSvg
                highlightedIndex={highlightedIndex}
                phase={phase}
                wheelSizeClass={layout.wheelSizeClass}
                isMobile={isMobile}
                wheelGroupRef={wheelGroupRef}
                wheelSvgRef={wheelSvgRef}
                prizeLabels={isDailySpin}
                brandWedges={isDailySpin}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Spin CTA — all devices; tap unlocks audio and starts the wheel */}
      {phase === 'intro' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'absolute inset-x-0 z-[30] flex justify-center px-4',
            isDailySpin ? 'bottom-4' : 'bottom-[7%] px-6',
          )}
        >
          <Button
            onClick={handleStartSpin}
            className={cn(
              'pointer-events-auto w-full rounded-lg font-semibold text-white hover:opacity-90',
              isDailySpin ? 'h-11 max-w-[220px] text-sm' : 'h-12 max-w-xs text-base',
            )}
            style={{ backgroundColor: 'var(--primary, #ee3536)' }}
          >
            {spinLabel}
          </Button>
        </motion.div>
      )}

      <AnimatePresence>
        {(phase === 'wipe' || (isDailySpin && phase === 'landed')) &&
          highlightedIndex != null && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 28,
            }}
            className={cn(
            'pointer-events-none absolute inset-x-0 z-20 flex justify-center px-4',
            isDailySpin ? 'bottom-16' : 'bottom-[10%]',
          )}
          >
            <motion.div
              initial={{ scale: 0.7 }}
              animate={
                isDailySpin
                  ? { scale: 1 }
                  : { scale: [1, 1.06, 1] }
              }
              transition={
                isDailySpin
                  ? { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
                  : { duration: 0.55, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }
              }
              className={cn(
                'rounded-2xl border px-8 py-5 text-center backdrop-blur-xl',
                isDailySpin ? 'border-border bg-card shadow-[0_16px_48px_rgba(0,0,0,0.55)]' : 'jackpot-landed-card',
              )}
              style={
                isDailySpin
                  ? undefined
                  : {
                      borderColor: `${WHEEL_SEGMENTS[highlightedIndex].tier.accent}cc`,
                      backgroundColor: 'rgba(8,4,16,0.96)',
                      boxShadow: `0 0 64px ${WHEEL_SEGMENTS[highlightedIndex].tier.accent}88, 0 16px 48px rgba(0,0,0,0.6)`,
                    }
              }
            >
              <p
                className={cn(
                  'text-[11px] font-bold uppercase tracking-[0.32em]',
                  isDailySpin ? 'text-muted-foreground' : 'text-amber-200/95',
                )}
              >
                {isDailySpin &&
                resultTitleForTier?.(WHEEL_SEGMENTS[highlightedIndex].tier.id) ===
                  'Nothing this time'
                  ? 'Miss'
                  : 'Winner'}
              </p>
              <p
                className={cn(
                  'mt-1 text-3xl font-bold tracking-wide sm:text-4xl',
                  isDailySpin && 'text-foreground',
                )}
                style={
                  isDailySpin
                    ? undefined
                    : {
                        color: WHEEL_SEGMENTS[highlightedIndex].tier.accent,
                        textShadow: `0 0 36px ${WHEEL_SEGMENTS[highlightedIndex].tier.accent}aa`,
                      }
                }
              >
                {resultTitleForTier
                  ? resultTitleForTier(WHEEL_SEGMENTS[highlightedIndex].tier.id)
                  : `${WHEEL_SEGMENTS[highlightedIndex].tier.label} Jackpot`}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wipe leading edge — soft light sweep, not a colour flash */}
      {phase === 'wipe' && (
        <motion.div
          className="pointer-events-none absolute inset-y-0 z-[100030] w-[3px]"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.85) 50%, transparent 100%)',
            boxShadow:
              '0 0 28px 10px rgba(167,139,250,0.35), 0 0 56px 18px rgba(255,255,255,0.08)',
          }}
          initial={{ left: '0%' }}
          animate={{ left: '100%' }}
          transition={{
            duration: WIPE_DURATION_MS / 1000,
            ease: [0.45, 0, 0.15, 1],
          }}
        />
      )}
    </motion.div>
  )
}
