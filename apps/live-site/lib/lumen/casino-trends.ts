import {
  ORIGINALS_GAMES,
  type CasinoLobbyGame,
} from '@/lib/lumen/casino-lobby-catalog'

export type TrendsPeriod = 'today' | 'week' | 'month'
export type TrendsScope = 'overall' | 'mine'
export type TrendsMetric = 'rate' | 'spins' | 'share'
export type TrendsRangeMins = 60 | 180 | 360

export const TRENDS_PERIODS: { id: TrendsPeriod; label: string; short: string }[] = [
  { id: 'today', label: 'Today', short: 'today' },
  { id: 'week', label: 'This week', short: 'this week' },
  { id: 'month', label: 'This month', short: 'this month' },
]

export const TRENDS_METRICS: {
  id: TrendsMetric
  label: string
  short: string
  note: string
}[] = [
  {
    id: 'rate',
    label: 'Win rate',
    short: 'Win rate',
    note: 'Share of spins that paid out, rolling 30 min',
  },
  {
    id: 'spins',
    label: 'Spins / min',
    short: 'Spins/min',
    note: 'Spins per minute, rolling 5 min',
  },
  {
    id: 'share',
    label: 'Share of play',
    short: 'Share',
    note: "Each game's share of top-5 spins, rolling 30 min",
  },
]

export const TRENDS_RANGES: { mins: TrendsRangeMins; label: string }[] = [
  { mins: 60, label: '1h' },
  { mins: 180, label: '3h' },
  { mins: 360, label: '6h' },
]

/** Chart series colors — Lumen `--chart-*` tokens. */
export const TRENDS_CHART_VARS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
] as const

export type TrendsRankRow = {
  game: CasinoLobbyGame
  plays: number
  /** Percent change vs prior period; positive = up. */
  trend: number
  /** Illustrative win rate for live markets seed. */
  hitRate: number
}

export type MyTrendsShelf = {
  id: 'win' | 'lose' | 'play'
  title: string
  subtitle: string
  rows: {
    game: CasinoLobbyGame
    /** Primary stat shown under the tile. */
    stat: string
    /** Secondary muted line. */
    detail: string
    trend: number
  }[]
}

const PERIOD_MULT: Record<TrendsPeriod, number> = {
  today: 1,
  week: 6.4,
  month: 28,
}

/** Stable pseudo-random from string — same ranks across reloads. */
function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967296
}

function pickPool(): CasinoLobbyGame[] {
  return ORIGINALS_GAMES.slice(0, 16)
}

/** Overall Popular-style ranking for a period (illustrative). Top 10 only. */
export function overallRanking(period: TrendsPeriod): TrendsRankRow[] {
  const mult = PERIOD_MULT[period]
  return pickPool()
    .map((game) => {
      const h = hash(`${game.id}:${period}`)
      const base = 40_000 + Math.floor(h * 220_000)
      const plays = Math.round(base * mult * (0.55 + hash(`${game.id}:w`) * 0.9))
      const trendRaw = (hash(`${game.id}:${period}:t`) - 0.42) * 48
      const trend = Math.round(trendRaw * 10) / 10
      const hitRate = 0.22 + hash(`${game.id}:hit`) * 0.28
      return { game, plays, trend, hitRate }
    })
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 10)
}

export function formatPlays(n: number, compact = false) {
  if (compact) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`
  }
  return n.toLocaleString('en-US')
}

export function formatTrend(trend: number) {
  if (trend === 0) return '—'
  const abs = Math.abs(trend)
  const label = Number.isInteger(abs) ? String(abs) : abs.toFixed(1)
  return trend > 0 ? `▲ ${label}%` : `▼ ${label}%`
}

/** Personal shelves — win most / lose most / play most (demo seed). */
export function myTrendsShelves(period: TrendsPeriod): MyTrendsShelf[] {
  const ranked = overallRanking(period)
  const byHash = (salt: string) =>
    [...ranked].sort(
      (a, b) => hash(`${b.game.id}:${salt}`) - hash(`${a.game.id}:${salt}`),
    )

  const win = byHash(`win:${period}`).slice(0, 6)
  const lose = byHash(`lose:${period}`).slice(0, 6)
  const play = byHash(`play:${period}`).slice(0, 8)

  const periodLabel = TRENDS_PERIODS.find((p) => p.id === period)?.short ?? 'today'

  return [
    {
      id: 'win',
      title: 'Games I win most',
      subtitle: `Highest payout rate ${periodLabel}`,
      rows: win.map((r) => {
        const rate = 48 + Math.floor(hash(`${r.game.id}:wr`) * 28)
        const net = 40 + Math.floor(hash(`${r.game.id}:net`) * 420)
        return {
          game: r.game,
          stat: `${rate}% win rate`,
          detail: `+$${net.toLocaleString('en-US')} net`,
          trend: Math.abs(r.trend) || 4,
        }
      }),
    },
    {
      id: 'lose',
      title: 'Games I lose most',
      subtitle: `Biggest drawdowns ${periodLabel}`,
      rows: lose.map((r) => {
        const rate = 12 + Math.floor(hash(`${r.game.id}:lr`) * 26)
        const net = 180 + Math.floor(hash(`${r.game.id}:ln`) * 2_400)
        return {
          game: r.game,
          stat: `${rate}% win rate`,
          detail: `−$${net.toLocaleString('en-US')} net`,
          trend: -(Math.abs(r.trend) || 6),
        }
      }),
    },
    {
      id: 'play',
      title: 'Games I play most',
      subtitle: `Your rounds ${periodLabel}`,
      rows: play.map((r) => {
        const rounds = Math.max(
          12,
          Math.round((r.plays / PERIOD_MULT[period]) * (0.002 + hash(`${r.game.id}:me`) * 0.008)),
        )
        const hours = (rounds * (0.4 + hash(`${r.game.id}:hrs`) * 1.2)).toFixed(1)
        return {
          game: r.game,
          stat: `${rounds.toLocaleString('en-US')} rounds`,
          detail: `${hours}h at the table`,
          trend: r.trend,
        }
      }),
    },
  ]
}

export type MarketBucket = { spins: number; wins: number }

export type MarketGameSeries = {
  game: CasinoLobbyGame
  rank: number
  hitBase: number
  buckets: MarketBucket[]
  colorVar: string
}

const WINDOW = 360

/** Build illustrative per-minute history for the top N overall games. */
export function seedMarketSeries(
  period: TrendsPeriod,
  topN = 5,
): MarketGameSeries[] {
  const top = overallRanking(period).slice(0, topN)
  return top.map((row, i) => {
    const buckets: MarketBucket[] = []
    let hit = row.hitRate
    const rate = row.plays / (PERIOD_MULT[period] * 1440)
    for (let m = 0; m < WINDOW; m++) {
      const hour = (m / 60) % 24
      const diurnal = 0.72 + 0.38 * Math.cos(((hour - 21) / 24) * Math.PI * 2)
      hit += (row.hitRate - hit) * 0.04 + (hash(`${row.game.id}:${m}:g`) - 0.5) * 0.012
      const spins = Math.max(
        0,
        Math.round(rate * diurnal * (0.7 + hash(`${row.game.id}:${m}:s`) * 0.8)),
      )
      const wins = Math.min(
        spins,
        Math.round(spins * Math.max(0.08, Math.min(0.72, hit))),
      )
      buckets.push({ spins, wins })
    }
    return {
      game: row.game,
      rank: i + 1,
      hitBase: row.hitRate,
      buckets,
      colorVar: TRENDS_CHART_VARS[i % TRENDS_CHART_VARS.length]!,
    }
  })
}

function sumBuckets(buckets: MarketBucket[], from: number, to: number) {
  let spins = 0
  let wins = 0
  for (let i = from; i <= to; i++) {
    const b = buckets[i]
    if (!b) continue
    spins += b.spins
    wins += b.wins
  }
  return { spins, wins }
}

export function metricAt(
  series: MarketGameSeries[],
  gameIndex: number,
  bucketIndex: number,
  metric: TrendsMetric,
  rollMins: number,
) {
  const gm = series[gameIndex]
  if (!gm) return 0
  const from = Math.max(0, bucketIndex - rollMins + 1)
  const { spins, wins } = sumBuckets(gm.buckets, from, bucketIndex)
  if (metric === 'rate') return spins ? (wins / spins) * 100 : gm.hitBase * 100
  if (metric === 'spins') {
    const len = bucketIndex - from + 1
    return len ? spins / len : 0
  }
  const tot = series.reduce((s, g) => {
    const t = sumBuckets(g.buckets, from, bucketIndex)
    return s + t.spins
  }, 0)
  return tot ? (spins / tot) * 100 : 20
}

export function formatMetric(metric: TrendsMetric, v: number) {
  if (metric === 'spins') return v.toFixed(1)
  return `${v.toFixed(1)}%`
}

export function formatMetricDelta(metric: TrendsMetric, d: number) {
  const abs = Math.abs(d)
  const body =
    metric === 'spins' ? abs.toFixed(1) : `${abs.toFixed(1)} pts`
  return d >= 0 ? `▲ ${body}` : `▼ ${body}`
}

/** Advance the live series by one soft tick (mutates a copy). */
export function tickMarketSeries(series: MarketGameSeries[]): MarketGameSeries[] {
  return series.map((gm) => {
    const last = gm.buckets[gm.buckets.length - 1]
    if (!last) return gm
    const bumpSpins = hash(`${gm.game.id}:${Date.now()}:tick`) > 0.55 ? 1 : 0
    const bumpWins =
      bumpSpins && hash(`${gm.game.id}:${Date.now()}:win`) < gm.hitBase ? 1 : 0
    const nextBuckets = gm.buckets.slice()
    nextBuckets[nextBuckets.length - 1] = {
      spins: last.spins + bumpSpins,
      wins: last.wins + bumpWins,
    }
    return { ...gm, buckets: nextBuckets }
  })
}
