import type { ShellIconName } from './shell-icons'

export type ShellProduct = 'casino' | 'sports' | 'poker' | 'promotions'

export type ShellNavItem = {
  label: string
  href: string
  icon: ShellIconName
  active?: boolean
  subtitle?: string
  emphasis?: boolean
  trailing?: ShellIconName
}

export type ShellNavGroup = {
  heading?: string
  items: ShellNavItem[]
}

export const HEADER_NAV = [
  { label: 'Casino', href: '/casino', product: 'casino' as const },
  { label: 'Sports', href: '/sports', product: 'sports' as const },
  { label: 'Live Betting', href: '/sports', product: 'sports' as const },
  { label: 'Poker', href: '/poker', product: 'poker' as const },
  { label: 'Promotions', href: '/promotions', product: 'promotions' as const },
] as const

export const CHIP_NAV = [
  { label: 'Home', href: '/' },
  { label: 'Casino', href: '/casino' },
  { label: 'Live Casino', href: '/casino/live' },
  { label: 'Sports', href: '/sports' },
  { label: 'Live Betting', href: '/sports' },
  { label: 'Poker', href: '/poker' },
  { label: 'Promos', href: '/promotions' },
  { label: 'Esports', href: '/sports' },
  { label: 'Racebook', href: '/sports' },
  { label: 'Contests', href: '/promotions' },
] as const

export const TABLET_NAV = [
  { label: 'Casino', href: '/casino' },
  { label: 'Sports', href: '/sports' },
  { label: 'Live Betting', href: '/sports' },
  { label: 'Promotions', href: '/promotions' },
] as const

export const OTHER_NAV = [
  { label: 'Racebook', href: '/sports' },
  { label: 'Contests', href: '/promotions' },
  { label: 'Esports', href: '/sports' },
] as const

const SPORTS_AZ = [
  'Baseball',
  'Basketball',
  'Boxing',
  'Football',
  'Golf',
  'Hockey',
  'Horse Racing',
  'Lacrosse',
  'MMA',
  'Pool',
  'Rugby',
  'Soccer',
  'Table Tennis',
  'Tennis',
  'Volleyball',
] as const

const SPORT_ICON: Record<string, ShellIconName> = {
  Baseball: 'star',
  Basketball: 'star',
  Football: 'star',
  Soccer: 'soccer',
}

export function productFromPath(pathname: string): ShellProduct {
  if (pathname.startsWith('/sports')) return 'sports'
  if (pathname.startsWith('/poker')) return 'poker'
  if (pathname.startsWith('/promotions')) return 'promotions'
  return 'casino'
}

export function headerItemActive(label: string, pathname: string) {
  if (label === 'Casino') return pathname === '/' || pathname.startsWith('/casino')
  if (label === 'Sports') return pathname.startsWith('/sports')
  if (label === 'Live Betting') return false
  if (label === 'Poker') return pathname.startsWith('/poker')
  if (label === 'Promotions' || label === 'Promos') return pathname.startsWith('/promotions')
  return false
}

export function chipItemActive(label: string, pathname: string) {
  if (label === 'Home') return pathname === '/'
  if (label === 'Casino')
    return (
      pathname === '/casino' ||
      (pathname.startsWith('/casino') &&
        !pathname.startsWith('/casino/live') &&
        !pathname.startsWith('/casino/slots'))
    )
  if (label === 'Live Casino') return pathname.startsWith('/casino/live')
  if (label === 'Sports') return pathname.startsWith('/sports')
  if (label === 'Poker') return pathname.startsWith('/poker')
  if (label === 'Promos' || label === 'Contests') return pathname.startsWith('/promotions')
  return false
}

export function navForProduct(product: ShellProduct): ShellNavGroup[] {
  if (product === 'sports') {
    return [
      {
        items: [
          { label: 'Sports Home', href: '/sports', icon: 'house', active: true, emphasis: true },
          { label: 'My Bets', href: '/sports', icon: 'bets', emphasis: true },
          { label: 'Live Betting', href: '/sports', icon: 'broadcast', emphasis: true },
          { label: 'World Cup 2026', href: '/sports', icon: 'star', emphasis: true },
          { label: 'Odds Boosters', href: '/sports', icon: 'rocket', emphasis: true },
          { label: 'Same Game Players', href: '/sports', icon: 'users', emphasis: true },
          { label: 'Mega Parlay', href: '/sports', icon: 'users', emphasis: true },
        ],
      },
      {
        heading: 'Top Leagues',
        items: [
          { label: 'NBA', href: '/sports', icon: 'star' },
          { label: 'NFL', href: '/sports', icon: 'star' },
          { label: 'MLB', href: '/sports', icon: 'star' },
        ],
      },
      {
        heading: 'Top Sports',
        items: [
          { label: 'Baseball', href: '/sports', icon: SPORT_ICON.Baseball },
          { label: 'Basketball', href: '/sports', icon: SPORT_ICON.Basketball },
          { label: 'Football', href: '/sports', icon: SPORT_ICON.Football },
          { label: 'Soccer', href: '/sports', icon: SPORT_ICON.Soccer },
        ],
      },
      {
        heading: 'A - Z',
        items: SPORTS_AZ.map((label) => ({
          label,
          href: '/sports',
          icon: (SPORT_ICON[label] ?? 'star') as ShellIconName,
        })),
      },
      {
        items: [{ label: 'Settings', href: '/sports', icon: 'gear' }],
      },
    ]
  }

  if (product === 'poker') {
    return [
      {
        items: [
          { label: 'Play Online', href: '/poker', icon: 'play', emphasis: true },
          { label: 'Download', href: '/poker', icon: 'download', emphasis: true },
        ],
      },
      {
        items: [
          { label: 'Start', href: '/poker', icon: 'start', active: true },
          { label: 'Features', href: '/poker', icon: 'diamond' },
          { label: 'Getting Started', href: '/poker', icon: 'rocket' },
          { label: 'Integrity', href: '/poker', icon: 'shield' },
          { label: 'Promotions', href: '/promotions', icon: 'gift' },
        ],
      },
    ]
  }

  if (product === 'promotions') {
    return [
      {
        items: [
          { label: 'All Promotions', href: '/promotions', icon: 'megaphone', active: true },
          { label: 'My Bonus', href: '/promotions', icon: 'gift' },
          { label: 'Contests', href: '/promotions', icon: 'contests' },
          { label: 'Refer A Friend', href: '/promotions', icon: 'refer' },
          { label: 'VIP Hub', href: '/promotions', icon: 'vip', trailing: 'external' },
        ],
      },
      {
        items: [{ label: 'Get Telegram', href: '/promotions', icon: 'telegram' }],
      },
    ]
  }

  return [
    {
      items: [
        { label: 'Casino Lobby', href: '/casino', icon: 'library', active: true, emphasis: true },
        { label: 'Favorite', href: '/casino', icon: 'favorite', emphasis: true },
        { label: 'Play Random', href: '/casino', icon: 'random', emphasis: true },
        { label: 'Last Game Played', href: '/casino', icon: 'lastGame', subtitle: '<Game Name>', emphasis: true },
      ],
    },
    {
      items: [
        { label: 'Popular Games', href: '/casino', icon: 'popular' },
        { label: 'Slots', href: '/casino/slots', icon: 'slots' },
        { label: 'Blackjack', href: '/casino', icon: 'blackjack' },
        { label: 'Video Poker', href: '/casino', icon: 'videoPoker' },
        { label: 'Specialty Games', href: '/casino', icon: 'specialty' },
        { label: 'Table Games', href: '/casino', icon: 'table' },
        { label: 'Live Casino', href: '/casino/live', icon: 'live' },
        { label: 'Tournaments', href: '/casino', icon: 'tournaments' },
      ],
    },
  ]
}
