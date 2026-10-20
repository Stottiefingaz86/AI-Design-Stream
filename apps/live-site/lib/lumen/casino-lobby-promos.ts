import type { PromoLobbyBannerItem } from '@/components/lumen/casino-lobby-banners'

/** Figma 69-47911 / 111:151972 promo cards. */
export const CASINO_LOBBY_PROMO_BANNERS: PromoLobbyBannerItem[] = [
  {
    id: 'train-heist',
    tag: 'Game of the Week',
    title: 'Train Heist Johnny Cash',
    body: 'Long time no see, Johnny Cash! The daring outlaw cowboy returns in a brand-new BGaming slot',
    buttonLabel: 'Play Now',
    imageSrc: '/banners/train-heist-johnny-cash.jpg',
    imageAlt: 'Train Heist Johnny Cash',
    imageMode: 'bleed',
  },
  {
    id: 'halloween',
    tag: 'Promo',
    title: 'Halloween Games',
    body: 'Play a selection of halloween games',
    buttonLabel: 'See games',
    imageSrc: '/banners/halloween-games.jpg',
    imageAlt: 'Halloween Games',
    imageMode: 'bleed',
  },
  {
    id: 'weekly',
    tag: 'VIP',
    title: 'Weekly Boost',
    body: 'Reload every week as you climb VIP.',
    buttonLabel: 'Play Now',
    imageSrc: '/banners/promo-weekly-art.png',
    imageAlt: 'Weekly Boost',
  },
  {
    id: 'freespins',
    tag: 'Promo',
    title: 'Free Spins',
    body: '10 free spins for 10 days.',
    buttonLabel: 'Play Now',
    imageSrc: '/banners/promo-freespins-art.png',
    imageAlt: 'Free Spins',
  },
]
