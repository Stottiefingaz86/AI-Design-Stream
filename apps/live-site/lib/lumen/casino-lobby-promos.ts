import type { PromoLobbyBannerItem } from '@/components/lumen/casino-lobby-banners';

/** Figma 69-47911 promo cards — art from live-site `/banners/*`. */
export const CASINO_LOBBY_PROMO_BANNERS: PromoLobbyBannerItem[] = [
  {
    id: 'diner-match',
    tag: 'Promo',
    title: 'Diner Match',
    body: 'First deposit bonus up to 250%.',
    buttonLabel: 'Play Now',
    imageSrc: '/banners/dinerMatchBackground.png',
    imageAlt: 'Diner Match',
  },
  {
    id: 'originals',
    tag: 'Originals',
    title: 'Originals',
    body: 'Streamlined play for a guaranteed win.',
    buttonLabel: 'Play Now',
    imageSrc: '/banners/orginals.png',
    imageAlt: 'Originals',
  },
  {
    id: 'weekly',
    tag: 'VIP',
    title: 'Weekly Boost',
    body: 'Reload every week as you climb VIP.',
    buttonLabel: 'Play Now',
    imageSrc: '/banners/weekly.png',
    imageAlt: 'Weekly Boost',
  },
  {
    id: 'freespins',
    tag: 'Promo',
    title: 'Free Spins',
    body: '10 free spins for 10 days.',
    buttonLabel: 'Play Now',
    imageSrc: '/banners/freespins.png',
    imageAlt: 'Free Spins',
  },
];
