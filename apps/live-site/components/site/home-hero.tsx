'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Cherry, Lock, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Shimmer, ShimmerText } from '@/components/lumen/animations'
import { cn } from '@/lib/utils'

const CASINO_TILES = [
  '/games/originals/plink.png',
  '/games/originals/blackjack.png',
  '/games/originals/dice.png',
  '/games/originals/diamonds.png',
  '/games/originals/mines.png',
  '/games/originals/keno.png',
  '/games/originals/limbo.png',
  '/games/originals/wheel.png',
  '/games/originals/hilo.png',
]

const SPORTS_BENTO = [
  { src: '/banners/sports_league/NFL.svg', label: 'NFL', span: 'lg' as const },
  { src: '/banners/sports_league/nba.svg', label: 'NBA', span: 'lg' as const },
  { src: '/banners/sports_league/NHL.svg', label: 'NHL', span: 'sm' as const },
  { src: '/banners/sports_league/prem.svg', label: 'EPL', span: 'sm' as const },
  { src: '/banners/sports_league/mls.svg', label: 'MLS', span: 'sm' as const },
  { src: '/banners/sports_league/laliga.svg', label: 'La Liga', span: 'sm' as const },
]

const USP = [
  { icon: '/banners/partners/crypto.svg', title: 'Deposit with Crypto', subtitle: 'Fast, easy & reliable' },
  { icon: '/banners/partners/vip-rewards.svg', title: 'VIP Rewards', subtitle: 'Level up bonuses, boosts & more' },
  { icon: '/banners/partners/bettingicons-coloured.svg', title: 'Bet Big', subtitle: 'High limits and re-bet functionality' },
  { icon: '/banners/partners/live-betting.svg', title: 'Fastest Payouts', subtitle: 'Payouts within minutes' },
  { icon: 'lock' as const, title: 'Safe & Secure', subtitle: 'Trusted & protected' },
]

function SportsBentoShelf() {
  return (
    <div className="absolute inset-0 overflow-clip rounded-[inherit]" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 70% 30%, color-mix(in oklch, var(--success) 22%, transparent) 0%, transparent 55%), linear-gradient(160deg, color-mix(in oklch, var(--success) 18%, var(--background)) 0%, var(--background) 100%)',
        }}
      />
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 gap-2 p-3">
        {SPORTS_BENTO.map((tile) => (
          <div
            key={tile.label}
            className={cn(
              'relative flex min-h-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-gradient-to-br from-white/[0.12] to-white/[0.04]',
              tile.span === 'lg' && 'col-span-2'
            )}
          >
            <Image
              src={tile.src}
              alt=""
              width={80}
              height={80}
              className={cn(
                'object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]',
                tile.span === 'lg' ? 'h-[58%] w-[58%] max-h-[4.5rem]' : 'h-[52%] w-[52%] max-h-10'
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
    <div className="absolute inset-0 overflow-clip rounded-[inherit]" aria-hidden>
      <div
        className="absolute left-1/2 top-[46%] grid w-[155%] grid-cols-4 gap-1.5"
        style={{ transform: 'translate(-50%, -50%) rotate(-9deg) scale(0.88)' }}
      >
        {[...CASINO_TILES, ...CASINO_TILES.slice(0, 7)].map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative aspect-[3/4] overflow-hidden rounded-lg border border-white/15 bg-background shadow-lg"
          >
            <Image src={src} alt="" fill className="object-cover object-[center_32%]" sizes="80px" unoptimized />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-info/40 via-info/25 to-transparent" />
    </div>
  )
}

function DestinationCard({
  href,
  title,
  icon,
  band,
  children,
}: {
  href: string
  title: string
  icon: React.ReactNode
  band: 'casino' | 'sports'
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="group relative isolate flex min-h-[168px] flex-1 cursor-pointer flex-col overflow-clip rounded-2xl border border-white/10 text-left transition-colors hover:border-white/25 sm:min-h-[200px] md:min-h-[240px]"
    >
      <div className="absolute inset-0 overflow-clip rounded-2xl">
        <div className="absolute inset-0 origin-center transition-transform duration-500 ease-out group-hover:scale-[1.05]">
          {children}
        </div>
      </div>
      <div
        className={cn(
          'relative z-[2] mt-auto flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3',
          band === 'casino' ? 'border-t border-info/25 bg-info/30' : 'border-t border-success/25 bg-success/25'
        )}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          {icon}
          {title}
        </span>
        <ArrowRight className="size-4 text-white/80 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

export function HomeHero() {
  return (
    <section className="relative overflow-clip rounded-2xl border border-white/10">
      <div className="absolute inset-0 bg-background" />
      <div className="pointer-events-none absolute inset-0 overflow-clip">
        <Image
          src="/banners/new_home.png"
          alt=""
          fill
          priority
          className="scale-110 object-cover object-[center_82%] opacity-55 blur-[3px]"
          sizes="100vw"
          unoptimized
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 50% 70% at 12% 70%, color-mix(in oklch, var(--primary) 12%, transparent) 0%, transparent 65%),
            linear-gradient(90deg, rgba(18,18,18,0.65) 0%, rgba(18,18,18,0.4) 42%, rgba(18,18,18,0.55) 100%)
          `,
        }}
      />

      <div className="relative z-10 flex flex-col gap-8 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8 md:py-10">
        <div className="flex w-full max-w-[520px] flex-col items-center gap-5 text-center md:items-start md:text-left">
          <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Built for <ShimmerText className="text-5xl font-black uppercase sm:text-6xl lg:text-7xl">Winners.</ShimmerText>
          </h1>
          <Typography shape="paragraph" variant="default" className="max-w-[22rem] text-[15px] leading-snug text-white/70 md:max-w-none">
            Cash Rewards. Instant Withdrawals.
            <br />
            Real Human Support.
          </Typography>
          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <Shimmer active tint="primary" trigger="hover">
              <Button asChild className="h-11 px-5">
                <Link href="/casino">
                  Register
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </Shimmer>
            <Typography as="span" shape="small" className="text-white/45">
              Or
            </Typography>
            <Button variant="outline" asChild className="h-11 border-white/20 bg-white/5 text-white hover:bg-white/10">
              <Link href="/casino">Login</Link>
            </Button>
          </div>
        </div>

        <div className="flex w-full flex-row gap-2 sm:gap-3 md:ml-auto md:w-[520px] lg:w-[560px]">
          <DestinationCard href="/casino" title="Casino" band="casino" icon={<Cherry className="size-4" />}>
            <CasinoOriginalsShelf />
          </DestinationCard>
          <DestinationCard href="/casino" title="Sports" band="sports" icon={<Trophy className="size-4" />}>
            <SportsBentoShelf />
          </DestinationCard>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/10 bg-white/[0.04] backdrop-blur-xl">
        <div className="flex gap-1 overflow-x-auto px-3 py-3 scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible md:px-6">
          {USP.map((item) => (
            <div key={item.title} className="flex min-w-[200px] shrink-0 items-center gap-2.5 px-2 py-1 md:min-w-0">
              {item.icon === 'lock' ? (
                <Lock className="size-7 text-white/60" />
              ) : (
                <Image src={item.icon} alt="" width={28} height={28} className="object-contain" unoptimized />
              )}
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold uppercase leading-tight text-white">{item.title}</p>
                <p className="truncate text-[10px] uppercase leading-tight text-white/55">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
