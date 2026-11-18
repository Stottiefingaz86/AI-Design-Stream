import { ACTIVITY_ROWS } from '@/lib/lumen/casino-lobby-catalog'

export type BaVariant = 'casino' | 'sports'

export type BaFilter = {
  id: string
  label: string
}

/** Workshop crowns — never empty; production VIP tones only. */
export type BaCrown = 'gold' | 'purple' | 'silver'

export type BaCasinoRow = {
  kind: 'casino'
  user: string
  crown: BaCrown
  game: string
  bet: string
  multi: string
  payout: string
  win: boolean
  /** Workshop tags for legacy filter tabs. */
  tags: Array<'all' | 'jackpot' | 'races'>
}

/** Open = pending/live (All). Graded filter = settled **wins** only (`won`). */
export type BaBetStatus = 'pending' | 'live' | 'won' | 'lost' | 'push'

export function isOpenBetStatus(status: BaBetStatus) {
  return status === 'pending' || status === 'live'
}

/** Settled win row — Graded filter; never clickable (game finished). */
export function isGradedBetStatus(status: BaBetStatus) {
  return status === 'won'
}

export type BaSportsRow = {
  kind: 'sports'
  user: string
  crown: BaCrown
  sport: 'NFL' | 'NBA' | 'Soccer' | 'MLB' | 'NHL'
  league: string
  home: string
  away: string
  homeLogo: string
  awayLogo: string
  /** Kickoff label or live clock (e.g. 45+2′). */
  when: string
  status: BaBetStatus
  score?: [number, number]
  selection: string
  odds: string
  stake: string
  /** Potential to-win while the bet is open. */
  toWin: string
}

/** One leg inside a parlay — same shape as a straight open bet. */
export type BaParlayLeg = Omit<BaSportsRow, 'kind' | 'user' | 'crown' | 'stake' | 'toWin' | 'odds'> & {
  odds: string
}

/** Multi-game open bet — Event shows primary leg + “+N more”. */
export type BaParlayRow = {
  kind: 'parlay'
  user: string
  crown: BaCrown
  legs: BaParlayLeg[]
  /** Combined American odds for the parlay. */
  odds: string
  stake: string
  toWin: string
  /** Live if any leg is live. */
  status: BaBetStatus
}

export type BaOpenSportsBet = BaSportsRow | BaParlayRow

export type BaFeedRow = BaCasinoRow | BaOpenSportsBet

export const BA_VARIANTS: { id: BaVariant; label: string; hint: string }[] = [
  {
    id: 'casino',
    label: 'Casino',
    hint: 'Production table shape — Activity only, no Jackpot / Daily Race pills',
  },
  {
    id: 'sports',
    label: 'Sports',
    hint: 'All includes open + graded wins; Graded tab = wins only (display-only) — tap open rows to add legs',
  },
]

/** Casino Activity matches production — table only, no filter pills. */
export const BA_CASINO_FILTERS: BaFilter[] = []

export const BA_SPORTS_FILTERS: BaFilter[] = [
  { id: 'all', label: 'All' },
  { id: 'parlay', label: 'Parlays' },
  { id: 'graded', label: 'Graded' },
  { id: 'NFL', label: 'NFL' },
  { id: 'NBA', label: 'NBA' },
  { id: 'Soccer', label: 'Soccer' },
  { id: 'MLB', label: 'MLB' },
  { id: 'NHL', label: 'NHL' },
]

export function filtersForVariant(variant: BaVariant): BaFilter[] {
  if (variant === 'casino') return BA_CASINO_FILTERS
  return BA_SPORTS_FILTERS
}

const USERS = [
  'Hidden',
  'ace_***',
  'lux***',
  'nova***',
  'bolt***',
  'kira***',
  'zen***',
  'fox***',
  'rex***',
  'ivy***',
] as const

const CROWNS: BaCrown[] = ['gold', 'purple', 'silver']

function crownFor(i: number): BaCrown {
  return CROWNS[i % CROWNS.length]!
}

/** Local EPL crests under /public/team. */
const LOCAL_TEAM_LOGO: Record<string, string> = {
  'Manchester United': '/team/Manchester United.png',
  'Manchester City': '/team/Manchester City.png',
  'Brighton & Hove Albion': '/team/Brighton & Hove Albion.png',
  Liverpool: '/team/Liverpool FC.png',
  Chelsea: '/team/Chelsea FC.png',
  Arsenal: '/team/Arsenal FC.png',
  Tottenham: '/team/Tottenham Hotspur.png',
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
}

/** ESPN CDN — workshop only for US leagues without local crests. */
const ESPN_ABBR: Record<string, { league: string; abbr: string }> = {
  'Kansas City Chiefs': { league: 'nfl', abbr: 'kc' },
  'Buffalo Bills': { league: 'nfl', abbr: 'buf' },
  'Philadelphia Eagles': { league: 'nfl', abbr: 'phi' },
  'Dallas Cowboys': { league: 'nfl', abbr: 'dal' },
  'San Francisco 49ers': { league: 'nfl', abbr: 'sf' },
  'Detroit Lions': { league: 'nfl', abbr: 'det' },
  'Baltimore Ravens': { league: 'nfl', abbr: 'bal' },
  'Cincinnati Bengals': { league: 'nfl', abbr: 'cin' },
  'Green Bay Packers': { league: 'nfl', abbr: 'gb' },
  'Chicago Bears': { league: 'nfl', abbr: 'chi' },
  'Miami Dolphins': { league: 'nfl', abbr: 'mia' },
  'New York Jets': { league: 'nfl', abbr: 'nyj' },
  'Minnesota Vikings': { league: 'nfl', abbr: 'min' },
  'Atlanta Falcons': { league: 'nfl', abbr: 'atl' },
  'Seattle Seahawks': { league: 'nfl', abbr: 'sea' },
  'Los Angeles Rams': { league: 'nfl', abbr: 'lar' },
  'Los Angeles Lakers': { league: 'nba', abbr: 'lal' },
  'Boston Celtics': { league: 'nba', abbr: 'bos' },
  'Denver Nuggets': { league: 'nba', abbr: 'den' },
  'Minnesota Timberwolves': { league: 'nba', abbr: 'min' },
  'Golden State Warriors': { league: 'nba', abbr: 'gs' },
  'LA Clippers': { league: 'nba', abbr: 'lac' },
  'Phoenix Suns': { league: 'nba', abbr: 'phx' },
  'Dallas Mavericks': { league: 'nba', abbr: 'dal' },
  'New York Knicks': { league: 'nba', abbr: 'ny' },
  'Miami Heat': { league: 'nba', abbr: 'mia' },
  'Milwaukee Bucks': { league: 'nba', abbr: 'mil' },
  'Cleveland Cavaliers': { league: 'nba', abbr: 'cle' },
  'Oklahoma City Thunder': { league: 'nba', abbr: 'okc' },
  'Houston Rockets': { league: 'nba', abbr: 'hou' },
  'Philadelphia 76ers': { league: 'nba', abbr: 'phi' },
  'Brooklyn Nets': { league: 'nba', abbr: 'bkn' },
  'New York Yankees': { league: 'mlb', abbr: 'nyy' },
  'Boston Red Sox': { league: 'mlb', abbr: 'bos' },
  'Los Angeles Dodgers': { league: 'mlb', abbr: 'lad' },
  'San Diego Padres': { league: 'mlb', abbr: 'sd' },
  'Atlanta Braves': { league: 'mlb', abbr: 'atl' },
  'Philadelphia Phillies': { league: 'mlb', abbr: 'phi' },
  'Houston Astros': { league: 'mlb', abbr: 'hou' },
  'Texas Rangers': { league: 'mlb', abbr: 'tex' },
  'Chicago Cubs': { league: 'mlb', abbr: 'chc' },
  'St. Louis Cardinals': { league: 'mlb', abbr: 'stl' },
  'New York Mets': { league: 'mlb', abbr: 'nym' },
  'Washington Nationals': { league: 'mlb', abbr: 'wsh' },
  'Seattle Mariners': { league: 'mlb', abbr: 'sea' },
  'Oakland Athletics': { league: 'mlb', abbr: 'oak' },
  'San Francisco Giants': { league: 'mlb', abbr: 'sf' },
  'Arizona Diamondbacks': { league: 'mlb', abbr: 'ari' },
  'Edmonton Oilers': { league: 'nhl', abbr: 'edm' },
  'Florida Panthers': { league: 'nhl', abbr: 'fla' },
  'New York Rangers': { league: 'nhl', abbr: 'nyr' },
  'New Jersey Devils': { league: 'nhl', abbr: 'nj' },
  'Toronto Maple Leafs': { league: 'nhl', abbr: 'tor' },
  'Montreal Canadiens': { league: 'nhl', abbr: 'mtl' },
  'Boston Bruins': { league: 'nhl', abbr: 'bos' },
  'Tampa Bay Lightning': { league: 'nhl', abbr: 'tb' },
  'Colorado Avalanche': { league: 'nhl', abbr: 'col' },
  'Dallas Stars': { league: 'nhl', abbr: 'dal' },
  'Vegas Golden Knights': { league: 'nhl', abbr: 'vgk' },
  'Los Angeles Kings': { league: 'nhl', abbr: 'la' },
  'Carolina Hurricanes': { league: 'nhl', abbr: 'car' },
  'Washington Capitals': { league: 'nhl', abbr: 'wsh' },
  'Pittsburgh Penguins': { league: 'nhl', abbr: 'pit' },
  'Philadelphia Flyers': { league: 'nhl', abbr: 'phi' },
}

export function teamLogoSrc(name: string): string {
  const local = LOCAL_TEAM_LOGO[name]
  if (local) return local
  const espn = ESPN_ABBR[name]
  if (espn) {
    return `https://a.espncdn.com/i/teamlogos/${espn.league}/500/${espn.abbr}.png`
  }
  return ''
}

/** Casino pool — tag high multis as jackpot; every 3rd as race board. */
export const BA_CASINO_POOL: BaCasinoRow[] = ACTIVITY_ROWS.map((row, i) => {
  const multiN = Number.parseFloat(row.multi)
  const tags: BaCasinoRow['tags'] = ['all']
  if (row.win && multiN >= 5) tags.push('jackpot')
  if (i % 3 === 0) tags.push('races')
  return {
    kind: 'casino',
    user: USERS[i % USERS.length]!,
    crown: crownFor(i),
    game: row.game,
    bet: row.bet,
    multi: row.multi,
    payout: row.payout,
    win: row.win,
    tags,
  }
})

const SPORTS_MATCHUPS: Record<
  BaSportsRow['sport'],
  { league: string; home: string; away: string }[]
> = {
  NFL: [
    { league: 'NFL', home: 'Kansas City Chiefs', away: 'Buffalo Bills' },
    { league: 'NFL', home: 'Philadelphia Eagles', away: 'Dallas Cowboys' },
    { league: 'NFL', home: 'San Francisco 49ers', away: 'Detroit Lions' },
    { league: 'NFL', home: 'Baltimore Ravens', away: 'Cincinnati Bengals' },
    { league: 'NFL', home: 'Green Bay Packers', away: 'Chicago Bears' },
    { league: 'NFL', home: 'Miami Dolphins', away: 'New York Jets' },
    { league: 'NFL', home: 'Minnesota Vikings', away: 'Atlanta Falcons' },
    { league: 'NFL', home: 'Seattle Seahawks', away: 'Los Angeles Rams' },
  ],
  NBA: [
    { league: 'NBA', home: 'Los Angeles Lakers', away: 'Boston Celtics' },
    { league: 'NBA', home: 'Denver Nuggets', away: 'Minnesota Timberwolves' },
    { league: 'NBA', home: 'Golden State Warriors', away: 'LA Clippers' },
    { league: 'NBA', home: 'Phoenix Suns', away: 'Dallas Mavericks' },
    { league: 'NBA', home: 'New York Knicks', away: 'Miami Heat' },
    { league: 'NBA', home: 'Milwaukee Bucks', away: 'Cleveland Cavaliers' },
    { league: 'NBA', home: 'Oklahoma City Thunder', away: 'Houston Rockets' },
    { league: 'NBA', home: 'Philadelphia 76ers', away: 'Brooklyn Nets' },
  ],
  Soccer: [
    { league: 'EPL', home: 'Manchester United', away: 'Manchester City' },
    { league: 'EPL', home: 'Liverpool', away: 'Chelsea' },
    { league: 'EPL', home: 'Arsenal', away: 'Tottenham' },
    { league: 'EPL', home: 'Newcastle United', away: 'Aston Villa' },
    { league: 'EPL', home: 'Brighton & Hove Albion', away: 'West Ham United' },
    { league: 'EPL', home: 'Everton', away: 'Fulham' },
    { league: 'EPL', home: 'Crystal Palace', away: 'Brentford' },
    { league: 'EPL', home: 'Nottingham Forest', away: 'AFC Bournemouth' },
  ],
  MLB: [
    { league: 'MLB', home: 'New York Yankees', away: 'Boston Red Sox' },
    { league: 'MLB', home: 'Los Angeles Dodgers', away: 'San Diego Padres' },
    { league: 'MLB', home: 'Atlanta Braves', away: 'Philadelphia Phillies' },
    { league: 'MLB', home: 'Houston Astros', away: 'Texas Rangers' },
    { league: 'MLB', home: 'Chicago Cubs', away: 'St. Louis Cardinals' },
    { league: 'MLB', home: 'New York Mets', away: 'Washington Nationals' },
    { league: 'MLB', home: 'Seattle Mariners', away: 'Oakland Athletics' },
    { league: 'MLB', home: 'San Francisco Giants', away: 'Arizona Diamondbacks' },
  ],
  NHL: [
    { league: 'NHL', home: 'Edmonton Oilers', away: 'Florida Panthers' },
    { league: 'NHL', home: 'New York Rangers', away: 'New Jersey Devils' },
    { league: 'NHL', home: 'Toronto Maple Leafs', away: 'Montreal Canadiens' },
    { league: 'NHL', home: 'Boston Bruins', away: 'Tampa Bay Lightning' },
    { league: 'NHL', home: 'Colorado Avalanche', away: 'Dallas Stars' },
    { league: 'NHL', home: 'Vegas Golden Knights', away: 'Los Angeles Kings' },
    { league: 'NHL', home: 'Carolina Hurricanes', away: 'Washington Capitals' },
    { league: 'NHL', home: 'Pittsburgh Penguins', away: 'Philadelphia Flyers' },
  ],
}

/** Open bets only — live + pending. */
const STATUS_CYCLE: {
  status: BaBetStatus
  when: string
  score?: [number, number]
}[] = [
  { status: 'live', when: "45+2'", score: [1, 1] },
  { status: 'pending', when: 'Tonight 7:30pm' },
  { status: 'live', when: 'Q3 8:14', score: [17, 14] },
  { status: 'pending', when: 'Sun 4:25pm' },
  { status: 'live', when: 'Bot 7', score: [4, 3] },
  { status: 'pending', when: 'Tonight 10:10pm' },
  { status: 'live', when: 'Q2 3:22', score: [58, 61] },
  { status: 'pending', when: 'Sat 7:00pm' },
]

const SELECTION_CYCLE = [
  { selection: 'Home −2.5', odds: '−110', stake: '$250.00', toWin: '+$227.27' },
  { selection: 'Away ML', odds: '+145', stake: '$80.00', toWin: '+$116.00' },
  { selection: 'Over 47.5', odds: '−105', stake: '$100.00', toWin: '+$95.24' },
  { selection: 'Under 224.5', odds: '−110', stake: '$150.00', toWin: '+$136.36' },
  { selection: 'Both Teams to Score', odds: '−125', stake: '$60.00', toWin: '+$48.00' },
  { selection: 'Home ML', odds: '−135', stake: '$135.00', toWin: '+$100.00' },
  { selection: 'Away +3.5', odds: '−108', stake: '$108.00', toWin: '+$100.00' },
  { selection: 'Over 8.5', odds: '−115', stake: '$120.00', toWin: '+$104.35' },
] as const

function shortTeam(name: string) {
  const parts = name.split(' ')
  return parts[parts.length - 1] || name
}

function buildSportsPool(): BaSportsRow[] {
  const out: BaSportsRow[] = []
  let i = 0
  for (const sport of Object.keys(SPORTS_MATCHUPS) as BaSportsRow['sport'][]) {
    for (const match of SPORTS_MATCHUPS[sport]) {
      const st = STATUS_CYCLE[i % STATUS_CYCLE.length]!
      const sel = SELECTION_CYCLE[i % SELECTION_CYCLE.length]!
      const when =
        sport === 'Soccer' && st.status === 'live'
          ? (['45+2\'', '67\'', '12\'', '90+1\''] as const)[i % 4]!
          : sport === 'NFL' && st.status === 'live'
            ? (['Q3 8:14', 'Q2 4:02', 'Q4 1:18', 'Q1 9:40'] as const)[i % 4]!
            : sport === 'NBA' && st.status === 'live'
              ? (['Q3 8:14', 'Q2 3:22', 'Q4 0:44', 'Q1 7:12'] as const)[i % 4]!
              : sport === 'MLB' && st.status === 'live'
                ? (['Bot 7', 'Top 5', 'Bot 9', 'Top 3'] as const)[i % 4]!
                : sport === 'NHL' && st.status === 'live'
                  ? (['P2 12:04', 'P3 4:18', 'P1 8:40', 'P2 1:02'] as const)[i % 4]!
                  : st.when
      const score =
        st.status === 'live'
          ? (st.score ?? ([1, 0] as [number, number]))
          : undefined
      out.push({
        kind: 'sports',
        user: USERS[i % USERS.length]!,
        crown: crownFor(i),
        sport,
        league: match.league,
        home: match.home,
        away: match.away,
        homeLogo: teamLogoSrc(match.home),
        awayLogo: teamLogoSrc(match.away),
        when,
        status: st.status,
        score,
        selection: sel.selection
          .replace('Home', shortTeam(match.home))
          .replace('Away', shortTeam(match.away)),
        odds: sel.odds,
        stake: sel.stake,
        toWin: sel.toWin,
      })
      i += 1
    }
  }
  return out
}

const PARLAY_COMBINED = ['+650', '+820', '+1,240', '+480', '+2,100', '+910'] as const
const PARLAY_STAKE = ['$50.00', '$25.00', '$100.00', '$40.00', '$75.00'] as const
const PARLAY_TO_WIN = ['+$325.00', '+$205.00', '+$1,240.00', '+$192.00', '+$1,575.00'] as const

function straightToLeg(row: BaSportsRow): BaParlayLeg {
  const { kind: _k, user: _u, crown: _c, stake: _s, toWin: _t, ...leg } = row
  return leg
}

function asPendingLeg(row: BaSportsRow): BaParlayLeg {
  const leg = straightToLeg(row)
  return {
    ...leg,
    status: 'pending',
    when: row.status === 'pending' ? row.when : 'Tonight 8:00pm',
    score: undefined,
  }
}

/** Build open parlays — half pending (not started), half with a live leg. */
function buildParlayPool(straights: BaSportsRow[]): BaParlayRow[] {
  const out: BaParlayRow[] = []
  const sizes = [3, 2, 4, 3, 2, 3, 4, 2] as const
  const pendingSrc = straights.filter((s) => s.status === 'pending')
  const liveSrc = straights.filter((s) => s.status === 'live')
  const pendingPool = pendingSrc.length > 0 ? pendingSrc : straights
  const livePool = liveSrc.length > 0 ? liveSrc : straights

  for (let p = 0; p < 8; p++) {
    const size = sizes[p % sizes.length]!
    const notStarted = p % 2 === 0
    const legs: BaParlayLeg[] = []

    if (notStarted) {
      for (let L = 0; L < size; L++) {
        const src = pendingPool[(p * 2 + L * 3) % pendingPool.length]!
        legs.push(asPendingLeg(src))
      }
    } else {
      /* Lead with a live leg; remaining legs mix pending + live. */
      legs.push(straightToLeg(livePool[p % livePool.length]!))
      for (let L = 1; L < size; L++) {
        const src = straights[(p * 3 + L * 5) % straights.length]!
        legs.push(straightToLeg(src))
      }
    }

    const status: BaBetStatus = legs.some((l) => l.status === 'live') ? 'live' : 'pending'
    out.push({
      kind: 'parlay',
      user: USERS[(p + 2) % USERS.length]!,
      crown: crownFor(p + 4),
      legs,
      odds: PARLAY_COMBINED[p % PARLAY_COMBINED.length]!,
      stake: PARLAY_STAKE[p % PARLAY_STAKE.length]!,
      toWin: PARLAY_TO_WIN[p % PARLAY_TO_WIN.length]!,
      status,
    })
  }
  return out
}

const BA_SPORTS_STRAIGHTS = buildSportsPool()
const BA_SPORTS_PARLAYS = buildParlayPool(BA_SPORTS_STRAIGHTS)

/** Settled **wins** — Graded filter only (not mixed into All). Non-clickable. */
function buildGradedPool(straights: BaSportsRow[]): BaSportsRow[] {
  const scores: [number, number][] = [
    [3, 1],
    [27, 24],
    [5, 3],
    [4, 1],
    [110, 98],
    [2, 0],
    [31, 17],
    [6, 2],
  ]
  const out: BaSportsRow[] = []
  for (let i = 0; i < 12; i++) {
    const src = straights[(i * 5 + 2) % straights.length]!
    out.push({
      ...src,
      user: USERS[(i + 3) % USERS.length]!,
      crown: crownFor(i + 7),
      status: 'won',
      when: 'Final',
      score: scores[i % scores.length]!,
      toWin: src.toWin,
    })
  }
  return out
}

const BA_SPORTS_GRADED = buildGradedPool(BA_SPORTS_STRAIGHTS)

/** Open straights + parlays + graded (filter separates them). */
export const BA_SPORTS_POOL: BaOpenSportsBet[] = (() => {
  const out: BaOpenSportsBet[] = []
  const n = Math.max(BA_SPORTS_STRAIGHTS.length, BA_SPORTS_PARLAYS.length)
  for (let i = 0; i < n; i++) {
    if (i < BA_SPORTS_STRAIGHTS.length) out.push(BA_SPORTS_STRAIGHTS[i]!)
    /* Every other slot after the first few — keep parlays visible without dominating. */
    if (i % 3 === 2 && i / 3 < BA_SPORTS_PARLAYS.length) {
      out.push(BA_SPORTS_PARLAYS[Math.floor(i / 3)]!)
    }
  }
  out.push(...BA_SPORTS_GRADED)
  return out
})()

export function poolForVariant(variant: BaVariant): BaFeedRow[] {
  if (variant === 'casino') return BA_CASINO_POOL
  return BA_SPORTS_POOL
}

function sportsMatchesFilter(row: BaOpenSportsBet, filterId: string): boolean {
  const open = isOpenBetStatus(row.status)
  const graded = isGradedBetStatus(row.status)

  if (filterId === 'graded') {
    /* Wins only — finished games, display-only. */
    return graded
  }
  if (filterId === 'parlay') {
    return row.kind === 'parlay' && open
  }
  /* All + sport filters include open bets AND graded wins. */
  if (!open && !graded) return false
  if (filterId === 'all') return true
  if (row.kind === 'sports') return row.sport === filterId
  return row.legs.some((leg) => leg.sport === filterId)
}

export function filterPool(
  variant: BaVariant,
  filterId: string,
  pool: BaFeedRow[],
): BaFeedRow[] {
  if (variant === 'casino') {
    if (filterId === 'all') return pool
    return pool.filter(
      (r): r is BaCasinoRow =>
        r.kind === 'casino' && r.tags.includes(filterId as BaCasinoRow['tags'][number]),
    )
  }

  if (variant === 'sports') {
    return pool.filter(
      (r): r is BaOpenSportsBet =>
        (r.kind === 'sports' || r.kind === 'parlay') && sportsMatchesFilter(r, filterId),
    )
  }

  return pool
}

/** Repeat templates so a filtered league never looks empty (always a full rail). */
export function padFeedPool(pool: BaFeedRow[], min = BA_ACTIVITY_VISIBLE * 2): BaFeedRow[] {
  if (pool.length === 0) return pool
  if (pool.length >= min) return pool
  const out: BaFeedRow[] = [...pool]
  let i = 0
  while (out.length < min) {
    out.push(pool[i % pool.length]!)
    i += 1
  }
  return out
}

export const BA_ACTIVITY_VISIBLE = 8
export const BA_ACTIVITY_TICK_MS = 900
export const BA_PRD_URL = '/ba/ACTIVITY_FEED_BEHAVIOUR.md'

/** Casino rows stay compact; sports matchup needs room for clock + teams + score. */
export function rowHeightClass(variant: BaVariant): string {
  /* 6rem — clock + teams + score fit inside the row with air (no clip). */
  return variant === 'casino' ? 'h-14' : 'h-24'
}

export function rowHeightCss(variant: BaVariant): string {
  return variant === 'casino' ? '3.5rem' : '6rem'
}
