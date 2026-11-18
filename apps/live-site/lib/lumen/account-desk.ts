import {
  ORIGINALS_GAMES,
  type CasinoLobbyGame,
} from '@/lib/lumen/casino-lobby-catalog'
import {
  TRENDS_PERIODS,
  type TrendsPeriod,
} from '@/lib/lumen/casino-trends'
import type { VipLevel } from '@/lib/lumen/my-account'

export type DeskPeriod = TrendsPeriod

export const DESK_PERIODS = TRENDS_PERIODS

const PERIOD_MULT: Record<DeskPeriod, number> = {
  today: 1,
  week: 6.4,
  month: 28,
}

/** Stable pseudo-random — same desk figures across reloads. */
function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967296
}

export type DeskPnL = {
  net: number
  winRate: number
  volume: number
  sessions: number
  /** Cumulative net series for the step chart (oldest → newest). */
  series: number[]
}

/** Illustrative trading-desk P&L for the selected period. */
export function deskPnL(period: DeskPeriod): DeskPnL {
  const mult = PERIOD_MULT[period]
  const sign = hash(`desk:pnl:sign:${period}`) > 0.38 ? 1 : -1
  const mag = 180 + hash(`desk:pnl:mag:${period}`) * 2_400 * mult
  const net = Math.round(sign * mag * 100) / 100
  const winRate = Math.round((42 + hash(`desk:wr:${period}`) * 28) * 10) / 10
  const volume = Math.round((1_200 + hash(`desk:vol:${period}`) * 18_000) * mult)
  const sessions = Math.max(
    1,
    Math.round((3 + hash(`desk:sess:${period}`) * 14) * (period === 'today' ? 1 : mult * 0.35)),
  )

  const points = period === 'today' ? 24 : period === 'week' ? 28 : 30
  const series: number[] = []
  let cum = 0
  const step = net / points
  for (let i = 0; i < points; i++) {
    const noise = (hash(`desk:s:${period}:${i}`) - 0.48) * Math.abs(step) * 2.4
    cum += step + noise
    series.push(Math.round(cum * 100) / 100)
  }
  /* Snap last point to reported net so the chart matches the headline. */
  series[series.length - 1] = net
  return { net, winRate, volume, sessions, series }
}

export type DeskBiggestWin = {
  id: string
  game: CasinoLobbyGame
  payout: number
  multi: number
  /** Relative time label, e.g. "12m ago". */
  when: string
}

const WHEN_POOL = [
  '4m ago',
  '12m ago',
  '38m ago',
  '1h ago',
  '2h ago',
  '5h ago',
  'Yesterday',
  '2d ago',
] as const

/** Biggest wins list for the desk (demo seed). */
export function deskBiggestWins(period: DeskPeriod, limit = 6): DeskBiggestWin[] {
  const pool = ORIGINALS_GAMES.slice(0, 14)
  const mult = PERIOD_MULT[period]
  return [...pool]
    .sort(
      (a, b) =>
        hash(`${b.id}:bw:${period}`) - hash(`${a.id}:bw:${period}`),
    )
    .slice(0, limit)
    .map((game, i) => {
      const payout = Math.round(
        (80 + hash(`${game.id}:pay:${period}`) * 4_200 * Math.sqrt(mult)) * 100,
      ) / 100
      const multi =
        Math.round((1.4 + hash(`${game.id}:mx:${period}`) * 48) * 10) / 10
      return {
        id: `${period}-win-${game.id}`,
        game,
        payout,
        multi,
        when: WHEN_POOL[i % WHEN_POOL.length]!,
      }
    })
    .sort((a, b) => b.payout - a.payout)
}

/** Biggest losses — realistic drawdowns next to the wins card. */
export function deskBiggestLosses(period: DeskPeriod, limit = 6): DeskBiggestWin[] {
  const pool = ORIGINALS_GAMES.slice(0, 14)
  const mult = PERIOD_MULT[period]
  return [...pool]
    .sort(
      (a, b) =>
        hash(`${b.id}:bl:${period}`) - hash(`${a.id}:bl:${period}`),
    )
    .slice(0, limit)
    .map((game, i) => {
      const payout = Math.round(
        -(120 + hash(`${game.id}:loss:${period}`) * 3_800 * Math.sqrt(mult)) * 100,
      ) / 100
      const multi =
        Math.round((0.2 + hash(`${game.id}:lmx:${period}`) * 0.7) * 10) / 10
      return {
        id: `${period}-loss-${game.id}`,
        game,
        payout,
        multi,
        when: WHEN_POOL[(i + 3) % WHEN_POOL.length]!,
      }
    })
    .sort((a, b) => a.payout - b.payout)
}


export type DeskTopPerformer = {
  id: string
  rank: number
  /** Nickname — never email. */
  player: string
  net: number
  /** VIP tier crown next to the handle. */
  vipLevel: VipLevel
  isYou?: boolean
}

const VIP_LEVELS: VipLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']

function deskVipLevel(seed: string): VipLevel {
  const i = Math.floor(hash(`desk:vip:${seed}`) * VIP_LEVELS.length) % VIP_LEVELS.length
  return VIP_LEVELS[i]!
}

const TOP_HANDLE_POOL = [
  'acehigh22',
  'Jims',
  'Moh81',
  'klmills96',
  'spinqueen',
  'riverboat',
  'nx_edge',
  'colddeck',
  'parlaypete',
  'lucky_lane',
  'betbot_x',
  'vaultking',
  'edgefinder',
  'nightowl99',
] as const

/**
 * Top 10 net performers for the period + you (nickname).
 * You appear in the board when ranked ≤10; otherwise sticky “you” is separate.
 */
export function deskTopPerformers(
  period: DeskPeriod,
  youNet: number,
  youNickname: string,
  youVipLevel: VipLevel = 'Gold',
): { board: DeskTopPerformer[]; you: DeskTopPerformer; youInTop10: boolean } {
  const mult = PERIOD_MULT[period]
  const peers: Omit<DeskTopPerformer, 'rank'>[] = TOP_HANDLE_POOL.slice(0, 10).map(
    (handle, i) => {
      const mag =
        420 + hash(`desk:top:${period}:${handle}`) * 3_800 * Math.sqrt(mult)
      const net =
        Math.round((mag + (9 - i) * 90 * Math.sqrt(mult)) * 100) / 100
      return {
        id: `${period}-top-${handle}`,
        player: handle,
        net,
        vipLevel: deskVipLevel(`${period}:${handle}`),
      }
    },
  )

  const youBase: Omit<DeskTopPerformer, 'rank'> = {
    id: `${period}-you`,
    player: youNickname.trim() || 'You',
    net: youNet,
    vipLevel: youVipLevel,
    isYou: true,
  }

  const ranked = [...peers, youBase]
    .sort((a, b) => b.net - a.net)
    .map((row, i) => ({ ...row, rank: i + 1 }))

  const you = ranked.find((r) => r.isYou)!
  const youInTop10 = you.rank <= 10

  if (youInTop10) {
    return { board: ranked.slice(0, 10), you, youInTop10: true }
  }

  const board = ranked
    .filter((r) => !r.isYou)
    .slice(0, 10)
    .map((row, i) => ({ ...row, rank: i + 1 }))

  return { board, you, youInTop10: false }
}


export type DeskPlayerSportBet = {
  id: string
  sport: string
  /** Matchup / event — e.g. "Lakers vs Celtics". */
  event: string
  /** What they bet — e.g. "Lakers −3.5" or "Over 224.5". */
  selection: string
  /** Market family — Moneyline, Spread, Total, … */
  market: string
  stake: number
  toWin: number
  status: 'Won' | 'Lost' | 'Pending'
}

export type DeskPlayerCasinoPlay = {
  game: CasinoLobbyGame
  spins: number
  net: number
}

export type DeskPlayerSportMix = {
  sport: string
  pct: number
}

export type DeskPlayerDossier = {
  player: string
  vipLevel: VipLevel
  net: number
  rank: number
  isYou?: boolean
  sportsMix: DeskPlayerSportMix[]
  recentBets: DeskPlayerSportBet[]
  casinoGames: DeskPlayerCasinoPlay[]
}

const SPORT_POOL = [
  'Soccer',
  'NFL',
  'NBA',
  'MLB',
  'NHL',
  'Tennis',
  'UFC',
  'NCAAB',
] as const

const EVENTS_BY_SPORT: Record<(typeof SPORT_POOL)[number], readonly string[]> = {
  Soccer: [
    'Man City vs Arsenal',
    'Real Madrid vs Barcelona',
    'Liverpool vs Chelsea',
    'Inter vs AC Milan',
    'Bayern vs Dortmund',
  ],
  NFL: [
    'Chiefs vs Bills',
    'Eagles vs Cowboys',
    '49ers vs Lions',
    'Ravens vs Bengals',
    'Packers vs Bears',
  ],
  NBA: [
    'Lakers vs Celtics',
    'Nuggets vs Timberwolves',
    'Suns vs Mavericks',
    'Knicks vs Heat',
    'Warriors vs Clippers',
  ],
  MLB: [
    'Yankees vs Red Sox',
    'Dodgers vs Padres',
    'Braves vs Phillies',
    'Astros vs Rangers',
    'Cubs vs Cardinals',
  ],
  NHL: [
    'Oilers vs Panthers',
    'Rangers vs Devils',
    'Maple Leafs vs Canadiens',
    'Avalanche vs Stars',
    'Golden Knights vs Kings',
  ],
  Tennis: [
    'Alcaraz vs Sinner',
    'Djokovic vs Medvedev',
    'Swiatek vs Gauff',
    'Zverev vs Rublev',
  ],
  UFC: [
    'Jones vs Miocic',
    'Adesanya vs Du Plessis',
    'Volkanovski vs Topuria',
    "O'Malley vs Yan",
  ],
  NCAAB: [
    'Duke vs UNC',
    'UConn vs Purdue',
    'Kansas vs Houston',
    'Gonzaga vs Arizona',
    'Auburn vs Kentucky',
  ],
}

type DeskMarketKind = 'Moneyline' | 'Spread' | 'Total' | 'Team total' | 'Player prop'

function pickEvent(sport: (typeof SPORT_POOL)[number], seed: string, i: number) {
  const pool = EVENTS_BY_SPORT[sport]
  return pool[Math.floor(hash(`ev:${seed}:${i}`) * pool.length) % pool.length]!
}

function pickSelection(
  sport: (typeof SPORT_POOL)[number],
  event: string,
  seed: string,
  i: number,
): { market: DeskMarketKind; selection: string } {
  const [home, away] = event.split(' vs ').map((s) => s.trim())
  const homeSide = home || 'Home'
  const awaySide = away || 'Away'
  const kindRoll = hash(`mk:${seed}:${i}`)
  if (kindRoll < 0.28) {
    const side = hash(`ml:${seed}:${i}`) > 0.5 ? homeSide : awaySide
    return { market: 'Moneyline', selection: `${side} ML` }
  }
  if (kindRoll < 0.55) {
    const pts = (2.5 + Math.floor(hash(`sp:${seed}:${i}`) * 10) * 0.5).toFixed(1)
    const side = hash(`sps:${seed}:${i}`) > 0.5 ? homeSide : awaySide
    const fav = hash(`spf:${seed}:${i}`) > 0.5
    return {
      market: 'Spread',
      selection: fav ? `${side} −${pts}` : `${side} +${pts}`,
    }
  }
  if (kindRoll < 0.78) {
    const base =
      sport === 'NBA' || sport === 'NCAAB'
        ? 210
        : sport === 'NFL'
          ? 44
          : sport === 'MLB'
            ? 8
            : sport === 'NHL'
              ? 5.5
              : 2.5
    const total =
      Math.round((base + hash(`tot:${seed}:${i}`) * (sport === 'NBA' || sport === 'NCAAB' ? 30 : 8)) * 2) /
      2
    const over = hash(`ov:${seed}:${i}`) > 0.5
    return {
      market: 'Total',
      selection: `${over ? 'Over' : 'Under'} ${total}`,
    }
  }
  if (kindRoll < 0.9) {
    const side = hash(`tt:${seed}:${i}`) > 0.5 ? homeSide : awaySide
    const line = (1.5 + Math.floor(hash(`ttl:${seed}:${i}`) * 4)).toFixed(1)
    return {
      market: 'Team total',
      selection: `${side} Over ${line}`,
    }
  }
  const player =
    sport === 'NBA' || sport === 'NCAAB'
      ? ['Points', 'Rebounds', 'Assists'][Math.floor(hash(`pp:${seed}:${i}`) * 3)]!
      : sport === 'NFL'
        ? ['Passing yds', 'Rushing yds', 'Receptions'][Math.floor(hash(`pp:${seed}:${i}`) * 3)]!
        : 'Winner'
  return { market: 'Player prop', selection: `${homeSide} — ${player}` }
}

/** Public dossier for a Top 10 handle — sports mix, recent bets, casino play. */
export function deskPlayerDossier(
  performer: DeskTopPerformer,
): DeskPlayerDossier {
  const seed = performer.player.toLowerCase()
  const mixCount = 3 + Math.floor(hash(`mix:${seed}`) * 3)
  const sports = [...SPORT_POOL]
    .sort((a, b) => hash(`sp:${seed}:${b}`) - hash(`sp:${seed}:${a}`))
    .slice(0, mixCount)
  let remain = 100
  const sportsMix: DeskPlayerSportMix[] = sports.map((sport, i) => {
    const last = i === sports.length - 1
    const pct = last
      ? remain
      : Math.max(
          8,
          Math.min(
            remain - 8 * (sports.length - i - 1),
            Math.round((12 + hash(`pct:${seed}:${sport}`) * 40) * 10) / 10,
          ),
        )
    remain = Math.round((remain - pct) * 10) / 10
    return { sport, pct }
  })

  const recentBets: DeskPlayerSportBet[] = Array.from({ length: 5 }, (_, i) => {
    const sport = sports[i % sports.length]! as (typeof SPORT_POOL)[number]
    const event = pickEvent(sport, seed, i)
    const { market, selection } = pickSelection(sport, event, seed, i)
    const stake =
      Math.round((25 + hash(`stk:${seed}:${i}`) * 420) * 100) / 100
    const multi = 1.4 + hash(`mx:${seed}:${i}`) * 4.2
    const toWin = Math.round(stake * multi * 100) / 100
    const roll = hash(`st:${seed}:${i}`)
    const status: DeskPlayerSportBet['status'] =
      roll > 0.62 ? 'Won' : roll > 0.22 ? 'Lost' : 'Pending'
    return {
      id: `${seed}-bet-${i}`,
      sport,
      event,
      selection,
      market,
      stake,
      toWin,
      status,
    }
  })

  const casinoGames: DeskPlayerCasinoPlay[] = [...ORIGINALS_GAMES]
    .sort((a, b) => hash(`cg:${seed}:${b.id}`) - hash(`cg:${seed}:${a.id}`))
    .slice(0, 5)
    .map((game, i) => {
      const spins = Math.round(12 + hash(`spn:${seed}:${game.id}`) * 180)
      const sign = hash(`cgs:${seed}:${game.id}`) > 0.42 ? 1 : -1
      const net =
        Math.round(
          sign * (40 + hash(`cgn:${seed}:${game.id}`) * 900) * (1 + i * 0.08) * 100,
        ) / 100
      return { game, spins, net }
    })

  return {
    player: performer.player,
    vipLevel: performer.vipLevel,
    net: performer.net,
    rank: performer.rank,
    isYou: performer.isYou,
    sportsMix,
    recentBets,
    casinoGames,
  }
}

export function formatDeskMoney(value: number, signed = false) {
  const abs = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  if (!signed) return `$${abs}`
  if (value > 0) return `+$${abs}`
  if (value < 0) return `−$${abs}`
  return `$${abs}`
}

export function formatDeskVolume(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`
  return `$${n.toLocaleString('en-US')}`
}
