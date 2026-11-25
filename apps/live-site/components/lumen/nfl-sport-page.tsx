'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  IconBallAmericanFootball,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconPlayerPlay,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { CasinoLiveWinsCarousel } from '@/components/lumen/casino-live-wins-carousel'
import { ShelfSeeMore } from '@/components/lumen/shelf-see-more'
import { SoccerBetslip, type SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import {
  SportBoostsShelf,
  SportMegaShelf,
  SportSgpShelf,
} from '@/components/lumen/sports-home-page'
import {
  BoardTeamBadge,
  BreadcrumbMenu,
  LeagueQuickLinks,
  LEAGUE_PREVIEW_ROWS,
  LIVE_ROW_STYLE,
  ModePillTrack,
  OutrightsBoard,
  ODDS_EDGE_ARROW,
  OddsButton,
} from '@/components/lumen/soccer-sport-page'
import { useShell } from '@/components/site/shell-context'
import { revealShellDock } from '@/components/site/shell-scroll'
import {
  FOOTBALL_LEAGUES,
  NFL_FUTURES,
  NFL_GAME_SECTIONS,
  nflBoardColumns,
  nflEventHref,
  nflEventLabel,
  type FootballLeague,
  type NflBoardColumn,
} from '@/lib/lumen/nfl-sport'
import { setSoccerSlip, useSoccerSlip, withOneLegPerMarket } from '@/lib/lumen/soccer-slip-store'
import type { SoccerEvent, SoccerLeagueSection, SoccerOdds } from '@/lib/lumen/soccer-sport'
import { rememberSportsReturn } from '@/lib/lumen/sports-return'
import { flyBetDotToSlip } from '@/lib/lumen/vip-celebrate'
import type { SoccerQuickLink } from '@/lib/lumen/soccer-sport'
import { cn } from '@/lib/utils'

const CARD = 'rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]'
const EVENT_ROW_H = 'h-[148px]'
const SCORE_COL_W = 'w-[min(42%,300px)]'

type Mode = 'games' | 'sgp' | 'boosts' | 'mega' | 'outrights' | 'leagues'
const MODES: { id: Mode; label: string }[] = [
  { id: 'games', label: 'Games' },
  { id: 'sgp', label: 'SGP' },
  { id: 'boosts', label: 'Odds Boosts' },
  { id: 'mega', label: 'Mega Parlays' },
  { id: 'outrights', label: 'Outrights' },
  { id: 'leagues', label: 'All Leagues' },
]
const LEAGUE_VIEW_MODES = MODES.filter((m) => m.id !== 'outrights')

const QUICK_LINKS = [
  { id: 'all', label: 'All Football', icon: '' },
  ...FOOTBALL_LEAGUES.map((l) => ({ id: l.id, label: l.short, icon: l.icon })),
]

type PickHandler = (pick: SoccerSlipPick, originEl?: HTMLElement | null) => void

function slipFor(event: SoccerEvent, pick: SoccerOdds, market: string): SoccerSlipPick {
  return {
    id: pick.id,
    label: pick.slipLabel ?? pick.label,
    odds: pick.odds,
    eventLabel: nflEventLabel(event),
    market,
    eventId: event.id,
    eventHref: nflEventHref(event.id),
    sport: 'nfl',
    live: !!event.live,
  }
}

export function NflSportPage({
  className,
  initialLeague = 'all',
  markets,
}: {
  className?: string
  initialLeague?: FootballLeague | 'all'
  /** V3 — sport-filtered Markets shelf under the boards. */
  markets?: ReactNode
}) {
  const router = useRouter()
  const { startNavigating } = useShell()
  const [mode, setMode] = useState<Mode>('games')
  const [league, setLeague] = useState<FootballLeague | 'all'>(initialLeague)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const slipPicks = useSoccerSlip()
  const selectedIds = useMemo(() => new Set(slipPicks.map((p) => p.id)), [slipPicks])
  const leagueView = league !== 'all'

  /* League filter can update via replaceState — remember the board path, not only pathname. */
  useEffect(() => {
    rememberSportsReturn(league === 'all' ? '/sports/football' : `/sports/football/${league}`)
  }, [league])
  const sections = NFL_GAME_SECTIONS.filter(
    (s) => s.events.length > 0 && (!leagueView || s.id === league),
  )
  const displayMode: Mode = leagueView && mode === 'outrights' ? 'games' : mode

  const addPick: PickHandler = (next, originEl) => {
    if (selectedIds.has(next.id)) {
      setSoccerSlip((prev) => prev.filter((p) => p.id !== next.id))
      return
    }
    setSoccerSlip((prev) => (next.outright ? [next, ...prev] : withOneLegPerMarket(prev, next)))
    revealShellDock()
    flyBetDotToSlip(originEl, next.id)
  }

  const go = (href: string) => {
    startNavigating(href)
    router.push(href)
  }

  /* League filter is local state; the URL follows so the sidebar (NFL / Football) stays in sync. */
  const enterLeague = (id: string) => {
    setLeague(id === 'all' ? 'all' : (id as FootballLeague))
    setMode('games')
    window.history.replaceState(
      null,
      '',
      id === 'all' ? '/sports/football' : `/sports/football/${id}`,
    )
  }

  const leagueName = FOOTBALL_LEAGUES.find((l) => l.id === league)?.name

  return (
    <div
      data-name={leagueView ? 'football-league-page' : 'football-sport-page'}
      className={cn('mx-auto w-full max-w-[1440px] px-4 py-4 md:px-6 md:py-6', className)}
    >
      <div data-name="breadcrumbs" className="mb-4 flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => (leagueView ? enterLeague('all') : go('/sports'))}
          aria-label={leagueView ? 'Back to football' : 'Back to sports home'}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary transition-colors hover:bg-accent"
        >
          <IconChevronLeft className="size-4" stroke={1.5} />
        </button>
        <div className="flex items-center gap-1.5 whitespace-nowrap text-sm leading-none">
          <span className="inline-flex h-7 shrink-0 items-center gap-1.5 font-medium text-foreground">
            <IconBallAmericanFootball className="size-4 shrink-0" stroke={1.5} />
            Football
          </span>
          <span className="inline-flex h-7 items-center text-muted-foreground/70" aria-hidden>
            /
          </span>
          <BreadcrumbMenu
            label={leagueName ?? 'Select League'}
            options={[
              { id: 'all', label: 'All Football' },
              ...FOOTBALL_LEAGUES.map((l) => ({ id: l.id, label: l.name })),
            ]}
            active={league}
            onPick={enterLeague}
            emphasize={leagueView}
          />
        </div>
      </div>

      <LeagueQuickLinks
        links={QUICK_LINKS}
        activeId={league}
        onPick={enterLeague}
        allIcon={<IconBallAmericanFootball className="size-6" stroke={1.5} />}
      />

      <ModePillTrack
        active={displayMode}
        onChange={setMode}
        modes={leagueView ? LEAGUE_VIEW_MODES : MODES}
        ariaLabel="Football views"
      />

      {displayMode === 'games'
        ? sections.map((section, i) => (
            <LeagueCard
              key={section.id}
              section={section}
              expanded={leagueView || i === 0 || !!expanded[section.id]}
              onToggleMore={() => setExpanded((s) => ({ ...s, [section.id]: !s[section.id] }))}
              onSeeAll={leagueView ? undefined : () => enterLeague(section.id)}
              selectedIds={selectedIds}
              onPick={addPick}
            />
          ))
        : null}

      {displayMode === 'games' && markets ? markets : null}

      {displayMode === 'sgp' ? <SportSgpShelf sport="nfl" bleed /> : null}
      {displayMode === 'boosts' ? <SportBoostsShelf sport="nfl" bleed /> : null}
      {displayMode === 'mega' ? <SportMegaShelf sport="nfl" bleed /> : null}

      {displayMode === 'outrights' ? (
        <FuturesView selectedIds={selectedIds} onPick={addPick} />
      ) : null}
      {displayMode === 'leagues' ? <AllLeaguesView onPick={enterLeague} /> : null}

      <div className="-mx-4 mt-6 md:-mx-6">
        <CasinoLiveWinsCarousel />
      </div>

      <SoccerBetslip
        picks={slipPicks}
        onRemove={(id) => setSoccerSlip((prev) => prev.filter((p) => p.id !== id))}
        onClear={() => setSoccerSlip([])}
        onChange={setSoccerSlip}
      />
    </div>
  )
}

/** NFL league board — same block as `/sports/football`. */
export function LeagueCard({
  section,
  expanded,
  onToggleMore,
  onSeeAll,
  selectedIds,
  onPick,
}: {
  section: SoccerLeagueSection
  expanded: boolean
  onToggleMore: () => void
  onSeeAll?: () => void
  selectedIds: Set<string>
  onPick: PickHandler
}) {
  const visible = expanded ? section.events : section.events.slice(0, LEAGUE_PREVIEW_ROWS)
  const hidden = section.events.length - visible.length

  return (
    <section data-name="league-section" className="mb-6">
      <div className="mb-3 flex h-9 items-center gap-2 px-0.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={section.icon}
          alt=""
          width={18}
          height={18}
          className="size-[18px] object-contain"
        />
        <Typography as="h2" shape="small" weight="semibold" className="min-w-0 flex-1 truncate">
          {section.name}
        </Typography>
        {onSeeAll ? <ShelfSeeMore label="See All" onClick={onSeeAll} /> : null}
      </div>

      <div className={cn(CARD, 'overflow-hidden')}>
        {visible.map((event) => (
          <GameRow key={event.id} event={event} selectedIds={selectedIds} onPick={onPick} />
        ))}
      </div>

      {hidden > 0 ? (
        <div className="mt-2 flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-muted-foreground hover:text-foreground"
            onClick={onToggleMore}
          >
            Show {hidden} More
            <IconChevronDown className="size-3.5" stroke={1.5} />
          </Button>
        </div>
      ) : null}
    </section>
  )
}

/** Desktop: scoreboard column + scrolling market rail. Mobile: scoreboard, then swipe rail. */
function GameRow({
  event,
  selectedIds,
  onPick,
}: {
  event: SoccerEvent
  selectedIds: Set<string>
  onPick: PickHandler
}) {
  const columns = useMemo(() => nflBoardColumns(event), [event])
  const onSelect = (col: NflBoardColumn, pick: SoccerOdds, el?: HTMLElement | null) =>
    onPick(slipFor(event, pick, col.slipMarket), el)

  return (
    <article
      data-name="nfl-game-row"
      className="border-b border-border last:border-b-0"
      style={event.live ? LIVE_ROW_STYLE : undefined}
    >
      <div className="flex flex-col gap-3 py-3 md:hidden">
        <div className="px-3">
          <Scoreboard event={event} />
        </div>
        <div className="scrollbar-hide min-w-0 overflow-x-auto overscroll-x-contain">
          <div className="w-max px-3">
            <MarketColumns
              event={event}
              columns={columns}
              selectedIds={selectedIds}
              onSelect={onSelect}
            />
          </div>
        </div>
      </div>

      <div className="hidden md:flex">
        <div
          className={cn(
            SCORE_COL_W,
            EVENT_ROW_H,
            'flex shrink-0 items-center border-r border-border px-4',
          )}
        >
          <Scoreboard event={event} />
        </div>
        <div className={cn(EVENT_ROW_H, 'flex min-w-0 flex-1')}>
          <OddsRail label={nflEventLabel(event)}>
            <MarketColumns
              event={event}
              columns={columns}
              selectedIds={selectedIds}
              onSelect={onSelect}
            />
          </OddsRail>
        </div>
      </div>
    </article>
  )
}

function Scoreboard({ event }: { event: SoccerEvent }) {
  const { startNavigating } = useShell()
  const href = nflEventHref(event.id)
  const score = event.live && event.score ? event.score : null
  /* US order: away on top. Score tuple is [home, away]. */
  const teams = [
    { name: event.away, pts: score?.[1] },
    { name: event.home, pts: score?.[0] },
  ]
  return (
    <Link
      href={href}
      onClick={() => startNavigating(href)}
      aria-label={`${nflEventLabel(event)}, open event`}
      data-name="event-scoreboard-link"
      className="group/event -mx-1.5 block min-w-0 flex-1 rounded-lg px-1.5 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="mb-1 flex items-center gap-2">
        {event.live ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
            <IconPlayerPlay className="size-3.5 fill-current" stroke={0} />
            {event.when}
          </span>
        ) : (
          <Typography as="span" shape="xs" variant="muted">
            {event.when}
          </Typography>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <div className="inline-flex min-w-0 flex-1 items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {teams.map((t) => (
              <div key={t.name} className="flex h-5 min-w-0 items-center gap-2">
                <BoardTeamBadge name={t.name} />
                <Typography as="span" shape="small" weight="medium" className="truncate">
                  {t.name}
                </Typography>
              </div>
            ))}
          </div>
          {score ? (
            <div
              className="grid shrink-0 grid-rows-2 self-stretch overflow-hidden rounded-sm border border-border bg-secondary tabular-nums"
              aria-label={`Score ${teams[0]!.pts}-${teams[1]!.pts}`}
            >
              {teams.map((t, i) => (
                <span
                  key={t.name}
                  className={cn(
                    'flex h-5 min-w-[1.5rem] items-center justify-center px-1.5 text-sm font-semibold leading-none text-foreground',
                    i === 1 && 'border-t border-border',
                  )}
                >
                  {t.pts}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <span
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors group-hover/event:bg-accent group-hover/event:text-foreground"
          aria-hidden
        >
          <IconChevronRight className="size-4" stroke={1.5} />
        </span>
      </div>
    </Link>
  )
}

/** US layout — away chip over home chip per market; soccer chip style and spacing. */
function MarketColumns({
  event,
  columns,
  selectedIds,
  onSelect,
}: {
  event: SoccerEvent
  columns: NflBoardColumn[]
  selectedIds: Set<string>
  onSelect: (col: NflBoardColumn, pick: SoccerOdds, el?: HTMLElement | null) => void
}) {
  const abbrs = [event.awayAbbr, event.homeAbbr]
  return (
    <div className="flex w-max gap-3">
      {columns.map((col) => {
        const moneyline = col.id.endsWith('-ml')
        return (
          <div key={col.id} className="flex w-[88px] shrink-0 flex-col gap-1">
            <Typography as="span" shape="xs" variant="muted" className="truncate text-center">
              {col.label}
            </Typography>
            {col.cells.map((pick, i) => (
              <OddsButton
                key={pick.id}
                pick={moneyline && !pick.label ? { ...pick, label: abbrs[i]! } : pick}
                selected={selectedIds.has(pick.id)}
                onSelect={(p, el) => onSelect(col, p, el)}
                className="min-w-0 w-full flex-none"
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

/** Desktop rail — glass edge arrows for mouse only; touch stays swipe. */
function OddsRail({ label, children }: { label: string; children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canBack, setCanBack] = useState(false)
  const [canMore, setCanMore] = useState(false)
  const [showArrows, setShowArrows] = useState(false)

  const measure = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanBack(el.scrollLeft > 8)
    setCanMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }, [])

  useLayoutEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setShowArrows(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure])

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.min(260, el.clientWidth * 0.7), behavior: 'smooth' })
  }

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden">
      <div
        ref={scrollRef}
        data-name="event-odds-scroll"
        className="scrollbar-hide flex h-full items-center overflow-x-auto overflow-y-hidden"
        onScroll={measure}
      >
        <div className="w-max px-3">{children}</div>
      </div>
      {showArrows && canBack ? (
        <button
          type="button"
          aria-label={`Scroll ${label} markets back`}
          className={cn(ODDS_EDGE_ARROW, 'left-1')}
          onClick={() => scrollBy(-1)}
        >
          <IconChevronLeft className="size-4" strokeWidth={2} />
        </button>
      ) : null}
      {showArrows && canMore ? (
        <button
          type="button"
          aria-label={`Scroll ${label} markets forward`}
          className={cn(ODDS_EDGE_ARROW, 'right-1')}
          onClick={() => scrollBy(1)}
        >
          <IconChevronRight className="size-4" strokeWidth={2} />
        </button>
      ) : null}
    </div>
  )
}

function AllLeaguesView({ onPick }: { onPick: (id: string) => void }) {
  return (
    <div className={cn(CARD, 'overflow-hidden')}>
      {FOOTBALL_LEAGUES.map((l) => {
        const count = NFL_GAME_SECTIONS.find((s) => s.id === l.id)?.events.length ?? 0
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => onPick(l.id)}
            className="flex h-14 w-full items-center gap-3 border-b border-border px-4 text-left transition-colors last:border-b-0 hover:bg-surface-muted-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={l.icon} alt="" className="size-6 object-contain" />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              {l.name}
            </span>
            <span className="text-xs tabular-nums text-muted-foreground">{count} games</span>
            <IconChevronRight className="size-4 text-muted-foreground" stroke={1.5} />
          </button>
        )
      })}
    </div>
  )
}

function FuturesView({ selectedIds, onPick }: { selectedIds: Set<string>; onPick: PickHandler }) {
  return (
    <OutrightsBoard
      futures={NFL_FUTURES}
      eventLabel="NFL Futures"
      sport="nfl"
      selectedIds={selectedIds}
      onPick={onPick}
    />
  )
}
