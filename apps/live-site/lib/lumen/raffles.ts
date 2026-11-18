/** V2 Promotions · Weekly Raffle — free ticket + 1 ticket per $500 wagered (demo seed). */

export const RAFFLE = {
  name: 'Weekly Raffle',
  poolUsd: 20_000,
  drawNumber: 102,
  winnersPerDraw: 50,
  prizePerWinnerUsd: 400,
  wagerPerTicketUsd: 500,
  /** Seconds until the draw (demo clock). */
  drawsInSeconds: 3 * 86_400 + 15 * 3600 + 32 * 60 + 46,
  /** Demo: wagered toward the next ticket this week. */
  wageredTowardNextUsd: 320,
  /** Ticket slots shown in “Your Tickets” before it scrolls. */
  ticketSlots: 10,
} as const

export const RAFFLE_STEPS = [
  { id: 'free', title: 'Free entry ticket', body: 'Every player gets 1 free ticket each draw.' },
  { id: 'earn', title: 'Earn tickets as you play', body: '1 extra ticket for every $500 wagered.' },
  { id: 'draw', title: 'Weekly draw', body: '50 tickets drawn every Monday. $400 each.' },
] as const

export type RaffleWinner = { ticket: string; player: string | null; prizeUsd: number }

export type RaffleDraw = { number: number; date: string; winners: RaffleWinner[] }

const NAMES = [
  'Jims',
  null,
  'acehigh22',
  'spinqueen',
  null,
  'riverboat',
  'nx_edge',
  null,
  'colddeck',
  'lucky_lane',
]

function winners(seed: number): RaffleWinner[] {
  return Array.from({ length: 10 }, (_, i) => ({
    ticket: `#${String(((seed * 7919 + i * 104_729) % 900_000) + 100_000)}`,
    player: NAMES[(i + seed) % NAMES.length] ?? null,
    prizeUsd: RAFFLE.prizePerWinnerUsd,
  }))
}

/** Most recent first. */
export const RAFFLE_DRAWS: RaffleDraw[] = [
  { number: 101, date: 'Nov 16, 2026', winners: winners(101) },
  { number: 100, date: 'Nov 9, 2026', winners: winners(100) },
  { number: 99, date: 'Nov 2, 2026', winners: winners(99) },
]

export function ticketNumber(index: number) {
  return `#${String(482_031 + index * 37)}`
}
