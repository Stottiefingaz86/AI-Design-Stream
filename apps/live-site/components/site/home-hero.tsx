'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { IconArrowRight, IconLoader2 } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { VipTierProgressCard } from '@/components/lumen/vip-tier-progress-card'
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

/** USP icons from Homepage_SHADCN Smart-Banner Info slots. */
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
    <div className="relative z-10 border-t border-white/[0.08] bg-white/[0.06] backdrop-blur-md">
      <div className="flex gap-1 overflow-x-auto px-4 py-5 scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible md:px-10 lg:px-16">
        {USP_ITEMS.map((item) => (
          <div
            key={item.title}
            className="flex min-w-[200px] shrink-0 items-center gap-4 px-1 py-1 md:min-w-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.icon} alt="" width={36} height={36} className="size-9 shrink-0 object-contain" />
            <div className="min-w-0 font-sans">
              <p className="truncate text-xs font-semibold uppercase leading-4 text-white">
                {item.title}
              </p>
              <p className="truncate text-[10px] font-normal leading-[14px] text-white/65">
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
    <div className="absolute inset-0 overflow-clip rounded-[inherit]" aria-hidden>
      {/* Homepage_SHADCN Slot fill — vip/level-7 teal wash */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(113, 190, 171, 0.1) 0%, rgba(113, 190, 171, 0.1) 100%), linear-gradient(90deg, rgba(250, 250, 250, 0.05) 0%, rgba(250, 250, 250, 0.05) 100%)',
        }}
      />
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 gap-[3.6px] p-2.5">
        {SPORTS_BENTO.map((tile) => (
          <div
            key={tile.label}
            className={cn(
              'relative flex min-h-0 items-center justify-center overflow-hidden rounded-[5px] border border-white/[0.08] bg-secondary',
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

/** Homepage Smart-Banner Casino Slot — angled originals shelf. */
function CasinoOriginalsShelf() {
  return (
    <div className="absolute inset-0 overflow-clip rounded-[inherit]" aria-hidden>
      {/* Homepage_SHADCN Slot fill — warm red wash */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(156, 74, 74, 0.2) 0%, rgba(156, 74, 74, 0.2) 100%), linear-gradient(90deg, rgba(250, 250, 250, 0.05) 0%, rgba(250, 250, 250, 0.05) 100%)',
        }}
      />
      <div
        className="absolute left-1/2 top-[42%] grid w-[128%] grid-cols-3 gap-2"
        style={{ transform: 'translate(-50%, -50%) rotate(-8deg)' }}
      >
        {CASINO_FEATURED.map((src) => (
          <div
            key={src}
            className="relative aspect-[3/4] overflow-hidden rounded-md border border-white/15 bg-[#111]"
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover object-[center_28%]"
              sizes="96px"
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Casino / Sports destination cards — Homepage Smart-Banner boxes. */
function DestinationCard({
  href,
  title,
  iconSrc,
  band,
  children,
}: {
  href: string
  title: string
  iconSrc: string
  band: 'casino' | 'sports'
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
        'group relative isolate flex aspect-square w-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-[10px] border border-white/[0.08] bg-white/[0.05] text-left shadow-[0_0_16px_rgba(0,0,0,0.06)] transition-colors duration-200 hover:border-white/20',
        loading && 'pointer-events-none',
      )}
    >
      <div className={cn('relative min-h-0 flex-1 overflow-hidden', loading && 'opacity-40')}>
        <div className="absolute inset-0 origin-center transition-transform duration-500 ease-out group-hover:scale-[1.05]">
          {children}
        </div>
      </div>

      {/* Footer — Homepage tokens opacity-vip/level-5|7/60 + frosted glass */}
      <div
        className={cn(
          'relative z-[2] flex h-11 shrink-0 items-center overflow-hidden rounded-b-[10px] sm:h-[51px]',
          band === 'casino' ? 'bg-[#95acce]/60' : 'bg-[#71beab]/60',
          loading && 'opacity-40',
        )}
      >
        <div className="flex h-full w-full items-center justify-between gap-2 rounded-b-[10px] border-t border-white/[0.08] bg-white/[0.08] px-3 backdrop-blur-md sm:px-4">
          <span className="flex items-center gap-2 text-xs font-semibold text-white sm:text-[13px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={iconSrc} alt="" className="size-4 object-contain brightness-0 invert" />
            {title}
          </span>
          <IconArrowRight className="size-4 text-white/80 transition-transform duration-300 group-hover:translate-x-0.5" />
        </div>
      </div>

      <div
        className={cn(
          'absolute inset-0 z-30 flex items-center justify-center bg-black/55 transition-opacity duration-200',
          loading ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        {loading ? (
          <span className="flex size-12 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white backdrop-blur-md">
            <IconLoader2 className="size-6 animate-spin" strokeWidth={2.25} aria-hidden />
          </span>
        ) : null}
      </div>
    </div>
  )
}

/**
 * Hero atmosphere from Error Pages `32:71251` —
 * dark plate + warm burgundy radial (not crushed fire art).
 */
function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-clip rounded-[14px]" aria-hidden>
      <div className="absolute inset-0 bg-[#121212]" />

      {/* Error Pages center glow — brighter so the hero doesn’t read as black */}
      <div
        className="absolute left-1/2 top-1/2 size-[min(90vw,720px)] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(120,28,36,0.55) 0%, rgba(90,18,28,0.32) 38%, rgba(40,10,14,0.12) 62%, transparent 72%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 48%, rgba(238,53,54,0.18) 0%, rgba(120,28,36,0.1) 42%, transparent 70%)',
        }}
      />

      {/* Soft ember field (sparks) — light texture, not a dark plate */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage: `
            radial-gradient(1.5px 1.5px at 8% 72%, rgba(255,160,80,0.85), transparent),
            radial-gradient(1.5px 1.5px at 14% 58%, rgba(255,120,60,0.7), transparent),
            radial-gradient(2px 2px at 22% 80%, rgba(255,180,90,0.9), transparent),
            radial-gradient(1px 1px at 28% 48%, rgba(255,140,70,0.55), transparent),
            radial-gradient(1.5px 1.5px at 36% 68%, rgba(255,100,50,0.75), transparent),
            radial-gradient(2px 2px at 44% 88%, rgba(255,170,80,0.8), transparent),
            radial-gradient(1px 1px at 52% 54%, rgba(255,130,60,0.5), transparent),
            radial-gradient(1.5px 1.5px at 58% 76%, rgba(255,150,70,0.7), transparent),
            radial-gradient(2px 2px at 66% 62%, rgba(255,110,50,0.65), transparent),
            radial-gradient(1px 1px at 74% 84%, rgba(255,180,90,0.75), transparent),
            radial-gradient(1.5px 1.5px at 82% 70%, rgba(255,140,70,0.6), transparent),
            radial-gradient(2px 2px at 90% 90%, rgba(255,160,80,0.7), transparent),
            radial-gradient(1px 1px at 18% 40%, rgba(255,120,60,0.35), transparent),
            radial-gradient(1.5px 1.5px at 48% 36%, rgba(255,150,80,0.3), transparent),
            radial-gradient(1px 1px at 78% 42%, rgba(255,130,70,0.35), transparent)
          `,
        }}
      />

      {/* Light edge vignette only — keep center readable, not crushed */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(90deg, rgba(18,18,18,0.35) 0%, transparent 28%, transparent 72%, rgba(18,18,18,0.3) 100%),
            linear-gradient(180deg, rgba(18,18,18,0.25) 0%, transparent 22%, transparent 78%, rgba(18,18,18,0.4) 100%)
          `,
        }}
      />
    </div>
  )
}

/** Homepage Smart-Banner — Figma Homepage_SHADCN + Error Pages atmosphere. */
export function HomeHero() {
  const { loggedIn, setVipHubOpen, setLoggedIn } = useShell()

  return (
    <section className="relative overflow-clip rounded-[14px] border border-white/10">
      <HeroBackground />

      <div className="relative z-10 flex flex-col gap-6 px-4 pt-8 md:flex-row md:items-center md:justify-between md:gap-8 md:px-10 md:pt-10 lg:px-16">
        <div className="flex w-full max-w-[520px] shrink-0 flex-col items-center gap-5 text-center md:items-start md:pb-6 md:text-left">
          <div className="flex flex-col gap-3">
            <h1
              className="block text-[48px] font-black uppercase leading-[0.9] tracking-[-0.02em] text-white sm:text-[56px] md:text-[64px] lg:text-[72px]"
              style={{
                fontFamily:
                  'Akkordeon, Impact, Haettenschweiler, "Arial Narrow Bold", "Arial Black", var(--font-figtree), sans-serif',
              }}
            >
              Built for <span className="text-primary">Winners.</span>
            </h1>
            <p className="max-w-[22rem] font-sans text-[15px] font-normal leading-snug text-white/70 sm:text-base md:max-w-none">
              Cash Rewards. Instant Withdrawals.
              <br />
              Real Human Support.
            </p>
          </div>

          {loggedIn ? (
            <VipTierProgressCard
              className="w-full max-w-[340px] border-white/20 bg-white/[0.08] backdrop-blur-md hover:bg-white/[0.12]"
              fromTier="Bronze"
              toTier="Silver"
              percent={75}
              updatedLabel="Updated 12/25/2025, 8:00PM ET"
              onClick={() => setVipHubOpen(true)}
            />
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Button className="h-11 px-5" onClick={() => setLoggedIn(true)}>
                Register
                <IconArrowRight className="ml-1.5 size-4" />
              </Button>
              <span className="text-sm text-white/45">Or</span>
              <Button
                variant="outline"
                className="h-11 border-white/20 bg-white/[0.04] text-white hover:bg-white/10"
                onClick={() => setLoggedIn(true)}
              >
                Login
              </Button>
            </div>
          )}
        </div>

        <div className="mx-auto grid w-full max-w-[420px] grid-cols-2 gap-3 pb-2 md:mx-0 md:ml-auto md:max-w-[440px] md:pb-6 lg:max-w-[480px]">
          <DestinationCard
            href="/casino"
            title="Casino"
            band="casino"
            iconSrc="/homepage/icon-cherry.svg"
          >
            <CasinoOriginalsShelf />
          </DestinationCard>
          <DestinationCard
            href="/sports"
            title="Sports"
            band="sports"
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
