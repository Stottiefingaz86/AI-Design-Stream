'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { ShellFrame } from './shell-frame'
import { SiteFooter } from './site-footer'
import { Rail, SectionHead, useCarouselNav } from './game-shelf'
import { CarouselItem } from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

const SPORTS = [
  { name: 'Football', icon: '/sports_icons/football.svg', image: '/banners/homepage_trending/football.png' },
  { name: 'Basketball', icon: '/sports_icons/Basketball.svg', image: '/banners/homepage_trending/basketball.png' },
  { name: 'Baseball', icon: '/sports_icons/baseball.svg', image: '/banners/homepage_trending/baseball.png' },
  { name: 'Hockey', icon: '/sports_icons/Hockey.svg', image: '/banners/homepage_trending/hocky.png' },
  { name: 'Soccer', icon: '/sports_icons/soccer.svg', image: '/banners/homepage_trending/soccer.png' },
  { name: 'Tennis', icon: '/sports_icons/tennis.svg', image: '/banners/homepage_trending/tennis.png' },
  { name: 'MMA', icon: '/sports_icons/mma.svg', image: '/banners/homepage_trending/mma.png' },
  { name: 'Golf', icon: '/sports_icons/Golf.svg', image: '/banners/homepage_trending/golf.png' },
]

const MARKETS = [
  { name: 'NFL', icon: '/banners/sports_league/NFL.svg' },
  { name: 'NBA', icon: '/banners/sports_league/nba.svg' },
  { name: 'MLB', icon: '/banners/sports_league/MLB.svg' },
  { name: 'NHL', icon: '/banners/sports_league/NHL.svg' },
  { name: 'Premier League', icon: '/banners/sports_league/prem.svg' },
  { name: 'La Liga', icon: '/banners/sports_league/laliga.svg' },
]

export function SportsPage() {
  const sports = useCarouselNav()
  const markets = useCarouselNav()
  return (
    <ShellFrame loggedIn>
      <div className="mx-auto w-full max-w-[1600px] py-6">
        <div className="mb-8 px-4 md:px-6">
          <Typography as="h1" shape="h2" weight="bold">
            Sports
          </Typography>
          <Typography as="p" shape="small" variant="muted" className="mt-2">
            Pre-match and live markets across the biggest leagues.
          </Typography>
        </div>
        <section className="mb-6">
          <SectionHead title="Trending Sports" action="See More" href="/sports" nav={sports} />
          <Rail nav={sports}>
            {SPORTS.map((s, i) => (
              <CarouselItem key={s.name} className={cn('basis-auto pl-2 md:pl-4', i === 0 && 'pl-4 md:pl-6')}>
                <Link
                  href="/sports"
                  className="group relative flex h-[160px] w-[260px] overflow-hidden rounded-xl border border-border bg-background"
                >
                  {s.image ? (
                    <Image src={s.image} alt="" fill className="object-cover object-right" unoptimized />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
                  <div className="relative z-10 flex flex-1 flex-col justify-between p-3.5">
                    <Image src={s.icon} alt="" width={16} height={16} unoptimized />
                    <Typography as="h3" shape="small" weight="semibold">
                      {s.name}
                    </Typography>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </Rail>
        </section>
        <section className="mb-6">
          <SectionHead title="The Biggest Markets" action="View All" href="/sports" nav={markets} />
          <Rail nav={markets}>
            {MARKETS.map((m, i) => (
              <CarouselItem key={m.name} className={cn('basis-auto pl-2 md:pl-3', i === 0 && 'pl-4 md:pl-6')}>
                <Button variant="outline" className="size-[120px] flex-col gap-2" asChild>
                  <Link href="/sports">
                    <Image src={m.icon} alt={m.name} width={72} height={72} unoptimized />
                  </Link>
                </Button>
              </CarouselItem>
            ))}
          </Rail>
        </section>
      </div>
      <SiteFooter />
    </ShellFrame>
  )
}
