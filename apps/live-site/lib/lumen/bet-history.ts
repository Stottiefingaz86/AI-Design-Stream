/** Bet History — Figma WIP Wqxp5CMA12JdC77cgqCLpa (expanded 4275:185619 · filters 4473:179048). */

export type BetStatus = 'Won' | 'Pending' | 'Lost' | 'Cancelled'

export type BetType =
  | 'Parlay'
  | 'If-Bet'
  | 'Spread'
  | 'Total'
  | 'Moneyline'
  | 'Future/Prop'
  | 'Racebook'
  | 'Live Parlay'
  | 'Team Total'
  | 'Same Game Parlay'
  | 'Teaser'
  | 'Player Props'
  | 'Live Betting'

export type BetHistoryRow = {
  id: string
  /** Matches DailyFigure.dateKey for day-box filtering (MM/DD/YY). */
  date: string
  dateKey: string
  description: string
  type: BetType
  risk: string
  toWin: string
  status: BetStatus
  detail: {
    comment: string
    betId: string
    acceptedDate: string
    gradedDate: string
  }
}

export type DailyFigure = {
  id: string
  label: string
  amount: number
  /** MM/DD/YY — used to filter the table when selected. */
  dateKey: string
}

export type DailyFiguresWeek = {
  days: DailyFigure[]
  total: number
}

export const BET_STATUS_STYLE: Record<
  BetStatus,
  { backgroundColor: string; borderColor: string; color: string }
> = {
  Won: {
    backgroundColor: 'var(--opacity-success-10)',
    borderColor: 'var(--opacity-success-60)',
    color: 'var(--success)',
  },
  Pending: {
    backgroundColor: 'var(--opacity-warning-10)',
    borderColor: 'var(--opacity-warning-60)',
    color: 'var(--warning)',
  },
  Lost: {
    backgroundColor: 'var(--secondary)',
    borderColor: 'var(--border)',
    color: 'var(--secondary-foreground)',
  },
  Cancelled: {
    backgroundColor: 'var(--secondary)',
    borderColor: 'var(--border)',
    color: 'var(--muted-foreground)',
  },
}

export const BET_FILTER_STATUSES = ['Pending', 'Won', 'Lost', 'Cancelled'] as const

/** Figma filters — Time select options. */
export const BET_FILTER_DATE_RANGES = [
  'Custom',
  'Last 7 days',
  'Last 15 days',
  'Last 30 days',
] as const

/** Figma 4473:179048 — Wager Type radios (Sportsbook children indented). */
export type WagerTypeOption = {
  id: string
  label: string
  indent?: boolean
  /** Maps to BetType values; empty = category (Sportsbook = all sportsbook types). */
  matchTypes: BetType[]
}

export const BET_WAGER_TYPE_OPTIONS: WagerTypeOption[] = [
  {
    id: 'sportsbook',
    label: 'Sportsbook',
    matchTypes: [
      'Future/Prop',
      'If-Bet',
      'Live Parlay',
      'Moneyline',
      'Parlay',
      'Same Game Parlay',
      'Spread',
      'Total',
      'Teaser',
      'Team Total',
    ],
  },
  { id: 'future-prop', label: 'Future/Prop', indent: true, matchTypes: ['Future/Prop'] },
  { id: 'if-bet', label: 'If Bet', indent: true, matchTypes: ['If-Bet'] },
  { id: 'live-parlay', label: 'Live Parlay', indent: true, matchTypes: ['Live Parlay'] },
  { id: 'money-line', label: 'Money Line', indent: true, matchTypes: ['Moneyline'] },
  { id: 'money-line-fb', label: 'Money Line FB', indent: true, matchTypes: ['Moneyline'] },
  { id: 'parlay', label: 'Parlay', indent: true, matchTypes: ['Parlay'] },
  {
    id: 'sgp',
    label: 'Same Game Parlay',
    indent: true,
    matchTypes: ['Same Game Parlay'],
  },
  {
    id: 'sgp-combined',
    label: 'SGParlay Combined',
    indent: true,
    matchTypes: ['Same Game Parlay'],
  },
  { id: 'spread', label: 'Spread', indent: true, matchTypes: ['Spread'] },
  { id: 'spread-fb', label: 'Spread FB', indent: true, matchTypes: ['Spread'] },
  { id: 'total', label: 'Total', indent: true, matchTypes: ['Total', 'Team Total'] },
  { id: 'total-fb', label: 'Total FB', indent: true, matchTypes: ['Total', 'Team Total'] },
  { id: 'teaser', label: 'Teaser', indent: true, matchTypes: ['Teaser'] },
  { id: 'live-betting', label: 'Live Betting', matchTypes: ['Live Betting', 'Live Parlay'] },
  { id: 'racebook', label: 'Racebook', matchTypes: ['Racebook'] },
  { id: 'player-props', label: 'Player Props', matchTypes: ['Player Props', 'Future/Prop'] },
]

export type BetFilters = {
  status: string
  dateRange: string
  dateFrom: string
  dateTo: string
  wagerType: string
}

export const EMPTY_BET_FILTERS: BetFilters = {
  status: '',
  dateRange: 'Last 30 days',
  dateFrom: '',
  dateTo: '',
  wagerType: '',
}

export function betFiltersActiveCount(filters: BetFilters): number {
  return [
    filters.status,
    filters.dateRange,
    filters.dateFrom,
    filters.dateTo,
    filters.wagerType,
  ].filter(Boolean).length
}

export const THIS_WEEK_FIGURES: DailyFiguresWeek = {
  days: [
    { id: 'mon', label: 'Mon 06', amount: -5.56, dateKey: '10/06/26' },
    { id: 'tue', label: 'Tue 07', amount: 120.0, dateKey: '10/07/26' },
    { id: 'wed', label: 'Wed 08', amount: 0, dateKey: '10/08/26' },
    { id: 'thu', label: 'Thu 09', amount: 293.89, dateKey: '10/09/26' },
    { id: 'fri', label: 'Fri 10', amount: -45.0, dateKey: '10/10/26' },
    { id: 'sat', label: 'Sat 11', amount: 88.2, dateKey: '10/11/26' },
    { id: 'sun', label: 'Sun 12', amount: 0, dateKey: '10/12/26' },
  ],
  total: 502.53,
}

export const LAST_WEEK_FIGURES: DailyFiguresWeek = {
  days: [
    { id: 'mon', label: 'Mon 29', amount: -22.0, dateKey: '09/29/26' },
    { id: 'tue', label: 'Tue 30', amount: 0, dateKey: '09/30/26' },
    { id: 'wed', label: 'Wed 01', amount: 54.5, dateKey: '10/01/26' },
    { id: 'thu', label: 'Thu 02', amount: -10.0, dateKey: '10/02/26' },
    { id: 'fri', label: 'Fri 03', amount: 200.0, dateKey: '10/03/26' },
    { id: 'sat', label: 'Sat 04', amount: -80.25, dateKey: '10/04/26' },
    { id: 'sun', label: 'Sun 05', amount: 15.0, dateKey: '10/05/26' },
  ],
  total: 157.25,
}

type SeedRow = Omit<BetHistoryRow, 'id' | 'detail' | 'dateKey'> & {
  comment: string
  betId: string
  acceptedDate: string
  gradedDate: string
}

const SEED: SeedRow[] = [
  {
    date: '10/03/26',
    description: 'Parlay (3 Teams)',
    type: 'Parlay',
    risk: '$100.00',
    toWin: '$100.00',
    status: 'Won',
    comment: 'NFL Week 4',
    betId: '820497432-1',
    acceptedDate: '10/03/26 6:02 PM GMT-3',
    gradedDate: '10/03/26 11:40 PM GMT-3',
  },
  {
    date: '10/03/26',
    description: 'If-Bet (2 Teams)',
    type: 'If-Bet',
    risk: '$100.00',
    toWin: '$100.00',
    status: 'Pending',
    comment: '1 + First Entry',
    betId: '820497432-5',
    acceptedDate: '10/03/26 7:15 PM GMT-3',
    gradedDate: 'N/A',
  },
  {
    date: '10/03/26',
    description: 'Denver Broncos +3.5 -120 For Game',
    type: 'Spread',
    risk: '$100.00',
    toWin: '$83.33',
    status: 'Lost',
    comment: 'NFL',
    betId: '820497432-8',
    acceptedDate: '10/03/26 1:10 PM GMT-3',
    gradedDate: '10/03/26 10:05 PM GMT-3',
  },
  {
    date: '10/02/26',
    description: 'Lakers / Celtics Over 224.5',
    type: 'Total',
    risk: '$50.00',
    toWin: '-',
    status: 'Cancelled',
    comment: 'Void — game postponed',
    betId: '820491100-2',
    acceptedDate: '10/02/26 8:00 PM GMT-3',
    gradedDate: '10/02/26 9:12 PM GMT-3',
  },
  {
    date: '10/02/26',
    description: 'Chiefs ML -145',
    type: 'Moneyline',
    risk: '$145.00',
    toWin: '$100.00',
    status: 'Pending',
    comment: 'NFL',
    betId: '820491100-9',
    acceptedDate: '10/02/26 4:22 PM GMT-3',
    gradedDate: 'N/A',
  },
  {
    date: '10/01/26',
    description: 'Super Bowl LX Winner — Bills',
    type: 'Future/Prop',
    risk: '$25.00',
    toWin: '$200.00',
    status: 'Won',
    comment: 'Futures',
    betId: '819900001-3',
    acceptedDate: '10/01/26 12:00 PM GMT-3',
    gradedDate: 'N/A',
  },
  {
    date: '10/01/26',
    description: 'Gulfstream Park Race 5 #3',
    type: 'Racebook',
    risk: '$20.00',
    toWin: '$48.00',
    status: 'Won',
    comment: 'Win',
    betId: 'RB-44102',
    acceptedDate: '10/01/26 3:45 PM GMT-3',
    gradedDate: '10/01/26 4:20 PM GMT-3',
  },
  {
    date: '09/30/26',
    description: 'Yankees / Red Sox Under 8.5',
    type: 'Total',
    risk: '$100.00',
    toWin: '$110.00',
    status: 'Lost',
    comment: 'MLB',
    betId: '820480055-4',
    acceptedDate: '09/30/26 6:30 PM GMT-3',
    gradedDate: '09/30/26 11:05 PM GMT-3',
  },
  {
    date: '09/30/26',
    description: 'NFL Week 4 Props Bundle',
    type: 'Parlay',
    risk: '$40.00',
    toWin: '-',
    status: 'Cancelled',
    comment: 'Cancelled by trading',
    betId: '820480055-7',
    acceptedDate: '09/30/26 2:00 PM GMT-3',
    gradedDate: '09/30/26 2:15 PM GMT-3',
  },
  {
    date: '09/29/26',
    description: 'Live Parlay (2 Teams)',
    type: 'Live Parlay',
    risk: '$75.00',
    toWin: '$180.00',
    status: 'Won',
    comment: 'In-play',
    betId: 'LB-90211',
    acceptedDate: '09/29/26 9:18 PM GMT-3',
    gradedDate: '09/29/26 10:02 PM GMT-3',
  },
  {
    date: '10/06/26',
    description: 'Patriots -3.5 -110',
    type: 'Spread',
    risk: '$55.00',
    toWin: '$50.00',
    status: 'Lost',
    comment: 'NFL',
    betId: '820510001-1',
    acceptedDate: '10/06/26 5:00 PM GMT-3',
    gradedDate: '10/06/26 11:20 PM GMT-3',
  },
  {
    date: '10/07/26',
    description: 'Parlay (4 Teams)',
    type: 'Parlay',
    risk: '$25.00',
    toWin: '$280.00',
    status: 'Won',
    comment: 'Mixed',
    betId: '820510220-2',
    acceptedDate: '10/07/26 1:15 PM GMT-3',
    gradedDate: '10/07/26 10:45 PM GMT-3',
  },
  {
    date: '10/09/26',
    description: 'Same Game Parlay — Chiefs',
    type: 'Same Game Parlay',
    risk: '$50.00',
    toWin: '$340.00',
    status: 'Won',
    comment: 'SGP',
    betId: '820520100-6',
    acceptedDate: '10/09/26 7:00 PM GMT-3',
    gradedDate: '10/09/26 11:55 PM GMT-3',
  },
  {
    date: '10/10/26',
    description: 'Charles Town - Race #1',
    type: 'Racebook',
    risk: '$30.00',
    toWin: '$45.00',
    status: 'Lost',
    comment: 'Place',
    betId: 'RB-44990',
    acceptedDate: '10/10/26 2:10 PM GMT-3',
    gradedDate: '10/10/26 2:40 PM GMT-3',
  },
  {
    date: '10/11/26',
    description: 'Cowboys ML +130',
    type: 'Moneyline',
    risk: '$50.00',
    toWin: '$65.00',
    status: 'Won',
    comment: 'NFL',
    betId: '820530044-3',
    acceptedDate: '10/11/26 4:00 PM GMT-3',
    gradedDate: '10/11/26 10:30 PM GMT-3',
  },
]

export const BET_HISTORY_ROWS: BetHistoryRow[] = SEED.map((row, i) => {
  const { comment, betId, acceptedDate, gradedDate, ...rest } = row
  return {
    ...rest,
    id: `bet-${i + 1}`,
    dateKey: rest.date,
    detail: { comment, betId, acceptedDate, gradedDate },
  }
})

export function filterBetHistoryRows(
  rows: BetHistoryRow[],
  opts: {
    status?: string
    wagerType?: string
    dayDateKey?: string | null
  },
): BetHistoryRow[] {
  let next = rows
  if (opts.dayDateKey) {
    next = next.filter((row) => row.dateKey === opts.dayDateKey)
  }
  if (opts.status) {
    next = next.filter((row) => row.status === opts.status)
  }
  if (opts.wagerType) {
    const option = BET_WAGER_TYPE_OPTIONS.find((item) => item.id === opts.wagerType)
    if (option) {
      next = next.filter((row) => option.matchTypes.includes(row.type))
    }
  }
  return next
}

export function formatFigureAmount(amount: number) {
  if (amount === 0) return '$0.00'
  const abs = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return amount > 0 ? `+$${abs}` : `-$${abs}`
}
