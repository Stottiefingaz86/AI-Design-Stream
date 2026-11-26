/** PropShopX sport-specific page — Soccer // Games demo seed. */
import { nflTeamByName } from '@/lib/lumen/nfl-teams'

export type SoccerMode = 'games' | 'sgp' | 'boosts' | 'mega' | 'outrights' | 'leagues'

export type SoccerLineFamily = 'spread' | 'total'
export type SoccerLineSide = 'a' | 'b'

export type SoccerOdds = {
  id: string
  label: string
  odds: string
  /** Present on Spread / Total board picks — used for alt-line + betslip sync. */
  family?: SoccerLineFamily
  side?: SoccerLineSide
  line?: number
  /** Betslip label when the chip shows a short form (e.g. chip `+2.5`, slip `SEA +2.5`). */
  slipLabel?: string
}

/** One alternate line — home/over (a) + away/under (b). */
export type SoccerLinePair = {
  line: number
  a: SoccerOdds
  b: SoccerOdds
}

export type SoccerEvent = {
  id: string
  home: string
  away: string
  homeAbbr: string
  awayAbbr: string
  /** Pre-match kickoff label, or live clock. */
  when: string
  live?: boolean
  score?: [number, number]
  picks: SoccerOdds[]
  /** Extra desktop columns beyond the mobile row. */
  desktopPicks?: SoccerOdds[]
  /** Alternate handicaps for the Spread column. */
  spreadLines?: SoccerLinePair[]
  /** Alternate totals for the Total column. */
  totalLines?: SoccerLinePair[]
  defaultSpreadLine?: number
  defaultTotalLine?: number
}

export type SoccerLeagueSection = {
  id: string
  name: string
  icon: string
  events: SoccerEvent[]
  moreCount: number
}

export type SoccerQuickLink = {
  id: string
  label: string
  icon: string
  /** When set, tile soft-navs out of soccer (e.g. casino cross-sell). */
  href?: string
  /** Full game art in the icon slot (no white logo plate). */
  art?: boolean
}

export type SoccerRailItem = {
  id: string
  label: string
  /** ShellIcon / Lumen sports mark key — mono sport rail. */
  icon: SoccerRailIcon
  href: string
}

export type SoccerRailIcon =
  'bets' | 'soccer' | 'football' | 'basketball' | 'tennis' | 'baseball' | 'hockey' | 'mma'

export type SoccerCountryGroup = {
  id: string
  name: string
  flag: string
  leagues: { id: string; name: string; icon?: string }[]
}

export const SOCCER_MODES: { id: SoccerMode; label: string }[] = [
  { id: 'games', label: 'Games' },
  { id: 'sgp', label: 'SGP' },
  { id: 'boosts', label: 'Odds Boosts' },
  { id: 'mega', label: 'Mega Parlays' },
  { id: 'outrights', label: 'Outrights' },
  { id: 'leagues', label: 'All Leagues' },
]

/** Every sport has its own lobby route (V5 · Combos fills them; earlier versions show Sports Home). */
export const SOCCER_SPORT_RAIL: SoccerRailItem[] = [
  { id: 'my-bets', label: 'My Bets', icon: 'bets', href: '/sports/my-bets' },
  { id: 'soccer', label: 'Soccer', icon: 'soccer', href: '/sports/soccer' },
  { id: 'football', label: 'Football', icon: 'football', href: '/sports/football' },
  { id: 'basketball', label: 'Basketball', icon: 'basketball', href: '/sports/basketball' },
  { id: 'tennis', label: 'Tennis', icon: 'tennis', href: '/sports/tennis' },
  { id: 'baseball', label: 'Baseball', icon: 'baseball', href: '/sports/baseball' },
  { id: 'hockey', label: 'Hockey', icon: 'hockey', href: '/sports/hockey' },
  { id: 'mma', label: 'MMA', icon: 'mma', href: '/sports/mma' },
]

/** PropShopX quicklinks — Figma-exported marks (`public/shell/figma/soccer/icon-*.svg`). */
export const SOCCER_QUICK_LINKS: SoccerQuickLink[] = [
  { id: 'all', label: 'All Soccer', icon: '' },
  { id: 'epl', label: 'Premier League', icon: '/shell/figma/soccer/icon-epl.svg' },
  { id: 'laliga', label: 'La Liga', icon: '/shell/figma/soccer/icon-laliga.svg' },
  { id: 'seriea', label: 'Serie A', icon: '/shell/figma/soccer/icon-seriea.svg' },
  { id: 'bundesliga', label: 'Bundesliga', icon: '/shell/figma/soccer/icon-bundesliga.svg' },
  { id: 'ligue1', label: 'Ligue 1', icon: '/shell/figma/soccer/icon-ligue1.svg' },
  /* Casino cross-sell — DVD / poster tiles (152×207 art), not league chips. */
  {
    id: 'live',
    label: 'Live Roulette',
    icon: '/casino/tiles/live/dealer-red.png',
    href: '/casino/live',
    art: true,
  },
  {
    id: 'blackjack',
    label: 'Blackjack',
    icon: '/games/originals/blackjack.png',
    href: '/casino/category/blackjack',
    art: true,
  },
]

/** League page mode pills — Games | SGP | Odds Boosts | Mega | All Leagues. */
export const SOCCER_LEAGUE_MODES: { id: SoccerMode; label: string }[] = [
  { id: 'games', label: 'Games' },
  { id: 'sgp', label: 'SGP' },
  { id: 'boosts', label: 'Odds Boosts' },
  { id: 'mega', label: 'Mega Parlays' },
  { id: 'leagues', label: 'All Leagues' },
]

export function isSoccerLeagueView(leagueFilter: string) {
  return leagueFilter !== 'all'
}

export const SOCCER_COUNTRY_OPTIONS = [
  { id: 'all', label: 'All Countries' },
  { id: 'england', label: 'England' },
  { id: 'spain', label: 'Spain' },
  { id: 'italy', label: 'Italy' },
  { id: 'germany', label: 'Germany' },
  { id: 'france', label: 'France' },
  { id: 'usa', label: 'USA' },
] as const

export const SOCCER_LEAGUE_OPTIONS = [
  { id: 'all', label: 'All Leagues', country: 'all' },
  { id: 'epl', label: 'Premier League', country: 'england' },
  { id: 'championship', label: 'Championship', country: 'england' },
  { id: 'laliga', label: 'La Liga', country: 'spain' },
  { id: 'seriea', label: 'Serie A', country: 'italy' },
  { id: 'bundesliga', label: 'Bundesliga', country: 'germany' },
  { id: 'ligue1', label: 'Ligue 1', country: 'france' },
  { id: 'mls', label: 'MLS', country: 'usa' },
  { id: 'ucl', label: 'Champions League', country: 'all' },
] as const

function parseLineToken(raw: string): number {
  const n = Number.parseFloat(raw.replace(/^[OU]\s*/i, ''))
  return Number.isFinite(n) ? n : 0
}

function fmtHandicap(n: number): string {
  const r = Math.round(n * 100) / 100
  if (Object.is(r, -0)) return '0'
  if (r > 0) return `+${r}`
  return `${r}`
}

function lineKey(n: number): string {
  return String(Math.round(n * 100) / 100).replace('.', '_')
}

/** American-style ladder — half / whole points only (no Asian x.25 / x.75 quarter lines). */
const LINE_DELTAS = [-1.5, -1, -0.5, 0, 0.5, 1, 1.5]
/** Implied-probability shift per half-point step. */
const PROB_PER_STEP = 0.08

export function americanToProb(n: number): number {
  return n < 0 ? -n / (-n + 100) : 100 / (n + 100)
}

/** Always a valid American price: ≤ -100 or ≥ +100, never in between. */
export function probToAmerican(p: number): string {
  if (p >= 0.5) return `${-Math.round((100 * p) / (1 - p))}`
  return `+${Math.round((100 * (1 - p)) / p)}`
}

/** Main row keeps the seed price; each step away moves the implied probability by `PROB_PER_STEP`. */
function americanNear(base: string, step: number): string {
  const n = Number.parseInt(base.replace(/^\+/, ''), 10)
  if (!Number.isFinite(n) || step === 0) return base
  const p = Math.min(0.95, Math.max(0.05, americanToProb(n) + step * PROB_PER_STEP))
  return probToAmerican(p)
}

function buildSpreadLines(prefix: string, homeMain: number, homeOdds: string): SoccerLinePair[] {
  return LINE_DELTAS.map((d, i) => {
    const h = Math.round((homeMain + d) * 100) / 100
    const away = Math.round(-h * 100) / 100
    /* More points for home → home more likely (shorter), away longer. */
    const dist = i - 3
    return {
      line: h,
      a: {
        id: `${prefix}-sh-${lineKey(h)}`,
        label: fmtHandicap(h),
        odds: americanNear(homeOdds, dist),
        family: 'spread',
        side: 'a',
        line: h,
      },
      b: {
        id: `${prefix}-sa-${lineKey(h)}`,
        label: fmtHandicap(away),
        odds: americanNear('+120', -dist),
        family: 'spread',
        side: 'b',
        line: h,
      },
    }
  })
}

function buildTotalLines(prefix: string, main: number, overOdds: string): SoccerLinePair[] {
  return LINE_DELTAS.map((d, i) => {
    const line = Math.round((main + d) * 100) / 100
    /* Higher total → over less likely (longer), under shorter. */
    const dist = i - 3
    return {
      line,
      a: {
        id: `${prefix}-to-${lineKey(line)}`,
        label: `O ${line}`,
        odds: americanNear(overOdds, -dist),
        family: 'total',
        side: 'a',
        line,
      },
      b: {
        id: `${prefix}-tu-${lineKey(line)}`,
        label: `U ${line}`,
        odds: americanNear('+112', dist),
        family: 'total',
        side: 'b',
        line,
      },
    }
  })
}

/** Board picks for the active spread/total lines (defaults to seed mains). */
export function picksWithActiveLines(
  event: SoccerEvent,
  activeSpread?: number,
  activeTotal?: number,
): SoccerOdds[] {
  const base = event.desktopPicks ?? event.picks
  const ml = base.slice(0, 3)
  const half = base.slice(7, 10)
  const sLine = activeSpread ?? event.defaultSpreadLine
  const tLine = activeTotal ?? event.defaultTotalLine
  const sp =
    event.spreadLines?.find((p) => p.line === sLine) ??
    event.spreadLines?.find((p) => p.line === event.defaultSpreadLine) ??
    null
  const tp =
    event.totalLines?.find((p) => p.line === tLine) ??
    event.totalLines?.find((p) => p.line === event.defaultTotalLine) ??
    null
  return [
    ...ml,
    ...(sp ? [sp.a, sp.b] : base.slice(3, 5)),
    ...(tp ? [tp.a, tp.b] : base.slice(5, 7)),
    ...half,
  ]
}

const eplPicks = (
  prefix: string,
  homeAbbr: string,
  awayAbbr: string,
  ml: [string, string, string],
  spread: [string, string],
  total: [string, string],
  half: [string, string, string],
): Pick<
  SoccerEvent,
  'picks' | 'desktopPicks' | 'spreadLines' | 'totalLines' | 'defaultSpreadLine' | 'defaultTotalLine'
> => {
  const homeMain = parseLineToken(spread[0])
  const totalMain = parseLineToken(total[0])
  const spreadLines = buildSpreadLines(prefix, homeMain, spread[1])
  const totalLines = buildTotalLines(prefix, totalMain, total[1])
  const mainSpread = spreadLines.find((p) => p.line === homeMain) ?? spreadLines[3]!
  const mainTotal = totalLines.find((p) => p.line === totalMain) ?? totalLines[3]!
  return {
    picks: [
      { id: `${prefix}-h`, label: homeAbbr, odds: ml[0] },
      { id: `${prefix}-d`, label: 'TIE', odds: ml[1] },
      { id: `${prefix}-a`, label: awayAbbr, odds: ml[2] },
      {
        id: `${prefix}-s`,
        label: spread[0],
        odds: spread[1],
        family: 'spread',
        side: 'a',
        line: homeMain,
      },
    ],
    desktopPicks: [
      { id: `${prefix}-h`, label: homeAbbr, odds: ml[0] },
      { id: `${prefix}-d`, label: 'TIE', odds: ml[1] },
      { id: `${prefix}-a`, label: awayAbbr, odds: ml[2] },
      mainSpread.a,
      mainSpread.b,
      mainTotal.a,
      mainTotal.b,
      { id: `${prefix}-1h`, label: homeAbbr, odds: half[0] },
      { id: `${prefix}-1d`, label: 'TIE', odds: half[1] },
      { id: `${prefix}-1a`, label: awayAbbr, odds: half[2] },
    ],
    spreadLines,
    totalLines,
    defaultSpreadLine: homeMain,
    defaultTotalLine: totalMain,
  }
}

const cov = eplPicks(
  'cov',
  'COV',
  'BRI',
  ['+209', '+290', '+120'],
  ['-1.5', '-136'],
  ['3', '-128'],
  ['+138', '+165', '+210'],
)
const mun = eplPicks(
  'mun',
  'MUN',
  'MCI',
  ['+340', '+280', '-125'],
  ['+1.5', '-110'],
  ['3', '-115'],
  ['+280', '+190', '+110'],
)
const lee = eplPicks(
  'lee',
  'LEE',
  'NEW',
  ['+195', '+240', '+145'],
  ['-0.5', '+105'],
  ['2.5', '-120'],
  ['+165', '+155', '+180'],
)
const bre = eplPicks(
  'bre',
  'BRE',
  'CHE',
  ['+310', '+265', '-110'],
  ['+1', '-115'],
  ['2.5', '-108'],
  ['+250', '+170', '+125'],
)
const tot = eplPicks(
  'tot',
  'TOT',
  'AVL',
  ['+155', '+230', '+175'],
  ['-0.5', '-105'],
  ['2.5', '-112'],
  ['+140', '+150', '+195'],
)

export const SOCCER_GAME_SECTIONS: SoccerLeagueSection[] = [
  {
    id: 'epl',
    name: 'Premier League',
    icon: '/banners/sports_league/prem.svg',
    moreCount: 3,
    events: [
      {
        id: 'cov-bri',
        home: 'Coventry City',
        away: 'Brighton & Hove Albion',
        homeAbbr: 'COV',
        awayAbbr: 'BRI',
        when: "45+2'",
        live: true,
        score: [1, 1],
        ...cov,
      },
      {
        id: 'mun-mci',
        home: 'Manchester United',
        away: 'Manchester City',
        homeAbbr: 'MUN',
        awayAbbr: 'MCI',
        when: 'Sun 13 Sep, 3:30pm',
        ...mun,
      },
      {
        id: 'lee-new',
        home: 'Leeds United',
        away: 'Newcastle United',
        homeAbbr: 'LEE',
        awayAbbr: 'NEW',
        when: 'Sun 13 Sep, 4:00pm',
        ...lee,
      },
      {
        id: 'bre-che',
        home: 'Brentford',
        away: 'Chelsea',
        homeAbbr: 'BRE',
        awayAbbr: 'CHE',
        when: 'Sun 13 Sep, 4:30pm',
        ...bre,
      },
      {
        id: 'tot-avl',
        home: 'Tottenham Hotspur',
        away: 'Aston Villa',
        homeAbbr: 'TOT',
        awayAbbr: 'AVL',
        when: 'Mon 14 Sep, 8:00pm',
        ...tot,
      },
    ],
  },
  {
    id: 'championship',
    name: 'Championship',
    icon: '/shell/figma/soccer/soccer-ball.svg',
    moreCount: 0,
    events: [
      {
        id: 'lei-nor',
        home: 'Leicester City',
        away: 'Norwich City',
        homeAbbr: 'LEI',
        awayAbbr: 'NOR',
        when: 'Sat 12 Sep, 3:00pm',
        ...eplPicks(
          'lei',
          'LEI',
          'NOR',
          ['-125', '+260', '+340'],
          ['-0.5', '-110'],
          ['2.5', '-115'],
          ['-105', '+170', '+280'],
        ),
      },
      {
        id: 'sou-ips',
        home: 'Southampton',
        away: 'Ipswich Town',
        homeAbbr: 'SOU',
        awayAbbr: 'IPS',
        when: 'Sat 12 Sep, 5:30pm',
        ...eplPicks(
          'sou',
          'SOU',
          'IPS',
          ['+145', '+230', '+190'],
          ['-0.5', '+105'],
          ['2.5', '-108'],
          ['+130', '+155', '+210'],
        ),
      },
    ],
  },
  {
    id: 'laliga',
    name: 'La Liga',
    icon: '/banners/sports_league/laliga-mark.svg',
    moreCount: 3,
    events: [
      {
        id: 'rma-bar',
        home: 'Real Madrid',
        away: 'Barcelona',
        homeAbbr: 'RMA',
        awayAbbr: 'BAR',
        when: 'Sun 13 Sep, 8:00pm',
        ...eplPicks(
          'rma',
          'RMA',
          'BAR',
          ['+165', '+250', '+155'],
          ['-0.5', '-110'],
          ['3', '-118'],
          ['+145', '+160', '+185'],
        ),
      },
      {
        id: 'atm-sev',
        home: 'Atlético Madrid',
        away: 'Sevilla',
        homeAbbr: 'ATM',
        awayAbbr: 'SEV',
        when: 'Sun 13 Sep, 3:15pm',
        ...eplPicks(
          'atm',
          'ATM',
          'SEV',
          ['-140', '+260', '+380'],
          ['-1', '-105'],
          ['2.5', '-115'],
          ['-115', '+175', '+320'],
        ),
      },
      {
        id: 'vil-bet',
        home: 'Villarreal',
        away: 'Real Betis',
        homeAbbr: 'VIL',
        awayAbbr: 'BET',
        when: 'Sat 12 Sep, 5:30pm',
        ...eplPicks(
          'vil',
          'VIL',
          'BET',
          ['+125', '+230', '+210'],
          ['-0.5', '+100'],
          ['2.5', '-108'],
          ['+130', '+150', '+220'],
        ),
      },
    ],
  },
]

/** Map quick-link ids → game section ids (leagues without seed keep empty). */
export function soccerSectionsForFilter(filterId: string): SoccerLeagueSection[] {
  if (filterId === 'all') return SOCCER_GAME_SECTIONS
  return SOCCER_GAME_SECTIONS.filter((s) => s.id === filterId)
}

export type SoccerFuture = {
  id: string
  name: string
  picks: (SoccerOdds & { team?: string })[]
}

const slug = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, '-')
const soccerFuture = (market: string, rows: [string, string, string?][]): SoccerFuture => ({
  id: slug(market),
  name: market,
  picks: rows.map(([label, odds, team]) => ({
    id: `sfut-${slug(market)}-${slug(label)}`,
    label,
    odds,
    team,
  })),
})

/** Book-style rounding: 5s under +300, 25s under +1000, 50s above. */
function roundPrice(american: string): string {
  const n = Number.parseInt(american.replace(/^\+/, ''), 10)
  if (n < 0) return `${Math.round(n / 5) * 5}`
  const step = n < 300 ? 5 : n < 1000 ? 25 : 50
  return `+${Math.round(n / step) * step}`
}

/** Power-law walk out from the favourite so long markets stay ordered and believable. */
function ladderPrices(count: number, firstProb: number, falloff: number): string[] {
  return Array.from({ length: count }, (_, i) =>
    roundPrice(probToAmerican(Math.max(0.004, firstProb / Math.pow(i + 1, falloff)))),
  )
}

const outright = (
  market: string,
  rows: [string, string?][],
  firstProb: number,
  falloff: number,
): SoccerFuture => {
  const prices = ladderPrices(rows.length, firstProb, falloff)
  return soccerFuture(
    market,
    rows.map(([name, team], i) => [name, prices[i]!, team]),
  )
}

/** Outright markets — straight-only legs (never grouped as an SGP). */
export const SOCCER_OUTRIGHTS: SoccerFuture[] = [
  outright(
    'Premier League Winner',
    [
      ['Arsenal FC', 'Arsenal FC'],
      ['Manchester City', 'Manchester City'],
      ['Liverpool FC', 'Liverpool FC'],
      ['Chelsea FC', 'Chelsea FC'],
      ['Newcastle United', 'Newcastle United'],
      ['Aston Villa', 'Aston Villa'],
      ['Tottenham Hotspur', 'Tottenham Hotspur'],
      ['Manchester United', 'Manchester United'],
      ['Brighton & Hove Albion', 'Brighton & Hove Albion'],
      ['Nottingham Forest', 'Nottingham Forest'],
      ['West Ham United', 'West Ham United'],
      ['Crystal Palace', 'Crystal Palace'],
      ['AFC Bournemouth', 'AFC Bournemouth'],
      ['Wolverhampton Wanderers', 'Wolverhampton Wanderers'],
      ['Leeds United', 'Leeds United'],
      ['Coventry City', 'Coventry City'],
      ['Ipswich Town', 'Ipswich Town'],
      ['Leicester City', 'Leicester City'],
      ['Norwich City', 'Norwich City'],
      ['Everton'],
    ],
    0.38,
    0.9,
  ),
  outright(
    'UEFA Champions League Winner',
    [
      ['Real Madrid', 'Real Madrid'],
      ['Manchester City', 'Manchester City'],
      ['Arsenal FC', 'Arsenal FC'],
      ['Bayern Munich'],
      ['Barcelona'],
      ['Liverpool FC', 'Liverpool FC'],
      ['Paris Saint-Germain'],
      ['Inter Milan'],
      ['Chelsea FC', 'Chelsea FC'],
      ['Atletico Madrid'],
      ['Bayer Leverkusen'],
      ['Borussia Dortmund'],
      ['Juventus'],
      ['Newcastle United', 'Newcastle United'],
      ['AC Milan'],
      ['Tottenham Hotspur', 'Tottenham Hotspur'],
      ['Napoli'],
      ['Atalanta'],
      ['Aston Villa', 'Aston Villa'],
      ['Benfica'],
      ['Sporting CP'],
      ['FC Porto'],
      ['RB Leipzig'],
      ['PSV Eindhoven'],
      ['Feyenoord'],
      ['Club Brugge'],
      ['Celtic'],
      ['Galatasaray'],
      ['Olympique de Marseille'],
      ['Monaco'],
      ['Eintracht Frankfurt'],
      ['Villarreal'],
      ['Shakhtar Donetsk'],
      ['Red Star Belgrade'],
      ['Slavia Prague'],
      ['Young Boys'],
    ],
    0.18,
    0.7,
  ),
  outright(
    'World Cup 2026 Winner',
    [
      ['Spain'],
      ['France'],
      ['England'],
      ['Brazil'],
      ['Argentina'],
      ['Germany'],
      ['Portugal'],
      ['Netherlands'],
      ['Belgium'],
      ['Italy'],
      ['Uruguay'],
      ['Colombia'],
      ['Croatia'],
      ['USA'],
      ['Mexico'],
      ['Japan'],
      ['Morocco'],
      ['Switzerland'],
      ['Denmark'],
      ['Senegal'],
      ['Ecuador'],
      ['South Korea'],
      ['Austria'],
      ['Norway'],
      ['Turkey'],
      ['Canada'],
      ['Australia'],
      ['Poland'],
      ['Ukraine'],
      ['Serbia'],
      ['Nigeria'],
      ['Egypt'],
      ['Iran'],
      ['Sweden'],
      ['Scotland'],
      ['Ivory Coast'],
      ['Ghana'],
      ['Algeria'],
      ['Paraguay'],
      ['Peru'],
      ['Chile'],
      ['Tunisia'],
      ['Saudi Arabia'],
      ['Qatar'],
      ['Jordan'],
      ['Uzbekistan'],
      ['New Zealand'],
      ['Panama'],
    ],
    0.17,
    0.75,
  ),
  outright(
    'Premier League Golden Boot',
    [
      ['Erling Haaland', 'Manchester City'],
      ['Mohamed Salah', 'Liverpool FC'],
      ['Alexander Isak', 'Newcastle United'],
      ['Cole Palmer', 'Chelsea FC'],
      ['Bukayo Saka', 'Arsenal FC'],
      ['Ollie Watkins', 'Aston Villa'],
      ['Viktor Gyokeres', 'Arsenal FC'],
      ['Hugo Ekitike', 'Liverpool FC'],
      ['Bryan Mbeumo', 'Manchester United'],
      ['Benjamin Sesko', 'Manchester United'],
      ['Jarrod Bowen', 'West Ham United'],
      ['Chris Wood', 'Nottingham Forest'],
      ['Jean-Philippe Mateta', 'Crystal Palace'],
      ['Dominic Solanke', 'Tottenham Hotspur'],
      ['Joao Pedro', 'Chelsea FC'],
      ['Matheus Cunha', 'Manchester United'],
      ['Cody Gakpo', 'Liverpool FC'],
      ['Antoine Semenyo', 'AFC Bournemouth'],
      ['Danny Welbeck', 'Brighton & Hove Albion'],
      ['Phil Foden', 'Manchester City'],
    ],
    0.6,
    1.3,
  ),
  outright(
    'Premier League Top 4 Finish',
    [
      ['Chelsea FC', 'Chelsea FC'],
      ['Newcastle United', 'Newcastle United'],
      ['Aston Villa', 'Aston Villa'],
      ['Tottenham Hotspur', 'Tottenham Hotspur'],
      ['Manchester United', 'Manchester United'],
      ['Brighton & Hove Albion', 'Brighton & Hove Albion'],
      ['Nottingham Forest', 'Nottingham Forest'],
      ['West Ham United', 'West Ham United'],
      ['Crystal Palace', 'Crystal Palace'],
      ['AFC Bournemouth', 'AFC Bournemouth'],
      ['Wolverhampton Wanderers', 'Wolverhampton Wanderers'],
      ['Leeds United', 'Leeds United'],
      ['Coventry City', 'Coventry City'],
      ['Ipswich Town', 'Ipswich Town'],
      ['Leicester City', 'Leicester City'],
      ['Norwich City', 'Norwich City'],
      ['Everton'],
    ],
    0.55,
    0.9,
  ),
  outright(
    'Premier League Relegation',
    [
      ['Everton'],
      ['Norwich City', 'Norwich City'],
      ['Leicester City', 'Leicester City'],
      ['Ipswich Town', 'Ipswich Town'],
      ['Coventry City', 'Coventry City'],
      ['Leeds United', 'Leeds United'],
      ['Wolverhampton Wanderers', 'Wolverhampton Wanderers'],
      ['AFC Bournemouth', 'AFC Bournemouth'],
      ['Crystal Palace', 'Crystal Palace'],
      ['West Ham United', 'West Ham United'],
      ['Nottingham Forest', 'Nottingham Forest'],
      ['Brighton & Hove Albion', 'Brighton & Hove Albion'],
      ['Manchester United', 'Manchester United'],
      ['Tottenham Hotspur', 'Tottenham Hotspur'],
      ['Aston Villa', 'Aston Villa'],
      ['Newcastle United', 'Newcastle United'],
      ['Chelsea FC', 'Chelsea FC'],
      ['Liverpool FC', 'Liverpool FC'],
      ['Manchester City', 'Manchester City'],
      ['Arsenal FC', 'Arsenal FC'],
    ],
    0.7,
    1,
  ),
]

export const SOCCER_COUNTRY_GROUPS: SoccerCountryGroup[] = [
  {
    id: 'top',
    name: 'Top Leagues',
    flag: '/sports_icons/soccer.svg',
    leagues: [
      { id: 'epl', name: 'Premier League', icon: '/banners/sports_league/prem.svg' },
      { id: 'laliga', name: 'La Liga', icon: '/banners/sports_league/laliga-mark.svg' },
      { id: 'ligue1', name: 'Ligue 1' },
      { id: 'seriea', name: 'Serie A' },
      { id: 'bundesliga', name: 'Bundesliga' },
      { id: 'ucl', name: 'UEFA Champions League', icon: '/banners/sports_league/champions.svg' },
    ],
  },
  {
    id: 'england',
    name: 'England',
    flag: '/sports_icons/soccer.svg',
    leagues: [
      { id: 'epl', name: 'Premier League', icon: '/banners/sports_league/prem.svg' },
      { id: 'championship', name: 'Championship' },
      { id: 'league-one', name: 'League One' },
      { id: 'league-two', name: 'League Two' },
    ],
  },
  { id: 'argentina', name: 'Argentina', flag: '/sports_icons/soccer.svg', leagues: [] },
  { id: 'belgium', name: 'Belgium', flag: '/sports_icons/soccer.svg', leagues: [] },
  { id: 'brazil', name: 'Brazil', flag: '/sports_icons/soccer.svg', leagues: [] },
  { id: 'france', name: 'France', flag: '/sports_icons/soccer.svg', leagues: [] },
  { id: 'germany', name: 'Germany', flag: '/sports_icons/soccer.svg', leagues: [] },
  { id: 'italy', name: 'Italy', flag: '/sports_icons/soccer.svg', leagues: [] },
  { id: 'spain', name: 'Spain', flag: '/sports_icons/soccer.svg', leagues: [] },
  {
    id: 'usa',
    name: 'USA',
    flag: '/sports_icons/soccer.svg',
    leagues: [{ id: 'mls', name: 'MLS', icon: '/banners/sports_league/mls.svg' }],
  },
]

export const DESKTOP_MARKET_HEADERS = [
  '3-Way Regulation',
  'Spread',
  'Total',
  '1H Moneyline',
] as const

/** Local crests under /public/team — used on the games board. */
const SOCCER_TEAM_LOGO: Record<string, string> = {
  'Manchester United': '/team/Manchester United.png',
  'Manchester City': '/team/Manchester City.png',
  'Brighton & Hove Albion': '/team/Brighton & Hove Albion.png',
  Liverpool: '/team/Liverpool FC.png',
  'Liverpool FC': '/team/Liverpool FC.png',
  Chelsea: '/team/Chelsea FC.png',
  'Chelsea FC': '/team/Chelsea FC.png',
  Arsenal: '/team/Arsenal FC.png',
  'Arsenal FC': '/team/Arsenal FC.png',
  Tottenham: '/team/Tottenham Hotspur.png',
  'Tottenham Hotspur': '/team/Tottenham Hotspur.png',
  'Newcastle United': '/team/Newcastle United.png',
  'Aston Villa': '/team/Aston Villa.png',
  'West Ham United': '/team/West Ham United.png',
  Everton: '/team/Everton FC.png',
  Fulham: '/team/Fulham FC.png',
  'Crystal Palace': '/team/Crystal Palace.png',
  Brentford: '/team/Brentford FC.png',
  'Wolverhampton Wanderers': '/team/Wolverhampton Wanderers.png',
  'Nottingham Forest': '/team/Nottingham Forest.png',
  'Leeds United': '/team/Leeds United.png',
  'AFC Bournemouth': '/team/AFC Bournemouth.png',
  'Coventry City': '/team/Coventry City.png',
  'Leicester City': '/team/Leicester City.png',
  'Norwich City': '/team/Norwich City.png',
  Southampton: '/team/Southampton.png',
  'Ipswich Town': '/team/Ipswich Town.png',
  'Real Madrid': '/team/Real Madrid.png',
  Barcelona: '/team/Barcelona.png',
}

/** Crest for any board team — soccer clubs, then NFL marks. */
export function soccerTeamLogo(name: string): string {
  return SOCCER_TEAM_LOGO[name] ?? nflTeamByName(name)?.logo ?? ''
}
