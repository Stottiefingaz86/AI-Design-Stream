'use client'

import { useCallback, useLayoutEffect, useMemo, useRef, useState, type Ref } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconChevronRight } from '@tabler/icons-react'
import { LIVE_ROW_STYLE } from '@/components/lumen/soccer-sport-page'
import {
  HorizontalRail,
  LaunchOverlay,
  LiveClock,
  ShelfTitle,
  useCardMotion,
  useLaunch,
} from '@/components/lumen/sports-home-page'
import { ShellIcon, type ShellIconName } from '@/components/site/shell-icons'
import {
  ChangeChip,
  LineChart,
  LineSwatch,
  MARKET_CARD,
  OutcomeTilesRail,
  PriceButton,
  RangeTabs,
  Sparkline,
  TeamMark,
  fmtChance,
  fmtMultiplier,
  fmtVolume,
  outcomeColor,
  outcomeDash,
} from '@/components/lumen/markets/market-ui'
import { revealShellDock } from '@/components/site/shell-scroll'
import { useShell } from '@/components/site/shell-context'
import { setSoccerSlip, useSoccerSlip, withOneLegPerMarket } from '@/lib/lumen/soccer-slip-store'
import {
  MARKET_CATEGORY_FILTERS,
  marketEvent,
  marketSeries,
  marketShelfItems,
  marketToSlipPick,
  type ChartRange,
  type MarketCategory,
  type MarketOutcome,
  type MarketSport,
  type SportsMarket,
} from '@/lib/lumen/sports-markets'
import { flyBetDotToSlip } from '@/lib/lumen/vip-celebrate'
import { cn } from '@/lib/utils'

const QUESTION_LIMIT = 10
/** Keep featured footprint stable across sparse categories (Entertainment / Politics). */
const MARKETS_PAIR_MIN_H = 'min-h-[440px]'
const MOVERS_TAB_H = 41
const MOVERS_ROW_H = 52
const MOVERS_MIN = 4
const MOVERS_MAX = 20

type CategoryFilter = MarketCategory | 'all'

/** How many side rows fill the featured card height. */
function useMoversFitCount(anchor: React.RefObject<HTMLElement | null>, deps: unknown[]) {
  const [count, setCount] = useState(8)
  useLayoutEffect(() => {
    const el = anchor.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const sync = () => {
      const h = el.getBoundingClientRect().height
      if (h < 80) return
      const n = Math.ceil((h - MOVERS_TAB_H) / MOVERS_ROW_H)
      setCount(Math.min(MOVERS_MAX, Math.max(MOVERS_MIN, n)))
    }
    sync()
    const raf = window.requestAnimationFrame(sync)
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => {
      window.cancelAnimationFrame(raf)
      ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps passed by caller (featured id / category)
  }, deps)
  return count
}

function useMarketBuy() {
  const picks = useSoccerSlip()
  const selectedIds = useMemo(() => new Set(picks.map((p) => p.id)), [picks])
  const buy = useCallback((market: SportsMarket, outcome: MarketOutcome, el?: HTMLElement | null) => {
    if (selectedIds.has(outcome.id)) {
      setSoccerSlip((prev) => prev.filter((p) => p.id !== outcome.id))
      return
    }
    const next = marketToSlipPick(market, outcome)
    setSoccerSlip((prev) => (next.outright ? [next, ...prev] : withOneLegPerMarket(prev, next)))
    revealShellDock()
    flyBetDotToSlip(el ?? null, next.id)
  }, [selectedIds])
  return { selectedIds, buy }
}

function lockedCategory(sport?: MarketSport): CategoryFilter | null {
  if (sport === 'nfl') return 'football'
  if (sport === 'soccer') return 'soccer'
  return null
}

function categoryIcon(category: MarketCategory): ShellIconName {
  if (category === 'football') return 'football'
  if (category === 'soccer') return 'soccer'
  if (category === 'entertainment') return 'entertainment'
  return 'politics'
}

/**
 * One main featured card (event-view Who wins? bets) + side list.
 * Click header → event for more markets.
 */
export function HomeMarketsShelf({ sport }: { sport?: MarketSport } = {}) {
  const router = useRouter()
  const { startNavigating } = useShell()
  const { selectedIds, buy } = useMarketBuy()
  const locked = lockedCategory(sport)
  const [category, setCategory] = useState<CategoryFilter>(locked ?? 'all')
  const featuredRef = useRef<HTMLElement | null>(null)

  const shelf = useMemo(() => {
    const all = marketShelfItems()
    const cat = locked ?? category
    if (cat === 'all') return all
    return all.filter((m) => m.category === cat)
  }, [category, locked])

  const featured = useMemo(
    () =>
      [...shelf].sort((a, b) => Number(b.live) - Number(a.live) || b.volume - a.volume)[0],
    [shelf],
  )
  const moversLimit = useMoversFitCount(featuredRef, [featured?.id, category])
  const questions = useMemo(() => {
    const skip = new Set(featured?.id ? [featured.id] : [])
    const fromGames = shelf.flatMap((g) =>
      g.eventId ? (marketEvent(g.sport, g.eventId)?.lines ?? []) : g.kind === 'line' ? [g] : [],
    )
    const fromTopics = shelf.filter((m) => m.kind === 'future' && !m.eventId)
    return [...fromGames, ...fromTopics]
      .filter((m) => !skip.has(m.id))
      .sort((a, b) => Number(b.live) - Number(a.live) || b.volume - a.volume)
      .slice(0, QUESTION_LIMIT)
  }, [shelf, featured])
  const go = (href: string) => {
    if (!href) return
    startNavigating(href)
    router.push(href)
  }

  const padded = !sport

  return (
    <section data-name="home-markets" className={cn('min-w-0', sport ? 'mb-6 mt-2' : 'mt-8')}>
      <div className={padded ? 'px-4 md:px-6' : undefined}>
        <ShelfTitle icon="trends" title="Markets" />
      </div>
      {/* Full-width scroll track (like Popular / sports sub-nav) — never nest inside pad-only clip. */}
      {!locked ? (
        <MarketCategoryPills
          value={category}
          onChange={setCategory}
          className={padded ? 'px-4 md:px-6' : undefined}
        />
      ) : null}
      <div className={cn('min-w-0', padded && 'px-4 md:px-6')}>
        <div className="grid min-w-0 items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
          {featured ? (
            <FeaturedMarket
              ref={featuredRef}
              market={featured}
              selectedIds={selectedIds}
              onBuy={buy}
              onOpen={() => go(featured.href)}
            />
          ) : (
            <div
              ref={(node) => {
                featuredRef.current = node
              }}
              data-name="market-featured-empty"
              className={cn(
                MARKET_CARD,
                MARKETS_PAIR_MIN_H,
                'flex h-full items-center justify-center px-6 text-sm text-muted-foreground',
              )}
            >
              No markets in this category yet.
            </div>
          )}
          <MoversPanel
            className="hidden lg:flex"
            games={shelf}
            limit={moversLimit}
            selectedIds={selectedIds}
            onPick={(m, o, el) => buy(m, o, el)}
          />
        </div>
      </div>

      {questions.length ? (
        <div className={cn('mt-4 min-w-0', sport && '-mx-4 md:-mx-6')}>
          <HorizontalRail label="Market questions">
            {questions.map((m) => (
              <QuestionCard
                key={m.id}
                market={m}
                selectedIds={selectedIds}
                onBuy={(o, el) => buy(m, o, el)}
                onOpen={() => go(m.href)}
              />
            ))}
          </HorizontalRail>
        </div>
      ) : null}
    </section>
  )
}

function MarketCategoryPills({
  value,
  onChange,
  className,
}: {
  value: CategoryFilter
  onChange: (next: CategoryFilter) => void
  className?: string
}) {
  return (
    <div
      data-name="market-category-pills"
      role="tablist"
      aria-label="Filter markets by category"
      className={cn(
        'scrollbar-hide mb-3 flex w-full min-w-0 max-w-full gap-1 overflow-x-auto overscroll-x-contain',
        className,
      )}
    >
      {MARKET_CATEGORY_FILTERS.map((item) => {
        const on = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(item.id)}
            className={cn(
              'inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-sm transition-colors',
              on
                ? 'bg-secondary font-medium text-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {item.icon ? <ShellIcon name={item.icon} tone="token" className="size-4" /> : null}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

function MarketMark({ market, outcome }: { market: SportsMarket; outcome: MarketOutcome }) {
  if (outcome.team) return <TeamMark outcome={outcome} />
  return (
    <span
      className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground"
      aria-hidden
    >
      <ShellIcon name={categoryIcon(market.category)} tone="token" className="size-3.5" />
    </span>
  )
}

function MarketMeta({ market, className }: { market: SportsMarket; className?: string }) {
  const topic = market.category === 'entertainment' || market.category === 'politics'
  return (
    <div className={cn('flex w-full items-center gap-1.5 text-xs', className)}>
      {topic ? (
        <ShellIcon name={categoryIcon(market.category)} tone="token" className="size-3.5 shrink-0" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={market.leagueIcon} alt="" className="size-3.5 shrink-0 object-contain" />
      )}
      <span className="min-w-0 truncate text-muted-foreground">{market.leagueName}</span>
      {market.live ? (
        <LiveClock when={market.when} />
      ) : (
        <span className="shrink-0 text-muted-foreground">{market.when}</span>
      )}
      <span className="ml-auto shrink-0 tabular-nums text-muted-foreground">
        {fmtVolume(market.volume)}
      </span>
    </div>
  )
}

function teamScore(market: SportsMarket, outcome: MarketOutcome): number | undefined {
  if (!market.score || !outcome.team) return undefined
  const teams = market.outcomes.filter((o) => o.team)
  const i = teams.indexOf(outcome)
  return i >= 0 ? market.score[i] : undefined
}

function chartLines(market: SportsMarket, series: number[][]) {
  return market.outcomes.map((o, i) => ({
    id: o.id,
    label: o.short,
    color: outcomeColor(o, market.outcomes),
    dash: outcomeDash(o, market.outcomes),
    values: series[i]!,
  }))
}

function slotOutcomes(market: SportsMarket): MarketOutcome[] {
  return market.outcomes.filter((o) => o.label !== 'Draw').slice(0, 2)
}

/**
 * Featured = event-view Who wins? tiles (not 3 market columns).
 * Card hover + selected outcome tile hover/active.
 */
function FeaturedMarket({
  market,
  selectedIds,
  onBuy,
  onOpen,
  ref,
}: {
  market: SportsMarket
  selectedIds: Set<string>
  onBuy: (m: SportsMarket, o: MarketOutcome, el: HTMLElement) => void
  onOpen: () => void
  ref?: Ref<HTMLElement>
}) {
  const [range, setRange] = useState<ChartRange>('1D')
  const canOpen = Boolean(market.href)
  const { loading, open } = useLaunch(onOpen)
  const series = useMemo(() => marketSeries(market, range), [market, range])
  const teams = market.outcomes.filter((o) => o.team)
  const lead = [...market.outcomes].sort((a, b) => b.chance - a.chance)[0]!
  const leadCopy =
    lead.label === 'Yes' || lead.label === 'No'
      ? lead.label
      : lead.label === 'Draw'
        ? 'Draw'
        : `${lead.short} win`
  const anySelected = market.outcomes.some((o) => selectedIds.has(o.id))

  return (
    <article
      ref={ref}
      data-name="market-featured"
      aria-busy={loading}
      style={market.live ? LIVE_ROW_STYLE : undefined}
      className={cn(
        MARKET_CARD,
        MARKETS_PAIR_MIN_H,
        'relative flex h-full min-w-0 flex-col overflow-hidden transition-[border-color,box-shadow] duration-150',
        'hover:border-foreground/15 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]',
        anySelected && 'border-foreground/20',
      )}
    >
      {loading ? <LaunchOverlay /> : null}
      <div className="flex flex-col gap-3 p-4">
        <button
          type="button"
          onClick={canOpen ? open : undefined}
          disabled={!canOpen}
          className={cn(
            'group -m-1 flex items-start gap-2 rounded-lg p-1 text-left',
            canOpen && 'transition-colors hover:bg-accent',
            !canOpen && 'cursor-default',
          )}
        >
          <div className="min-w-0 flex-1">
            <MarketMeta market={market} />
            {teams.length ? (
              <div className="mt-2 flex flex-col gap-1">
                {teams.map((o) => (
                  <div key={o.id} className="flex items-center gap-2">
                    <TeamMark outcome={o} />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold leading-5 text-foreground">
                      {o.label}
                    </span>
                    {market.score ? (
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {teamScore(market, o)}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-foreground">
                {market.title}
              </h3>
            )}
          </div>
          {canOpen ? (
            <IconChevronRight
              className="mt-5 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
              stroke={1.5}
            />
          ) : null}
        </button>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {fmtChance(lead.chance)}
          </span>
          <span className="text-xs text-muted-foreground">{leadCopy}</span>
          <ChangeChip value={lead.change} />
        </div>

        <div className="flex flex-col gap-2">
          <LineChart height={112} lines={chartLines(market, series)} />
          <div className="flex flex-wrap items-center gap-2">
            <RangeTabs value={range} onChange={setRange} />
            <span className="ml-auto text-xs tabular-nums text-muted-foreground">
              {fmtVolume(market.volume)}
            </span>
          </div>
        </div>

        <OutcomeTilesRail label={`${market.eventLabel} outcomes`} count={market.outcomes.length}>
          {market.outcomes.map((o) => {
            const on = selectedIds.has(o.id)
            return (
              <li
                key={o.id}
                className={cn(
                  'flex flex-col gap-3 rounded-lg border p-3.5 transition-[border-color,background-color] duration-150',
                  on
                    ? 'border-primary bg-accent'
                    : 'border-border bg-secondary/30 hover:border-foreground/20 hover:bg-accent/70',
                )}
              >
                <div className="flex items-center gap-2.5">
                  <LineSwatch
                    color={outcomeColor(o, market.outcomes)}
                    dash={outcomeDash(o, market.outcomes)}
                  />
                  <TeamMark outcome={o} />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                    {o.label}
                  </span>
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xl font-bold tabular-nums text-foreground">
                      {fmtChance(o.chance)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {fmtMultiplier(o.price)}
                      </span>
                      <ChangeChip value={o.change} className="h-4 px-0" />
                    </span>
                  </div>
                  <PriceButton
                    outcome={o}
                    selected={on}
                    onSelect={(out, el) => onBuy(market, out, el)}
                    className="h-10 min-w-[64px]"
                  />
                </div>
              </li>
            )
          })}
        </OutcomeTilesRail>
      </div>
    </article>
  )
}

function QuestionCard({
  market,
  selectedIds,
  onBuy,
  onOpen,
}: {
  market: SportsMarket
  selectedIds: Set<string>
  onBuy: (o: MarketOutcome, el: HTMLElement) => void
  onOpen: () => void
}) {
  const motionProps = useCardMotion()
  const { loading, open } = useLaunch(onOpen)
  const yes = market.outcomes[0]!
  const spark = useMemo(() => marketSeries(market, '1D', 32)[0]!, [market])
  const outs = slotOutcomes(market)
  return (
    <motion.article
      data-name="market-question-card"
      aria-busy={loading}
      {...motionProps}
      style={market.live ? LIVE_ROW_STYLE : undefined}
      className={cn(
        MARKET_CARD,
        'relative z-0 flex h-[200px] w-[280px] shrink-0 flex-col gap-2.5 overflow-hidden p-3.5 motion-reduce:!transform-none',
      )}
    >
      <button
        type="button"
        onClick={open}
        aria-label={`Open ${market.eventLabel}`}
        className="absolute inset-0 z-0 rounded-[10px]"
      />
      {loading ? <LaunchOverlay /> : null}
      <MarketMeta market={market} className="pointer-events-none relative" />
      <div className="pointer-events-none relative min-w-0">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-foreground">
          {market.title}
        </h3>
      </div>
      <div className="pointer-events-none relative flex items-end gap-2">
        <div className="flex flex-col">
          <span className="text-lg font-bold tabular-nums leading-6 text-foreground">
            {fmtChance(yes.chance)}
          </span>
          <ChangeChip value={yes.change} className="h-4 px-0" />
        </div>
        <Sparkline values={spark} color="var(--foreground)" className="h-7 flex-1" />
      </div>
      <div className="relative mt-auto grid grid-cols-2 gap-1.5">
        {outs.map((o) => (
          <PriceButton
            key={o.id}
            outcome={o}
            label={o.short}
            selected={selectedIds.has(o.id)}
            onSelect={(out, el) => onBuy(out, el)}
            className="h-9 min-w-0"
          />
        ))}
      </div>
    </motion.article>
  )
}

type MoverTab = 'movers' | 'volume' | 'live'

const MOVER_TABS: { id: MoverTab; label: string }[] = [
  { id: 'movers', label: 'Movers' },
  { id: 'volume', label: 'Volume' },
  { id: 'live', label: 'Live' },
]

type SideRow = { market: SportsMarket; outcome: MarketOutcome }

function sidePrimary(market: SportsMarket, outcome: MarketOutcome): string {
  if (outcome.label === 'Yes' || outcome.label === 'No') {
    return `${outcome.label} · ${market.title}`
  }
  return outcome.label
}

function sideSecondary(market: SportsMarket, tab: MoverTab): string {
  if (tab === 'volume') return fmtVolume(market.volume)
  if (market.category === 'entertainment' || market.category === 'politics') {
    return market.leagueName
  }
  return market.eventLabel
}

function MoversPanel({
  games,
  limit,
  onPick,
  selectedIds,
  className,
}: {
  games: SportsMarket[]
  /** Row count fitted to featured card height. */
  limit: number
  onPick: (m: SportsMarket, o: MarketOutcome, el: HTMLElement) => void
  selectedIds: Set<string>
  className?: string
}) {
  const [tab, setTab] = useState<MoverTab>('movers')

  const rows = useMemo((): SideRow[] => {
    const flat = games.flatMap((market) =>
      market.outcomes
        .filter((o) => o.label !== 'Draw')
        .map((outcome) => ({ market, outcome })),
    )
    if (tab === 'movers') {
      return [...flat]
        .sort((a, b) => Math.abs(b.outcome.change) - Math.abs(a.outcome.change))
        .slice(0, limit)
    }
    if (tab === 'volume') {
      return [...games]
        .sort((a, b) => b.volume - a.volume)
        .slice(0, limit)
        .map((market) => ({
          market,
          outcome: [...market.outcomes].sort((a, b) => b.chance - a.chance)[0]!,
        }))
    }
    return flat
      .filter(({ market }) => market.live)
      .sort((a, b) => b.market.volume - a.market.volume)
      .slice(0, limit)
  }, [games, tab, limit])

  return (
    <section
      data-name="market-movers"
      className={cn(MARKET_CARD, 'flex h-full min-h-0 w-full flex-col overflow-hidden', className)}
    >
      <div
        role="tablist"
        aria-label="Market side lists"
        className="flex shrink-0 items-center gap-0.5 border-b border-border bg-secondary/40 p-1"
      >
        {MOVER_TABS.map((t) => {
          const on = t.id === tab
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t.id)}
              className={cn(
                'h-8 min-w-0 flex-1 truncate rounded-md px-2 text-center text-xs font-medium transition-colors',
                on
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      <ul className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {rows.length === 0 ? (
          <li className="px-3 py-8 text-center text-xs text-muted-foreground">Nothing here yet.</li>
        ) : (
          rows.map(({ market, outcome }) => {
            const on = selectedIds.has(outcome.id)
            return (
              <li key={`${tab}-${outcome.id}`} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  onClick={(e) => onPick(market, outcome, e.currentTarget)}
                  aria-pressed={on}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-accent',
                    on && 'bg-accent',
                  )}
                >
                  <MarketMark market={market} outcome={outcome} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium leading-4 text-foreground">
                      {sidePrimary(market, outcome)}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {sideSecondary(market, tab)}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="text-xs font-semibold tabular-nums text-foreground">
                      {fmtChance(outcome.chance)}
                    </span>
                    {tab === 'movers' ? (
                      <ChangeChip value={outcome.change} className="h-3.5 px-0 text-[10px]" />
                    ) : (
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {fmtMultiplier(outcome.price)}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            )
          })
        )}
      </ul>
    </section>
  )
}
