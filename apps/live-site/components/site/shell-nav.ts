import type { ShellIconName } from './shell-icons'

export type ShellProduct = 'casino' | 'sports' | 'poker' | 'promotions'

export type ShellNavAction = 'launch-last-game' | 'launch-random'

export type ShellNavItem = {
  label: string
  href: string
  icon: ShellIconName
  /** Optional thumbnail (e.g. last game art) — shown instead of the vector icon. */
  iconSrc?: string
  /** Opens game launcher instead of navigating. */
  action?: ShellNavAction
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
  /* Mobile chips: Casino and Live Casino are mutually exclusive. */
  if (label === 'Casino') {
    return pathname.startsWith('/casino') && !pathname.startsWith('/casino/live')
  }
  if (label === 'Live Casino') return pathname.startsWith('/casino/live')
  if (label === 'Sports') return pathname.startsWith('/sports')
  if (label === 'Live Betting') return false
  if (label === 'Poker') return pathname.startsWith('/poker')
  if (label === 'Promos' || label === 'Contests') return pathname.startsWith('/promotions')
  return false
}

/** Which left-nav row is active for the current URL (Lobby vs Slots vs Live, etc.). */
export function navItemActive(item: Pick<ShellNavItem, 'label' | 'href'>, pathname: string): boolean {
  if (item.href === '/casino/slots') return pathname.startsWith('/casino/slots')
  if (item.href === '/casino/live') return pathname.startsWith('/casino/live')
  if (item.href === '/casino/table-games') return pathname.startsWith('/casino/table-games')
  if (item.href === '/casino/video-poker') return pathname.startsWith('/casino/video-poker')
  if (item.href === '/casino/specialty') return pathname.startsWith('/casino/specialty')
  if (item.href === '/casino/virtual-sports') return pathname.startsWith('/casino/virtual-sports')
  if (item.href === '/casino/category/popular') return pathname.startsWith('/casino/category/popular')
  if (item.href === '/casino/category/favourites') {
    return pathname.startsWith('/casino/category/favourites')
  }
  if (item.label === 'Casino Lobby') return pathname === '/casino' || pathname === '/'
  if (item.label === 'Sports Home') return pathname.startsWith('/sports')
  if (item.label === 'Start' && item.href === '/poker') return pathname.startsWith('/poker')
  if (item.label === 'All Promotions') return pathname.startsWith('/promotions')
  return false
}

export function withNavActive(groups: ShellNavGroup[], pathname: string): ShellNavGroup[] {
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      active: navItemActive(item, pathname),
    })),
  }))
}

export function navForProduct(product: ShellProduct): ShellNavGroup[] {
  if (product === 'sports') {
    return [
      {
        items: [
          { label: 'Sports Home', href: '/sports', icon: 'house', emphasis: true },
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
          { label: 'Start', href: '/poker', icon: 'start' },
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
          { label: 'All Promotions', href: '/promotions', icon: 'megaphone' },
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
        { label: 'Casino Lobby', href: '/casino', icon: 'library', emphasis: true },
        { label: 'Favorite', href: '/casino/category/favourites', icon: 'favorite', emphasis: true },
        {
          label: 'Play Random',
          href: '/casino',
          icon: 'random',
          action: 'launch-random',
          emphasis: true,
        },
        {
          label: 'Last Game Played',
          href: '/casino',
          icon: 'lastGame',
          iconSrc: '/games/originals/chicken.png',
          subtitle: 'Chicken',
          action: 'launch-last-game',
          emphasis: true,
        },
      ],
    },
    {
      items: [
        { label: 'Popular Games', href: '/casino/category/popular', icon: 'popular' },
        { label: 'Slots', href: '/casino/slots', icon: 'slots' },
        { label: 'Live Casino', href: '/casino/live', icon: 'live' },
        { label: 'Table Games', href: '/casino/table-games', icon: 'table' },
        { label: 'Video Poker', href: '/casino/video-poker', icon: 'videoPoker' },
        { label: 'Specialty Games', href: '/casino/specialty', icon: 'specialty' },
        { label: 'Virtuals', href: '/casino/virtual-sports', icon: 'virtuals' },
        { label: 'Tournaments', href: '/casino', icon: 'tournaments' },
      ],
    },
  ]
}
