'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { IconSearch } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Typography } from '@/components/ui/typography'
import { Shimmer } from '@/components/lumen/animations'
import { Favorite } from '@/components/lumen/favorite'
import { RewardCard } from '@/components/lumen/reward-card'
import { GameTile, Rail, SectionHead, Shelf, VENDOR_FILES, useCarouselNav, vendorPath } from './game-shelf'
import { ShellFrame } from './shell-frame'
import { SiteFooter } from './site-footer'
import { CarouselItem } from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

const SUBNAV = [
  'Lobby',
  'Slots',
  'Bonus Buys',
  'Megaways',
  'Originals',
  'Blackjack',
  'Live',
  'Jackpots',
  'New',
  'Early',
  'Staff Picks',
  'Exclusive',
] as const

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
].map((g) => ({ ...g, tag: 'Original' as const, vendor: 'Originals' }))

const TOP10 = [
  { title: 'Gemhalla Xtreme', tag: 'Hot' as const, img: '/casino_slots_tiles/slot-39.png' },
  { title: 'Alien Fruits 2', img: '/casino_slots_tiles/slot-40.png' },
  { title: 'Recycle Riches', tag: 'New' as const, img: '/casino_slots_tiles/slot-41.png' },
  { title: 'Merge Up 2', img: '/casino_slots_tiles/slot-42.png' },
  { title: 'Zeus Goes Wild', tag: 'Hot' as const, img: '/casino_slots_tiles/slot-43.png' },
  { title: 'Multi Rush', img: '/casino_slots_tiles/slot-44.png' },
  { title: 'Heart of Tiki', tag: 'New' as const, img: '/casino_slots_tiles/slot-46.png' },
  { title: 'Money Maker', tag: 'Hot' as const, img: '/casino_slots_tiles/slot-49.png' },
  { title: 'Hot Chilli Bells 100', img: '/casino_slots_tiles/slot-50.png' },
  { title: 'Fiesta Clusters', tag: 'New' as const, img: '/casino_slots_tiles/slot-51.png' },
]

const JACKPOTS = [
  { label: 'MUST DROP', value: '$12.34K', tone: 'live' as const },
  { label: 'MINI', value: '$485.73', tone: 'success' as const },
  { label: 'MINOR', value: '$6,225', tone: 'info' as const },
  { label: 'MAJOR', value: '$72.70K', tone: 'warning' as const },
  { label: 'MEGA', value: '$1.312M', tone: 'vip' as const },
]

const LIVE = [
  { title: 'Blackjack Classic', range: '$25 - $500', seats: '2/7', vendor: 'VIG', img: '/games/BLACKJACK RECTANGLE.png' },
  { title: 'VIP Blackjack', range: '$100 - $1,000', seats: '5/7', vendor: 'FreshDeck', img: '/games/BLACKJACK RECTANGLE.png' },
  { title: 'European Blackjack', range: '$10 - $250', seats: '2/6', vendor: 'VIG', img: '/games/BLACKJACK RECTANGLE.png' },
  { title: 'American Blackjack', range: '$50 - $500', seats: '4/7', vendor: 'FreshDeck', img: '/games/BLACKJACK RECTANGLE.png' },
  { title: 'Speed Baccarat', range: '$10 - $1,000', seats: undefined, vendor: 'VIG', img: '/games/baccartae_rectangle.png' },
  { title: 'Lightning Roulette', range: '$1 - $500', seats: undefined, vendor: 'FreshDeck', img: '/games/roulette_square.png' },
]

const POPULAR = [
  { title: 'Sweet Bonanza', vendor: '777Jacks', tag: 'Hot' as const, img: '/casino_slots_tiles/slot-39.png' },
  { title: 'Gates of Olympus', vendor: 'Lucky', tag: 'Early' as const, img: '/casino_slots_tiles/slot-40.png' },
  { title: 'Sugar Rush', vendor: 'Revolver Gaming', tag: 'New' as const, img: '/casino_slots_tiles/slot-41.png' },
  { title: 'Big Bass Splash', vendor: '5 Clover', tag: 'Exclusive' as const, img: '/casino_slots_tiles/slot-42.png' },
  { title: 'Fruit Party', vendor: 'KA Gaming', tag: 'Hot' as const, img: '/casino_slots_tiles/slot-43.png' },
  { title: 'Wolf Gold', vendor: 'Red Sparrow', tag: 'Early' as const, img: '/casino_slots_tiles/slot-44.png' },
  { title: 'The Dog House', vendor: 'BetSoft', tag: 'New' as const, img: '/casino_slots_tiles/slot-45.png' },
  { title: 'Starlight Princess', vendor: 'Felix', tag: 'Exclusive' as const, img: '/casino_slots_tiles/slot-46.png' },
]

const EXCLUSIVES = [
  { title: 'Golden Dragon', vendor: 'Emerald Gate', tag: 'Exclusive' as const, img: '/casino_slots_tiles/slot-47.png' },
  { title: 'Royal Fortune', vendor: 'Popiplay', tag: 'Exclusive' as const, img: '/casino_slots_tiles/slot-48.png' },
  { title: 'Diamond Heist', vendor: 'Wingo', tag: 'Exclusive' as const, img: '/casino_slots_tiles/slot-49.png' },
  { title: 'Mystic Gems', vendor: 'DeckFresh', tag: 'Exclusive' as const, img: '/casino_slots_tiles/slot-50.png' },
  { title: "Pirate's Bounty", vendor: 'Onlyplay', tag: 'Exclusive' as const, img: '/casino_slots_tiles/slot-51.png' },
  { title: 'Phoenix Rising', vendor: 'VIG', tag: 'Exclusive' as const, img: '/casino_slots_tiles/slot-39.png' },
]

const CRASH = [
  { title: 'Aviator', vendor: 'Mascot Gaming', tag: 'Hot' as const, img: '/casino_slots_tiles/slot-40.png' },
  { title: 'Spaceman', vendor: 'Rival', tag: 'Early' as const, img: '/casino_slots_tiles/slot-41.png' },
  { title: 'JetX', vendor: '777Jacks', tag: 'New' as const, img: '/casino_slots_tiles/slot-42.png' },
  { title: 'Cash or Crash', vendor: 'Lucky', tag: 'Exclusive' as const, img: '/casino_slots_tiles/slot-43.png' },
  { title: 'Rocket Blast', vendor: 'Revolver Gaming', tag: 'Hot' as const, img: '/casino_slots_tiles/slot-44.png' },
]

const INSTANT = [
  { title: 'Scratch & Win', vendor: 'Twain', tag: 'Hot' as const, img: '/casino_slots_tiles/slot-45.png' },
  { title: 'Lucky Numbers', vendor: "Arrow's Edge", tag: 'Early' as const, img: '/casino_slots_tiles/slot-46.png' },
  { title: 'Gold Rush', vendor: 'Mascot Gaming', tag: 'New' as const, img: '/casino_slots_tiles/slot-47.png' },
  { title: 'Cash Spin', vendor: 'Rival', tag: 'Exclusive' as const, img: '/casino_slots_tiles/slot-48.png' },
]

const TOURNAMENTS = [
  { title: 'Gold Nugget Rush', prize: '$15,000', type: 'Most Points Won' },
  { title: 'MEGACRUSH HOLD&WIN', prize: '$10,000', type: 'Highest Single Win' },
  { title: 'Hooked on Fishing', prize: '$25,000', type: 'Most Points Won' },
  { title: 'Mr Mammoth', prize: '$8,000', type: 'Biggest Win Multiplier' },
]

const ACTIVITY = [
  { user: 'c***8', game: 'Sweet Bonanza', bet: '$12.00', multi: '24.5x', payout: '$294.00' },
  { user: 'm***2', game: 'Gates of Olympus', bet: '$5.00', multi: '8.2x', payout: '$41.00' },
  { user: 'r***9', game: 'Blackjack', bet: '$50.00', multi: '2.0x', payout: '$100.00' },
  { user: 't***1', game: 'Plinko', bet: '$2.00', multi: '130x', payout: '$260.00' },
]

const BANNERS = [
  { src: '/banners/dinerMatchBackground.png', title: 'Diner Match', copy: 'First deposit bonus up to 250%.' },
  { src: '/banners/orginals.png', title: 'Originals', copy: 'Streamlined play for a guaranteed win.' },
  { src: '/banners/weekly.png', title: 'Weekly Boost', copy: 'Reload every week as you climb VIP.' },
  { src: '/banners/freespins.png', title: 'Free Spins', copy: '10 free spins for 10 days.' },
]

const VIP_ITEMS = [
  { title: 'Casino Rakeback', action: 'CLAIM $0.20' },
  { title: 'Refer a Friend', meta: 'Commission ready', action: 'CLAIM $40.00' },
  { title: 'Weekly Cashboost', meta: 'SILVER', action: null },
  { title: 'Monthly Cashboost', meta: 'PLATINUM', action: null },
]

export function CasinoPage() {
  const [active, setActive] = useState<(typeof SUBNAV)[number]>('Lobby')
  const [vipOpen, setVipOpen] = useState(false)
  const [season, setSeason] = useState('Halloween')
  const vendors = useCarouselNav()
  const jackpots = useCarouselNav()
  const live = useCarouselNav()
  const VENDORS = Object.keys(VENDOR_FILES)

  return (
    <ShellFrame loggedIn>
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 md:px-6">
          <Button variant="outline" size="icon" aria-label="Search" className="size-9 shrink-0">
            <IconSearch className="size-4" />
          </Button>
          <Favorite className="relative opacity-100" title="Favorites" />
          <Tabs
            activationMode="automatic"
            value={active}
            onValueChange={(v) => setActive(v as (typeof SUBNAV)[number])}
            shape="solid"
            variant="primary"
          >
            <TabsList aria-label="Casino sections" width="fit" className="bg-transparent p-0">
              {SUBNAV.map((item) => (
                <TabsTrigger key={item} value={item} className="rounded-full">
                  {item}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1600px] py-6">
        <div className="mb-8 flex items-stretch gap-3 overflow-x-auto px-4 scrollbar-hide md:px-6">
          <Card
            className="flex h-[164px] w-[288px] shrink-0 cursor-pointer flex-col justify-between p-4"
            onClick={() => setVipOpen(true)}
          >
            <Typography as="h3" shape="small" weight="semibold">
              VIP Hub
            </Typography>
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Bronze to Silver</span>
                <span>00%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-0 rounded-full bg-vip-rewards" />
              </div>
              <Typography as="p" shape="xxs" variant="muted" className="mt-2">
                Updated 12/25/2024, 8:00 PM ET
              </Typography>
            </div>
          </Card>
          <Card className="flex h-[164px] w-[288px] shrink-0 flex-col justify-between p-4">
            <div className="flex items-start justify-between gap-2">
              <Typography as="h3" shape="small" weight="semibold">
                Daily Races
              </Typography>
              <Typography as="p" shape="small" className="font-mono">
                06 : 54 : 31
              </Typography>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['3rd', 'Position'],
                ['$80,000', 'Wagered'],
                ['$160,000', 'Current Prize'],
              ].map(([v, k]) => (
                <div key={k} className="rounded-md bg-surface-muted-1 p-2">
                  <Typography as="p" shape="small" weight="semibold">
                    {v}
                  </Typography>
                  <Typography as="p" shape="xxs" variant="muted">
                    {k}
                  </Typography>
                </div>
              ))}
            </div>
          </Card>
          {BANNERS.map((b) => (
            <article key={b.title} className="relative h-[164px] w-[340px] shrink-0 overflow-hidden rounded-lg bg-card">
              <Image src={b.src} alt="" fill className="object-cover" unoptimized />
              <div className="relative z-10 flex h-full flex-col justify-between bg-gradient-to-t from-background/80 to-transparent p-4">
                <div>
                  <Typography as="h3" shape="h4" weight="bold">
                    {b.title}
                  </Typography>
                  <Typography as="p" shape="small" variant="muted">
                    {b.copy}
                  </Typography>
                </div>
                <Shimmer active tint="primary" trigger="hover">
                  <Button size="sm">Play Now</Button>
                </Shimmer>
              </div>
            </article>
          ))}
        </div>

        <Shelf title="New Games (128)" games={NEW_GAMES} />
        <Shelf title="Originals (26)" games={ORIGINALS} tall />

        <section className="mb-6">
          <SectionHead title="Jackpots" nav={jackpots} />
          <Rail nav={jackpots}>
            {JACKPOTS.map((j, i) => (
              <CarouselItem key={j.label} className={cn('basis-auto pl-2 md:pl-4', i === 0 && 'pl-4 md:pl-6')}>
                <Card className="flex h-[140px] w-[200px] flex-col justify-between p-4">
                  <Typography as="p" shape="xs" weight="semibold" className="uppercase text-muted-foreground">
                    {j.label}
                  </Typography>
                  <Typography as="p" shape="h3" weight="bold">
                    {j.value}
                  </Typography>
                </Card>
              </CarouselItem>
            ))}
          </Rail>
        </section>

        <section className="mb-8 overflow-x-auto px-4 scrollbar-hide md:px-6">
          <Typography as="h2" shape="h4" weight="semibold" className="mb-4">
            Top 10 Games This Week
          </Typography>
          <ol className="flex items-end gap-8">
            {TOP10.map((g, i) => (
              <li key={g.title} className="relative flex h-[174px] shrink-0 items-end">
                <Typography as="span" shape="h2" weight="bold" className="absolute bottom-0 left-0 z-0 text-foreground/20">
                  {i + 1}
                </Typography>
                <div className="relative z-10 ml-10">
                  <GameTile
                    title={g.title}
                    img={g.img}
                    tag={g.tag ?? 'Original'}
                    vendor="BetSoft"
                  />
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-6">
          <SectionHead title="Blackjack (52)" nav={live} />
          <Rail nav={live}>
            {LIVE.map((g, i) => (
              <CarouselItem key={g.title} className={cn('basis-auto pl-2 md:pl-4', i === 0 && 'pl-4 md:pl-6')}>
                <article className="group relative h-[160px] w-[240px] overflow-hidden rounded-lg bg-surface-muted-3">
                  <Image src={g.img} alt={g.title} fill className="object-cover" unoptimized />
                  <Favorite title={g.title} className="opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-background to-transparent p-2.5">
                    <Typography as="p" shape="small" weight="bold">
                      {g.title}
                    </Typography>
                    <Typography as="p" shape="xxs" variant="muted">
                      {g.range} · {g.vendor}
                      {g.seats ? ` · ${g.seats}` : ''}
                    </Typography>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </Rail>
        </section>

        <section className="mb-6">
          <Typography as="h2" shape="h4" weight="semibold" className="mb-4 px-4 md:px-6">
            Vendors
          </Typography>
          <Rail nav={vendors}>
            {VENDORS.map((v, i) => (
              <CarouselItem key={v} className={cn('basis-auto pl-2 md:pl-4', i === 0 && 'pl-4 md:pl-6')}>
                <Link
                  href="/casino"
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-secondary px-3 py-2.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Image src={vendorPath(v)} alt="" width={20} height={20} className="size-5 object-contain" unoptimized />
                  {v}
                </Link>
              </CarouselItem>
            ))}
          </Rail>
        </section>

        <Shelf title="Continue Playing" games={NEW_GAMES.slice(0, 4)} />

        <section className="mb-8 px-4 md:px-6">
          <Typography as="h2" shape="h4" weight="semibold" className="mb-4">
            Activity
          </Typography>
          <Tabs defaultValue="overview" activationMode="automatic" shape="solid" variant="primary">
            <TabsList width="fit" aria-label="Activity">
              <TabsTrigger value="overview">All Bets</TabsTrigger>
              <TabsTrigger value="jackpots">Jackpot Winners</TabsTrigger>
              <TabsTrigger value="race">25k Daily Race</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
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
            <TabsContent value="jackpots">
              <Typography as="p" shape="small" variant="muted">
                Jackpot winners appear here as they hit.
              </Typography>
            </TabsContent>
            <TabsContent value="race">
              <Typography as="p" shape="small" variant="muted">
                Daily race standings update live.
              </Typography>
            </TabsContent>
          </Tabs>
        </section>

        <Shelf title="Most Popular (64)" games={POPULAR} />
        <Shelf
          title="Baccarat (23)"
          games={LIVE.filter((g) => g.title.includes('Baccarat')).map((g) => ({
            title: g.title,
            img: g.img,
            tag: 'Hot' as const,
            vendor: g.vendor,
          }))}
        />
        <Shelf title="Exclusives (32)" games={EXCLUSIVES} />

        <section className="mb-6 px-4 md:px-6">
          <Card className="overflow-hidden p-6">
            <Typography as="p" shape="xs" weight="semibold" className="uppercase text-live">
              Halloween
            </Typography>
            <Typography as="h2" shape="h3" weight="bold" className="mt-1">
              HALLOWEEN GAMES
            </Typography>
            <Typography as="p" shape="small" variant="muted" className="mt-2 max-w-2xl">
              Get spooky with our collection of Halloween-themed games. Spin the reels and win big with haunted slots and eerie jackpots.
            </Typography>
            <Tabs value={season} onValueChange={setSeason} className="mt-4" shape="solid" variant="primary">
              <TabsList width="fit">
                {['Halloween', 'Christmas', 'Superbowl', 'Easter'].map((s) => (
                  <TabsTrigger key={s} value={s}>
                    {s}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </Card>
        </section>
        <Shelf title="Halloween" games={POPULAR.slice(0, 6)} />
        <Shelf title="Crash Games (18)" games={CRASH} />

        <section className="mb-6">
          <SectionHead title="Cash Tournaments (6)" action="View All" href="/promotions" />
          <div className="grid gap-4 px-4 md:grid-cols-3 md:px-6">
            {TOURNAMENTS.map((t) => (
              <Card key={t.title} className="p-4">
                <Typography as="h3" shape="small" weight="semibold">
                  {t.title}
                </Typography>
                <Typography as="p" shape="h3" weight="bold" className="mt-2">
                  {t.prize}
                </Typography>
                <Typography as="p" shape="xs" variant="muted" className="mt-1">
                  {t.type} · Ended
                </Typography>
                <Button className="mt-4" size="sm">
                  Play
                </Button>
              </Card>
            ))}
          </div>
        </section>

        <Shelf title="Instant Wins (24)" games={INSTANT} />
        <Separator className="mx-4 mb-6 md:mx-6" />
        <section className="px-4 md:px-6">
          <RewardCard />
        </section>
      </div>

      <Sheet open={vipOpen} onOpenChange={setVipOpen} modal>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>VIP Hub</SheetTitle>
            <SheetDescription>Climb every VIP rank from Bronze to Obsidian.</SheetDescription>
          </SheetHeader>
          <ul className="mt-4">
            {VIP_ITEMS.map((it) => (
              <li key={it.title} className="flex items-center justify-between gap-3 border-b border-border py-3">
                <div>
                  <Typography as="p" shape="small" weight="medium">
                    {it.title}
                  </Typography>
                  {it.meta ? (
                    <Typography as="p" shape="xs" variant="muted">
                      {it.meta}
                    </Typography>
                  ) : null}
                </div>
                {it.action ? <Button size="sm">{it.action}</Button> : null}
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
      <SiteFooter />
    </ShellFrame>
  )
}
