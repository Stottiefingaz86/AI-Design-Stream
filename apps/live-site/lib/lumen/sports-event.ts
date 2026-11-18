/**
 * Event view model shared by every sport (soccer, NFL, …).
 * Each sport builds one `SportsEventModel`; `SportsEventView` renders it.
 */
import {
  probToAmerican,
  type SoccerEvent,
  type SoccerLinePair,
  type SoccerOdds,
} from '@/lib/lumen/soccer-sport'

export type EventSport = 'soccer' | 'nfl'

export type EventTab = { id: string; label: string }

type MarketBase = {
  id: string
  name: string
  tabs: string[]
  live?: boolean
  /** In-play markets that lock for a few seconds while a play is reviewed. */
  volatile?: boolean
  /** Betslip market key — alt ladders share the main market so one leg per market holds. */
  slipMarket?: string
}

export type EventColumnHead = { label: string; team?: string }

/** One outcome per button: 2-way / 3-way / Yes-No / exact counts. */
export type RowMarket = MarketBase & { kind: 'row'; cells: SoccerOdds[] }

/** Line market — main pair on the card, alternate points in the board's alt-line picker. */
export type LadderMarket = MarketBase & {
  kind: 'ladder'
  columns: [EventColumnHead, EventColumnHead]
  rows: SoccerLinePair[]
  mainLine: number
  /** Alt-line menu header (e.g. Spreads, Totals, Goals). */
  altTitle: string
}

/** Outcomes in team columns (correct score, HT/FT, winning margin). */
export type GridMarket = MarketBase & {
  kind: 'grid'
  columns: { label: string; team?: string; cells: SoccerOdds[] }[]
}

/** Player × outcome table (first / anytime / 2+). */
export type PlayersMarket = MarketBase & {
  kind: 'players'
  columns: string[]
  teams: {
    name: string
    abbr: string
    players: { id: string; name: string; pos?: string; cells: SoccerOdds[] }[]
  }[]
}

/** US game lines — one row per team, one column per market (Spread · Total · Moneyline). */
export type LinesMarket = MarketBase & {
  kind: 'lines'
  columns: { label: string; slipMarket: string }[]
  rows: { team: string; cells: (SoccerOdds | null)[] }[]
}

/** Player over / under with its own alt-line picker per player. */
export type PlayerLinesMarket = MarketBase & {
  kind: 'player-lines'
  teams: {
    name: string
    abbr: string
    players: {
      id: string
      name: string
      pos?: string
      rows: SoccerLinePair[]
      mainLine: number
    }[]
  }[]
}

/** Correct score stepper (− score +) with the full grid one tap away. */
export type ScoreMarket = MarketBase & {
  kind: 'score'
  /** `cells[h][a]` — final score prices. Missing = not possible (live). */
  cells: (SoccerOdds | null)[][]
  min: [number, number]
  start: [number, number]
  grid: GridMarket['columns']
  other?: SoccerOdds
}

/** Every line on the card at once — no alt popup. `null` = suspended line, `undefined` = no outcome. */
export type ListMarket = MarketBase & {
  kind: 'list'
  groups: {
    title?: string
    team?: string
    columns: EventColumnHead[]
    rows: (SoccerOdds | null | undefined)[][]
  }[]
  /** Rows per group before Show all. */
  preview?: number
}

export type EventMarket =
  | RowMarket
  | ListMarket
  | LadderMarket
  | GridMarket
  | PlayersMarket
  | LinesMarket
  | PlayerLinesMarket
  | ScoreMarket

export type EventIncidentKind = 'goal' | 'yellow' | 'red' | 'sub' | 'td' | 'fg' | 'safety'

export type EventIncident = {
  /** Sort key — minute (soccer) or elapsed game seconds (NFL). */
  at: number
  label: string
  side: 'home' | 'away'
  kind: EventIncidentKind
  player: string
  detail?: string
  score?: [number, number]
}

export type EventStatRow = {
  label: string
  /** [home, away] */
  values: [number, number]
  format?: 'clock'
}

export type FormResult = 'W' | 'D' | 'L'

export type EventInfo = {
  homeForm: FormResult[]
  awayForm: FormResult[]
  h2h: { date: string; home: string; away: string; score: [number, number] }[]
  /** [home, tie, away] — tie is 0 for sports without draws. */
  winProb: [number, number, number]
  rows: [string, string][]
}

/** Soccer pitch beat or NFL play — drives the match tracker. */
export type TrackerBeat = {
  side: 'home' | 'away'
  label: string
  zone?: 'safe' | 'attack' | 'danger'
  /** Soccer: pitch coords (100 × 64). NFL: ball spot in yards from the home goal line. */
  x: number
  y?: number
  /** NFL — down & distance after the play. */
  down?: string
  firstDownAt?: number
}

export type EventLive = {
  incidents: EventIncident[]
  stats: EventStatRow[]
  /** Soccer possession split for the tracker foot. */
  possession?: [number, number]
  beats: TrackerBeat[]
  /** NFL — drive summary for the tracker foot. */
  drive?: string
}

export type SportsEventModel = {
  sport: EventSport
  event: SoccerEvent
  league: { name: string; icon: string }
  sportLabel: string
  sportHref: string
  siblings: SoccerEvent[]
  hrefFor: (id: string) => string
  eventLabel: string
  tabs: EventTab[]
  markets: EventMarket[]
  /** Board-shared pick ids — never drift so the board and event view agree. */
  boardIds: Set<string>
  /** US order: away on the left / top. */
  awayFirst: boolean
  live: EventLive | null
  info: EventInfo
  streamSrc: string
  records?: { home: string; away: string }
  /** Team with the ball (NFL live). */
  possession?: 'home' | 'away'
}

// ─── Shared pricing helpers ───────────────────────────────────

export function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Deterministic 0..1 for a seed string. */
export function seeded(seed: string): number {
  return (hashSeed(seed) % 10_000) / 10_000
}

/** Fair probability → American price with book margin, clamped to a sane range. */
export function bookPrice(p: number, margin = 1.0476): string {
  return probToAmerican(Math.min(0.95, Math.max(0.025, p * margin)))
}

export function fmtLine(n: number): string {
  return String(Math.round(n * 100) / 100)
}

export function lineKey(n: number): string {
  return fmtLine(n).replace('-', 'm').replace('.', '_')
}

/** Every price in a market — for live drift pools. */
export function marketPicks(m: EventMarket): SoccerOdds[] {
  switch (m.kind) {
    case 'row':
      return m.cells
    case 'ladder':
      return m.rows.flatMap((r) => [r.a, r.b])
    case 'grid':
      return m.columns.flatMap((c) => c.cells)
    case 'players':
      return m.teams.flatMap((t) => t.players.flatMap((p) => p.cells))
    case 'lines':
      return m.rows.flatMap((r) => r.cells.filter((c): c is SoccerOdds => !!c))
    case 'player-lines':
      return m.teams.flatMap((t) => t.players.flatMap((p) => p.rows.flatMap((r) => [r.a, r.b])))
    case 'list':
      return m.groups.flatMap((g) => g.rows.flat().filter((c): c is SoccerOdds => !!c))
    case 'score':
      return [
        ...m.cells.flatMap((row) => row.filter((c): c is SoccerOdds => !!c)),
        ...(m.other ? [m.other] : []),
      ]
  }
}
