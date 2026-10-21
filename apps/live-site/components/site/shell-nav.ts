import type { ShellIconName } from './shell-icons'

export type ShellProduct = 'casino' | 'sports' | 'poker' | 'promotions'

export type ShellNavGameAction = 'launch-last-game' | 'launch-random'
export type ShellNavAction = ShellNavGameAction | 'open-vip-hub'

export type ShellNavItem = {
  label: string
  href: string
  icon: ShellIconName
  /** Optional thumbnail (e.g. last game art) — shown instead of the vector icon. */
  iconSrc?: string
  /** Opens game launcher or VIP Hub instead of navigating. */
  action?: ShellNavAction
  active?: boolean
  subtitle?: string
  emphasis?: boolean
  trailing?: ShellIconName
}

/** Last side-nav row on every product — opens the VIP Hub sheet. */
export const VIP_HUB_NAV_ITEM: ShellNavItem = {
  label: 'VIP Hub',
  href: '#vip-hub',
  icon: 'vip',
  trailing: 'external',
  emphasis: true,
  action: 'open-vip-hub',
}

function withVipHub(groups: ShellNavGroup[]): ShellNavGroup[] {
  return [...groups, { items: [VIP_HUB_NAV_ITEM] }]
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
  { label: 'Contests', href: '/promotions/contest' },
] as const

export const TABLET_NAV = [
  { label: 'Casino', href: '/casino' },
  { label: 'Sports', href: '/sports' },
  { label: 'Live Betting', href: '/sports' },
  { label: 'Promotions', href: '/promotions' },
] as const

export const OTHER_NAV = [
  { label: 'Racebook', href: '/sports' },
  { label: 'Contests', href: '/promotions/contest' },
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

/** My Account area — Figma WIP sidebar-by-brand with account sections. */
export function isAccountPath(pathname: string) {
  return pathname.startsWith('/account')
}

/** Account left-nav / mobile tabs — Figma SidebarContent + nav-menu-solid. */
export const ACCOUNT_NAV: ShellNavGroup[] = [
  {
    items: [
      { label: 'My Account', href: '/account', icon: 'accountHome', emphasis: true },
      { label: 'Bet History', href: '/account/bet-history', icon: 'accountBetHistory' },
      { label: 'Transactions', href: '/account/transactions', icon: 'accountTransactions' },
      { label: 'Payments', href: '/account/payments', icon: 'accountPayments' },
      { label: 'Security Central', href: '/account/security', icon: 'accountSecurity' },
      { label: 'Profile Settings', href: '/account/settings', icon: 'accountSettings' },
    ],
  },
]

/** Sidebar/drawer groups for the current URL (account overrides product). */
export function navForPathname(pathname: string, product: ShellProduct): ShellNavGroup[] {
  if (isAccountPath(pathname)) return ACCOUNT_NAV
  return navForProduct(product)
}

export function headerItemActive(label: string, pathname: string) {
  if (label === 'Casino') return pathname.startsWith('/casino')
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
  if (label === 'Promos') {
    return pathname.startsWith('/promotions') && !pathname.startsWith('/promotions/contest')
  }
  if (label === 'Contests' || label === 'Contest') {
    return pathname.startsWith('/promotions/contest')
  }
  return false
}

/** Which left-nav row is active for the current URL (Lobby vs Slots vs Live, etc.). */
export function navItemActive(
  item: Pick<ShellNavItem, 'label' | 'href'>,
  pathname: string,
  hash = '',
): boolean {
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
  if (item.label === 'Casino Lobby') return pathname === '/casino' || pathname === '/casino/'
  if (item.label === 'Sports Home') return pathname.startsWith('/sports')
  if (item.label === 'All Promotions') {
    return pathname === '/promotions' || pathname === '/promotions/'
  }
  if (item.label === 'My Bonus') return pathname.startsWith('/promotions/my-bonus')
  if (item.label === 'Contests') return pathname.startsWith('/promotions/contest')

  if (item.href === '/account') {
    return pathname === '/account' || pathname === '/account/'
  }
  if (item.href.startsWith('/account/')) {
    return pathname.startsWith(item.href)
  }

  /* Poker landing section anchors — Promotions stays a real route.
     Emphasis CTAs (Play Online / Download) are never "active" from hash. */
  if (pathname.startsWith('/poker') && item.href.startsWith('/poker#')) {
    if (item.label === 'Play Online' || item.label === 'Download') return false
    const section = item.href.split('#')[1] ?? ''
    const current = hash || 'poker-start'
    return section === current
  }
  return false
}

export function withNavActive(
  groups: ShellNavGroup[],
  pathname: string,
  hash = '',
): ShellNavGroup[] {
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      active: navItemActive(item, pathname, hash),
    })),
  }))
}

export function navForProduct(product: ShellProduct): ShellNavGroup[] {
  if (product === 'sports') {
    return withVipHub([
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
    ])
  }

  if (product === 'poker') {
    return withVipHub([
      {
        items: [
          { label: 'Play Online', href: '/poker#poker-start', icon: 'play', emphasis: true },
          { label: 'Download', href: '/poker#poker-download', icon: 'download', emphasis: true },
        ],
      },
      {
        items: [
          { label: 'Start', href: '/poker#poker-start', icon: 'start' },
          { label: 'Features', href: '/poker#poker-features', icon: 'diamond' },
          { label: 'Getting Started', href: '/poker#poker-getting-started', icon: 'rocket' },
          { label: 'Integrity', href: '/poker#poker-integrity', icon: 'shield' },
          { label: 'Promotions', href: '/promotions', icon: 'gift' },
        ],
      },
    ])
  }

  if (product === 'promotions') {
    return withVipHub([
      {
        items: [
          { label: 'All Promotions', href: '/promotions', icon: 'megaphone' },
          { label: 'My Bonus', href: '/promotions/my-bonus', icon: 'gift' },
          { label: 'Contests', href: '/promotions/contest', icon: 'contests' },
          { label: 'Refer A Friend', href: '/promotions', icon: 'refer' },
        ],
      },
      {
        items: [{ label: 'Get Telegram', href: '/promotions', icon: 'telegram' }],
      },
    ])
  }

  return withVipHub([
    {
      items: [
        { label: 'Casino Lobby', href: '/casino', icon: 'home', emphasis: true },
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
  ])
}
