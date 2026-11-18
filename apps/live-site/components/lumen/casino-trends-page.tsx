'use client'

import { useMemo, useState } from 'react'
import { IconChevronLeft, IconChevronRight, IconLock } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from '@/components/ui/carousel'
import { Typography } from '@/components/ui/typography'
import {
  CASINO_TILE_H,
  CASINO_TILE_W,
  CasinoGameTile,
} from '@/components/lumen/casino-game-tile'
import {
  CasinoTop10Rank,
  CASINO_TOP10_SLOT_W,
  CASINO_TOP10_TEN_SLOT_W,
} from '@/components/lumen/casino-lobby-page'
import { CasinoTrendsMarkets } from '@/components/lumen/casino-trends-markets'
import { FilterSelectBox } from '@/components/lumen/filter-select-box'
import { useShell } from '@/components/site/shell-context'
import {
  TRENDS_PERIODS,
  formatPlays,
  formatTrend,
  myTrendsShelves,
  overallRanking,
  type TrendsPeriod,
  type TrendsScope,
} from '@/lib/lumen/casino-trends'
import { cn } from '@/lib/utils'

const CARD =
  'rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]'

const TRENDS_SCOPE_OPTIONS: { id: TrendsScope; label: string }[] = [
  { id: 'overall', label: 'Overall' },
  { id: 'mine', label: 'My Trends' },
]

function TrendsCarouselChrome({
  title,
  padded = true,
}: {
  title: string
  /** When false, parent already provides horizontal padding. */
  padded?: boolean
}) {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel()
  const arrowClass =
    'inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-secondary p-0 text-foreground transition-colors hover:bg-muted disabled:opacity-45'

  return (
    <header
      className={cn(
        'mb-1 flex min-h-9 items-center justify-between gap-3',
        padded && 'px-4 sm:px-6',
      )}
    >
      <Typography as="h2" shape="h4" weight="semibold" className="min-w-0 truncate text-base sm:text-lg">
        {title}
      </Typography>
      {/* Desktop arrows only — mobile swipe. */}
      <div className="hidden items-center gap-1 md:flex">
        <button
          type="button"
          aria-label="Previous"
          className={arrowClass}
          disabled={!canScrollPrev}
          onClick={scrollPrev}
        >
          <IconChevronLeft className="size-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-label="Next"
          className={arrowClass}
          disabled={!canScrollNext}
          onClick={scrollNext}
        >
          <IconChevronRight className="size-4" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  )
}

/** Top 10 Netflix carousel — lobby Top 10 pattern + plays / trend meta. */
function OverallTop10Carousel({
  period,
  onLaunch,
}: {
  period: TrendsPeriod
  onLaunch: ReturnType<typeof useShell>['launchGame']
}) {
  const rows = useMemo(() => overallRanking(period), [period])
  const total = rows.reduce((s, r) => s + r.plays, 0)
  const periodLabel =
    TRENDS_PERIODS.find((p) => p.id === period)?.short ?? 'today'
  const title = `The ${rows.length} most played games ${periodLabel} · ${formatPlays(total)} rounds`

  return (
    <section data-name="trends-top-10" aria-label="Top 10" className="py-2">
      <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
        <TrendsCarouselChrome title={title} />
        <CarouselContent className="!ml-0 gap-4 py-5">
          {rows.map((row, i) => {
            const rank = i + 1
            const isWide = rank >= 10
            const slotW = isWide ? CASINO_TOP10_TEN_SLOT_W : CASINO_TOP10_SLOT_W
            return (
              <CarouselItem
                key={row.game.id}
                className="basis-auto pl-0 first:pl-4 last:pr-4 sm:first:pl-6 sm:last:pr-6"
              >
                <div className="flex flex-col" style={{ width: slotW }}>
                  <div
                    data-name="trends-rank-tile"
                    className="relative shrink-0 overflow-visible"
                    style={{ height: CASINO_TILE_H, width: slotW }}
                  >
                    <CasinoTop10Rank rank={rank} />
                    <CasinoGameTile
                      game={row.game}
                      dense
                      hideTitle
                      onLaunch={onLaunch}
                      className={cn(
                        'absolute top-0 z-10 shadow-[0_4px_16px_rgba(0,0,0,0.35)]',
                        isWide ? 'left-[132px]' : 'left-[72px]',
                      )}
                    />
                  </div>
                  <div
                    className="mt-2 px-0.5"
                    style={{
                      marginLeft: isWide ? 132 : 72,
                      width: CASINO_TILE_W,
                    }}
                  >
                    <p className="truncate text-sm font-medium text-foreground">
                      {row.game.title}
                    </p>
                    <div className="mt-0.5 flex items-center justify-between gap-1 text-xs">
                      <span className="tabular-nums text-muted-foreground">
                        {formatPlays(row.plays, true)} plays
                      </span>
                      <span
                        className={cn(
                          'tabular-nums font-medium',
                          row.trend > 0
                            ? 'text-success'
                            : row.trend < 0
                              ? 'text-destructive'
                              : 'text-muted-foreground',
                        )}
                      >
                        {formatTrend(row.trend)}
                      </span>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
    </section>
  )
}

function MyTrendsBody({
  period,
  onLaunch,
}: {
  period: TrendsPeriod
  onLaunch: ReturnType<typeof useShell>['launchGame']
}) {
  const shelves = useMemo(() => myTrendsShelves(period), [period])

  return (
    <div className="flex flex-col gap-6" data-name="trends-my">
      {shelves.map((shelf) => (
        <section key={shelf.id} className="py-1">
          <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
            <div className="px-4 sm:px-6">
              <TrendsCarouselChrome title={shelf.title} padded={false} />
            </div>
            <CarouselContent className="!ml-0 gap-3 py-4">
              {shelf.rows.map((row) => (
                <CarouselItem
                  key={`${shelf.id}-${row.game.id}`}
                  className="basis-auto pl-0 first:pl-4 last:pr-4 sm:first:pl-6 sm:last:pr-6"
                >
                  <div
                    className="flex w-[152px] shrink-0 flex-col"
                    style={{ minHeight: CASINO_TILE_H + 56 }}
                  >
                    <CasinoGameTile game={row.game} onLaunch={onLaunch} hideTitle />
                    <p className="mt-2 truncate text-sm font-medium text-foreground">
                      {row.game.title}
                    </p>
                    <p className="text-xs tabular-nums text-foreground">{row.stat}</p>
                    <div className="mt-0.5 flex items-center justify-between gap-1 text-[11px]">
                      <span className="truncate text-muted-foreground">{row.detail}</span>
                      <span
                        className={cn(
                          'shrink-0 tabular-nums font-medium',
                          row.trend > 0
                            ? 'text-success'
                            : row.trend < 0
                              ? 'text-destructive'
                              : 'text-muted-foreground',
                        )}
                      >
                        {formatTrend(row.trend)}
                      </span>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </section>
      ))}
    </div>
  )
}

function MyTrendsGate({ onLogin }: { onLogin: () => void }) {
  return (
    <div
      className={cn(CARD, 'mx-4 flex flex-col items-center px-6 py-12 text-center sm:mx-6')}
      data-name="trends-login-gate"
    >
      <span className="mb-4 flex size-12 items-center justify-center rounded-full border border-border bg-popover">
        <IconLock className="size-5 text-muted-foreground" aria-hidden />
      </span>
      <Typography as="h2" shape="h4" weight="semibold" className="text-base sm:text-lg">
        Your trends
      </Typography>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Log in to see games you win, lose, and play most.
      </p>
      <Button type="button" className="mt-6" onClick={onLogin}>
        Log in
      </Button>
    </div>
  )
}

/** Casino Trends — Top 10 carousel + personal shelves when logged in. */
export function CasinoTrendsLobby() {
  const { launchGame, loggedIn, openAuth } = useShell()
  const [scope, setScope] = useState<TrendsScope>('overall')
  const [period, setPeriod] = useState<TrendsPeriod>('today')

  return (
    <div data-name="trends_content" className="w-full bg-background pb-10 pt-4">
      <header className="mb-4 px-4 sm:mb-5 sm:px-6">
        <Typography
          as="h1"
          shape="h3"
          weight="semibold"
          className="text-xl tracking-tight sm:text-2xl"
        >
          Trends
        </Typography>
        <div
          data-name="sort-&-filters"
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <FilterSelectBox
            label="View"
            value={scope}
            options={TRENDS_SCOPE_OPTIONS}
            onChange={setScope}
            triggerClassName="w-[148px]"
          />
          <FilterSelectBox
            label="Period"
            value={period}
            options={TRENDS_PERIODS.map((o) => ({ id: o.id, label: o.label }))}
            onChange={setPeriod}
            triggerClassName="w-[156px]"
          />
        </div>
      </header>

      {scope === 'overall' ? (
        <div className="flex flex-col gap-8">
          {/* Live step charts first — Top 10 carousel below. */}
          <CasinoTrendsMarkets period={period} />
          <OverallTop10Carousel period={period} onLaunch={launchGame} />
        </div>
      ) : loggedIn ? (
        <MyTrendsBody period={period} onLaunch={launchGame} />
      ) : (
        <MyTrendsGate onLogin={() => openAuth('login')} />
      )}
    </div>
  )
}
