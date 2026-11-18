/**
 * Soccer event view seed — markets, live tracker, pre-match form.
 * Prices come from one Poisson model off the board's 3-way + total so every market agrees.
 * American lines only, half / whole points (no Asian quarter lines).
 */
import {
  SOCCER_GAME_SECTIONS,
  americanToProb,
  probToAmerican,
  type SoccerEvent,
  type SoccerLeagueSection,
  type SoccerLinePair,
  type SoccerOdds,
} from '@/lib/lumen/soccer-sport'
import type {
  EventLive,
  EventMarket,
  GridMarket,
  LadderMarket,
  ListMarket,
  PlayerLinesMarket,
  PlayersMarket,
  RowMarket,
  ScoreMarket,
  SportsEventModel,
  TrackerBeat,
} from '@/lib/lumen/sports-event'

export type SoccerMarketTab = 'popular' | 'goals' | 'halves' | 'corners' | 'cards' | 'players'

export const SOCCER_MARKET_TABS: { id: SoccerMarketTab; label: string }[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'goals', label: 'Goals' },
  { id: 'halves', label: 'Halves' },
  { id: 'corners', label: 'Corners' },
  { id: 'cards', label: 'Cards' },
  { id: 'players', label: 'Players' },
]

export type SoccerRowMarket = RowMarket
export type SoccerLadderMarket = LadderMarket
export type SoccerGridMarket = GridMarket
export type SoccerPlayersMarket = PlayersMarket
export type SoccerEventMarket = EventMarket

export type SoccerIncident = {
  minute: number
  label: string
  side: 'home' | 'away'
  kind: 'goal' | 'yellow' | 'red' | 'sub'
  player: string
  /** Score after a goal. */
  score?: [number, number]
}

export type SoccerLiveStats = {
  possession: [number, number]
  shots: [number, number]
  onTarget: [number, number]
  corners: [number, number]
  yellows: [number, number]
  fouls: [number, number]
  dangerousAttacks: [number, number]
}

export type SoccerFormResult = 'W' | 'D' | 'L'

export type SoccerMatchInfo = {
  venue: string
  homeForm: SoccerFormResult[]
  awayForm: SoccerFormResult[]
  h2h: { date: string; home: string; away: string; score: [number, number] }[]
  /** No-vig 3-way from the board price. */
  winProb: [number, number, number]
}

// ─── Seeds ────────────────────────────────────────────────────

const ROSTERS: Record<string, string[]> = {
  'Coventry City': ['Haji Wright', 'Ellis Simms', 'Jack Rudoni', 'Brandon Thomas-Asante'],
  'Brighton & Hove Albion': ['Danny Welbeck', 'Kaoru Mitoma', 'Georginio Rutter', 'Yankuba Minteh'],
  'Manchester United': ['Bryan Mbeumo', 'Benjamin Šeško', 'Matheus Cunha', 'Bruno Fernandes'],
  'Manchester City': ['Erling Haaland', 'Omar Marmoush', 'Phil Foden', 'Jérémy Doku'],
  'Leeds United': ['Dominic Calvert-Lewin', 'Joël Piroe', 'Noah Okafor', 'Lukas Nmecha'],
  'Newcastle United': ['Nick Woltemade', 'Anthony Gordon', 'Harvey Barnes', 'Bruno Guimarães'],
  Brentford: ['Igor Thiago', 'Kevin Schade', 'Dango Ouattara', 'Mikkel Damsgaard'],
  Chelsea: ['João Pedro', 'Cole Palmer', 'Liam Delap', 'Pedro Neto'],
  'Tottenham Hotspur': ['Dominic Solanke', 'Richarlison', 'Mohammed Kudus', 'Xavi Simons'],
  'Aston Villa': ['Ollie Watkins', 'Morgan Rogers', 'John McGinn', 'Jadon Sancho'],
  'Leicester City': ['Jordan Ayew', 'Stephy Mavididi', 'Bilal El Khannouss', 'Patson Daka'],
  'Norwich City': ['Josh Sargent', 'Borja Sainz', 'Ante Crnac', 'Marcelino Núñez'],
  Southampton: ['Adam Armstrong', 'Cameron Archer', 'Ross Stewart', 'Ryan Fraser'],
  'Ipswich Town': ['George Hirst', 'Jack Clarke', 'Sammie Szmodics', 'Chuba Akpom'],
  'Real Madrid': ['Kylian Mbappé', 'Vinícius Júnior', 'Jude Bellingham', 'Rodrygo'],
  Barcelona: ['Robert Lewandowski', 'Lamine Yamal', 'Raphinha', 'Ferran Torres'],
  'Atlético Madrid': [
    'Julián Álvarez',
    'Alexander Sørloth',
    'Antoine Griezmann',
    'Giuliano Simeone',
  ],
  Sevilla: ['Isaac Romero', 'Akor Adams', 'Rubén Vargas', 'Alexis Sánchez'],
  Villarreal: ['Gerard Moreno', 'Ayoze Pérez', 'Nicolas Pépé', 'Tajon Buchanan'],
  'Real Betis': ['Cucho Hernández', 'Antony', 'Isco', 'Abde Ezzalzouli'],
}

const VENUES: Record<string, string> = {
  'Coventry City': 'Coventry Building Society Arena',
  'Manchester United': 'Old Trafford',
  'Leeds United': 'Elland Road',
  Brentford: 'Gtech Community Stadium',
  'Tottenham Hotspur': 'Tottenham Hotspur Stadium',
  'Leicester City': 'King Power Stadium',
  Southampton: "St Mary's Stadium",
  'Real Madrid': 'Santiago Bernabéu',
  'Atlético Madrid': 'Riyadh Air Metropolitano',
  Villarreal: 'Estadio de la Cerámica',
}

/** Live seed for Coventry v Brighton (board: 45+2', 1-1). */
const LIVE_SEED: Record<string, { incidents: SoccerIncident[]; stats: SoccerLiveStats }> = {
  'cov-bri': {
    incidents: [
      { minute: 12, label: "12'", side: 'away', kind: 'yellow', player: 'Yankuba Minteh' },
      {
        minute: 23,
        label: "23'",
        side: 'home',
        kind: 'goal',
        player: 'Haji Wright',
        score: [1, 0],
      },
      { minute: 31, label: "31'", side: 'home', kind: 'yellow', player: 'Jack Rudoni' },
      {
        minute: 38,
        label: "38'",
        side: 'away',
        kind: 'goal',
        player: 'Danny Welbeck',
        score: [1, 1],
      },
      { minute: 45, label: "45+1'", side: 'away', kind: 'yellow', player: 'Georginio Rutter' },
    ],
    stats: {
      possession: [44, 56],
      shots: [6, 9],
      onTarget: [3, 4],
      corners: [2, 5],
      yellows: [1, 2],
      fouls: [7, 5],
      dangerousAttacks: [21, 29],
    },
  },
}

// ─── Model ────────────────────────────────────────────────────

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Deterministic 0..1 for a seed string. */
function rand(seed: string): number {
  return (hash(seed) % 10_000) / 10_000
}

const MARGIN = 1.05

/** Fair probability → American price with book margin, clamped to a sane range. */
function price(p: number): string {
  return probToAmerican(Math.min(0.94, Math.max(0.03, p * MARGIN)))
}

function poisson(k: number, lambda: number): number {
  let f = 1
  for (let i = 2; i <= k; i++) f *= i
  return (Math.exp(-lambda) * lambda ** k) / f
}

function parse(odds: string): number {
  return Number.parseInt(odds.replace(/^\+/, ''), 10)
}

/** Fair over probability on a count with mean `mean` (Poisson, half or whole line). */
function overProb(mean: number, line: number): number {
  let under = 0
  for (let k = 0; k <= Math.floor(line); k++) under += poisson(k, mean)
  /* Whole line — exact hit is a push; price the over on the non-push mass. */
  if (Number.isInteger(line)) {
    const push = poisson(line, mean)
    return (1 - under) / Math.max(0.01, 1 - push)
  }
  return 1 - under
}

function fmtLine(n: number): string {
  return String(Math.round(n * 100) / 100)
}

function lineKey(n: number): string {
  return fmtLine(n).replace('.', '_')
}

type Model = {
  lh: number
  la: number
  winProb: [number, number, number]
  total: number
}

function modelFor(event: SoccerEvent): Model {
  const base = event.desktopPicks ?? event.picks
  const raw = base.slice(0, 3).map((p) => americanToProb(parse(p.odds)))
  const sum = raw.reduce((a, b) => a + b, 0) || 1
  const [ph, pd, pa] = raw.map((p) => p / sum) as [number, number, number]
  const total = (event.defaultTotalLine ?? 2.5) + 0.15
  const tilt = Math.max(-0.35, Math.min(0.35, (ph - pa) * 0.7))
  return {
    lh: total * (0.5 + tilt / 2),
    la: total * (0.5 - tilt / 2),
    winProb: [ph, pd, pa],
    total,
  }
}

function ladder(
  prefix: string,
  lines: number[],
  mean: number,
  labels: (line: number) => [string, string],
): SoccerLinePair[] {
  return lines.map((line) => {
    const p = Math.min(0.97, Math.max(0.03, overProb(mean, line)))
    const [la, lb] = labels(line)
    return {
      line,
      a: { id: `${prefix}-o-${lineKey(line)}`, label: la, odds: price(p) },
      b: { id: `${prefix}-u-${lineKey(line)}`, label: lb, odds: price(1 - p) },
    }
  })
}

const ouLabels = (line: number): [string, string] => [`O ${fmtLine(line)}`, `U ${fmtLine(line)}`]

function scoreMatrix(lh: number, la: number, max = 6): number[][] {
  return Array.from({ length: max + 1 }, (_, h) =>
    Array.from({ length: max + 1 }, (_, a) => poisson(h, lh) * poisson(a, la)),
  )
}

function threeWay(lh: number, la: number): [number, number, number] {
  const m = scoreMatrix(lh, la)
  let h = 0
  let d = 0
  let a = 0
  m.forEach((row, i) =>
    row.forEach((p, j) => {
      if (i > j) h += p
      else if (i === j) d += p
      else a += p
    }),
  )
  const s = h + d + a
  return [h / s, d / s, a / s]
}

function rosterFor(team: string): string[] {
  return ROSTERS[team] ?? ['Striker', 'Winger', 'Midfielder', 'Forward']
}

// ─── Lookup ───────────────────────────────────────────────────

export function findSoccerEvent(
  id: string,
): { event: SoccerEvent; section: SoccerLeagueSection } | null {
  for (const section of SOCCER_GAME_SECTIONS) {
    const event = section.events.find((e) => e.id === id)
    if (event) return { event, section }
  }
  return null
}

export function soccerEventHref(id: string): string {
  return `/sports/soccer/event/${id}`
}

export function soccerEventLabel(event: SoccerEvent): string {
  return `${event.home} vs ${event.away}`
}

// ─── Markets ──────────────────────────────────────────────────

export function buildSoccerEventMarkets(event: SoccerEvent): SoccerEventMarket[] {
  const m = modelFor(event)
  const id = event.id
  const base = event.desktopPicks ?? event.picks
  const [homeShort, awayShort] = [event.homeAbbr, event.awayAbbr]
  const live = !!event.live
  const scored = event.score ?? [0, 0]
  /* Live — remaining expected goals for roughly the second half. */
  const remain = live ? 0.55 : 1
  const rh = m.lh * remain
  const ra = m.la * remain

  const threeWayReg: SoccerRowMarket = {
    id: 'ml',
    kind: 'row',
    name: '3-Way Regulation',
    tabs: ['popular'],
    cells: base.slice(0, 3),
  }

  const spread: SoccerLadderMarket = {
    id: 'spread',
    kind: 'ladder',
    name: 'Spread',
    tabs: ['popular'],
    columns: [
      { label: event.home, team: event.home },
      { label: event.away, team: event.away },
    ],
    rows: [...(event.spreadLines ?? [])].reverse(),
    mainLine: event.defaultSpreadLine ?? 0,
    altTitle: 'Spreads',
  }

  const total: SoccerLadderMarket = {
    id: 'total',
    kind: 'ladder',
    name: 'Total',
    tabs: ['popular', 'goals'],
    columns: [{ label: 'Over' }, { label: 'Under' }],
    rows: event.totalLines ?? [],
    mainLine: event.defaultTotalLine ?? 2.5,
    altTitle: 'Total goals',
  }

  const pBtts = live
    ? scored[0] > 0 && scored[1] > 0
      ? 0.97
      : 1 - Math.exp(-(scored[0] > 0 ? ra : rh))
    : (1 - Math.exp(-m.lh)) * (1 - Math.exp(-m.la))
  const btts: SoccerRowMarket = {
    id: 'btts',
    kind: 'row',
    name: 'Both Teams to Score',
    tabs: ['popular', 'goals'],
    cells: [
      { id: `${id}-btts-y`, label: 'Yes', odds: price(pBtts) },
      { id: `${id}-btts-n`, label: 'No', odds: price(1 - pBtts) },
    ],
  }

  const [ph, pd, pa] = m.winProb
  const doubleChance: SoccerRowMarket = {
    id: 'dc',
    kind: 'row',
    name: 'Double Chance',
    tabs: ['popular'],
    cells: [
      { id: `${id}-dc-1x`, label: `${homeShort} or TIE`, odds: price(ph + pd) },
      { id: `${id}-dc-12`, label: `${homeShort} or ${awayShort}`, odds: price(ph + pa) },
      { id: `${id}-dc-x2`, label: `TIE or ${awayShort}`, odds: price(pd + pa) },
    ],
  }

  const dnb: SoccerRowMarket = {
    id: 'dnb',
    kind: 'row',
    name: 'Draw No Bet',
    tabs: ['popular'],
    cells: [
      { id: `${id}-dnb-h`, label: homeShort, odds: price(ph / (ph + pa)) },
      { id: `${id}-dnb-a`, label: awayShort, odds: price(pa / (ph + pa)) },
    ],
  }

  const firstHalf: SoccerRowMarket = {
    id: '1h-ml',
    kind: 'row',
    name: '1H Moneyline',
    tabs: ['popular', 'halves'],
    cells: base.slice(7, 10),
  }

  /* Live-only — next goal + rest of match on what's left of the game. */
  const nextGoal: SoccerRowMarket | null = live
    ? (() => {
        const none = Math.exp(-(rh + ra))
        const share = rh / (rh + ra)
        return {
          id: 'next-goal',
          kind: 'row',
          name: `Next Goal (Goal ${scored[0] + scored[1] + 1})`,
          tabs: ['popular', 'goals'],
          live: true,
          cells: [
            { id: `${id}-ng-h`, label: homeShort, odds: price((1 - none) * share) },
            { id: `${id}-ng-n`, label: 'No Goal', odds: price(none) },
            { id: `${id}-ng-a`, label: awayShort, odds: price((1 - none) * (1 - share)) },
          ],
        }
      })()
    : null

  const restOfMatch: SoccerRowMarket | null = live
    ? (() => {
        const [h, d, a] = threeWay(rh, ra)
        return {
          id: 'rest',
          kind: 'row',
          name: 'Rest of Match',
          tabs: ['popular'],
          live: true,
          cells: [
            { id: `${id}-rom-h`, label: homeShort, odds: price(h) },
            { id: `${id}-rom-d`, label: 'TIE', odds: price(d) },
            { id: `${id}-rom-a`, label: awayShort, odds: price(a) },
          ],
        }
      })()
    : null

  /* Final-score matrix — live adds what's left of the game onto the current score. */
  const CS_MAX = 6
  const [sh0, sa0] = live ? scored : [0, 0]
  const rest = scoreMatrix(live ? rh : m.lh, live ? ra : m.la, CS_MAX)
  const finalP = (h: number, a: number) =>
    h < sh0 || a < sa0 ? 0 : (rest[h - sh0]?.[a - sa0] ?? 0)
  const scoreCell = (h: number, a: number): SoccerOdds => ({
    id: `${id}-cs-${h}-${a}`,
    label: `${h}-${a}`,
    odds: price(finalP(h, a)),
  })
  const csCells = Array.from({ length: CS_MAX }, (_, h) =>
    Array.from({ length: CS_MAX }, (_, a) =>
      h < sh0 || a < sa0 || finalP(h, a) < 0.002 ? null : scoreCell(h, a),
    ),
  )
  let csStart: [number, number] = [sh0, sa0]
  csCells.forEach((row, h) =>
    row.forEach((c, a) => {
      if (c && finalP(h, a) > finalP(csStart[0], csStart[1])) csStart = [h, a]
    }),
  )
  const covered = csCells.flat().reduce((s, c) => {
    if (!c) return s
    const [h, a] = c.label.split('-').map(Number) as [number, number]
    return s + finalP(h, a)
  }, 0)
  const gridCell = (h: number, a: number): SoccerOdds | null =>
    h < sh0 || a < sa0 ? null : scoreCell(h, a)
  const correctScore: ScoreMarket = {
    id: 'cs',
    kind: 'score',
    name: 'Correct Score',
    tabs: ['popular', 'goals'],
    cells: csCells,
    min: [sh0, sa0],
    start: csStart,
    other: {
      id: `${id}-cs-other`,
      label: 'Any other score',
      odds: price(Math.max(0.01, 1 - covered)),
    },
    grid: [
      {
        label: event.home,
        team: event.home,
        cells: [
          [1, 0],
          [2, 0],
          [2, 1],
          [3, 0],
          [3, 1],
          [3, 2],
        ]
          .map(([h, a]) => gridCell(h!, a!))
          .filter((c): c is SoccerOdds => !!c),
      },
      {
        label: 'Tie',
        cells: [
          [0, 0],
          [1, 1],
          [2, 2],
          [3, 3],
        ]
          .map(([h, a]) => gridCell(h!, a!))
          .filter((c): c is SoccerOdds => !!c),
      },
      {
        label: event.away,
        team: event.away,
        cells: [
          [0, 1],
          [0, 2],
          [1, 2],
          [0, 3],
          [1, 3],
          [2, 3],
        ]
          .map(([h, a]) => gridCell(h!, a!))
          .filter((c): c is SoccerOdds => !!c),
      },
    ],
  }

  const tMean = m.lh + m.la
  const exactGoals: SoccerRowMarket = {
    id: 'exact',
    kind: 'row',
    name: 'Exact Total Goals',
    tabs: ['goals'],
    cells: [0, 1, 2, 3, 4]
      .map((k) => ({
        id: `${id}-eg-${k}`,
        label: `${k}`,
        odds: price(poisson(k, tMean)),
      }))
      .concat({
        id: `${id}-eg-5p`,
        label: '5+',
        odds: price(1 - [0, 1, 2, 3, 4].reduce((s, k) => s + poisson(k, tMean), 0)),
      }),
  }

  /* Halves */
  const h1 = 0.45
  const firstHalfTotal: SoccerLadderMarket = {
    id: '1h-total',
    kind: 'ladder',
    name: '1H Total',
    tabs: ['halves'],
    columns: [{ label: 'Over' }, { label: 'Under' }],
    rows: ladder(`${id}-1ht`, [0.5, 1, 1.5, 2.5], tMean * h1, ouLabels),
    mainLine: 1,
    altTitle: 'Goals',
  }
  const [sh, sd, sa] = threeWay(m.lh * (1 - h1), m.la * (1 - h1))
  const secondHalf: SoccerRowMarket = {
    id: '2h-ml',
    kind: 'row',
    name: '2H Moneyline',
    tabs: ['halves'],
    cells: [
      { id: `${id}-2h-h`, label: homeShort, odds: price(sh) },
      { id: `${id}-2h-d`, label: 'TIE', odds: price(sd) },
      { id: `${id}-2h-a`, label: awayShort, odds: price(sa) },
    ],
  }
  const ht = threeWay(m.lh * h1, m.la * h1)
  const ft = m.winProb
  const htft = (() => {
    const keys = ['H', 'D', 'A'] as const
    const raw = keys.flatMap((x, i) =>
      keys.map((y, j) => ({ x, y, p: ht[i]! * ft[j]! * (i === j ? 1.7 : 0.65) })),
    )
    const s = raw.reduce((a, b) => a + b.p, 0)
    const name = (k: 'H' | 'D' | 'A') => (k === 'H' ? homeShort : k === 'A' ? awayShort : 'TIE')
    return keys.map((x) => ({
      label: x === 'H' ? event.home : x === 'A' ? event.away : 'Tie',
      team: x === 'H' ? event.home : x === 'A' ? event.away : undefined,
      cells: raw
        .filter((r) => r.x === x)
        .map((r) => ({
          id: `${id}-htft-${r.x}${r.y}`,
          label: `${name(r.x)} / ${name(r.y)}`,
          odds: price(r.p / s),
        })),
    }))
  })()
  const htftMarket: SoccerGridMarket = {
    id: 'htft',
    kind: 'grid',
    name: 'Halftime / Fulltime',
    tabs: ['halves'],
    columns: htft,
  }

  /* Corners + cards — means vary a touch per fixture. */
  const cMean = 9.6 + rand(`${id}-c`) * 1.8
  const cardMean = 3.8 + rand(`${id}-k`) * 1.2
  const corners: SoccerLadderMarket = {
    id: 'corners',
    kind: 'ladder',
    name: 'Total Corners',
    tabs: ['corners'],
    columns: [{ label: 'Over' }, { label: 'Under' }],
    rows: ladder(`${id}-tc`, [7.5, 8.5, 9.5, 10.5, 11.5, 12.5], cMean, ouLabels),
    mainLine: 10.5,
    altTitle: 'Corners',
  }
  const cornerShare = 0.5 + (ph - pa) * 0.3
  const mostCorners: SoccerRowMarket = {
    id: 'most-corners',
    kind: 'row',
    name: 'Most Corners',
    tabs: ['corners'],
    cells: [
      { id: `${id}-mc-h`, label: homeShort, odds: price(cornerShare * 0.88) },
      { id: `${id}-mc-d`, label: 'TIE', odds: price(0.12) },
      { id: `${id}-mc-a`, label: awayShort, odds: price((1 - cornerShare) * 0.88) },
    ],
  }
  const firstHalfCorners: SoccerLadderMarket = {
    id: '1h-corners',
    kind: 'ladder',
    name: '1H Total Corners',
    tabs: ['corners'],
    columns: [{ label: 'Over' }, { label: 'Under' }],
    rows: ladder(`${id}-1hc`, [3.5, 4.5, 5.5], cMean * 0.46, ouLabels),
    mainLine: 4.5,
    altTitle: 'Corners',
  }
  const cards: SoccerLadderMarket = {
    id: 'cards',
    kind: 'ladder',
    name: 'Total Cards',
    tabs: ['cards'],
    columns: [{ label: 'Over' }, { label: 'Under' }],
    rows: ladder(`${id}-tk`, [2.5, 3.5, 4.5, 5.5, 6.5], cardMean, ouLabels),
    mainLine: 4.5,
    altTitle: 'Cards',
  }
  const mostCards: SoccerRowMarket = {
    id: 'most-cards',
    kind: 'row',
    name: 'Most Cards',
    tabs: ['cards'],
    cells: [
      { id: `${id}-mk-h`, label: homeShort, odds: price(0.38) },
      { id: `${id}-mk-d`, label: 'TIE', odds: price(0.24) },
      { id: `${id}-mk-a`, label: awayShort, odds: price(0.38) },
    ],
  }
  const redCard: SoccerRowMarket = {
    id: 'red',
    kind: 'row',
    name: 'Red Card Shown',
    tabs: ['cards'],
    cells: [
      { id: `${id}-rc-y`, label: 'Yes', odds: price(0.17) },
      { id: `${id}-rc-n`, label: 'No', odds: price(0.83) },
    ],
  }

  /* Players — goal share by squad role. */
  const WEIGHTS = [0.36, 0.24, 0.17, 0.12]
  const players = (
    marketId: string,
    columns: string[],
    probs: (x: number, teamMean: number) => number[],
  ) =>
    [
      { name: event.home, abbr: homeShort, mean: m.lh },
      { name: event.away, abbr: awayShort, mean: m.la },
    ].map((t) => ({
      name: t.name,
      abbr: t.abbr,
      players: rosterFor(t.name).map((player, i) => {
        const x = t.mean * (WEIGHTS[i] ?? 0.1)
        const ps = probs(x, t.mean)
        return {
          id: `${id}-${marketId}-${hash(player).toString(36)}`,
          name: player,
          cells: ps.map((p, c) => ({
            id: `${id}-${marketId}-${hash(player).toString(36)}-${c}`,
            label: columns[c]!,
            odds: price(p),
          })),
        }
      }),
    }))

  const goalscorers: SoccerPlayersMarket = {
    id: 'scorers',
    kind: 'players',
    name: 'Goalscorers',
    tabs: ['popular', 'players'],
    columns: ['First', 'Anytime', '2+'],
    teams: players('gs', ['First', 'Anytime', '2+'], (x) => [
      (x / tMean) * (1 - Math.exp(-tMean)),
      1 - Math.exp(-x),
      1 - Math.exp(-x) * (1 + x),
    ]),
  }
  const shotsOnTarget: SoccerPlayersMarket = {
    id: 'sot',
    kind: 'players',
    name: 'Player Shots on Target',
    tabs: ['players'],
    columns: ['1+', '2+', '3+'],
    teams: players('sot', ['1+', '2+', '3+'], (x) => {
      const s = x * 3.2
      return [
        1 - Math.exp(-s),
        1 - Math.exp(-s) * (1 + s),
        1 - Math.exp(-s) * (1 + s + (s * s) / 2),
      ]
    }),
  }
  const booked: SoccerPlayersMarket = {
    id: 'booked',
    kind: 'players',
    name: 'Player to be Carded',
    tabs: ['cards', 'players'],
    columns: ['Carded'],
    teams: players('bk', ['Carded'], (_x) => [0.12 + rand(`${_x}`) * 0.12]),
  }

  /* Margin distribution on the final score (live: what's left + current lead). */
  const lead = live ? scored[0] - scored[1] : 0
  const marginMatrix = scoreMatrix(live ? rh : m.lh, live ? ra : m.la)
  const marginP = (k: number) => {
    let p = 0
    marginMatrix.forEach((row, h) =>
      row.forEach((v, a) => {
        if (h - a + lead === k) p += v
      }),
    )
    return p
  }
  const marginCdf = (pred: (k: number) => boolean) => {
    let p = 0
    for (let k = -12; k <= 12; k++) if (pred(k)) p += marginP(k)
    return p
  }
  const signed = (n: number) => (n === 0 ? 'PK' : n > 0 ? `+${fmtLine(n)}` : fmtLine(n))

  const AH_LINES = [-1.5, -1, -0.5, 0, 0.5, 1, 1.5]
  const asianHandicap: ListMarket = {
    id: 'ah',
    kind: 'list',
    name: 'Asian Handicap',
    tabs: ['popular', 'goals'],
    preview: 7,
    groups: [
      {
        columns: [
          { label: event.home, team: event.home },
          { label: event.away, team: event.away },
        ],
        rows: AH_LINES.map((h) => {
          const win = marginCdf((k) => k + h > 0)
          const push = marginCdf((k) => k + h === 0)
          const pHome = win / Math.max(0.01, 1 - push)
          return [
            {
              id: `${id}-ah-h-${lineKey(h)}`,
              label: signed(h),
              odds: price(pHome),
              slipLabel: `${event.home} ${signed(h)}`,
            },
            {
              id: `${id}-ah-a-${lineKey(h)}`,
              label: signed(-h),
              odds: price(1 - pHome),
              slipLabel: `${event.away} ${signed(-h)}`,
            },
          ]
        }),
      },
    ],
  }

  const GS_LINES = [-2, -1, 1, 2, 3]
  const goalSpread3: ListMarket = {
    id: 'gs3',
    kind: 'list',
    name: 'Goal Spread 3-way',
    tabs: ['goals'],
    groups: [
      {
        columns: [
          { label: event.home, team: event.home },
          { label: 'Draw' },
          { label: event.away, team: event.away },
        ],
        rows: GS_LINES.map((h) => {
          const ps = [
            marginCdf((k) => k + h > 0),
            marginCdf((k) => k + h === 0),
            marginCdf((k) => k + h < 0),
          ]
          const labels = [signed(h), signed(h), signed(-h)]
          const who = [event.home, 'Draw', event.away]
          return ps.map((p, i) =>
            p < 0.03
              ? null
              : {
                  id: `${id}-gs3-${i}-${lineKey(h)}`,
                  label: labels[i]!,
                  odds: price(p),
                  slipLabel: `${who[i]} ${i === 1 ? `(${signed(h)})` : labels[i]}`,
                },
          )
        }),
      },
    ],
  }

  const teamTotalGroup = (side: 'home' | 'away', mean: number, lines: number[], tag: string) => {
    const team = side === 'home' ? event.home : event.away
    const rows = ladder(`${id}-${tag}${side[0]}`, lines, mean, ouLabels)
    return {
      title: team,
      team,
      columns: [{ label: 'Over' }, { label: 'Under' }],
      rows: rows.map((r) => [
        { ...r.a, slipLabel: `${team} ${r.a.label}` },
        { ...r.b, slipLabel: `${team} ${r.b.label}` },
      ]),
    }
  }
  const teamTotals: ListMarket = {
    id: 'team-totals',
    kind: 'list',
    name: 'Team Total Goals',
    tabs: ['goals'],
    groups: [
      teamTotalGroup('home', live ? rh : m.lh, [0.5, 1.5, 2.5, 3.5], 'tt'),
      teamTotalGroup('away', live ? ra : m.la, [0.5, 1.5, 2.5, 3.5], 'tt'),
    ],
  }
  const firstHalfTeamTotals: ListMarket = {
    id: '1h-team-totals',
    kind: 'list',
    name: '1st Half Team Total',
    tabs: ['halves'],
    groups: [
      teamTotalGroup('home', m.lh * 0.45, [0.5, 1, 1.5], '1htt'),
      teamTotalGroup('away', m.la * 0.45, [0.5, 1, 1.5], '1htt'),
    ],
  }

  const h1Matrix = scoreMatrix(m.lh * 0.45, m.la * 0.45, 5)
  const h1Cell = (h: number, a: number) => ({
    id: `${id}-1hcs-${h}-${a}`,
    label: `${h}-${a}`,
    odds: price(h1Matrix[h]?.[a] ?? 0),
    slipLabel: `1H ${h}-${a}`,
  })
  const h1Home: [number, number][] = []
  const h1Away: [number, number][] = []
  const h1Draw: [number, number][] = []
  for (let h = 0; h <= 4; h++)
    for (let a = 0; a <= 4; a++) {
      if (h > a) h1Home.push([h, a])
      else if (h < a) h1Away.push([a, h])
      else h1Draw.push([h, a])
    }
  const h1Rows = Math.max(h1Home.length, h1Away.length)
  const firstHalfCorrectScore: ListMarket = {
    id: '1h-cs',
    kind: 'list',
    name: '1st Half Correct Score',
    tabs: ['halves'],
    preview: 6,
    groups: [
      {
        columns: [
          { label: event.home, team: event.home },
          { label: 'Draw' },
          { label: event.away, team: event.away },
        ],
        rows: Array.from({ length: h1Rows }, (_, i) => [
          h1Home[i] ? h1Cell(h1Home[i]![0], h1Home[i]![1]) : undefined,
          h1Draw[i] ? h1Cell(h1Draw[i]![0], h1Draw[i]![1]) : undefined,
          h1Away[i] ? h1Cell(h1Away[i]![1], h1Away[i]![0]) : undefined,
        ]),
      },
    ],
  }

  const playerGoals: PlayerLinesMarket = {
    id: 'player-goals',
    kind: 'player-lines',
    name: 'Player Goals',
    tabs: ['players'],
    teams: [
      { name: event.home, abbr: homeShort, mean: m.lh },
      { name: event.away, abbr: awayShort, mean: m.la },
    ].map((t) => ({
      name: t.name,
      abbr: t.abbr,
      players: rosterFor(t.name).map((player, i) => {
        const x = t.mean * (WEIGHTS[i] ?? 0.1)
        const key = hash(player).toString(36)
        return {
          id: `${id}-pg-${key}`,
          name: player,
          mainLine: 0.5,
          rows: ladder(`${id}-pg-${key}`, [0.5, 1.5, 2.5], x, ouLabels).map((r) => ({
            ...r,
            a: { ...r.a, slipLabel: `${player} ${r.a.label} Goals` },
            b: { ...r.b, slipLabel: `${player} ${r.b.label} Goals` },
          })),
        }
      }),
    })),
  }

  return [
    threeWayReg,
    ...(nextGoal ? [nextGoal] : []),
    spread,
    total,
    asianHandicap,
    ...(restOfMatch ? [restOfMatch] : []),
    btts,
    goalscorers,
    doubleChance,
    dnb,
    firstHalf,
    exactGoals,
    goalSpread3,
    teamTotals,
    correctScore,
    firstHalfTotal,
    firstHalfTeamTotals,
    firstHalfCorrectScore,
    secondHalf,
    htftMarket,
    corners,
    mostCorners,
    firstHalfCorners,
    cards,
    mostCards,
    redCard,
    booked,
    playerGoals,
    shotsOnTarget,
  ]
}

// ─── Live + pre-match info ────────────────────────────────────

export function soccerLiveSeed(event: SoccerEvent): {
  incidents: SoccerIncident[]
  stats: SoccerLiveStats
} {
  const seed = LIVE_SEED[event.id]
  if (seed) return seed
  const [h, a] = event.score ?? [0, 0]
  const hp = 40 + Math.round(rand(`${event.id}-pos`) * 20)
  return {
    incidents: [],
    stats: {
      possession: [hp, 100 - hp],
      shots: [h * 3 + 2, a * 3 + 2],
      onTarget: [h + 1, a + 1],
      corners: [2, 3],
      yellows: [1, 1],
      fouls: [6, 6],
      dangerousAttacks: [18, 20],
    },
  }
}

const FORM: SoccerFormResult[] = ['W', 'D', 'L']

function formFor(team: string, strength: number): SoccerFormResult[] {
  return Array.from({ length: 5 }, (_, i) => {
    const r = rand(`${team}-form-${i}`)
    if (r < strength) return 'W'
    if (r < strength + 0.25) return 'D'
    return FORM[2]!
  })
}

export function soccerMatchInfo(event: SoccerEvent): SoccerMatchInfo {
  const m = modelFor(event)
  const meetings = ['12 Apr 26', '30 Nov 25', '18 Mar 25', '02 Nov 24', '24 Feb 24']
  return {
    venue: VENUES[event.home] ?? `${event.home} Stadium`,
    homeForm: formFor(event.home, 0.25 + m.winProb[0] * 0.5),
    awayForm: formFor(event.away, 0.25 + m.winProb[2] * 0.5),
    h2h: meetings.map((date, i) => {
      const flip = i % 2 === 1
      const g1 = Math.floor(rand(`${event.id}-h2h-${i}-a`) * 4)
      const g2 = Math.floor(rand(`${event.id}-h2h-${i}-b`) * 3)
      return {
        date,
        home: flip ? event.away : event.home,
        away: flip ? event.home : event.away,
        score: [g1, g2],
      }
    }),
    winProb: m.winProb,
  }
}

/** Every other fixture in the same league — event switcher strip. */
export function soccerSiblingEvents(section: SoccerLeagueSection, id: string): SoccerEvent[] {
  return section.events.filter((e) => e.id !== id)
}

// ─── View model ───────────────────────────────────────────────

/** Home attacks right, away attacks left. Pitch is 100 × 64. */
const SOCCER_TRACKER_BEATS: TrackerBeat[] = [
  { side: 'home', zone: 'safe', x: 34, y: 30, label: 'Ball safe' },
  { side: 'home', zone: 'attack', x: 58, y: 22, label: 'Attack' },
  { side: 'home', zone: 'danger', x: 80, y: 28, label: 'Dangerous attack' },
  { side: 'home', zone: 'danger', x: 88, y: 34, label: 'Shot off target' },
  { side: 'away', zone: 'safe', x: 94, y: 32, label: 'Goal kick' },
  { side: 'away', zone: 'attack', x: 46, y: 44, label: 'Attack' },
  { side: 'away', zone: 'danger', x: 20, y: 40, label: 'Dangerous attack' },
  { side: 'away', zone: 'danger', x: 1.5, y: 1.5, label: 'Corner' },
  { side: 'away', zone: 'danger', x: 9, y: 30, label: 'Dangerous attack' },
  { side: 'home', zone: 'safe', x: 22, y: 34, label: 'Ball safe' },
]

function soccerLive(event: SoccerEvent): EventLive | null {
  if (!event.live) return null
  const { incidents, stats } = soccerLiveSeed(event)
  return {
    incidents: incidents.map((i) => ({
      at: i.minute,
      label: i.label,
      side: i.side,
      kind: i.kind,
      player: i.player,
      score: i.score,
      detail: i.kind === 'goal' && i.score ? `Goal · ${i.score[0]}-${i.score[1]}` : undefined,
    })),
    stats: [
      { label: 'Possession %', values: stats.possession },
      { label: 'Shots', values: stats.shots },
      { label: 'Shots on target', values: stats.onTarget },
      { label: 'Corners', values: stats.corners },
      { label: 'Dangerous attacks', values: stats.dangerousAttacks },
      { label: 'Yellow cards', values: stats.yellows },
      { label: 'Fouls', values: stats.fouls },
    ],
    possession: stats.possession,
    beats: SOCCER_TRACKER_BEATS,
  }
}

export function soccerEventModel(
  event: SoccerEvent,
  section: SoccerLeagueSection,
): SportsEventModel {
  const info = soccerMatchInfo(event)
  const [day, time] = event.when.split(/,\s*/)
  const boardIds = new Set(
    [
      ...(event.desktopPicks ?? event.picks),
      ...(event.spreadLines ?? []).flatMap((p) => [p.a, p.b]),
      ...(event.totalLines ?? []).flatMap((p) => [p.a, p.b]),
    ].map((p) => p.id),
  )
  return {
    sport: 'soccer',
    event,
    league: { name: section.name, icon: section.icon },
    sportLabel: 'Soccer',
    sportHref: '/sports/soccer',
    siblings: soccerSiblingEvents(section, event.id),
    hrefFor: soccerEventHref,
    eventLabel: soccerEventLabel(event),
    tabs: SOCCER_MARKET_TABS,
    markets: buildSoccerEventMarkets(event),
    boardIds,
    awayFirst: false,
    live: soccerLive(event),
    info: {
      homeForm: info.homeForm,
      awayForm: info.awayForm,
      h2h: info.h2h,
      winProb: info.winProb,
      rows: [
        ['Kick off', time ? `${day}, ${time}` : (day ?? event.when)],
        ['Venue', info.venue],
      ],
    },
    streamSrc: '/sports/soccer-stream.mp4',
  }
}
