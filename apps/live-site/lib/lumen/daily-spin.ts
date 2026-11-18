/** VIP Hub — Daily Spin. BOL jackpot wheel; prizes = cash | free spins | nothing. */

import type { JackpotTickerTierId } from '@/lib/jackpot/constants'

export type DailySpinPrizeKind = 'cash' | 'free-spins' | 'none'

export type DailySpinSegment = {
  id: string
  kind: DailySpinPrizeKind
  value: number
  /** Short wedge label — readable on the wheel face. */
  label: string
  /** Optional second line on the wedge (e.g. Free Spins). */
  labelLine2?: string
  /** Lumen SVG for VIP / wedge accent — not AI 3D art. */
  icon: string
  tier: JackpotTickerTierId
}

/**
 * Wheel tiers → Daily Spin outcomes only.
 * Mini $5 · Minor nothing · Major Free Spins · Mega $100
 */
export const DAILY_SPIN_BY_TIER: Record<JackpotTickerTierId, DailySpinSegment> = {
  mini: {
    id: 'mini',
    kind: 'cash',
    value: 5,
    label: '$5',
    icon: '/shell/figma/cashier/cashier-dollar.svg',
    tier: 'mini',
  },
  minor: {
    id: 'minor',
    kind: 'none',
    value: 0,
    label: 'Miss',
    icon: '/shell/figma/ubc/ticket.svg',
    tier: 'minor',
  },
  major: {
    id: 'major',
    kind: 'free-spins',
    value: 10,
    label: '10',
    labelLine2: 'Free Spins',
    icon: '/shell/figma/ubc/gift.svg',
    tier: 'major',
  },
  mega: {
    id: 'mega',
    kind: 'cash',
    value: 100,
    label: '$100',
    icon: '/shell/figma/header/crown-gold.svg',
    tier: 'mega',
  },
}

export const DAILY_SPIN_ID = 'daily-spin'

export function dailySpinFromTier(tier: JackpotTickerTierId): DailySpinSegment {
  return DAILY_SPIN_BY_TIER[tier]
}

export function dailySpinResultTitle(tier: JackpotTickerTierId): string {
  const seg = DAILY_SPIN_BY_TIER[tier]
  if (seg.kind === 'none') return 'Nothing this time'
  if (seg.kind === 'free-spins') return `${seg.value} Free Spins`
  return `$${seg.value}`
}

export function dailySpinResultCopy(segment: DailySpinSegment): {
  title: string
  body: string
} {
  if (segment.kind === 'cash') {
    return {
      title: `You won $${segment.value}`,
      body: 'Added to your balance.',
    }
  }
  if (segment.kind === 'free-spins') {
    return {
      title: `${segment.value} Free Spins`,
      body: 'Play on Chicken from VIP Hub.',
    }
  }
  return {
    title: 'Nothing this time',
    body: 'Come back on your next login.',
  }
}

/** Daily Spin weights — miss common, big cash rare. */
export function pickDailySpinTier(): JackpotTickerTierId {
  const bag: JackpotTickerTierId[] = [
    ...Array(28).fill('minor'), // nothing
    ...Array(22).fill('mini'), // $5
    ...Array(14).fill('major'), // Free Spins
    ...Array(4).fill('mega'), // $100
  ]
  return bag[Math.floor(Math.random() * bag.length)]!
}
