'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { IconArrowRight } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { VipTierProgressCard } from '@/components/lumen/vip-tier-progress-card'
import { TileSpinner } from '@/components/lumen/casino-game-tile'
import { useShell } from '@/components/site/shell-context'
import { cn } from '@/lib/utils'

/** Featured originals shown in the Casino destination box (Homepage Smart-Banner). */
const CASINO_FEATURED = [
  '/games/originals/keno.png',
  '/games/originals/limbo.png',
  '/games/originals/plinko.png',
  '/games/originals/blackjack.png',
  '/games/originals/dice.png',
  '/games/originals/wheel.png',
] as const

const SPORTS_BENTO = [
  { src: '/banners/sports_league/NFL.svg', label: 'NFL', span: 'lg' as const },
  { src: '/banners/sports_league/nba.svg', label: 'NBA', span: 'lg' as const },
  { src: '/banners/sports_league/NHL.svg', label: 'NHL', span: 'sm' as const },
  { src: '/banners/sports_league/prem.svg', label: 'EPL', span: 'sm' as const },
  { src: '/banners/sports_league/mls.svg', label: 'MLS', span: 'sm' as const },
  { src: '/banners/sports_league/laliga.svg', label: 'La Liga', span: 'sm' as const },
]

/** Transparent SVGs — original compact optical heights (keeps hero shorter). */
const OFFICIAL_PARTNERS = [
  { src: '/banners/partners/laliga.svg', alt: 'LaLiga', width: 52, height: 14 },
  { src: '/banners/partners/lfa.svg', alt: 'LFA', width: 36, height: 10 },
  { src: '/banners/partners/matchroom.svg', alt: 'Matchroom', width: 64, height: 9 },
  { src: '/banners/partners/golden%20boy.svg', alt: 'Golden Boy', width: 60, height: 14 },
] as const

/** USP icons from Homepage_SHADCN Smart-Banner Info slots — keep original color art. */
const USP_ITEMS = [
  {
    icon: '/homepage/usp-crypto.svg',
    title: 'Deposit with Crypto',
    subtitle: 'Fast, easy & reliable',
  },
  {
    icon: '/homepage/usp-vip-crown.svg',
    title: 'VIP Rewards',
    subtitle: 'Level up bonuses, boosts & more',
  },
  {
    icon: '/homepage/usp-money-bag.svg',
    title: 'Bet Big',
    subtitle: 'High limits and Re-Bet functionality',
  },
  {
    icon: '/homepage/usp-payouts.svg',
    title: 'Fastest Payouts',
    subtitle: 'Payouts within minutes',
  },
  {
    icon: '/homepage/usp-lock.svg',
    title: 'Safe & Secure',
    subtitle: 'Trusted & protected',
  },
] as const

function HeroUspBar() {
  return (
    <div className="relative z-10 border-t border-white/20 bg-black/15">
      <div className="flex gap-1 overflow-x-auto px-4 py-3.5 scrollbar-hide min-[1000px]:grid min-[1000px]:grid-cols-5 min-[1000px]:overflow-visible min-[1000px]:gap-2 min-[1000px]:px-[clamp(24px,3vw,48px)]">
        {USP_ITEMS.map((item) => (
          <div
            key={item.title}
            className="flex min-w-[180px] shrink-0 items-center gap-3 px-1 py-0.5 sm:gap-3.5 min-[1000px]:min-w-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.icon}
              alt=""
              width={36}
              height={36}
              className="size-9 shrink-0 object-contain"
            />
            <div className="min-w-0 font-sans">
              <p className="text-xs font-semibold uppercase leading-4 text-white min-[1000px]:truncate">
                {item.title}
              </p>
              <p className="text-[10px] font-normal leading-[14px] text-white/75 min-[1000px]:truncate">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SportsBentoShelf() {
  return (
    <div className="absolute inset-0 overflow-clip rounded-[inherit] bg-background" aria-hidden>
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 gap-[3.6px] p-2.5">
        {SPORTS_BENTO.map((tile) => (
          <div
            key={tile.label}
            className={cn(
              'relative flex min-h-0 items-center justify-center overflow-hidden rounded-[5px] border border-border bg-secondary',
              tile.span === 'lg' && 'col-span-2 rounded-[10px]',
            )}
          >
            <Image
              src={tile.src}
              alt=""
              width={80}
              height={80}
              className={cn(
                'object-contain',
                tile.span === 'lg' ? 'h-[58%] w-[58%] max-h-14' : 'h-[52%] w-[52%] max-h-9',
              )}
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function CasinoOriginalsShelf() {
  return (
    <div className="absolute inset-0 overflow-clip rounded-[inherit] bg-background" aria-hidden>
      <div
        className="absolute left-1/2 top-[42%] grid w-[128%] grid-cols-3 gap-2"
        style={{ transform: 'translate(-50%, -50%) rotate(-8deg)' }}
      >
        {CASINO_FEATURED.map((src) => (
          <div
            key={src}
            className="relative aspect-[3/4] overflow-hidden rounded-md border border-border bg-background"
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover object-[center_28%]"
              sizes="120px"
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Casino / Sports destination cards — dark contrast on solid primary. */
function DestinationCard({
  href,
  title,
  iconSrc,
  children,
}: {
  href: string
  title: string
  iconSrc: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const startNavigate = () => {
    if (loading) return
    setLoading(true)
    timerRef.current = setTimeout(() => {
      router.push(href)
      timerRef.current = setTimeout(() => setLoading(false), 400)
    }, 900)
  }

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={loading ? `Loading ${title}` : title}
      aria-busy={loading}
      onClick={startNavigate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          startNavigate()
        }
      }}
      className={cn(
        /* dark → hub/drawer plate (`--background` #1a1a1a), not page light tokens */
        'dark group relative isolate flex aspect-square w-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground',
        'shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:-translate-y-0.5',
        loading && 'pointer-events-none',
      )}
    >
      <div className={cn('relative min-h-0 flex-1 overflow-hidden', loading && 'opacity-40')}>
        <div className="absolute inset-0 origin-center transition-transform duration-500 ease-out group-hover:scale-[1.05]">
          {children}
        </div>
      </div>

      <div
        className={cn(
          'relative z-[2] flex h-11 shrink-0 items-center overflow-hidden rounded-b-2xl bg-popover sm:h-[51px]',
          loading && 'opacity-40',
        )}
      >
        <div className="flex h-full w-full items-center justify-between gap-2 border-t border-border px-3 sm:px-4">
          <span className="flex items-center gap-2 text-xs font-semibold text-foreground sm:text-[13px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={iconSrc} alt="" className="size-4 object-contain brightness-0 invert" />
            {title}
          </span>
          <IconArrowRight className="size-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>
      </div>

      <div
        className={cn(
          'absolute inset-0 z-20 bg-black/55 transition-opacity duration-200 ease-out',
          loading ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden
      />
      <div
        className={cn(
          'pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200',
          loading ? 'opacity-100' : 'opacity-0',
        )}
      >
        {loading ? <TileSpinner /> : null}
      </div>
    </div>
  )
}

/**
 * Solid BetOnline primary hero — Figtree 900, Lumen 10px CTAs, dense 44/52 grid.
 */
export function HomeHero() {
  const { loggedIn, setVipHubOpen, openAuth } = useShell()

  return (
    <section className="relative overflow-clip rounded-[14px] bg-primary">
      {/*
        <1000px: stack. ≥1000px: 44% copy / 52% cards / 4% gap — no max-width gutting the centre.
      */}
      <div
        className={cn(
          'relative z-10 grid items-center gap-5 px-[clamp(16px,3vw,48px)] py-[clamp(16px,2.2vw,32px)]',
          'min-[1000px]:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] min-[1000px]:gap-x-8 min-[1000px]:gap-y-0',
        )}
      >
        <div className="flex min-w-0 flex-col items-center text-center min-[1000px]:items-start min-[1000px]:text-left">
          <h1
            className="w-full font-sans text-[clamp(44px,10vw,64px)] font-black leading-[0.95] tracking-[-0.045em] text-white min-[1000px]:text-[clamp(56px,5.2vw,96px)]"
            style={{ fontFamily: 'var(--font-figtree), Figtree, sans-serif' }}
          >
            Built for
            <br />
            winners.
          </h1>
          <p className="mt-3 max-w-[28rem] font-sans text-[15px] font-normal leading-[1.4] text-white/95 min-[1000px]:text-[clamp(15px,1.2vw,18px)]">
            Your next great moment starts here.
          </p>

          {loggedIn ? (
            <VipTierProgressCard
              className="mt-4 w-full max-w-[320px] border-white/25 bg-black/20 backdrop-blur-md hover:bg-black/30"
              onClick={() => setVipHubOpen(true)}
            />
          ) : (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 min-[1000px]:justify-start">
              {/* Lumen radius 10px — not pills */}
              <Button
                className="h-11 rounded-[10px] bg-white px-6 text-[15px] font-semibold text-[#1a1a1a] hover:bg-white/90 sm:h-[48px] sm:px-7 sm:text-base"
                onClick={() => openAuth('join')}
              >
                Register
                <IconArrowRight className="ml-1.5 size-4 sm:size-5" stroke={2.25} />
              </Button>
              <Button
                variant="outline"
                className="h-11 w-fit rounded-[10px] border border-white/80 bg-transparent px-4 text-[15px] font-semibold text-white hover:bg-white/10 hover:text-white sm:h-[48px] sm:px-5 sm:text-base"
                onClick={() => openAuth('login')}
              >
                Log in
              </Button>
            </div>
          )}

          <div className="mt-4 flex w-full flex-col items-center gap-1 min-[1000px]:items-start">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Official Partners
            </p>
            <div className="flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-1.5 min-[1000px]:justify-start">
              {OFFICIAL_PARTNERS.map((partner) => (
                <Image
                  key={partner.alt}
                  src={partner.src}
                  alt={partner.alt}
                  width={partner.width}
                  height={partner.height}
                  className="w-auto brightness-0 invert opacity-90"
                  style={{ height: partner.height }}
                  unoptimized
                />
              ))}
            </div>
          </div>
        </div>

        {/* Cap card size — full-bleed squares were forcing a huge hero height. */}
        <div className="mx-auto grid w-full max-w-[440px] grid-cols-2 gap-3.5 min-[1000px]:ml-auto min-[1000px]:mr-0 min-[1000px]:max-w-[min(100%,480px)] min-[1000px]:gap-4 xl:max-w-[520px]">
          <DestinationCard href="/casino" title="Casino" iconSrc="/homepage/icon-cherry.svg">
            <CasinoOriginalsShelf />
          </DestinationCard>
          <DestinationCard
            href="/sports"
            title="Sports"
            iconSrc="/homepage/icon-sports-football.svg"
          >
            <SportsBentoShelf />
          </DestinationCard>
        </div>
      </div>

      <HeroUspBar />
    </section>
  )
}
