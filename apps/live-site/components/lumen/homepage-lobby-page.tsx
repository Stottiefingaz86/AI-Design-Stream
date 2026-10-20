'use client'

import Link from 'next/link'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from '@/components/ui/carousel'
import { Typography } from '@/components/ui/typography'
import { HomeHero } from '@/components/site/home-hero'
import { useShell } from '@/components/site/shell-context'
import {
  CasinoActivity,
  CasinoGameShelf,
  CasinoProviderRow,
  CasinoTop10,
} from '@/components/lumen/casino-lobby-page'
import { VipRewardsFlipCarousel } from '@/components/lumen/vip-rewards-flip-carousel'
import {
  LIVE_GAMES,
  ORIGINALS_GAMES,
  TOP10_GAMES,
} from '@/lib/lumen/casino-lobby-catalog'

const TOP_MARKETS = [
  { name: 'NFL', logo: '/banners/sports_league/NFL.svg', href: '/sports' },
  { name: 'NBA', logo: '/banners/sports_league/nba.svg', href: '/sports' },
  { name: 'NHL', logo: '/banners/sports_league/NHL.svg', href: '/sports' },
  { name: 'MLB', logo: '/banners/sports_league/MLB.svg', href: '/sports' },
  { name: 'MLS', logo: '/banners/sports_league/mls.svg', href: '/sports' },
  { name: 'Premier League', logo: '/banners/sports_league/prem.svg', href: '/sports' },
  { name: 'Champions League', logo: '/banners/sports_league/champions.svg', href: '/sports' },
  { name: 'ATP', logo: '/banners/sports_league/ATP.svg', href: '/sports' },
] as const

const TRENDING_SPORTS = [
  { name: 'Football', image: '/banners/homepage_trending/football.png', href: '/sports' },
  { name: 'Basketball', image: '/banners/homepage_trending/basketball.png', href: '/sports' },
  { name: 'Baseball', image: '/banners/homepage_trending/baseball.png', href: '/sports' },
  { name: 'Hockey', image: '/banners/homepage_trending/hocky.png', href: '/sports' },
  { name: 'Soccer', image: '/banners/homepage_trending/soccer.png', href: '/sports' },
  { name: 'Tennis', image: '/banners/homepage_trending/tennis.png', href: '/sports' },
  { name: 'MMA', image: '/banners/homepage_trending/mma.png', href: '/sports' },
  { name: 'Golf', image: '/banners/homepage_trending/golf.png', href: '/sports' },
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
              <Link
                href={market.href}
                className="flex size-[112px] flex-col items-center justify-center gap-2 rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)] transition-colors hover:border-foreground/15 hover:bg-foreground/[0.04] md:size-[128px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={market.logo}
                  alt=""
                  className="h-12 w-12 object-contain md:h-14 md:w-14"
                />
                <span className="px-2 text-center text-[11px] font-medium text-muted-foreground">
                  {market.name}
                </span>
              </Link>
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
        <CarouselContent className="!ml-0 gap-3 py-1">
          {TRENDING_SPORTS.map((sport) => (
            <CarouselItem key={sport.name} className="basis-auto pl-0 first:pl-6 last:pr-6">
              <Link
                href={sport.href}
                className="group relative block h-[168px] w-[240px] overflow-hidden rounded-[10px] border border-border md:h-[180px] md:w-[260px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sport.image}
                  alt=""
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <span className="absolute inset-x-3 bottom-3 text-sm font-semibold text-white">
                  {sport.name}
                </span>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}

/** Homepage_SHADCN — Smart-Banner + mixed shelves; casino rails reused. Shell owns SEO/footer. */
export function HomepageLobby() {
  const { launchGame, setVipHubOpen } = useShell()

  return (
    <div data-name="homepage_content" className="w-full bg-background pb-8">
      <div className="px-6 pb-8 pt-4 md:pb-10">
        <HomeHero />
      </div>
      <CasinoGameShelf
        title="Originals"
        games={ORIGINALS_GAMES}
        seeMoreHref="/casino/category/originals"
        onLaunch={launchGame}
      />
      <TopMarketsShelf />
      <TrendingSportsShelf />
      <CasinoTop10
        games={TOP10_GAMES}
        title="Top 10 Games this week"
        onLaunch={launchGame}
      />
      <CasinoProviderRow title="Providers" />
      <CasinoActivity />
      <CasinoGameShelf
        title="Live Casino"
        games={LIVE_GAMES}
        seeMoreHref="/casino/live"
        onLaunch={launchGame}
      />
      <VipRewardsFlipCarousel onExplore={() => setVipHubOpen(true)} />
    </div>
  )
}
