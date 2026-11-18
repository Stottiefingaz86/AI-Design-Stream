import type { PromoLobbyBannerItem } from '@/components/lumen/casino-lobby-banners'

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

/**
 * Banner strip — own list (not a dump of casino promos).
 * Removed for now: Halloween, Game of the Week, Diner Match, Originals Boost.
 */
export const PROMOTIONS_LOBBY_BANNERS: PromoLobbyBannerItem[] = [
  {
    id: '100-free-spins',
    tag: 'Promo',
    title: '100 Welcome Free Spins',
    body: 'Get rewarded with 100 Free Spins when you make your first deposit.',
    buttonLabel: 'Deposit',
    imageSrc: '/banners/100-free-spins.jpg',
    imageAlt: '100 Welcome Free Spins',
    imageMode: 'bleed',
    imageClassName: 'scale-[1.28] object-[88%_center] origin-right',
    bleedScrim: 'strong',
  },
  {
    id: 'vip-match',
    tag: 'Become a VIP',
    title: 'Instant VIP Match',
    body: 'Instantly get access to VIP Host, Lossback & exclusive benefits.',
    buttonLabel: 'Match Status Now',
    imageSrc: '/banners/vip-match.jpg',
    imageAlt: 'Instant VIP Match',
    imageMode: 'bleed',
  },
  {
    id: 'casino-rakeback',
    tag: 'VIP',
    title: 'Casino Rakeback',
    body: 'All VIP levels. No catch. Just cash.',
    buttonLabel: 'Learn More',
    imageSrc: '/banners/casino-rakeback.jpg',
    imageAlt: 'Casino Rakeback',
    imageMode: 'bleed',
  },
  {
    id: '25k-daily-race',
    tag: 'Race',
    title: '$25k Daily Race',
    body: 'The more you wager the higher you climb.',
    buttonLabel: 'Join Race',
    imageSrc: '/banners/25k-daily-race.jpg',
    imageAlt: '$25k Daily Race',
    imageMode: 'bleed',
  },
  {
    id: 'cash-boosts',
    tag: 'VIP',
    title: 'Cash Boosts',
    body: 'Simply click and claim. Cash — no strings attached.',
    buttonLabel: 'Claim Now',
    imageSrc: '/banners/cash-boosts.jpg',
    imageAlt: 'Cash Boosts',
    imageMode: 'bleed',
  },
]

/** Reward art — sentence-case titles baked into the stills. */
const REWARD = '/betonline-rewards-sentence-case'

/** Promo26 4×3 grid cards. */
export const PROMOTIONS_LOBBY_CARDS: PromoLobbyCard[] = [
  {
    id: 'cash-drop-codes',
    title: 'Cash Drop Codes',
    body: 'Claim a Cash Drop Code in our Daily Drops Telegram channel for extra cash.',
    imageSrc: `${REWARD}/cash-drop-codes.jpg`,
    category: 'vip',
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
    title: 'Weekly Boosts',
    body: 'Reload every week as you climb VIP with boosted rewards.',
    imageSrc: `${REWARD}/weekly-boosts.jpg`,
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
    id: 'vip-match',
    title: 'Instant VIP Match',
    body: 'Instantly get access to VIP Host, Lossback & exclusive benefits.',
    imageSrc: `${REWARD}/vip-match.jpg`,
    category: 'vip',
  },
  {
    id: 'vip-cashback',
    title: 'VIP Cashback',
    body: 'Weekly cashback for VIP members across sports and casino.',
    imageSrc: `${REWARD}/vip-cashback.jpg`,
    category: 'vip',
  },
  {
    id: 'casino-rakeback',
    title: 'Casino Rakeback',
    body: 'All VIP levels. No catch. Just cash.',
    imageSrc: `${REWARD}/casino-rakeback.jpg`,
    category: 'vip',
  },
  {
    id: 'monthly-boosts',
    title: 'Monthly Boosts',
    body: 'Monthly cash boosts that stack as you climb VIP.',
    imageSrc: `${REWARD}/monthly-boosts.jpg`,
    category: 'vip',
  },
  {
    id: 'post-monthly-boost',
    title: 'Post-Monthly Boost',
    body: 'Extra boost after your monthly cycle — exclusive to higher VIP tiers.',
    imageSrc: `${REWARD}/post-monthly-boost.jpg`,
    category: 'vip',
  },
  {
    id: 'refer-a-friend',
    title: 'Refer a Friend',
    body: 'Earn commission when friends you refer place qualifying bets.',
    imageSrc: `${REWARD}/refer-a-friend-commission.jpg`,
    category: 'vip',
  },
  {
    id: 'birthday-reward',
    title: 'Birthday Reward',
    body: 'A birthday cash reward once a year — claim when the day arrives.',
    imageSrc: `${REWARD}/birthday-reward.jpg`,
    category: 'vip',
  },
]
