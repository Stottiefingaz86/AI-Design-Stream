import {
  CONTINUE_PLAYING,
  EXCLUSIVE_GAMES,
  HALLOWEEN_GAMES,
  LIVE_BACCARAT_GAMES,
  LIVE_BLACKJACK_GAMES,
  LIVE_GAMES,
  LIVE_OTHER_GAMES,
  LIVE_POKER_GAMES,
  LIVE_ROULETTE_GAMES,
  LIVE_TOP10_GAMES,
  LIVE_VIP_TABLES,
  NEW_GAMES,
  ORIGINALS_GAMES,
  POPULAR_GAMES,
  PROVIDERS,
  SLOTS_WALLPAPER_GAMES,
  SPECIALTY_SCRATCH_CARDS,
  TABLE_OTHER_GAMES,
  TOP10_GAMES,
  type CasinoLobbyGame,
} from '@/lib/lumen/casino-lobby-catalog'

export const WALLPAPER_SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'az', label: 'A–Z' },
  { id: 'popular', label: 'Popular' },
] as const

export type WallpaperSortId = (typeof WALLPAPER_SORT_OPTIONS)[number]['id']

export type WallpaperConfig = {
  slug: string
  title: string
  games: CasinoLobbyGame[]
  /** Optional Top 10 rail above the grid (Staff Picks). */
  top10Title?: string
  top10Games?: CasinoLobbyGame[]
}

/** Deterministic wallpaper set per key — same art pool, unique ids. */
function wallpaperFrom(seed: string, source: CasinoLobbyGame[] = SLOTS_WALLPAPER_GAMES): CasinoLobbyGame[] {
  const n = source.length || SLOTS_WALLPAPER_GAMES.length
  const offset = seed.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % n
  return Array.from({ length: 48 }, (_, i) => {
    const base = source[(offset + i) % n]!
    return { ...base, id: `${seed}-${base.id}-${i}` }
  })
}

export const WALLPAPER_CATEGORIES: Record<string, WallpaperConfig> = {
  megaways: {
    slug: 'megaways',
    title: 'Megaways',
    games: wallpaperFrom('megaways'),
  },
  'staff-picks': {
    slug: 'staff-picks',
    title: 'Staff Picks',
    games: wallpaperFrom('staff-picks', TOP10_GAMES.concat(SLOTS_WALLPAPER_GAMES)),
    top10Title: 'Top 10 Staff Picks',
    top10Games: TOP10_GAMES.map((g, i) => ({ ...g, id: `staff-top10-${i + 1}` })),
  },
  exclusive: {
    slug: 'exclusive',
    title: 'Exclusive',
    games: wallpaperFrom('exclusive', EXCLUSIVE_GAMES.concat(SLOTS_WALLPAPER_GAMES)),
  },
  new: {
    slug: 'new',
    title: 'New',
    games: wallpaperFrom('new', NEW_GAMES.concat(SLOTS_WALLPAPER_GAMES)),
  },
  originals: {
    slug: 'originals',
    title: 'Originals',
    games: wallpaperFrom('originals', ORIGINALS_GAMES.concat(SLOTS_WALLPAPER_GAMES)),
  },
  popular: {
    slug: 'popular',
    title: 'Popular',
    games: wallpaperFrom('popular', POPULAR_GAMES.concat(SLOTS_WALLPAPER_GAMES)),
    top10Title: 'Top 10 Games',
    top10Games: TOP10_GAMES.map((g, i) => ({ ...g, id: `popular-top10-${i + 1}` })),
  },
  halloween: {
    slug: 'halloween',
    title: 'Halloween Games',
    games: wallpaperFrom('halloween', HALLOWEEN_GAMES.concat(SLOTS_WALLPAPER_GAMES)),
  },
  christmas: {
    slug: 'christmas',
    title: 'Christmas Games',
    games: wallpaperFrom('christmas', HALLOWEEN_GAMES.concat(ORIGINALS_GAMES).concat(SLOTS_WALLPAPER_GAMES)),
  },
  'continue-playing': {
    slug: 'continue-playing',
    title: 'Continue Playing',
    games: wallpaperFrom('continue-playing', CONTINUE_PLAYING.concat(SLOTS_WALLPAPER_GAMES)),
  },
  'bonus-buy': {
    slug: 'bonus-buy',
    title: 'Bonus Buy',
    games: wallpaperFrom('bonus-buy'),
  },
  jackpots: {
    slug: 'jackpots',
    title: 'Jackpots',
    games: wallpaperFrom('jackpots'),
  },
  'scratch-cards': {
    slug: 'scratch-cards',
    title: 'Scratch Cards',
    games: wallpaperFrom('scratch-cards', SPECIALTY_SCRATCH_CARDS.concat(SLOTS_WALLPAPER_GAMES)),
  },
  blackjack: {
    slug: 'blackjack',
    title: 'Blackjack',
    games: wallpaperFrom('blackjack', ORIGINALS_GAMES.concat(SLOTS_WALLPAPER_GAMES)),
  },
  live: {
    slug: 'live',
    title: 'Live Casino',
    games: wallpaperFrom(
      'live',
      LIVE_GAMES.concat(LIVE_TOP10_GAMES).concat(SLOTS_WALLPAPER_GAMES),
    ),
  },
  'vip-tables': {
    slug: 'vip-tables',
    title: 'VIP Tables',
    games: wallpaperFrom('vip-tables', LIVE_VIP_TABLES.concat(LIVE_GAMES)),
  },
  baccarat: {
    slug: 'baccarat',
    title: 'Baccarat',
    games: wallpaperFrom('baccarat', LIVE_BACCARAT_GAMES.concat(LIVE_GAMES)),
  },
  roulette: {
    slug: 'roulette',
    title: 'Roulette',
    games: wallpaperFrom('roulette', LIVE_ROULETTE_GAMES.concat(LIVE_GAMES)),
  },
  'casino-poker': {
    slug: 'casino-poker',
    title: 'Casino Poker',
    games: wallpaperFrom('casino-poker', LIVE_POKER_GAMES.concat(LIVE_GAMES)),
  },
  'live-other': {
    slug: 'live-other',
    title: 'Other Games',
    games: wallpaperFrom('live-other', LIVE_OTHER_GAMES.concat(LIVE_GAMES)),
  },
  'table-other': {
    slug: 'table-other',
    title: 'Other Table Games',
    games: wallpaperFrom('table-other', TABLE_OTHER_GAMES.concat(SLOTS_WALLPAPER_GAMES)),
  },
  /** Live Casino shelf — live tables only, not RNG Blackjack sub-nav. */
  'live-blackjack': {
    slug: 'live-blackjack',
    title: 'Live Blackjack',
    games: wallpaperFrom('live-blackjack', LIVE_BLACKJACK_GAMES.concat(LIVE_GAMES)),
  },
  favourites: {
    slug: 'favourites',
    title: 'Favourites',
    games: wallpaperFrom(
      'favourites',
      CONTINUE_PLAYING.concat(POPULAR_GAMES).concat(ORIGINALS_GAMES).concat(SLOTS_WALLPAPER_GAMES),
    ),
  },
}

export function getCategoryWallpaper(slug: string): WallpaperConfig | null {
  return WALLPAPER_CATEGORIES[slug] ?? null
}

export function getProviderWallpaper(id: string): WallpaperConfig | null {
  const provider = PROVIDERS.find((p) => p.id === id)
  if (!provider) return null
  return {
    slug: provider.id,
    title: provider.name,
    games: wallpaperFrom(`provider-${provider.id}`),
  }
}

export function sortWallpaperGames(games: CasinoLobbyGame[], sort: WallpaperSortId) {
  const copy = [...games]
  switch (sort) {
    case 'oldest':
      return copy.reverse()
    case 'az':
      return copy.sort((a, b) => a.title.localeCompare(b.title))
    case 'popular':
      return copy.sort((a, b) => b.title.localeCompare(a.title))
    case 'newest':
    default:
      return copy
  }
}
