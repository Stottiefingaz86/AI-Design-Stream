/**
 * NFL board + event view seed. One normal model per game (home margin + total)
 * prices every line so the board, game lines, alternates and props agree.
 * US order everywhere: away on top / left, `@` between.
 */
import { NFL_TEAMS, type NflTeam } from '@/lib/lumen/nfl-teams'
import type {
  SoccerEvent,
  SoccerLeagueSection,
  SoccerLinePair,
  SoccerOdds,
} from '@/lib/lumen/soccer-sport'
import {
  bookPrice,
  fmtLine,
  lineKey,
  seeded,
  type EventIncident,
  type EventLive,
  type EventMarket,
  type EventTab,
  type FormResult,
  type GridMarket,
  type LadderMarket,
  type LinesMarket,
  type PlayerLinesMarket,
  type PlayersMarket,
  type RowMarket,
  type SportsEventModel,
  type TrackerBeat,
} from '@/lib/lumen/sports-event'

export const NFL_LEAGUE_ICON = '/homepage/logo-nfl.svg'
export const NCAAF_LEAGUE_ICON = '/promotions/contest/logo-ncaa.svg'

export type FootballLeague = 'nfl' | 'ncaaf'
export const FOOTBALL_LEAGUES: { id: FootballLeague; name: string; short: string; icon: string }[] =
  [
    { id: 'nfl', name: 'NFL', short: 'NFL', icon: NFL_LEAGUE_ICON },
    { id: 'ncaaf', name: 'NCAA Football', short: 'NCAA', icon: NCAAF_LEAGUE_ICON },
  ]

/** College sides — no marks in the repo yet, the board badge falls back to initials. */
const college = (name: string, abbr: string, kicker: string): NflTeam => ({
  name,
  abbr,
  logo: '',
  kicker,
})
const NCAA_TEAMS: Record<string, NflTeam> = {
  MICH: college('Michigan Wolverines', 'MICH', 'Dominic Zvada'),
  OSU: college('Ohio State Buckeyes', 'OSU', 'Jayden Fielding'),
  BAMA: college('Alabama Crimson Tide', 'BAMA', 'Conor Talty'),
  UGA: college('Georgia Bulldogs', 'UGA', 'Peyton Woodring'),
  TAMU: college('Texas A&M Aggies', 'TAMU', 'Randy Bond'),
  TEX: college('Texas Longhorns', 'TEX', 'Mason Shipley'),
  WASH: college('Washington Huskies', 'WASH', 'Grady Gross'),
  ORE: college('Oregon Ducks', 'ORE', 'Atticus Sappington'),
}

type Pos = 'QB' | 'RB' | 'WR' | 'TE'
type Player = { name: string; pos: Pos; mobile?: boolean }

const ROSTERS: Record<string, Player[]> = {
  SEA: [
    { name: 'Sam Darnold', pos: 'QB' },
    { name: 'Kenneth Walker III', pos: 'RB' },
    { name: 'Jaxon Smith-Njigba', pos: 'WR' },
    { name: 'Cooper Kupp', pos: 'WR' },
    { name: 'AJ Barner', pos: 'TE' },
  ],
  SF: [
    { name: 'Brock Purdy', pos: 'QB' },
    { name: 'Christian McCaffrey', pos: 'RB' },
    { name: 'Ricky Pearsall', pos: 'WR' },
    { name: 'Jauan Jennings', pos: 'WR' },
    { name: 'George Kittle', pos: 'TE' },
  ],
  KC: [
    { name: 'Patrick Mahomes', pos: 'QB' },
    { name: 'Isiah Pacheco', pos: 'RB' },
    { name: 'Rashee Rice', pos: 'WR' },
    { name: 'Xavier Worthy', pos: 'WR' },
    { name: 'Travis Kelce', pos: 'TE' },
  ],
  BUF: [
    { name: 'Josh Allen', pos: 'QB', mobile: true },
    { name: 'James Cook', pos: 'RB' },
    { name: 'Khalil Shakir', pos: 'WR' },
    { name: 'Keon Coleman', pos: 'WR' },
    { name: 'Dalton Kincaid', pos: 'TE' },
  ],
  DAL: [
    { name: 'Dak Prescott', pos: 'QB' },
    { name: 'Javonte Williams', pos: 'RB' },
    { name: 'CeeDee Lamb', pos: 'WR' },
    { name: 'George Pickens', pos: 'WR' },
    { name: 'Jake Ferguson', pos: 'TE' },
  ],
  PHI: [
    { name: 'Jalen Hurts', pos: 'QB', mobile: true },
    { name: 'Saquon Barkley', pos: 'RB' },
    { name: 'A.J. Brown', pos: 'WR' },
    { name: 'DeVonta Smith', pos: 'WR' },
    { name: 'Dallas Goedert', pos: 'TE' },
  ],
  MIA: [
    { name: 'Tua Tagovailoa', pos: 'QB' },
    { name: "De'Von Achane", pos: 'RB' },
    { name: 'Jaylen Waddle', pos: 'WR' },
    { name: 'Malik Washington', pos: 'WR' },
    { name: 'Darren Waller', pos: 'TE' },
  ],
  NYJ: [
    { name: 'Justin Fields', pos: 'QB', mobile: true },
    { name: 'Breece Hall', pos: 'RB' },
    { name: 'Garrett Wilson', pos: 'WR' },
    { name: 'Josh Reynolds', pos: 'WR' },
    { name: 'Mason Taylor', pos: 'TE' },
  ],
  CHI: [
    { name: 'Caleb Williams', pos: 'QB', mobile: true },
    { name: "D'Andre Swift", pos: 'RB' },
    { name: 'DJ Moore', pos: 'WR' },
    { name: 'Rome Odunze', pos: 'WR' },
    { name: 'Colston Loveland', pos: 'TE' },
  ],
  MIN: [
    { name: 'J.J. McCarthy', pos: 'QB' },
    { name: 'Aaron Jones', pos: 'RB' },
    { name: 'Justin Jefferson', pos: 'WR' },
    { name: 'Jordan Addison', pos: 'WR' },
    { name: 'T.J. Hockenson', pos: 'TE' },
  ],
  LAR: [
    { name: 'Matthew Stafford', pos: 'QB' },
    { name: 'Kyren Williams', pos: 'RB' },
    { name: 'Puka Nacua', pos: 'WR' },
    { name: 'Davante Adams', pos: 'WR' },
    { name: 'Tyler Higbee', pos: 'TE' },
  ],
  ARI: [
    { name: 'Kyler Murray', pos: 'QB', mobile: true },
    { name: 'James Conner', pos: 'RB' },
    { name: 'Marvin Harrison Jr.', pos: 'WR' },
    { name: 'Michael Wilson', pos: 'WR' },
    { name: 'Trey McBride', pos: 'TE' },
  ],
  DET: [
    { name: 'Jared Goff', pos: 'QB' },
    { name: 'Jahmyr Gibbs', pos: 'RB' },
    { name: 'Amon-Ra St. Brown', pos: 'WR' },
    { name: 'Jameson Williams', pos: 'WR' },
    { name: 'Sam LaPorta', pos: 'TE' },
  ],
  GB: [
    { name: 'Jordan Love', pos: 'QB' },
    { name: 'Josh Jacobs', pos: 'RB' },
    { name: 'Romeo Doubs', pos: 'WR' },
    { name: 'Matthew Golden', pos: 'WR' },
    { name: 'Tucker Kraft', pos: 'TE' },
  ],
  BAL: [
    { name: 'Lamar Jackson', pos: 'QB', mobile: true },
    { name: 'Derrick Henry', pos: 'RB' },
    { name: 'Zay Flowers', pos: 'WR' },
    { name: 'Rashod Bateman', pos: 'WR' },
    { name: 'Mark Andrews', pos: 'TE' },
  ],
  CIN: [
    { name: 'Joe Burrow', pos: 'QB' },
    { name: 'Chase Brown', pos: 'RB' },
    { name: "Ja'Marr Chase", pos: 'WR' },
    { name: 'Tee Higgins', pos: 'WR' },
    { name: 'Mike Gesicki', pos: 'TE' },
  ],
  MICH: [
    { name: 'Bryce Underwood', pos: 'QB' },
    { name: 'Justice Haynes', pos: 'RB' },
    { name: 'Andrew Marsh', pos: 'WR' },
    { name: 'Donaven McCulley', pos: 'WR' },
    { name: 'Marlin Klein', pos: 'TE' },
  ],
  OSU: [
    { name: 'Julian Sayin', pos: 'QB' },
    { name: 'CJ Donaldson', pos: 'RB' },
    { name: 'Jeremiah Smith', pos: 'WR' },
    { name: 'Carnell Tate', pos: 'WR' },
    { name: 'Max Klare', pos: 'TE' },
  ],
  BAMA: [
    { name: 'Ty Simpson', pos: 'QB' },
    { name: 'Jam Miller', pos: 'RB' },
    { name: 'Ryan Williams', pos: 'WR' },
    { name: 'Germie Bernard', pos: 'WR' },
    { name: 'Josh Cuevas', pos: 'TE' },
  ],
  UGA: [
    { name: 'Gunner Stockton', pos: 'QB' },
    { name: 'Nate Frazier', pos: 'RB' },
    { name: 'Zachariah Branch', pos: 'WR' },
    { name: 'Dillon Bell', pos: 'WR' },
    { name: 'Lawson Luckie', pos: 'TE' },
  ],
  TAMU: [
    { name: 'Marcel Reed', pos: 'QB' },
    { name: "Le'Veon Moss", pos: 'RB' },
    { name: 'KC Concepcion', pos: 'WR' },
    { name: 'Mario Craver', pos: 'WR' },
    { name: 'Nate Boerkircher', pos: 'TE' },
  ],
  TEX: [
    { name: 'Arch Manning', pos: 'QB' },
    { name: 'Quintrevion Wisner', pos: 'RB' },
    { name: 'DeAndre Moore Jr.', pos: 'WR' },
    { name: 'Ryan Wingo', pos: 'WR' },
    { name: 'Jack Endries', pos: 'TE' },
  ],
  WASH: [
    { name: 'Demond Williams Jr.', pos: 'QB' },
    { name: 'Jonah Coleman', pos: 'RB' },
    { name: 'Denzel Boston', pos: 'WR' },
    { name: 'Omari Evans', pos: 'WR' },
    { name: 'Decker DeGraaf', pos: 'TE' },
  ],
  ORE: [
    { name: 'Dante Moore', pos: 'QB' },
    { name: 'Noah Whittington', pos: 'RB' },
    { name: 'Dakorien Moore', pos: 'WR' },
    { name: 'Evan Stewart', pos: 'WR' },
    { name: 'Kenyon Sadiq', pos: 'TE' },
  ],
}

type GameSeed = {
  id: string
  away: string
  home: string
  when: string
  /** Home spread (negative = home favoured). */
  spread: number
  total: number
  tv: string
  venue: string
  records: [string, string]
  live?: { clock: string; score: [number, number]; ball: 'home' | 'away' }
  league?: FootballLeague
}

const GAMES: GameSeed[] = [
  {
    id: 'sea-sf',
    away: 'SEA',
    home: 'SF',
    when: 'Q3 8:42',
    spread: -2.5,
    total: 45.5,
    tv: 'FOX',
    venue: "Levi's Stadium",
    records: ['7-3', '8-2'],
    live: { clock: 'Q3 8:42', score: [17, 20], ball: 'away' },
  },
  {
    id: 'kc-buf',
    away: 'KC',
    home: 'BUF',
    when: 'Sun 22 Nov, 1:00 PM',
    spread: -2.5,
    total: 48.5,
    tv: 'CBS',
    venue: 'Highmark Stadium',
    records: ['8-2', '7-3'],
  },
  {
    id: 'dal-phi',
    away: 'DAL',
    home: 'PHI',
    when: 'Sun 22 Nov, 1:00 PM',
    spread: -6.5,
    total: 46.5,
    tv: 'FOX',
    venue: 'Lincoln Financial Field',
    records: ['8-2', '5-5'],
  },
  {
    id: 'mia-nyj',
    away: 'MIA',
    home: 'NYJ',
    when: 'Sun 22 Nov, 1:00 PM',
    spread: -1,
    total: 41.5,
    tv: 'CBS',
    venue: 'MetLife Stadium',
    records: ['4-6', '4-6'],
  },
  {
    id: 'chi-min',
    away: 'CHI',
    home: 'MIN',
    when: 'Sun 22 Nov, 1:00 PM',
    spread: -2.5,
    total: 43.5,
    tv: 'FOX',
    venue: 'U.S. Bank Stadium',
    records: ['6-4', '6-4'],
  },
  {
    id: 'lar-ari',
    away: 'LAR',
    home: 'ARI',
    when: 'Sun 22 Nov, 4:05 PM',
    spread: 3,
    total: 47.5,
    tv: 'FOX',
    venue: 'State Farm Stadium',
    records: ['5-5', '7-3'],
  },
  {
    id: 'det-gb',
    away: 'DET',
    home: 'GB',
    when: 'Sun 22 Nov, 8:20 PM',
    spread: -1.5,
    total: 49.5,
    tv: 'NBC',
    venue: 'Lambeau Field',
    records: ['7-3', '7-3'],
  },
  {
    id: 'bal-cin',
    away: 'BAL',
    home: 'CIN',
    when: 'Mon 23 Nov, 8:15 PM',
    spread: 3.5,
    total: 51.5,
    tv: 'ESPN',
    venue: 'Paycor Stadium',
    records: ['4-6', '6-4'],
  },
  {
    id: 'mich-osu',
    away: 'MICH',
    home: 'OSU',
    when: 'Sat 28 Nov, 12:00 PM',
    spread: -9.5,
    total: 44.5,
    tv: 'FOX',
    venue: 'Ohio Stadium',
    records: ['8-2', '10-0'],
    league: 'ncaaf',
  },
  {
    id: 'bama-uga',
    away: 'BAMA',
    home: 'UGA',
    when: 'Sat 28 Nov, 3:30 PM',
    spread: -3,
    total: 50.5,
    tv: 'CBS',
    venue: 'Sanford Stadium',
    records: ['9-1', '9-1'],
    league: 'ncaaf',
  },
  {
    id: 'wash-ore',
    away: 'WASH',
    home: 'ORE',
    when: 'Sat 28 Nov, 3:30 PM',
    spread: -13.5,
    total: 55.5,
    tv: 'NBC',
    venue: 'Autzen Stadium',
    records: ['7-3', '9-1'],
    league: 'ncaaf',
  },
  {
    id: 'tamu-tex',
    away: 'TAMU',
    home: 'TEX',
    when: 'Sat 28 Nov, 7:30 PM',
    spread: -2.5,
    total: 47.5,
    tv: 'ABC',
    venue: 'DKR-Texas Memorial Stadium',
    records: ['10-0', '7-3'],
    league: 'ncaaf',
  },
]

const SEED_BY_ID: Record<string, GameSeed> = Object.fromEntries(GAMES.map((g) => [g.id, g]))

function teamOf(abbr: string): NflTeam {
  return NFL_TEAMS[abbr] ?? NCAA_TEAMS[abbr]!
}

const leagueOf = (g: GameSeed): FootballLeague => g.league ?? 'nfl'

/** "Seattle Seahawks" → "Seahawks". */
export function nflNickname(name: string): string {
  const parts = name.split(' ')
  return parts[parts.length - 1] ?? name
}

// ─── Model ────────────────────────────────────────────────────

const MARGIN_SD = 13.5
const TOTAL_SD = 10

function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x)
  return x >= 0 ? y : -y
}

function cdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2))
}

function halfLine(x: number): number {
  return Math.floor(x) + 0.5
}

function signed(n: number): string {
  const r = Math.round(n * 100) / 100
  if (r === 0) return 'PK'
  return r > 0 ? `+${r}` : `${r}`
}

type Model = {
  /** Expected final home margin. */
  mu: number
  sd: number
  /** Expected final total. */
  total: number
  sdT: number
  /** Share of the game still to play. */
  f: number
  scored: [number, number]
}

function remainingShare(clock: string): number {
  const m = /Q(\d)\s+(\d+):(\d+)/.exec(clock)
  if (!m) return 1
  const q = Number(m[1])
  const left = Number(m[2]) * 60 + Number(m[3])
  return Math.max(0.02, ((4 - q) * 900 + left) / 3600)
}

function modelFor(g: GameSeed): Model {
  if (!g.live) {
    return { mu: -g.spread, sd: MARGIN_SD, total: g.total, sdT: TOTAL_SD, f: 1, scored: [0, 0] }
  }
  const f = remainingShare(g.live.clock)
  const [h, a] = g.live.score
  return {
    mu: h - a + -g.spread * f,
    sd: MARGIN_SD * Math.sqrt(f),
    total: h + a + g.total * f,
    sdT: TOTAL_SD * Math.sqrt(f),
    f,
    scored: [h, a],
  }
}

/** Away covers +A when home margin < A. */
function awayCover(m: { mu: number; sd: number }, awayLine: number): number {
  return cdf((awayLine - m.mu) / m.sd)
}

function overP(m: { total: number; sdT: number }, line: number): number {
  return 1 - cdf((line - m.total) / m.sdT)
}

function mainAwayLine(g: GameSeed, m: Model): number {
  return g.live ? halfLine(m.mu) : -g.spread
}

function mainTotal(g: GameSeed, m: Model): number {
  return g.live ? halfLine(m.total) : g.total
}

function steps(main: number, span: number, step = 0.5): number[] {
  const out: number[] = []
  for (let d = -span; d <= span + 1e-9; d += step) out.push(Math.round((main + d) * 100) / 100)
  return out
}

type Ctx = {
  id: string
  away: NflTeam
  home: NflTeam
  m: Model
}

function spreadPair(
  c: Ctx,
  prefix: string,
  sub: Model | { mu: number; sd: number },
  A: number,
): SoccerLinePair {
  const pa = awayCover(sub, A)
  return {
    line: A,
    a: {
      id: `${prefix}-sp-${lineKey(A)}-a`,
      label: signed(A),
      odds: bookPrice(pa),
      family: 'spread',
      side: 'a',
      line: A,
      slipLabel: `${nflNickname(c.away.name)} ${signed(A)}`,
    },
    b: {
      id: `${prefix}-sp-${lineKey(A)}-h`,
      label: signed(-A),
      odds: bookPrice(1 - pa),
      family: 'spread',
      side: 'b',
      line: A,
      slipLabel: `${nflNickname(c.home.name)} ${signed(-A)}`,
    },
  }
}

function totalPair(
  prefix: string,
  sub: { total: number; sdT: number },
  T: number,
  who = '',
): SoccerLinePair {
  const po = overP(sub, T)
  const lead = who ? `${who} ` : ''
  return {
    line: T,
    a: {
      id: `${prefix}-tot-${lineKey(T)}-o`,
      label: `O ${fmtLine(T)}`,
      odds: bookPrice(po),
      family: 'total',
      side: 'a',
      line: T,
      slipLabel: `${lead}Over ${fmtLine(T)}`,
    },
    b: {
      id: `${prefix}-tot-${lineKey(T)}-u`,
      label: `U ${fmtLine(T)}`,
      odds: bookPrice(1 - po),
      family: 'total',
      side: 'b',
      line: T,
      slipLabel: `${lead}Under ${fmtLine(T)}`,
    },
  }
}

function moneyline(
  c: Ctx,
  prefix: string,
  sub: { mu: number; sd: number },
): [SoccerOdds, SoccerOdds] {
  const ph = 1 - cdf((0 - sub.mu) / sub.sd)
  return [
    {
      id: `${prefix}-ml-a`,
      label: '',
      odds: bookPrice(1 - ph),
      slipLabel: c.away.name,
    },
    {
      id: `${prefix}-ml-h`,
      label: '',
      odds: bookPrice(ph),
      slipLabel: c.home.name,
    },
  ]
}

/** Period lines (1H, 2H, quarters) — scaled off the full-game model. */
function periodModel(g: GameSeed, share: number) {
  return {
    mu: -g.spread * share,
    sd: MARGIN_SD * Math.sqrt(share),
    total: g.total * share,
    sdT: TOTAL_SD * Math.sqrt(share),
  }
}

function linesMarket(
  c: Ctx,
  opts: {
    id: string
    name: string
    tabs: string[]
    prefix: string
    sub: { mu: number; sd: number; total: number; sdT: number }
    awayLine: number
    totalLine: number
    slipPrefix?: string
  },
): LinesMarket {
  const sp = spreadPair(c, opts.prefix, opts.sub, opts.awayLine)
  const tp = totalPair(opts.prefix, opts.sub, opts.totalLine)
  const [mla, mlh] = moneyline(c, opts.prefix, opts.sub)
  const p = opts.slipPrefix ? `${opts.slipPrefix} ` : ''
  return {
    id: opts.id,
    kind: 'lines',
    name: opts.name,
    tabs: opts.tabs,
    columns: [
      { label: 'Spread', slipMarket: `${p}Spread` },
      { label: 'Total', slipMarket: `${p}Total` },
      { label: 'Moneyline', slipMarket: `${p}Moneyline` },
    ],
    rows: [
      { team: c.away.name, cells: [sp.a, tp.a, mla] },
      { team: c.home.name, cells: [sp.b, tp.b, mlh] },
    ],
  }
}

// ─── Board ────────────────────────────────────────────────────

function ctxFor(g: GameSeed): Ctx {
  return { id: g.id, away: teamOf(g.away), home: teamOf(g.home), m: modelFor(g) }
}

/** Main game lines for the board grid — same ids as the event view's Game Lines. */
export function nflBoardLines(event: SoccerEvent): LinesMarket | null {
  const g = SEED_BY_ID[event.id]
  if (!g) return null
  const c = ctxFor(g)
  return linesMarket(c, {
    id: 'game-lines',
    name: 'Game Lines',
    tabs: ['popular', 'lines'],
    prefix: g.id,
    sub: c.m,
    awayLine: mainAwayLine(g, c.m),
    totalLine: mainTotal(g, c.m),
  })
}

export type NflBoardColumn = {
  id: string
  label: string
  slipMarket: string
  /** Away, home. */
  cells: [SoccerOdds, SoccerOdds]
}

/**
 * Board rail — full game, then the next period (1H pre-game, 4Q live), then 1Q.
 * Same ids + slip markets as the event view so selections sync.
 */
export function nflBoardColumns(event: SoccerEvent): NflBoardColumn[] {
  const g = SEED_BY_ID[event.id]
  if (!g) return []
  const c = ctxFor(g)
  const cols = (lines: LinesMarket, tag: string): NflBoardColumn[] => {
    const [sp, tot, ml] = lines.columns
    const [a, h] = lines.rows
    const pre = tag ? `${tag} ` : ''
    return [
      {
        id: `${lines.id}-ml`,
        label: `${pre}Moneyline`,
        slipMarket: ml!.slipMarket,
        cells: [a!.cells[2]!, h!.cells[2]!],
      },
      {
        id: `${lines.id}-sp`,
        label: `${pre}Point Spread`,
        slipMarket: sp!.slipMarket,
        cells: [a!.cells[0]!, h!.cells[0]!],
      },
      {
        id: `${lines.id}-tot`,
        label: `${pre}Total Points`,
        slipMarket: tot!.slipMarket,
        cells: [a!.cells[1]!, h!.cells[1]!],
      },
    ]
  }
  const period = (key: string, share: number) => {
    const sub = periodModel(g, share)
    return linesMarket(c, {
      id: key,
      name: key,
      tabs: [],
      prefix: `${g.id}-${key}`,
      sub,
      awayLine: halfLine(sub.mu),
      totalLine: halfLine(sub.total),
      slipPrefix: key.toUpperCase(),
    })
  }
  const main = nflBoardLines(event)!
  return g.live
    ? [...cols(main, ''), ...cols(period('4q', 0.25), '4Q')]
    : [...cols(main, ''), ...cols(period('1h', 0.5), '1H'), ...cols(period('1q', 0.25), '1Q')]
}

export function nflLeagueOf(id: string): FootballLeague {
  const g = SEED_BY_ID[id]
  return g ? leagueOf(g) : 'nfl'
}

function toEvent(g: GameSeed): SoccerEvent {
  const away = teamOf(g.away)
  const home = teamOf(g.home)
  const lines = (() => {
    const c = ctxFor(g)
    return linesMarket(c, {
      id: 'game-lines',
      name: 'Game Lines',
      tabs: [],
      prefix: g.id,
      sub: c.m,
      awayLine: mainAwayLine(g, c.m),
      totalLine: mainTotal(g, c.m),
    })
  })()
  return {
    id: g.id,
    home: home.name,
    away: away.name,
    homeAbbr: home.abbr,
    awayAbbr: away.abbr,
    when: g.live ? g.live.clock : g.when,
    live: !!g.live,
    score: g.live?.score,
    picks: lines.rows.flatMap((r) => r.cells.filter((x): x is SoccerOdds => !!x)),
  }
}

/** Board sections per league — live first, then kickoff order. */
export const NFL_GAME_SECTIONS: SoccerLeagueSection[] = FOOTBALL_LEAGUES.map((l) => {
  const games = GAMES.filter((g) => leagueOf(g) === l.id)
  const events = [...games.filter((g) => g.live), ...games.filter((g) => !g.live)].map(toEvent)
  return { id: l.id, name: l.name, icon: l.icon, events, moreCount: Math.max(0, events.length - 5) }
})

export function findNflEvent(
  id: string,
): { event: SoccerEvent; section: SoccerLeagueSection } | null {
  for (const section of NFL_GAME_SECTIONS) {
    const event = section.events.find((e) => e.id === id)
    if (event) return { event, section }
  }
  return null
}

export function nflEventHref(id: string): string {
  return `/sports/football/event/${id}`
}

export function nflEventLabel(event: SoccerEvent): string {
  return `${event.away} @ ${event.home}`
}

export function nflRecords(id: string): { home: string; away: string } | undefined {
  const g = SEED_BY_ID[id]
  return g ? { home: g.records[1], away: g.records[0] } : undefined
}

export function nflKickoff(id: string): { tv: string; venue: string } | undefined {
  const g = SEED_BY_ID[id]
  return g ? { tv: g.tv, venue: g.venue } : undefined
}

// ─── Futures ──────────────────────────────────────────────────

export type NflFuture = {
  id: string
  name: string
  picks: (SoccerOdds & { team?: string })[]
}

const future = (market: string, rows: [string, string, string?][]): NflFuture => ({
  id: market.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  name: market,
  picks: rows.map(([label, odds, team]) => ({
    id: `fut-${market.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    label,
    odds,
    team,
  })),
})

export const NFL_FUTURES: NflFuture[] = [
  future('Super Bowl LXI Winner', [
    ['Buffalo Bills', '+450', 'Buffalo Bills'],
    ['Kansas City Chiefs', '+500', 'Kansas City Chiefs'],
    ['Philadelphia Eagles', '+550', 'Philadelphia Eagles'],
    ['Detroit Lions', '+650', 'Detroit Lions'],
    ['San Francisco 49ers', '+900', 'San Francisco 49ers'],
    ['Baltimore Ravens', '+1000', 'Baltimore Ravens'],
    ['Seattle Seahawks', '+1200', 'Seattle Seahawks'],
    ['Green Bay Packers', '+1400', 'Green Bay Packers'],
    ['Los Angeles Rams', '+1600', 'Los Angeles Rams'],
    ['Minnesota Vikings', '+2500', 'Minnesota Vikings'],
  ]),
  future('Regular Season MVP', [
    ['Josh Allen', '+350', 'Buffalo Bills'],
    ['Lamar Jackson', '+450', 'Baltimore Ravens'],
    ['Patrick Mahomes', '+600', 'Kansas City Chiefs'],
    ['Jalen Hurts', '+900', 'Philadelphia Eagles'],
    ['Jared Goff', '+1200', 'Detroit Lions'],
    ['Sam Darnold', '+1600', 'Seattle Seahawks'],
  ]),
]

// ─── Event markets ────────────────────────────────────────────

export const NFL_MARKET_TABS: EventTab[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'lines', label: 'Game Lines' },
  { id: 'halves', label: 'Halves' },
  { id: 'quarters', label: 'Quarters' },
  { id: 'td', label: 'Touchdowns' },
  { id: 'players', label: 'Player Props' },
  { id: 'props', label: 'Game Props' },
]

/** Players who already scored in the live seed — anytime TD is settled for them. */
const LIVE_SCORERS: Record<string, string[]> = {
  'sea-sf': ['Kenneth Walker III', 'George Kittle', 'Jaxon Smith-Njigba'],
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

/** Per-player means for props, nudged by team strength. */
function propMean(p: Player, stat: string, teamPts: number): { mean: number; sd: number } | null {
  const k = teamPts / 23
  switch (stat) {
    case 'pass':
      return p.pos === 'QB' ? { mean: 232 * k, sd: 55 } : null
    case 'passtd':
      return p.pos === 'QB' ? { mean: 1.6 * k, sd: 0.9 } : null
    case 'rush':
      if (p.pos === 'RB') return { mean: 66 * k, sd: 26 }
      if (p.pos === 'QB' && p.mobile) return { mean: 34 * k, sd: 16 }
      return null
    case 'rec':
      if (p.pos === 'WR') return { mean: 64 * k, sd: 25 }
      if (p.pos === 'TE') return { mean: 44 * k, sd: 19 }
      if (p.pos === 'RB') return { mean: 22 * k, sd: 12 }
      return null
    case 'recs':
      if (p.pos === 'WR') return { mean: 5.2 * k, sd: 1.9 }
      if (p.pos === 'TE') return { mean: 4.1 * k, sd: 1.6 }
      if (p.pos === 'RB') return { mean: 2.8 * k, sd: 1.3 }
      return null
  }
  return null
}

function propLadder(
  prefix: string,
  player: string,
  mean: number,
  sd: number,
  step: number,
  f: number,
): { rows: SoccerLinePair[]; mainLine: number } {
  /* Live: same full-game expectation, tighter as the clock runs. */
  const liveMean = mean
  const liveSd = sd * Math.sqrt(f)
  const main = halfLine(liveMean)
  const lines = steps(main, step * 3, step).filter((l) => l > 0)
  return {
    mainLine: main,
    rows: lines.map((L) => {
      const po = 1 - cdf((L - liveMean) / liveSd)
      return {
        line: L,
        a: {
          id: `${prefix}-${slug(player)}-${lineKey(L)}-o`,
          label: `O ${fmtLine(L)}`,
          odds: bookPrice(po),
          slipLabel: `${player} Over ${fmtLine(L)}`,
        },
        b: {
          id: `${prefix}-${slug(player)}-${lineKey(L)}-u`,
          label: `U ${fmtLine(L)}`,
          odds: bookPrice(1 - po),
          slipLabel: `${player} Under ${fmtLine(L)}`,
        },
      }
    }),
  }
}

export function buildNflEventMarkets(event: SoccerEvent): EventMarket[] {
  const g = SEED_BY_ID[event.id]
  if (!g) return []
  const c = ctxFor(g)
  const { m } = c
  const live = !!g.live
  const id = g.id
  const awayNick = nflNickname(c.away.name)
  const homeNick = nflNickname(c.home.name)

  const gameLines = linesMarket(c, {
    id: 'game-lines',
    name: 'Game Lines',
    tabs: ['popular', 'lines'],
    prefix: id,
    sub: m,
    awayLine: mainAwayLine(g, m),
    totalLine: mainTotal(g, m),
  })

  const altSpread: LadderMarket = {
    id: 'alt-spread',
    kind: 'ladder',
    name: 'Alternate Spread',
    tabs: ['popular', 'lines'],
    slipMarket: 'Spread',
    altTitle: 'Spreads',
    columns: [
      { label: c.away.name, team: c.away.name },
      { label: c.home.name, team: c.home.name },
    ],
    rows: steps(mainAwayLine(g, m), 3).map((A) => spreadPair(c, id, m, A)),
    mainLine: mainAwayLine(g, m),
  }

  const altTotal: LadderMarket = {
    id: 'alt-total',
    kind: 'ladder',
    name: 'Alternate Total',
    tabs: ['popular', 'lines'],
    slipMarket: 'Total',
    altTitle: 'Totals',
    columns: [{ label: 'Over' }, { label: 'Under' }],
    rows: steps(mainTotal(g, m), 3).map((T) => totalPair(id, m, T)),
    mainLine: mainTotal(g, m),
  }

  const teamPts = (side: 'home' | 'away') =>
    side === 'home' ? (m.total + m.mu) / 2 : (m.total - m.mu) / 2

  const teamTotal = (side: 'home' | 'away'): LadderMarket => {
    const t = side === 'home' ? c.home : c.away
    const mean = teamPts(side)
    const sub = { total: mean, sdT: 7.5 * Math.sqrt(m.f) }
    const main = halfLine(mean)
    return {
      id: `tt-${side}`,
      kind: 'ladder',
      name: `${t.name} Team Total`,
      tabs: ['lines', 'props'],
      altTitle: 'Points',
      columns: [{ label: 'Over' }, { label: 'Under' }],
      rows: steps(main, 1.5).map((T) =>
        totalPair(`${id}-tt${side[0]}`, sub, T, nflNickname(t.name)),
      ),
      mainLine: main,
    }
  }

  /* Winning margin — buckets off the margin distribution. */
  const buckets: [number, number, string][] = [
    [0.5, 6.5, '1-6'],
    [6.5, 12.5, '7-12'],
    [12.5, 18.5, '13-18'],
    [18.5, 24.5, '19-24'],
    [24.5, 30.5, '25-30'],
    [30.5, 99, '31+'],
  ]
  const marginP = (lo: number, hi: number) =>
    Math.max(0.005, cdf((hi - m.mu) / m.sd) - cdf((lo - m.mu) / m.sd))
  const winningMargin: GridMarket = {
    id: 'margin',
    kind: 'grid',
    name: 'Winning Margin',
    tabs: ['lines'],
    columns: [
      {
        label: c.away.name,
        team: c.away.name,
        cells: buckets.map(([lo, hi, label]) => ({
          id: `${id}-wm-a-${slug(label)}`,
          label,
          odds: bookPrice(marginP(-hi, -lo), 1.12),
          slipLabel: `${awayNick} by ${label}`,
        })),
      },
      {
        label: c.home.name,
        team: c.home.name,
        cells: buckets.map(([lo, hi, label]) => ({
          id: `${id}-wm-h-${slug(label)}`,
          label,
          odds: bookPrice(marginP(lo, hi), 1.12),
          slipLabel: `${homeNick} by ${label}`,
        })),
      },
    ],
  }

  /* Periods — completed periods come off the board when live. */
  const period = (key: string, name: string, share: number, tabs: string[]): LinesMarket => {
    const sub = periodModel(g, share)
    return linesMarket(c, {
      id: key,
      name,
      tabs,
      prefix: `${id}-${key}`,
      sub,
      awayLine: halfLine(sub.mu),
      totalLine: halfLine(sub.total),
      slipPrefix: key.toUpperCase(),
    })
  }
  const periods: LinesMarket[] = live
    ? [period('4q', '4th Quarter Lines', 0.25, ['quarters'])]
    : [
        period('1h', '1st Half Lines', 0.5, ['popular', 'halves']),
        period('2h', '2nd Half Lines', 0.5, ['halves']),
        period('1q', '1st Quarter Lines', 0.25, ['quarters']),
        period('2q', '2nd Quarter Lines', 0.25, ['quarters']),
        period('3q', '3rd Quarter Lines', 0.25, ['quarters']),
        period('4q', '4th Quarter Lines', 0.25, ['quarters']),
      ]

  const highestHalf: RowMarket | null = live
    ? null
    : {
        id: 'high-half',
        kind: 'row',
        name: 'Highest Scoring Half',
        tabs: ['halves', 'props'],
        cells: [
          { id: `${id}-hh-1`, label: '1st Half', odds: bookPrice(0.43) },
          { id: `${id}-hh-t`, label: 'Tie', odds: bookPrice(0.06) },
          { id: `${id}-hh-2`, label: '2nd Half', odds: bookPrice(0.51) },
        ],
      }

  /* Touchdowns */
  const tdMean = (pts: number) => (pts / 7) * 0.82
  const weights: Record<Pos, number> = { QB: 0.05, RB: 0.3, WR: 0.19, TE: 0.13 }
  const scored = new Set(LIVE_SCORERS[id] ?? [])
  const totalTds = tdMean(teamPts('home')) + tdMean(teamPts('away'))
  const tdTeams = (['away', 'home'] as const).map((side) => {
    const t = side === 'home' ? c.home : c.away
    /* Live: only what's left to score. */
    const x = tdMean(teamPts(side) - (side === 'home' ? m.scored[0] : m.scored[1]))
    return {
      name: t.name,
      abbr: t.abbr,
      players: (ROSTERS[t.abbr] ?? [])
        .filter((p) => !scored.has(p.name))
        .map((p, i) => {
          const share = (weights[p.pos] + (p.mobile ? 0.06 : 0)) * (i === 2 ? 1.25 : 1)
          const lam = x * share
          const pid = `${id}-td-${slug(p.name)}`
          const cells: SoccerOdds[] = live
            ? []
            : [
                {
                  id: `${pid}-first`,
                  label: 'First',
                  odds: bookPrice(
                    (lam / Math.max(0.1, totalTds)) * (1 - Math.exp(-totalTds)),
                    1.15,
                  ),
                  slipLabel: `${p.name} First TD`,
                },
              ]
          cells.push(
            {
              id: `${pid}-any`,
              label: 'Anytime',
              odds: bookPrice(1 - Math.exp(-lam), 1.1),
              slipLabel: `${p.name} Anytime TD`,
            },
            {
              id: `${pid}-2p`,
              label: '2+',
              odds: bookPrice(1 - Math.exp(-lam) * (1 + lam), 1.15),
              slipLabel: `${p.name} 2+ TDs`,
            },
          )
          return { id: pid, name: p.name, pos: p.pos, cells }
        }),
    }
  })
  const tdScorers: PlayersMarket = {
    id: 'td-scorer',
    kind: 'players',
    name: 'Touchdown Scorer',
    tabs: ['popular', 'td'],
    columns: live ? ['Anytime', '2+'] : ['First', 'Anytime', '2+'],
    teams: tdTeams,
  }

  const tdLine = halfLine(totalTds)
  const totalTdLadder: LadderMarket = {
    id: 'total-td',
    kind: 'ladder',
    name: 'Total Touchdowns',
    tabs: ['td'],
    altTitle: 'Touchdowns',
    columns: [{ label: 'Over' }, { label: 'Under' }],
    rows: steps(tdLine, 2, 1).map((T) => {
      const p = 1 - cdf((T - totalTds) / 1.6)
      return {
        line: T,
        a: {
          id: `${id}-ttd-${lineKey(T)}-o`,
          label: `O ${fmtLine(T)}`,
          odds: bookPrice(p),
          slipLabel: `Over ${fmtLine(T)} TDs`,
        },
        b: {
          id: `${id}-ttd-${lineKey(T)}-u`,
          label: `U ${fmtLine(T)}`,
          odds: bookPrice(1 - p),
          slipLabel: `Under ${fmtLine(T)} TDs`,
        },
      }
    }),
    mainLine: tdLine,
  }

  const firstScore: RowMarket | null = live
    ? null
    : (() => {
        const pa = 1 - cdf(m.mu / 30)
        return {
          id: 'first-score',
          kind: 'row',
          name: 'First Team to Score',
          tabs: ['td', 'props'],
          cells: [
            { id: `${id}-fs-a`, label: c.away.abbr, odds: bookPrice(pa), slipLabel: c.away.name },
            {
              id: `${id}-fs-h`,
              label: c.home.abbr,
              odds: bookPrice(1 - pa),
              slipLabel: c.home.name,
            },
          ],
        }
      })()

  /* Live — next scoring play locks while each snap is in the air. */
  const nextScore: RowMarket | null = live
    ? {
        id: 'next-score',
        kind: 'row',
        name: 'Next Scoring Play',
        tabs: ['popular', 'td'],
        live: true,
        volatile: true,
        cells: [
          {
            id: `${id}-ns-atd`,
            label: `${c.away.abbr} TD`,
            odds: '+135',
            slipLabel: `${awayNick} touchdown`,
          },
          {
            id: `${id}-ns-afg`,
            label: `${c.away.abbr} FG`,
            odds: '+240',
            slipLabel: `${awayNick} field goal`,
          },
          {
            id: `${id}-ns-htd`,
            label: `${c.home.abbr} TD`,
            odds: '+260',
            slipLabel: `${homeNick} touchdown`,
          },
          {
            id: `${id}-ns-hfg`,
            label: `${c.home.abbr} FG`,
            odds: '+450',
            slipLabel: `${homeNick} field goal`,
          },
          { id: `${id}-ns-none`, label: 'No score', odds: '+1800', slipLabel: 'No more scoring' },
        ],
      }
    : null

  /* Player props */
  const props = (
    key: string,
    name: string,
    stat: string,
    step: number,
    tabs: string[],
  ): PlayerLinesMarket | null => {
    const teams = (['away', 'home'] as const).map((side) => {
      const t = side === 'home' ? c.home : c.away
      const pts = side === 'home' ? (g.total - g.spread) / 2 : (g.total + g.spread) / 2
      return {
        name: t.name,
        abbr: t.abbr,
        players: (ROSTERS[t.abbr] ?? []).flatMap((p) => {
          const pm = propMean(p, stat, pts)
          if (!pm) return []
          const lad = propLadder(`${id}-${key}`, p.name, pm.mean, pm.sd, step, m.f)
          return [{ id: `${id}-${key}-${slug(p.name)}`, name: p.name, pos: p.pos, ...lad }]
        }),
      }
    })
    if (teams.every((t) => t.players.length === 0)) return null
    return { id: key, kind: 'player-lines', name, tabs, teams }
  }
  const playerMarkets = [
    props('pass-yds', 'Passing Yards', 'pass', 10, ['popular', 'players']),
    props('pass-td', 'Passing Touchdowns', 'passtd', 1, ['players']),
    props('rush-yds', 'Rushing Yards', 'rush', 5, ['players']),
    props('rec-yds', 'Receiving Yards', 'rec', 5, ['popular', 'players']),
    props('receptions', 'Receptions', 'recs', 1, ['players']),
  ].filter((x): x is PlayerLinesMarket => !!x)

  const yesNo = (key: string, name: string, p: number, tabs: string[]): RowMarket => ({
    id: key,
    kind: 'row',
    name,
    tabs,
    cells: [
      { id: `${id}-${key}-y`, label: 'Yes', odds: bookPrice(p), slipLabel: `${name}: Yes` },
      { id: `${id}-${key}-n`, label: 'No', odds: bookPrice(1 - p), slipLabel: `${name}: No` },
    ],
  })

  const oddEven: RowMarket = {
    id: 'odd-even',
    kind: 'row',
    name: 'Total Points Odd / Even',
    tabs: ['props'],
    cells: [
      { id: `${id}-oe-o`, label: 'Odd', odds: '-110', slipLabel: 'Total points odd' },
      { id: `${id}-oe-e`, label: 'Even', odds: '-110', slipLabel: 'Total points even' },
    ],
  }

  const race: RowMarket | null = live
    ? null
    : (() => {
        const pa = 1 - cdf(m.mu / 26)
        return {
          id: 'race-10',
          kind: 'row',
          name: 'Race to 10 Points',
          tabs: ['props'],
          cells: [
            {
              id: `${id}-r10-a`,
              label: c.away.abbr,
              odds: bookPrice(pa * 0.96),
              slipLabel: `${awayNick} to 10 first`,
            },
            { id: `${id}-r10-n`, label: 'Neither', odds: '+3300', slipLabel: 'Neither team to 10' },
            {
              id: `${id}-r10-h`,
              label: c.home.abbr,
              odds: bookPrice((1 - pa) * 0.96),
              slipLabel: `${homeNick} to 10 first`,
            },
          ],
        }
      })()

  return [
    ...(nextScore ? [nextScore] : []),
    gameLines,
    altSpread,
    altTotal,
    tdScorers,
    ...playerMarkets.slice(0, 1),
    ...periods,
    ...playerMarkets.slice(1),
    teamTotal('away'),
    teamTotal('home'),
    winningMargin,
    totalTdLadder,
    ...(firstScore ? [firstScore] : []),
    ...(highestHalf ? [highestHalf] : []),
    ...(race ? [race] : []),
    yesNo('overtime', 'Will There Be Overtime?', live ? 0.035 : 0.055, ['props']),
    yesNo('safety', 'Safety Scored', live ? 0.04 : 0.075, ['props']),
    oddEven,
  ]
}

// ─── Live + pre-game ──────────────────────────────────────────

/** Elapsed seconds for a quarter clock — timeline sort key. */
const at = (q: number, clock: string) => {
  const [mm, ss] = clock.split(':').map(Number) as [number, number]
  return (q - 1) * 900 + (900 - (mm * 60 + ss))
}

const LIVE_SEED: Record<string, EventLive> = {
  'sea-sf': {
    incidents: [
      {
        at: at(1, '9:21'),
        label: 'Q1 9:21',
        side: 'away',
        kind: 'td',
        player: 'Kenneth Walker III',
        detail: '4 yd run',
        score: [0, 7],
      },
      {
        at: at(1, '2:10'),
        label: 'Q1 2:10',
        side: 'home',
        kind: 'fg',
        player: 'Eddy Piñeiro',
        detail: '42 yd field goal',
        score: [3, 7],
      },
      {
        at: at(2, '11:48'),
        label: 'Q2 11:48',
        side: 'home',
        kind: 'td',
        player: 'George Kittle',
        detail: '18 yd pass from Brock Purdy',
        score: [10, 7],
      },
      {
        at: at(2, '4:30'),
        label: 'Q2 4:30',
        side: 'away',
        kind: 'fg',
        player: 'Jason Myers',
        detail: '47 yd field goal',
        score: [10, 10],
      },
      {
        at: at(2, '0:04'),
        label: 'Q2 0:04',
        side: 'away',
        kind: 'fg',
        player: 'Jason Myers',
        detail: '51 yd field goal',
        score: [10, 13],
      },
      {
        at: at(3, '13:10'),
        label: 'Q3 13:10',
        side: 'away',
        kind: 'td',
        player: 'Jaxon Smith-Njigba',
        detail: '31 yd pass from Sam Darnold',
        score: [10, 20],
      },
      {
        at: at(3, '9:40'),
        label: 'Q3 9:40',
        side: 'home',
        kind: 'td',
        player: 'Christian McCaffrey',
        detail: '2 yd run',
        score: [17, 20],
      },
    ] satisfies EventIncident[],
    stats: [
      { label: 'Total yards', values: [268, 301] },
      { label: 'Passing yards', values: [176, 214] },
      { label: 'Rushing yards', values: [92, 87] },
      { label: 'First downs', values: [16, 18] },
      { label: 'Third downs converted', values: [5, 4] },
      { label: 'Turnovers', values: [1, 0] },
      { label: 'Sacks', values: [2, 1] },
      { label: 'Penalties', values: [4, 6] },
      { label: 'Time of possession', values: [1068, 1230], format: 'clock' },
    ],
    /* SEA (away) drives toward the home goal line at 0. Ball spot = yards from the SF goal line. */
    beats: [
      { side: 'away', x: 75, label: 'Kickoff return to SEA 25', down: '1st & 10', firstDownAt: 65 },
      { side: 'away', x: 69, label: 'Run, 6 yds', down: '2nd & 4', firstDownAt: 65 },
      { side: 'away', x: 57, label: 'Pass complete, 12 yds', down: '1st & 10', firstDownAt: 47 },
      { side: 'away', x: 57, label: 'Pass incomplete', down: '2nd & 10', firstDownAt: 47 },
      { side: 'away', x: 48, label: 'Pass complete, 9 yds', down: '3rd & 1', firstDownAt: 47 },
      { side: 'away', x: 41, label: 'Run, 7 yds', down: '1st & 10', firstDownAt: 31 },
      { side: 'away', x: 41, label: 'Timeout, San Francisco', down: '1st & 10', firstDownAt: 31 },
      { side: 'away', x: 38, label: 'Run, 3 yds', down: '2nd & 7', firstDownAt: 31 },
    ],
    drive: '6 plays · 37 yds · 3:18',
  },
}

const FORM_WL: FormResult[] = ['W', 'L']

function formFor(team: string, strength: number): FormResult[] {
  return Array.from({ length: 5 }, (_, i) =>
    seeded(`${team}-nfl-form-${i}`) < strength ? 'W' : FORM_WL[1]!,
  )
}

export function nflEventModel(event: SoccerEvent, section: SoccerLeagueSection): SportsEventModel {
  const g = SEED_BY_ID[event.id]!
  const c = ctxFor(g)
  const ph = 1 - cdf((0 - c.m.mu) / c.m.sd)
  const meetings = ['Sep 28, 2025', 'Jan 5, 2025', 'Oct 6, 2024', 'Dec 10, 2023', 'Nov 13, 2022']
  const lines = nflBoardLines(event)
  return {
    sport: 'nfl',
    event,
    league: (() => {
      const l = FOOTBALL_LEAGUES.find((x) => x.id === leagueOf(g))!
      return { name: l.name, icon: l.icon }
    })(),
    sportLabel: 'Football',
    sportHref: '/sports/football',
    siblings: section.events.filter((e) => e.id !== event.id),
    hrefFor: nflEventHref,
    eventLabel: nflEventLabel(event),
    tabs: NFL_MARKET_TABS,
    markets: buildNflEventMarkets(event),
    boardIds: new Set(lines ? lines.rows.flatMap((r) => r.cells.map((x) => x?.id ?? '')) : []),
    awayFirst: true,
    live: g.live ? (LIVE_SEED[g.id] ?? null) : null,
    info: {
      homeForm: formFor(c.home.name, 0.3 + ph * 0.4),
      awayForm: formFor(c.away.name, 0.3 + (1 - ph) * 0.4),
      h2h: meetings.map((date, i) => {
        const flip = i % 2 === 1
        const s1 = 13 + Math.round(seeded(`${g.id}-h2h-${i}-a`) * 21)
        const s2 = 10 + Math.round(seeded(`${g.id}-h2h-${i}-b`) * 20)
        return {
          date,
          home: flip ? c.away.name : c.home.name,
          away: flip ? c.home.name : c.away.name,
          score: [s1, s2 === s1 ? s2 + 3 : s2],
        }
      }),
      winProb: [ph, 0, 1 - ph],
      rows: [
        ['Kickoff', g.live ? 'In progress' : g.when],
        ['Stadium', g.venue],
        ['TV', g.tv],
      ],
    },
    streamSrc: '/sports/nfl-stream.mp4',
    records: { home: g.records[1], away: g.records[0] },
    possession: g.live?.ball,
  }
}
