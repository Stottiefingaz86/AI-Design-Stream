import type { VipHubTab } from '@/lib/lumen/vip-hub'

/** Runs before a step's target is looked up. Executed by `ProductTourHost` (shell-aware). */
export type ProductTourAction =
  | { type: 'route'; href: string }
  | { type: 'vip-hub'; tab: VipHubTab }
  | { type: 'cashier' }
  | { type: 'close-sheets' }
  | { type: 'click'; selector: string }
  /** Open/close the mobile drawer so promo nav targets are visible under `lg`. */
  | { type: 'nav'; open: boolean }

export type ProductTourStep = {
  /** CSS selector — first visible match is spotlit. Empty + `center` = welcome card only. */
  target: string
  title: string
  body: string
  before?: ProductTourAction[]
  /** Skip the step when the target never shows (e.g. wallet while logged out, sidebar on mobile). */
  optional?: boolean
  /** Full-screen dim + centred card. No spotlight hole. */
  center?: boolean
  /** Primary button label (default Next / Done). */
  cta?: string
}

export type ProductTour = {
  id: string
  /** Laura's one-line answer before the tour starts. */
  reply: string
  steps: ProductTourStep[]
}

const VIP_CROWN: ProductTourStep = {
  target: '[data-shell-vip]',
  title: 'VIP Hub',
  body: 'Rakeback, rewards and Daily Races live here.',
  before: [{ type: 'close-sheets' }],
}

const WALLET: ProductTourStep = {
  target: '[data-shell-balance]',
  title: 'Wallet',
  body: 'Deposits start here.',
  before: [{ type: 'close-sheets' }],
  optional: true,
}

const COINS: { id: string; label: string; ticker: string; match: RegExp }[] = [
  {
    id: 'bch',
    label: 'Bitcoin Cash',
    ticker: 'BCH',
    match: /\bbitcoin\s?cash\b|\bbch\b/,
  },
  { id: 'btc', label: 'Bitcoin', ticker: 'BTC', match: /\bbitcoin\b|\bbtc\b/ },
  {
    id: 'eth',
    label: 'Ethereum',
    ticker: 'ETH',
    match: /\bethereum\b|\beth\b/,
  },
  {
    id: 'ltc',
    label: 'Litecoin',
    ticker: 'LTC',
    match: /\blitecoin\b|\bltc\b/,
  },
  {
    id: 'usdc',
    label: 'USD Coin',
    ticker: 'USDC',
    match: /\busd\s?coin\b|\busdc\b/,
  },
  { id: 'usdt', label: 'Tether', ticker: 'USDT', match: /\btether\b|\busdt\b/ },
  { id: 'xrp', label: 'Ripple', ticker: 'XRP', match: /\bripple\b|\bxrp\b/ },
  {
    id: 'avax',
    label: 'Avalanche',
    ticker: 'AVAX',
    match: /\bavalanche\b|\bavax\b/,
  },
  { id: 'ada', label: 'Cardano', ticker: 'ADA', match: /\bcardano\b|\bada\b/ },
  { id: 'xlm', label: 'Stellar', ticker: 'XLM', match: /\bstellar\b|\bxlm\b/ },
  { id: 'doge', label: 'Dogecoin', ticker: 'DOGE', match: /\bdoge(coin)?\b/ },
  {
    id: 'matic',
    label: 'Polygon',
    ticker: 'MATIC',
    match: /\bpolygon\b|\bmatic\b/,
  },
  {
    id: 'shib',
    label: 'Shiba',
    ticker: 'SHIB',
    match: /\bshiba?(\s?inu)?\b|\bshib\b/,
  },
  { id: 'sol', label: 'Solana', ticker: 'SOL', match: /\bsolana\b|\bsol\b/ },
  {
    id: 'bnb',
    label: 'Binance Coin',
    ticker: 'BNB',
    match: /\bbinance\b|\bbnb\b/,
  },
  { id: 'trx', label: 'Tron', ticker: 'TRX', match: /\btron\b|\btrx\b/ },
  { id: 'trump', label: 'Trump Coin', ticker: 'TRUMP', match: /\btrump\b/ },
  { id: 'scor', label: 'Scor', ticker: 'SCOR', match: /\bscor\b/ },
]

const UNSUPPORTED_METHODS: { label: string; match: RegExp }[] = [
  { label: 'PayPal', match: /\bpay\s?pal\b/ },
  { label: 'Venmo', match: /\bvenmo\b/ },
  { label: 'Cash App', match: /\bcash\s?app\b/ },
  { label: 'Apple Pay', match: /\bapple\s?pay\b/ },
  { label: 'Google Pay', match: /\bgoogle\s?pay\b|\bgpay\b/ },
  { label: 'Skrill', match: /\bskrill\b/ },
  { label: 'Neteller', match: /\bneteller\b/ },
]

const CRYPTO_PILL = '[data-tour="deposit-method-crypto"]'

function cryptoSteps(): ProductTourStep[] {
  return [
    WALLET,
    {
      target: CRYPTO_PILL,
      title: 'Crypto',
      body: `${COINS.length} coins to choose from.`,
      before: [{ type: 'cashier' }, { type: 'click', selector: CRYPTO_PILL }],
    },
  ]
}

function coinTour(coin: (typeof COINS)[number]): ProductTour {
  return {
    id: `deposit-${coin.id}`,
    reply: `Yes, we take ${coin.label} (${coin.ticker}). Here’s where.`,
    steps: [
      ...cryptoSteps(),
      {
        target: `[data-tour="deposit-coin-${coin.id}"]`,
        title: `${coin.label} (${coin.ticker})`,
        body: 'Tap to get your deposit address.',
        before: [{ type: 'cashier' }, { type: 'click', selector: CRYPTO_PILL }],
      },
    ],
  }
}

const TOURS = {
  rakeback: {
    id: 'rakeback',
    reply: 'Casino Rakeback is in your VIP Hub. Here’s where to claim it.',
    steps: [
      VIP_CROWN,
      {
        target: '[data-tour="vip-reward-casino-rakeback"]',
        title: 'Casino Rakeback',
        body: 'Builds on every casino bet, win or lose. Tap Claim when it’s ready.',
        before: [{ type: 'vip-hub', tab: 'VIP' }],
      },
    ],
  },
  rewards: {
    id: 'rewards',
    reply: 'Your rewards are in the VIP Hub. Here’s where to claim them.',
    steps: [
      VIP_CROWN,
      {
        target: '[data-name="Click2Claim"]',
        title: 'Your rewards',
        body: 'Everything ready to claim sits here.',
        before: [{ type: 'vip-hub', tab: 'VIP' }],
      },
    ],
  },
  dailyRace: {
    id: 'daily-race',
    reply: 'The $25k Daily Race is in your VIP Hub. Here’s your position.',
    steps: [
      VIP_CROWN,
      {
        target: '[data-tour="vip-tab-$25k Daily Race"]',
        title: '$25k Daily Race',
        body: 'Today’s race, prizes and leaderboard.',
        before: [{ type: 'vip-hub', tab: '$25k Daily Race' }],
      },
      {
        target: '[data-name="daily-races-status"]',
        title: 'Your position',
        body: 'Rank and wagered amount update live.',
        before: [{ type: 'vip-hub', tab: '$25k Daily Race' }],
      },
      {
        target: '[data-race-you]',
        title: 'You on the leaderboard',
        body: 'Wager more to climb.',
        before: [{ type: 'vip-hub', tab: '$25k Daily Race' }],
      },
    ],
  },
  poker: {
    id: 'poker',
    reply: 'Poker runs in your browser or the app. Here’s where.',
    steps: [
      {
        target: 'header a[href="/poker"]',
        title: 'Poker',
        body: 'Opens the poker lobby.',
        before: [{ type: 'close-sheets' }],
        optional: true,
      },
      {
        target: '[data-tour="poker-play"]',
        title: 'Play Online',
        body: 'Play in your browser. No download.',
        before: [{ type: 'route', href: '/poker' }],
      },
      {
        target: '#poker-download',
        title: 'Poker app',
        body: 'iOS, Android and Windows.',
        before: [{ type: 'route', href: '/poker' }],
      },
    ],
  },
  tournaments: {
    id: 'casino-tournaments',
    reply: 'Casino tournaments are in the Casino lobby. Here’s where.',
    steps: [
      {
        target: '[data-name="sidebar-container"] a[aria-label="Tournaments"]',
        title: 'Tournaments',
        body: 'Every casino tournament in one place.',
        before: [{ type: 'route', href: '/casino' }],
        optional: true,
      },
      {
        target: '[data-tile-tag="Tournament"]',
        title: 'Tournament games',
        body: 'Games with this tag count toward a live tournament.',
        before: [{ type: 'route', href: '/casino' }],
      },
    ],
  },
  crypto: {
    id: 'deposit-crypto',
    reply: `Yes, ${COINS.length} coins including BTC, ETH and USDT. Here’s where.`,
    steps: cryptoSteps(),
  },
  card: {
    id: 'deposit-card',
    reply: 'Yes, you can deposit by card. Here’s where.',
    steps: [
      WALLET,
      {
        target: '[data-tour="deposit-method-card"]',
        title: 'Credit Card',
        body: 'Tap here to deposit by card.',
        before: [{ type: 'cashier' }],
      },
    ],
  },
  others: {
    id: 'deposit-others',
    reply: 'Yes. Bank wire, eCheck, MoneyGram and money order are under Others.',
    steps: [
      WALLET,
      {
        target: '[data-tour="deposit-method-others"]',
        title: 'Others',
        body: 'Bank wire, eCheck, MoneyGram and money order.',
        before: [{ type: 'cashier' }],
      },
    ],
  },
  /** V2 — fires once when the player lands on /promotions. */
  v2Promotions: {
    id: 'v2-promotions',
    reply: 'New in Promotions: Challenges, Raffles and Races.',
    steps: [
      {
        target: '',
        center: true,
        title: '🎉 What’s new',
        body: 'Challenges, Raffles and Races are in the Promotions menu.',
        cta: 'Let’s go',
        before: [{ type: 'close-sheets' }, { type: 'route', href: '/promotions' }],
      },
      {
        target: '[data-tour="promo-nav-challenges"]',
        title: 'Challenges',
        body: 'Hit the multiplier first. Win the prize.',
        before: [{ type: 'nav', open: true }],
      },
      {
        target: '[data-tour="promo-nav-raffles"]',
        title: 'Raffles',
        body: 'Free ticket each week. Earn more as you play.',
        before: [{ type: 'nav', open: true }],
      },
      {
        target: '[data-tour="promo-nav-races"]',
        title: 'Races',
        body: 'Daily Race moved here from VIP Hub.',
        before: [{ type: 'nav', open: true }],
      },
    ],
  },
} satisfies Record<string, ProductTour>

/** Once-per-browser flag for the V2 Promotions arrival tour. */
export const V2_PROMOTIONS_TOUR_SEEN_KEY = 'lumen-tour-seen-v2-promotions'
/** Open `/promotions?tour=1` (or `?tour=v2-promotions`) to replay. */
export function shouldForceV2PromotionsTour(search = ''): boolean {
  const raw = search.startsWith('?') ? search.slice(1) : search
  const v = new URLSearchParams(raw).get('tour')
  return v === '1' || v === 'v2-promotions'
}

export function getV2PromotionsTour(): ProductTour {
  return TOURS.v2Promotions
}

function depositTour(reply: string): ProductTour {
  return {
    id: 'deposit-methods',
    reply,
    steps: [
      WALLET,
      {
        target: '[data-tour="deposit-methods"]',
        title: 'Deposit methods',
        body: 'Crypto, credit card and others.',
        before: [{ type: 'cashier' }],
      },
    ],
  }
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9$\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Typo-tolerant — "rackback", "rake back", "rakeback", "rakebak". */
const RAKEBACK = /\bra[ck]{1,2}e?\s?ba[ck]{1,2}\b/
const DAILY_RACE = /\b(daily\s?)?races?\b|\bleaderboard\b|\bmy (rank|position|place)\b|\bposition\b/
const REWARDS =
  /\brewards?\b|\bclaim\b|\bbonus(es)?\b|\bfree\s?spins?\b|\bvip\b|\bcashback\b|\bpromos?\b/
const POKER = /\bpoker\b|\bhold\s?em\b|\btexas\b/
const TOURNAMENT = /\btournaments?\b|\btourneys?\b/
const DEPOSIT = /\bdeposit|\bfund|\btop\s?up\b|\bpay(ment)?\b|\bload\b|\badd money\b/
const CRYPTO = /\bcrypto|\bcoins?\b|\bwallet address\b/
const CARD =
  /\bcredit\b|\bdebit\b|\bcards?\b|\bvisa\b|\bmaster\s?card\b|\bamex\b|\bamerican express\b/
const OTHERS = /\bbank\b|\bwire\b|\becheck\b|\bmoney\s?gram\b|\bmoney order\b/

/** Maps a player's chat message to the tour that answers it. Null → hand to a human. */
export function matchProductTour(message: string): ProductTour | null {
  const text = normalize(message)
  if (!text) return null

  if (RAKEBACK.test(text)) return TOURS.rakeback
  /* "Casino tournaments" before poker — poker tournaments still land on poker. */
  if (TOURNAMENT.test(text) && !POKER.test(text)) return TOURS.tournaments
  if (POKER.test(text)) return TOURS.poker
  if (DAILY_RACE.test(text)) return TOURS.dailyRace

  const coin = COINS.find((c) => c.match.test(text))
  if (coin) return coinTour(coin)
  const unsupported = UNSUPPORTED_METHODS.find((m) => m.match.test(text))
  if (unsupported) return depositTour(`We don’t take ${unsupported.label}. Here’s what we do take.`)
  if (CRYPTO.test(text)) return TOURS.crypto
  if (CARD.test(text)) return TOURS.card
  if (OTHERS.test(text)) return TOURS.others
  if (DEPOSIT.test(text)) return depositTour('Here’s every way to deposit.')

  if (REWARDS.test(text)) return TOURS.rewards
  return null
}

export const PRODUCT_TOUR_SUGGESTIONS = [
  'Where is my rakeback?',
  'What’s my Daily Race position?',
  'Can I deposit with Solana?',
] as const

/* Tiny external store — Intercom starts tours, ProductTourHost renders them. */
export type ActiveProductTour = ProductTour & { runId: number }

type Listener = () => void
let activeTour: ActiveProductTour | null = null
let runCount = 0
const listeners = new Set<Listener>()

export function startProductTour(tour: ProductTour) {
  runCount += 1
  activeTour = { ...tour, runId: runCount }
  listeners.forEach((l) => l())
}

export function endProductTour() {
  activeTour = null
  listeners.forEach((l) => l())
}

export function subscribeProductTour(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getActiveProductTour() {
  return activeTour
}
