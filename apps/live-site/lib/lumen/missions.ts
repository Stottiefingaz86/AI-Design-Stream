/** VIP Hub — Missions. Casino + sports objectives → claimable rewards. */

export type MissionStatus = 'active' | 'claimable' | 'claimed'
export type MissionCategory = 'casino' | 'sports'

export type Mission = {
  id: string
  category: MissionCategory
  title: string
  body: string
  finePrint: string
  imageSrc: string
  imageAlt: string
  objective: string
  current: number
  target: number
  unit: 'usd' | 'spins' | 'bets' | 'wins'
  rewardLabel: string
  /** Cash credited on claim (0 for spins / free-bet demos that still toast). */
  rewardAmount: number
  status: MissionStatus
}

export const MISSIONS: Mission[] = [
  {
    id: 'chicken-100-spins',
    category: 'casino',
    title: 'Chicken Spin Mission',
    body: 'Play 100 spins on Chicken. Unlock a $10 cash reward.',
    finePrint: '*$0.20+ stake. Settled rounds only.',
    imageSrc: '/games/originals/chicken.png',
    imageAlt: 'Chicken',
    objective: 'Complete 100 spins on Chicken',
    current: 37,
    target: 100,
    unit: 'spins',
    rewardLabel: 'Claim $10',
    rewardAmount: 10,
    status: 'active',
  },
  {
    id: 'deposit-play-plinko',
    category: 'casino',
    title: 'Deposit & Play Plinko',
    body: 'Deposit $50+, then wager $25 on Plinko for a $15 bonus.',
    finePrint: '*One deposit. Plinko settles before counting.',
    imageSrc: '/games/originals/plinko.png',
    imageAlt: 'Plinko',
    objective: 'Wager $25 on Plinko after deposit',
    current: 0,
    target: 25,
    unit: 'usd',
    rewardLabel: 'Claim $15',
    rewardAmount: 15,
    status: 'active',
  },
  {
    id: 'mines-win-streak',
    category: 'casino',
    title: 'Win $100 on Mines',
    body: 'Win $100 total on Mines this week for a $25 cash prize.',
    finePrint: '*Net Mines wins. Resets Monday 00:00 ET.',
    imageSrc: '/games/originals/mines.png',
    imageAlt: 'Mines',
    objective: 'Win $100 on Mines',
    current: 100,
    target: 100,
    unit: 'usd',
    rewardLabel: 'Claim $25',
    rewardAmount: 25,
    status: 'claimable',
  },
  {
    id: 'crash-50-rounds',
    category: 'casino',
    title: 'Crash Round Runner',
    body: 'Play 50 Crash rounds at $1+ for 25 free spins on Chicken.',
    finePrint: '*$1 min stake. Cash-out and bust both count.',
    imageSrc: '/games/originals/crash.png',
    imageAlt: 'Crash',
    objective: 'Play 50 rounds on Crash',
    current: 12,
    target: 50,
    unit: 'spins',
    rewardLabel: 'Claim 25 spins',
    rewardAmount: 0,
    status: 'active',
  },
  {
    id: 'nfl-parlay-mission',
    category: 'sports',
    title: 'NFL Parlay Push',
    body: 'Place $50 in qualifying NFL parlays (3+ legs) to unlock a $20 free bet.',
    finePrint: '*Min 3 legs, +100 odds. Graded wagers only.',
    imageSrc: '/banners/homepage_trending/football.jpg',
    imageAlt: 'NFL',
    objective: 'Wager $50 on NFL parlays',
    current: 20,
    target: 50,
    unit: 'usd',
    rewardLabel: 'Claim $20 free bet',
    rewardAmount: 20,
    status: 'active',
  },
  {
    id: 'nba-same-game',
    category: 'sports',
    title: 'NBA Same-Game Special',
    body: 'Settle 5 NBA same-game parlays this week. Hit it for a $15 cash boost.',
    finePrint: '*SGP only. Voids don’t count.',
    imageSrc: '/banners/homepage_trending/basketball.jpg',
    imageAlt: 'NBA',
    objective: 'Settle 5 NBA same-game parlays',
    current: 5,
    target: 5,
    unit: 'bets',
    rewardLabel: 'Claim $15',
    rewardAmount: 15,
    status: 'claimable',
  },
  {
    id: 'soccer-accumulator',
    category: 'sports',
    title: 'Soccer Accumulator',
    body: 'Wager $75 across Champions League or EPL accumulators for a $25 free bet.',
    finePrint: '*4+ legs, -200 max per selection.',
    imageSrc: '/banners/homepage_trending/soccer.jpg',
    imageAlt: 'Soccer',
    objective: 'Wager $75 on soccer accas',
    current: 40,
    target: 75,
    unit: 'usd',
    rewardLabel: 'Claim $25 free bet',
    rewardAmount: 25,
    status: 'active',
  },
  {
    id: 'mlb-live-bet',
    category: 'sports',
    title: 'MLB Live Streak',
    body: 'Place 10 live MLB wagers at $10+ stake. Unlock a $10 cash drop.',
    finePrint: '*In-play only. Settled bets count.',
    imageSrc: '/banners/homepage_trending/baseball.jpg',
    imageAlt: 'MLB',
    objective: 'Place 10 live MLB bets',
    current: 3,
    target: 10,
    unit: 'bets',
    rewardLabel: 'Claim $10',
    rewardAmount: 10,
    status: 'active',
  },
]

export function formatMissionProgress(mission: Mission) {
  const cur = mission.current
  const tgt = mission.target
  if (mission.unit === 'usd') {
    return { current: `$${cur}`, target: `$${tgt}` }
  }
  return { current: String(cur), target: String(tgt) }
}

export function missionProgressPct(mission: Mission) {
  if (mission.target <= 0) return 0
  return Math.min(100, Math.round((mission.current / mission.target) * 100))
}
