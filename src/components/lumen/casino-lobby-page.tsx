'use client'

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
  type CarouselApi,
} from '@/components/ui/carousel'
import { Typography } from '@/components/ui/typography'
import { CasinoLobbyBannerRow } from '@/components/lumen/casino-lobby-banners'
import {
  CASINO_TILE_H,
  CASINO_TILE_W,
  CasinoGameTile,
  PlayRandomTile,
} from '@/components/lumen/casino-game-tile'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { CASINO_LOBBY_PROMO_BANNERS } from '@/lib/lumen/casino-lobby-promos'
import {
  ACTIVITY_ROWS,
  CHRISTMAS_PROMO,
  CONTINUE_PLAYING,
  EXCLUSIVE_GAMES,
  HALLOWEEN_GAMES,
  HALLOWEEN_PROMO,
  JACKPOT_GAMES,
  JACKPOT_TIERS,
  LIVE_GAMES,
  NEW_GAMES,
  ORIGINALS_GAMES,
  POPULAR_GAMES,
  PROVIDERS,
  SLOTS_GAMES,
  TOP10_GAMES,
  type CasinoLobbyGame,
} from '@/lib/lumen/casino-lobby-catalog'
import { cn } from '@/lib/utils'

/** Row chrome: title + See More + 36px IconButtons (not Embla overlay arrows). */
function ShelfHeader({
  title,
  titleSuffix,
  inverted,
  onLight,
  hideArrows,
  hideSeeMore,
}: {
  title?: string
  /** Muted parenthetical — e.g. Figma “VIP Jackpots (Block)”. */
  titleSuffix?: string
  inverted?: boolean
  /** Bright banner art — solid white controls so they don't wash out. */
  onLight?: boolean
  hideArrows?: boolean
  hideSeeMore?: boolean
}) {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel()

  const seeMoreClass = cn(
    'h-9 shrink-0 border px-3 text-xs font-medium',
    onLight
      ? 'border-black/10 bg-white text-foreground shadow-sm hover:bg-white hover:text-foreground'
      : inverted
        ? 'border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white'
        : 'border-border bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground',
  )
  const arrowClass = cn(
    'size-9 shrink-0 rounded-md border p-0',
    onLight
      ? 'border-black/10 bg-white text-foreground shadow-sm hover:bg-white disabled:opacity-45'
      : inverted
        ? 'border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white disabled:opacity-45'
        : 'border-border bg-secondary text-foreground hover:bg-muted disabled:opacity-45',
  )

  return (
    <header className="mb-3 flex h-9 items-center justify-between gap-4">
      {title ? (
        <Typography as="h3" shape="h4" weight="semibold" className={cn('min-w-0 truncate', inverted && 'text-white')}>
          {title}
          {titleSuffix ? (
            <span className={cn('font-semibold', inverted ? 'text-white/60' : 'text-foreground/60')}>{titleSuffix}</span>
          ) : null}
        </Typography>
      ) : (
        <span className="min-w-0 flex-1" />
      )}
      <div className="flex shrink-0 items-center gap-4">
        {hideSeeMore ? null : (
          <Button type="button" variant="ghost" size="sm" className={seeMoreClass}>
            See More
          </Button>
        )}
        {hideArrows ? null : (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label={`Previous ${title ?? 'row'}`}
              className={arrowClass}
              disabled={!canScrollPrev}
              onClick={scrollPrev}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label={`Next ${title ?? 'row'}`}
              className={arrowClass}
              disabled={!canScrollNext}
              onClick={scrollNext}
            >
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

const TIER_LABEL_CLASS: Record<(typeof JACKPOT_TIERS)[number]['tone'], string> = {
  must: 'text-[#f97316]',
  mega: 'bg-gradient-to-r from-[#ed9a63] via-[#eca545] to-[#d36913] bg-clip-text text-transparent',
  major: 'text-[#ec4899]',
  minor: 'text-[#06b6d4]',
  mini: 'text-[#22c55e]',
}

/** Casino Master `jackpot-label` strip (Component 1) — 50px segmented bar. */
function JackpotTierBar({
  activeId,
  onSelect,
}: {
  activeId: (typeof JACKPOT_TIERS)[number]['id']
  onSelect: (id: (typeof JACKPOT_TIERS)[number]['id']) => void
}) {
  return (
    <div
      data-name="jackpot-tier-bar"
      className="mb-3 flex h-[50px] w-full overflow-hidden rounded-[10px] border border-border bg-card"
      role="tablist"
      aria-label="Jackpot tiers"
    >
      {JACKPOT_TIERS.map((item) => {
        const active = item.id === activeId
        const isMust = item.tone === 'must'
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            data-name="jackpot-label"
            onClick={() => onSelect(item.id)}
            className={cn(
              'flex h-full min-w-0 flex-1 items-center justify-center gap-1 px-2 text-sm font-bold leading-5',
              isMust
                ? 'bg-[linear-gradient(90deg,#c48633_0%,#722d10_20%,#a65615_50%,#c48633_75%,#722d10_100%)]'
                : 'border-l border-border bg-card',
            )}
          >
            {isMust ? (
              <>
                <img src="/casino/jackpot-fire.svg" alt="" width={16} height={16} className="size-4 shrink-0" />
                <span className={TIER_LABEL_CLASS.must}>{item.label}</span>
                <span className="text-white">{item.amount}</span>
                {'countdown' in item && item.countdown ? (
                  <span className="text-[10px] font-semibold leading-[14px] text-white">in {item.countdown}</span>
                ) : null}
              </>
            ) : (
              <>
                <span className={TIER_LABEL_CLASS[item.tone]}>{item.label}</span>
                <span className="text-foreground">{item.amount}</span>
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}

function GameRail({
  games,
  showPlayRandom,
  tileClassName,
}: {
  games: CasinoLobbyGame[]
  showPlayRandom?: boolean
  tileClassName?: string
}) {
  return (
    <CarouselContent className="!ml-0 gap-3 py-4">
      {games.map((game) => (
        <CarouselItem key={game.id} className="basis-auto pl-0 first:pl-6 last:pr-6">
          <CasinoGameTile game={game} className={tileClassName} />
        </CarouselItem>
      ))}
      {showPlayRandom ? (
        <CarouselItem key="play-random" className="basis-auto pl-0 first:pl-6 last:pr-6">
          <PlayRandomTile />
        </CarouselItem>
      ) : null}
    </CarouselContent>
  )
}

function CasinoGameShelf({
  title,
  games,
  showPlayRandom,
  className,
}: {
  title: string
  games: CasinoLobbyGame[]
  showPlayRandom?: boolean
  className?: string
}) {
  return (
    <section data-name="carousel" aria-label={title} className={cn('py-2', className)}>
      <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
        <div className="px-6">
          <ShelfHeader title={title} />
        </div>
        <GameRail games={games} showPlayRandom={showPlayRandom} />
      </Carousel>
    </section>
  )
}

/**
 * Top 10 posters are the same size as every other shelf tile.
 * Rank peeks left; ~45% tucks under the poster (Netflix).
 */
const TOP10_TILE_LEFT = 72
const TOP10_TEN_TILE_LEFT = 132
const TOP10_SLOT_W = TOP10_TILE_LEFT + CASINO_TILE_W
const TOP10_TEN_SLOT_W = TOP10_TEN_TILE_LEFT + CASINO_TILE_W

/**
 * Netflix rank — glyph height = tile height, no clip.
 * Stroke fades left → right via `--top10-stroke-*` (dark→light in light, light→dark in dark).
 */
function Top10Rank({ rank }: { rank: number }) {
  const uid = useId().replace(/:/g, '')
  const strokeId = `top10-stroke-${uid}`
  const isTen = rank === 10
  const numW = isTen ? TOP10_TEN_SLOT_W : TOP10_SLOT_W
  return (
    <svg
      aria-hidden
      data-name="numbers"
      viewBox={`0 0 ${numW} ${CASINO_TILE_H}`}
      width={numW}
      height={CASINO_TILE_H}
      className="pointer-events-none absolute inset-y-0 left-0 z-0 overflow-visible select-none"
      preserveAspectRatio="xMinYMid meet"
    >
      <defs>
        <linearGradient id={strokeId} x1="0" y1="0" x2={numW} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--top10-stroke-start)" />
          <stop offset="45%" stopColor="var(--top10-stroke-mid)" />
          <stop offset="100%" stopColor="var(--top10-stroke-end)" />
        </linearGradient>
      </defs>
      <text
        x={4}
        y={CASINO_TILE_H - 6}
        textAnchor="start"
        fill="var(--background)"
        stroke={`url(#${strokeId})`}
        strokeWidth={5}
        strokeLinejoin="round"
        paintOrder="stroke fill"
        fontFamily='Impact, Haettenschweiler, "Arial Black", sans-serif'
        fontSize={CASINO_TILE_H}
        fontWeight={900}
        letterSpacing={isTen ? -12 : 0}
      >
        {rank}
      </text>
    </svg>
  )
}

function CasinoTop10({ games }: { games: CasinoLobbyGame[] }) {
  return (
    <section data-name="top-10" aria-label="Top 10 Games" className="py-2">
      <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
        <div className="px-6">
          <ShelfHeader title="Top 10 Games" hideSeeMore />
        </div>
        <CarouselContent className="!ml-0 gap-4 py-5">
          {games.slice(0, 10).map((game, i) => {
            const rank = i + 1
            const isTen = rank === 10
            return (
              <CarouselItem key={game.id} className="basis-auto pl-0 first:pl-6 last:pr-6">
                <div
                  data-name="top-10-games"
                  className="relative shrink-0 overflow-visible"
                  style={{
                    height: CASINO_TILE_H,
                    width: isTen ? TOP10_TEN_SLOT_W : TOP10_SLOT_W,
                  }}
                >
                  <Top10Rank rank={rank} />
                  <CasinoGameTile
                    game={game}
                    dense
                    className={cn(
                      'absolute top-0 z-10 shadow-[0_4px_16px_rgba(0,0,0,0.35)]',
                      isTen ? 'left-[132px]' : 'left-[72px]',
                    )}
                  />
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
    </section>
  )
}

function CasinoThemeBanner({
  badge,
  title,
  body,
  imageSrc,
  games,
  tone = 'dark',
}: {
  badge: string
  title: string
  body: string
  imageSrc: string
  games: CasinoLobbyGame[]
  /** `light` = bright art (Christmas) → dark copy; `dark` = white copy. */
  tone?: 'light' | 'dark'
}) {
  const onLight = tone === 'light'
  return (
    <section data-name="banner-carousel" className="relative my-2 overflow-hidden py-9">
      <img src={imageSrc} alt="" className="absolute inset-0 size-full object-cover" />
      {/* Soft edge vignette on the hero art */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 z-[1]',
          onLight
            ? 'bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(0,0,0,0.28)_78%,rgba(0,0,0,0.5)_100%)]'
            : 'bg-[radial-gradient(ellipse_at_center,transparent_22%,rgba(0,0,0,0.35)_70%,rgba(0,0,0,0.62)_100%)]',
        )}
      />
      {/* Bottom fade so tiles sit clear of busy hero art */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[58%] bg-gradient-to-t to-transparent',
          onLight ? 'from-black/45 via-black/20' : 'from-black/75 via-black/40',
        )}
      />
      <div className="relative z-10">
        <div className="px-6">
          <span
            className={cn(
              'inline-flex h-5 items-center rounded-full px-1.5 text-xs font-medium',
              onLight ? 'bg-[#22c55e] text-white' : 'bg-[#edc555] text-black',
            )}
          >
            {badge}
          </span>
          <Typography
            as="h2"
            shape="h2"
            weight="semibold"
            className={cn(
              'mt-2 text-[36px] leading-10',
              onLight ? 'text-foreground' : 'text-white',
            )}
          >
            {title}
          </Typography>
          <p
            className={cn(
              'mt-2 max-w-[572px] text-xs leading-4',
              onLight ? 'text-foreground/80' : 'text-white',
            )}
          >
            {body}
          </p>
        </div>
        <Carousel opts={{ align: 'start', dragFree: true }} className="mt-6 w-full">
          {/* Solid white chrome — glass washes out on moon glow / bright sky */}
          <div className="px-6">
            <ShelfHeader onLight />
          </div>
          <GameRail
            games={games}
            tileClassName="shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
          />
        </Carousel>
      </div>
    </section>
  )
}

/** Same overlay arrows as lobby banner row — no See More. */
const PROVIDER_ARROW_CLASS = 'absolute top-1/2 z-10 size-8 -translate-y-1/2 rounded-full'

function CasinoProviderRow() {
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

  return (
    <section data-name="providers" aria-label="Provider" className="py-2">
      <div className="mb-3 px-6">
        <Typography as="h3" shape="h4" weight="semibold" className="min-w-0 truncate">
          Provider
        </Typography>
      </div>
      <Carousel
        setApi={setApi}
        opts={{ align: 'start', dragFree: true }}
        className="relative w-full"
      >
        <CarouselContent className="!ml-0 gap-3">
          {PROVIDERS.map((provider) => (
            <CarouselItem key={provider.id} className="basis-auto pl-0 first:pl-6 last:pr-6">
              <button
                type="button"
                className="inline-flex min-w-[97px] items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-4 shadow-[0_0_16px_rgba(0,0,0,0.06)]"
              >
                <img src={provider.logo} alt="" className="size-5 object-contain" />
                <span className="text-xs font-medium text-foreground">{provider.name}</span>
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
        {canPrev ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={`${PROVIDER_ARROW_CLASS} left-3`}
            aria-label="Previous providers"
            onClick={() => api?.scrollPrev()}
          >
            <ChevronLeftIcon />
            <span className="sr-only">Previous providers</span>
          </Button>
        ) : null}
        {canNext ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={`${PROVIDER_ARROW_CLASS} right-3`}
            aria-label="Next providers"
            onClick={() => api?.scrollNext()}
          >
            <ChevronRightIcon />
            <span className="sr-only">Next providers</span>
          </Button>
        ) : null}
      </Carousel>
    </section>
  )
}

/** Figma VIP Jackpots (Block) — tier bar + 2×8 grid. */
function CasinoJackpots() {
  const [tier, setTier] = useState<(typeof JACKPOT_TIERS)[number]['id']>('must')
  const gridGames = Array.from({ length: 16 }, (_, i) => {
    const game = JACKPOT_GAMES[i % JACKPOT_GAMES.length]!
    return { ...game, id: `${game.id}-grid-${i}` }
  })

  return (
    <section data-name="vip-jackpots" aria-label="VIP Jackpots (Block)" className="px-6 py-2">
      <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
        <ShelfHeader title="VIP Jackpots" titleSuffix=" (Block)" hideArrows />
        <JackpotTierBar activeId={tier} onSelect={setTier} />
        <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
          {gridGames.map((game) => (
            <CasinoGameTile key={game.id} game={game} />
          ))}
        </div>
      </Carousel>
    </section>
  )
}

/** Lumen `vip-rewards/crown` path — same geometry as `/shell/figma/ubc/crown.svg`. */
const VIP_CROWN_PATH =
  'M4.7063 17.875C4.24606 17.875 3.87297 17.5019 3.87297 17.0417V16.9583C3.87297 16.4981 4.24606 16.125 4.7063 16.125H15.2896C15.7499 16.125 16.123 16.4981 16.123 16.9583V17.0417C16.123 17.5019 15.7499 17.875 15.2896 17.875H4.7063ZM4.58435 14.8125C4.17459 14.8125 3.82564 14.5146 3.76134 14.1099L2.75734 7.79062C2.72817 7.79062 2.69536 7.79427 2.6589 7.80156C2.62244 7.80885 2.58963 7.8125 2.56047 7.8125C2.19588 7.8125 1.88599 7.6849 1.63078 7.42969C1.37557 7.17448 1.24797 6.86458 1.24797 6.5C1.24797 6.13542 1.37557 5.82552 1.63078 5.57031C1.88599 5.3151 2.19588 5.1875 2.56047 5.1875C2.92505 5.1875 3.23494 5.3151 3.49015 5.57031C3.74536 5.82552 3.87297 6.13542 3.87297 6.5C3.87297 6.60208 3.86203 6.69687 3.84015 6.78437C3.81828 6.87187 3.79276 6.95208 3.76359 7.025L6.19023 8.11213C6.36969 8.19253 6.58092 8.13652 6.69696 7.97777L9.23234 4.50937C9.07192 4.39271 8.94067 4.23958 8.83859 4.05C8.73651 3.86042 8.68546 3.65625 8.68546 3.4375C8.68546 3.07292 8.81307 2.76302 9.06828 2.50781C9.32349 2.2526 9.63338 2.125 9.99797 2.125C10.3625 2.125 10.6724 2.2526 10.9277 2.50781C11.1829 2.76302 11.3105 3.07292 11.3105 3.4375C11.3105 3.65625 11.2594 3.86042 11.1573 4.05C11.0553 4.23958 10.924 4.39271 10.7636 4.50937L13.299 7.97777C13.415 8.13652 13.6262 8.19253 13.8057 8.11213L16.2323 7.025C16.2032 6.95208 16.1777 6.87187 16.1558 6.78437C16.1339 6.69687 16.123 6.60208 16.123 6.5C16.123 6.13542 16.2506 5.82552 16.5058 5.57031C16.761 5.3151 17.0709 5.1875 17.4355 5.1875C17.8 5.1875 18.1099 5.3151 18.3652 5.57031C18.6204 5.82552 18.748 6.13542 18.748 6.5C18.748 6.86458 18.6204 7.17448 18.3652 7.42969C18.1099 7.6849 17.8 7.8125 17.4355 7.8125C17.4063 7.8125 17.3735 7.80885 17.337 7.80156C17.3006 7.79427 17.2678 7.79062 17.2386 7.79062L16.2346 14.1099C16.1703 14.5146 15.8213 14.8125 15.4116 14.8125H4.58435Z'

function Crown({ tone }: { tone: 'gold' | 'purple' | 'silver' | 'none' }) {
  if (tone === 'none') return <span className="size-3.5 shrink-0" aria-hidden />
  const fill = tone === 'gold' ? '#E39E3D' : tone === 'purple' ? '#A855F7' : '#94A3B8'
  return (
    <svg viewBox="0 0 20 20" className="size-3.5 shrink-0" aria-hidden>
      <path fill={fill} d={VIP_CROWN_PATH} />
    </svg>
  )
}

const ACTIVITY_FILTERS = [
  { id: 'all', label: 'All Bets' },
  { id: 'jackpot', label: 'Jackpot Winners' },
  { id: 'races', label: '25k Daily Races' },
] as const

/** Same sliding pill track as casino `sub-menu` (nav-menu-solid). */
function ActivityFilterTrack({
  active,
  onChange,
}: {
  active: (typeof ACTIVITY_FILTERS)[number]['id']
  onChange: (id: (typeof ACTIVITY_FILTERS)[number]['id']) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState({ x: 0, w: 0, ready: false })

  const measureThumb = useCallback(() => {
    const track = trackRef.current
    const btn = track?.querySelector<HTMLElement>('[data-sub-menu-pill][data-active="true"]')
    if (!track || !btn) return
    setThumb({ x: btn.offsetLeft, w: btn.offsetWidth, ready: true })
  }, [])

  useLayoutEffect(() => {
    measureThumb()
    const track = trackRef.current
    if (!track) return
    const ro = new ResizeObserver(measureThumb)
    ro.observe(track)
    return () => ro.disconnect()
  }, [active, measureThumb])

  return (
    <div data-name="sub-menu-table-activity" className="mb-3">
      <div
        ref={trackRef}
        data-name="sub-menu-pill-track"
        className="scrollbar-hide relative flex h-12 w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full p-0.5"
        role="tablist"
        aria-label="Activity filters"
      >
        <span
          aria-hidden
          data-sub-menu-thumb=""
          className="pointer-events-none absolute top-0.5 h-11 rounded-full bg-primary transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ left: thumb.x, width: thumb.w, opacity: thumb.ready ? 1 : 0 }}
        />
        {ACTIVITY_FILTERS.map((item) => {
          const on = item.id === active
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={on}
              data-sub-menu-pill=""
              data-active={on ? 'true' : 'false'}
              onClick={() => onChange(item.id)}
              className="relative z-10 h-11 shrink-0 rounded-full bg-transparent px-4 text-sm font-normal leading-5 transition-colors duration-300"
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

type ActivityFeedRow = (typeof ACTIVITY_ROWS)[number] & { id: string }

const ACTIVITY_VISIBLE = 6
const ACTIVITY_ROW_H = '3.5rem'
const ACTIVITY_EASE = [0.22, 1, 0.36, 1] as const

function seedActivityRows(): ActivityFeedRow[] {
  return ACTIVITY_ROWS.slice(0, ACTIVITY_VISIBLE).map((row, i) => ({
    ...row,
    id: `seed-${i}`,
  }))
}

/** Match bol-seven: Framer layout + popLayout — new row slides in, others push down. */
function CasinoActivity() {
  const [filter, setFilter] = useState<(typeof ACTIVITY_FILTERS)[number]['id']>('all')
  const [playing, setPlaying] = useState(true)
  const [rows, setRows] = useState<ActivityFeedRow[]>(seedActivityRows)
  const [launchingId, setLaunchingId] = useState<string | null>(null)
  const seqRef = useRef(0)
  const launchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!playing || filter !== 'all') return
    const tick = window.setInterval(() => {
      seqRef.current += 1
      const template = ACTIVITY_ROWS[seqRef.current % ACTIVITY_ROWS.length]!
      setRows((prev) =>
        [{ ...template, id: `live-${seqRef.current}-${Date.now()}` }, ...prev].slice(0, ACTIVITY_VISIBLE),
      )
    }, 2500)
    return () => window.clearInterval(tick)
  }, [playing, filter])

  useEffect(() => {
    return () => {
      if (launchTimer.current) clearTimeout(launchTimer.current)
    }
  }, [])

  const launchGame = (row: ActivityFeedRow) => {
    if (launchingId) return
    setLaunchingId(row.id)
    if (launchTimer.current) clearTimeout(launchTimer.current)
    launchTimer.current = setTimeout(() => setLaunchingId(null), 2200)
  }

  return (
    <section data-name="Activity" aria-label="Activity" className="px-6 py-6">
      <Typography as="h3" shape="h4" weight="semibold" className="mb-2.5">
        Activity
      </Typography>
      <div data-name="sub-menu">
        <ActivityFilterTrack active={filter} onChange={setFilter} />
      </div>
      {filter === 'all' ? (
        <div
          data-name="Casino activity"
          className="overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]"
        >
          <div className="flex h-[42px] items-center border-b border-border bg-surface-muted-1 text-sm font-medium text-muted-foreground">
            {['User', 'Game', 'Bet Amount', 'Multiplier'].map((head) => (
              <div key={head} className="min-w-0 flex-1 px-3">
                {head}
              </div>
            ))}
            <div className="flex min-w-0 flex-1 items-center">
              <span className="min-w-0 flex-1 px-3">Payout</span>
              <div className="px-3">
                <button
                  type="button"
                  data-name="Toggle"
                  aria-label={playing ? 'Pause live feed' : 'Resume live feed'}
                  aria-pressed={playing}
                  onClick={() => setPlaying((v) => !v)}
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-secondary text-foreground transition-colors hover:bg-muted"
                >
                  {playing ? (
                    <PauseIcon className="size-3.5" strokeWidth={2} />
                  ) : (
                    <PlayIcon className="size-3.5" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden" style={{ height: `calc(${ACTIVITY_VISIBLE} * ${ACTIVITY_ROW_H})` }}>
            <AnimatePresence initial={false} mode="popLayout">
              {rows.map((row) => {
                const launching = launchingId === row.id
                return (
                  <motion.div
                    key={row.id}
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12, transition: { duration: 0.18 } }}
                    transition={{
                      duration: 0.25,
                      ease: ACTIVITY_EASE,
                      layout: { duration: 0.25, ease: ACTIVITY_EASE },
                    }}
                    className="flex h-14 items-center border-b border-border text-sm transition-colors last:border-b-0 hover:bg-surface-muted-1"
                  >
                    <div className="min-w-0 flex-1 px-3">
                      <span className="inline-flex items-center gap-1">
                        <Crown tone={row.crown} />
                        {row.user}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 px-3">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <button
                            type="button"
                            onClick={() => launchGame(row)}
                            disabled={!!launchingId && !launching}
                            aria-busy={launching}
                            aria-label={`Play ${row.game}`}
                            className={cn(
                              'inline-flex max-w-full items-center gap-2 rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-left transition-colors',
                              'hover:border-border hover:bg-card hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                              launching && 'border-border bg-card',
                            )}
                          >
                            <span className="relative size-[22px] shrink-0 overflow-hidden rounded-[3px]">
                              <img
                                src="/games/originals/plinko.png"
                                alt=""
                                className={cn(
                                  'size-[22px] object-cover transition-opacity',
                                  launching && 'opacity-40',
                                )}
                              />
                              {launching ? (
                                <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                                  <span className="size-3 animate-spin rounded-full border-[1.5px] border-white/30 border-t-white" />
                                </span>
                              ) : null}
                            </span>
                            <span className="min-w-0 truncate font-medium">{row.game}</span>
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent side="top" className="w-[260px] p-0">
                          <div className="overflow-hidden rounded-[10px]">
                            <div className="relative h-[120px] bg-surface-muted-2">
                              <img
                                src="/games/originals/plinko.png"
                                alt=""
                                className="size-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                              <p className="absolute inset-x-3 bottom-2 truncate text-sm font-semibold text-white">
                                {row.game}
                              </p>
                            </div>
                            <div className="flex flex-col gap-3 p-3">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="rounded-md bg-surface-muted-1 px-2 py-1.5">
                                  <p className="text-muted-foreground">Bet</p>
                                  <p className="font-medium text-foreground">{row.bet}</p>
                                </div>
                                <div className="rounded-md bg-surface-muted-1 px-2 py-1.5">
                                  <p className="text-muted-foreground">Payout</p>
                                  <p className={cn('font-medium', row.win ? 'text-success' : 'text-foreground')}>
                                    {row.payout}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                className="relative w-full justify-center"
                                disabled={!!launchingId && !launching}
                                aria-busy={launching}
                                onClick={() => launchGame(row)}
                              >
                                <span className={cn(launching && 'invisible')}>Play {row.game}</span>
                                {launching ? (
                                  <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                                  </span>
                                ) : null}
                              </Button>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                    <div className="min-w-0 flex-1 px-3">{row.bet}</div>
                    <div className="min-w-0 flex-1 px-3">{row.multi}</div>
                    <div className={cn('min-w-0 flex-1 px-3', row.win ? 'text-success' : 'text-foreground')}>
                      {row.payout}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="rounded-[10px] border border-border bg-card px-4 py-8 text-sm text-muted-foreground shadow-[0_0_16px_rgba(0,0,0,0.06)]">
          {filter === 'jackpot'
            ? 'Jackpot winners appear here as they land.'
            : 'Daily race standings update as wagers settle.'}
        </div>
      )}
    </section>
  )
}

/** Casino-Lumen 69:47911 lobby — banners through activity. Shell owns sub-nav + SEO. */
export function CasinoLobby() {
  return (
    <div data-name="lobby_content" className="w-full bg-background pb-8">
      <div className="py-4">
        <CasinoLobbyBannerRow promos={CASINO_LOBBY_PROMO_BANNERS} />
      </div>
      <CasinoGameShelf title="Continue Playing" games={CONTINUE_PLAYING} showPlayRandom />
      <CasinoGameShelf title="Originals" games={ORIGINALS_GAMES} />
      <CasinoTop10 games={TOP10_GAMES} />
      <CasinoGameShelf title="New Games" games={NEW_GAMES} />
      <CasinoGameShelf title="Live Casino" games={LIVE_GAMES} />
      <CasinoProviderRow />
      <CasinoActivity />
      <CasinoGameShelf title="Popular" games={POPULAR_GAMES} />
      <CasinoThemeBanner {...HALLOWEEN_PROMO} />
      <CasinoGameShelf title="Exclusives" games={EXCLUSIVE_GAMES} />
      <CasinoGameShelf title="Halloween Games" games={HALLOWEEN_GAMES} />
      <CasinoGameShelf title="Slots" games={SLOTS_GAMES} />
      <CasinoThemeBanner {...CHRISTMAS_PROMO} />
      <CasinoJackpots />
    </div>
  )
}
