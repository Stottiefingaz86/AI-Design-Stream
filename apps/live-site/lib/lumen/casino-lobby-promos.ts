import type { PromoLobbyBannerItem } from '@/components/lumen/casino-lobby-banners'

/** Figma 69-47911 / 111:151972 promo cards. */
export const CASINO_LOBBY_PROMO_BANNERS: PromoLobbyBannerItem[] = [
  {
    id: 'chicken-fire',
    tag: 'Game of the Week',
    title: 'Chicken Fire',
    body: 'Chicken Fire keeps everything packed tight. Fruits sit on a bright 3×3 grid.',
    buttonLabel: 'Play Now',
    imageSrc: '/banners/chicken-fire.jpg',
    imageAlt: 'Chicken Fire',
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
]
