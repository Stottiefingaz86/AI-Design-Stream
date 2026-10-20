export type CasinoTileTag = 'Original' | 'Live' | 'Tournament'

export type CasinoLobbyGame = {
  id: string
  title: string
  imageSrc: string
  vendor: string
  vendorLogo: string
  tag: CasinoTileTag
  live?: {
    title: string
    numbers: Array<{ value: string; tone: 'black' | 'red' | 'green' }>
    range: string
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

const LIVE_META: CasinoLobbyGame['live'] = {
  title: 'Live Roulette',
  numbers: [
    { value: '8', tone: 'black' },
    { value: '20', tone: 'black' },
    { value: '20', tone: 'red' },
    { value: '20', tone: 'green' },
    { value: '11', tone: 'black' },
  ],
  range: '$250 - $50.000',
}

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

function live(id: string, title = 'Live Roulette'): CasinoLobbyGame {
  return {
    id,
    title,
    imageSrc: TILE.live,
    vendor: 'VIG',
    vendorLogo: VIG_LOGO,
    tag: 'Live',
    live: { ...LIVE_META, title },
  }
}

/** Recent games only — Play Random is appended after these in the lobby rail. */
export const CONTINUE_PLAYING: CasinoLobbyGame[] = [
  originals('continue-blackjack'),
  live('continue-roulette'),
  slot('continue-plinko', 'Plinko', '/games/originals/plinko.png'),
]

export const ORIGINALS_GAMES: CasinoLobbyGame[] = ORIGINALS_ROSTER.map((game) =>
  originals(game.id, game.title, game.image),
)

export const NEW_GAMES: CasinoLobbyGame[] = ORIGINALS_ROSTER.slice(0, 10).map((game, i) =>
  slot(`new-${i + 1}`, game.title, game.image),
)

export const LIVE_GAMES: CasinoLobbyGame[] = Array.from({ length: 10 }, (_, i) =>
  live(`live-${i + 1}`),
)

export const TOP10_GAMES: CasinoLobbyGame[] = ORIGINALS_ROSTER.slice(0, 10).map((game, i) =>
  slot(`top10-${i + 1}`, game.title, game.image),
)

export const POPULAR_GAMES = NEW_GAMES.map((game, i) => ({ ...game, id: `popular-${i + 1}` }))
export const EXCLUSIVE_GAMES = NEW_GAMES.map((game, i) => ({ ...game, id: `exclusive-${i + 1}` }))
export const HALLOWEEN_GAMES = NEW_GAMES.map((game, i) => ({ ...game, id: `halloween-${i + 1}` }))
export const SLOTS_GAMES = NEW_GAMES.map((game, i) => ({ ...game, id: `slots-${i + 1}` }))
export const JACKPOT_GAMES = NEW_GAMES.map((game, i) => ({ ...game, id: `jackpot-${i + 1}` }))

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

/** Casino Master `jackpot-label` set — Must Drop gradient + colored tier names. */
export const JACKPOT_TIERS = [
  {
    id: 'must',
    label: 'Must Drop',
    amount: '$8888.88',
    countdown: '00:38:18',
    tone: 'must',
  },
  { id: 'mega', label: 'Mega', amount: '$8888.88', tone: 'mega' },
  { id: 'major', label: 'Major', amount: '$8888.88', tone: 'major' },
  { id: 'minor', label: 'Minor', amount: '$8888.88', tone: 'minor' },
  { id: 'mini', label: 'Mini', amount: '$8888.88', tone: 'mini' },
] as const

export const ACTIVITY_ROWS = [
  { user: 'Hidden', crown: 'gold', game: 'Diner Match', bet: '$1,076.54', multi: '8.28x', payout: '+$999,999.99', win: true },
  { user: 'Hidden', crown: 'purple', game: 'Winter Fishing Day', bet: '$102.53', multi: '6.69x', payout: '-$502.76', win: false },
  { user: 'Hidden', crown: 'silver', game: 'Plinko', bet: '$1,076.54', multi: '0.49x', payout: '+$25.96', win: true },
  { user: 'Hidden', crown: 'gold', game: 'Chicken Vegas', bet: '$352.98', multi: '1.26x', payout: '-$1,452.97', win: false },
  { user: 'Hidden', crown: 'purple', game: 'Diner Match', bet: '$1,076.54', multi: '8.28x', payout: '+$999,999.99', win: true },
  { user: 'Hidden', crown: 'silver', game: 'Plinko', bet: '$1,076.54', multi: '0.49x', payout: '+$25.96', win: true },
] as const
