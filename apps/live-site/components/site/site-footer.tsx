'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTelegram,
  IconBrandTiktok,
  IconBrandX,
  IconBrandYoutube,
  IconCrown,
  IconHeadset,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const FOOTER_COLUMNS = [
  {
    title: 'Quick Links',
    links: [
      'About Us',
      'Refer a Friend',
      'Rules',
      'Banking',
      'Privacy Policy',
      'Affiliates',
      'Terms & Conditions',
      'Responsable Games',
    ],
  },
  {
    title: 'Casino',
    links: ['Play Casino', 'Blackjack', 'Baccarat', 'Craps', 'Roulette', 'Keno', 'Slots', 'Video Poker'],
  },
  {
    title: 'Sports',
    links: [
      'Sportsbook',
      'NFL Betting Odds',
      'NBA Betting Odds',
      'MLB Betting Odds',
      'NHL Betting Odds',
      'NCAAB Betting Odds',
      'Super Bowl Betting Odds',
      'Boxing Betting Odds',
    ],
  },
  {
    title: 'Poker',
    links: ['Play Poker', 'Download', 'Texas Holdem', 'Omaha Poker'],
  },
  {
    title: 'Racebook',
    links: ['Horse Betting', 'Kentucky Derby', 'Preakness Stakes', 'Belmont Stakes', 'Breeders Cup'],
  },
  {
    title: 'Other',
    links: ['VIP Rewards', 'News Room', 'Why BetOnline', 'BetOnline Vs Competition', 'Bet TV'],
  },
  {
    title: 'Support',
    links: ['Live Chat', 'Help Center'],
  },
] as const

const PARTNERS = [
  { src: '/banners/footer/partners/laliga.png', alt: 'LaLiga', width: 56 },
  { src: '/banners/footer/partners/lfa.png', alt: 'LFA', width: 53 },
  { src: '/banners/footer/partners/matchroom.png', alt: 'Matchroom', width: 89 },
  { src: '/banners/footer/partners/golden-boy.png', alt: 'Golden Boy', width: 90 },
] as const

const SOCIAL = [
  { icon: IconBrandFacebook, alt: 'Facebook' },
  { icon: IconBrandTelegram, alt: 'Telegram' },
  { icon: IconCrown, alt: 'VIP Telegram' },
  { icon: IconBrandInstagram, alt: 'Instagram' },
  { icon: IconBrandX, alt: 'X' },
  { icon: IconBrandTiktok, alt: 'TikTok' },
  { icon: IconBrandYoutube, alt: 'Rumble' },
] as const

type PaymentTile =
  | { kind: 'tile'; src: string; alt: string; bg: string; iconClass?: string }
  | { kind: 'badge'; src: string; alt: string; width: number }

const PAYMENTS: PaymentTile[] = [
  { kind: 'tile', src: '/banners/footer/payments/bitcoin.svg', alt: 'Bitcoin', bg: '#f8931a', iconClass: 'size-4' },
  { kind: 'tile', src: '/banners/footer/payments/ethereum.svg', alt: 'Ethereum', bg: '#ffffff', iconClass: 'h-4 w-3' },
  { kind: 'tile', src: '/banners/footer/payments/litecoin.svg', alt: 'Litecoin', bg: '#345d9d', iconClass: 'size-[18px]' },
  { kind: 'tile', src: '/banners/footer/payments/visa.svg', alt: 'Visa', bg: '#ffffff', iconClass: 'h-2.5 w-5' },
  { kind: 'tile', src: '/banners/footer/payments/mastercard.svg', alt: 'Mastercard', bg: '#ffffff', iconClass: 'size-4' },
  { kind: 'tile', src: '/banners/footer/payments/amex.svg', alt: 'American Express', bg: '#ffffff', iconClass: 'h-2.5 w-6' },
  { kind: 'tile', src: '/banners/footer/payments/discover.png', alt: 'Discover', bg: '#ffffff', iconClass: 'h-2.5 w-6' },
  { kind: 'tile', src: '/banners/footer/payments/interac.svg', alt: 'Interac', bg: '#fe1b0b', iconClass: 'size-4' },
  { kind: 'badge', src: '/banners/footer/badges/responsible-gaming.png', alt: 'Responsible Gambling Trust', width: 93 },
  { kind: 'badge', src: '/banners/footer/badges/ssl-secure.png', alt: 'Secure SSL Encryption', width: 70 },
]

/** Figma `footer-brand` / `footer-base` — BetOnline desktop full. */
export function SiteFooter() {
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const tick = () => {
      setCurrentTime(
        new Date().toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <footer
      data-name="footer-brand"
      className="mt-auto w-full shrink-0 border-t border-border-inverted bg-[var(--footer-inverted)] text-foreground-inverted"
    >
      <div className="flex w-full flex-col items-center gap-8 px-6 py-12">
        <div className="flex w-full max-w-[1440px] flex-wrap gap-6 lg:flex-nowrap">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className="flex min-w-[120px] flex-1 flex-col gap-3">
              <h3 className="text-sm font-semibold leading-5 text-foreground-inverted">{col.title}</h3>
              <ul className="flex flex-col gap-1">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="/"
                      className="text-xs font-medium leading-4 text-muted-foreground-inverted transition-colors duration-150 hover:text-foreground-inverted"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex w-full max-w-[1440px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex w-full max-w-[500px] flex-col gap-8">
            <Button className="h-9 w-full max-w-[215px]">
              <IconHeadset className="size-4 shrink-0" stroke={2} aria-hidden />
              Need Help?
            </Button>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                <h3 className="text-base font-semibold leading-6 text-foreground-inverted">
                  A Trusted & Safe Experience
                </h3>
                <Image
                  src="/banners/footer/badges/shield.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="size-6 shrink-0"
                  unoptimized
                />
              </div>
              <p className="text-xs font-normal leading-4 text-foreground-inverted">
                At BetOnline, our company&apos;s guiding principle is to establish long-lasting, positive relationships
                with our customers and within the online gaming community for over 25+ years.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 py-2">
              <span className="text-xs font-semibold leading-4 text-foreground-inverted">Official Partners</span>
              <span className="h-[30px] w-px shrink-0 bg-foreground-inverted/25" aria-hidden />
              {PARTNERS.map((partner) => (
                <div
                  key={partner.alt}
                  className="flex h-[30px] items-center justify-center rounded border border-border-inverted bg-[var(--surface-muted-2-inverted)] px-2"
                >
                  <Image
                    src={partner.src}
                    alt={partner.alt}
                    width={partner.width}
                    height={18}
                    className="h-[18px] w-auto"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-start gap-3 lg:justify-end">
            {SOCIAL.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.alt}
                  href="#"
                  className="inline-flex size-8 shrink-0 items-center justify-center text-muted-foreground-inverted transition-colors hover:text-foreground-inverted"
                  aria-label={item.alt}
                >
                  <Icon className="size-5" stroke={1.5} aria-hidden />
                </a>
              )
            })}
          </div>
        </div>

        <div className="flex w-full max-w-[1440px] flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex w-fit max-w-full flex-wrap items-center gap-3">
            {PAYMENTS.map((item) =>
              item.kind === 'tile' ? (
                <div
                  key={item.alt}
                  className="relative flex h-[30px] w-10 shrink-0 items-center justify-center overflow-hidden rounded-[2.67px]"
                  style={{ backgroundColor: item.bg }}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={24}
                    height={16}
                    className={cn('object-contain', item.iconClass)}
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  key={item.alt}
                  className="flex h-[30px] items-center justify-center rounded border border-border-inverted bg-[var(--surface-muted-2-inverted)] px-1.5"
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={24}
                    className="h-6 w-auto object-contain"
                    unoptimized
                  />
                </div>
              )
            )}
            <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-border-inverted bg-[var(--surface-muted-2-inverted)]">
              <span className="text-[10px] font-bold leading-[15px] text-foreground-inverted">18+</span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5 text-left text-xs leading-4 text-muted-foreground-inverted lg:items-end lg:text-right">
            <div className="font-semibold">{currentTime}</div>
            <div>Copyright ©{new Date().getFullYear()} [Brand-URL]. All rights reserved.</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
