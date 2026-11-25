/**
 * V3 Markets — the same soccer + NFL prices, re-read as prediction markets.
 * Chance = vig-free implied probability. Price = what one $1 share costs (vig kept).
 */
import {
  NFL_FUTURES,
  NFL_GAME_SECTIONS,
  nflBoardColumns,
  nflEventHref,
  nflEventLabel,
} from '@/lib/lumen/nfl-sport'
import { soccerEventHref, soccerEventLabel } from '@/lib/lumen/soccer-event'
import {
  SOCCER_GAME_SECTIONS,
  SOCCER_OUTRIGHTS,
  americanToProb,
  type SoccerEvent,
  type SoccerLeagueSection,
  type SoccerOdds,
} from '@/lib/lumen/soccer-sport'
import type { BetLeg, SportsBet } from '@/lib/lumen/sports-bets-store'

export type MarketSport = 'soccer' | 'nfl'
/** Kalshi-style topic filter on the Markets shelf. */
export type MarketCategory = 'football' | 'soccer' | 'entertainment' | 'politics'
export type MarketKind = 'game' | 'line' | 'future'

export type MarketOutcome = {
  id: string
  /** Row copy — team name, "Draw", "Yes", "No". */
  label: string
  /** Button copy — "COV", "Draw", "Yes". */
  short: string
  /** Team mark for the badge (games + futures). */
  team?: string
  /** 0–100, sums to 100 across the market. */
  chance: number
  /** Cents per share, 1–99. */
  price: number
  /** 24h move in percentage points. */
  change: number
  /** Portfolio copy, e.g. "Over 3.5 goals". */
  position: string
}

export type SportsMarket = {
  id: string
  kind: MarketKind
  sport: MarketSport
  /** Shelf topic chip — football maps from NFL, etc. */
  category: MarketCategory
  eventId?: string
  title: string
  /** Bet-record market name. */
  market: string
  eventLabel: string
  href: string
  leagueName: string
  leagueIcon: string
  when: string
  live: boolean
  /** Same order as `outcomes` (draw skipped). */
  score?: [number, number]
  volume: number
  outcomes: MarketOutcome[]
  rules: string
}

// ─── Maths ────────────────────────────────────────────────────

function hash(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Deterministic 0–1 stream per key. */
function rng(seed: string): () => number {
  let s = hash(seed) || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 100000) / 100000
  }
}

function parseAmerican(odds: string): number {
  const n = Number.parseFloat(odds.replace(/^\+/, ''))
  return Number.isFinite(n) ? n : -110
}

export function impliedProb(odds: string): number {
  return americanToProb(parseAmerican(odds))
}

/** One $1 share at `price`¢ → American price for the bet record. */
export function priceToAmerican(price: number): string {
  const decimal = 100 / Math.min(99, Math.max(1, price))
  if (decimal >= 2) return `+${Math.round((decimal - 1) * 100)}`
  return `${Math.round(-100 / (decimal - 1))}`
}

/** Market Buy → normal sports betslip pick (American odds from the ¢ price). */
export function marketToSlipPick(
  market: SportsMarket,
  outcome: MarketOutcome,
): {
  id: string
  label: string
  odds: string
  eventLabel: string
  market: string
  eventId: string
  eventHref: string
  sport: MarketSport
  live: boolean
  outright: boolean
} {
  const line = market.kind === 'line'
  const label = line
    ? `${outcome.label} · ${market.title}`
    : outcome.label === 'Draw' || /^draw$/i.test(outcome.label)
      ? 'Draw'
      : /to win$/i.test(outcome.label)
        ? outcome.label
        : `${outcome.label} to win`
  return {
    id: outcome.id,
    label,
    odds: priceToAmerican(outcome.price),
    eventLabel: market.eventLabel,
    market: market.market,
    eventId: market.eventId ?? market.id,
    eventHref: market.href,
    sport: market.sport,
    live: !!market.live,
    outright:
      market.kind === 'future' ||
      market.category === 'entertainment' ||
      market.category === 'politics',
  }
}

const clampPrice = (p: number) => Math.min(99, Math.max(1, Math.round(p)))

type RawOutcome = Omit<MarketOutcome, 'chance' | 'price' | 'change'> & { odds: string }

function priced(marketId: string, raw: RawOutcome[]): MarketOutcome[] {
  const implied = raw.map((r) => impliedProb(r.odds))
  const sum = implied.reduce((a, b) => a + b, 0) || 1
  const r = rng(`${marketId}-move`)
  const chances = implied.map((p) => (p / sum) * 100)
  const moves = chances.map((c) => (r() - 0.45) * Math.min(9, Math.max(1.2, c * 0.18)))
  const mean = moves.reduce((a, b) => a + b, 0) / (moves.length || 1)
  return raw.map(({ odds: _odds, ...o }, i) => {
    const chance = chances[i]!
    const change = Math.round((moves[i]! - mean) * 10) / 10
    return {
      ...o,
      chance,
      price: clampPrice(implied[i]! * 100),
      change: Math.max(-chance + 0.5, change),
    }
  })
}

function volumeFor(id: string, live: boolean, kind: MarketKind): number {
  const r = rng(`${id}-vol`)
  const base = kind === 'future' ? 2_400_000 : kind === 'line' ? 90_000 : 420_000
  return Math.round(base * (0.35 + r() * 1.6) * (live ? 2.4 : 1))
}

// ─── Games ────────────────────────────────────────────────────

const SETTLE_SOCCER = 'Settles on the 90-minute result plus stoppage time. Extra time and penalties don’t count.'
const SETTLE_NFL = 'Settles on the final score, overtime included.'

function soccerGame(section: SoccerLeagueSection, event: SoccerEvent): SportsMarket {
  const ml = (event.desktopPicks ?? event.picks).slice(0, 3)
  const id = `mkt-${event.id}`
  return {
    id,
    kind: 'game',
    sport: 'soccer',
    category: 'soccer',
    eventId: event.id,
    title: `${event.home} vs ${event.away}`,
    market: '3-Way Regulation',
    eventLabel: soccerEventLabel(event),
    href: soccerEventHref(event.id),
    leagueName: section.name,
    leagueIcon: section.icon,
    when: event.when,
    live: !!event.live,
    score: event.live ? (event.score ?? [0, 0]) : undefined,
    volume: volumeFor(id, !!event.live, 'game'),
    rules: SETTLE_SOCCER,
    outcomes: priced(id, [
      {
        id: ml[0]!.id,
        label: event.home,
        short: event.homeAbbr,
        team: event.home,
        odds: ml[0]!.odds,
        position: `${event.home} to win`,
      },
      { id: ml[1]!.id, label: 'Draw', short: 'Draw', odds: ml[1]!.odds, position: 'Draw' },
      {
        id: ml[2]!.id,
        label: event.away,
        short: event.awayAbbr,
        team: event.away,
        odds: ml[2]!.odds,
        position: `${event.away} to win`,
      },
    ]),
  }
}

function nflGame(section: SoccerLeagueSection, event: SoccerEvent): SportsMarket | null {
  const ml = nflBoardColumns(event)[0]
  if (!ml) return null
  const [away, home] = ml.cells
  const id = `mkt-${event.id}`
  return {
    id,
    kind: 'game',
    sport: 'nfl',
    category: 'football',
    eventId: event.id,
    title: `${event.away} @ ${event.home}`,
    market: ml.slipMarket,
    eventLabel: nflEventLabel(event),
    href: nflEventHref(event.id),
    leagueName: section.name,
    leagueIcon: section.icon,
    when: event.when,
    live: !!event.live,
    score: event.live && event.score ? [event.score[1], event.score[0]] : undefined,
    volume: volumeFor(id, !!event.live, 'game'),
    rules: SETTLE_NFL,
    outcomes: priced(id, [
      {
        id: away.id,
        label: event.away,
        short: event.awayAbbr,
        team: event.away,
        odds: away.odds,
        position: `${event.away} to win`,
      },
      {
        id: home.id,
        label: event.home,
        short: event.homeAbbr,
        team: event.home,
        odds: home.odds,
        position: `${event.home} to win`,
      },
    ]),
  }
}

// ─── Yes / No lines (event page) ─────────────────────────────

function binary(
  game: SportsMarket,
  key: string,
  title: string,
  market: string,
  yes: SoccerOdds,
  no: SoccerOdds,
  yesPosition: string,
  noPosition: string,
  rules: string,
): SportsMarket {
  const id = `${game.id}-${key}`
  return {
    ...game,
    id,
    kind: 'line',
    title,
    market,
    score: undefined,
    volume: volumeFor(id, game.live, 'line'),
    rules,
    outcomes: priced(id, [
      { id: yes.id, label: 'Yes', short: 'Yes', odds: yes.odds, position: yesPosition },
      { id: no.id, label: 'No', short: 'No', odds: no.odds, position: noPosition },
    ]),
  }
}

function soccerLines(game: SportsMarket, event: SoccerEvent): SportsMarket[] {
  const out: SportsMarket[] = []
  const [home, , away] = game.outcomes
  const favHome = (home?.chance ?? 0) >= (away?.chance ?? 0)
  /* Home -1.5 lives on the home row; away -1.5 is the +1.5 home row. */
  const sp = event.spreadLines?.find((p) => p.line === (favHome ? -1.5 : 1.5))
  if (sp) {
    const fav = favHome ? event.home : event.away
    const dog = favHome ? event.away : event.home
    out.push(
      binary(
        game,
        'margin',
        `${fav} win by 2+ goals?`,
        'Spread',
        favHome ? sp.a : sp.b,
        favHome ? sp.b : sp.a,
        `${fav} by 2+`,
        `${dog} +1.5`,
        SETTLE_SOCCER,
      ),
    )
  }
  const main = event.defaultTotalLine ?? 2.5
  const half = Number.isInteger(main) ? main + 0.5 : main
  const tot = event.totalLines?.find((p) => p.line === half)
  if (tot) {
    const goals = Math.ceil(half)
    out.push(
      binary(
        game,
        'total',
        `${goals}+ goals in the match?`,
        'Total',
        tot.a,
        tot.b,
        `${goals}+ goals`,
        `Under ${half} goals`,
        SETTLE_SOCCER,
      ),
    )
  }
  const btts = 0.46 + rng(`${event.id}-btts`)() * 0.18
  out.push(
    binary(
      game,
      'btts',
      'Both teams score?',
      'Both Teams to Score',
      { id: `${event.id}-btts-y`, label: 'Yes', odds: toAmerican(btts + 0.025) },
      { id: `${event.id}-btts-n`, label: 'No', odds: toAmerican(1 - btts + 0.025) },
      'Both teams score',
      'Not both teams score',
      SETTLE_SOCCER,
    ),
  )
  return out
}

function toAmerican(p: number): string {
  const q = Math.min(0.97, Math.max(0.03, p))
  if (q >= 0.5) return `${-Math.round((100 * q) / (1 - q))}`
  return `+${Math.round((100 * (1 - q)) / q)}`
}

function nflLines(game: SportsMarket, event: SoccerEvent): SportsMarket[] {
  const out: SportsMarket[] = []
  const [, sp, tot] = nflBoardColumns(event)
  if (sp) {
    const [awayCell, homeCell] = sp.cells
    const awayFav = awayCell.label.trim().startsWith('-')
    const favCell = awayFav ? awayCell : homeCell
    const dogCell = awayFav ? homeCell : awayCell
    const fav = awayFav ? event.away : event.home
    const dog = awayFav ? event.home : event.away
    const line = Math.abs(Number.parseFloat(favCell.label))
    if (Number.isFinite(line) && line > 0) {
      out.push(
        binary(
          game,
          'margin',
          `${fav} win by ${Math.ceil(line)}+?`,
          sp.slipMarket,
          favCell,
          dogCell,
          favCell.slipLabel ?? `${fav} -${line}`,
          dogCell.slipLabel ?? `${dog} +${line}`,
          SETTLE_NFL,
        ),
      )
    }
  }
  if (tot) {
    const over = tot.cells.find((c) => /^o/i.test(c.label.trim())) ?? tot.cells[0]
    const under = tot.cells.find((c) => c !== over) ?? tot.cells[1]
    const line = Number.parseFloat(over.label.replace(/[^\d.]/g, ''))
    if (Number.isFinite(line)) {
      out.push(
        binary(
          game,
          'total',
          `${Math.ceil(line)}+ total points?`,
          tot.slipMarket,
          over,
          under,
          `${Math.ceil(line)}+ points`,
          `Under ${line} points`,
          SETTLE_NFL,
        ),
      )
    }
  }
  return out
}

// ─── Futures ──────────────────────────────────────────────────

const FUTURE_ICONS: Record<string, string> = {
  'Premier League Winner': '/banners/sports_league/prem.svg',
  'UEFA Champions League Winner': '/shell/figma/soccer/soccer-ball.svg',
}

function futureMarket(
  sport: MarketSport,
  name: string,
  picks: (SoccerOdds & { team?: string })[],
  leagueName: string,
  leagueIcon: string,
): SportsMarket {
  const id = `mkt-fut-${sport}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  const outcomes = priced(
    id,
    picks.map((p) => ({
      id: p.id,
      label: p.label,
      short: p.label,
      team: p.team ?? p.label,
      odds: p.odds,
      position: p.label,
    })),
  ).sort((a, b) => b.chance - a.chance)
  return {
    id,
    kind: 'future',
    sport,
    category: sport === 'nfl' ? 'football' : 'soccer',
    title: name,
    market: name,
    eventLabel: name,
    href: '',
    leagueName,
    leagueIcon,
    when: 'Season',
    live: false,
    volume: volumeFor(id, false, 'future'),
    rules: 'Settles when the winner is official. Pays $1.00 per share on the winner.',
    outcomes,
  }
}

// ─── Topic markets (Entertainment / Politics) ────────────────

const SETTLE_TOPIC = 'Settles when the outcome is official. Pays $1.00 per share on Yes / the winner.'

function topicBinary(
  category: Extract<MarketCategory, 'entertainment' | 'politics'>,
  key: string,
  title: string,
  leagueName: string,
  leagueIcon: string,
  yesOdds: string,
  noOdds: string,
): SportsMarket {
  const id = `mkt-topic-${category}-${key}`
  return {
    id,
    kind: 'line',
    sport: 'soccer',
    category,
    title,
    market: title,
    eventLabel: leagueName,
    href: '',
    leagueName,
    leagueIcon,
    when: 'Open',
    live: false,
    volume: volumeFor(id, false, 'line') * 3.2,
    rules: SETTLE_TOPIC,
    outcomes: priced(id, [
      { id: `${id}-yes`, label: 'Yes', short: 'Yes', odds: yesOdds, position: `Yes · ${title}` },
      { id: `${id}-no`, label: 'No', short: 'No', odds: noOdds, position: `No · ${title}` },
    ]),
  }
}

function topicMulti(
  category: Extract<MarketCategory, 'entertainment' | 'politics'>,
  key: string,
  title: string,
  leagueName: string,
  leagueIcon: string,
  picks: { label: string; short: string; odds: string }[],
): SportsMarket {
  const id = `mkt-topic-${category}-${key}`
  return {
    id,
    kind: 'future',
    sport: 'soccer',
    category,
    title,
    market: title,
    eventLabel: leagueName,
    href: '',
    leagueName,
    leagueIcon,
    when: 'Open',
    live: false,
    volume: volumeFor(id, false, 'future') * 1.4,
    rules: SETTLE_TOPIC,
    outcomes: priced(
      id,
      picks.map((p) => ({
        id: `${id}-${p.short.toLowerCase()}`,
        label: p.label,
        short: p.short,
        odds: p.odds,
        position: p.label,
      })),
    ).sort((a, b) => b.chance - a.chance),
  }
}

const TOPIC_ENT_ICON = '/shell/figma/markets/entertainment.svg'
const TOPIC_POL_ICON = '/shell/figma/markets/politics.svg'

let topicCache: SportsMarket[] | null = null

/** Kalshi-style non-sports markets for the Markets shelf filters. */
export function marketTopics(): SportsMarket[] {
  if (topicCache) return topicCache
  topicCache = [
    topicMulti('politics', 'nominee-28', '2028 Democratic nominee?', 'Politics', TOPIC_POL_ICON, [
      { label: 'Gavin Newsom', short: 'Newsom', odds: '+280' },
      { label: 'Gretchen Whitmer', short: 'Whitmer', odds: '+450' },
      { label: 'Josh Shapiro', short: 'Shapiro', odds: '+600' },
      { label: 'Someone else', short: 'Field', odds: '+180' },
    ]),
    topicBinary('politics', 'fed-cut', 'Fed cuts rates at next meeting?', 'Politics', TOPIC_POL_ICON, '-120', '+105'),
    topicBinary('politics', 'shutdown', 'Government shutdown before April?', 'Politics', TOPIC_POL_ICON, '+160', '-180'),
    topicMulti('entertainment', 'oscar-bp', 'Best Picture Oscar?', 'Entertainment', TOPIC_ENT_ICON, [
      { label: 'Sinners', short: 'Sinners', odds: '+220' },
      { label: 'One Battle After Another', short: 'OBAA', odds: '+350' },
      { label: 'Wicked: For Good', short: 'Wicked', odds: '+400' },
      { label: 'Field', short: 'Field', odds: '+250' },
    ]),
    topicBinary(
      'entertainment',
      'swift-1',
      'Taylor Swift album debuts #1?',
      'Entertainment',
      TOPIC_ENT_ICON,
      '-250',
      '+210',
    ),
    topicBinary(
      'entertainment',
      'box-office',
      'Avatar 3 opens above $180M?',
      'Entertainment',
      TOPIC_ENT_ICON,
      '+110',
      '-130',
    ),
  ]
  return topicCache
}

/** Games + topic markets for the home Markets shelf. */
export function marketShelfItems(): SportsMarket[] {
  return [...marketGames(), ...marketTopics()]
}

/** Same chip grammar as Popular — icons via ShellIcon name. */
export const MARKET_CATEGORY_FILTERS: {
  id: MarketCategory | 'all'
  label: string
  icon?: 'football' | 'soccer' | 'entertainment' | 'politics'
}[] = [
  { id: 'all', label: 'Trending' },
  { id: 'football', label: 'Football', icon: 'football' },
  { id: 'soccer', label: 'Soccer', icon: 'soccer' },
  { id: 'entertainment', label: 'Entertainment', icon: 'entertainment' },
  { id: 'politics', label: 'Politics', icon: 'politics' },
]

// ─── Public API ───────────────────────────────────────────────

let gameCache: SportsMarket[] | null = null
let futureCache: SportsMarket[] | null = null
let lineCache = new Map<string, SportsMarket[]>()

export function marketGames(): SportsMarket[] {
  if (gameCache) return gameCache
  const out: SportsMarket[] = []
  for (const section of SOCCER_GAME_SECTIONS) {
    for (const event of section.events) out.push(soccerGame(section, event))
  }
  for (const section of NFL_GAME_SECTIONS) {
    for (const event of section.events) {
      const m = nflGame(section, event)
      if (m) out.push(m)
    }
  }
  gameCache = out
  return out
}

export function marketFutures(): SportsMarket[] {
  if (futureCache) return futureCache
  const soccer = SOCCER_OUTRIGHTS.slice(0, 2).map((f) =>
    futureMarket(
      'soccer',
      f.name,
      f.picks,
      f.name.startsWith('UEFA') ? 'Champions League' : 'Premier League',
      FUTURE_ICONS[f.name] ?? '/shell/figma/soccer/soccer-ball.svg',
    ),
  )
  const nfl = NFL_FUTURES.map((f) => futureMarket('nfl', f.name, f.picks, 'NFL', '/homepage/logo-nfl.svg'))
  futureCache = [nfl[0]!, soccer[0]!, ...nfl.slice(1), ...soccer.slice(1)].filter(Boolean)
  return futureCache
}

function findEvent(sport: MarketSport, eventId: string): SoccerEvent | null {
  const sections = sport === 'nfl' ? NFL_GAME_SECTIONS : SOCCER_GAME_SECTIONS
  for (const s of sections) {
    const e = s.events.find((x) => x.id === eventId)
    if (e) return e
  }
  return null
}

export function marketEvent(
  sport: MarketSport,
  eventId: string,
): { game: SportsMarket; lines: SportsMarket[] } | null {
  const game = marketGames().find((m) => m.sport === sport && m.eventId === eventId)
  const event = findEvent(sport, eventId)
  if (!game || !event) return null
  let lines = lineCache.get(game.id)
  if (!lines) {
    lines = sport === 'nfl' ? nflLines(game, event) : soccerLines(game, event)
    lineCache.set(game.id, lines)
  }
  return { game, lines }
}

/** Biggest 24h moves across game winners. */
export function marketMovers(limit = 5): { market: SportsMarket; outcome: MarketOutcome }[] {
  return marketGames()
    .flatMap((market) =>
      market.outcomes.filter((o) => o.label !== 'Draw').map((outcome) => ({ market, outcome })),
    )
    .sort((a, b) => Math.abs(b.outcome.change) - Math.abs(a.outcome.change))
    .slice(0, limit)
}

export type ChartRange = '1H' | '6H' | '1D' | '1W' | 'ALL'
export const CHART_RANGES: ChartRange[] = ['1H', '6H', '1D', '1W', 'ALL']
const RANGE_SCALE: Record<ChartRange, number> = { '1H': 0.18, '6H': 0.55, '1D': 1, '1W': 2.1, ALL: 3.2 }

/** Price history per outcome, ending on today's chance. */
export function marketSeries(market: SportsMarket, range: ChartRange, points = 64): number[][] {
  const scale = RANGE_SCALE[range]
  return market.outcomes.map((o) => {
    const r = rng(`${market.id}-${o.id}-${range}`)
    const start = o.chance - o.change * scale
    const noise = Math.max(0.4, o.chance * 0.04) * Math.sqrt(scale)
    let drift = 0
    const out: number[] = []
    for (let i = 0; i < points; i++) {
      const t = i / (points - 1)
      drift = drift * 0.82 + (r() - 0.5) * noise
      const v = start + (o.chance - start) * t + drift * (1 - t * t)
      out.push(Math.min(99.5, Math.max(0.5, v)))
    }
    out[points - 1] = o.chance
    return out
  })
}

// ─── Portfolio ────────────────────────────────────────────────

export type Position = {
  bet: SportsBet
  title: string
  subtitle: string
  legs: number
  shares: number
  /** Cents paid per share. */
  avg: number
  /** Cents now — 100 won, 0 lost. */
  mark: number
  cost: number
  value: number
  pnl: number
  pnlPct: number
  open: boolean
  live: boolean
  href?: string
}

function outcomeIndex(): Map<string, MarketOutcome> {
  const map = new Map<string, MarketOutcome>()
  for (const m of [...marketGames(), ...marketFutures()]) {
    for (const o of m.outcomes) map.set(o.id, o)
  }
  return map
}

let indexCache: Map<string, MarketOutcome> | null = null

function legMark(leg: BetLeg): number {
  if (leg.status === 'won') return 1
  if (leg.status === 'lost') return 0
  if (leg.status === 'push' || leg.status === 'void') return 1
  indexCache ??= outcomeIndex()
  const hit = indexCache.get(leg.id)
  if (hit) return hit.chance / 100
  /* Off-board legs drift a little from the price they were bought at. */
  const p = impliedProb(leg.odds)
  const drift = (rng(`${leg.id}-mark`)() - 0.42) * 0.16
  return Math.min(0.97, Math.max(0.03, p + drift))
}

const WINNER_MARKETS = /moneyline|3-way|winner/i

export function positionCopy(leg: BetLeg): { title: string; subtitle: string } {
  if (WINNER_MARKETS.test(leg.market)) {
    const plain = /to win$/i.test(leg.label) || /^(draw|tie)$/i.test(leg.label)
    const title = /^tie$/i.test(leg.label) ? 'Draw' : plain ? leg.label : `${leg.label} to win`
    return { title, subtitle: leg.eventLabel }
  }
  return { title: leg.label, subtitle: `${leg.market} · ${leg.eventLabel}` }
}

export function toPosition(bet: SportsBet): Position {
  const shares = bet.toWin
  const avg = shares > 0 ? (bet.stake / shares) * 100 : 0
  const open = bet.status === 'pending'
  const markProb = open
    ? bet.legs.reduce((acc, leg) => acc * legMark(leg), 1)
    : bet.status === 'won'
      ? 1
      : bet.status === 'lost'
        ? 0
        : (bet.payout ?? bet.stake) / (shares || 1)
  const value = open ? shares * markProb : (bet.payout ?? (bet.status === 'won' ? shares : 0))
  const pnl = value - bet.stake
  const first = bet.legs[0]!
  const copy =
    bet.legs.length === 1
      ? positionCopy(first)
      : {
          title: `${bet.legs.length}-leg ${bet.type === 'sgp' ? 'same game combo' : 'combo'}`,
          subtitle: bet.legs.map((l) => l.label).join(' · '),
        }
  return {
    bet,
    ...copy,
    legs: bet.legs.length,
    shares,
    avg,
    mark: markProb * 100,
    cost: bet.stake,
    value,
    pnl,
    pnlPct: bet.stake > 0 ? (pnl / bet.stake) * 100 : 0,
    open,
    live: bet.legs.some((l) => /live|^q\d|'$/i.test(l.when ?? '')),
    href: bet.legs.length === 1 ? first.eventHref : undefined,
  }
}

export type PortfolioSummary = {
  positionsValue: number
  openCost: number
  openPnl: number
  realizedPnl: number
  winRate: number
  open: Position[]
  closed: Position[]
}

export function portfolioSummary(bets: SportsBet[]): PortfolioSummary {
  const all = bets.map(toPosition)
  const open = all.filter((p) => p.open)
  const closed = all.filter((p) => !p.open)
  const decided = closed.filter((p) => p.bet.status === 'won' || p.bet.status === 'lost')
  return {
    positionsValue: open.reduce((s, p) => s + p.value, 0),
    openCost: open.reduce((s, p) => s + p.cost, 0),
    openPnl: open.reduce((s, p) => s + p.pnl, 0),
    realizedPnl: closed.reduce((s, p) => s + p.pnl, 0),
    winRate: decided.length
      ? (decided.filter((p) => p.bet.status === 'won').length / decided.length) * 100
      : 0,
    open,
    closed,
  }
}

/** Account value path for the Portfolio chart, ending on today's total. */
export function portfolioSeries(total: number, range: ChartRange, points = 64): number[] {
  const scale = RANGE_SCALE[range]
  const r = rng(`portfolio-${range}`)
  const start = total * (1 - 0.06 * scale) - 8 * scale
  let drift = 0
  const out: number[] = []
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1)
    drift = drift * 0.85 + (r() - 0.5) * total * 0.018 * Math.sqrt(scale)
    out.push(Math.max(0, start + (total - start) * t + drift * (1 - t)))
  }
  out[points - 1] = total
  return out
}
