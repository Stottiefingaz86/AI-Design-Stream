import { useSyncExternalStore } from 'react'

/** Placed sports bets — seeded history + whatever the player places this session (localStorage). */
export type BetStatus = 'pending' | 'won' | 'lost' | 'push' | 'void'
export type BetType = 'straight' | 'parlay' | 'sgp'
export type BetSport = 'soccer' | 'nfl'

export type BetLeg = {
  id: string
  label: string
  market: string
  eventLabel: string
  odds: string
  status: BetStatus
  sport: BetSport
  eventHref?: string
  /** Kickoff or live clock at placement. */
  when?: string
  /** Same-game group inside a parlay (SGP counted as one parlay unit). */
  group?: string
}

export type SportsBet = {
  id: string
  type: BetType
  odds: string
  stake: number
  /** Total return if it wins (stake included) — same as the slip's To Win. */
  toWin: number
  status: BetStatus
  placedAt: string
  settledAt?: string
  payout?: number
  legs: BetLeg[]
}

const STORAGE_KEY = 'lumen-sports-bets-v1'

const nfl = (
  label: string,
  market: string,
  eventLabel: string,
  odds: string,
  status: BetStatus,
  extra: Partial<BetLeg> = {},
): BetLeg => ({
  id: `${eventLabel}-${market}-${label}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  label,
  market,
  eventLabel,
  odds,
  status,
  sport: 'nfl',
  ...extra,
})

const soccer = (
  label: string,
  market: string,
  eventLabel: string,
  odds: string,
  status: BetStatus,
  extra: Partial<BetLeg> = {},
): BetLeg => ({ ...nfl(label, market, eventLabel, odds, status, extra), sport: 'soccer' })

const SEA_SF = 'Seattle Seahawks @ San Francisco 49ers'
const KC_BUF = 'Kansas City Chiefs @ Buffalo Bills'
const DAL_PHI = 'Dallas Cowboys @ Philadelphia Eagles'
const DET_GB = 'Detroit Lions @ Green Bay Packers'
const BAL_CIN = 'Baltimore Ravens @ Cincinnati Bengals'
const MUN_MCI = 'Manchester United vs Manchester City'
const COV_BRI = 'Coventry City vs Brighton & Hove Albion'

const SEED: SportsBet[] = [
  {
    id: '48213077',
    type: 'sgp',
    odds: '+450',
    stake: 20,
    toWin: 110,
    status: 'pending',
    placedAt: '2026-11-18T19:05:00Z',
    legs: [
      nfl('Seattle Seahawks', 'Moneyline', SEA_SF, '+105', 'pending', {
        eventHref: '/sports/football/event/sea-sf',
        when: 'Q3 8:42',
      }),
      nfl('Over 44.5', 'Total', SEA_SF, '-110', 'pending', {
        eventHref: '/sports/football/event/sea-sf',
        when: 'Q3 8:42',
      }),
      nfl('Jaxon Smith-Njigba Anytime TD', 'Touchdown Scorer', SEA_SF, '+135', 'won', {
        eventHref: '/sports/football/event/sea-sf',
        when: 'Q3 8:42',
      }),
    ],
  },
  {
    id: '48209914',
    type: 'straight',
    odds: '-110',
    stake: 50,
    toWin: 95.45,
    status: 'pending',
    placedAt: '2026-11-18T16:42:00Z',
    legs: [
      nfl('Bills -2.5', 'Spread', KC_BUF, '-110', 'pending', {
        eventHref: '/sports/football/event/kc-buf',
        when: 'Sun 22 Nov, 1:00 PM',
      }),
    ],
  },
  {
    id: '48207351',
    type: 'parlay',
    odds: '+556',
    stake: 10,
    toWin: 65.6,
    status: 'pending',
    placedAt: '2026-11-18T12:18:00Z',
    legs: [
      nfl('Eagles -6.5', 'Spread', DAL_PHI, '-110', 'pending', {
        eventHref: '/sports/football/event/dal-phi',
        when: 'Sun 22 Nov, 1:00 PM',
      }),
      nfl('Over 49.5', 'Total', DET_GB, '-110', 'pending', {
        eventHref: '/sports/football/event/det-gb',
        when: 'Sun 22 Nov, 8:20 PM',
      }),
      soccer('MCI', '3-Way Regulation', MUN_MCI, '-125', 'pending', {
        eventHref: '/sports/soccer/event/mun-mci',
      }),
    ],
  },
  {
    id: '48201190',
    type: 'parlay',
    odds: '+620',
    stake: 15,
    toWin: 108,
    status: 'pending',
    placedAt: '2026-11-17T21:30:00Z',
    legs: [
      soccer('BRI', '3-Way Regulation', COV_BRI, '+120', 'pending', {
        eventHref: '/sports/soccer/event/cov-bri',
        group: COV_BRI,
      }),
      soccer('Yes', 'Both Teams to Score', COV_BRI, '-150', 'won', {
        eventHref: '/sports/soccer/event/cov-bri',
        group: COV_BRI,
      }),
      nfl('Baltimore Ravens', 'Moneyline', BAL_CIN, '-185', 'pending', {
        eventHref: '/sports/football/event/bal-cin',
        when: 'Mon 23 Nov, 8:15 PM',
      }),
    ],
  },
  {
    id: '48188422',
    type: 'straight',
    odds: '-110',
    stake: 100,
    toWin: 190.91,
    status: 'won',
    placedAt: '2026-11-16T15:11:00Z',
    settledAt: '2026-11-16T21:24:00Z',
    payout: 190.91,
    legs: [nfl('Lions -3.5', 'Spread', 'Detroit Lions @ Chicago Bears', '-110', 'won')],
  },
  {
    id: '48186005',
    type: 'parlay',
    odds: '+264',
    stake: 20,
    toWin: 72.8,
    status: 'won',
    placedAt: '2026-11-16T14:02:00Z',
    settledAt: '2026-11-17T04:40:00Z',
    payout: 72.8,
    legs: [
      nfl('Ravens -3', 'Spread', 'Baltimore Ravens @ Pittsburgh Steelers', '-110', 'won'),
      nfl('Green Bay Packers', 'Moneyline', 'Green Bay Packers @ Minnesota Vikings', '-105', 'won'),
    ],
  },
  {
    id: '48185570',
    type: 'straight',
    odds: '-145',
    stake: 29,
    toWin: 49,
    status: 'won',
    placedAt: '2026-11-16T13:55:00Z',
    settledAt: '2026-11-16T21:20:00Z',
    payout: 49,
    legs: [
      nfl('Josh Allen Over 1.5', 'Passing Touchdowns', 'Buffalo Bills @ Miami Dolphins', '-145', 'won'),
    ],
  },
  {
    id: '48184402',
    type: 'straight',
    odds: '-110',
    stake: 30,
    toWin: 57.27,
    status: 'push',
    placedAt: '2026-11-16T13:40:00Z',
    settledAt: '2026-11-17T00:31:00Z',
    payout: 30,
    legs: [nfl('Under 47', 'Total', 'Los Angeles Rams @ Seattle Seahawks', '-110', 'push')],
  },
  {
    id: '48183119',
    type: 'straight',
    odds: '+110',
    stake: 20,
    toWin: 42,
    status: 'void',
    placedAt: '2026-11-16T12:05:00Z',
    settledAt: '2026-11-16T18:10:00Z',
    payout: 20,
    legs: [
      nfl(
        'Christian McCaffrey Anytime TD',
        'Touchdown Scorer',
        'San Francisco 49ers @ Arizona Cardinals',
        '+110',
        'void',
      ),
    ],
  },
  {
    id: '48160733',
    type: 'sgp',
    odds: '+380',
    stake: 15,
    toWin: 72,
    status: 'won',
    placedAt: '2026-11-15T11:20:00Z',
    settledAt: '2026-11-15T14:58:00Z',
    payout: 72,
    legs: [
      soccer('ARS', '3-Way Regulation', 'Arsenal vs Tottenham Hotspur', '-140', 'won'),
      soccer('Bukayo Saka Anytime', 'Goalscorers', 'Arsenal vs Tottenham Hotspur', '+150', 'won'),
      soccer('O 2.5', 'Total', 'Arsenal vs Tottenham Hotspur', '-125', 'won'),
    ],
  },
  {
    id: '48142276',
    type: 'parlay',
    odds: '+811',
    stake: 25,
    toWin: 227.75,
    status: 'lost',
    placedAt: '2026-11-09T16:30:00Z',
    settledAt: '2026-11-10T04:15:00Z',
    legs: [
      nfl('Buffalo Bills', 'Moneyline', 'Buffalo Bills @ Indianapolis Colts', '-200', 'won'),
      nfl('Chiefs -3', 'Spread', 'Kansas City Chiefs @ Denver Broncos', '-110', 'lost'),
      nfl('Over 44.5', 'Total', 'Washington Commanders @ Detroit Lions', '-110', 'won'),
      nfl('Philadelphia Eagles', 'Moneyline', 'Philadelphia Eagles @ Green Bay Packers', '-150', 'won'),
    ],
  },
  {
    id: '48139981',
    type: 'sgp',
    odds: '+260',
    stake: 10,
    toWin: 36,
    status: 'lost',
    placedAt: '2026-11-09T15:48:00Z',
    settledAt: '2026-11-09T21:12:00Z',
    legs: [
      nfl('Dallas Cowboys', 'Moneyline', 'Dallas Cowboys @ New York Giants', '-160', 'won'),
      nfl('CeeDee Lamb Over 79.5', 'Receiving Yards', 'Dallas Cowboys @ New York Giants', '-115', 'lost'),
    ],
  },
  {
    id: '48120554',
    type: 'straight',
    odds: '+140',
    stake: 40,
    toWin: 96,
    status: 'lost',
    placedAt: '2026-11-08T12:00:00Z',
    settledAt: '2026-11-08T18:51:00Z',
    legs: [soccer('LIV', '3-Way Regulation', 'Manchester City vs Liverpool', '+140', 'lost')],
  },
  {
    id: '48118830',
    type: 'straight',
    odds: '+120',
    stake: 25,
    toWin: 55,
    status: 'won',
    placedAt: '2026-11-08T10:15:00Z',
    settledAt: '2026-11-08T17:02:00Z',
    payout: 55,
    legs: [soccer('-1', 'Spread', 'Real Madrid vs Valencia', '+120', 'won')],
  },
]

let placed: SportsBet[] = []
let snapshot: SportsBet[] = SEED
let hydrated = false
const listeners = new Set<() => void>()

function rebuild() {
  snapshot = [...placed, ...SEED].sort((a, b) => b.placedAt.localeCompare(a.placedAt))
}

function hydrate() {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as SportsBet[]) : null
    if (Array.isArray(parsed)) placed = parsed
  } catch {
    placed = []
  }
  rebuild()
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function getSnapshot() {
  hydrate()
  return snapshot
}

export function useSportsBets(): SportsBet[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => SEED)
}

export function addSportsBets(bets: SportsBet[]) {
  hydrate()
  placed = [...bets, ...placed]
  rebuild()
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(placed))
  } catch {
    /* private mode — keep in memory */
  }
  listeners.forEach((fn) => fn())
}

export function newBetId(): string {
  return String(48_300_000 + Math.floor(Math.random() * 600_000))
}
