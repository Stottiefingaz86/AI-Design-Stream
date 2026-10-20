/** Promo26 My Bonus — Sports + Casino table mock data (Figma 11:577555 / 11:578194). */

export type BonusStatus = 'Complete' | 'Expired' | 'Active' | 'Pending'

export type SportsBonusDetail = {
  name: string
  amount: string
  rolloverAmount: string
  remaining: string
  dateTime: string
  status: BonusStatus
  notes: string
}

export type SportsBonusRow = {
  id: string
  code: string
  amount: string
  rollover: string
  date: string
  status: BonusStatus
  detail: SportsBonusDetail
}

export type CasinoBonusDetail = {
  initialAmount: string
  remainingAmount: string
  redeemedOn: string
  notes: string
}

export type CasinoBonusRow = {
  id: string
  name: string
  code: string
  bonusFund: string
  expiryDate: string
  rollover: string
  freeSpins: string
  action: 'pick' | 'play'
  detail: CasinoBonusDetail
}

const SPORTS_CODES = ['PromoCode', 'Spin2026', 'Christmas', 'Code2016'] as const
const SPORTS_STATUSES: BonusStatus[] = ['Complete', 'Expired', 'Active', 'Pending']
const SPORTS_ROLLOVERS = ['$5.00', '$0.00', '$5.00', '$0.00']

export const MY_BONUS_SPORTS_ROWS: SportsBonusRow[] = Array.from({ length: 10 }, (_, i) => {
  const code = SPORTS_CODES[i % SPORTS_CODES.length]!
  const status = SPORTS_STATUSES[i % SPORTS_STATUSES.length]!
  const rollover = SPORTS_ROLLOVERS[i % SPORTS_ROLLOVERS.length]!
  return {
    id: `sports-${i + 1}`,
    code,
    amount: '$4.00',
    rollover,
    date: '11/04/2014',
    status,
    detail: {
      name: code,
      amount: '$2.00',
      rolloverAmount: rollover,
      remaining: status === 'Active' ? '$1.99' : '$0.00',
      dateTime: '11/04/2014 7:15 PM GMT-3',
      status,
      notes: 'N/A',
    },
  }
})

const CASINO_NAMES = ['PromoCode', 'Spins'] as const
const CASINO_ROLLOVERS = ['$0.00/$350.00', '$45.99/$500.00', '$0.00/$350.00', '$12.00/$200.00']
const CASINO_SPINS = ['5', '250', '5', '10']

export const MY_BONUS_CASINO_ROWS: CasinoBonusRow[] = Array.from({ length: 10 }, (_, i) => ({
  id: `casino-${i + 1}`,
  name: CASINO_NAMES[i % CASINO_NAMES.length]!,
  code: '1888100',
  bonusFund: '$100.00',
  expiryDate: '11/04/2014',
  rollover: CASINO_ROLLOVERS[i % CASINO_ROLLOVERS.length]!,
  freeSpins: CASINO_SPINS[i % CASINO_SPINS.length]!,
  action: i % 2 === 0 ? 'pick' : 'play',
  detail: {
    initialAmount: '$100.00',
    remainingAmount: '$0.00',
    redeemedOn: 'May 25, 2024',
    notes: 'Select a game to apply the free sprint bonus.',
  },
}))

/**
 * Figma outline badges — set via CSS vars (Tailwind border-[var] was dropping the tinted edge).
 * Complete/Active/Pending: opacity-*-10 fill + opacity-*-60 border + tone text.
 * Expired: secondary fill + border + secondary-foreground.
 */
export const BONUS_STATUS_STYLE: Record<
  BonusStatus,
  { backgroundColor: string; borderColor: string; color: string }
> = {
  Complete: {
    backgroundColor: 'var(--opacity-info-10)',
    borderColor: 'var(--opacity-info-60)',
    color: 'var(--info)',
  },
  Expired: {
    backgroundColor: 'var(--secondary)',
    borderColor: 'var(--border)',
    color: 'var(--secondary-foreground)',
  },
  Active: {
    backgroundColor: 'var(--opacity-success-10)',
    borderColor: 'var(--opacity-success-60)',
    color: 'var(--success)',
  },
  Pending: {
    backgroundColor: 'var(--opacity-warning-10)',
    borderColor: 'var(--opacity-warning-60)',
    color: 'var(--warning)',
  },
}

/** Filter sheet / drawer — Figma 2113:51754 / 2116:56405 */
export const BONUS_FILTER_STATUSES = [
  'Active',
  'Complete',
  'Expired',
  'Pending',
  'Rejected',
  'Cancelled',
] as const

export const BONUS_FILTER_DATE_RANGES = [
  'Last 7 days',
  'Last 30 days',
  'Last 90 days',
  'This year',
] as const

export type BonusFilters = {
  status: string
  dateRange: string
  specificDate: string
}

export const EMPTY_BONUS_FILTERS: BonusFilters = {
  status: '',
  dateRange: '',
  specificDate: '',
}

export function bonusFiltersActiveCount(filters: BonusFilters): number {
  return [filters.status, filters.dateRange, filters.specificDate].filter(Boolean).length
}
