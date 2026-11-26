/**
 * V5 · Combos — market views for the sport sub-nav (Spreads, Totals, Game props, Player props,
 * Win totals, Futures) as uniform cards, plus the sort modes (Trending, Start time, Volatile,
 * New, Closing soon, Volume, 50-50). Built from the same data the V1 boards and event views use,
 * so every pick lands on the betslip with the same ids.
 */
import type { SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import { findNflEvent, nflEventModel } from '@/lib/lumen/nfl-sport'
import { findSoccerEvent, soccerEventModel } from '@/lib/lumen/soccer-event'
import type { SoccerOdds } from '@/lib/lumen/soccer-sport'
import type {
  EventMarket,
  PlayerLinesMarket,
  PlayersMarket,
  RowMarket,
  SportsEventModel,
} from '@/lib/lumen/sports-event'
import {
  marketFutures,
  marketToSlipPick,
  priceToAmerican,
  type SportsMarket,
} from '@/lib/lumen/sports-markets'
import {
  eventLadders,
  kickoffTime,
  leadOutcome,
  leagueLogo,
  pickFor,
  teamOutcomes,
  teamRecord,
  v5Games,
  type V5Sport,
} from '@/lib/lumen/v5-combos'
import { genEventModel, genFutures, isGenerated, v5SportOf, type V5SportId } from '@/lib/lumen/v5-sportsbook'

export type V5View =
  | 'games'
  | 'live'
  | 'spreads'
  | 'totals'
  | 'game-props'
  | 'player-props'
  | 'win-totals'
  | 'futures'
  | 'combos'
  | 'boosts'

export type SortMode = 'trending' | 'start' | 'volatile' | 'new' | 'closing' | 'volume' | 'fifty'

export const SORT_MODES: { id: SortMode; label: string }[] = [
  { id: 'start', label: 'Start time' },
  { id: 'trending', label: 'Trending' },
  { id: 'volatile', label: 'Volatile' },
  { id: 'new', label: 'New' },
  { id: 'closing', label: 'Closing soon' },
  { id: 'volume', label: 'Volume' },
  { id: 'fifty', label: '50-50' },
]

/** One row on a card: question · chance · Yes (and No when there is one). */
export type KRow = {
  id: string
  label: string
  sub?: string
  /** Crest by team name, or a short text badge (player initials, "X"). */
  crest?: string
  badge?: string
  chance: number
  change?: number
  yes: SoccerSlipPick
  /** Yes price in ¢ (defaults to the chance). */
  yesPrice?: number
  no?: SoccerSlipPick
  noPrice?: number
  /** Line stepper — each step is a full row (buy points). */
  steps?: { labels: string[]; index: number; rows: KRow[] }
  /** Live score for this side. */
  score?: number
}

export type KCard = {
  id: string
  title: string
  sub: string
  icon: string
  href?: string
  sport: V5SportId | 'topic'
  /** Non-sports markets (Politics / Entertainment). */
  category?: 'politics' | 'entertainment'
  /** Icon tile for markets without a league logo (see TopicGlyph). */
  glyph?: string
  league: string
  live: boolean
  volume: number
  startsAt: number
  /** Biggest 24h move on the card (Volatile). */
  swing: number
  /** Distance of the main row from 50% (50-50). */
  balance: number
  rows: KRow[]
  /** Group key for the Player props chips ("Touchdowns", "Passing Yards"). */
  group?: string
}

// ─── helpers ───────────────────────────────────────────────────

function seeded(key: string): number {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1000) / 1000
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/** American odds → implied chance (0–100). */
export function chanceOf(odds: string): number {
  const t = odds.trim().toUpperCase()
  if (t === 'EVEN' || t === 'EV') return 50
  const n = Number.parseFloat(t.replace(/[^\d.-]/g, ''))
  if (!Number.isFinite(n) || n === 0) return 50
  const p = t.startsWith('-') ? Math.abs(n) / (Math.abs(n) + 100) : 100 / (n + 100)
  return clamp(p * 100, 1, 99)
}

/** "Sun 22 Nov, 1:00 PM" → sortable timestamp; live games sort first. */
function startsAt(game: SportsMarket): number {
  if (game.live) return 0
  const t = Date.parse(`${game.when.replace(/^[A-Za-z]{3}\s+/, '').replace(',', '')} 2026`)
  return Number.isFinite(t) ? t : 9e15
}

function sub(game: SportsMarket): string {
  return game.live ? `Live · ${game.when} · ${game.leagueName}` : `${game.when.split(',')[0]} · ${kickoffTime(game)} · ${game.leagueName}`
}

function base(game: SportsMarket, id: string, title: string): Omit<KCard, 'rows' | 'swing' | 'balance'> {
  return {
    id,
    title,
    sub: sub(game),
    icon: leagueLogo(game.leagueName, game.leagueIcon),
    href: game.href,
    sport: v5SportOf(game),
    league: game.leagueName,
    live: game.live,
    volume: Math.round(game.volume * (0.18 + seeded(id) * 0.4)),
    startsAt: startsAt(game),
  }
}

function finish(card: Omit<KCard, 'swing' | 'balance'>): KCard {
  const main = card.rows[0]
  return {
    ...card,
    swing: Math.max(0, ...card.rows.map((r) => Math.abs(r.change ?? 0))),
    balance: main ? Math.abs(main.chance - 50) : 50,
  }
}

const modelCache = new Map<string, SportsEventModel | null>()
function modelFor(game: SportsMarket): SportsEventModel | null {
  if (!game.eventId) return null
  if (isGenerated(game)) return game.field ? null : genEventModel(game.eventId)
  const key = `${game.sport}:${game.eventId}`
  if (modelCache.has(key)) return modelCache.get(key)!
  let model: SportsEventModel | null = null
  if (game.sport === 'nfl') {
    const f = findNflEvent(game.eventId)
    model = f ? nflEventModel(f.event, f.section) : null
  } else {
    const f = findSoccerEvent(game.eventId)
    model = f ? soccerEventModel(f.event, f.section) : null
  }
  modelCache.set(key, model)
  return model
}

function v1Pick(model: SportsEventModel, market: EventMarket, cell: SoccerOdds, label?: string): SoccerSlipPick {
  return {
    id: cell.id,
    label: label ?? cell.slipLabel ?? cell.label,
    odds: cell.odds,
    eventLabel: model.eventLabel,
    market: market.slipMarket ?? market.name,
    eventId: model.event.id,
    eventHref: model.hrefFor(model.event.id),
    sport: model.sport,
    live: !!model.event.live,
  }
}

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')

// ─── views ─────────────────────────────────────────────────────

/** Spreads / totals — one card per game, three lines around the main one, each with Yes / No. */
export function ladderCards(sport: V5Sport, kind: 'spread' | 'total'): KCard[] {
  return v5Games(sport).flatMap((game) => {
    const ladder = eventLadders(game).find((l) => l.kind === kind)
    if (!ladder) return []
    const at = ladder.defaultIndex
    const picks = [at - 1, at, at + 1].filter((i) => i >= 0 && i < ladder.rungs.length)
    const rows: KRow[] = picks.map((i) => {
      const r = ladder.rungs[i]!
      /* Line first — on phones a long "Team win by over…" truncated every row to the same text. */
      const team = kind === 'spread' ? ladder.lead.replace(/\s+win by over$/i, '') : ''
      return {
        id: r.yes.id,
        label: team ? `Win by over ${r.line} ${ladder.unit}` : `${ladder.lead} ${r.line} ${ladder.unit}`,
        sub: team || undefined,
        chance: r.chance,
        change: r.change,
        yes: r.yes,
        no: r.no,
      }
    })
    /* Main line first so the card leads with it. */
    rows.sort((a, b) => (a.id === ladder.rungs[at]!.yes.id ? -1 : b.id === ladder.rungs[at]!.yes.id ? 1 : 0))
    return [finish({ ...base(game, `${game.id}-${kind}`, `${game.title}: ${kind === 'spread' ? 'Spread' : 'Total'}`), rows })]
  })
}

const YES_FIRST = /^(yes|over|odd)$/i
const NO_SECOND = /^(no|under|even)$/i

/** Game props — every yes/no question and multi-outcome prop on each game. */
export function gamePropCards(sport: V5Sport): KCard[] {
  return v5Games(sport).flatMap((game) => {
    const model = modelFor(game)
    if (!model) return []
    const markets = model.markets
      .filter((m): m is RowMarket => m.kind === 'row')
      .filter((m) => !m.tabs.includes('lines') && !/^(3-way regulation|moneyline)$/i.test(m.name))
      .filter((m) => m.cells.length >= 2 && m.cells.length <= 4)
    const rows: KRow[] = []
    for (const m of markets) {
      const [a, b] = m.cells
      if (m.cells.length === 2 && a && b && YES_FIRST.test(a.label) && NO_SECOND.test(b.label)) {
        const pa = chanceOf(a.odds)
        const pb = chanceOf(b.odds)
        rows.push({
          id: a.id,
          label: /^yes$/i.test(a.label) ? m.name : (a.slipLabel ?? `${m.name}: ${a.label}`),
          chance: (100 * pa) / (pa + pb),
          yes: v1Pick(model, m, a),
          yesPrice: Math.round(pa),
          no: v1Pick(model, m, b),
          noPrice: Math.round(pb),
        })
      } else {
        const ps = m.cells.map((c) => chanceOf(c.odds))
        const sum = ps.reduce((s, p) => s + p, 0) || 1
        m.cells.forEach((c, i) =>
          rows.push({
            id: c.id,
            label: c.slipLabel ?? `${m.name}: ${c.label}`,
            sub: m.name,
            chance: (100 * ps[i]!) / sum,
            yes: v1Pick(model, m, c),
            yesPrice: Math.round(ps[i]!),
          }),
        )
      }
    }
    if (!rows.length) return []
    return [finish({ ...base(game, `${game.id}-props`, `${game.title}: Game props`), rows })]
  })
}

/** Player props — one card per game per market; chips group them ("Touchdowns", "Passing Yards"). */
export function playerPropCards(sport: V5Sport): KCard[] {
  return v5Games(sport).flatMap((game) => {
    const model = modelFor(game)
    if (!model) return []
    const out: KCard[] = []
    for (const m of model.markets) {
      if (m.kind === 'players') {
        const pm = m as PlayersMarket
        const col = 0
        const rows = pm.teams
          .flatMap((t) =>
            t.players
              .filter((p) => p.cells[col])
              .map<KRow>((p) => {
                const cell = p.cells[col]!
                const chance = chanceOf(cell.odds)
                return {
                  id: cell.id,
                  label: p.name,
                  sub: [t.abbr, p.pos].filter(Boolean).join(' · '),
                  badge: initials(p.name),
                  chance,
                  yes: v1Pick(model, pm, cell, cell.slipLabel ?? `${p.name} ${pm.columns[col] ?? ''}`.trim()),
                }
              }),
          )
          .sort((a, b) => b.chance - a.chance)
        if (rows.length)
          out.push(
            finish({
              ...base(game, `${game.id}-${pm.id}`, `${game.title}: ${pm.name}`),
              group: groupOf(pm.name),
              rows,
            }),
          )
      } else if (m.kind === 'player-lines') {
        const pl = m as PlayerLinesMarket
        const rows = pl.teams.flatMap((t) =>
          t.players.map<KRow>((p) => {
            const main = Math.max(0, p.rows.findIndex((r) => r.line === p.mainLine))
            const stepRows: KRow[] = p.rows.map((r) => {
              const pa = chanceOf(r.a.odds)
              const pb = chanceOf(r.b.odds)
              return {
                id: r.a.id,
                label: `${p.name} over ${r.line}`,
                sub: [t.abbr, p.pos].filter(Boolean).join(' · '),
                badge: initials(p.name),
                chance: (100 * pa) / (pa + pb),
                yes: v1Pick(model, pl, r.a),
                yesPrice: Math.round(pa),
                no: v1Pick(model, pl, r.b),
                noPrice: Math.round(pb),
              }
            })
            return { ...stepRows[main]!, steps: { labels: p.rows.map((r) => String(r.line)), index: main, rows: stepRows } }
          }),
        )
        if (rows.length)
          out.push(
            finish({
              ...base(game, `${game.id}-${pl.id}`, `${game.title}: ${pl.name}`),
              group: groupOf(pl.name),
              rows,
            }),
          )
      }
    }
    return out
  })
}

function groupOf(name: string): string {
  if (/touchdown|td\b/i.test(name)) return 'Touchdowns'
  if (/scorer|goal/i.test(name)) return 'Goalscorers'
  if (/card|booked/i.test(name)) return 'Cards'
  if (/shot/i.test(name)) return 'Shots'
  return name
}

/** NFL season win totals — two lines per team around its projection (17 games). */
export function winTotalCards(sport: V5Sport): KCard[] {
  if (sport !== 'all' && sport !== 'nfl') return []
  const seen = new Map<string, KCard>()
  for (const game of v5Games('nfl')) {
    for (const o of teamOutcomes(game)) {
      const team = o.team ?? o.label
      if (seen.has(team)) continue
      const rec = teamRecord(game, o)
      const m = rec?.match(/(\d+)-(\d+)/)
      if (!m) continue
      const w = Number(m[1])
      const l = Number(m[2])
      const played = w + l
      const left = Math.max(0, 17 - played)
      const proj = w + (w / Math.max(1, played)) * left
      const sd = Math.max(0.8, Math.sqrt(left * 0.25))
      const lines = [Math.floor(proj), Math.floor(proj) + 1].filter((x) => x > w)
      const id = `wt-${team.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
      const rows: KRow[] = lines.map((line) => {
        const z = (proj - (line - 0.5)) / sd
        const chance = clamp(100 / (1 + Math.exp(-1.7 * z)), 3, 97)
        const price = Math.round(chance)
        const pick: SoccerSlipPick = {
          id: `${id}-${line}`,
          label: `${team} ${line}+ wins`,
          odds: priceToAmerican(price),
          eventLabel: `${team} Total Wins`,
          market: 'Regular Season Wins',
          sport: 'nfl',
          outright: true,
        }
        return {
          id: pick.id,
          label: `${line}+ wins`,
          crest: team,
          chance,
          change: Math.round((seeded(pick.id) - 0.5) * 80) / 10,
          yes: pick,
        }
      })
      if (!rows.length) continue
      seen.set(
        team,
        finish({
          id,
          title: `NFL: ${team} total wins`,
          sub: `Record ${rec} · Regular season`,
          icon: leagueLogo(game.leagueName, game.leagueIcon),
          sport: 'nfl',
          league: game.leagueName,
          live: false,
          volume: Math.round(150_000 + seeded(id) * 900_000),
          startsAt: 9e15 + seeded(id),
          rows,
        }),
      )
    }
  }
  return [...seen.values()]
}

/** Futures — champions, MVP, league winners. */
export function futureCards(sport: V5Sport): KCard[] {
  return [...marketFutures(), ...genFutures()]
    .filter((f) => (sport === 'all' || v5SportOf(f) === sport) && !/mvp|boot|scorer|player|rookie|award/i.test(f.title))
    .map((f) =>
      finish({
        id: f.id,
        title: f.title,
        sub: `${f.leagueName} · Season`,
        icon: leagueLogo(f.leagueName, f.leagueIcon),
        sport: v5SportOf(f),
        league: f.leagueName,
        live: false,
        volume: f.volume,
        startsAt: 9e15 + seeded(f.id),
        rows: f.outcomes.map((o) => ({
          id: o.id,
          label: o.label,
          crest: o.team ?? o.label,
          chance: o.chance,
          change: o.change,
          yes: marketToSlipPick(f, o),
        })),
      }),
    )
}

// ─── sort ──────────────────────────────────────────────────────

type Sortable = { id: string; live: boolean; volume: number; startsAt: number; swing: number; balance: number }

export function sortItems<T extends Sortable>(items: T[], mode: SortMode, reverse = false): T[] {
  const by: Record<SortMode, (a: T, b: T) => number> = {
    trending: (a, b) => Number(b.live) - Number(a.live) || b.volume - a.volume,
    start: (a, b) => a.startsAt - b.startsAt,
    volatile: (a, b) => b.swing - a.swing,
    new: (a, b) => seeded(b.id) - seeded(a.id),
    closing: (a, b) => a.startsAt - b.startsAt || b.volume - a.volume,
    volume: (a, b) => b.volume - a.volume,
    fifty: (a, b) => a.balance - b.balance,
  }
  const sorted = [...items].sort(by[mode])
  return reverse ? sorted.reverse() : sorted
}

/** Games as sortables (same fields as cards). */
export function gameSortable(game: SportsMarket): Sortable & { game: SportsMarket } {
  const lead = leadOutcome(game)
  return {
    id: game.id,
    game,
    live: game.live,
    volume: game.volume,
    startsAt: startsAt(game),
    swing: Math.max(0, ...game.outcomes.map((o) => Math.abs(o.change))),
    balance: Math.abs(lead.chance - 50),
  }
}

/** One game as a market card (races and other many-runner events use this on the board). */
export function gameCardOf(game: SportsMarket): KCard {
  return gameCardsFrom([game])[0]!
}

/** Games as market cards — who wins, crest per side, live score. */
export function gameCards(sport: V5Sport): KCard[] {
  return gameCardsFrom(v5Games(sport))
}

function gameCardsFrom(games: SportsMarket[]): KCard[] {
  return games.map((game) => {
    const teams = teamOutcomes(game)
    return finish({
      ...base(game, `${game.id}-ml`, game.title),
      volume: game.volume,
      rows: game.outcomes.map((o) => ({
        id: o.id,
        label: o.label,
        crest: o.label === 'Draw' ? undefined : (o.team ?? o.label),
        badge: o.label === 'Draw' ? 'X' : undefined,
        chance: o.chance,
        change: o.change,
        yes: pickFor(game, o, 'yes'),
        score: game.live && game.score && o.label !== 'Draw' ? game.score[teams.indexOf(o)] : undefined,
      })),
    })
  })
}

export type BrowseWhen = 'all' | 'live' | 'upcoming' | 'season'
export type BrowseType = 'all' | 'games' | 'props' | 'futures'

/** Browse markets — every card type in one pool. */
export function browseCards(sport: V5Sport): (KCard & { type: BrowseType })[] {
  return [
    ...gameCards(sport).map((c) => ({ ...c, type: 'games' as const })),
    ...gamePropCards(sport).map((c) => ({ ...c, type: 'props' as const })),
    ...ladderCards(sport, 'spread').map((c) => ({ ...c, type: 'games' as const })),
    ...futureCards(sport).map((c) => ({ ...c, type: 'futures' as const })),
    ...winTotalCards(sport).map((c) => ({ ...c, type: 'futures' as const })),
  ]
}

export function matchesWhen(card: KCard, when: BrowseWhen): boolean {
  if (when === 'all') return true
  if (when === 'live') return card.live
  const season = card.startsAt >= 9e15
  return when === 'season' ? season : !card.live && !season
}
