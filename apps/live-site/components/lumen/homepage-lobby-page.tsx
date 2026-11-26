'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from '@/components/ui/carousel'
import { Typography } from '@/components/ui/typography'
import { HomeHero } from '@/components/site/home-hero'
import { useShell } from '@/components/site/shell-context'
import { CasinoLobbyBannerRow } from '@/components/lumen/casino-lobby-banners'
import { TileSpinner } from '@/components/lumen/casino-game-tile'
import {
  CasinoActivity,
  CasinoGameShelf,
  CasinoJackpots,
  CasinoProviderRow,
  CasinoTop10,
  ContinuePlayingShelf,
} from '@/components/lumen/casino-lobby-page'
import { CasinoLiveWinsCarousel } from '@/components/lumen/casino-live-wins-carousel'
import { VipRewardsFlipCarousel } from '@/components/lumen/vip-rewards-flip-carousel'
import {
  LIVE_GAMES,
  ORIGINALS_GAMES,
  TOP10_GAMES,
} from '@/lib/lumen/casino-lobby-catalog'
import { HOMEPAGE_PROMO_BANNERS } from '@/lib/lumen/homepage-banners'
import { useSiteVersion } from '@/lib/lumen/site-versions'
import {
  V5HomeActivity,
  V5HomeLeagues,
  V5HomePopular,
  V5HomeSlip,
  V5HomeTrending,
} from '@/components/lumen/v5/v5-home'
import { cn } from '@/lib/utils'

/** Brief tile spinner before soft-nav — matches hero destination cards. */
const TILE_NAV_MS = 900

const TOP_MARKETS = [
  { name: 'NFL', logo: '/banners/sports_league/NFL.svg', href: '/sports' },
  { name: 'NBA', logo: '/banners/sports_league/nba.svg', href: '/sports' },
  { name: 'NHL', logo: '/banners/sports_league/NHL.svg', href: '/sports' },
  { name: 'MLB', logo: '/banners/sports_league/MLB.svg', href: '/sports' },
  { name: 'MLS', logo: '/banners/sports_league/mls.svg', href: '/sports/soccer' },
  { name: 'Premier League', logo: '/banners/sports_league/prem.svg', href: '/sports/soccer' },
  { name: 'Champions League', logo: '/banners/sports_league/champions.svg', href: '/sports/soccer' },
  { name: 'ATP', logo: '/banners/sports_league/ATP.svg', href: '/sports' },
  /* From Sportsbook DS Top leagues (2201:3226) */
  { name: 'UFC', logo: '/banners/sports_league/ufc.svg', href: '/sports' },
  { name: 'Wimbledon', logo: '/banners/sports_league/wimbledon.svg', href: '/sports' },
  { name: 'La Liga', logo: '/banners/sports_league/laliga-mark.svg', href: '/sports/soccer' },
  { name: 'Australian Open', logo: '/banners/sports_league/australian-open.svg', href: '/sports' },
  { name: 'PGA Tour', logo: '/banners/sports_league/pga.svg', href: '/sports' },
  { name: 'WBA', logo: '/banners/sports_league/wba.svg', href: '/sports' },
] as const

const TRENDING_SPORTS = [
  { name: 'Football', image: '/banners/homepage_trending/football.jpg', href: '/sports/soccer', league: 'NFL', leagueLogo: '/banners/sports_league/NFL.svg' },
  { name: 'Hockey', image: '/banners/homepage_trending/hockey.jpg', href: '/sports/soccer', league: 'NHL', leagueLogo: '/banners/sports_league/NHL.svg' },
  { name: 'Basketball', image: '/banners/homepage_trending/basketball.jpg', href: '/sports/soccer', league: 'NBA', leagueLogo: '/banners/sports_league/nba.svg' },
  { name: 'Baseball', image: '/banners/homepage_trending/baseball.jpg', href: '/sports/soccer', league: 'MLB', leagueLogo: '/banners/sports_league/MLB.svg' },
  { name: 'Golf', image: '/banners/homepage_trending/golf.jpg', href: '/sports/soccer', league: 'PGA Tour', leagueLogo: '/banners/sports_league/pga.svg' },
  { name: 'Tennis', image: '/banners/homepage_trending/tennis.jpg', href: '/sports/soccer', league: 'ATP', leagueLogo: '/banners/sports_league/ATP.svg' },
  { name: 'Soccer', image: '/banners/homepage_trending/soccer.jpg', href: '/sports/soccer', league: 'Premier League', leagueLogo: '/banners/sports_league/prem.svg' },
  { name: 'MMA', image: '/banners/homepage_trending/mma.jpg', href: '/sports/soccer', league: 'UFC', leagueLogo: '/banners/sports_league/ufc.svg' },
] as const

function ShelfChrome({
  title,
  seeMoreHref,
  hideSeeMore,
}: {
  title: string
  seeMoreHref?: string
  hideSeeMore?: boolean
}) {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel()
  const arrowClass =
    'inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-foreground transition-colors hover:bg-muted disabled:opacity-45'

  return (
    <header className="mb-3 flex h-9 items-center justify-between gap-4">
      <Typography as="h3" shape="h4" weight="semibold" className="min-w-0 truncate">
        {title}
      </Typography>
      <div className="flex shrink-0 items-center gap-4">
        {hideSeeMore || !seeMoreHref ? null : (
          <Link
            href={seeMoreHref}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-border bg-secondary px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            See More
          </Link>
        )}
        <div className="hidden items-center gap-1 md:flex">
          <button
            type="button"
            aria-label={`Previous ${title}`}
            className={arrowClass}
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <span className="sr-only">Previous</span>
            <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden>
              <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={`Next ${title}`}
            className={arrowClass}
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <span className="sr-only">Next</span>
            <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden>
              <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

function useTileNavigate(href: string) {
  const router = useRouter()
  const { startNavigating } = useShell()
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const start = () => {
    if (loading) return
    setLoading(true)
    /* Hold the tile spinner first — startNavigating unmounts the homepage. */
    timerRef.current = setTimeout(() => {
      startNavigating(href)
      router.push(href)
      timerRef.current = setTimeout(() => setLoading(false), 400)
    }, TILE_NAV_MS)
  }

  return { loading, start }
}

function TileSpinnerOverlay({ loading }: { loading: boolean }) {
  return (
    <>
      <div
        className={cn(
          'absolute inset-0 z-20 rounded-[10px] bg-black/55 transition-opacity duration-200 ease-out',
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
    </>
  )
}

function TopMarketTile({
  name,
  logo,
  href,
}: {
  name: string
  logo: string
  href: string
}) {
  const { loading, start } = useTileNavigate(href)

  return (
    <button
      type="button"
      onClick={start}
      aria-label={loading ? `Loading ${name}` : name}
      aria-busy={loading}
      className={cn(
        'group relative flex size-[112px] flex-col items-center justify-center gap-2 rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)] transition-[border-color,background-color,transform] duration-200 md:size-[128px]',
        loading
          ? 'pointer-events-none'
          : 'hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-muted',
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo}
        alt=""
        className={cn(
          'h-12 w-12 object-contain transition-transform duration-200 md:h-14 md:w-14',
          loading ? 'opacity-40' : 'group-hover:scale-105',
        )}
      />
      <span
        className={cn(
          'px-2 text-center text-[11px] font-medium text-muted-foreground transition-colors duration-200',
          loading ? 'opacity-40' : 'group-hover:text-foreground',
        )}
      >
        {name}
      </span>
      <TileSpinnerOverlay loading={loading} />
    </button>
  )
}

/** PSA / CGC-style graded slab — acrylic case + top cert label + recessed card. */
function TrendingSportTile({
  name,
  image,
  href,
  league,
  leagueLogo,
}: {
  name: string
  image: string
  href: string
  league: string
  leagueLogo: string
}) {
  const { loading, start } = useTileNavigate(href)

  return (
    <button
      type="button"
      onClick={start}
      aria-label={loading ? `Loading ${name}` : `${name}, ${league}`}
      aria-busy={loading}
      className={cn(
        'group relative z-0 w-[152px] shrink-0 origin-center text-left md:w-[164px]',
        'transition-transform duration-200 ease-out will-change-transform',
        '[@media(hover:hover)_and_(pointer:fine)]:hover:z-10 [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.06]',
        'motion-reduce:transition-none motion-reduce:hover:scale-100',
        loading && 'pointer-events-none',
      )}
    >
      {/* Clear acrylic outer case */}
      <div
        className={cn(
          'relative overflow-hidden rounded-[12px] p-[7px]',
          'border border-white/50',
          'bg-[linear-gradient(145deg,rgba(255,255,255,0.38)_0%,rgba(255,255,255,0.12)_42%,rgba(255,255,255,0.22)_100%)]',
          'shadow-[0_1px_0_rgba(255,255,255,0.55)_inset,0_-1px_0_rgba(0,0,0,0.12)_inset,0_12px_28px_rgba(0,0,0,0.42)]',
          'backdrop-blur-[1.5px]',
          'transition-shadow duration-200',
          '[@media(hover:hover)_and_(pointer:fine)]:group-hover:shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_16px_36px_rgba(0,0,0,0.5)]',
        )}
      >
        {/* Specular glaze across the plastic */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(118deg,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0)_28%,rgba(255,255,255,0)_62%,rgba(255,255,255,0.18)_100%)]"
        />

        {/* Grading certificate label */}
        <div
          className={cn(
            'relative z-[1] mb-[6px] flex h-[40px] overflow-hidden rounded-[3px] bg-white',
            'shadow-[0_1px_2px_rgba(0,0,0,0.12)]',
            loading && 'opacity-50',
          )}
        >
          <div className="w-[3px] shrink-0 bg-primary" aria-hidden />
          {/* Fake barcode */}
          <div
            className="flex w-[14px] shrink-0 flex-col justify-center gap-[1.5px] border-r border-zinc-200 px-[3px]"
            aria-hidden
          >
            {[2, 1, 3, 1, 2, 1, 3, 2, 1].map((h, i) => (
              <span
                key={i}
                className="block w-full rounded-[0.5px] bg-zinc-800"
                style={{ height: h }}
              />
            ))}
          </div>
          <div className="flex min-w-0 flex-1 items-center px-1.5">
            <span className="truncate text-[11px] font-extrabold uppercase leading-none tracking-[0.02em] text-zinc-900">
              {name}
            </span>
          </div>
          <div className="flex w-[44px] shrink-0 items-center justify-center border-l border-zinc-200 px-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={leagueLogo}
              alt=""
              className="h-7 w-7 object-contain"
            />
          </div>
        </div>

        {/* Recessed card well */}
        <div
          className={cn(
            'relative z-[1] aspect-[2.5/3.5] overflow-hidden rounded-[4px] bg-zinc-950',
            'shadow-[inset_0_2px_6px_rgba(0,0,0,0.45)] ring-1 ring-black/25',
            loading && 'opacity-50',
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            className="absolute inset-0 size-full object-cover object-center"
          />
          {/* Hover-only light swipe */}
          <span className="trending-slab-foil" aria-hidden />
        </div>
      </div>
      <TileSpinnerOverlay loading={loading} />
    </button>
  )
}

function TopMarketsShelf() {
  return (
    <section data-name="top-markets" aria-label="Top Markets" className="py-2">
      <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
        <div className="px-6">
          <ShelfChrome title="Top Markets" seeMoreHref="/sports" />
        </div>
        <CarouselContent className="!ml-0 gap-3 py-1">
          {TOP_MARKETS.map((market) => (
            <CarouselItem key={market.name} className="basis-auto pl-0 first:pl-6 last:pr-6">
              <TopMarketTile name={market.name} logo={market.logo} href={market.href} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}

function TrendingSportsShelf() {
  return (
    <section data-name="trending-sports" aria-label="Trending Sports" className="py-2">
      <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
        <div className="px-6">
          <ShelfChrome title="Trending Sports" seeMoreHref="/sports" />
        </div>
        {/* Extra vertical pad so hover lift / tilt doesn’t clip */}
        <CarouselContent className="!ml-0 gap-4 py-4">
          {TRENDING_SPORTS.map((sport) => (
            <CarouselItem key={sport.name} className="basis-auto pl-0 first:pl-6 last:pr-6">
              <TrendingSportTile
                name={sport.name}
                image={sport.image}
                href={sport.href}
                league={sport.league}
                leagueLogo={sport.leagueLogo}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}

/** Homepage_SHADCN — Smart-Banner + mixed shelves; casino rails reused. Shell owns SEO/footer. */
export function HomepageLobby() {
  const {
    launchGame,
    setVipHubOpen,
    setCashierOpen,
    openVipStatusMatch,
    loggedIn,
  } = useShell()
  /* V5 · Combos — the sports shelves become the V5 sports components; V1–V3 keep the static ones. */
  const v5 = useSiteVersion() === 'v5'

  const homeBanners = useMemo(
    () =>
      HOMEPAGE_PROMO_BANNERS.map((promo) => {
        if (promo.id === 'free-spins-welcome') {
          return { ...promo, onAction: () => setCashierOpen(true) }
        }
        if (promo.id === 'vip-match') {
          return { ...promo, onAction: () => openVipStatusMatch() }
        }
        if (promo.id === 'casino-rakeback') {
          return { ...promo, onAction: () => setVipHubOpen(true) }
        }
        if (promo.id === '25k-daily-race') {
          return { ...promo, onAction: () => setVipHubOpen(true, '$25k Daily Race') }
        }
        if (promo.id === 'cash-boosts') {
          return { ...promo, onAction: () => setVipHubOpen(true) }
        }
        return promo
      }),
    [openVipStatusMatch, setCashierOpen, setVipHubOpen],
  )

  return (
    <div data-name="homepage_content" className="w-full bg-background pb-8">
      <div className="px-6 pb-8 pt-4 md:pb-10">
        <HomeHero />
      </div>
      {!loggedIn ? (
        <div className="pb-4">
          <CasinoLobbyBannerRow
            vip={false}
            dailyRaces={false}
            promos={homeBanners}
          />
        </div>
      ) : null}
      {/* Homepage: Live Wins under promo strip — above Continue Playing. */}
      <CasinoLiveWinsCarousel />
      <ContinuePlayingShelf />
      {v5 ? (
        <>
          <V5HomePopular />
          <V5HomeLeagues />
        </>
      ) : (
        <TopMarketsShelf />
      )}
      <CasinoGameShelf
        title="Originals"
        games={ORIGINALS_GAMES}
        seeMoreHref="/casino/category/originals"
        onLaunch={launchGame}
      />
      {v5 ? <V5HomeTrending /> : <TrendingSportsShelf />}
      <CasinoTop10
        games={TOP10_GAMES}
        title="Top 10 Games this week"
        onLaunch={launchGame}
      />
      {v5 ? (
        <>
          {/* V5: Activity, then Jackpots, then Providers. */}
          <V5HomeActivity />
          <CasinoJackpots onLaunch={launchGame} />
          {/* Room under the provider row before the next shelf header. */}
          <div className="pb-6">
            <CasinoProviderRow title="Providers" />
          </div>
        </>
      ) : (
        <>
          <CasinoProviderRow title="Providers" />
          <CasinoActivity />
          <CasinoJackpots onLaunch={launchGame} />
        </>
      )}
      <CasinoGameShelf
        title="Live Casino"
        games={LIVE_GAMES}
        seeMoreHref="/casino/live"
        onLaunch={launchGame}
      />
      <VipRewardsFlipCarousel onExplore={() => setVipHubOpen(true)} />
      {v5 ? <V5HomeSlip /> : null}
    </div>
  )
}
