'use client'

import { useId } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { IconInfoCircle, IconUser } from '@tabler/icons-react'
import { CarouselItem } from '@/components/ui/carousel'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Typography } from '@/components/ui/typography'
import { TileShimmer } from '@/components/lumen/animations'
import { Favorite } from '@/components/lumen/favorite'
import { RewardCard } from '@/components/lumen/reward-card'
import { HomeHero } from './home-hero'
import { ShellHeader } from './shell-header'
import { SiteFooter } from './site-footer'
import {
  GameTag,
  Rail,
  SectionHead,
  Shelf,
  VENDOR_FILES,
  useCarouselNav,
  vendorPath,
  type MetaTag,
} from './game-shelf'
import { cn } from '@/lib/utils'

const VENDORS = Object.keys(VENDOR_FILES)

const NEW_GAMES = [
  { title: 'Slot Game 1', vendor: 'Onlyplay', tag: 'New' as const, img: '/casino_slots_tiles/slot-39.png' },
  { title: 'Slot Game 2', vendor: 'VIG', tag: 'Exclusive' as const, img: '/casino_slots_tiles/slot-40.png' },
  { title: 'Slot Game 3', vendor: 'Blaze', tag: 'Hot' as const, img: '/casino_slots_tiles/slot-41.png' },
  { title: 'Slot Game 4', vendor: 'Nucleus', tag: 'Early' as const, img: '/casino_slots_tiles/slot-42.png' },
  { title: 'Slot Game 5', vendor: 'Twain', tag: 'New' as const, img: '/casino_slots_tiles/slot-43.png' },
  { title: 'Slot Game 6', vendor: "Arrow's Edge", tag: 'Exclusive' as const, img: '/casino_slots_tiles/slot-44.png' },
  { title: 'Slot Game 7', vendor: 'Mascot Gaming', tag: 'Hot' as const, img: '/casino_slots_tiles/slot-45.png' },
  { title: 'Slot Game 8', vendor: 'Rival', tag: 'Early' as const, img: '/casino_slots_tiles/slot-46.png' },
  { title: 'Slot Game 9', vendor: '777Jacks', tag: 'New' as const, img: '/casino_slots_tiles/slot-47.png' },
  { title: 'Slot Game 10', vendor: 'Lucky', tag: 'Exclusive' as const, img: '/casino_slots_tiles/slot-48.png' },
]

const ORIGINALS = [
  { title: 'Plinko', img: '/games/originals/plink.png' },
  { title: 'Blackjack', img: '/games/originals/blackjack.png' },
  { title: 'Dice', img: '/games/originals/dice.png' },
  { title: 'Diamonds', img: '/games/originals/diamonds.png' },
  { title: 'Mines', img: '/games/originals/mines.png' },
  { title: 'Keno', img: '/games/originals/keno.png' },
  { title: 'Limbo', img: '/games/originals/limbo.png' },
  { title: 'Wheel', img: '/games/originals/wheel.png' },
  { title: 'Hilo', img: '/games/originals/hilo.png' },
  { title: 'Video Poker', img: '/games/originals/video_poker.png' },
]

const TOP10 = [
  { title: 'Gemhalla Xtreme', tag: 'Hot', img: '/casino_slots_tiles/slot-39.png' },
  { title: 'Alien Fruits 2', img: '/casino_slots_tiles/slot-40.png' },
  { title: 'Recycle Riches', tag: 'New', img: '/casino_slots_tiles/slot-41.png' },
  { title: 'Merge Up 2', img: '/casino_slots_tiles/slot-42.png' },
  { title: 'Zeus Goes Wild', tag: 'Hot', img: '/casino_slots_tiles/slot-43.png' },
  { title: 'Multi Rush', img: '/casino_slots_tiles/slot-44.png' },
  { title: 'Heart of Tiki', tag: 'New', img: '/casino_slots_tiles/slot-46.png' },
  { title: 'Money Maker', tag: 'Hot', img: '/casino_slots_tiles/slot-49.png' },
  { title: 'Hot Chilli Bells 100', img: '/casino_slots_tiles/slot-50.png' },
  { title: 'Fiesta Clusters', tag: 'New', img: '/casino_slots_tiles/slot-51.png' },
]

const SPORTS = [
  { name: 'Football', icon: '/sports_icons/football.svg', image: '/banners/homepage_trending/football.png' },
  { name: 'Basketball', icon: '/sports_icons/Basketball.svg', image: '/banners/homepage_trending/basketball.png' },
  { name: 'Baseball', icon: '/sports_icons/baseball.svg', image: '/banners/homepage_trending/baseball.png' },
  { name: 'Hockey', icon: '/sports_icons/Hockey.svg', image: '/banners/homepage_trending/hocky.png' },
  { name: 'Soccer', icon: '/sports_icons/soccer.svg', image: '/banners/homepage_trending/soccer.png' },
  { name: 'Tennis', icon: '/sports_icons/tennis.svg', image: '/banners/homepage_trending/tennis.png' },
  { name: 'MMA', icon: '/sports_icons/mma.svg', image: '/banners/homepage_trending/mma.png' },
  { name: 'Golf', icon: '/sports_icons/Golf.svg', image: '/banners/homepage_trending/golf.png' },
  { name: 'Boxing', icon: '/sports_icons/mma.svg' },
  { name: 'Rugby', icon: '/sports_icons/rugby.svg' },
  { name: 'Cricket', icon: '/sports_icons/Cricket.svg' },
  { name: 'Volleyball', icon: '/sports_icons/volley.svg' },
  { name: 'Lacrosse', icon: '/sports_icons/lacrosse.svg' },
  { name: 'Pool', icon: '/sports_icons/pool.svg' },
  { name: 'Table Tennis', icon: '/sports_icons/table_tennis.svg' },
  { name: 'Horse Racing', icon: '/sports_icons/Horse-Racing-101.svg' },
  { name: 'All Sports', icon: '/sports_icons/all sports.svg' },
]

const MARKETS = [
  { name: 'NFL', icon: '/banners/sports_league/NFL.svg' },
  { name: 'NBA', icon: '/banners/sports_league/nba.svg' },
  { name: 'MLB', icon: '/banners/sports_league/MLB.svg' },
  { name: 'NHL', icon: '/banners/sports_league/NHL.svg' },
  { name: 'Premier League', icon: '/banners/sports_league/prem.svg' },
  { name: 'La Liga', icon: '/banners/sports_league/laliga.svg' },
  { name: 'MLS', icon: '/banners/sports_league/mls.svg' },
  { name: 'ATP', icon: '/banners/sports_league/ATP.svg' },
  { name: 'Formula 1', icon: '/banners/sports_league/f1.svg' },
]

type LiveType = 'blackjack' | 'roulette' | 'baccarat'

const LIVE: Array<{
  title: string
  type: LiveType
  range: string
  seats?: { occupied: number; total: number }
}> = [
  { title: 'Classic Blackjack', type: 'blackjack', range: '$25 - $500', seats: { occupied: 2, total: 7 } },
  { title: 'Lightning Roulette', type: 'roulette', range: '$1 - $500' },
  { title: 'Speed Baccarat', type: 'baccarat', range: '$10 - $5,000' },
  { title: 'Speed Blackjack', type: 'blackjack', range: '$100 - $1,000', seats: { occupied: 5, total: 7 } },
  { title: 'Auto Roulette', type: 'roulette', range: '$0.50 - $250' },
  { title: 'Baccarat Lounge', type: 'baccarat', range: '$25 - $10,000' },
  { title: 'Infinite Blackjack', type: 'blackjack', range: '$10 - $500', seats: { occupied: 1, total: 7 } },
  { title: 'Immersive Roulette', type: 'roulette', range: '$1 - $1,000' },
  { title: 'Dragon Tiger', type: 'baccarat', range: '$5 - $2,500' },
  { title: 'Blackjack Party', type: 'blackjack', range: '$50 - $250', seats: { occupied: 3, total: 6 } },
  { title: 'XXXtreme Lightning', type: 'roulette', range: '$0.20 - $100' },
  { title: 'No Commission Baccarat', type: 'baccarat', range: '$25 - $5,000' },
]

const LIVE_IMAGES: Record<LiveType, string> = {
  blackjack: '/games/BLACKJACK RECTANGLE.png',
  roulette: '/games/roulette_square.png',
  baccarat: '/games/baccartae_rectangle.png',
}

const ACTIVITY = [
  { user: 'c***8', game: 'Sweet Bonanza', bet: '$12.00', multi: '24.5x', payout: '$294.00' },
  { user: 'm***2', game: 'Gates of Olympus', bet: '$5.00', multi: '8.2x', payout: '$41.00' },
  { user: 'r***9', game: 'Blackjack', bet: '$50.00', multi: '2.0x', payout: '$100.00' },
  { user: 't***1', game: 'Plinko', bet: '$2.00', multi: '130x', payout: '$260.00' },
  { user: 'k***4', game: 'Roulette', bet: '$25.00', multi: '35x', payout: '$875.00' },
  { user: 'j***7', game: 'Mines', bet: '$8.00', multi: '12.0x', payout: '$96.00' },
]

const ROULETTE_REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
const ROULETTE_BASE = [8, 20, 13, 0, 10, 32, 5, 19, 36, 2, 14, 7, 28, 11, 3, 26, 15]
const BACCARAT_BASE = ['B', 'B', 'P', 'B', 'P', 'T', 'P', 'B']

function RankNumber({ rank }: { rank: number }) {
  const uid = useId().replace(/:/g, '')
  const fillId = `top10-fill-${uid}`
  const isTen = rank === 10
  return (
    <svg
      aria-hidden
      viewBox={isTen ? '0 0 180 174' : '0 0 120 174'}
      className={cn('h-[174px] shrink-0', isTen ? 'w-[180px]' : 'w-[120px]')}
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="color-mix(in oklch, var(--foreground) 35%, transparent)" />
          <stop offset="100%" stopColor="var(--background)" />
        </linearGradient>
      </defs>
      <text
        x={rank === 1 ? 22 : 0}
        y="168"
        fill={`url(#${fillId})`}
        stroke="color-mix(in oklch, var(--foreground) 45%, transparent)"
        strokeWidth="2"
        fontFamily='Impact, Haettenschweiler, "Arial Black", sans-serif'
        fontSize={isTen ? 168 : 186}
        fontWeight={900}
      >
        {rank}
      </text>
    </svg>
  )
}

function rouletteColor(num: number) {
  if (num === 0) return 'bg-emerald-600'
  if (ROULETTE_REDS.includes(num)) return 'bg-red-600'
  return 'bg-zinc-700'
}

function LiveTile({
  title,
  type,
  range,
  seats,
  index,
}: {
  title: string
  type: LiveType
  range: string
  seats?: { occupied: number; total: number }
  index: number
}) {
  const vendor = index % 2 === 0 ? { name: 'VIG', logo: '/vendot_logos/vig.svg' } : { name: 'Fresh Deck', logo: '/vendot_logos/deckfresh.svg' }
  const roulette = Array.from({ length: 5 }, (_, i) => ROULETTE_BASE[(index * 3 + i) % ROULETTE_BASE.length])
  const baccarat = Array.from({ length: 5 }, (_, i) => BACCARAT_BASE[(index * 2 + i) % BACCARAT_BASE.length])

  return (
    <article className="group relative h-[160px] w-[240px] shrink-0 overflow-hidden rounded-lg bg-surface-muted-3">
      <Image src={LIVE_IMAGES[type]} alt={title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
      <Favorite title={title} className="opacity-100" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/35 to-background/10" />
      <div className="absolute left-1.5 top-1.5 z-10 flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-1.5 py-0.5 backdrop-blur-md">
        <span className="relative size-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-live opacity-75" />
          <span className="relative block size-1.5 rounded-full bg-live" />
        </span>
        <span className="text-[9px] font-medium text-white">{range}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 p-2.5">
        <p className="mb-0.5 text-[9px] font-medium uppercase tracking-wider text-white/60">Live</p>
        <p className="line-clamp-1 text-sm font-bold text-white">{title}</p>
        <div className="mt-1.5 flex items-center gap-0.5">
          {type === 'roulette'
            ? roulette.map((n, i) => (
                <span
                  key={`${n}-${i}`}
                  className={cn(
                    'flex size-3.5 items-center justify-center rounded-full text-[7px] font-semibold text-white',
                    rouletteColor(n)
                  )}
                >
                  {n}
                </span>
              ))
            : null}
          {type === 'baccarat'
            ? baccarat.map((r, i) => (
                <span
                  key={`${r}-${i}`}
                  className={cn(
                    'flex size-3.5 items-center justify-center rounded-full text-[7px] font-semibold text-white',
                    r === 'B' ? 'bg-red-600' : r === 'P' ? 'bg-blue-600' : 'bg-emerald-600'
                  )}
                >
                  {r}
                </span>
              ))
            : null}
          {type === 'blackjack' && seats ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white">
              <IconUser className="size-3" />
              {seats.occupied}/{seats.total}
            </span>
          ) : null}
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-medium text-white/50">
            <Image src={vendor.logo} alt="" width={12} height={12} className="size-3.5 object-contain" unoptimized />
            {vendor.name}
          </span>
          <IconInfoCircle className="size-3 text-white/60" />
        </div>
      </div>
      <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
        <TileShimmer />
      </span>
    </article>
  )
}

export function HomePage() {
  const sports = useCarouselNav()
  const markets = useCarouselNav()
  const live = useCarouselNav()
  const vendors = useCarouselNav()

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <ShellHeader />
      <main className="mx-auto w-full max-w-[1600px]">
        <div className="px-3 py-4 md:px-6 md:py-6">
          <HomeHero />
        </div>

        <Shelf title="New Games (128)" games={NEW_GAMES} />

        <section className="mb-6">
          <SectionHead title="Trending Sports" action="See More" href="/sports" nav={sports} />
          <Rail nav={sports}>
            {SPORTS.map((s, i) => (
              <CarouselItem key={s.name} className={cn('basis-auto pl-2 md:pl-4', i === 0 && 'pl-4 md:pl-6')}>
                <Link
                  href="/sports"
                  className="group relative flex h-[160px] w-[260px] overflow-hidden rounded-xl border border-border bg-background transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-foreground/20"
                >
                  {s.image ? (
                    <Image
                      src={s.image}
                      alt=""
                      fill
                      className="object-cover object-right transition-transform duration-500 group-hover:scale-[1.03]"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface-muted-1">
                      <Image src={s.icon} alt="" width={56} height={56} className="opacity-80" unoptimized />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
                  <div className="relative z-10 flex flex-1 flex-col justify-between p-3.5 pr-[42%]">
                    <span className="flex size-5 items-center justify-center overflow-hidden rounded-[4px] bg-surface-muted-1">
                      <Image src={s.icon} alt="" width={16} height={16} unoptimized />
                    </span>
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
                <Link
                  href="/sports"
                  className="group relative flex size-[120px] items-center justify-center overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-foreground/20 hover:bg-accent"
                >
                  <Image
                    src={m.icon}
                    alt={m.name}
                    width={72}
                    height={72}
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                </Link>
              </CarouselItem>
            ))}
          </Rail>
        </section>

        <Shelf
          title="Originals (26)"
          tall
          games={ORIGINALS.map((g) => ({ ...g, tag: 'Original' as const, vendor: 'Originals' }))}
        />

        <section className="mb-8 overflow-x-auto px-4 scrollbar-hide md:px-6">
          <Typography as="h2" shape="h4" weight="semibold" className="mb-4">
            Top 10 Games This Week
          </Typography>
          <ol className="flex items-end gap-11">
            {TOP10.map((g, i) => (
              <li key={g.title} className="relative flex h-[174px] shrink-0 items-end">
                <div className="absolute bottom-0 left-0 z-0">
                  <RankNumber rank={i + 1} />
                </div>
                <article className="group relative z-10 ml-[52px] size-[160px] overflow-hidden rounded-lg bg-surface-muted-3">
                  <Image src={g.img} alt={g.title} fill className="object-cover" unoptimized />
                  {g.tag ? <GameTag tag={g.tag as MetaTag} vendor="BetSoft" /> : null}
                  <Favorite title={g.title} />
                  <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                    <TileShimmer />
                  </span>
                </article>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-8 px-4 md:px-6">
          <Typography as="h2" shape="h4" weight="semibold" className="mb-4">
            Activity
          </Typography>
          <Tabs
            activationMode="automatic"
            defaultValue="overview"
            dir="ltr"
            shape="solid"
            variant="primary"
          >
            <TabsList aria-label="Account sections" width="fit">
              <TabsTrigger value="overview">All Bets</TabsTrigger>
              <TabsTrigger value="activity">Jackpot Winners</TabsTrigger>
              <TabsTrigger value="rewards">25k Daily Race</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <Typography as="p" shape="small" variant="muted">
                Overview — Balance, bonuses and open bets.
              </Typography>
              <div className="mt-3 overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableCaption>Placeholder data set</TableCaption>
                  <TableHeader>
                    <TableRow className="bg-muted hover:bg-muted">
                      {['User', 'Game', 'Bet Amount', 'Multiplier', 'Payout'].map((h) => (
                        <TableHead key={h}>{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ACTIVITY.map((row) => (
                      <TableRow key={row.user + row.game}>
                        <TableCell>{row.user}</TableCell>
                        <TableCell>{row.game}</TableCell>
                        <TableCell>{row.bet}</TableCell>
                        <TableCell className="text-success">{row.multi}</TableCell>
                        <TableCell className="font-semibold">{row.payout}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="activity">
              <Typography as="p" shape="small" variant="muted">
                Activity — Every settled bet, newest first.
              </Typography>
            </TabsContent>
            <TabsContent value="rewards">
              <Typography as="p" shape="small" variant="muted">
                Rewards — Points, tiers and what they unlock.
              </Typography>
            </TabsContent>
            <TabsContent value="account">
              <Typography as="p" shape="small" variant="muted">
                Account — Limits, documents and preferences.
              </Typography>
            </TabsContent>
          </Tabs>
        </section>

        <section className="mb-6">
          <SectionHead title="Live Casino (24)" nav={live} />
          <Rail nav={live}>
            {LIVE.map((g, i) => (
              <CarouselItem key={g.title} className={cn('basis-auto pl-2 md:pl-4', i === 0 && 'pl-4 md:pl-6')}>
                <LiveTile {...g} index={i} />
              </CarouselItem>
            ))}
          </Rail>
        </section>

        <Separator decorative orientation="horizontal" className="mx-4 mb-6 md:mx-6" />

        <section className="mb-6">
          <Typography as="h2" shape="h4" weight="semibold" className="mb-4 px-4 md:px-6">
            Vendors
          </Typography>
          <Rail nav={vendors}>
            {VENDORS.map((v, i) => (
              <CarouselItem key={v} className={cn('basis-auto pl-2 md:pl-4', i === 0 && 'pl-4 md:pl-6')}>
                <Link
                  href="/casino"
                  className="group relative inline-flex items-center gap-2 overflow-hidden whitespace-nowrap rounded-lg border border-border bg-secondary px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Image src={vendorPath(v)} alt="" width={20} height={20} className="size-5 object-contain" unoptimized />
                  <span className="relative z-10">{v}</span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Link>
              </CarouselItem>
            ))}
          </Rail>
        </section>

        <section className="mb-8 px-4 md:px-6">
          <RewardCard
            buttonAction={() => {
              window.location.href = '/casino'
            }}
          />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
