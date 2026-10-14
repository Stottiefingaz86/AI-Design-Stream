'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'
import {
  IconChevronLeft,
  IconChevronRight,
  IconFlame,
  IconPlayerPlay,
  IconRosetteFilled,
  IconSparkles,
  IconStopwatch,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { Typography } from '@/components/ui/typography'
import { TileShimmer } from '@/components/lumen/animations'
import { Favorite } from '@/components/lumen/favorite'
import { cn } from '@/lib/utils'

export const VENDOR_FILES: Record<string, string> = {
  'Dragon Gaming': 'Dragon gaming.svg',
  BetSoft: 'betsoft.svg',
  '5 Clover': '5clover.svg',
  '777Jacks': '777jacks.svg',
  "Arrow's Edge": 'arrows edge.svg',
  Blaze: 'blaze.svg',
  DeckFresh: 'deckfresh.svg',
  'DGS Casino Solutions': 'dgs.svg',
  'Emerald Gate': 'emerald gate.svg',
  FDBJ: 'fdbj.svg',
  Felix: 'felix.svg',
  FreshDeck: 'deckfresh.svg',
  GLS: 'gls.svg',
  'i3 Soft': 'i3soft.svg',
  'KA Gaming': 'kagaming.svg',
  Lucky: 'lucky.svg',
  'Mascot Gaming': 'mascotgaming.svg',
  Nucleus: 'nucleus.svg',
  Onlyplay: 'onlyplay.svg',
  Originals: 'orginals.svg',
  Popiplay: 'popiplay.svg',
  Qora: 'qora.svg',
  'Red Sparrow': 'red sparrow.svg',
  'Revolver Gaming': 'revolver.svg',
  Rival: 'rival.svg',
  Spinthron: 'spinthon.svg',
  Twain: 'twain.svg',
  VIG: 'vig.svg',
  Wingo: 'wingo.svg',
}

export type MetaTag = 'Early' | 'Hot' | 'Exclusive' | 'New' | 'Original'

function tagConfig(tag: MetaTag) {
  switch (tag) {
    case 'Early':
      return { bg: 'bg-success/20', border: 'border-success/60', icon: IconStopwatch, iconColor: 'text-success' }
    case 'Hot':
      return { bg: 'bg-live/20', border: 'border-live/60', icon: IconFlame, iconColor: 'text-live' }
    case 'Exclusive':
      return { bg: 'bg-info/20', border: 'border-info/60', icon: IconRosetteFilled, iconColor: 'text-info' }
    case 'New':
      return { bg: 'bg-warning/20', border: 'border-warning/60', icon: IconSparkles, iconColor: 'text-warning' }
    default:
      return { bg: 'bg-foreground/10', border: 'border-foreground/25', icon: IconSparkles, iconColor: 'text-foreground/70' }
  }
}

export function vendorPath(name: string) {
  return `/vendot_logos/${VENDOR_FILES[name] ?? `${name.toLowerCase()}.svg`}`
}

export function useCarouselNav() {
  const [api, setApi] = useState<CarouselApi>()
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  useEffect(() => {
    if (!api) return
    const sync = () => {
      setCanPrev(api.canScrollPrev())
      setCanNext(api.canScrollNext())
    }
    sync()
    api.on('select', sync)
    api.on('reInit', sync)
    return () => {
      api.off('select', sync)
      api.off('reInit', sync)
    }
  }, [api])

  return { api, setApi, canPrev, canNext }
}

export function GameTag({ tag, vendor }: { tag: MetaTag; vendor: string }) {
  const cfg = tagConfig(tag)
  const Icon = cfg.icon
  return (
    <div className="absolute left-1.5 top-1.5 z-10 flex items-center gap-1">
      <div className="flex size-4 items-center justify-center overflow-hidden rounded-[3px] bg-background/70">
        <Image src={vendorPath(vendor)} alt="" width={12} height={12} className="object-contain" unoptimized />
      </div>
      <span
        className={cn(
          'inline-flex items-center gap-0.5 rounded-full border px-1.5 py-[3px] text-[9px] font-semibold leading-none text-foreground backdrop-blur-sm',
          cfg.bg,
          cfg.border
        )}
      >
        <Icon className={cn('size-3', cfg.iconColor)} />
        {tag}
      </span>
    </div>
  )
}

export function GameTile({
  title,
  img,
  tag,
  vendor,
  tall,
}: {
  title: string
  img: string
  tag: MetaTag
  vendor: string
  tall?: boolean
}) {
  return (
    <article
      className={cn(
        'group relative shrink-0 overflow-hidden rounded-lg bg-surface-muted-3',
        tall ? 'h-[280px] w-[160px]' : 'size-[160px]'
      )}
    >
      <Image src={img} alt={title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
      <GameTag tag={tag} vendor={vendor} />
      <Favorite title={title} favoriteLabel={`Add ${title} to favorites`} unfavoriteLabel={`Remove ${title} from favorites`} />
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
        <TileShimmer />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-background/80 to-transparent p-3">
          <span className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
            <IconPlayerPlay className="size-3" /> Play
          </span>
        </div>
      </div>
    </article>
  )
}

export function SectionHead({
  title,
  action = 'All Games',
  href = '/casino',
  nav,
}: {
  title: string
  action?: string
  href?: string
  nav?: ReturnType<typeof useCarouselNav>
}) {
  return (
    <div className="mb-4 flex items-center justify-between px-4 md:px-6">
      <Typography as="h2" shape="h4" weight="semibold">
        {title}
      </Typography>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-auto border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link href={href}>{action}</Link>
        </Button>
        {nav ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="hidden size-8 border border-border bg-card md:inline-flex"
              aria-label="Previous"
              disabled={!nav.canPrev}
              onClick={() => nav.api?.scrollTo(Math.max(0, (nav.api?.selectedScrollSnap() ?? 0) - 2))}
            >
              <IconChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden size-8 border border-border bg-card md:inline-flex"
              aria-label="Next"
              disabled={!nav.canNext}
              onClick={() => {
                const slides = nav.api?.scrollSnapList().length ?? 0
                nav.api?.scrollTo(Math.min(slides - 1, (nav.api?.selectedScrollSnap() ?? 0) + 2))
              }}
            >
              <IconChevronRight className="size-4" />
            </Button>
          </>
        ) : null}
      </div>
    </div>
  )
}

export function Rail({
  children,
  nav,
}: {
  children: ReactNode
  nav: ReturnType<typeof useCarouselNav>
}) {
  return (
    <div className="relative -mx-4 md:-mx-6">
      <Carousel setApi={nav.setApi} opts={{ dragFree: true, containScroll: 'trimSnaps', duration: 15 }}>
        <CarouselContent className="ml-0">{children}</CarouselContent>
      </Carousel>
    </div>
  )
}

export function Shelf({
  title,
  games,
  tall,
}: {
  title: string
  games: Array<{ title: string; img: string; tag: MetaTag; vendor: string }>
  tall?: boolean
}) {
  const nav = useCarouselNav()
  return (
    <section className="mb-6">
      <SectionHead title={title} nav={nav} />
      <Rail nav={nav}>
        {games.map((g, i) => (
          <CarouselItem key={g.title} className={cn('basis-auto pl-2 md:pl-4', i === 0 && 'pl-4 md:pl-6')}>
            <GameTile {...g} tall={tall} />
          </CarouselItem>
        ))}
      </Rail>
    </section>
  )
}
