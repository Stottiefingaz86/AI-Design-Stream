export type CasinoTileTag = 'Original' | 'Live' | 'Tournament'

export type LiveGameKind = 'roulette' | 'baccarat' | 'blackjack' | 'poker'

export type CasinoLobbyGame = {
  id: string
  title: string
  imageSrc: string
  vendor: string
  vendorLogo: string
  tag: CasinoTileTag
  live?: {
    kind: LiveGameKind
    title: string
    range: string
    /** Seeds distinct starter history / art per tile. */
    seed: number
    seats?: { occupied: number; total: number }
  }
}

export const TILE = {
  blackjack: '/casino/tiles/blackjack-art.png',
  live: '/casino/tiles/live/dealer-green.png',
  /** Lumen originals art only — never BOL /games/square. */
  slots: '/games/originals/plinko.png',
} as const

const ORIGINALS_LOGO = '/vendot_logos/orginals.svg'
const BETSOFT_LOGO = '/vendot_logos/betsoft.svg'
const VIG_LOGO = '/vendot_logos/vig.svg'
const DECKFRESH_LOGO = '/vendot_logos/deckfresh.svg'

/** Figma Casino-Lumen live tile fills only (110:80910) — no BOL art. */
const LIVE_DEALERS = [
  '/casino/tiles/live/dealer-green.png',
  '/casino/tiles/live/dealer-red.png',
  '/casino/tiles/live/dealer-navy.png',
] as const

const LIVE_ART: Record<LiveGameKind, string[]> = {
  roulette: [...LIVE_DEALERS],
  blackjack: [...LIVE_DEALERS],
  baccarat: [...LIVE_DEALERS],
  poker: [...LIVE_DEALERS],
}

const LIVE_RANGES = ['$1 - $5,000', '$10 - $10,000', '$25 - $25,000', '$250 - $50,000', '$500 - $100,000']

/** Lumen Casino Tiles — 300×414 art under `/games/originals`. */
const ORIGINALS_ROSTER = [
  { id: 'blackjack', title: 'Blackjack', image: '/games/originals/blackjack.png' },
  { id: 'plinko', title: 'Plinko', image: '/games/originals/plinko.png' },
  { id: 'dice', title: 'Dice', image: '/games/originals/dice.png' },
  { id: 'diamonds', title: 'Diamonds', image: '/games/originals/diamonds.png' },
  { id: 'mines', title: 'Mines', image: '/games/originals/mines.png' },
  { id: 'keno', title: 'Keno', image: '/games/originals/keno.png' },
  { id: 'limbo', title: 'Limbo', image: '/games/originals/limbo.png' },
  { id: 'wheel', title: 'Wheel', image: '/games/originals/wheel.png' },
  { id: 'hilo', title: 'Hilo', image: '/games/originals/hilo.png' },
  { id: 'video-poker', title: 'Video Poker', image: '/games/originals/video-poker.png' },
  { id: 'baccarat', title: 'Baccarat', image: '/games/originals/baccarat.png' },
  { id: 'crash', title: 'Crash', image: '/games/originals/crash.png' },
  { id: 'dragons-tower', title: "Dragon's Tower", image: '/games/originals/dragons-tower.png' },
  { id: 'roulette', title: 'Roulette', image: '/games/originals/roulette.png' },
  { id: 'chicken', title: 'Chicken', image: '/games/originals/chicken.png' },
  { id: 'trader', title: 'Trader', image: '/games/originals/trader.png' },
] as const

function originals(
  id: string,
  title = 'Blackjack',
  imageSrc = '/games/originals/blackjack.png',
): CasinoLobbyGame {
  return {
    id,
    title,
    imageSrc,
    vendor: 'Originals',
    vendorLogo: ORIGINALS_LOGO,
    tag: 'Original',
  }
}

/** Lumen Casino-Tiles art under `/games/originals` — no BOL assets. */
const SLOT_ART = ORIGINALS_ROSTER.map((g) => g.image)

const SLOT_TITLES = ORIGINALS_ROSTER.map((g) => g.title)

function slot(
  id: string,
  title = 'Plinko',
  imageSrc: string = TILE.slots,
): CasinoLobbyGame {
  return {
    id,
    title,
    imageSrc,
    vendor: 'Originals',
    vendorLogo: ORIGINALS_LOGO,
    tag: 'Original',
  }
}

function live(
  id: string,
  kind: LiveGameKind,
  title: string,
  seed: number,
  seats?: { occupied: number; total: number },
): CasinoLobbyGame {
  const art = LIVE_ART[kind]
  const vendor = seed % 2 === 0 ? { name: 'VIG', logo: VIG_LOGO } : { name: 'Deckfresh', logo: DECKFRESH_LOGO }
  return {
    id,
    title,
    imageSrc: art[seed % art.length]!,
    vendor: vendor.name,
    vendorLogo: vendor.logo,
    tag: 'Live',
    live: {
      kind,
      title,
      range: LIVE_RANGES[seed % LIVE_RANGES.length]!,
      seed,
      seats,
    },
  }
}

type LiveRosterEntry = {
  id: string
  kind: LiveGameKind
  title: string
  seats?: { occupied: number; total: number }
}

function buildLiveShelf(prefix: string, roster: LiveRosterEntry[]): CasinoLobbyGame[] {
  return roster.map((entry, i) =>
    live(`${prefix}-${entry.id}`, entry.kind, entry.title, i + 1, entry.seats),
  )
}

const LIVE_LOBBY_ROSTER: LiveRosterEntry[] = [
  { id: 'roulette-1', kind: 'roulette', title: 'LIVE Roulette' },
  { id: 'bj-1', kind: 'blackjack', title: 'LIVE Blackjack', seats: { occupied: 3, total: 7 } },
  { id: 'baccarat-1', kind: 'baccarat', title: 'VIP Baccarat' },
  { id: 'roulette-2', kind: 'roulette', title: 'Speed Roulette' },
  { id: 'poker-1', kind: 'poker', title: 'Casino Hold’em', seats: { occupied: 4, total: 5 } },
  { id: 'bj-2', kind: 'blackjack', title: 'Infinite Blackjack', seats: { occupied: 5, total: 7 } },
  { id: 'baccarat-2', kind: 'baccarat', title: 'Speed Baccarat' },
  { id: 'roulette-3', kind: 'roulette', title: 'Lightning Roulette' },
  { id: 'bj-3', kind: 'blackjack', title: 'VIP Blackjack', seats: { occupied: 2, total: 7 } },
  { id: 'baccarat-3', kind: 'baccarat', title: 'Live Baccarat' },
]

/** Recent games only — Play Random is appended after these in the lobby rail. */
export const CONTINUE_PLAYING: CasinoLobbyGame[] = [
  originals('continue-blackjack'),
  live('continue-roulette', 'roulette', 'LIVE Roulette', 0),
  slot('continue-plinko', SLOT_TITLES[0], SLOT_ART[0]),
]

export const ORIGINALS_GAMES: CasinoLobbyGame[] = ORIGINALS_ROSTER.map((game) =>
  originals(game.id, game.title, game.image),
)

export const NEW_GAMES: CasinoLobbyGame[] = Array.from({ length: 10 }, (_, i) =>
  slot(`new-${i + 1}`, SLOT_TITLES[i % SLOT_TITLES.length], SLOT_ART[i % SLOT_ART.length]),
)

/** Lobby Live Casino rail — mixed tables (not one duplicated tile). */
export const LIVE_GAMES: CasinoLobbyGame[] = buildLiveShelf('live', LIVE_LOBBY_ROSTER)

/** Live Casino page shelves — Casino-Lumen 110:80910. */
export const LIVE_VIP_TABLES = buildLiveShelf('vip', [
  { id: '1', kind: 'blackjack', title: 'VIP Blackjack', seats: { occupied: 2, total: 7 } },
  { id: '2', kind: 'roulette', title: 'VIP Roulette' },
  { id: '3', kind: 'baccarat', title: 'VIP Baccarat' },
  { id: '4', kind: 'blackjack', title: 'Private Blackjack', seats: { occupied: 1, total: 7 } },
  { id: '5', kind: 'roulette', title: 'Salon Privé Roulette' },
  { id: '6', kind: 'poker', title: 'VIP Poker', seats: { occupied: 3, total: 5 } },
  { id: '7', kind: 'baccarat', title: 'Elite Baccarat' },
  { id: '8', kind: 'blackjack', title: 'High Limit BJ', seats: { occupied: 4, total: 7 } },
])

export const LIVE_BLACKJACK_GAMES = buildLiveShelf(
  'bj',
  Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1),
    kind: 'blackjack' as const,
    title: i % 3 === 0 ? 'VIP Blackjack' : i % 3 === 1 ? 'Infinite Blackjack' : 'LIVE Blackjack',
    seats: { occupied: ((i * 2) % 7) + 1, total: 7 },
  })),
)

export const LIVE_BACCARAT_GAMES = buildLiveShelf(
  'bac',
  Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1),
    kind: 'baccarat' as const,
    title: i % 2 === 0 ? 'VIP Baccarat' : 'Speed Baccarat',
  })),
)

export const LIVE_ROULETTE_GAMES = buildLiveShelf(
  'rou',
  Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1),
    kind: 'roulette' as const,
    title: i % 3 === 0 ? 'Lightning Roulette' : i % 3 === 1 ? 'Speed Roulette' : 'LIVE Roulette',
  })),
)

export const LIVE_POKER_GAMES = buildLiveShelf('poker', [
  { id: '1', kind: 'poker', title: 'Casino Hold’em', seats: { occupied: 4, total: 5 } },
  { id: '2', kind: 'poker', title: 'Three Card Poker', seats: { occupied: 2, total: 5 } },
  { id: '3', kind: 'poker', title: 'Caribbean Stud', seats: { occupied: 3, total: 5 } },
])

export const LIVE_OTHER_GAMES = buildLiveShelf('other', [
  { id: '1', kind: 'roulette', title: 'Crazy Time' },
  { id: '2', kind: 'blackjack', title: 'Deal or No Deal', seats: { occupied: 6, total: 7 } },
  { id: '3', kind: 'baccarat', title: 'Dragon Tiger' },
  { id: '4', kind: 'roulette', title: 'Monopoly Live' },
  { id: '5', kind: 'poker', title: 'Side Bet City', seats: { occupied: 1, total: 5 } },
  { id: '6', kind: 'roulette', title: 'Mega Ball' },
  { id: '7', kind: 'blackjack', title: 'Free Bet BJ', seats: { occupied: 5, total: 7 } },
  { id: '8', kind: 'baccarat', title: 'No Commission Baccarat' },
])

export const LIVE_TOP10_GAMES = LIVE_LOBBY_ROSTER.slice(0, 10).map((entry, i) =>
  live(`live-top10-${i + 1}`, entry.kind, entry.title, i + 11, entry.seats),
)

export const TOP10_GAMES: CasinoLobbyGame[] = Array.from({ length: 10 }, (_, i) =>
  slot(`top10-${i + 1}`, SLOT_TITLES[i % SLOT_TITLES.length], SLOT_ART[i % SLOT_ART.length]),
)

export const POPULAR_GAMES = NEW_GAMES.map((game, i) => ({ ...game, id: `popular-${i + 1}` }))
export const EXCLUSIVE_GAMES = NEW_GAMES.map((game, i) => ({ ...game, id: `exclusive-${i + 1}` }))
export const HALLOWEEN_GAMES = NEW_GAMES.map((game, i) => ({ ...game, id: `halloween-${i + 1}` }))
export const SLOTS_GAMES = NEW_GAMES.map((game, i) => ({ ...game, id: `slots-${i + 1}` }))
export const JACKPOT_GAMES = NEW_GAMES.map((game, i) => ({ ...game, id: `jackpot-${i + 1}` }))

/** Slots page Top 10 rail — Casino-Lumen 115:389970. */
export const SLOTS_TOP10_GAMES: CasinoLobbyGame[] = Array.from({ length: 10 }, (_, i) =>
  slot(
    `slots-top10-${i + 1}`,
    SLOT_TITLES[i % SLOT_TITLES.length],
    SLOT_ART[i % SLOT_ART.length],
  ),
)

/** Slots wallpaper grid — 100 portrait tiles. */
export const SLOTS_WALLPAPER_GAMES: CasinoLobbyGame[] = Array.from({ length: 100 }, (_, i) =>
  slot(
    `slots-wall-${i + 1}`,
    SLOT_TITLES[i % SLOT_TITLES.length],
    SLOT_ART[i % SLOT_ART.length],
  ),
)

export const PROVIDERS = [
  { id: 'originals', name: 'Originals', logo: ORIGINALS_LOGO },
  { id: 'betsoft', name: 'BetSoft', logo: BETSOFT_LOGO },
  { id: 'vig', name: 'VIG', logo: VIG_LOGO },
  { id: 'dragon', name: 'Dragon Gaming', logo: '/vendot_logos/Dragon gaming.svg' },
  { id: '777jacks', name: '777Jacks', logo: '/vendot_logos/777jacks.svg' },
  { id: 'arrows', name: "Arrow's Edge", logo: '/vendot_logos/arrows edge.svg' },
  { id: 'gls', name: 'Gold Tier Games', logo: '/vendot_logos/gls.svg' },
  { id: '5clover', name: '5 Clover', logo: '/vendot_logos/5clover.svg' },
  { id: 'blaze', name: 'Blaze', logo: '/vendot_logos/blaze.svg' },
  { id: 'deckfresh', name: 'Deckfresh', logo: '/vendot_logos/deckfresh.svg' },
  { id: 'dgs', name: 'DGS', logo: '/vendot_logos/dgs.svg' },
  { id: 'emerald', name: 'Emerald Gate', logo: '/vendot_logos/emerald gate.svg' },
  { id: 'fdbj', name: 'FDBJ', logo: '/vendot_logos/fdbj.svg' },
  { id: 'felix', name: 'Felix', logo: '/vendot_logos/felix.svg' },
  { id: 'i3soft', name: 'i3 Soft', logo: '/vendot_logos/i3soft.svg' },
  { id: 'kagaming', name: 'KA Gaming', logo: '/vendot_logos/kagaming.svg' },
  { id: 'lucky', name: 'Lucky', logo: '/vendot_logos/lucky.svg' },
  { id: 'mascot', name: 'Mascot Gaming', logo: '/vendot_logos/mascotgaming.svg' },
  { id: 'nucleus', name: 'Nucleus', logo: '/vendot_logos/nucleus.svg' },
  { id: 'onlyplay', name: 'Onlyplay', logo: '/vendot_logos/onlyplay.svg' },
  { id: 'popiplay', name: 'Popiplay', logo: '/vendot_logos/popiplay.svg' },
  { id: 'qora', name: 'Qora', logo: '/vendot_logos/qora.svg' },
  { id: 'redsparrow', name: 'Red Sparrow', logo: '/vendot_logos/red sparrow.svg' },
  { id: 'revolver', name: 'Revolver', logo: '/vendot_logos/revolver.svg' },
  { id: 'rival', name: 'Rival', logo: '/vendot_logos/rival.svg' },
  { id: 'spinthon', name: 'Spinthon', logo: '/vendot_logos/spinthon.svg' },
  { id: 'twain', name: 'Twain', logo: '/vendot_logos/twain.svg' },
  { id: 'wingo', name: 'Wingo', logo: '/vendot_logos/wingo.svg' },
  { id: 'xstudio', name: 'X Studio', logo: '/vendot_logos/xstudio.svg' },
] as const

export const HALLOWEEN_PROMO = {
  id: 'halloween',
  badge: 'Halloween',
  title: 'Lorem ipsum',
  body: 'Lorem ipsum dolor sit amet. Ut consequatur laboriosam non velit doloribus aut velit ullam qui modi reprehenderit rem inventore Lorem ipsum dolor sit amet.',
  imageSrc: '/casino/banners/halloween.png',
  /** Dark art — white copy. */
  tone: 'dark' as const,
  games: HALLOWEEN_GAMES,
}

export const CHRISTMAS_PROMO = {
  id: 'christmas',
  badge: 'Christmas',
  title: 'Lorem ipsum',
  body: 'Lorem ipsum dolor sit amet. Ut consequatur laboriosam non velit doloribus aut velit ullam qui modi reprehenderit rem inventore Lorem ipsum dolor sit amet.',
  imageSrc: '/casino/banners/christmas.png',
  /** Bright sky — dark copy (Figma Christmas). */
  tone: 'light' as const,
  games: HALLOWEEN_GAMES.map((game, i) => ({ ...game, id: `xmas-${i + 1}` })),
}

/**
 * Jackpot ticker — Must Drop, then Mini → Minor → Major → Mega (Mega far right).
 * Mini seeds at $100 with tiny ticks for a realistic slow climb.
 */
export const JACKPOT_TIERS = [
  {
    id: 'must',
    label: 'Must Drop',
    seedAmount: 8888.88,
    tickMin: 1,
    tickMax: 8,
    countdown: '00:38:18',
    tone: 'must' as const,
  },
  {
    id: 'mini',
    label: 'Mini',
    seedAmount: 100,
    tickMin: 0.01,
    tickMax: 0.12,
    tone: 'mini' as const,
  },
  {
    id: 'minor',
    label: 'Minor',
    seedAmount: 6225,
    tickMin: 0.05,
    tickMax: 0.35,
    tone: 'minor' as const,
  },
  {
    id: 'major',
    label: 'Major',
    seedAmount: 72700,
    tickMin: 0.2,
    tickMax: 1.5,
    tone: 'major' as const,
  },
  {
    id: 'mega',
    label: 'Mega',
    seedAmount: 1312000,
    tickMin: 0.8,
    tickMax: 5,
    tone: 'mega' as const,
  },
] as const

export type JackpotTierId = (typeof JACKPOT_TIERS)[number]['id']

export const ACTIVITY_ROWS = [
  { user: 'Hidden', crown: 'gold', game: 'Diner Match', bet: '$1,076.54', multi: '8.28x', payout: '+$999,999.99', win: true },
  { user: 'Hidden', crown: 'purple', game: 'Winter Fishing Day', bet: '$102.53', multi: '6.69x', payout: '-$502.76', win: false },
  { user: 'Hidden', crown: 'silver', game: 'Plinko', bet: '$1,076.54', multi: '0.49x', payout: '+$25.96', win: true },
  { user: 'Hidden', crown: 'gold', game: 'Chicken Vegas', bet: '$352.98', multi: '1.26x', payout: '-$1,452.97', win: false },
  { user: 'Hidden', crown: 'purple', game: 'Diner Match', bet: '$1,076.54', multi: '8.28x', payout: '+$999,999.99', win: true },
  { user: 'Hidden', crown: 'silver', game: 'Plinko', bet: '$1,076.54', multi: '0.49x', payout: '+$25.96', win: true },
] as const
