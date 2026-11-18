import type { VipHubTab } from '@/lib/lumen/vip-hub'
import { PROMOTIONS_LOBBY_CARDS, type PromoLobbyCard } from '@/lib/lumen/promotions-lobby'

/**
 * Promo detail pages — marketing builds these in the CMS from stackable blocks.
 * The modal renders blocks in order; unknown block types are skipped, so the CMS
 * can ship new types before the front end supports them.
 */
export type PromoCmsAction =
  | { type: 'cashier' }
  | { type: 'vip-hub'; tab?: VipHubTab }
  | { type: 'vip-match' }
  | { type: 'route'; href: string }
  | { type: 'link'; href: string }

export type PromoCmsImage = { src: string; alt: string }

export type PromoCmsBlock =
  | { type: 'hero'; image: PromoCmsImage; tag?: string; title: string; subtitle?: string }
  | { type: 'richText'; heading?: string; paragraphs: string[] }
  | { type: 'keyFacts'; items: { label: string; value: string }[] }
  | { type: 'steps'; heading?: string; items: { title: string; body: string }[] }
  | { type: 'bullets'; heading?: string; items: string[] }
  | { type: 'image'; image: PromoCmsImage; caption?: string }
  | { type: 'gallery'; heading?: string; images: PromoCmsImage[] }
  | {
      type: 'video'
      provider: 'file' | 'youtube'
      /** File URL, or YouTube video id. */
      src: string
      poster?: string
      caption?: string
    }
  | { type: 'terms'; heading?: string; items: string[] }

export type PromoCmsPage = {
  id: string
  title: string
  blocks: PromoCmsBlock[]
  cta?: { label: string; action: PromoCmsAction }
}

const REWARD = '/betonline-rewards-sentence-case'

const STANDARD_TERMS = [
  'Must be 18 or older to take part.',
  'One account per person, household and device.',
  'BetOnline may change or cancel this promotion at any time.',
  'General bonus terms apply.',
]

const PAGES: Record<string, PromoCmsPage> = {
  'diner-deposit': {
    id: 'diner-deposit',
    title: 'Diner Match',
    cta: { label: 'Deposit', action: { type: 'cashier' } },
    blocks: [
      {
        type: 'hero',
        image: { src: '/banners/dinerMatchBackground.png', alt: 'Diner Match' },
        tag: 'Deposit',
        title: 'Up to 250% on your first deposit',
        subtitle: 'Fuel your wallet and climb VIP faster.',
      },
      {
        type: 'keyFacts',
        items: [
          { label: 'Match', value: 'Up to 250%' },
          { label: 'Min deposit', value: '$20' },
          { label: 'Rollover', value: '30x' },
        ],
      },
      {
        type: 'steps',
        heading: 'How it works',
        items: [
          { title: 'Deposit', body: 'Make your first deposit of $20 or more.' },
          { title: 'Get matched', body: 'Your bonus lands in your wallet instantly.' },
          { title: 'Play', body: 'Use it on any casino game.' },
        ],
      },
      {
        type: 'gallery',
        heading: 'On the menu',
        images: [
          { src: '/banners/dinerMatchP3.png', alt: 'Diner Match prize' },
          { src: '/banners/dinerMatchP4.png', alt: 'Diner Match prize' },
          { src: '/banners/dinerMatchP5.png', alt: 'Diner Match prize' },
          { src: '/banners/dinerMatchP61.png', alt: 'Diner Match prize' },
        ],
      },
      {
        type: 'terms',
        items: [
          'First deposit only.',
          'Bonus and deposit must be wagered 30x before withdrawal.',
          ...STANDARD_TERMS,
        ],
      },
    ],
  },
  'train-heist': {
    id: 'train-heist',
    title: 'Train Heist Johnny Cash',
    cta: { label: 'Play Now', action: { type: 'route', href: '/casino' } },
    blocks: [
      {
        type: 'hero',
        image: { src: '/banners/train-heist-johnny-cash.jpg', alt: 'Train Heist Johnny Cash' },
        tag: 'New game',
        title: 'Train Heist Johnny Cash',
        subtitle: 'The outlaw cowboy returns in a brand-new BGaming slot.',
      },
      {
        type: 'video',
        provider: 'file',
        /* Placeholder — CMS supplies the trailer URL. */
        src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        poster: '/banners/train-heist-johnny-cash.jpg',
        caption: 'Watch the trailer',
      },
      {
        type: 'richText',
        heading: 'About the game',
        paragraphs: [
          'Ride with Johnny Cash across five reels of Wild West heists.',
          'Land three scatters to trigger free spins with sticky multipliers.',
        ],
      },
      {
        type: 'keyFacts',
        items: [
          { label: 'Provider', value: 'BGaming' },
          { label: 'RTP', value: '96.5%' },
          { label: 'Max win', value: '5,000x' },
        ],
      },
      { type: 'terms', items: STANDARD_TERMS },
    ],
  },
  'casino-rakeback': {
    id: 'casino-rakeback',
    title: 'Casino Rakeback',
    cta: { label: 'Open VIP Hub', action: { type: 'vip-hub', tab: 'VIP' } },
    blocks: [
      {
        type: 'hero',
        image: { src: `${REWARD}/casino-rakeback.jpg`, alt: 'Casino Rakeback' },
        tag: 'VIP',
        title: 'Rakeback on every casino bet',
        subtitle: 'All VIP levels. No catch. Just cash.',
      },
      {
        type: 'steps',
        heading: 'How it works',
        items: [
          { title: 'Play', body: 'Every casino bet adds to your rakeback, win or lose.' },
          { title: 'Watch it build', body: 'Your balance updates live in the VIP Hub.' },
          { title: 'Claim', body: 'Tap Claim whenever you like. Paid as cash.' },
        ],
      },
      {
        type: 'bullets',
        heading: 'Why players like it',
        items: ['No rollover on rakeback.', 'Rate goes up as you climb VIP.', 'Claim any time.'],
      },
      { type: 'terms', items: STANDARD_TERMS },
    ],
  },
  'free-spins': {
    id: 'free-spins',
    title: 'Free Spins',
    cta: { label: 'Deposit', action: { type: 'cashier' } },
    blocks: [
      {
        type: 'hero',
        image: { src: '/banners/freespins.png', alt: 'Free Spins' },
        tag: 'Casino',
        title: '10 free spins a day for 10 days',
        subtitle: 'On selected slots, after your first deposit.',
      },
      {
        type: 'keyFacts',
        items: [
          { label: 'Spins', value: '100 total' },
          { label: 'Per day', value: '10' },
          { label: 'Min deposit', value: '$20' },
        ],
      },
      {
        type: 'image',
        image: { src: '/banners/100-free-spins.jpg', alt: '100 Welcome Free Spins' },
        caption: 'Spins land in your VIP Hub each day.',
      },
      {
        type: 'terms',
        items: ['Spins expire 24 hours after they land.', ...STANDARD_TERMS],
      },
    ],
  },
  'cash-drop-codes': {
    id: 'cash-drop-codes',
    title: 'Cash Drop Codes',
    cta: { label: 'Open VIP Hub', action: { type: 'vip-hub', tab: 'Cash Drop Code' } },
    blocks: [
      {
        type: 'hero',
        image: { src: `${REWARD}/cash-drop-codes.jpg`, alt: 'Cash Drop Codes' },
        tag: 'VIP',
        title: 'Free cash, dropped daily',
        subtitle: 'Codes go out in our Daily Drops Telegram channel.',
      },
      {
        type: 'steps',
        heading: 'How it works',
        items: [
          { title: 'Join the channel', body: 'Follow Daily Drops on Telegram.' },
          { title: 'Grab a code', body: 'Codes are first come, first served.' },
          { title: 'Redeem', body: 'Enter it under Cash Drop Code in the VIP Hub.' },
        ],
      },
      { type: 'terms', items: ['Each code can be redeemed once per account.', ...STANDARD_TERMS] },
    ],
  },
}

/** Cards without a built page still open — banner, card copy and standard terms. */
function fallbackPage(card: PromoLobbyCard): PromoCmsPage {
  return {
    id: card.id,
    title: card.title,
    blocks: [
      { type: 'hero', image: { src: card.imageSrc, alt: card.title }, title: card.title },
      { type: 'richText', paragraphs: [card.body] },
      { type: 'terms', items: STANDARD_TERMS },
    ],
  }
}

const MOCK_LATENCY_MS = 350

/** Stand-in for the CMS fetch — swap for the real client; the modal only needs this shape. */
export async function fetchPromoPage(id: string): Promise<PromoCmsPage | null> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))
  if (PAGES[id]) return PAGES[id]
  const card = PROMOTIONS_LOBBY_CARDS.find((c) => c.id === id)
  return card ? fallbackPage(card) : null
}
