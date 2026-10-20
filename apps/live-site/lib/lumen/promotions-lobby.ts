import type { PromoLobbyBannerItem } from '@/components/lumen/casino-lobby-banners'
import { CASINO_LOBBY_PROMO_BANNERS } from '@/lib/lumen/casino-lobby-promos'

/** Promo26 SubMenu filters — All Promotions lobby. */
export const PROMO_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'vip', label: 'VIP Rewards' },
  { id: 'deposit', label: 'Deposit' },
  { id: 'sports', label: 'Sports' },
  { id: 'casino', label: 'Casino' },
  { id: 'poker', label: 'Poker' },
  { id: 'racebook', label: 'Racebook' },
  { id: 'esports', label: 'Esports' },
] as const

export type PromoFilterId = (typeof PROMO_FILTERS)[number]['id']

export type PromoLobbyCard = {
  id: string
  title: string
  body: string
  imageSrc: string
  category: PromoFilterId
}

/** Banner strip — same 340×164 PromoLobbyBanner cards as casino; no VIP/Races. */
export const PROMOTIONS_LOBBY_BANNERS: PromoLobbyBannerItem[] = [
  ...CASINO_LOBBY_PROMO_BANNERS,
  {
    id: 'diner-match',
    tag: 'Deposit',
    title: 'Diner Match',
    body: 'First deposit bonus up to 250%.',
    buttonLabel: 'Claim Now',
    imageSrc: '/banners/promo-diner-art.png',
    imageAlt: 'Diner Match',
  },
  {
    id: 'originals-boost',
    tag: 'Casino',
    title: 'Originals Boost',
    body: 'Extra rewards on BetOnline Originals this week.',
    buttonLabel: 'Play Now',
    imageSrc: '/banners/promo-originals-art.png',
    imageAlt: 'Originals Boost',
  },
]

/** Promo26 4×3 grid cards. */
export const PROMOTIONS_LOBBY_CARDS: PromoLobbyCard[] = [
  {
    id: 'poker-treasure',
    title: 'Poker Treasure Hunt',
    body: 'Hit the tables and chase timed rewards across cash games and tournaments.',
    imageSrc: '/promotions/promo-card-hero.png',
    category: 'poker',
  },
  {
    id: 'diner-deposit',
    title: 'Diner Match',
    body: 'First deposit bonus up to 250% — fuel your wallet and climb VIP faster.',
    imageSrc: '/banners/dinerMatchBackground.png',
    category: 'deposit',
  },
  {
    id: 'weekly-boost',
    title: 'Weekly Boost',
    body: 'Reload every week as you climb VIP with boosted rewards.',
    imageSrc: '/banners/promo-weekly-art.png',
    category: 'vip',
  },
  {
    id: 'free-spins',
    title: 'Free Spins',
    body: '10 free spins for 10 days on selected slots.',
    imageSrc: '/banners/freespins.png',
    category: 'casino',
  },
  {
    id: 'train-heist',
    title: 'Train Heist Johnny Cash',
    body: 'The daring outlaw cowboy returns in a brand-new BGaming slot.',
    imageSrc: '/banners/train-heist-johnny-cash.jpg',
    category: 'casino',
  },
  {
    id: 'halloween',
    title: 'Halloween Games',
    body: 'Play a selection of halloween games with seasonal promos.',
    imageSrc: '/banners/halloween-games.jpg',
    category: 'casino',
  },
  {
    id: 'sports-odds',
    title: 'Sports Odds Boost',
    body: 'Boosted markets on NFL, NBA, and soccer this week.',
    imageSrc: '/promotions/promo-card-hero.png',
    category: 'sports',
  },
  {
    id: 'vip-cashback',
    title: 'VIP Cashback',
    body: 'Weekly cashback for VIP members across sports and casino.',
    imageSrc: '/promotions/promo-card-hero.png',
    category: 'vip',
  },
  {
    id: 'racebook-daily',
    title: 'Racebook Daily',
    body: 'Daily specials on thoroughbred and harness racing markets.',
    imageSrc: '/promotions/promo-card-hero.png',
    category: 'racebook',
  },
  {
    id: 'esports-parlay',
    title: 'Esports Parlay',
    body: 'Parlay boosts on CS, LoL, and Dota match markets.',
    imageSrc: '/promotions/promo-card-hero.png',
    category: 'esports',
  },
  {
    id: 'poker-rakeback',
    title: 'Poker Rakeback',
    body: 'Earn extra value at the tables with limited-time rakeback.',
    imageSrc: '/promotions/promo-card-hero.png',
    category: 'poker',
  },
  {
    id: 'deposit-crypto',
    title: 'Crypto Deposit Bonus',
    body: 'Extra match when you fund with popular cryptocurrencies.',
    imageSrc: '/promotions/promo-card-hero.png',
    category: 'deposit',
  },
]
