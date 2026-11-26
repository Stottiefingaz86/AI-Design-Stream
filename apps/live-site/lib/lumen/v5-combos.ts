import { useSyncExternalStore } from 'react'
import type { SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import { nflRecords } from '@/lib/lumen/nfl-sport'
import {
  marketEvent,
  marketGames,
  marketToSlipPick,
  priceToAmerican,
  type MarketOutcome,
  type SportsMarket,
} from '@/lib/lumen/sports-markets'
import {
  V5_SPORTS,
  generatedGames,
  genLadders,
  genRecord,
  isGenerated,
  leagueHref,
  leagueSlug,
  v5SportOf,
  type V5SportId,
} from '@/lib/lumen/v5-sportsbook'

/**
 * V5 · Combos — prediction-market style sportsbook.
 * Everything here is derived from the same demo boards as V1–V3, so picks land in the
 * shared betslip store and placed combos show up in My Bets like any parlay.
 */

export type V5Sport = 'all' | V5SportId

// ─── Leagues ─────────────────────────────────────────────────

/** Lumen league logos (public/leagues) keyed by board league name. */
const LEAGUE_LOGO: Record<string, string> = {
  NFL: '/leagues/football/usa/nfl.svg',
  'NCAA Football': '/leagues/football/usa/ncaaf.svg',
  'Premier League': '/leagues/soccer/england/premier-league.svg',
  Championship: '/leagues/soccer/england/championship.svg',
  'La Liga': '/leagues/soccer/spain/la-liga-primera.svg',
  'UEFA Champions League': '/leagues/soccer/europe/uefa-champions-league.svg',
  'Champions League': '/leagues/soccer/europe/uefa-champions-league.svg',
  MLS: '/leagues/soccer/usa/mls.svg',
}

export function leagueLogo(leagueName: string, fallback?: string): string {
  return LEAGUE_LOGO[leagueName] ?? fallback ?? '/leagues/soccer/england/premier-league.svg'
}

let allGames: SportsMarket[] | null = null

/** V1 boards (NFL, NCAA, Premier League…) plus every generated sport and league. */
export function v5Games(sport: V5Sport = 'all'): SportsMarket[] {
  allGames ??= [...marketGames(), ...generatedGames()]
  return sport === 'all' ? allGames : allGames.filter((g) => v5SportOf(g) === sport)
}

export type V5League = { name: string; logo: string; sport: V5SportId; count: number }

export function v5Leagues(sport: V5Sport = 'all'): V5League[] {
  const map = new Map<string, V5League>()
  for (const g of v5Games(sport)) {
    const hit = map.get(g.leagueName)
    if (hit) hit.count += 1
    else
      map.set(g.leagueName, {
        name: g.leagueName,
        logo: leagueLogo(g.leagueName, g.leagueIcon),
        sport: v5SportOf(g),
        count: 1,
      })
  }
  return [...map.values()]
}

/** "Sun 22 Nov, 1:00 PM" → "Sun 22 Nov"; live games group under "Live now". */
export function dayLabel(game: SportsMarket): string {
  if (game.live) return 'Live now'
  const day = game.when.split(',')[0]?.trim()
  return day || 'Upcoming'
}

export function kickoffTime(game: SportsMarket): string {
  if (game.live) return game.when
  return game.when.split(',')[1]?.trim() ?? game.when
}

export function groupByDay(games: SportsMarket[]): { label: string; games: SportsMarket[] }[] {
  const out: { label: string; games: SportsMarket[] }[] = []
  const live = games.filter((g) => g.live)
  if (live.length) out.push({ label: 'Live now', games: live })
  for (const g of games.filter((x) => !x.live)) {
    const label = dayLabel(g)
    const group = out.find((x) => x.label === label)
    if (group) group.games.push(g)
    else out.push({ label, games: [g] })
  }
  return out
}

export function teamRecord(game: SportsMarket, outcome: MarketOutcome): string | null {
  if (isGenerated(game)) return genRecord(game, outcome.label)
  if (game.sport !== 'nfl' || !game.eventId || !outcome.team) return null
  const r = nflRecords(game.eventId)
  if (!r) return null
  const [away] = game.outcomes
  return outcome.id === away?.id ? r.away : r.home
}

/** Who-wins outcomes without the draw (it still counts in the chance). */
export function teamOutcomes(game: SportsMarket): MarketOutcome[] {
  return game.outcomes.filter((o) => o.label !== 'Draw')
}

export function leadOutcome(game: SportsMarket): MarketOutcome {
  return game.outcomes.reduce((a, b) => (b.chance > a.chance ? b : a), game.outcomes[0]!)
}

const leagueNames = new Map<V5SportId, Set<string>>()

/** League page link when the league has games in that sport (logos and names on cards use this). */
export function leaguePageHref(sport: V5SportId | 'topic' | 'all' | undefined, name: string): string | undefined {
  if (sport === 'topic') return undefined
  const has = (id: V5SportId) => {
    let names = leagueNames.get(id)
    if (!names) {
      names = new Set(v5Leagues(id).map((l) => l.name))
      leagueNames.set(id, names)
    }
    return names.has(name)
  }
  if (sport && sport !== 'all' && has(sport)) return leagueHref(sport, name)
  /* Family-tagged cards (boosts) — find the one sport that owns this league. */
  const owners = V5_SPORTS.map((d) => d.id).filter(has)
  return owners.length === 1 ? leagueHref(owners[0]!, name) : undefined
}

export function leagueBySlug(sport: V5SportId, slug: string): V5League | undefined {
  return v5Leagues(sport).find((l) => leagueSlug(l.name) === slug)
}

// ─── Prices ──────────────────────────────────────────────────

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/** Yes share price (¢) — chance plus a one-cent spread, like the exchange. */
export function yesCents(chance: number): number {
  return clamp(Math.round(chance + 1), 1, 99)
}

export function noCents(chance: number): number {
  return clamp(Math.round(100 - chance + 1), 1, 99)
}

export function multiplierOf(cents: number): string {
  const x = 100 / clamp(cents, 1, 99)
  return `${x >= 10 ? x.toFixed(1) : x.toFixed(2)}x`
}

function parseAmerican(odds: string): number {
  const n = Number.parseFloat(odds.replace(/^\+/, ''))
  return Number.isFinite(n) ? n : -110
}

export function decimalOf(odds: string): number {
  const a = parseAmerican(odds)
  return a > 0 ? 1 + a / 100 : 1 + 100 / Math.abs(a)
}

export function fmtX(decimal: number): string {
  if (!Number.isFinite(decimal) || decimal <= 0) return '—'
  return `${decimal >= 100 ? Math.round(decimal) : decimal >= 10 ? decimal.toFixed(1) : decimal.toFixed(2)}x`
}

// ─── Picks (shared betslip store shape) ──────────────────────

export type ComboSide = 'yes' | 'no'

/** Who wins? Yes → that team to win. */
export function winnerYesPick(game: SportsMarket, outcome: MarketOutcome): SoccerSlipPick {
  const p = marketToSlipPick(game, outcome)
  return { ...p, odds: priceToAmerican(yesCents(outcome.chance)) }
}

/**
 * Who wins? No → two-way: the other side wins (same leg as their Yes).
 * Three-way soccer: double chance against that team.
 */
export function winnerNoPick(game: SportsMarket, outcome: MarketOutcome): SoccerSlipPick {
  const sides = teamOutcomes(game)
  if (game.outcomes.length === 2) {
    const other = sides.find((o) => o.id !== outcome.id)
    if (other) return winnerYesPick(game, other)
  }
  const base = marketToSlipPick(game, outcome)
  return {
    ...base,
    id: `${outcome.id}-no`,
    label: `${outcome.label} not to win`,
    market: 'Double Chance',
    odds: priceToAmerican(noCents(outcome.chance)),
  }
}

export function pickFor(game: SportsMarket, outcome: MarketOutcome, side: ComboSide): SoccerSlipPick {
  return side === 'yes' ? winnerYesPick(game, outcome) : winnerNoPick(game, outcome)
}

// ─── Spread + total ladders (stepper rows) ───────────────────

export type LadderKind = 'spread' | 'total'

export type LadderRung = {
  line: number
  chance: number
  change: number
  yes: SoccerSlipPick
  no: SoccerSlipPick
}

export type Ladder = {
  kind: LadderKind
  /** "CHI Bears win by over" / "Over" — the line number follows in the UI. */
  lead: string
  unit: string
  defaultIndex: number
  rungs: LadderRung[]
}

const logit = (p: number) => Math.log(p / (1 - p))
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x))

function rungChance(p0: number, main: number, line: number, slope: number): number {
  const p = clamp(p0 / 100, 0.02, 0.98)
  return clamp(sigmoid(logit(p) + (main - line) * slope) * 100, 1, 99)
}

/** Main line from the V3 binary title: "… win by 4+?" → 3.5, "45+ total points?" → 44.5. */
function mainLineFrom(title: string, fallback: number): number {
  const m = title.match(/(\d+(?:\.\d+)?)\+/)
  if (!m) return fallback
  return Number.parseFloat(m[1]!) - 0.5
}

function seeded(key: string): number {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1000) / 1000
}

export function eventLadders(game: SportsMarket): Ladder[] {
  if (isGenerated(game)) return genLadders(game)
  if (!game.eventId) return []
  const ev = marketEvent(game.sport, game.eventId)
  if (!ev) return []
  const nfl = game.sport === 'nfl'
  const unit = nfl ? 'points' : 'goals'
  const out: Ladder[] = []
  const lead = leadOutcome(game)
  const sides = teamOutcomes(game)
  const fav = lead.label === 'Draw' ? sides[0]! : lead
  const dog = sides.find((o) => o.id !== fav.id) ?? fav
  const favShort = fav.short || fav.label
  const dogShort = dog.short || dog.label

  const spread = ev.lines.find((l) => /win by/i.test(l.title))
  if (spread) {
    const main = mainLineFrom(spread.title, nfl ? 3.5 : 1.5)
    const p0 = spread.outcomes[0]?.chance ?? 45
    const steps = nfl ? [-3, -2, -1, 0, 1, 2, 3] : [-1, 0, 1, 2]
    const lines = steps.map((s) => main + s).filter((x) => x > 0)
    out.push({
      kind: 'spread',
      lead: `${fav.label} win by over`,
      unit,
      defaultIndex: Math.max(0, lines.indexOf(main)),
      rungs: lines.map((line) => {
        const chance = rungChance(p0, main, line, nfl ? 0.17 : 1.15)
        const change = Math.round((seeded(`${game.id}-sp-${line}`) - 0.5) * 12) / 2
        const id = `v5-${game.id}-sp-${line}`
        const base = {
          eventLabel: game.eventLabel,
          market: nfl ? 'Alternate Spread' : 'Handicap',
          eventId: game.eventId,
          eventHref: game.href,
          sport: game.sport,
          live: game.live,
        }
        return {
          line,
          chance,
          change,
          yes: { ...base, id: `${id}-yes`, label: `${favShort} -${line}`, odds: priceToAmerican(yesCents(chance)) },
          no: { ...base, id: `${id}-no`, label: `${dogShort} +${line}`, odds: priceToAmerican(noCents(chance)) },
        }
      }),
    })
  }

  const total = ev.lines.find((l) => /total points|goals in the match/i.test(l.title))
  if (total) {
    const main = mainLineFrom(total.title, nfl ? 44.5 : 2.5)
    const p0 = total.outcomes[0]?.chance ?? 50
    const steps = nfl ? [-6, -4, -2, -1, 0, 1, 2, 4, 6] : [-2, -1, 0, 1, 2]
    const lines = steps.map((s) => main + s).filter((x) => x > 0)
    out.push({
      kind: 'total',
      lead: 'Over',
      unit,
      defaultIndex: Math.max(0, lines.indexOf(main)),
      rungs: lines.map((line) => {
        const chance = rungChance(p0, main, line, nfl ? 0.09 : 1.05)
        const change = Math.round((seeded(`${game.id}-tot-${line}`) - 0.5) * 10) / 2
        const id = `v5-${game.id}-tot-${line}`
        const base = {
          eventLabel: game.eventLabel,
          market: nfl ? 'Alternate Total' : 'Total Goals',
          eventId: game.eventId,
          eventHref: game.href,
          sport: game.sport,
          live: game.live,
        }
        return {
          line,
          chance,
          change,
          yes: { ...base, id: `${id}-yes`, label: `Over ${line} ${unit}`, odds: priceToAmerican(yesCents(chance)) },
          no: { ...base, id: `${id}-no`, label: `Under ${line} ${unit}`, odds: priceToAmerican(noCents(chance)) },
        }
      }),
    })
  }
  return out
}

// ─── Combo maths ─────────────────────────────────────────────

/** Same-game legs are correlated — same haircut as the main betslip's SGP. */
const SGP_HAIRCUT = 0.82

export function comboDecimal(picks: SoccerSlipPick[]): number {
  if (picks.length === 0) return 0
  const groups = new Map<string, SoccerSlipPick[]>()
  for (const p of picks) {
    const key = p.eventId ?? p.eventLabel
    groups.set(key, [...(groups.get(key) ?? []), p])
  }
  let total = 1
  for (const legs of groups.values()) {
    const product = legs.reduce((acc, p) => acc * decimalOf(p.odds), 1)
    total *= legs.length > 1 ? 1 + (product - 1) * SGP_HAIRCUT : product
  }
  return total
}

export function decimalToAmerican(decimal: number): string {
  if (decimal >= 2) return `+${Math.round((decimal - 1) * 100)}`
  return `${Math.round(-100 / Math.max(0.01, decimal - 1))}`
}

export function comboType(picks: SoccerSlipPick[]): 'straight' | 'sgp' | 'parlay' {
  if (picks.length <= 1) return 'straight'
  const events = new Set(picks.map((p) => p.eventId ?? p.eventLabel))
  return events.size === 1 ? 'sgp' : 'parlay'
}

/** Rough "one more leg" preview — average leg price applied once more. */
export function nextLegDecimal(picks: SoccerSlipPick[]): number {
  if (picks.length === 0) return 0
  const avg = picks.reduce((a, p) => a + decimalOf(p.odds), 0) / picks.length
  return comboDecimal(picks) * avg
}

/** Toggle a leg in the slip: same id removes; same market on the same game swaps. */
export function toggleLeg(prev: SoccerSlipPick[], next: SoccerSlipPick): SoccerSlipPick[] {
  if (prev.some((p) => p.id === next.id)) return prev.filter((p) => p.id !== next.id)
  const sameMarket = (p: SoccerSlipPick) =>
    (p.eventId ?? p.eventLabel) === (next.eventId ?? next.eventLabel) &&
    marketFamily(p) === marketFamily(next)
  const at = prev.findIndex(sameMarket)
  if (at === -1) return [...prev, next]
  return prev.map((p, i) => (i === at ? next : p)).filter((p, i) => i === at || !sameMarket(p))
}

function marketFamily(p: SoccerSlipPick): string {
  if (/spread|handicap/i.test(p.market)) return 'spread'
  if (/total/i.test(p.market)) return 'total'
  if (/double chance|moneyline|3-way|regulation|winner/i.test(p.market)) return 'winner'
  return p.market
}

// ─── Featured combos ─────────────────────────────────────────

export type FeaturedCombo = {
  id: string
  /** Which sport page shows it ('mixed' = home only). */
  sport?: V5SportId | 'mixed'
  title: string
  league: string
  leagueLogo: string
  legs: SoccerSlipPick[]
  decimal: number
  volume: number
  bettors: number
}

function featured(
  id: string,
  title: string,
  league: string,
  legs: SoccerSlipPick[],
  sport?: V5SportId | 'mixed',
  logo?: string,
): FeaturedCombo | null {
  if (legs.length < 2) return null
  const r = seeded(id)
  return {
    id,
    sport,
    title,
    league,
    leagueLogo: leagueLogo(league, logo),
    legs,
    decimal: comboDecimal(legs),
    volume: Math.round(180_000 + r * 2_600_000),
    bettors: Math.round(320 + r * 2_400),
  }
}

let featuredCache: FeaturedCombo[] | null = null

export function featuredCombos(sport: V5Sport = 'all'): FeaturedCombo[] {
  if (!featuredCache) {
    const nfl = v5Games('nfl').filter((g) => g.leagueName === 'NFL')
    const soccer = v5Games('soccer').filter((g) => !isGenerated(g))
    const favs = (games: SportsMarket[], n: number) =>
      games.slice(0, n).map((g) => winnerYesPick(g, leadOutcome(g).label === 'Draw' ? teamOutcomes(g)[0]! : leadOutcome(g)))
    const dogs = (games: SportsMarket[], n: number) =>
      games.slice(0, n).map((g) => {
        const sides = teamOutcomes(g)
        const dog = sides.reduce((a, b) => (b.chance < a.chance ? b : a), sides[0]!)
        return winnerYesPick(g, dog)
      })
    const overs = (games: SportsMarket[], n: number) =>
      games
        .map((g) => eventLadders(g).find((l) => l.kind === 'total'))
        .filter((l): l is Ladder => !!l)
        .slice(0, n)
        .map((l) => l.rungs[l.defaultIndex]!.yes)
    const prem = soccer.filter((g) => g.leagueName === 'Premier League')
    const perSport = V5_SPORTS.filter((d) => d.id !== 'nfl' && d.id !== 'soccer').flatMap((d) => {
      const games = v5Games(d.id).filter((g) => !g.live)
      const first = games[0]
      if (!first) return []
      const title = (s: string) => `${d.label} ${s}`
      return [
        featured(`fc-${d.id}-favs`, title('favourites'), first.leagueName, favs(games, 4), d.id, first.leagueIcon),
        d.format === 'field' ? null : featured(`fc-${d.id}-dogs`, title('upsets'), first.leagueName, dogs(games.slice(1), 3), d.id, first.leagueIcon),
        featured(`fc-${d.id}-overs`, `${d.label} · overs`, first.leagueName, overs(games, 4), d.id, first.leagueIcon),
      ]
    })
    const extraSoccer = v5Games('soccer').filter((g) => isGenerated(g) && !g.live)
    featuredCache = [
      featured('fc-nfl-favs', 'Sunday favourites', 'NFL', favs(nfl, 5), 'nfl'),
      featured('fc-prem-sweep', 'Weekend winners', 'Premier League', favs(prem.length > 2 ? prem : soccer, 4), 'soccer'),
      featured('fc-nfl-dogs', 'Underdog Sunday', 'NFL', dogs(nfl, 3), 'nfl'),
      featured('fc-goals', 'Goals galore', 'Premier League', overs(prem.length > 2 ? prem : soccer, 4), 'soccer'),
      featured('fc-points', 'Points party', 'NFL', overs(nfl, 4), 'nfl'),
      featured('fc-euro-tour', 'European tour', 'Serie A', favs(extraSoccer, 5), 'soccer', extraSoccer[0]?.leagueIcon),
      featured('fc-mixed', 'Cross-sport combo', 'UEFA Champions League', [
        ...favs(soccer.filter((g) => /Champions/.test(g.leagueName)), 2),
        ...favs(nfl.slice(2), 2),
      ], 'mixed'),
      featured('fc-all-sports', 'Around the world', 'NBA', [
        ...favs(v5Games('basketball').filter((g) => !g.live), 1),
        ...favs(v5Games('hockey').filter((g) => !g.live), 1),
        ...favs(v5Games('tennis').filter((g) => !g.live), 1),
        ...favs(extraSoccer, 1),
      ], 'mixed', '/leagues/basketball/usa/nba.svg'),
      ...perSport,
    ].filter((x): x is FeaturedCombo => !!x)
  }
  if (sport === 'all') return featuredCache.filter((c) => c.sport === 'mixed' || c.sport === 'nfl' || c.sport === 'soccer' || c.id.endsWith('-favs'))
  return featuredCache.filter((c) => c.sport === sport)
}

// ─── Social proof (demo) ─────────────────────────────────────

/** Demo handles — no real people. */
const HANDLES = [
  'CH',
  'Lilly',
  'Sam',
  'NEK',
  'Victor',
  'Mai',
  'parlay_king',
  'night_owl',
  'underdog21',
  'goal.rush',
  'blitz',
  'zeta',
  'redzone',
  'top_bins',
  'clutch',
  'hat.trick',
]

const AMOUNTS = [5, 5, 10, 10, 10, 20, 25, 25, 50, 50, 75, 100, 150, 250]

export type LiveBet = {
  key: string
  who: string
  /** Team or line the bet backs. */
  pick: string
  side: ComboSide
  amount: number
  multiplier: string
  /** Part of an N-leg combo, or 0 for a single. */
  comboLegs: number
  big: boolean
  at: number
}

let counter = 0

/** Next live bet on this game — favourites get most of the money, the odd whale lands. */
export function nextLiveBet(game: SportsMarket, rnd: () => number = Math.random): LiveBet {
  const sides = game.outcomes
  let roll = rnd() * 100
  let outcome = sides[0]!
  for (const o of sides) {
    roll -= o.chance
    if (roll <= 0) {
      outcome = o
      break
    }
  }
  const whale = rnd() < 0.06
  const amount = whale
    ? [500, 750, 1000, 2500][Math.floor(rnd() * 4)]!
    : AMOUNTS[Math.floor(rnd() * AMOUNTS.length)]!
  const side: ComboSide = rnd() < 0.86 ? 'yes' : 'no'
  const cents = side === 'yes' ? yesCents(outcome.chance) : noCents(outcome.chance)
  const comboLegs = rnd() < 0.34 ? 2 + Math.floor(rnd() * 5) : 0
  counter += 1
  return {
    key: `${game.id}-${Date.now()}-${counter}`,
    who: HANDLES[Math.floor(rnd() * HANDLES.length)]!,
    pick: outcome.label === 'Draw' ? 'Draw' : outcome.label,
    side,
    amount,
    multiplier: multiplierOf(cents),
    comboLegs,
    big: whale,
    at: Date.now(),
  }
}

/** Seed a few recent bets so the feed never starts empty. */
export function seedLiveBets(game: SportsMarket, n = 6): LiveBet[] {
  let s = Math.floor(seeded(`${game.id}-feed`) * 1e6) || 1
  const rnd = () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 100000) / 100000
  }
  const now = Date.now()
  return Array.from({ length: n }, (_, i) => ({ ...nextLiveBet(game, rnd), at: now - (i + 1) * 7_000 }))
}

export function bettorsNow(game: SportsMarket): number {
  return Math.round((game.live ? 140 : 24) + seeded(`${game.id}-now`) * (game.live ? 420 : 160))
}

export function agoLabel(at: number, now: number): string {
  const s = Math.max(0, Math.round((now - at) / 1000))
  if (s < 3) return 'now'
  if (s < 60) return `${s}s`
  return `${Math.round(s / 60)}m`
}

// ─── Combo builder open state ────────────────────────────────

let builderOpen = false
let builderSport: V5Sport = 'all'
const builderListeners = new Set<() => void>()

export function openComboBuilder(sport: V5Sport = 'all') {
  builderOpen = true
  builderSport = sport
  builderListeners.forEach((fn) => fn())
}

export function closeComboBuilder() {
  builderOpen = false
  builderListeners.forEach((fn) => fn())
}

/* Pages that render the builder overlay register here — shell chrome (the sports sub-nav) opens it in
 * place when there's a host, otherwise it sends the player to Sports with ?combo=1. */
let builderHosts = 0
export function registerComboBuilderHost(): () => void {
  builderHosts += 1
  return () => {
    builderHosts -= 1
  }
}
export function comboBuilderHosted(): boolean {
  return builderHosts > 0
}

function subscribeBuilder(fn: () => void) {
  builderListeners.add(fn)
  return () => {
    builderListeners.delete(fn)
  }
}

export function useComboBuilder(): { open: boolean; sport: V5Sport } {
  const open = useSyncExternalStore(
    subscribeBuilder,
    () => builderOpen,
    () => false,
  )
  return { open, sport: builderSport }
}
