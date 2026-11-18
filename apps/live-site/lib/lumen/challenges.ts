/** V2 Promotions · Challenges — first player to hit the target multiplier wins (demo seed). */

import { ORIGINALS_GAMES, type CasinoLobbyGame } from '@/lib/lumen/casino-lobby-catalog'

export type ChallengeStatus = 'active' | 'finished'

export type Challenge = {
  id: string
  game: CasinoLobbyGame
  /** Target multiplier, e.g. 2000 → 2,000x. */
  multiplier: number
  minBetUsd: number
  rewardUsd: number
  status: ChallengeStatus
  /** Finished only — null = privacy-hidden. */
  winner?: string | null
}

function game(id: string): CasinoLobbyGame {
  const found = ORIGINALS_GAMES.find((g) => g.id === id)
  if (!found) throw new Error(`Unknown originals game: ${id}`)
  return found
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'c-limbo',
    game: game('limbo'),
    multiplier: 2000,
    minBetUsd: 1,
    rewardUsd: 1000,
    status: 'active',
  },
  {
    id: 'c-crash',
    game: game('crash'),
    multiplier: 3000,
    minBetUsd: 0.5,
    rewardUsd: 500,
    status: 'active',
  },
  {
    id: 'c-plinko',
    game: game('plinko'),
    multiplier: 1000,
    minBetUsd: 2,
    rewardUsd: 1500,
    status: 'active',
  },
  {
    id: 'c-dice',
    game: game('dice'),
    multiplier: 5000,
    minBetUsd: 0.5,
    rewardUsd: 500,
    status: 'active',
  },
  {
    id: 'c-mines',
    game: game('mines'),
    multiplier: 2500,
    minBetUsd: 0.5,
    rewardUsd: 500,
    status: 'active',
  },
  {
    id: 'c-keno',
    game: game('keno'),
    multiplier: 2500,
    minBetUsd: 0.5,
    rewardUsd: 500,
    status: 'active',
  },
  {
    id: 'c-diamonds',
    game: game('diamonds'),
    multiplier: 1500,
    minBetUsd: 1,
    rewardUsd: 750,
    status: 'active',
  },
  {
    id: 'c-wheel',
    game: game('wheel'),
    multiplier: 500,
    minBetUsd: 1,
    rewardUsd: 250,
    status: 'active',
  },
  {
    id: 'c-hilo',
    game: game('hilo'),
    multiplier: 1000,
    minBetUsd: 0.5,
    rewardUsd: 500,
    status: 'active',
  },
  {
    id: 'c-tower',
    game: game('dragons-tower'),
    multiplier: 4000,
    minBetUsd: 1,
    rewardUsd: 2000,
    status: 'active',
  },
  {
    id: 'c-chicken',
    game: game('chicken'),
    multiplier: 3000,
    minBetUsd: 0.5,
    rewardUsd: 1000,
    status: 'active',
  },
  {
    id: 'c-trader',
    game: game('trader'),
    multiplier: 2000,
    minBetUsd: 1,
    rewardUsd: 1000,
    status: 'active',
  },
  {
    id: 'c-limbo-f',
    game: game('limbo'),
    multiplier: 1000,
    minBetUsd: 1,
    rewardUsd: 500,
    status: 'finished',
    winner: 'acehigh22',
  },
  {
    id: 'c-plinko-f',
    game: game('plinko'),
    multiplier: 500,
    minBetUsd: 0.5,
    rewardUsd: 250,
    status: 'finished',
    winner: null,
  },
  {
    id: 'c-dice-f',
    game: game('dice'),
    multiplier: 2000,
    minBetUsd: 1,
    rewardUsd: 1000,
    status: 'finished',
    winner: 'spinqueen',
  },
  {
    id: 'c-crash-f',
    game: game('crash'),
    multiplier: 1500,
    minBetUsd: 0.5,
    rewardUsd: 500,
    status: 'finished',
    winner: 'Jims',
  },
  {
    id: 'c-mines-f',
    game: game('mines'),
    multiplier: 1000,
    minBetUsd: 2,
    rewardUsd: 750,
    status: 'finished',
    winner: null,
  },
  {
    id: 'c-keno-f',
    game: game('keno'),
    multiplier: 3000,
    minBetUsd: 0.5,
    rewardUsd: 500,
    status: 'finished',
    winner: 'riverboat',
  },
]

export function formatMultiplier(x: number) {
  return `${x.toLocaleString('en-US')}x`
}

export function formatUsd(usd: number) {
  return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
