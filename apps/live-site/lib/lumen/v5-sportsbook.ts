/**
 * V5 · Combos — the full sportsbook. Every sport in the side nav gets leagues, games, live
 * scores, deep event markets and futures, generated deterministically so ids never drift
 * between the board, the event view and the betslip. Football and Soccer keep their V1 boards
 * and gain extra leagues here.
 *
 * Teams are real clubs and nations; every individual (players, fighters, golfers, horses) is
 * invented — no real people's names in demos.
 */
import type { SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import type { SoccerEvent, SoccerLinePair, SoccerOdds } from '@/lib/lumen/soccer-sport'
import {
  bookPrice,
  type EventColumnHead,
  type EventMarket,
  type EventTab,
  type FormResult,
  type GridMarket,
  type LadderMarket,
  type ListMarket,
  type PlayerLinesMarket,
  type PlayersMarket,
  type RowMarket,
  type SportsEventModel,
} from '@/lib/lumen/sports-event'
import { priceToAmerican, type MarketOutcome, type SportsMarket } from '@/lib/lumen/sports-markets'

// ─── Sports registry ─────────────────────────────────────────

export type V5SportId =
  | 'soccer'
  | 'nfl'
  | 'basketball'
  | 'baseball'
  | 'hockey'
  | 'tennis'
  | 'mma'
  | 'boxing'
  | 'golf'
  | 'horse-racing'
  | 'lacrosse'
  | 'pool'
  | 'rugby'
  | 'table-tennis'
  | 'volleyball'

type Format = 'team' | 'duel' | 'field'

type LeagueSeed = {
  name: string
  logo: string
  /** Team sports: real clubs / nations. Duels and fields: invented each time from the name pools. */
  teams?: string[]
  /** How many games (or races) to put on the board. */
  games: number
  /** Duels — competitor count to draw from the invented pool. */
  field?: number
  /** Event title for golf / racing boards ("Kempton Park"). */
  venue?: string
}

export type SportDef = {
  id: V5SportId
  label: string
  slug: string
  icon: string
  format: Format
  /** Main market has a draw (soccer, rugby, boxing). */
  draw: boolean
  /** US order — away first, "@". */
  awayFirst: boolean
  unit: string
  spreadName: string
  totalName: string
  /** Probability slope per unit of line — sets how fast cover chances fall off. */
  spreadSlope: number
  totalMean: number
  totalSlope: number
  totalStep: number
  /** Live score ceiling for the scoreboard. */
  scoreMax: number
  clocks: string[]
  times: string[]
  leagues: LeagueSeed[]
}

const ICON = (f: string) => `/sports_icons/${f}`

export const V5_SPORTS: SportDef[] = [
  {
    id: 'soccer',
    label: 'Soccer',
    slug: 'soccer',
    icon: ICON('soccer.svg'),
    format: 'team',
    draw: true,
    awayFirst: false,
    unit: 'goals',
    spreadName: 'Handicap',
    totalName: 'Total Goals',
    spreadSlope: 1.1,
    totalMean: 2.7,
    totalSlope: 1.05,
    totalStep: 1,
    scoreMax: 3,
    clocks: ["23'", "38'", "HT", "57'", "71'", "84'"],
    times: ['12:30 PM', '3:00 PM', '5:30 PM', '8:00 PM'],
    leagues: [
      {
        name: 'Serie A',
        logo: '/leagues/soccer/italy/serie-a.svg',
        games: 6,
        teams: ['Inter', 'AC Milan', 'Juventus', 'Napoli', 'Roma', 'Lazio', 'Atalanta', 'Fiorentina', 'Bologna', 'Torino', 'Udinese', 'Genoa'],
      },
      {
        name: 'Bundesliga',
        logo: '/leagues/soccer/germany/bundesliga.svg',
        games: 6,
        teams: ['Bayern Munich', 'Borussia Dortmund', 'Bayer Leverkusen', 'RB Leipzig', 'Eintracht Frankfurt', 'VfB Stuttgart', 'SC Freiburg', 'VfL Wolfsburg', 'Union Berlin', 'Werder Bremen', 'Mainz 05', 'Hoffenheim'],
      },
      {
        name: 'Ligue 1',
        logo: '/leagues/soccer/france/ligue-1.svg',
        games: 5,
        teams: ['Paris Saint-Germain', 'Marseille', 'Monaco', 'Lyon', 'Lille', 'Nice', 'Lens', 'Rennes', 'Strasbourg', 'Nantes'],
      },
      {
        name: 'UEFA Europa League',
        logo: '/leagues/soccer/europe/uefa-europa-league.svg',
        games: 4,
        teams: ['Tottenham Hotspur', 'Manchester United', 'Ajax', 'Porto', 'Roma', 'Eintracht Frankfurt', 'Olympiacos', 'Real Sociedad'],
      },
      {
        name: 'Liga MX',
        logo: '/leagues/soccer/mexico/liga-mx.svg',
        games: 4,
        teams: ['Club América', 'Guadalajara', 'Tigres UANL', 'Monterrey', 'Cruz Azul', 'Pumas UNAM', 'Toluca', 'León'],
      },
      {
        name: 'MLS',
        logo: '/leagues/soccer/usa/mls.svg',
        games: 3,
        teams: ['LAFC', 'LA Galaxy', 'Columbus Crew', 'Seattle Sounders', 'FC Cincinnati', 'Orlando City'],
      },
    ],
  },
  {
    id: 'nfl',
    label: 'Football',
    slug: 'football',
    icon: ICON('football.svg'),
    format: 'team',
    draw: false,
    awayFirst: true,
    unit: 'points',
    spreadName: 'Spread',
    totalName: 'Total Points',
    spreadSlope: 0.17,
    totalMean: 45,
    totalSlope: 0.09,
    totalStep: 3,
    scoreMax: 34,
    clocks: ['Q1 6:10', 'Q2 1:42', 'Q3 9:05', 'Q4 4:30'],
    times: ['1:00 PM', '4:25 PM', '8:20 PM'],
    leagues: [],
  },
  {
    id: 'basketball',
    label: 'Basketball',
    slug: 'basketball',
    icon: ICON('Basketball.svg'),
    format: 'team',
    draw: false,
    awayFirst: true,
    unit: 'points',
    spreadName: 'Spread',
    totalName: 'Total Points',
    spreadSlope: 0.13,
    totalMean: 226,
    totalSlope: 0.075,
    totalStep: 4,
    scoreMax: 118,
    clocks: ['Q1 4:18', 'Q2 8:51', 'Q2 0:42', 'Q3 6:07', 'Q4 3:12'],
    times: ['7:00 PM', '7:30 PM', '8:00 PM', '10:00 PM', '10:30 PM'],
    leagues: [
      {
        name: 'NBA',
        logo: '/leagues/basketball/usa/nba.svg',
        games: 9,
        teams: [
          'Boston Celtics', 'Los Angeles Lakers', 'Golden State Warriors', 'Denver Nuggets', 'Milwaukee Bucks', 'New York Knicks',
          'Miami Heat', 'Phoenix Suns', 'Philadelphia 76ers', 'Dallas Mavericks', 'Oklahoma City Thunder', 'Cleveland Cavaliers',
          'Minnesota Timberwolves', 'LA Clippers', 'Sacramento Kings', 'Indiana Pacers', 'Orlando Magic', 'Houston Rockets',
        ],
      },
      {
        name: 'EuroLeague',
        logo: '/leagues/basketball/europe/euroleague.svg',
        games: 5,
        teams: ['Real Madrid', 'FC Barcelona', 'Olympiacos', 'Panathinaikos', 'Fenerbahçe', 'Anadolu Efes', 'Partizan', 'Bayern Munich', 'AS Monaco', 'Virtus Bologna'],
      },
      {
        name: 'NCAAB',
        logo: '/leagues/basketball/usa/ncaab.svg',
        games: 6,
        teams: ['Duke Blue Devils', 'Kansas Jayhawks', 'Kentucky Wildcats', 'North Carolina Tar Heels', 'UConn Huskies', 'Gonzaga Bulldogs', 'Houston Cougars', 'Purdue Boilermakers', 'Arizona Wildcats', 'Baylor Bears', 'Tennessee Volunteers', 'Alabama Crimson Tide'],
      },
    ],
  },
  {
    id: 'hockey',
    label: 'Hockey',
    slug: 'hockey',
    icon: ICON('Hockey.svg'),
    format: 'team',
    draw: false,
    awayFirst: true,
    unit: 'goals',
    spreadName: 'Puck Line',
    totalName: 'Total Goals',
    spreadSlope: 0.95,
    totalMean: 6.1,
    totalSlope: 0.85,
    totalStep: 1,
    scoreMax: 4,
    clocks: ['P1 12:40', 'P2 8:15', 'P2 1:03', 'P3 14:22', 'P3 5:48'],
    times: ['7:00 PM', '7:30 PM', '8:00 PM', '10:00 PM'],
    leagues: [
      {
        name: 'NHL',
        logo: '/banners/sports_league/NHL.svg',
        games: 10,
        teams: [
          'Toronto Maple Leafs', 'Boston Bruins', 'New York Rangers', 'Edmonton Oilers', 'Colorado Avalanche', 'Florida Panthers',
          'Vegas Golden Knights', 'Dallas Stars', 'Tampa Bay Lightning', 'Montreal Canadiens', 'Pittsburgh Penguins', 'Los Angeles Kings',
          'Winnipeg Jets', 'Carolina Hurricanes', 'New Jersey Devils', 'Minnesota Wild', 'Vancouver Canucks', 'Detroit Red Wings', 'Ottawa Senators', 'Seattle Kraken',
        ],
      },
    ],
  },
  {
    id: 'baseball',
    label: 'Baseball',
    slug: 'baseball',
    icon: ICON('baseball.svg'),
    format: 'team',
    draw: false,
    awayFirst: true,
    unit: 'runs',
    spreadName: 'Run Line',
    totalName: 'Total Runs',
    spreadSlope: 0.75,
    totalMean: 8.6,
    totalSlope: 0.45,
    totalStep: 1,
    scoreMax: 7,
    clocks: ['Top 2nd', 'Bot 4th', 'Top 6th', 'Bot 7th', 'Top 9th'],
    times: ['6:10 PM', '8:00 PM', '9:30 PM'],
    leagues: [
      {
        name: 'LMP',
        logo: '/leagues/baseball/mexico/lmp.svg',
        games: 4,
        teams: ['Tomateros de Culiacán', 'Naranjeros de Hermosillo', 'Charros de Jalisco', 'Águilas de Mexicali', 'Sultanes de Monterrey', 'Yaquis de Obregón', 'Venados de Mazatlán', 'Algodoneros de Guasave'],
      },
      {
        name: 'Caribbean Series',
        logo: '/leagues/baseball/usa/mlb.svg',
        games: 2,
        teams: ['Tigres del Licey', 'Leones del Caracas', 'Criollos de Caguas', 'Cangrejeros de Santurce'],
      },
    ],
  },
  {
    id: 'tennis',
    label: 'Tennis',
    slug: 'tennis',
    icon: ICON('tennis.svg'),
    format: 'duel',
    draw: false,
    awayFirst: false,
    unit: 'games',
    spreadName: 'Game Handicap',
    totalName: 'Total Games',
    spreadSlope: 0.32,
    totalMean: 22.5,
    totalSlope: 0.2,
    totalStep: 1,
    scoreMax: 1,
    clocks: ['Set 1 · 4-3', 'Set 2 · 2-1', 'Set 2 · 5-5', 'Set 3 · 1-0'],
    times: ['11:00 AM', '1:30 PM', '4:00 PM', '7:30 PM'],
    leagues: [
      { name: 'ATP Finals', logo: '/banners/sports_league/ATP.svg', games: 4, field: 8 },
      { name: 'Davis Cup Finals', logo: ICON('tennis.svg'), games: 4, field: 8 },
      { name: 'Challenger Tour', logo: ICON('tennis.svg'), games: 6, field: 12 },
    ],
  },
  {
    id: 'mma',
    label: 'MMA',
    slug: 'mma',
    icon: ICON('mma.svg'),
    format: 'duel',
    draw: false,
    awayFirst: false,
    unit: 'rounds',
    spreadName: 'Method',
    totalName: 'Total Rounds',
    spreadSlope: 0.5,
    totalMean: 2.4,
    totalSlope: 1.1,
    totalStep: 1,
    scoreMax: 0,
    clocks: ['R1 3:12', 'R2 1:40', 'R3 4:05'],
    times: ['8:00 PM', '10:00 PM', '11:30 PM'],
    leagues: [
      { name: 'UFC Fight Night', logo: '/banners/sports_league/ufc.svg', games: 8, field: 16 },
      { name: 'PFL World Championship', logo: ICON('mma.svg'), games: 4, field: 8 },
    ],
  },
  {
    id: 'boxing',
    label: 'Boxing',
    slug: 'boxing',
    icon: ICON('mma.svg'),
    format: 'duel',
    draw: true,
    awayFirst: false,
    unit: 'rounds',
    spreadName: 'Method',
    totalName: 'Total Rounds',
    spreadSlope: 0.5,
    totalMean: 9.2,
    totalSlope: 0.32,
    totalStep: 1,
    scoreMax: 0,
    clocks: ['R4', 'R7', 'R10'],
    times: ['9:00 PM', '10:30 PM'],
    leagues: [
      { name: 'WBA World Title', logo: '/banners/sports_league/wba.svg', games: 4, field: 8 },
      { name: 'Undercard', logo: ICON('mma.svg'), games: 4, field: 8 },
    ],
  },
  {
    id: 'golf',
    label: 'Golf',
    slug: 'golf',
    icon: ICON('Golf.svg'),
    format: 'duel',
    draw: false,
    awayFirst: false,
    unit: 'strokes',
    spreadName: 'Stroke Handicap',
    totalName: 'Round Score',
    spreadSlope: 0.6,
    totalMean: 70.5,
    totalSlope: 0.45,
    totalStep: 1,
    scoreMax: 0,
    clocks: ['Thru 6', 'Thru 11', 'Thru 15'],
    times: ['8:40 AM', '10:20 AM', '12:50 PM'],
    leagues: [
      { name: 'PGA Tour', logo: '/banners/sports_league/pga.svg', games: 6, field: 16, venue: 'Coastal Pines Classic' },
      { name: 'DP World Tour', logo: ICON('Golf.svg'), games: 4, field: 12, venue: 'Desert Links Championship' },
    ],
  },
  {
    id: 'horse-racing',
    label: 'Horse Racing',
    slug: 'horse-racing',
    icon: ICON('Horse-Racing-101.svg'),
    format: 'field',
    draw: false,
    awayFirst: false,
    unit: 'lengths',
    spreadName: 'Distance',
    totalName: 'Winning Distance',
    spreadSlope: 0.5,
    totalMean: 2.5,
    totalSlope: 0.6,
    totalStep: 1,
    scoreMax: 0,
    clocks: ['Off · 2f to go', 'Off · 4f to go'],
    times: ['12:45 PM', '1:20 PM', '1:55 PM', '2:30 PM', '3:05 PM', '3:40 PM'],
    leagues: [
      { name: 'Kempton Park', logo: ICON('Horse-Racing-101.svg'), games: 5, venue: 'Kempton Park' },
      { name: 'Aqueduct', logo: ICON('Horse-Racing-101.svg'), games: 4, venue: 'Aqueduct' },
      { name: 'Flemington', logo: ICON('Horse-Racing-101.svg'), games: 3, venue: 'Flemington' },
    ],
  },
  {
    id: 'lacrosse',
    label: 'Lacrosse',
    slug: 'lacrosse',
    icon: ICON('lacrosse.svg'),
    format: 'team',
    draw: false,
    awayFirst: true,
    unit: 'goals',
    spreadName: 'Spread',
    totalName: 'Total Goals',
    spreadSlope: 0.32,
    totalMean: 22.5,
    totalSlope: 0.22,
    totalStep: 2,
    scoreMax: 12,
    clocks: ['Q1 9:30', 'Q2 3:15', 'Q3 11:02', 'Q4 6:48'],
    times: ['7:00 PM', '7:30 PM', '9:00 PM'],
    leagues: [
      {
        name: 'NLL',
        logo: ICON('lacrosse.svg'),
        games: 6,
        teams: ['Buffalo Bandits', 'Toronto Rock', 'Colorado Mammoth', 'Calgary Roughnecks', 'San Diego Seals', 'Philadelphia Wings', 'Halifax Thunderbirds', 'Albany FireWolves', 'Saskatchewan Rush', 'Vancouver Warriors', 'Georgia Swarm', 'Rochester Knighthawks'],
      },
    ],
  },
  {
    id: 'pool',
    label: 'Pool',
    slug: 'pool',
    icon: ICON('pool.svg'),
    format: 'duel',
    draw: false,
    awayFirst: false,
    unit: 'racks',
    spreadName: 'Rack Handicap',
    totalName: 'Total Racks',
    spreadSlope: 0.42,
    totalMean: 14.5,
    totalSlope: 0.35,
    totalStep: 1,
    scoreMax: 8,
    clocks: ['Rack 6', 'Rack 9', 'Rack 13'],
    times: ['1:00 PM', '4:00 PM', '7:00 PM'],
    leagues: [
      { name: 'Mosconi Cup', logo: ICON('pool.svg'), games: 4, field: 8 },
      { name: 'World Pool Series', logo: ICON('pool.svg'), games: 4, field: 8 },
    ],
  },
  {
    id: 'rugby',
    label: 'Rugby',
    slug: 'rugby',
    icon: ICON('rugby.svg'),
    format: 'team',
    draw: true,
    awayFirst: false,
    unit: 'points',
    spreadName: 'Handicap',
    totalName: 'Total Points',
    spreadSlope: 0.12,
    totalMean: 46,
    totalSlope: 0.085,
    totalStep: 4,
    scoreMax: 27,
    clocks: ["14'", "33'", 'HT', "52'", "68'"],
    times: ['1:40 PM', '3:10 PM', '5:40 PM', '8:10 PM'],
    leagues: [
      {
        name: 'Autumn Nations Series',
        logo: ICON('rugby.svg'),
        games: 5,
        teams: ['England', 'France', 'Ireland', 'Scotland', 'Wales', 'Italy', 'New Zealand', 'South Africa', 'Australia', 'Argentina'],
      },
      {
        name: 'Premiership Rugby',
        logo: ICON('rugby.svg'),
        games: 4,
        teams: ['Bath', 'Saracens', 'Leicester Tigers', 'Northampton Saints', 'Harlequins', 'Bristol Bears', 'Sale Sharks', 'Gloucester'],
      },
      {
        name: 'Top 14',
        logo: ICON('rugby.svg'),
        games: 3,
        teams: ['Toulouse', 'Stade Rochelais', 'Racing 92', 'Toulon', 'Bordeaux Bègles', 'Clermont'],
      },
    ],
  },
  {
    id: 'table-tennis',
    label: 'Table Tennis',
    slug: 'table-tennis',
    icon: ICON('table_tennis.svg'),
    format: 'duel',
    draw: false,
    awayFirst: false,
    unit: 'games',
    spreadName: 'Game Handicap',
    totalName: 'Total Games',
    spreadSlope: 0.9,
    totalMean: 4,
    totalSlope: 1.1,
    totalStep: 1,
    scoreMax: 2,
    clocks: ['Game 2 · 7-5', 'Game 3 · 9-9', 'Game 4 · 3-6'],
    times: ['10:00 AM', '11:30 AM', '2:00 PM', '5:30 PM'],
    leagues: [
      { name: 'WTT Finals', logo: ICON('table_tennis.svg'), games: 4, field: 8 },
      { name: 'TT Elite Series', logo: ICON('table_tennis.svg'), games: 6, field: 12 },
    ],
  },
  {
    id: 'volleyball',
    label: 'Volleyball',
    slug: 'volleyball',
    icon: ICON('volley.svg'),
    format: 'team',
    draw: false,
    awayFirst: false,
    unit: 'points',
    spreadName: 'Set Handicap',
    totalName: 'Total Points',
    spreadSlope: 0.9,
    totalMean: 182,
    totalSlope: 0.06,
    totalStep: 4,
    scoreMax: 2,
    clocks: ['Set 2 · 14-12', 'Set 3 · 20-18', 'Set 4 · 8-10'],
    times: ['5:00 PM', '6:30 PM', '8:30 PM'],
    leagues: [
      {
        name: 'SuperLega',
        logo: ICON('volley.svg'),
        games: 4,
        teams: ['Sir Safety Perugia', 'Itas Trentino', 'Cucine Lube Civitanova', 'Allianz Milano', 'Valsa Group Modena', 'Rana Verona', 'Piacenza', 'Gas Sales Bluenergy'],
      },
      {
        name: 'PlusLiga',
        logo: ICON('volley.svg'),
        games: 3,
        teams: ['Jastrzębski Węgiel', 'Aluron Zawiercie', 'Projekt Warszawa', 'Asseco Resovia', 'ZAKSA Kędzierzyn-Koźle', 'PGE Skra Bełchatów'],
      },
    ],
  },
]

const BY_ID = new Map(V5_SPORTS.map((s) => [s.id, s]))
const BY_SLUG = new Map(V5_SPORTS.map((s) => [s.slug, s]))

export function sportDef(id: V5SportId): SportDef {
  return BY_ID.get(id)!
}
export function sportBySlug(slug: string): SportDef | undefined {
  return BY_SLUG.get(slug)
}
export function sportHref(id: V5SportId): string {
  return `/sports/${sportDef(id).slug}`
}
export function isFieldSport(id: V5SportId): boolean {
  return sportDef(id).format === 'field'
}

// ─── Deterministic maths ─────────────────────────────────────

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function rng(seed: string): () => number {
  let s = hash(seed) || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 100000) / 100000
  }
}
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))
const sig = (x: number) => 1 / (1 + Math.exp(-x))
const logit = (p: number) => Math.log(clamp(p, 0.01, 0.99) / (1 - clamp(p, 0.01, 0.99)))
const half = (n: number) => Math.round(n - 0.5) + 0.5
const fmt = (n: number) => String(Math.round(n * 10) / 10)
const signed = (n: number) => (n > 0 ? `+${fmt(n)}` : fmt(n))

function abbr(name: string): string {
  const words = name.replace(/[^A-Za-zÀ-ÿ0-9 ]/g, '').split(' ').filter(Boolean)
  if (words.length === 1) return words[0]!.slice(0, 3).toUpperCase()
  const last = words[words.length - 1]!
  if (/^\d/.test(last)) return (words[0]!.slice(0, 2) + last.slice(0, 1)).toUpperCase()
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

// ─── Invented people ─────────────────────────────────────────

const FIRST = [
  'Marcus', 'Elio', 'Dante', 'Rafe', 'Theo', 'Nico', 'Jalen', 'Kofi', 'Andre', 'Luca', 'Mateo', 'Owen', 'Rowan', 'Silas',
  'Tomas', 'Viktor', 'Yusuf', 'Zane', 'Callum', 'Idris', 'Kasper', 'Leon', 'Milo', 'Nate', 'Quinn', 'Ravi', 'Soren', 'Tariq',
  'Ugo', 'Wes', 'Bastian', 'Cormac', 'Darian', 'Emil', 'Fenn', 'Gideon', 'Hugo', 'Ivo', 'Jonas', 'Kai',
]
const LAST = [
  'Hartley', 'Okoro', 'Lindqvist', 'Varga', 'Kessler', 'Moreau', 'Delgado', 'Ashford', 'Brennan', 'Castell', 'Dunmore',
  'Ellison', 'Faraday', 'Garrow', 'Halloran', 'Ivers', 'Jarvik', 'Kowal', 'Larkin', 'Merrow', 'Navarro', 'Oakes', 'Pryce',
  'Quillan', 'Ronan', 'Stirling', 'Thorne', 'Ulrich', 'Vance', 'Wilder', 'Avelar', 'Brodsky', 'Corvin', 'Drago', 'Eskola',
  'Fairbank', 'Galt', 'Heller', 'Imre', 'Juniper',
]
const HORSE_A = ['Midnight', 'Silver', 'Copper', 'Northern', 'Velvet', 'Golden', 'Harbour', 'Iron', 'Crimson', 'Quiet', 'Lucky', 'Wild', 'Summer', 'Royal', 'Storm', 'Paper']
const HORSE_B = ['Ledger', 'Comet', 'Lantern', 'Rhapsody', 'Echo', 'Sovereign', 'Tide', 'Whisper', 'Banner', 'Harvest', 'Kestrel', 'Compass', 'Parade', 'Mariner', 'Orchard', 'Voyage']

function people(seed: string, n: number): string[] {
  const r = rng(`people-${seed}`)
  const out = new Set<string>()
  while (out.size < n) out.add(`${FIRST[Math.floor(r() * FIRST.length)]} ${LAST[Math.floor(r() * LAST.length)]}`)
  return [...out]
}
function horses(seed: string, n: number): string[] {
  const r = rng(`horses-${seed}`)
  const out = new Set<string>()
  while (out.size < n) out.add(`${HORSE_A[Math.floor(r() * HORSE_A.length)]} ${HORSE_B[Math.floor(r() * HORSE_B.length)]}`)
  return [...out]
}

const POSITIONS: Partial<Record<V5SportId, string[]>> = {
  soccer: ['FW', 'FW', 'MF', 'MF', 'MF', 'DF'],
  basketball: ['G', 'G', 'F', 'F', 'C', 'G'],
  hockey: ['C', 'LW', 'RW', 'D', 'C', 'D'],
  baseball: ['SS', 'CF', '1B', 'RF', '3B', 'C'],
  lacrosse: ['F', 'F', 'T', 'F', 'D', 'T'],
  rugby: ['WG', 'WG', 'CE', 'FB', 'FL', 'HK'],
  volleyball: ['OH', 'OP', 'MB', 'OH', 'S', 'L'],
}

/** Six invented players per team — stable per club so every market agrees. */
function rosterOf(sport: V5SportId, team: string): { id: string; name: string; pos?: string }[] {
  const pos = POSITIONS[sport] ?? []
  return people(`${sport}-${team}`, 6).map((name, i) => ({ id: `${abbr(team)}-${i}`, name, pos: pos[i] }))
}

// ─── Games ───────────────────────────────────────────────────

const DAYS = ['Thu 26 Nov', 'Fri 27 Nov', 'Sat 28 Nov', 'Sun 29 Nov', 'Mon 30 Nov']

export type V5Game = SportsMarket & { v5Sport: V5SportId; field?: boolean; venue?: string }

type GenEvent = {
  game: V5Game
  def: SportDef
  league: LeagueSeed
  home: string
  away: string
  /** Fair chances, home side first (draw in the middle when there is one). */
  pHome: number
  pDraw: number
  pAway: number
  runners?: string[]
}

let cache: { games: V5Game[]; events: Map<string, GenEvent> } | null = null

function build() {
  if (cache) return cache
  const games: V5Game[] = []
  const events = new Map<string, GenEvent>()
  for (const def of V5_SPORTS) {
    def.leagues.forEach((league, li) => {
      const leagueKey = `${def.id}-${league.name}`
      const r = rng(leagueKey)
      if (def.format === 'field') {
        for (let i = 0; i < league.games; i++) {
          const eventId = `${def.slug}-${abbr(league.name).toLowerCase()}-r${i + 1}`
          const runners = horses(eventId, 8 + Math.floor(r() * 4))
          const raw = runners.map(() => Math.pow(r(), 1.8) + 0.05)
          const sum = raw.reduce((a, b) => a + b, 0)
          const chances = raw.map((x) => (x / sum) * 100)
          const order = chances.map((c, k) => ({ c, k })).sort((a, b) => b.c - a.c)
          const live = li === 0 && i === 0
          const dist = ['5f', '6f', '7f', '1m', '1m 2f', '1m 4f', '2m'][Math.floor(r() * 7)]!
          const title = `${league.venue ?? league.name} · Race ${i + 1} · ${dist}`
          const when = live ? def.clocks[0]! : `${DAYS[0]}, ${def.times[i % def.times.length]}`
          const outcomes: MarketOutcome[] = order.map(({ c, k }, n) => ({
            id: `${eventId}-o${k}`,
            label: runners[k]!,
            short: runners[k]!.split(' ')[0]!,
            team: runners[k]!,
            chance: c,
            price: clamp(Math.round(c), 1, 99),
            change: Math.round((r() - 0.5) * 40) / 10 - (n === 0 ? 0 : 0.2),
            position: `${runners[k]} to win`,
          }))
          const game: V5Game = {
            id: `v5g-${eventId}`,
            kind: 'game',
            sport: 'soccer',
            category: 'soccer',
            eventId,
            title,
            market: 'Race Winner',
            eventLabel: title,
            href: `/sports/${def.slug}/event/${eventId}`,
            leagueName: league.name,
            leagueIcon: league.logo,
            when,
            live,
            volume: Math.round(60_000 + r() * 420_000) * (live ? 3 : 1),
            outcomes,
            rules: 'Settles on the official result. Dead heats split the stake. Non-runners are refunded.',
            v5Sport: def.id,
            field: true,
            venue: league.venue,
          }
          games.push(game)
          events.set(eventId, { game, def, league, home: title, away: '', pHome: 0, pDraw: 0, pAway: 0, runners: order.map(({ k }) => runners[k]!) })
        }
        return
      }
      const pool =
        def.format === 'duel'
          ? people(leagueKey, Math.max(league.field ?? league.games * 2, league.games * 2))
          : [...(league.teams ?? [])].sort(() => r() - 0.5)
      for (let i = 0; i < league.games; i++) {
        const home = pool[(i * 2) % pool.length]!
        const away = pool[(i * 2 + 1) % pool.length]!
        if (home === away) continue
        const eventId = `${def.slug}-${abbr(league.name).toLowerCase()}-${abbr(home).toLowerCase()}-${abbr(away).toLowerCase()}`
        const strength = 0.22 + r() * 0.56
        const pDraw = def.draw ? (def.id === 'soccer' ? 0.24 + r() * 0.06 : def.id === 'rugby' ? 0.035 : 0.04) : 0
        const pHome = strength * (1 - pDraw)
        const pAway = 1 - pHome - pDraw
        const live = i === 0 && (li === 0 || (li === 1 && (def.id === 'soccer' || def.id === 'basketball')))
        const clock = def.clocks[Math.floor(r() * def.clocks.length)]!
        const day = DAYS[Math.min(DAYS.length - 1, Math.floor(i / 3) + (li % 2))]!
        const when = live ? clock : `${day}, ${def.times[(i + li) % def.times.length]}`
        const leadHome = pHome >= pAway
        const scoreA = def.scoreMax ? Math.round(r() * def.scoreMax * (leadHome ? 0.8 : 1.05)) : 0
        const scoreB = def.scoreMax ? Math.round(r() * def.scoreMax * (leadHome ? 1.05 : 0.8)) : 0
        const sides = def.awayFirst
          ? [
              { name: away, p: pAway },
              { name: home, p: pHome },
            ]
          : [
              { name: home, p: pHome },
              { name: away, p: pAway },
            ]
        const moves = [r(), r(), r()].map((x) => Math.round((x - 0.5) * 60) / 10)
        const outcomes: MarketOutcome[] = sides.map((s, k) => ({
          id: `${eventId}-o${k}`,
          label: s.name,
          short: abbr(s.name),
          team: s.name,
          chance: s.p * 100,
          price: clamp(Math.round(s.p * 100), 1, 99),
          change: k === 0 ? moves[0]! : -moves[0]!,
          position: `${s.name} to win`,
        }))
        if (def.draw) {
          outcomes.splice(1, 0, {
            id: `${eventId}-draw`,
            label: 'Draw',
            short: 'Draw',
            chance: pDraw * 100,
            price: clamp(Math.round(pDraw * 100), 1, 99),
            change: moves[2]! / 3,
            position: 'Draw',
          })
        }
        const title = def.awayFirst ? `${away} @ ${home}` : `${home} vs ${away}`
        const score: [number, number] | undefined = live
          ? def.awayFirst
            ? [scoreB, scoreA]
            : [scoreA, scoreB]
          : undefined
        const game: V5Game = {
          id: `v5g-${eventId}`,
          kind: 'game',
          sport: def.draw ? 'soccer' : 'nfl',
          category: def.draw ? 'soccer' : 'football',
          eventId,
          title,
          market: def.draw ? '3-Way Regulation' : def.format === 'duel' ? 'Match Winner' : 'Moneyline',
          eventLabel: title,
          href: `/sports/${def.slug}/event/${eventId}`,
          leagueName: league.name,
          leagueIcon: league.logo,
          when,
          live,
          score,
          volume: Math.round((def.id === 'basketball' || def.id === 'soccer' ? 380_000 : 140_000) * (0.4 + r() * 1.5) * (live ? 2.2 : 1)),
          outcomes,
          rules: def.draw
            ? 'Settles on the result at the end of regulation. Extra time doesn’t count.'
            : 'Settles on the official result, overtime and extra periods included.',
          v5Sport: def.id,
          venue: league.venue,
        }
        games.push(game)
        events.set(eventId, { game, def, league, home, away, pHome, pDraw, pAway })
      }
    })
  }
  cache = { games, events }
  return cache
}

/** Every generated board game, all sports. */
export function generatedGames(): V5Game[] {
  return build().games
}

export function isGenerated(game: SportsMarket): game is V5Game {
  return 'v5Sport' in game
}

export function v5SportOf(game: SportsMarket): V5SportId {
  return isGenerated(game) ? game.v5Sport : game.sport
}

export function genGame(eventId: string): V5Game | null {
  return build().events.get(eventId)?.game ?? null
}

// ─── Lines (board ladders) ───────────────────────────────────

export type GenRung = { line: number; chance: number; change: number; yes: SoccerSlipPick; no: SoccerSlipPick }
export type GenLadder = { kind: 'spread' | 'total'; lead: string; unit: string; defaultIndex: number; rungs: GenRung[] }

const cents = (chance: number) => clamp(Math.round(chance + 1), 1, 99)

/** Spread + total ladders for a generated game — same shape as the V1-derived ones. */
export function genLadders(game: V5Game): GenLadder[] {
  const ev = build().events.get(game.eventId ?? '')
  if (!ev || game.field) return []
  const { def } = ev
  const fav = ev.pHome >= ev.pAway ? ev.home : ev.away
  const dog = fav === ev.home ? ev.away : ev.home
  const pFav = Math.max(ev.pHome, ev.pAway) / Math.max(0.01, 1 - ev.pDraw)
  const base = {
    eventLabel: game.eventLabel,
    eventId: game.eventId,
    eventHref: game.href,
    sport: game.sport,
    live: game.live,
  }
  const out: GenLadder[] = []
  const unitOne = def.unit
  if (!['mma', 'boxing', 'golf'].includes(def.id)) {
    const fixed = ['hockey', 'baseball', 'volleyball', 'table-tennis'].includes(def.id)
    const mainSpread = fixed ? 1.5 : Math.max(0.5, half(logit(pFav) / def.spreadSlope))
    const steps = fixed ? [0, 1] : [-3, -2, -1, 0, 1, 2, 3].map((s) => s * (def.id === 'basketball' ? 2 : def.id === 'rugby' ? 3 : 1))
    const lines = [...new Set(steps.map((s) => mainSpread + s).filter((x) => x > 0))].sort((a, b) => a - b)
    out.push({
      kind: 'spread',
      lead: `${fav} win by over`,
      unit: unitOne,
      defaultIndex: Math.max(0, lines.indexOf(mainSpread)),
      rungs: lines.map((line) => {
        const chance = clamp(sig(logit(pFav) - line * def.spreadSlope) * 100, 2, 98)
        const id = `v5-${game.id}-sp-${line}`
        return {
          line,
          chance,
          change: Math.round((rng(id)() - 0.5) * 12) / 2,
          yes: { ...base, id: `${id}-yes`, label: `${abbr(fav)} -${fmt(line)}`, market: def.spreadName, odds: priceToAmerican(cents(chance)) },
          no: { ...base, id: `${id}-no`, label: `${abbr(dog)} +${fmt(line)}`, market: def.spreadName, odds: priceToAmerican(cents(100 - chance)) },
        }
      }),
    })
  }
  const mean = def.totalMean * (0.94 + rng(`${game.id}-mean`)() * 0.12)
  const mainTotal = half(mean)
  const tSteps = [-3, -2, -1, 0, 1, 2, 3].map((s) => s * def.totalStep)
  const tLines = [...new Set(tSteps.map((s) => mainTotal + s).filter((x) => x > 0))].sort((a, b) => a - b)
  out.push({
    kind: 'total',
    lead: 'Over',
    unit: unitOne,
    defaultIndex: Math.max(0, tLines.indexOf(mainTotal)),
    rungs: tLines.map((line) => {
      const chance = clamp(sig((mean - line) * def.totalSlope) * 100, 2, 98)
      const id = `v5-${game.id}-tot-${line}`
      return {
        line,
        chance,
        change: Math.round((rng(id)() - 0.5) * 10) / 2,
        yes: { ...base, id: `${id}-yes`, label: `Over ${fmt(line)} ${unitOne}`, market: def.totalName, odds: priceToAmerican(cents(chance)) },
        no: { ...base, id: `${id}-no`, label: `Under ${fmt(line)} ${unitOne}`, market: def.totalName, odds: priceToAmerican(cents(100 - chance)) },
      }
    }),
  })
  return out
}

// ─── Event markets ───────────────────────────────────────────

type Ctx = {
  id: string
  def: SportDef
  home: string
  away: string
  pHome: number
  pDraw: number
  pAway: number
  r: () => number
}

const cell = (id: string, label: string, p: number, slipLabel?: string): SoccerOdds => ({
  id,
  label,
  odds: bookPrice(clamp(p, 0.01, 0.99)),
  slipLabel,
})

function row(c: Ctx, key: string, name: string, tabs: string[], cells: [string, number, string?][]): RowMarket {
  const sum = cells.reduce((a, [, p]) => a + p, 0) || 1
  return {
    id: `${c.id}-${key}`,
    kind: 'row',
    name,
    tabs,
    cells: cells.map(([label, p, slip], i) => cell(`${c.id}-${key}-${i}`, label, p / sum, slip ?? `${label} · ${name}`)),
  }
}

function yesNo(c: Ctx, key: string, name: string, tabs: string[], pYes: number): RowMarket {
  return {
    id: `${c.id}-${key}`,
    kind: 'row',
    name,
    tabs,
    cells: [cell(`${c.id}-${key}-y`, 'Yes', pYes, `${name}: Yes`), cell(`${c.id}-${key}-n`, 'No', 1 - pYes, `${name}: No`)],
  }
}

function overUnderRow(c: Ctx, key: string, name: string, tabs: string[], line: number, pOver: number, unit: string): RowMarket {
  return {
    id: `${c.id}-${key}`,
    kind: 'row',
    name,
    tabs,
    cells: [
      cell(`${c.id}-${key}-o`, 'Over', pOver, `Over ${fmt(line)} ${unit} · ${name}`),
      cell(`${c.id}-${key}-u`, 'Under', 1 - pOver, `Under ${fmt(line)} ${unit} · ${name}`),
    ],
  }
}

function spreadLadder(c: Ctx, key: string, name: string, tabs: string[], scale = 1, slipMarket?: string): LadderMarket {
  const { def } = c
  const homeFav = c.pHome >= c.pAway
  const fav = homeFav ? c.home : c.away
  const dog = homeFav ? c.away : c.home
  const pFav = Math.max(c.pHome, c.pAway) / Math.max(0.01, 1 - c.pDraw)
  const slope = def.spreadSlope / scale
  const fixed = ['hockey', 'baseball', 'volleyball', 'table-tennis'].includes(def.id) && scale === 1
  const main = fixed ? 1.5 : Math.max(0.5, half(logit(pFav) / slope))
  const step = def.id === 'basketball' ? 1 : def.id === 'rugby' ? 2 : 1
  const lines = [...new Set([-4, -3, -2, -1, 0, 1, 2, 3, 4].map((s) => main + s * step * scale).filter((x) => x > 0))].sort((a, b) => a - b)
  return {
    id: `${c.id}-${key}`,
    kind: 'ladder',
    name,
    tabs,
    slipMarket: slipMarket ?? name,
    columns: [
      { label: fav, team: fav },
      { label: dog, team: dog },
    ],
    mainLine: main,
    altTitle: name,
    rows: lines.map((line) => {
      const p = sig(logit(pFav) - line * slope)
      return {
        line,
        a: cell(`${c.id}-${key}-a-${line}`, `-${fmt(line)}`, p, `${fav} -${fmt(line)}`),
        b: cell(`${c.id}-${key}-b-${line}`, `+${fmt(line)}`, 1 - p, `${dog} +${fmt(line)}`),
      }
    }),
  }
}

function totalLadder(c: Ctx, key: string, name: string, tabs: string[], mean: number, slope: number, step: number, unit: string): LadderMarket {
  const main = half(mean)
  const lines = [...new Set([-4, -3, -2, -1, 0, 1, 2, 3, 4].map((s) => main + s * step).filter((x) => x > 0))].sort((a, b) => a - b)
  return {
    id: `${c.id}-${key}`,
    kind: 'ladder',
    name,
    tabs,
    columns: [{ label: 'Over' }, { label: 'Under' }],
    mainLine: main,
    altTitle: name,
    rows: lines.map((line) => {
      const p = sig((mean - line) * slope)
      return {
        line,
        a: cell(`${c.id}-${key}-o-${line}`, `O ${fmt(line)}`, p, `Over ${fmt(line)} ${unit}`),
        b: cell(`${c.id}-${key}-u-${line}`, `U ${fmt(line)}`, 1 - p, `Under ${fmt(line)} ${unit}`),
      }
    }),
  }
}

function teamTotals(c: Ctx, key: string, name: string, tabs: string[], mean: number, slope: number, step: number, unit: string): ListMarket {
  const share = c.pHome / Math.max(0.01, c.pHome + c.pAway)
  const group = (team: string, m: number): ListMarket['groups'][number] => {
    const main = half(m)
    const lines = [main - step, main, main + step].filter((x) => x > 0)
    const columns: EventColumnHead[] = [{ label: 'Over' }, { label: 'Under' }]
    return {
      title: team,
      team,
      columns,
      rows: lines.map((line) => {
        const p = sig((m - line) * slope)
        return [
          cell(`${c.id}-${key}-${abbr(team)}-o-${line}`, `O ${fmt(line)}`, p, `${team} over ${fmt(line)} ${unit}`),
          cell(`${c.id}-${key}-${abbr(team)}-u-${line}`, `U ${fmt(line)}`, 1 - p, `${team} under ${fmt(line)} ${unit}`),
        ]
      }),
    }
  }
  const order = c.def.awayFirst ? [c.away, c.home] : [c.home, c.away]
  return {
    id: `${c.id}-${key}`,
    kind: 'list',
    name,
    tabs,
    groups: order.map((t) => group(t, mean * (t === c.home ? 0.4 + share * 0.2 : 0.6 - share * 0.2))),
  }
}

function marginGrid(c: Ctx, key: string, name: string, tabs: string[], buckets: string[]): GridMarket {
  const order = c.def.awayFirst ? [c.away, c.home] : [c.home, c.away]
  return {
    id: `${c.id}-${key}`,
    kind: 'grid',
    name,
    tabs,
    columns: order.map((team) => {
      const p = team === c.home ? c.pHome : c.pAway
      const decay = buckets.map((_, i) => Math.exp(-i * 0.55))
      const sum = decay.reduce((a, b) => a + b, 0)
      return {
        label: team,
        team,
        cells: buckets.map((b, i) => cell(`${c.id}-${key}-${abbr(team)}-${i}`, b, (p * decay[i]!) / sum, `${team} by ${b}`)),
      }
    }),
  }
}

/** Correct score / set betting — every scoreline a side can win by. */
function scoreGrid(c: Ctx, key: string, name: string, tabs: string[], scores: [number, number][], withDraws: [number, number][] = []): GridMarket {
  const order = c.def.awayFirst ? [c.away, c.home] : [c.home, c.away]
  const cols = order.map((team) => {
    const p = team === c.home ? c.pHome : c.pAway
    const weights = scores.map(([a, b]) => Math.exp(-(a + b) * 0.35) * (1 + (a - b) * 0.1))
    const sum = weights.reduce((x, y) => x + y, 0)
    return {
      label: team,
      team,
      cells: scores.map(([a, b], i) => cell(`${c.id}-${key}-${abbr(team)}-${a}${b}`, `${a}-${b}`, (p * weights[i]!) / sum, `${team} ${a}-${b}`)),
    }
  })
  if (withDraws.length) {
    const w = withDraws.map(([a]) => Math.exp(-a * 0.7))
    const s = w.reduce((x, y) => x + y, 0)
    cols.splice(1, 0, {
      label: 'Draw',
      team: undefined as unknown as string,
      cells: withDraws.map(([a, b], i) => cell(`${c.id}-${key}-d-${a}${b}`, `${a}-${b}`, (c.pDraw * w[i]!) / s, `Draw ${a}-${b}`)),
    })
  }
  return { id: `${c.id}-${key}`, kind: 'grid', name, tabs, columns: cols.map((col) => (col.team ? col : { label: col.label, cells: col.cells })) }
}

function playersMarket(c: Ctx, key: string, name: string, tabs: string[], columns: string[], base: number[], who: 'all' | 'top' = 'all'): PlayersMarket {
  const order = c.def.awayFirst ? [c.away, c.home] : [c.home, c.away]
  return {
    id: `${c.id}-${key}`,
    kind: 'players',
    name,
    tabs,
    columns,
    teams: order.map((team) => {
      const tilt = team === c.home ? c.pHome : c.pAway
      const roster = rosterOf(c.def.id, team).slice(0, who === 'top' ? 4 : 6)
      return {
        name: team,
        abbr: abbr(team),
        players: roster.map((pl, i) => ({
          id: `${c.id}-${key}-${pl.id}`,
          name: pl.name,
          pos: pl.pos,
          cells: columns.map((col, k) =>
            cell(`${c.id}-${key}-${pl.id}-${k}`, col, clamp(base[k]! * (1.35 - i * 0.16) * (0.75 + tilt * 0.6), 0.015, 0.9), `${pl.name} · ${col}`),
          ),
        })),
      }
    }),
  }
}

function playerLines(c: Ctx, key: string, name: string, tabs: string[], mean: number, spread: number, step: number, unit: string, count = 4): PlayerLinesMarket {
  const order = c.def.awayFirst ? [c.away, c.home] : [c.home, c.away]
  return {
    id: `${c.id}-${key}`,
    kind: 'player-lines',
    name,
    tabs,
    teams: order.map((team) => ({
      name: team,
      abbr: abbr(team),
      players: rosterOf(c.def.id, team)
        .slice(0, count)
        .map((pl, i) => {
          const m = Math.max(0.5, mean * (1.25 - i * 0.18))
          const main = Math.max(0.5, half(m))
          const lines = [main - 2 * step, main - step, main, main + step, main + 2 * step].filter((x) => x > 0)
          const rows: SoccerLinePair[] = lines.map((line) => {
            const p = sig((m - line) / spread)
            return {
              line,
              a: cell(`${c.id}-${key}-${pl.id}-o-${line}`, `O ${fmt(line)}`, p, `${pl.name} over ${fmt(line)} ${unit}`),
              b: cell(`${c.id}-${key}-${pl.id}-u-${line}`, `U ${fmt(line)}`, 1 - p, `${pl.name} under ${fmt(line)} ${unit}`),
            }
          })
          return { id: `${c.id}-${key}-${pl.id}`, name: pl.name, pos: pl.pos, rows, mainLine: main }
        }),
    })),
  }
}

/** One-person markets for duels — "players" market with the two competitors. */
function duelPlayers(c: Ctx, key: string, name: string, tabs: string[], columns: string[], base: number[]): PlayersMarket {
  const side = (who: string, p: number) => ({
    name: who,
    abbr: abbr(who),
    players: [
      {
        id: `${c.id}-${key}-${abbr(who)}`,
        name: who,
        cells: columns.map((col, k) => cell(`${c.id}-${key}-${abbr(who)}-${k}`, col, clamp(base[k]! * (0.4 + p), 0.02, 0.92), `${who} · ${col}`)),
      },
    ],
  })
  return { id: `${c.id}-${key}`, kind: 'players', name, tabs, columns, teams: [side(c.home, c.pHome), side(c.away, c.pAway)] }
}

function duelLines(c: Ctx, key: string, name: string, tabs: string[], mean: number, spread: number, step: number, unit: string): PlayerLinesMarket {
  const side = (who: string, tilt: number) => {
    const m = Math.max(0.5, mean * (0.85 + tilt * 0.3))
    const main = half(m)
    const lines = [main - 2 * step, main - step, main, main + step, main + 2 * step].filter((x) => x > 0)
    return {
      name: who,
      abbr: abbr(who),
      players: [
        {
          id: `${c.id}-${key}-${abbr(who)}`,
          name: who,
          mainLine: main,
          rows: lines.map((line) => {
            const p = sig((m - line) / spread)
            return {
              line,
              a: cell(`${c.id}-${key}-${abbr(who)}-o-${line}`, `O ${fmt(line)}`, p, `${who} over ${fmt(line)} ${unit}`),
              b: cell(`${c.id}-${key}-${abbr(who)}-u-${line}`, `U ${fmt(line)}`, 1 - p, `${who} under ${fmt(line)} ${unit}`),
            }
          }),
        },
      ],
    }
  }
  return { id: `${c.id}-${key}`, kind: 'player-lines', name, tabs, teams: [side(c.home, c.pHome), side(c.away, c.pAway)] }
}

function winnerRow(c: Ctx, key: string, name: string, tabs: string[], shift = 0, draw = false, drawP = 0.2): RowMarket {
  const ph = clamp(c.pHome + shift, 0.05, 0.95)
  const order: [string, number][] = c.def.awayFirst
    ? [
        [c.away, 1 - ph],
        [c.home, ph],
      ]
    : [
        [c.home, ph],
        [c.away, 1 - ph],
      ]
  const cells: [string, number, string?][] = draw
    ? [
        [order[0]![0], order[0]![1] * (1 - drawP), `${order[0]![0]} · ${name}`],
        ['Draw', drawP, `Draw · ${name}`],
        [order[1]![0], order[1]![1] * (1 - drawP), `${order[1]![0]} · ${name}`],
      ]
    : order.map(([t, p]) => [t, p, `${t} · ${name}`])
  return row(c, key, name, tabs, cells)
}

const TABS: Record<string, EventTab> = {
  popular: { id: 'popular', label: 'Popular' },
  lines: { id: 'lines', label: 'Game Lines' },
  halves: { id: 'halves', label: 'Halves' },
  quarters: { id: 'quarters', label: 'Quarters' },
  periods: { id: 'periods', label: 'Periods' },
  innings: { id: 'innings', label: 'Innings' },
  sets: { id: 'sets', label: 'Sets' },
  games: { id: 'games', label: 'Games' },
  rounds: { id: 'rounds', label: 'Rounds' },
  method: { id: 'method', label: 'Method' },
  goals: { id: 'goals', label: 'Goals' },
  corners: { id: 'corners', label: 'Corners' },
  cards: { id: 'cards', label: 'Cards' },
  tries: { id: 'tries', label: 'Tries' },
  players: { id: 'players', label: 'Player Props' },
  props: { id: 'props', label: 'Game Props' },
  race: { id: 'race', label: 'Race' },
  place: { id: 'place', label: 'Place & Show' },
  matchups: { id: 'matchups', label: 'Match Bets' },
  tournament: { id: 'tournament', label: 'Tournament' },
}

function marketsFor(ev: GenEvent): { tabs: EventTab[]; markets: EventMarket[] } {
  const { def } = ev
  const c: Ctx = { id: ev.game.eventId!, def, home: ev.home, away: ev.away, pHome: ev.pHome, pDraw: ev.pDraw, pAway: ev.pAway, r: rng(`mk-${ev.game.eventId}`) }
  const mean = def.totalMean * (0.94 + rng(`${ev.game.id}-mean`)() * 0.12)
  const T = (...ids: string[]) => ids.map((i) => TABS[i]!)
  const P = (...m: EventMarket[]) => m

  switch (def.id) {
    case 'basketball': {
      const u = 'points'
      return {
        tabs: T('popular', 'lines', 'halves', 'quarters', 'players', 'props'),
        markets: P(
          winnerRow(c, 'ml', 'Moneyline', ['lines']),
          spreadLadder(c, 'spread', 'Spread', ['lines']),
          totalLadder(c, 'total', 'Total Points', ['lines'], mean, def.totalSlope, 2, u),
          teamTotals(c, 'tt', 'Team Total Points', ['lines', 'props'], mean, 0.11, 3, u),
          marginGrid(c, 'margin', 'Winning Margin', ['lines'], ['1-5', '6-10', '11-15', '16-20', '21+']),
          playerLines(c, 'pts', 'Points', ['popular', 'players'], 21, 3.2, 1, u),
          yesNo(c, 'ot', 'Overtime', ['popular', 'props'], 0.06),
          row(c, 'race20', 'Race to 20 Points', ['popular', 'props'], [
            [c.def.awayFirst ? c.away : c.home, c.def.awayFirst ? c.pAway : c.pHome],
            [c.def.awayFirst ? c.home : c.away, c.def.awayFirst ? c.pHome : c.pAway],
          ]),
          winnerRow(c, '1h-ml', '1st Half Moneyline', ['halves'], 0, true, 0.03),
          spreadLadder(c, '1h-spread', '1st Half Spread', ['halves'], 0.5),
          totalLadder(c, '1h-total', '1st Half Total', ['halves'], mean / 2, def.totalSlope * 1.4, 1, u),
          winnerRow(c, '2h-ml', '2nd Half Moneyline', ['halves'], 0.02, true, 0.03),
          winnerRow(c, '1q-ml', '1st Quarter Moneyline', ['quarters'], 0, true, 0.05),
          spreadLadder(c, '1q-spread', '1st Quarter Spread', ['quarters'], 0.25),
          totalLadder(c, '1q-total', '1st Quarter Total', ['quarters'], mean / 4, def.totalSlope * 2.4, 1, u),
          row(c, 'hsq', 'Highest Scoring Quarter', ['quarters', 'props'], [['1st', 0.22], ['2nd', 0.25], ['3rd', 0.24], ['4th', 0.25], ['Tie', 0.04]]),
          playerLines(c, 'reb', 'Rebounds', ['players'], 7.5, 1.6, 1, 'rebounds'),
          playerLines(c, 'ast', 'Assists', ['players'], 5.5, 1.4, 1, 'assists'),
          playerLines(c, '3pm', 'Threes Made', ['players'], 2.2, 0.9, 1, 'threes'),
          playerLines(c, 'pra', 'Points + Rebounds + Assists', ['players'], 31, 4, 2, 'PRA'),
          playersMarket(c, 'dd', 'Double-Double', ['players'], ['Yes'], [0.28]),
          yesNo(c, 'oe', 'Total Points Odd', ['props'], 0.5),
          yesNo(c, 'both100', 'Both Teams 100+ Points', ['props'], 0.78),
        ),
      }
    }
    case 'hockey': {
      const u = 'goals'
      return {
        tabs: T('popular', 'lines', 'periods', 'players', 'props'),
        markets: P(
          winnerRow(c, 'ml', 'Moneyline', ['lines']),
          winnerRow(c, '3way', '60-Minute 3-Way', ['popular', 'lines'], 0, true, 0.22),
          spreadLadder(c, 'pl', 'Puck Line', ['lines']),
          totalLadder(c, 'total', 'Total Goals', ['lines'], mean, def.totalSlope, 1, u),
          teamTotals(c, 'tt', 'Team Total Goals', ['lines'], mean, 0.9, 1, u),
          scoreGrid(c, 'cs', 'Correct Score', ['lines'], [[1, 0], [2, 0], [2, 1], [3, 1], [3, 2], [4, 2], [4, 1], [3, 0]]),
          playersMarket(c, 'gs', 'Goalscorer', ['popular', 'players'], ['First', 'Anytime'], [0.08, 0.32]),
          yesNo(c, 'ot', 'Goes to Overtime', ['popular', 'props'], 0.22),
          winnerRow(c, 'p1', '1st Period 3-Way', ['periods'], 0, true, 0.38),
          totalLadder(c, 'p1-total', '1st Period Total', ['periods'], mean / 3, 1.1, 1, u),
          winnerRow(c, 'p2', '2nd Period 3-Way', ['periods'], 0.01, true, 0.36),
          row(c, 'hsp', 'Highest Scoring Period', ['periods', 'props'], [['1st', 0.28], ['2nd', 0.34], ['3rd', 0.3], ['Tie', 0.08]]),
          playerLines(c, 'sog', 'Shots on Goal', ['players'], 3.1, 0.9, 1, 'shots'),
          playerLines(c, 'pts', 'Points', ['players'], 0.9, 0.45, 1, 'points'),
          yesNo(c, 'btts', 'Both Teams to Score', ['props'], 0.81),
          row(c, 'first', 'First Goal', ['props'], [[c.home, c.pHome], [c.away, c.pAway], ['No goal', 0.04]]),
          yesNo(c, 'oe', 'Total Goals Odd', ['props'], 0.5),
        ),
      }
    }
    case 'baseball': {
      const u = 'runs'
      return {
        tabs: T('popular', 'lines', 'innings', 'players', 'props'),
        markets: P(
          winnerRow(c, 'ml', 'Moneyline', ['lines']),
          spreadLadder(c, 'rl', 'Run Line', ['lines']),
          totalLadder(c, 'total', 'Total Runs', ['lines'], mean, def.totalSlope, 1, u),
          teamTotals(c, 'tt', 'Team Total Runs', ['lines'], mean, 0.55, 1, u),
          marginGrid(c, 'margin', 'Winning Margin', ['lines'], ['1', '2', '3', '4', '5+']),
          yesNo(c, 'yrfi', 'Run in the 1st Inning', ['popular', 'innings'], 0.47),
          winnerRow(c, 'f5', 'First 5 Innings 3-Way', ['popular', 'innings'], 0, true, 0.16),
          totalLadder(c, 'f5-total', 'First 5 Innings Total', ['innings'], mean * 0.55, 0.6, 1, u),
          winnerRow(c, 'i1', '1st Inning 3-Way', ['innings'], 0, true, 0.53),
          playersMarket(c, 'hr', 'To Hit a Home Run', ['popular', 'players'], ['Yes'], [0.12]),
          playerLines(c, 'hits', 'Hits', ['players'], 1.1, 0.5, 1, 'hits'),
          playerLines(c, 'tb', 'Total Bases', ['players'], 1.6, 0.7, 1, 'bases'),
          playerLines(c, 'rbi', 'RBIs', ['players'], 0.7, 0.4, 1, 'RBIs'),
          yesNo(c, 'xi', 'Extra Innings', ['props'], 0.09),
          row(c, 'race3', 'Race to 3 Runs', ['props'], [[c.home, c.pHome], [c.away, c.pAway], ['Neither', 0.12]]),
          yesNo(c, 'oe', 'Total Runs Odd', ['props'], 0.5),
        ),
      }
    }
    case 'lacrosse': {
      const u = 'goals'
      return {
        tabs: T('popular', 'lines', 'halves', 'quarters', 'players', 'props'),
        markets: P(
          winnerRow(c, 'ml', 'Moneyline', ['lines']),
          spreadLadder(c, 'spread', 'Spread', ['lines']),
          totalLadder(c, 'total', 'Total Goals', ['lines'], mean, def.totalSlope, 1, u),
          teamTotals(c, 'tt', 'Team Total Goals', ['lines'], mean, 0.3, 1, u),
          marginGrid(c, 'margin', 'Winning Margin', ['lines'], ['1-2', '3-4', '5-6', '7+']),
          playerLines(c, 'goals', 'Player Goals', ['popular', 'players'], 2.4, 0.9, 1, 'goals'),
          playerLines(c, 'points', 'Player Points', ['players'], 4.5, 1.3, 1, 'points'),
          yesNo(c, 'ot', 'Overtime', ['popular', 'props'], 0.11),
          winnerRow(c, '1h', '1st Half 3-Way', ['halves'], 0, true, 0.1),
          totalLadder(c, '1h-total', '1st Half Total', ['halves'], mean / 2, 0.35, 1, u),
          winnerRow(c, '1q', '1st Quarter 3-Way', ['quarters'], 0, true, 0.18),
          totalLadder(c, '1q-total', '1st Quarter Total', ['quarters'], mean / 4, 0.6, 1, u),
          yesNo(c, 'oe', 'Total Goals Odd', ['props'], 0.5),
        ),
      }
    }
    case 'rugby': {
      const u = 'points'
      return {
        tabs: T('popular', 'lines', 'halves', 'tries', 'props'),
        markets: P(
          winnerRow(c, '3way', '3-Way Regulation', ['lines'], 0, true, c.pDraw),
          spreadLadder(c, 'hcp', 'Handicap', ['lines']),
          totalLadder(c, 'total', 'Total Points', ['lines'], mean, def.totalSlope, 2, u),
          teamTotals(c, 'tt', 'Team Total Points', ['lines'], mean, 0.09, 4, u),
          marginGrid(c, 'margin', 'Winning Margin', ['popular', 'lines'], ['1-7', '8-14', '15-21', '22+']),
          playersMarket(c, 'try', 'Try Scorer', ['popular', 'tries'], ['First', 'Anytime'], [0.07, 0.34]),
          totalLadder(c, 'tries', 'Total Tries', ['tries'], 5.6, 0.7, 1, 'tries'),
          row(c, 'firsttry', 'First Try', ['tries'], [[c.home, c.pHome], [c.away, c.pAway], ['No try', 0.02]]),
          winnerRow(c, 'ht', 'Half-Time 3-Way', ['halves'], 0, true, 0.09),
          totalLadder(c, '1h-total', '1st Half Total', ['halves'], mean / 2, 0.12, 2, u),
          winnerRow(c, '2h', '2nd Half 3-Way', ['halves'], 0.01, true, 0.07),
          yesNo(c, 'both20', 'Both Teams 20+ Points', ['props'], 0.42),
          yesNo(c, 'oe', 'Total Points Odd', ['props'], 0.5),
          yesNo(c, 'yc', 'Yellow Card Shown', ['props'], 0.71),
        ),
      }
    }
    case 'volleyball': {
      return {
        tabs: T('popular', 'lines', 'sets', 'props'),
        markets: P(
          winnerRow(c, 'ml', 'Match Winner', ['lines']),
          spreadLadder(c, 'sh', 'Set Handicap', ['lines']),
          totalLadder(c, 'total', 'Total Points', ['lines'], mean, def.totalSlope, 4, 'points'),
          overUnderRow(c, 'sets', 'Total Sets 3.5', ['popular', 'lines'], 3.5, 0.58, 'sets'),
          scoreGrid(c, 'cs', 'Correct Score', ['popular', 'lines'], [[3, 0], [3, 1], [3, 2]]),
          winnerRow(c, 's1', '1st Set Winner', ['sets'], 0),
          totalLadder(c, 's1-total', '1st Set Total Points', ['sets'], 45, 0.12, 1, 'points'),
          winnerRow(c, 's2', '2nd Set Winner', ['sets'], 0.01),
          yesNo(c, 'five', 'Goes to 5 Sets', ['props'], 0.24),
          yesNo(c, 'oe', 'Total Points Odd', ['props'], 0.5),
        ),
      }
    }
    case 'tennis': {
      return {
        tabs: T('popular', 'lines', 'sets', 'players', 'props'),
        markets: P(
          winnerRow(c, 'ml', 'Match Winner', ['lines']),
          spreadLadder(c, 'gh', 'Game Handicap', ['lines']),
          totalLadder(c, 'total', 'Total Games', ['lines'], mean, def.totalSlope, 1, 'games'),
          scoreGrid(c, 'sb', 'Set Betting', ['popular', 'lines'], [[2, 0], [2, 1]]),
          winnerRow(c, 's1', '1st Set Winner', ['popular', 'sets']),
          totalLadder(c, 's1-total', '1st Set Total Games', ['sets'], 9.6, 0.55, 1, 'games'),
          scoreGrid(c, 's1-score', '1st Set Score', ['sets'], [[6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [7, 5], [7, 6]]),
          winnerRow(c, 's2', '2nd Set Winner', ['sets'], 0.02),
          duelLines(c, 'aces', 'Aces', ['players'], 6.5, 1.6, 1, 'aces'),
          duelLines(c, 'df', 'Double Faults', ['players'], 2.5, 0.9, 1, 'double faults'),
          duelPlayers(c, 'set', 'To Win a Set', ['players'], ['Yes'], [0.75]),
          yesNo(c, 'tb', 'Tie-Break in Match', ['popular', 'props'], 0.46),
          yesNo(c, 'three', 'Match Goes to 3 Sets', ['props'], 0.38),
        ),
      }
    }
    case 'table-tennis': {
      return {
        tabs: T('popular', 'lines', 'games', 'props'),
        markets: P(
          winnerRow(c, 'ml', 'Match Winner', ['lines']),
          spreadLadder(c, 'gh', 'Game Handicap', ['lines']),
          overUnderRow(c, 'games', 'Total Games 3.5', ['popular', 'lines'], 3.5, 0.62, 'games'),
          scoreGrid(c, 'cs', 'Correct Score', ['popular', 'lines'], [[3, 0], [3, 1], [3, 2]]),
          winnerRow(c, 'g1', 'Game 1 Winner', ['games']),
          totalLadder(c, 'g1-total', 'Game 1 Total Points', ['games'], 19.5, 0.5, 1, 'points'),
          winnerRow(c, 'g2', 'Game 2 Winner', ['games'], 0.01),
          totalLadder(c, 'points', 'Total Points', ['lines'], 76, 0.12, 2, 'points'),
          yesNo(c, 'five', 'Goes to Game 5', ['props'], 0.21),
        ),
      }
    }
    case 'pool': {
      return {
        tabs: T('popular', 'lines', 'props'),
        markets: P(
          winnerRow(c, 'ml', 'Match Winner', ['lines']),
          spreadLadder(c, 'rh', 'Rack Handicap', ['lines']),
          totalLadder(c, 'total', 'Total Racks', ['lines'], mean, def.totalSlope, 1, 'racks'),
          scoreGrid(c, 'cs', 'Correct Score (Race to 9)', ['popular', 'lines'], [[9, 8], [9, 7], [9, 6], [9, 5], [9, 4], [9, 3]]),
          winnerRow(c, 'r1', 'First Rack Winner', ['popular', 'props']),
          yesNo(c, 'bar', 'Break and Run in Rack 1', ['props'], 0.29),
          yesNo(c, 'hill', 'Goes Hill-Hill', ['props'], 0.17),
        ),
      }
    }
    case 'mma':
    case 'boxing': {
      const rounds = def.id === 'mma' ? 3 : 12
      const methods = def.id === 'mma' ? ['KO/TKO', 'Submission', 'Decision'] : ['KO/TKO', 'Decision']
      const order = [c.home, c.away]
      const method: GridMarket = {
        id: `${c.id}-method`,
        kind: 'grid',
        name: 'Method of Victory',
        tabs: ['popular', 'method'],
        columns: order.map((f) => {
          const p = f === c.home ? c.pHome : c.pAway
          const w = def.id === 'mma' ? [0.42, 0.18, 0.4] : [0.55, 0.45]
          return { label: f, team: f, cells: methods.map((m, i) => cell(`${c.id}-method-${abbr(f)}-${i}`, m, p * w[i]!, `${f} by ${m}`)) }
        }),
      }
      const groups = def.id === 'mma' ? ['R1', 'R2', 'R3', 'Decision'] : ['R1-4', 'R5-8', 'R9-12', 'Decision']
      const roundBetting: GridMarket = {
        id: `${c.id}-rounds`,
        kind: 'grid',
        name: 'Round Betting',
        tabs: ['rounds'],
        columns: order.map((f) => {
          const p = f === c.home ? c.pHome : c.pAway
          const w = def.id === 'mma' ? [0.22, 0.14, 0.1, 0.54] : [0.18, 0.17, 0.15, 0.5]
          return { label: f, team: f, cells: groups.map((g, i) => cell(`${c.id}-rb-${abbr(f)}-${i}`, g, p * w[i]!, `${f} · ${g}`)) }
        }),
      }
      return {
        tabs: T('popular', 'lines', 'method', 'rounds', 'props'),
        markets: P(
          winnerRow(c, 'ml', def.id === 'boxing' ? 'Fight Result' : 'Fight Winner', ['lines'], 0, def.id === 'boxing', 0.03),
          method,
          totalLadder(c, 'rounds-total', 'Total Rounds', ['popular', 'lines', 'rounds'], mean, def.totalSlope, 1, 'rounds'),
          yesNo(c, 'distance', 'Fight Goes the Distance', ['popular', 'lines'], def.id === 'mma' ? 0.46 : 0.52),
          roundBetting,
          row(c, 'inside', 'Wins Inside the Distance', ['method'], [[c.home, c.pHome * 0.55], [c.away, c.pAway * 0.5], ['Neither', 0.48]]),
          yesNo(c, 'r1', `Fight Ends in Round 1`, ['rounds', 'props'], def.id === 'mma' ? 0.18 : 0.07),
          yesNo(c, 'kd', 'Knockdown in the Fight', ['props'], 0.48),
          ...(rounds > 3 ? [yesNo(c, 'half', 'Fight Ends Before Round 7', ['rounds'], 0.31)] : []),
        ),
      }
    }
    case 'golf': {
      return {
        tabs: T('popular', 'lines', 'players', 'props'),
        markets: P(
          winnerRow(c, 'ml', '2-Ball Matchup', ['lines'], 0, true, 0.08),
          spreadLadder(c, 'sh', 'Stroke Handicap', ['lines']),
          duelLines(c, 'score', 'Round Score', ['popular', 'players'], 70.5, 1.7, 1, 'strokes'),
          duelLines(c, 'birdies', 'Birdies', ['players'], 4.5, 1.2, 1, 'birdies'),
          duelPlayers(c, 'top10', 'Top 10 Finish', ['popular', 'players'], ['Yes'], [0.32]),
          duelPlayers(c, 'cut', 'Make the Cut', ['players'], ['Yes'], [0.68]),
          yesNo(c, 'hio', 'Hole-in-One in the Group', ['props'], 0.03),
          yesNo(c, 'sub70', 'Both Shoot Under 70', ['props'], 0.22),
        ),
      }
    }
    case 'horse-racing': {
      const runners = ev.runners ?? []
      const chances = ev.game.outcomes.map((o) => o.chance / 100)
      const winRow: RowMarket = {
        id: `${c.id}-win`,
        kind: 'row',
        name: 'Win',
        tabs: ['race'],
        cells: runners.map((h, i) => cell(`${c.id}-win-${i}`, h, chances[i]!, `${h} to win`)),
      }
      const top = (key: string, name: string, k: number, tabs: string[]): RowMarket => ({
        id: `${c.id}-${key}`,
        kind: 'row',
        name,
        tabs,
        cells: runners.map((h, i) => cell(`${c.id}-${key}-${i}`, h, clamp(chances[i]! * k, 0.03, 0.92), `${h} · ${name}`)),
      })
      const pairs: RowMarket[] = [0, 2, 4].map((a) => ({
        id: `${c.id}-mb-${a}`,
        kind: 'row',
        name: `${runners[a]} v ${runners[a + 1]}`,
        tabs: ['matchups'],
        cells: [a, a + 1].map((i) => cell(`${c.id}-mb-${a}-${i}`, runners[i]!, chances[i]! / (chances[a]! + chances[a + 1]!), `${runners[i]} to beat ${runners[i === a ? a + 1 : a]}`)),
      }))
      return {
        tabs: T('popular', 'race', 'place', 'matchups', 'props'),
        markets: P(
          winRow,
          top('place', 'Place (Top 2)', 1.8, ['popular', 'place']),
          top('show', 'Show (Top 3)', 2.5, ['place']),
          top('fourth', 'Top 4 Finish', 3, ['place']),
          ...pairs,
          totalLadder(c, 'dist', 'Winning Distance', ['props'], 2.1, 0.8, 1, 'lengths'),
          yesNo(c, 'fav', 'Favourite Wins', ['popular', 'props'], chances[0]!),
        ),
      }
    }
    default: {
      /* Soccer — extra leagues, same groups as the V1 event view. */
      const u = 'goals'
      return {
        tabs: T('popular', 'goals', 'halves', 'corners', 'cards', 'players'),
        markets: P(
          winnerRow(c, '3way', '3-Way Regulation', ['lines'], 0, true, c.pDraw),
          spreadLadder(c, 'hcp', 'Spread', ['lines']),
          totalLadder(c, 'total', 'Total', ['goals'], mean, def.totalSlope, 1, u),
          yesNo(c, 'btts', 'Both Teams to Score', ['popular', 'goals'], 0.52),
          row(c, 'dc', 'Double Chance', ['popular'], [
            [`${c.home} or Draw`, c.pHome + c.pDraw],
            [`${c.home} or ${c.away}`, c.pHome + c.pAway],
            [`${c.away} or Draw`, c.pAway + c.pDraw],
          ]),
          row(c, 'dnb', 'Draw No Bet', ['popular'], [[c.home, c.pHome], [c.away, c.pAway]]),
          scoreGrid(c, 'cs', 'Correct Score', ['popular', 'goals'], [[1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [3, 2]], [[0, 0], [1, 1], [2, 2]]),
          playersMarket(c, 'gs', 'Goalscorers', ['popular', 'players'], ['First', 'Anytime', '2+'], [0.09, 0.33, 0.07]),
          teamTotals(c, 'tt', 'Team Total Goals', ['goals'], mean, 1.05, 1, u),
          row(c, 'exact', 'Exact Total Goals', ['goals'], [['0', 0.07], ['1', 0.17], ['2', 0.25], ['3', 0.23], ['4', 0.15], ['5+', 0.13]]),
          winnerRow(c, '1h', '1H Moneyline', ['popular', 'halves'], 0, true, 0.4),
          totalLadder(c, '1h-total', '1H Total', ['halves'], mean * 0.44, 1.3, 1, u),
          winnerRow(c, '2h', '2H Moneyline', ['halves'], 0.01, true, 0.34),
          totalLadder(c, 'corners', 'Total Corners', ['corners'], 9.8, 0.42, 1, 'corners'),
          row(c, 'mostc', 'Most Corners', ['corners'], [[c.home, c.pHome + 0.1], ['Tie', 0.1], [c.away, c.pAway + 0.1]]),
          totalLadder(c, '1h-corners', '1H Total Corners', ['corners'], 4.6, 0.6, 1, 'corners'),
          totalLadder(c, 'cards', 'Total Cards', ['cards'], 4.3, 0.6, 1, 'cards'),
          row(c, 'mostcards', 'Most Cards', ['cards'], [[c.home, 0.4], ['Tie', 0.2], [c.away, 0.4]]),
          yesNo(c, 'red', 'Red Card Shown', ['cards'], 0.14),
          playersMarket(c, 'carded', 'Player to be Carded', ['cards', 'players'], ['Yes'], [0.18]),
          playerLines(c, 'sot', 'Player Shots on Target', ['players'], 1.1, 0.5, 1, 'shots on target'),
        ),
      }
    }
  }
}

// ─── Event model (drives the shared V1 event frame) ─────────

function formOf(seed: string, p: number): FormResult[] {
  const r = rng(`form-${seed}`)
  return Array.from({ length: 5 }, () => {
    const x = r()
    return x < p * 0.9 ? 'W' : x < p * 0.9 + 0.18 ? 'D' : 'L'
  })
}

const modelCache = new Map<string, SportsEventModel>()

/** A full SportsEventModel for a generated event, so the V1 header, rail and breadcrumbs just work. */
export function genEventModel(eventId: string): SportsEventModel | null {
  const hit = modelCache.get(eventId)
  if (hit) return hit
  const ev = build().events.get(eventId)
  if (!ev) return null
  const { def, game, league } = ev
  const { tabs, markets } = marketsFor(ev)
  const siblings = build()
    .games.filter((g) => g.leagueName === league.name && g.v5Sport === def.id)
    .map((g) => toSoccerEvent(build().events.get(g.eventId!)!))
  const r = rng(`info-${eventId}`)
  const h2h = Array.from({ length: 5 }, (_, i) => {
    const flip = i % 2 === 1
    const a = Math.round(r() * (def.scoreMax || 3))
    const b = Math.round(r() * (def.scoreMax || 3))
    return {
      date: ['12 Mar 26', '04 Nov 25', '18 Apr 25', '22 Dec 24', '09 Sep 24'][i]!,
      home: flip ? ev.away : ev.home,
      away: flip ? ev.home : ev.away,
      score: [a, b] as [number, number],
    }
  })
  const wins = (p: number) => Math.round(4 + p * 9)
  const model: SportsEventModel = {
    sport: game.sport,
    event: toSoccerEvent(ev),
    league: { name: league.name, icon: league.logo },
    sportLabel: def.label,
    sportHref: `/sports/${def.slug}`,
    siblings,
    hrefFor: (id) => `/sports/${def.slug}/event/${id}`,
    eventLabel: game.title,
    tabs,
    markets,
    boardIds: new Set(),
    awayFirst: def.awayFirst,
    live: null,
    info: {
      homeForm: formOf(`${eventId}-h`, ev.pHome),
      awayForm: formOf(`${eventId}-a`, ev.pAway),
      h2h,
      winProb: [ev.pHome, ev.pDraw, ev.pAway],
      rows: [
        ['Competition', league.name],
        [game.field ? 'Off time' : 'Start', game.when],
        ...(league.venue ? ([['Venue', league.venue]] as [string, string][]) : []),
      ],
    },
    streamSrc: '',
    records:
      def.format === 'team' && !def.draw
        ? { home: `${wins(ev.pHome)}-${18 - wins(ev.pHome)}`, away: `${wins(ev.pAway)}-${18 - wins(ev.pAway)}` }
        : undefined,
  }
  modelCache.set(eventId, model)
  return model
}

function toSoccerEvent(ev: GenEvent): SoccerEvent {
  const { game } = ev
  return {
    id: game.eventId!,
    home: ev.home,
    away: ev.away || game.leagueName,
    homeAbbr: abbr(ev.home),
    awayAbbr: abbr(ev.away || game.leagueName),
    when: game.when,
    live: game.live,
    score: game.score ? (ev.def.awayFirst ? [game.score[1], game.score[0]] : game.score) : undefined,
    picks: [],
  }
}

/** W-L record for team sports without draws (board subtitle). */
export function genRecord(game: V5Game, label: string): string | null {
  const ev = build().events.get(game.eventId ?? '')
  if (!ev || ev.def.format !== 'team' || ev.def.draw) return null
  const p = label === ev.home ? ev.pHome : label === ev.away ? ev.pAway : null
  if (p === null) return null
  const w = Math.round(4 + p * 9)
  return `${w}-${18 - w}`
}

export function isFieldEvent(eventId: string): boolean {
  return !!build().events.get(eventId)?.game.field
}

// ─── Futures ─────────────────────────────────────────────────

type FutureSeed = { sport: V5SportId; key: string; title: string; league: string; logo: string; names: string[] }

const FUTURE_SEEDS: FutureSeed[] = [
  { sport: 'basketball', key: 'nba', title: 'NBA Champion 2027', league: 'NBA', logo: '/leagues/basketball/usa/nba.svg', names: ['Boston Celtics', 'Oklahoma City Thunder', 'Denver Nuggets', 'New York Knicks', 'Minnesota Timberwolves', 'Cleveland Cavaliers', 'Dallas Mavericks', 'Golden State Warriors'] },
  { sport: 'basketball', key: 'euro', title: 'EuroLeague Winner', league: 'EuroLeague', logo: '/leagues/basketball/europe/euroleague.svg', names: ['Real Madrid', 'Panathinaikos', 'Fenerbahçe', 'Olympiacos', 'FC Barcelona', 'AS Monaco'] },
  { sport: 'basketball', key: 'ncaab', title: 'NCAA Tournament Winner', league: 'NCAAB', logo: '/leagues/basketball/usa/ncaab.svg', names: ['UConn Huskies', 'Houston Cougars', 'Duke Blue Devils', 'Kansas Jayhawks', 'Purdue Boilermakers', 'Arizona Wildcats'] },
  { sport: 'hockey', key: 'cup', title: 'Stanley Cup 2027', league: 'NHL', logo: '/banners/sports_league/NHL.svg', names: ['Florida Panthers', 'Edmonton Oilers', 'Dallas Stars', 'Colorado Avalanche', 'Carolina Hurricanes', 'New York Rangers', 'Vegas Golden Knights', 'Winnipeg Jets'] },
  { sport: 'baseball', key: 'ws', title: 'World Series 2027', league: 'MLB', logo: '/leagues/baseball/usa/mlb.svg', names: ['Los Angeles Dodgers', 'New York Yankees', 'Atlanta Braves', 'Philadelphia Phillies', 'Baltimore Orioles', 'Houston Astros'] },
  { sport: 'baseball', key: 'lmp', title: 'LMP Champion', league: 'LMP', logo: '/leagues/baseball/mexico/lmp.svg', names: ['Tomateros de Culiacán', 'Naranjeros de Hermosillo', 'Charros de Jalisco', 'Águilas de Mexicali', 'Sultanes de Monterrey'] },
  { sport: 'tennis', key: 'atp', title: 'ATP Finals Winner', league: 'ATP Finals', logo: '/banners/sports_league/ATP.svg', names: people('tennis-ATP Finals', 8) },
  { sport: 'tennis', key: 'ao', title: 'Australian Open 2027', league: 'Australian Open', logo: '/banners/sports_league/australian-open.svg', names: people('tennis-ao', 8) },
  { sport: 'mma', key: 'ufc', title: 'Next Lightweight Champion', league: 'UFC Fight Night', logo: '/banners/sports_league/ufc.svg', names: people('mma-UFC Fight Night', 6) },
  { sport: 'boxing', key: 'wba', title: 'Heavyweight Champion at Year End', league: 'WBA World Title', logo: '/banners/sports_league/wba.svg', names: people('boxing-WBA World Title', 6) },
  { sport: 'golf', key: 'pga', title: 'Coastal Pines Classic — Winner', league: 'PGA Tour', logo: '/banners/sports_league/pga.svg', names: people('golf-PGA Tour', 12) },
  { sport: 'golf', key: 'dp', title: 'Desert Links Championship — Winner', league: 'DP World Tour', logo: ICON('Golf.svg'), names: people('golf-DP World Tour', 10) },
  { sport: 'horse-racing', key: 'derby', title: 'Spring Derby 2027 — Winner', league: 'Kempton Park', logo: ICON('Horse-Racing-101.svg'), names: horses('derby-2027', 10) },
  { sport: 'lacrosse', key: 'nll', title: 'NLL Champion 2027', league: 'NLL', logo: ICON('lacrosse.svg'), names: ['Buffalo Bandits', 'Toronto Rock', 'Colorado Mammoth', 'Calgary Roughnecks', 'San Diego Seals', 'Albany FireWolves'] },
  { sport: 'pool', key: 'mosconi', title: 'Mosconi Cup Winner', league: 'Mosconi Cup', logo: ICON('pool.svg'), names: ['Team Europe', 'Team USA'] },
  { sport: 'rugby', key: '6n', title: 'Six Nations 2027', league: 'Autumn Nations Series', logo: ICON('rugby.svg'), names: ['Ireland', 'France', 'England', 'Scotland', 'Wales', 'Italy'] },
  { sport: 'rugby', key: 'prem', title: 'Premiership Rugby Winner', league: 'Premiership Rugby', logo: ICON('rugby.svg'), names: ['Bath', 'Northampton Saints', 'Leicester Tigers', 'Saracens', 'Bristol Bears', 'Sale Sharks'] },
  { sport: 'table-tennis', key: 'wtt', title: 'WTT Finals Winner', league: 'WTT Finals', logo: ICON('table_tennis.svg'), names: people('table-tennis-WTT Finals', 8) },
  { sport: 'volleyball', key: 'cev', title: 'CEV Champions League Winner', league: 'SuperLega', logo: ICON('volley.svg'), names: ['Sir Safety Perugia', 'Itas Trentino', 'Jastrzębski Węgiel', 'Cucine Lube Civitanova', 'Aluron Zawiercie', 'Projekt Warszawa'] },
  { sport: 'soccer', key: 'seriea', title: 'Serie A Winner', league: 'Serie A', logo: '/leagues/soccer/italy/serie-a.svg', names: ['Inter', 'Napoli', 'Juventus', 'AC Milan', 'Atalanta', 'Roma'] },
  { sport: 'soccer', key: 'bundes', title: 'Bundesliga Winner', league: 'Bundesliga', logo: '/leagues/soccer/germany/bundesliga.svg', names: ['Bayern Munich', 'Bayer Leverkusen', 'Borussia Dortmund', 'RB Leipzig', 'VfB Stuttgart'] },
  { sport: 'soccer', key: 'ligue1', title: 'Ligue 1 Winner', league: 'Ligue 1', logo: '/leagues/soccer/france/ligue-1.svg', names: ['Paris Saint-Germain', 'Monaco', 'Marseille', 'Lille', 'Lyon'] },
]

let futureCache: V5Game[] | null = null

export function genFutures(): V5Game[] {
  if (futureCache) return futureCache
  futureCache = FUTURE_SEEDS.map((f) => {
    const r = rng(`future-${f.sport}-${f.key}`)
    const raw = f.names.map((_, i) => Math.exp(-i * 0.32) * (0.8 + r() * 0.4))
    const sum = raw.reduce((a, b) => a + b, 0)
    const eventId = `fut-${f.sport}-${f.key}`
    const outcomes: MarketOutcome[] = f.names.map((name, i) => ({
      id: `${eventId}-${i}`,
      label: name,
      short: abbr(name),
      team: name,
      chance: (raw[i]! / sum) * 100,
      price: clamp(Math.round((raw[i]! / sum) * 100), 1, 99),
      change: Math.round((r() - 0.5) * 50) / 10,
      position: `${name} to win`,
    }))
    const draw = sportDef(f.sport).draw
    return {
      id: `v5f-${f.sport}-${f.key}`,
      kind: 'future',
      sport: draw ? 'soccer' : 'nfl',
      category: draw ? 'soccer' : 'football',
      eventId,
      title: f.title,
      market: f.title,
      eventLabel: f.title,
      href: '',
      leagueName: f.league,
      leagueIcon: f.logo,
      when: 'Season',
      live: false,
      volume: Math.round(900_000 + r() * 4_200_000),
      outcomes,
      rules: 'Settles when the winner is official. Pays $1.00 per share on the winner.',
      v5Sport: f.sport,
    } satisfies V5Game
  })
  return futureCache
}

// ─── Per-sport stats for the nav ─────────────────────────────

export function sportCounts(): Record<V5SportId, { games: number; live: number }> {
  const out = {} as Record<V5SportId, { games: number; live: number }>
  for (const s of V5_SPORTS) out[s.id] = { games: 0, live: 0 }
  for (const g of build().games) {
    out[g.v5Sport].games += 1
    if (g.live) out[g.v5Sport].live += 1
  }
  return out
}

/** Odds-boost seeds for any sport — a favourite plus a total, priced up. */
export function genBoostTitle(game: V5Game): { title: string; was: number; boosted: number } {
  const lead = game.outcomes.filter((o) => o.label !== 'Draw').reduce((a, b) => (b.chance > a.chance ? b : a))
  const ladders = genLadders(game)
  const total = ladders.find((l) => l.kind === 'total')
  const rung = total?.rungs[total.defaultIndex]
  const p = (lead.chance / 100) * (rung ? rung.chance / 100 : 1) * 0.92
  const dec = 1 / Math.max(0.05, p)
  const was = Math.round((dec - 1) * 100)
  const boosted = Math.round(was * 1.25 + 10)
  const title = game.field
    ? `${lead.label} to win & ${game.outcomes[1]?.label ?? ''} top 3`
    : rung
      ? `${lead.label} to win & ${rung.yes.label}`
      : `${lead.label} to win inside the distance`
  return { title, was, boosted }
}

export { signed as fmtSigned }

// ─── League → country (league menu) ───────────────────────────

const LEAGUE_COUNTRY: Record<string, string> = {
  'Premier League': 'England',
  Championship: 'England',
  'League One': 'England',
  'FA Cup': 'England',
  'La Liga': 'Spain',
  'Serie A': 'Italy',
  Bundesliga: 'Germany',
  'Ligue 1': 'France',
  'Liga MX': 'Mexico',
  MLS: 'USA',
  'UEFA Champions League': 'Europe',
  'UEFA Europa League': 'Europe',
  NFL: 'USA',
  'NCAA Football': 'USA',
  NBA: 'USA',
  NCAAB: 'USA',
  EuroLeague: 'Europe',
  NHL: 'USA & Canada',
  NLL: 'USA & Canada',
  LMP: 'Mexico',
  'Caribbean Series': 'Caribbean',
  'Autumn Nations Series': 'International',
  'Premiership Rugby': 'England',
  'Top 14': 'France',
  SuperLega: 'Italy',
  PlusLiga: 'Poland',
  'Kempton Park': 'England',
  Aqueduct: 'USA',
  Flemington: 'Australia',
}

/** Country (or region) a league belongs to — drives the league menu's groups. */
export function leagueCountry(league: string): string {
  return LEAGUE_COUNTRY[league] ?? 'International'
}

/** League page URL segment — NFL and NCAA Football keep their V1 ids (`/sports/football/nfl`, `/ncaaf`). */
export function leagueSlug(name: string): string {
  if (name === 'NFL') return 'nfl'
  if (name === 'NCAA Football') return 'ncaaf'
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function leagueHref(sport: V5SportId, name: string): string {
  return `${sportHref(sport)}/${leagueSlug(name)}`
}
