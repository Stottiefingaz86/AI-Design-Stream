export type JackpotTierId = 'mini' | 'minor' | 'major' | 'mega' | 'network'
export type JackpotTickerTierId = 'mini' | 'minor' | 'major' | 'mega'

export interface JackpotTierConfig {
  id: JackpotTierId
  label: string
  shortLabel: string
  description: string
  /** Added to base stake per spin when this tier is opted in */
  spinAddon: number
  seedAmount: number
  tickMin: number
  tickMax: number
  accent: string
  accentMuted: string
  borderColor: string
}

export interface JackpotTickerTierConfig {
  id: JackpotTickerTierId
  label: string
  shortLabel: string
  seedAmount: number
  tickMin: number
  tickMax: number
  accent: string
}

export const JACKPOT_TICKER_TIERS: JackpotTickerTierConfig[] = [
  {
    id: 'mini',
    label: 'Mini',
    shortLabel: 'MINI',
    seedAmount: 485.73,
    tickMin: 0.01,
    tickMax: 0.12,
    accent: '#58cc83',
  },
  {
    id: 'minor',
    label: 'Minor',
    shortLabel: 'MINOR',
    seedAmount: 6225,
    tickMin: 0.05,
    tickMax: 0.35,
    accent: '#4b76f8',
  },
  {
    id: 'major',
    label: 'Major',
    shortLabel: 'MAJOR',
    seedAmount: 72700,
    tickMin: 0.2,
    tickMax: 1.5,
    accent: '#dd57e1',
  },
  {
    id: 'mega',
    label: 'Mega',
    shortLabel: 'MEGA',
    seedAmount: 1312000,
    tickMin: 0.8,
    tickMax: 5,
    accent: '#ebb532',
  },
]

export const JACKPOT_TIERS: JackpotTierConfig[] = [
  {
    id: 'mini',
    label: 'Mini',
    shortLabel: 'MINI',
    description: 'Hits often — keeps the action going',
    spinAddon: 0.02,
    seedAmount: 485.73,
    tickMin: 0.01,
    tickMax: 0.12,
    accent: '#58cc83',
    accentMuted: 'rgba(88, 204, 131, 0.15)',
    borderColor: 'rgba(88, 204, 131, 0.35)',
  },
  {
    id: 'minor',
    label: 'Minor',
    shortLabel: 'MINOR',
    description: 'Regular wins across the lobby',
    spinAddon: 0.03,
    seedAmount: 6225,
    tickMin: 0.05,
    tickMax: 0.35,
    accent: '#4b76f8',
    accentMuted: 'rgba(75, 118, 248, 0.15)',
    borderColor: 'rgba(75, 118, 248, 0.35)',
  },
  {
    id: 'major',
    label: 'Major',
    shortLabel: 'MAJOR',
    description: 'Bigger pools, bigger moments',
    spinAddon: 0.05,
    seedAmount: 72700,
    tickMin: 0.2,
    tickMax: 1.5,
    accent: '#dd57e1',
    accentMuted: 'rgba(221, 87, 225, 0.15)',
    borderColor: 'rgba(221, 87, 225, 0.35)',
  },
  {
    id: 'mega',
    label: 'Mega',
    shortLabel: 'MEGA',
    description: 'Life-changing top tier',
    spinAddon: 0.1,
    seedAmount: 1312000,
    tickMin: 0.8,
    tickMax: 5,
    accent: '#ebb532',
    accentMuted: 'rgba(235, 181, 50, 0.18)',
    borderColor: 'rgba(235, 181, 50, 0.4)',
  },
  {
    id: 'network',
    label: 'Network',
    shortLabel: 'NETWORK',
    description: 'Shared across all brands',
    spinAddon: 0.15,
    seedAmount: 2480000,
    tickMin: 2,
    tickMax: 12,
    accent: 'var(--ds-primary, #ee3536)',
    accentMuted: 'color-mix(in srgb, var(--ds-primary, #ee3536) 18%, transparent)',
    borderColor: 'color-mix(in srgb, var(--ds-primary, #ee3536) 45%, transparent)',
  },
]

export const JACKPOT_CONTRIBUTION_RATE = 0.01
export const JACKPOT_MIN_QUALIFYING_BET = 1
/** Flat opt-in cost per spin — unlocks all jackpot tiers */
export const JACKPOT_PER_SPIN_ADDON = 0.35

/** Win overlay — odometer starts after win-screen bg lands */
export const JACKPOT_WIN_COUNTUP_DELAY_MS = 900
/** Each digit column spins at the same speed for this long */
export const JACKPOT_ODOMETER_SPIN_MS = 5200
/** Gap between each column stopping, right → left */
export const JACKPOT_ODOMETER_STAGGER_MS = 1050

export function getJackpotWinCountUpDurationMs(digitCount: number): number {
  if (digitCount <= 1) return JACKPOT_ODOMETER_SPIN_MS
  return (digitCount - 1) * JACKPOT_ODOMETER_STAGGER_MS + JACKPOT_ODOMETER_SPIN_MS
}

/** Default for ~9-digit mega amounts */
export const JACKPOT_WIN_COUNTUP_DURATION_MS = getJackpotWinCountUpDurationMs(9)

/** Wheel land → win overlay handoff */
/** Hold on wheel with winner flash + final win sting */
export const JACKPOT_FINAL_SEGMENT_MAX_MS = 750
/** Riser after win sting, before jackpot screen mounts */
export const JACKPOT_TRANSITION_MAX_MS = 1300
/** Riser tail — fade before win-screen bed takes over. */
export const JACKPOT_TRANSITION_FADE_MS = 550
/** Overlay mounted under wheel before wipe reveals it */
export const JACKPOT_OVERLAY_BEAT_MS = 380
/** Winner slice pulses on the wheel before jackpot screen handoff */
export const JACKPOT_WINNER_PULSE_MS = 460
export const JACKPOT_WINNER_PULSE_COUNT = 3
export const JACKPOT_WINNER_FLASH_MS =
  JACKPOT_WINNER_PULSE_MS * JACKPOT_WINNER_PULSE_COUNT + 900
/** Mount overlay + riser after winner flash, then wipe */
export const JACKPOT_POST_FLASH_BEAT_MS = 500
/** Pre-scheduled ticks only — reactive spin ticks use trim + same-frame play instead. */
export const WHEEL_TICK_AUDIO_LEAD_MS = 45
/** Skip leading silence in tick MP3s so the transient aligns with the segment flash. */
export const WHEEL_TICK_TRIM_MS = {
  anticipation: 38,
  spin: 24,
} as const

export function formatJackpotSpinAddon(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/** Flat $0.35 when opted in to all tiers; otherwise $0. */
export function getJackpotSpinAddonTotal(
  tierOptIns: Partial<Record<JackpotTierId, boolean>>
): number {
  const allOn = JACKPOT_TIERS.every((tier) => tierOptIns[tier.id])
  return allOn ? JACKPOT_PER_SPIN_ADDON : 0
}
/** Jackpots tab — only jackpot-network games, capped count */
export const JACKPOT_ELIGIBLE_GAME_LIMIT = 12

/** Compact display: $485.73 · $6,225 · $72.70K · $1.312M */
export function formatJackpotCompact(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000
    return `$${m >= 10 ? m.toFixed(2) : m.toFixed(3)}M`
  }
  if (value >= 10_000) {
    const k = value / 1_000
    return `$${k.toFixed(2)}K`
  }
  if (value >= 1_000) {
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  }
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatJackpotAmount(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function jackpotAmountDigitCount(amount: number): number {
  return formatJackpotAmount(amount).replace(/\D/g, '').length
}

/** Numeric value + suffix for NumberFlow compact display */
export function jackpotCompactParts(value: number): {
  prefix: string
  number: number
  suffix: string
  decimals: number
} {
  if (value >= 1_000_000) {
    const n = value / 1_000_000
    return {
      prefix: '$',
      number: n,
      suffix: 'M',
      decimals: n >= 10 ? 2 : 3,
    }
  }
  if (value >= 10_000) {
    return {
      prefix: '$',
      number: value / 1_000,
      suffix: 'K',
      decimals: 2,
    }
  }
  if (value >= 1_000) {
    return { prefix: '$', number: Math.round(value), suffix: '', decimals: 0 }
  }
  return { prefix: '$', number: value, suffix: '', decimals: 2 }
}
