/** Promo26 Contest — Main Lobby cards (Figma 2142:301257). */

export type ContestLobbyTabId =
  | 'main'
  | 'entries'
  | 'squares'
  | 'pickem'
  | 'bracket'
  | 'parlay'
  | 'survivor'
  | 'props'
  | 'help'

export const CONTEST_LOBBY_TABS: { id: ContestLobbyTabId; label: string }[] = [
  { id: 'main', label: 'Main Lobby' },
  { id: 'entries', label: 'My Entries' },
  { id: 'squares', label: 'Squares Lobby' },
  { id: 'pickem', label: "Pick'Em" },
  { id: 'bracket', label: 'Bracket' },
  { id: 'parlay', label: 'Parlay' },
  { id: 'survivor', label: 'Survivor' },
  { id: 'props', label: 'Props' },
  { id: 'help', label: 'Help' },
]

export type ContestLeague = 'nfl' | 'nba' | 'ncaa'

export type ContestStatusTone = 'warning' | 'success' | 'info' | 'muted'

export type ContestStatus = {
  label: string
  tone: ContestStatusTone
  icon: 'clock' | 'open' | 'presale' | 'calendar' | 'trophy'
}

export type ContestCard = {
  id: string
  league: ContestLeague
  prize: string
  title: string
  status: ContestStatus
  /** Orange featured ring (first card in Figma). */
  featured?: boolean
  /** Flame next to league mark. */
  hot?: boolean
  secondary?: 'rules' | 'results'
  /** Mid secondary action (My Entries / View Entry). */
  midAction?: { label: string; alert?: boolean }
  /** Primary CTA — omit when contest has no entry action. */
  cta?: string
  art: 'nfl' | 'nba' | 'ncaa'
}

export const CONTEST_CARDS: ContestCard[] = [
  {
    id: 'c1',
    league: 'nfl',
    prize: '$200.000',
    title: 'Bracket Road to Superbowl',
    status: { label: 'Closes in 20 min', tone: 'warning', icon: 'clock' },
    featured: true,
    hot: true,
    secondary: 'rules',
    midAction: { label: 'My Entries', alert: true },
    cta: 'Free entry',
    art: 'nfl',
  },
  {
    id: 'c2',
    league: 'nfl',
    prize: '$200.000',
    title: 'Bracket Road to Superbowl',
    status: { label: 'Closes in 20 min', tone: 'warning', icon: 'clock' },
    secondary: 'rules',
    midAction: { label: 'My Entries', alert: true },
    cta: 'Free Entry',
    art: 'nfl',
  },
  {
    id: 'c3',
    league: 'nfl',
    prize: '$200.000',
    title: 'Bracket Road to Superbowl',
    status: { label: 'Closes in 20 min', tone: 'warning', icon: 'clock' },
    secondary: 'rules',
    midAction: { label: 'View Entry' },
    cta: '$20 Entry',
    art: 'nfl',
  },
  {
    id: 'c4',
    league: 'nfl',
    prize: '$200.000',
    title: 'Bracket Road to Superbowl',
    status: { label: 'Open, 2D 14h', tone: 'success', icon: 'open' },
    secondary: 'rules',
    midAction: { label: 'My Entries' },
    cta: '$20 Entry',
    art: 'nfl',
  },
  {
    id: 'c5',
    league: 'nfl',
    prize: '$200.000',
    title: 'Bracket Road to Superbowl',
    status: { label: 'Pre-Sale', tone: 'info', icon: 'presale' },
    secondary: 'rules',
    cta: '$20 Entry',
    art: 'nfl',
  },
  {
    id: 'c6',
    league: 'nfl',
    prize: '$200.000',
    title: 'Bracket Road to Superbowl',
    status: { label: 'Opens in 4D', tone: 'muted', icon: 'calendar' },
    secondary: 'rules',
    art: 'nfl',
  },
  {
    id: 'c7',
    league: 'nba',
    prize: '$200.000',
    title: 'Bracket Road to Superbowl',
    status: { label: 'Opens in 4D', tone: 'muted', icon: 'calendar' },
    secondary: 'rules',
    art: 'nba',
  },
  {
    id: 'c8',
    league: 'ncaa',
    prize: '$200.000',
    title: 'Bracket Road to Superbowl',
    status: { label: 'Ended', tone: 'muted', icon: 'trophy' },
    secondary: 'results',
    art: 'ncaa',
  },
  {
    id: 'c9',
    league: 'nba',
    prize: '$200.000',
    title: 'Bracket Road to Superbowl',
    status: { label: 'Ended', tone: 'muted', icon: 'trophy' },
    secondary: 'results',
    art: 'nba',
  },
]

export const CONTEST_STATUS_CLASS: Record<
  ContestStatusTone,
  { badge: string; text: string }
> = {
  warning: {
    badge: 'border-warning/60 bg-warning/10',
    text: 'text-warning',
  },
  success: {
    badge: 'border-success/60 bg-success/10',
    text: 'text-success',
  },
  info: {
    badge: 'border-info/60 bg-info/10',
    text: 'text-info',
  },
  muted: {
    badge: 'border-border bg-secondary',
    text: 'text-secondary-foreground',
  },
}

export const CONTEST_LEAGUE_LOGO: Record<ContestLeague, string> = {
  nfl: '/promotions/contest/logo-nfl.svg',
  nba: '/promotions/contest/logo-nba.svg',
  ncaa: '/promotions/contest/logo-ncaa.svg',
}

export const CONTEST_STATUS_ICON: Record<ContestStatus['icon'], string> = {
  clock: '/promotions/contest/icon-clock.svg',
  open: '/promotions/contest/icon-open.svg',
  presale: '/promotions/contest/icon-presale.svg',
  calendar: '/promotions/contest/icon-calendar.svg',
  trophy: '/promotions/contest/icon-trophy.svg',
}

export const CONTEST_ART: Record<
  ContestCard['art'],
  { player: string; deco: string }
> = {
  nfl: {
    player: '/promotions/contest/player-nfl.png',
    deco: '/promotions/contest/corner-nfl-deco.svg',
  },
  nba: {
    player: '/promotions/contest/player-nba.png',
    deco: '/promotions/contest/corner-nba-deco.svg',
  },
  ncaa: {
    player: '/promotions/contest/player-ncaa.png',
    deco: '/promotions/contest/corner-ncaa-deco.svg',
  },
}
