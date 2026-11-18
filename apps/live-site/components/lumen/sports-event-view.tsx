'use client'

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LumenTooltip } from '@/components/ui/lumen-tooltip'
import {
  IconBallAmericanFootball,
  IconBallFootball,
  IconChevronDown,
  IconChevronLeft,
  IconLock,
  IconMaximize,
  IconMinus,
  IconPlayerPlay,
  IconPlayerPlayFilled,
  IconPlus,
  IconSoccerField,
  IconTriangleFilled,
  IconVolume,
  IconVolumeOff,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Typography } from '@/components/ui/typography'
import { CasinoLiveWinsCarousel } from '@/components/lumen/casino-live-wins-carousel'
import { SoccerBetslip, type SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import {
  AlternateLinePicker,
  BoardTeamBadge,
  ModePillTrack,
  OddsButton,
} from '@/components/lumen/soccer-sport-page'
import { useShell } from '@/components/site/shell-context'
import { revealShellDock } from '@/components/site/shell-scroll'
import { setSoccerSlip, useSoccerSlip, withOneLegPerMarket } from '@/lib/lumen/soccer-slip-store'
import { sportsReturnHref } from '@/lib/lumen/sports-return'
import {
  americanToProb,
  probToAmerican,
  soccerTeamLogo,
  type SoccerEvent,
  type SoccerLinePair,
  type SoccerOdds,
} from '@/lib/lumen/soccer-sport'
import {
  marketPicks,
  type EventIncident,
  type EventMarket,
  type EventStatRow,
  type FormResult,
  type GridMarket,
  type LadderMarket,
  type LinesMarket,
  type ListMarket,
  type PlayerLinesMarket,
  type PlayersMarket,
  type RowMarket,
  type ScoreMarket,
  type SportsEventModel,
  type TrackerBeat,
} from '@/lib/lumen/sports-event'
import { flyBetDotToSlip } from '@/lib/lumen/vip-celebrate'
import { cn } from '@/lib/utils'

const CARD = 'rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]'
const HOME = 'var(--chart-1)'
const AWAY = 'var(--chart-2)'
/** Tailwind `/opacity` modifiers don't resolve on `var()` tokens here — mix in CSS instead. */
const mix = (token: string, pct: number) => `color-mix(in srgb, var(${token}) ${pct}%, transparent)`
/** Markets open on first paint — the rest stay collapsed so the list scans. */
const OPEN_BY_DEFAULT = 5

type Side = 'home' | 'away'

type PickHandler = (
  pick: SoccerOdds,
  slip: { market: string; label?: string },
  originEl?: HTMLElement | null,
) => void

function SportGlyph({
  sport,
  className,
}: {
  sport: SportsEventModel['sport']
  className?: string
}) {
  return sport === 'nfl' ? (
    <IconBallAmericanFootball className={className} stroke={1.5} />
  ) : (
    <IconBallFootball className={className} stroke={1.5} />
  )
}

function sidesOf(model: SportsEventModel): [Side, Side] {
  return model.awayFirst ? ['away', 'home'] : ['home', 'away']
}

function teamName(event: SoccerEvent, side: Side) {
  return side === 'home' ? event.home : event.away
}

function teamAbbr(event: SoccerEvent, side: Side) {
  return side === 'home' ? event.homeAbbr : event.awayAbbr
}

function matchupShort(model: SportsEventModel, e: SoccerEvent) {
  return model.awayFirst ? `${e.awayAbbr} @ ${e.homeAbbr}` : `${e.homeAbbr} vs ${e.awayAbbr}`
}

// ─── Page ─────────────────────────────────────────────────────

export function EventMissing({ sportLabel, href }: { sportLabel: string; href: string }) {
  const router = useRouter()
  const { startNavigating } = useShell()
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-4 md:px-6 md:py-6">
      <div className={cn(CARD, 'flex flex-col items-center gap-3 px-6 py-14 text-center')}>
        <Typography as="h1" shape="h4" weight="semibold">
          This game is no longer available
        </Typography>
        <Typography as="p" shape="small" variant="muted">
          It may have finished or been taken off the board.
        </Typography>
        <Button
          className="mt-2"
          onClick={() => {
            const next = sportsReturnHref(href)
            startNavigating(next)
            router.push(next)
          }}
        >
          Back to {sportLabel}
        </Button>
      </div>
    </div>
  )
}

/** `null` until mounted — lets the rail vs in-flow media mount once (never two video decoders). */
function useIsDesktop(): boolean | null {
  const [desktop, setDesktop] = useState<boolean | null>(null)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setDesktop(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return desktop
}

export function SportsEventView({ model }: { model: SportsEventModel }) {
  const router = useRouter()
  const desktop = useIsDesktop()
  const { startNavigating } = useShell()
  const { event, markets } = model
  const tabs = useMemo(
    () => model.tabs.filter((t) => markets.some((m) => m.tabs.includes(t.id))),
    [model.tabs, markets],
  )
  const [tab, setTab] = useState(tabs[0]?.id ?? 'popular')
  const slipPicks = useSoccerSlip()
  const selectedIds = useMemo(() => new Set(slipPicks.map((p) => p.id)), [slipPicks])
  const visible = useMemo(() => markets.filter((m) => m.tabs.includes(tab)), [markets, tab])
  const ticks = useLiveOddsTicks(model, selectedIds)
  const suspended = useSuspendedMarkets(model)

  const goBack = () => {
    const href = sportsReturnHref(model.sportHref)
    startNavigating(href)
    router.push(href)
  }

  const onSelect: PickHandler = (pick, slip, originEl) => {
    if (selectedIds.has(pick.id)) {
      setSoccerSlip((prev) => prev.filter((p) => p.id !== pick.id))
      return
    }
    const next: SoccerSlipPick = {
      id: pick.id,
      label: slip.label ?? pick.slipLabel ?? pick.label,
      odds: ticks[pick.id]?.odds ?? pick.odds,
      eventLabel: model.eventLabel,
      market: slip.market,
      eventId: event.id,
      eventHref: model.hrefFor(event.id),
      sport: model.sport,
      live: !!event.live,
    }
    setSoccerSlip((prev) => withOneLegPerMarket(prev, next))
    revealShellDock()
    flyBetDotToSlip(originEl, next.id)
  }

  const priced = (pick: SoccerOdds): SoccerOdds =>
    ticks[pick.id] ? { ...pick, odds: ticks[pick.id]!.odds } : pick

  return (
    <div
      data-name="sports-event-page"
      data-sport={model.sport}
      data-live={event.live ? 'true' : 'false'}
      className="mx-auto w-full max-w-[1440px] px-4 py-4 md:px-6 md:py-6"
    >
      <EventBreadcrumbs model={model} onBack={goBack} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0">
          <EventHeader model={model} />

          {/* Below lg the media / stats sit in-flow; lg+ they move to the sticky rail. */}
          <div className="mt-4 lg:hidden">
            {model.live ? (
              desktop === false ? (
                <MediaPanel model={model} />
              ) : null
            ) : (
              <WinProbabilityCard model={model} />
            )}
          </div>

          <ModePillTrack
            active={tab}
            onChange={setTab}
            modes={tabs}
            ariaLabel="Market groups"
            className="mb-4 mt-5"
          />

          <div className="flex flex-col gap-3">
            {visible.map((market, i) => (
              <MarketCard
                key={`${tab}-${market.id}`}
                market={market}
                model={model}
                defaultOpen={i < OPEN_BY_DEFAULT}
                suspended={suspended.has(market.id)}
                selectedIds={selectedIds}
                priced={priced}
                ticks={ticks}
                onSelect={onSelect}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-4 lg:hidden">
            {model.live ? <LiveStatsCard model={model} /> : <PreMatchCards model={model} />}
          </div>
        </div>

        <aside
          aria-label={event.live ? 'Live stream and tracker' : 'Game stats'}
          className={cn(
            'scrollbar-hide hidden min-w-0 flex-col gap-4 lg:flex lg:self-start lg:overflow-y-auto',
            'lg:sticky lg:top-[calc(var(--shell-chrome-h,140px)+16px)]',
            'lg:max-h-[calc(100dvh-var(--shell-chrome-h,140px)-32px)]',
          )}
        >
          {model.live ? (
            <>
              {desktop ? <MediaPanel model={model} /> : null}
              <LiveStatsCard model={model} />
            </>
          ) : (
            <>
              <WinProbabilityCard model={model} />
              <PreMatchCards model={model} />
            </>
          )}
        </aside>
      </div>

      <div className="-mx-4 mt-8 md:-mx-6">
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

// ─── Breadcrumbs + switcher ───────────────────────────────────

function EventBreadcrumbs({ model, onBack }: { model: SportsEventModel; onBack: () => void }) {
  return (
    <div data-name="breadcrumbs" className="mb-4 flex items-center gap-2 sm:gap-3">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary transition-colors hover:bg-accent"
      >
        <IconChevronLeft className="size-4" stroke={1.5} />
      </button>
      <div className="scrollbar-hide min-w-0 flex-1 overflow-x-auto overscroll-x-contain">
        <div className="flex w-max items-center gap-1.5 whitespace-nowrap pr-1 text-sm leading-none">
          <span className="inline-flex h-7 shrink-0 items-center gap-1.5 text-muted-foreground">
            <SportGlyph sport={model.sport} className="size-4 shrink-0" />
            {model.sportLabel}
          </span>
          <span className="inline-flex h-7 items-center text-muted-foreground/70" aria-hidden>
            /
          </span>
          <span className="inline-flex h-7 items-center text-muted-foreground">
            {model.league.name}
          </span>
          <span className="inline-flex h-7 items-center text-muted-foreground/70" aria-hidden>
            /
          </span>
          <EventSwitcher model={model} />
        </div>
      </div>
    </div>
  )
}

function EventSwitcher({ model }: { model: SportsEventModel }) {
  const { startNavigating } = useShell()
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const { siblings } = model
  const [first, second] = sidesOf(model)

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return
    const r = rootRef.current.getBoundingClientRect()
    const width = 300
    setPos({
      top: r.bottom + 6,
      left: Math.max(8, Math.min(r.left, window.innerWidth - width - 8)),
    })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('touchstart', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('touchstart', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const scoreText = (e: SoccerEvent) => {
    const s = e.score ?? [0, 0]
    return model.awayFirst ? `${s[1]}-${s[0]}` : `${s[0]}-${s[1]}`
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={siblings.length === 0}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-7 items-center gap-1 rounded-md px-1.5 font-medium text-foreground transition-colors hover:bg-accent',
          open && 'bg-accent',
        )}
      >
        {matchupShort(model, model.event)}
        {siblings.length > 0 ? (
          <IconChevronDown
            className={cn('size-3.5 opacity-70 transition-transform', open && 'rotate-180')}
            stroke={1.5}
          />
        ) : null}
      </button>
      {open && typeof document !== 'undefined'
        ? createPortal(
            <ul
              ref={menuRef}
              role="listbox"
              style={{ top: pos.top, left: pos.left }}
              className="fixed z-[220] max-h-[min(60vh,420px)] w-[300px] overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
            >
              {siblings.map((e) => {
                const href = model.hrefFor(e.id)
                return (
                  <li key={e.id} role="option" aria-selected={false}>
                    <Link
                      href={href}
                      onClick={() => {
                        setOpen(false)
                        startNavigating(href)
                      }}
                      className="flex items-center gap-3 rounded-sm px-2 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        {[first, second].map((side) => (
                          <span key={side} className="flex items-center gap-2">
                            <BoardTeamBadge name={teamName(e, side)} />
                            <span className="truncate">{teamName(e, side)}</span>
                          </span>
                        ))}
                      </span>
                      <span
                        className={cn(
                          'shrink-0 text-right text-xs',
                          e.live ? 'font-medium text-destructive' : 'text-muted-foreground',
                        )}
                      >
                        {e.live ? `${scoreText(e)} · ${e.when}` : e.when}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>,
            document.body,
          )
        : null}
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────

function TeamCrest({ name, className }: { name: string; className?: string }) {
  const src = soccerTeamLogo(name)
  const [failed, setFailed] = useState(!src)
  if (failed) {
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join('')
    return (
      <span
        aria-hidden
        className={cn(
          'inline-flex items-center justify-center rounded-full bg-surface-muted-3 text-sm font-semibold text-muted-foreground',
          className,
        )}
      >
        {initials}
      </span>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={cn('object-contain', className)}
      onError={() => setFailed(true)}
    />
  )
}

function splitKickoff(when: string): { day: string; time: string } {
  const at = when.lastIndexOf(',')
  if (at < 0) return { day: when, time: '' }
  return { day: when.slice(0, at).trim(), time: when.slice(at + 1).trim() }
}

/** Live event card — faint red wash on the left edge only. */
const LIVE_CARD_STYLE: CSSProperties = {
  backgroundImage:
    'linear-gradient(90deg, color-mix(in srgb, var(--destructive) 7%, transparent), transparent 22%)',
}

function EventHeader({ model }: { model: SportsEventModel }) {
  const { event } = model
  const live = !!event.live
  const score = event.score ?? [0, 0]
  const goals = (model.live?.incidents ?? []).filter((i) => i.kind === 'goal')
  const kickoff = splitKickoff(event.when)
  const [left, right] = sidesOf(model)
  const scoreOf = (side: Side) => (side === 'home' ? score[0] : score[1])

  return (
    <section
      data-name="event-header"
      className={cn(CARD, 'px-4 pb-5 pt-4 md:px-6 md:pb-6')}
      style={live ? LIVE_CARD_STYLE : undefined}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={model.league.icon} alt="" className="size-4 shrink-0 object-contain" />
          <span className="truncate">{model.league.name}</span>
        </span>
        {live ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-destructive">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-destructive" />
            </span>
            Live
          </span>
        ) : (
          <Typography as="span" shape="xs" variant="muted">
            {model.sport === 'nfl' ? 'Pregame' : 'Pre-match'}
          </Typography>
        )}
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3 md:gap-6">
        <HeaderTeam model={model} side={left} goals={goals.filter((g) => g.side === left)} />

        <div className="flex min-w-[96px] flex-col items-center pt-1 text-center md:min-w-[140px]">
          {live ? (
            <>
              <span
                className="flex items-center gap-2 text-[40px] font-bold leading-none tabular-nums text-foreground md:text-[52px]"
                aria-label={`Score ${scoreOf(left)} to ${scoreOf(right)}`}
              >
                <span>{scoreOf(left)}</span>
                <span className="text-[28px] font-medium text-muted-foreground md:text-[36px]">
                  -
                </span>
                <span>{scoreOf(right)}</span>
              </span>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-destructive">
                <IconPlayerPlay className="size-3.5 fill-current" stroke={0} />
                {event.when}
              </span>
            </>
          ) : (
            <>
              <span className="text-[26px] font-bold leading-none tabular-nums text-foreground md:text-[32px]">
                {kickoff.time || 'TBC'}
              </span>
              <span className="mt-2 text-xs text-muted-foreground">{kickoff.day}</span>
            </>
          )}
        </div>

        <HeaderTeam model={model} side={right} goals={goals.filter((g) => g.side === right)} />
      </div>
    </section>
  )
}

function HeaderTeam({
  model,
  side,
  goals,
}: {
  model: SportsEventModel
  side: Side
  goals: EventIncident[]
}) {
  const name = teamName(model.event, side)
  const record = model.records?.[side]
  const hasBall = !!model.event.live && model.possession === side
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <TeamCrest name={name} className="size-12 md:size-16" />
      <Typography
        as="span"
        shape="small"
        weight="semibold"
        className="line-clamp-2 text-balance md:text-base"
      >
        {name}
      </Typography>
      {record || hasBall ? (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          {hasBall ? (
            <IconBallAmericanFootball
              className="size-3.5 shrink-0 text-foreground"
              stroke={1.5}
              aria-label="Has the ball"
            />
          ) : null}
          {record}
        </span>
      ) : null}
      {goals.length > 0 ? (
        <ul className="flex flex-col items-center gap-0.5">
          {goals.map((g) => (
            <li
              key={`${g.player}-${g.at}`}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground"
            >
              <IconBallFootball className="size-3 shrink-0" stroke={1.5} />
              <span className="truncate">
                {lastName(g.player)} {g.label}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function lastName(full: string): string {
  const parts = full.split(' ')
  return parts.length > 1 ? parts.slice(1).join(' ') : full
}

// ─── Live odds movement + suspensions ─────────────────────────

type Tick = { odds: string; dir: 1 | -1; at: number }

/** Live only — a few event-view prices drift every few seconds (board-shared legs stay put). */
function useLiveOddsTicks(model: SportsEventModel, selectedIds: Set<string>): Record<string, Tick> {
  const [ticks, setTicks] = useState<Record<string, Tick>>({})
  const selectedRef = useRef(selectedIds)
  selectedRef.current = selectedIds

  const pool = useMemo(() => {
    if (!model.event.live) return [] as SoccerOdds[]
    return model.markets
      .filter((m) => !m.volatile)
      .flatMap(marketPicks)
      .filter((p) => !model.boardIds.has(p.id))
  }, [model])

  useEffect(() => {
    if (pool.length === 0) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => {
      setTicks((prev) => {
        const next = { ...prev }
        for (let n = 0; n < 3; n++) {
          const pick = pool[Math.floor(Math.random() * pool.length)]!
          if (selectedRef.current.has(pick.id)) continue
          const current = Number.parseInt((prev[pick.id]?.odds ?? pick.odds).replace('+', ''), 10)
          const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1
          const p = americanToProb(current) - dir * (0.006 + Math.random() * 0.012)
          next[pick.id] = {
            odds: probToAmerican(Math.min(0.94, Math.max(0.04, p))),
            dir,
            at: Date.now(),
          }
        }
        return next
      })
    }, 3200)
    return () => window.clearInterval(id)
  }, [pool])

  return ticks
}

/** In-play volatile markets lock for ~4s of every ~14s (snap → whistle). */
function useSuspendedMarkets(model: SportsEventModel): Set<string> {
  const ids = useMemo(
    () => (model.event.live ? model.markets.filter((m) => m.volatile).map((m) => m.id) : []),
    [model],
  )
  const [locked, setLocked] = useState(false)
  useEffect(() => {
    if (ids.length === 0) return
    let t = 0
    const cycle = () => {
      setLocked(false)
      t = window.setTimeout(() => {
        setLocked(true)
        t = window.setTimeout(cycle, 4000)
      }, 10_000)
    }
    cycle()
    return () => window.clearTimeout(t)
  }, [ids])
  return useMemo(() => new Set(locked ? ids : []), [locked, ids])
}

function useFreshTick(tick: Tick | undefined): Tick | undefined {
  const [fresh, setFresh] = useState(false)
  useEffect(() => {
    if (!tick) return
    setFresh(true)
    const id = window.setTimeout(() => setFresh(false), 1800)
    return () => window.clearTimeout(id)
  }, [tick])
  return fresh ? tick : undefined
}

function EventOdds({
  pick,
  tick,
  selected,
  locked = false,
  onSelect,
}: {
  pick: SoccerOdds
  tick?: Tick
  selected: boolean
  locked?: boolean
  onSelect: (pick: SoccerOdds, originEl?: HTMLElement | null) => void
}) {
  const fresh = useFreshTick(tick)
  if (locked) {
    return (
      <div className="relative flex min-w-0">
        <span
          aria-label={`${pick.label} suspended`}
          className="flex min-w-[72px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg border border-border bg-secondary px-2 py-1.5 text-center text-muted-foreground"
        >
          <span className="text-[10px] font-medium leading-3.5">{pick.label}</span>
          <IconLock className="size-4 opacity-70" stroke={1.5} />
        </span>
      </div>
    )
  }
  return (
    <div className="relative flex min-w-0">
      <OddsButton pick={pick} selected={selected} onSelect={onSelect} className="min-w-0" />
      {fresh && !selected ? (
        <IconTriangleFilled
          aria-hidden
          className={cn(
            'pointer-events-none absolute right-1.5 top-1.5 size-2',
            fresh.dir === 1 ? 'text-success' : 'rotate-180 text-destructive',
          )}
        />
      ) : null}
    </div>
  )
}

// ─── Markets ──────────────────────────────────────────────────

type BodyProps<M> = {
  market: M
  model: SportsEventModel
  suspended: boolean
  selectedIds: Set<string>
  priced: (p: SoccerOdds) => SoccerOdds
  ticks: Record<string, Tick>
  onSelect: PickHandler
}

function slipMarketOf(market: EventMarket) {
  return market.slipMarket ?? market.name
}

function MarketCard(props: BodyProps<EventMarket> & { defaultOpen: boolean }) {
  const { market, suspended, defaultOpen } = props
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section
      data-name="event-market"
      data-market={market.id}
      className={cn(CARD, 'overflow-hidden')}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="m-1 flex h-11 w-[calc(100%-0.5rem)] items-center gap-2 rounded-lg px-3 text-left transition-colors hover:bg-surface-muted-3"
      >
        <Typography as="h3" shape="small" weight="semibold" className="min-w-0 flex-1 truncate">
          {market.name}
        </Typography>
        {suspended ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            <IconLock className="size-3" stroke={1.75} />
            Suspended
          </span>
        ) : null}
        <IconChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform',
            !open && '-rotate-90',
          )}
          stroke={1.5}
        />
      </button>
      {open ? (
        <div className="px-3 pb-3 pt-1">
          {market.kind === 'row' ? <RowBody {...props} market={market} /> : null}
          {market.kind === 'ladder' ? <LadderBody {...props} market={market} /> : null}
          {market.kind === 'grid' ? <GridBody {...props} market={market} /> : null}
          {market.kind === 'players' ? <PlayersBody {...props} market={market} /> : null}
          {market.kind === 'lines' ? <LinesBody {...props} market={market} /> : null}
          {market.kind === 'player-lines' ? <PlayerLinesBody {...props} market={market} /> : null}
          {market.kind === 'score' ? <ScoreBody {...props} market={market} /> : null}
          {market.kind === 'list' ? <ListBody {...props} market={market} /> : null}
        </div>
      ) : null}
    </section>
  )
}

function RowBody({
  market,
  suspended,
  selectedIds,
  priced,
  ticks,
  onSelect,
}: BodyProps<RowMarket>) {
  const n = market.cells.length
  const cols = n === 4 ? 2 : n > 3 ? 3 : n
  return (
    <div
      className="grid gap-1.5"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {market.cells.map((cell) => (
        <EventOdds
          key={cell.id}
          pick={priced(cell)}
          tick={ticks[cell.id]}
          locked={suspended}
          selected={selectedIds.has(cell.id)}
          onSelect={(p, el) => onSelect(p, { market: slipMarketOf(market) }, el)}
        />
      ))}
    </div>
  )
}

function ColumnHead({ label, team }: { label: string; team?: string }) {
  return (
    <span className="flex min-w-0 items-center justify-center gap-1.5 text-xs text-muted-foreground">
      {team ? <BoardTeamBadge name={team} /> : null}
      <span className="truncate">{label}</span>
    </span>
  )
}

function MoreToggle({ open, onClick, more }: { open: boolean; onClick: () => void; more: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="mt-1.5 h-8 w-full gap-1 text-muted-foreground hover:text-foreground"
    >
      {open ? 'Show fewer' : more}
      <IconChevronDown
        className={cn('size-3.5 transition-transform', open && 'rotate-180')}
        stroke={1.5}
      />
    </Button>
  )
}

/** Line the card opens on — a slip leg from this ladder wins, else the main line. */
function initialLine(rows: SoccerLinePair[], mainLine: number, selectedIds: Set<string>) {
  return rows.find((r) => selectedIds.has(r.a.id) || selectedIds.has(r.b.id))?.line ?? mainLine
}

/**
 * Main pair on the card + the board's alt-line picker beside it.
 * Tap an alt chip → that pair moves onto the card, the tapped side goes on the slip.
 */
function LinePair({
  rows,
  mainLine,
  title,
  family,
  slip,
  suspended,
  selectedIds,
  priced,
  ticks,
  onSelect,
  columns,
}: {
  rows: SoccerLinePair[]
  mainLine: number
  title: string
  family: 'spread' | 'total'
  columns?: [string, string]
  slip: (pick: SoccerOdds) => { market: string; label?: string }
  suspended: boolean
  selectedIds: Set<string>
  priced: (p: SoccerOdds) => SoccerOdds
  ticks: Record<string, Tick>
  onSelect: PickHandler
}) {
  const [line, setLine] = useState(() => initialLine(rows, mainLine, selectedIds))
  const active =
    rows.find((r) => r.line === line) ?? rows.find((r) => r.line === mainLine) ?? rows[0]
  if (!active) return null
  const pricedRows = rows.map((r) => ({ ...r, a: priced(r.a), b: priced(r.b) }))

  const onAlt = (pick: SoccerOdds) => {
    const pair = rows.find((r) => r.a.id === pick.id || r.b.id === pick.id)
    if (pair) setLine(pair.line)
    window.requestAnimationFrame(() => {
      const origin = [...document.querySelectorAll<HTMLElement>('[data-pick-id]')].find(
        (el) => el.dataset.pickId === pick.id && el.getBoundingClientRect().width > 0,
      )
      onSelect(pick, slip(pick), origin ?? null)
    })
  }

  return (
    <div className="flex items-stretch gap-1">
      <div className="grid min-w-0 flex-1 grid-cols-2 gap-1">
        {[active.a, active.b].map((cell) => (
          <EventOdds
            key={cell.id}
            pick={priced(cell)}
            tick={ticks[cell.id]}
            locked={suspended}
            selected={selectedIds.has(cell.id)}
            onSelect={(p, el) => onSelect(p, slip(p), el)}
          />
        ))}
      </div>
      {!suspended && rows.length > 1 ? (
        <AlternateLinePicker
          family={family}
          title={title}
          pairs={pricedRows}
          mainLine={mainLine}
          selectedIds={selectedIds}
          onPick={onAlt}
          columns={columns ?? (family === 'total' ? ['Over', 'Under'] : undefined)}
        />
      ) : null}
    </div>
  )
}

function LadderBody(props: BodyProps<LadderMarket>) {
  const { market } = props
  const family = market.columns[0].label === 'Over' ? 'total' : 'spread'
  return (
    <div>
      <div className="mb-1.5 flex gap-1 pr-8">
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-1 px-1">
          <ColumnHead {...market.columns[0]} />
          <ColumnHead {...market.columns[1]} />
        </div>
      </div>
      <LinePair
        {...props}
        rows={market.rows}
        mainLine={market.mainLine}
        title={market.altTitle}
        family={family}
        columns={[market.columns[0].label, market.columns[1].label]}
        slip={() => ({ market: slipMarketOf(market) })}
      />
    </div>
  )
}

function GridBody({
  market,
  suspended,
  selectedIds,
  priced,
  ticks,
  onSelect,
}: BodyProps<GridMarket>) {
  const [all, setAll] = useState(false)
  const longest = Math.max(...market.columns.map((c) => c.cells.length))
  const cap = all ? longest : Math.min(longest, 3)
  return (
    <div>
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${market.columns.length}, minmax(0, 1fr))` }}
      >
        {market.columns.map((col) => (
          <div key={col.label} className="flex min-w-0 flex-col gap-1.5">
            <div className="px-1 pb-0.5">
              <ColumnHead label={col.label} team={col.team} />
            </div>
            {col.cells.slice(0, cap).map((cell) => (
              <EventOdds
                key={cell.id}
                pick={priced(cell)}
                tick={ticks[cell.id]}
                locked={suspended}
                selected={selectedIds.has(cell.id)}
                onSelect={(p, el) => onSelect(p, { market: slipMarketOf(market) }, el)}
              />
            ))}
          </div>
        ))}
      </div>
      {longest > 3 ? (
        <MoreToggle open={all} onClick={() => setAll((v) => !v)} more="Show all outcomes" />
      ) : null}
    </div>
  )
}

/** Every line visible — column heads, optional team sub-heading per group, lock for suspended lines. */
function ListBody({
  market,
  suspended,
  selectedIds,
  priced,
  ticks,
  onSelect,
}: BodyProps<ListMarket>) {
  const [all, setAll] = useState(false)
  const cap = market.preview ?? 5
  const longest = Math.max(...market.groups.map((g) => g.rows.length))
  return (
    <div className="flex flex-col gap-4">
      {market.groups.map((group, gi) => {
        const cols = group.columns.length
        const rows = all ? group.rows : group.rows.slice(0, cap)
        return (
          <div key={group.title ?? gi} className="flex flex-col gap-1.5">
            {group.title ? (
              <span className="flex items-center gap-2 px-1 pt-0.5">
                {group.team ? <BoardTeamBadge name={group.team} /> : null}
                <Typography as="span" shape="xs" weight="semibold" className="truncate">
                  {group.title}
                </Typography>
              </span>
            ) : null}
            <div
              className="grid gap-1.5 px-1"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {group.columns.map((c) => (
                <ColumnHead key={c.label} label={c.label} team={group.title ? undefined : c.team} />
              ))}
            </div>
            {rows.map((row, ri) => (
              <div
                key={ri}
                className="grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
              >
                {row.map((cell, ci) =>
                  cell === undefined ? (
                    <span key={ci} aria-hidden />
                  ) : cell === null ? (
                    <span
                      key={ci}
                      aria-label="Line suspended"
                      className="flex h-full min-h-[44px] items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground"
                    >
                      <IconLock className="size-4 opacity-70" stroke={1.5} />
                    </span>
                  ) : (
                    <EventOdds
                      key={cell.id}
                      pick={priced(cell)}
                      tick={ticks[cell.id]}
                      locked={suspended}
                      selected={selectedIds.has(cell.id)}
                      onSelect={(p, el) =>
                        onSelect(
                          p,
                          { market: slipMarketOf(market), label: cell.slipLabel ?? p.label },
                          el,
                        )
                      }
                    />
                  ),
                )}
              </div>
            ))}
          </div>
        )
      })}
      {longest > cap ? (
        <MoreToggle open={all} onClick={() => setAll((v) => !v)} more="Show all" />
      ) : null}
    </div>
  )
}

function TeamToggle({
  teams,
  active,
  onChange,
  label,
}: {
  teams: { name: string; abbr: string }[]
  active: number
  onChange: (i: number) => void
  label: string
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="mb-2 inline-flex rounded-full bg-secondary p-0.5"
    >
      {teams.map((t, i) => (
        <button
          key={t.name}
          type="button"
          role="tab"
          aria-selected={i === active}
          onClick={() => onChange(i)}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs transition-colors',
            i === active
              ? 'bg-background font-medium text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <BoardTeamBadge name={t.name} />
          {t.abbr}
        </button>
      ))}
    </div>
  )
}

function PlayerName({ name, pos }: { name: string; pos?: string }) {
  return (
    <span className="flex min-w-0 items-baseline gap-1.5 pl-1">
      <Typography as="span" shape="small" className="truncate">
        {name}
      </Typography>
      {pos ? <span className="shrink-0 text-[11px] text-muted-foreground">{pos}</span> : null}
    </span>
  )
}

function PlayersBody({
  market,
  suspended,
  selectedIds,
  priced,
  ticks,
  onSelect,
}: BodyProps<PlayersMarket>) {
  const [teamIdx, setTeamIdx] = useState(0)
  const team = market.teams[teamIdx] ?? market.teams[0]!
  return (
    <div>
      <TeamToggle
        teams={market.teams}
        active={teamIdx}
        onChange={setTeamIdx}
        label={`${market.name} team`}
      />
      <div
        className="mb-1 grid gap-1.5 text-center text-[11px] text-muted-foreground"
        style={{
          gridTemplateColumns: `minmax(0,1fr) repeat(${market.columns.length}, minmax(64px, 84px))`,
        }}
      >
        <span />
        {market.columns.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
      <div className="flex flex-col divide-y divide-border">
        {team.players.map((player) => (
          <div
            key={player.id}
            className="grid items-center gap-1.5 py-1.5"
            style={{
              gridTemplateColumns: `minmax(0,1fr) repeat(${market.columns.length}, minmax(64px, 84px))`,
            }}
          >
            <PlayerName name={player.name} pos={player.pos} />
            {player.cells.map((cell) => (
              <EventOdds
                key={cell.id}
                pick={priced(cell)}
                tick={ticks[cell.id]}
                locked={suspended}
                selected={selectedIds.has(cell.id)}
                onSelect={(p, el) =>
                  onSelect(
                    p,
                    {
                      market: `${market.name}: ${player.name}`,
                      label: cell.slipLabel ?? `${player.name} ${cell.label}`,
                    },
                    el,
                  )
                }
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** US game lines — team rows × Spread / Total / Moneyline. */
function LinesBody({
  market,
  suspended,
  selectedIds,
  priced,
  ticks,
  onSelect,
}: BodyProps<LinesMarket>) {
  const grid =
    'grid grid-cols-[minmax(0,1fr)_repeat(3,minmax(64px,108px))] items-stretch gap-x-3 gap-y-1.5'
  return (
    <div className="flex flex-col gap-1.5">
      <div className={cn(grid, 'text-center text-[11px] text-muted-foreground')}>
        <span />
        {market.columns.map((c) => (
          <span key={c.label}>{c.label}</span>
        ))}
      </div>
      {market.rows.map((row) => (
        <div key={row.team} className={grid}>
          <span className="flex min-w-0 items-center gap-2 self-center pl-1">
            <BoardTeamBadge name={row.team} />
            <Typography as="span" shape="small" weight="medium" className="truncate">
              {row.team}
            </Typography>
          </span>
          {row.cells.map((cell, i) =>
            cell ? (
              <EventOdds
                key={cell.id}
                pick={priced(cell)}
                tick={ticks[cell.id]}
                locked={suspended}
                selected={selectedIds.has(cell.id)}
                onSelect={(p, el) => onSelect(p, { market: market.columns[i]!.slipMarket }, el)}
              />
            ) : (
              <span key={i} className="text-center text-xs text-muted-foreground">
                -
              </span>
            ),
          )}
        </div>
      ))}
    </div>
  )
}

/** Player over / under — each row carries its own alt-line picker. Five rows, then Show more. */
function PlayerLinesBody(props: BodyProps<PlayerLinesMarket>) {
  const { market } = props
  const [teamIdx, setTeamIdx] = useState(0)
  const [all, setAll] = useState(false)
  const team = market.teams[teamIdx] ?? market.teams[0]!
  const shown = all ? team.players : team.players.slice(0, 5)
  return (
    <div>
      <TeamToggle
        teams={market.teams}
        active={teamIdx}
        onChange={(i) => {
          setTeamIdx(i)
          setAll(false)
        }}
        label={`${market.name} team`}
      />
      {team.players.length === 0 ? (
        <Typography as="p" shape="xs" variant="muted" className="px-1 py-3">
          No lines for this team yet.
        </Typography>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {shown.map((player) => (
            <div
              key={player.id}
              className="grid grid-cols-[minmax(0,1fr)_minmax(176px,240px)] items-center gap-2 py-1.5"
            >
              <PlayerName name={player.name} pos={player.pos} />
              <LinePair
                {...props}
                rows={player.rows}
                mainLine={player.mainLine}
                title={player.name}
                family="total"
                slip={(pick) => ({
                  market: `${market.name}: ${player.name}`,
                  label: pick.slipLabel ?? `${player.name} ${pick.label}`,
                })}
              />
            </div>
          ))}
        </div>
      )}
      {team.players.length > 5 ? (
        <MoreToggle
          open={all}
          onClick={() => setAll((v) => !v)}
          more={`Show ${team.players.length - 5} more`}
        />
      ) : null}
    </div>
  )
}

/** bet365-style correct score: − score + per team, live price, full grid one tap away. */
function ScoreBody({
  market,
  model,
  suspended,
  selectedIds,
  priced,
  ticks,
  onSelect,
}: BodyProps<ScoreMarket>) {
  const max = market.cells.length - 1
  const selectedCell = market.cells
    .flatMap((row, h) => row.map((c, a) => (c && selectedIds.has(c.id) ? ([h, a] as const) : null)))
    .find(Boolean)
  const [score, setScore] = useState<[number, number]>(
    selectedCell ? [selectedCell[0], selectedCell[1]] : market.start,
  )
  const [grid, setGrid] = useState(false)
  const cell = market.cells[score[0]]?.[score[1]] ?? null
  const [left, right] = sidesOf(model)
  const idx = (side: Side) => (side === 'home' ? 0 : 1)

  const bump = (side: Side, d: 1 | -1) =>
    setScore((s) => {
      const next = [...s] as [number, number]
      const i = idx(side)
      next[i] = Math.max(market.min[i]!, Math.min(max, next[i]! + d))
      return next
    })

  const stepper = (side: Side) => {
    const i = idx(side)
    return (
      <div className="flex min-w-0 flex-col items-center gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <BoardTeamBadge name={teamName(model.event, side)} />
          <span className="truncate">{teamAbbr(model.event, side)}</span>
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label={`Fewer ${teamAbbr(model.event, side)} goals`}
            disabled={score[i]! <= market.min[i]!}
            onClick={() => bump(side, -1)}
            className="size-9 rounded-lg"
          >
            <IconMinus className="size-4" stroke={2} />
          </Button>
          <span className="w-9 text-center text-2xl font-bold tabular-nums text-foreground">
            {score[i]}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label={`More ${teamAbbr(model.event, side)} goals`}
            disabled={score[i]! >= max}
            onClick={() => bump(side, 1)}
            className="size-9 rounded-lg"
          >
            <IconPlus className="size-4" stroke={2} />
          </Button>
        </div>
      </div>
    )
  }

  const scoreLabel = `${score[0]}-${score[1]}`

  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(88px,120px)_minmax(0,1fr)] items-center gap-2 rounded-lg bg-secondary px-2 py-3">
        {stepper(left)}
        <div className="flex min-w-0">
          {cell ? (
            <EventOdds
              pick={priced({ ...cell, label: scoreLabel })}
              tick={ticks[cell.id]}
              locked={suspended}
              selected={selectedIds.has(cell.id)}
              onSelect={(p, el) =>
                onSelect(
                  p,
                  { market: slipMarketOf(market), label: `Correct score ${scoreLabel}` },
                  el,
                )
              }
            />
          ) : (
            <span className="flex flex-1 items-center justify-center rounded-lg border border-border px-2 py-2 text-xs text-muted-foreground">
              Not offered
            </span>
          )}
        </div>
        {stepper(right)}
      </div>
      {market.other ? (
        <div className="mt-1.5 flex">
          <EventOdds
            pick={priced(market.other)}
            tick={ticks[market.other.id]}
            locked={suspended}
            selected={selectedIds.has(market.other.id)}
            onSelect={(p, el) => onSelect(p, { market: slipMarketOf(market) }, el)}
          />
        </div>
      ) : null}
      {grid ? (
        <div className="mt-3">
          <GridBody
            market={{
              id: `${market.id}-grid`,
              kind: 'grid',
              name: market.name,
              tabs: [],
              columns: market.grid,
            }}
            model={model}
            suspended={suspended}
            selectedIds={selectedIds}
            priced={priced}
            ticks={ticks}
            onSelect={onSelect}
          />
        </div>
      ) : null}
      <MoreToggle open={grid} onClick={() => setGrid((v) => !v)} more="Show all scores" />
    </div>
  )
}

// ─── Live media: stream + tracker ─────────────────────────────

type Media = 'stream' | 'tracker'

function enterFullscreen(frame: HTMLElement | null) {
  if (!frame) return
  if (frame.requestFullscreen) {
    void frame.requestFullscreen().catch(() => {})
    return
  }
  /* iOS Safari — only the video element can go fullscreen. */
  const video = frame.querySelector('video') as
    (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
  video?.webkitEnterFullscreen?.()
}

function MediaPanel({ model }: { model: SportsEventModel }) {
  const { loggedIn } = useShell()
  const [media, setMedia] = useState<Media>('stream')
  const frameRef = useRef<HTMLDivElement>(null)
  const canFullscreen = media === 'stream' && loggedIn && !!model.event.live
  return (
    <section data-name="event-media" className={cn(CARD, 'overflow-hidden')}>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <span className="text-sm font-medium text-foreground">
          {media === 'stream'
            ? 'Live Stream'
            : model.sport === 'nfl'
              ? 'Game Tracker'
              : 'Match Tracker'}
        </span>
        <div className="flex items-center gap-1.5">
          {canFullscreen ? (
            <LumenTooltip label="Fullscreen" side="bottom">
              <button
                type="button"
                aria-label="Watch fullscreen"
                onClick={() => enterFullscreen(frameRef.current)}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <IconMaximize className="size-[18px]" stroke={1.5} />
              </button>
            </LumenTooltip>
          ) : null}
          {canFullscreen ? <span className="mx-0.5 h-5 w-px bg-border" aria-hidden /> : null}
          <div role="tablist" aria-label="Live media" className="flex items-center gap-1.5">
            {(
              [
                { id: 'stream', label: 'Live Stream', icon: IconPlayerPlayFilled },
                {
                  id: 'tracker',
                  label: model.sport === 'nfl' ? 'Game Tracker' : 'Match Tracker',
                  icon: IconSoccerField,
                },
              ] as const
            ).map((tab) => {
              const on = media === tab.id
              const Icon = tab.icon
              return (
                <LumenTooltip key={tab.id} label={tab.label} side="bottom">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-label={tab.label}
                    onClick={() => setMedia(tab.id)}
                    className={cn(
                      'inline-flex size-9 items-center justify-center rounded-lg border outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                      on
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <Icon className="size-[18px]" stroke={1.5} />
                  </button>
                </LumenTooltip>
              )
            })}
          </div>
        </div>
      </div>
      {media === 'stream' ? (
        <LiveStream model={model} frameRef={frameRef} />
      ) : model.sport === 'nfl' ? (
        <FieldTracker model={model} />
      ) : (
        <PitchTracker model={model} />
      )}
    </section>
  )
}

function LiveStream({
  model,
  frameRef,
}: {
  model: SportsEventModel
  frameRef: RefObject<HTMLDivElement>
}) {
  const { loggedIn, openAuth } = useShell()
  const [muted, setMuted] = useState(true)
  const { event } = model
  const [left, right] = sidesOf(model)
  const s = event.score ?? [0, 0]
  const scoreOf = (side: Side) => (side === 'home' ? s[0] : s[1])

  return (
    <div ref={frameRef} className="relative aspect-video w-full overflow-hidden bg-black">
      <video
        src={model.streamSrc}
        className={cn(
          'absolute inset-0 size-full object-cover',
          !loggedIn && 'scale-105 blur-md brightness-50',
        )}
        autoPlay
        muted={muted}
        loop
        playsInline
      />
      {loggedIn ? (
        <>
          <div className="pointer-events-none absolute left-2.5 top-2.5 flex items-center gap-2 rounded-md bg-black/65 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <span>{teamAbbr(event, left)}</span>
            <span className="tabular-nums">
              {scoreOf(left)} - {scoreOf(right)}
            </span>
            <span>{teamAbbr(event, right)}</span>
            <span className="h-3 w-px bg-white/25" />
            <span className="font-medium text-white/80">{event.when}</span>
          </div>
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1">
            <StreamButton label={muted ? 'Unmute' : 'Mute'} onClick={() => setMuted((m) => !m)}>
              {muted ? (
                <IconVolumeOff className="size-4" stroke={1.5} />
              ) : (
                <IconVolume className="size-4" stroke={1.5} />
              )}
            </StreamButton>
            <StreamButton label="Fullscreen" onClick={() => enterFullscreen(frameRef.current)}>
              <IconMaximize className="size-4" stroke={1.5} />
            </StreamButton>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white">
          <span className="text-base font-semibold">
            Watch this {model.sport === 'nfl' ? 'game' : 'match'} live
          </span>
          <span className="max-w-[260px] text-sm text-white/75">
            Login to stream it here while you bet.
          </span>
          <div className="mt-1 flex gap-2">
            <Button size="sm" onClick={() => openAuth('login')}>
              Login
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => openAuth('join')}
              className="bg-white text-[#1a1a1a] hover:bg-white/90"
            >
              Join
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function StreamButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-8 items-center justify-center rounded-md border border-white/15 bg-black/70 text-white backdrop-blur-sm transition-colors hover:bg-black/85"
    >
      {children}
    </button>
  )
}

function useBeat(beats: TrackerBeat[]) {
  const [beat, setBeat] = useState(0)
  useEffect(() => {
    if (beats.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setBeat((n) => (n + 1) % beats.length), 2600)
    return () => window.clearInterval(id)
  }, [beats.length])
  return { index: beat, beat: beats[beat] }
}

function BeatPill({
  color,
  team,
  label,
  k,
}: {
  color: string
  team: string
  label: string
  k: number
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-2.5 flex justify-center">
      <span
        key={k}
        style={{ background: mix('--background', 85) }}
        className="inline-flex animate-in fade-in items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm"
      >
        <span className="size-2 rounded-full" style={{ background: color }} />
        {team}
        <span className="text-muted-foreground">{label}</span>
      </span>
    </div>
  )
}

function PitchTracker({ model }: { model: SportsEventModel }) {
  const beats = model.live?.beats ?? []
  const { index, beat: b } = useBeat(beats)
  const possession = model.live?.possession ?? [50, 50]
  if (!b) return null

  const color = b.side === 'home' ? HOME : AWAY
  const team = teamAbbr(model.event, b.side)
  const zoneOpacity = b.zone === 'safe' ? 0 : b.zone === 'attack' ? 0.22 : 0.4

  return (
    <div data-name="match-tracker" className="bg-secondary p-4">
      <div className="relative overflow-hidden rounded-md">
        <svg
          viewBox="0 0 100 64"
          className="block w-full"
          role="img"
          aria-label={`${team}: ${b.label}`}
        >
          <defs>
            <linearGradient id="trk-zone-home" x1="0" x2="1">
              <stop offset="0" stopColor={HOME} stopOpacity="0" />
              <stop offset="1" stopColor={HOME} stopOpacity="1" />
            </linearGradient>
            <linearGradient id="trk-zone-away" x1="1" x2="0">
              <stop offset="0" stopColor={AWAY} stopOpacity="0" />
              <stop offset="1" stopColor={AWAY} stopOpacity="1" />
            </linearGradient>
          </defs>
          {Array.from({ length: 10 }).map((_, i) => (
            <rect
              key={i}
              x={i * 10}
              y={0}
              width={10}
              height={64}
              style={{ fill: i % 2 ? mix('--foreground', 3) : 'transparent' }}
            />
          ))}
          <rect
            x={b.side === 'home' ? 50 : 0}
            y={0}
            width={50}
            height={64}
            fill={`url(#trk-zone-${b.side})`}
            style={{ opacity: zoneOpacity, transition: 'opacity 600ms ease, x 600ms ease' }}
          />
          <g fill="none" style={{ stroke: mix('--foreground', 28) }} strokeWidth={0.35}>
            <rect x={0.5} y={0.5} width={99} height={63} rx={0.5} />
            <line x1={50} y1={0.5} x2={50} y2={63.5} />
            <circle cx={50} cy={32} r={8.7} />
            <rect x={0.5} y={12.8} width={15.7} height={38.4} />
            <rect x={83.8} y={12.8} width={15.7} height={38.4} />
            <rect x={0.5} y={23.3} width={5.2} height={17.4} />
            <rect x={94.3} y={23.3} width={5.2} height={17.4} />
            <path d="M16.2 26 A8.7 8.7 0 0 1 16.2 38" />
            <path d="M83.8 26 A8.7 8.7 0 0 0 83.8 38" />
          </g>
          <g style={{ fill: mix('--foreground', 35) }}>
            <circle cx={50} cy={32} r={0.6} />
            <circle cx={10.5} cy={32} r={0.5} />
            <circle cx={89.5} cy={32} r={0.5} />
          </g>
          <g
            style={{
              transform: `translate(${b.x}px, ${b.y ?? 32}px)`,
              transition: 'transform 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {b.zone === 'danger' ? (
              <circle
                r={3.2}
                fill={color}
                className="animate-ping"
                style={{ transformBox: 'fill-box', transformOrigin: 'center', opacity: 0.35 }}
              />
            ) : null}
            <circle
              r={1.5}
              style={{ fill: 'var(--foreground)', stroke: 'var(--background)' }}
              strokeWidth={0.5}
            />
          </g>
        </svg>
        <BeatPill color={color} team={team} label={b.label} k={index} />
      </div>

      <div className="flex items-center gap-3 border-t border-border bg-card px-4 py-3 text-xs">
        <span className="w-8 font-semibold tabular-nums text-foreground">{possession[0]}%</span>
        <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <span style={{ width: `${possession[0]}%`, background: HOME }} />
          <span className="w-0.5 bg-card" />
          <span style={{ width: `${possession[1]}%`, background: AWAY }} />
        </div>
        <span className="w-8 text-right font-semibold tabular-nums text-foreground">
          {possession[1]}%
        </span>
      </div>
    </div>
  )
}

/** Top-down field, home goal line on the left. Ball spot = yards from the home goal line. */
function FieldTracker({ model }: { model: SportsEventModel }) {
  const beats = model.live?.beats ?? []
  const { index, beat: b } = useBeat(beats)
  if (!b) return null
  const { event } = model
  const color = b.side === 'home' ? HOME : AWAY
  const team = teamAbbr(event, b.side)
  const X = (yd: number) => 10 + yd
  const start = beats[0]?.x ?? b.x
  const spot = (yd: number) =>
    yd === 50 ? '50' : yd < 50 ? `${event.homeAbbr} ${yd}` : `${event.awayAbbr} ${100 - yd}`
  const numbers = [10, 20, 30, 40, 50, 60, 70, 80, 90]

  return (
    <div data-name="game-tracker" className="bg-secondary p-4">
      <div className="relative overflow-hidden rounded-md">
        <svg
          viewBox="0 0 120 54"
          className="block w-full"
          role="img"
          aria-label={`${team}: ${b.label}`}
        >
          <rect x={0} y={0} width={10} height={54} style={{ fill: mix('--chart-1', 26) }} />
          <rect x={110} y={0} width={10} height={54} style={{ fill: mix('--chart-2', 26) }} />
          {Array.from({ length: 10 }).map((_, i) => (
            <rect
              key={i}
              x={10 + i * 10}
              y={0}
              width={10}
              height={54}
              style={{ fill: i % 2 ? mix('--foreground', 3) : 'transparent' }}
            />
          ))}
          <text
            x={5}
            y={27}
            textAnchor="middle"
            dominantBaseline="central"
            transform="rotate(-90 5 27)"
            style={{
              fill: mix('--foreground', 45),
              fontSize: 3.4,
              fontWeight: 700,
              letterSpacing: 0.6,
            }}
          >
            {event.homeAbbr}
          </text>
          <text
            x={115}
            y={27}
            textAnchor="middle"
            dominantBaseline="central"
            transform="rotate(90 115 27)"
            style={{
              fill: mix('--foreground', 45),
              fontSize: 3.4,
              fontWeight: 700,
              letterSpacing: 0.6,
            }}
          >
            {event.awayAbbr}
          </text>
          <g style={{ stroke: mix('--foreground', 22) }} strokeWidth={0.3}>
            {Array.from({ length: 21 }).map((_, i) => (
              <line
                key={i}
                x1={10 + i * 5}
                y1={0.5}
                x2={10 + i * 5}
                y2={53.5}
                style={i === 0 || i === 20 ? { stroke: mix('--foreground', 45) } : undefined}
                strokeWidth={i === 0 || i === 20 ? 0.5 : 0.3}
              />
            ))}
            {Array.from({ length: 99 }).map((_, i) => (
              <g key={`h${i}`}>
                <line x1={11 + i} y1={21.8} x2={11 + i} y2={22.8} />
                <line x1={11 + i} y1={31.2} x2={11 + i} y2={32.2} />
              </g>
            ))}
            <rect x={0.25} y={0.25} width={119.5} height={53.5} fill="none" />
          </g>
          {numbers.map((n) => {
            const label = n <= 50 ? n : 100 - n
            return (
              <g key={n} style={{ fill: mix('--foreground', 30), fontSize: 3.6, fontWeight: 600 }}>
                <text x={X(n)} y={9} textAnchor="middle">
                  {label}
                </text>
                <text x={X(n)} y={47.5} textAnchor="middle">
                  {label}
                </text>
              </g>
            )
          })}
          {/* Drive so far */}
          <rect
            x={Math.min(X(start), X(b.x))}
            y={25.6}
            width={Math.abs(X(start) - X(b.x))}
            height={2.8}
            rx={1.4}
            style={{
              fill: b.side === 'home' ? mix('--chart-1', 45) : mix('--chart-2', 45),
              transition:
                'x 1200ms cubic-bezier(0.22,1,0.36,1), width 1200ms cubic-bezier(0.22,1,0.36,1)',
            }}
          />
          {b.firstDownAt != null ? (
            <line
              x1={X(b.firstDownAt)}
              y1={0.5}
              x2={X(b.firstDownAt)}
              y2={53.5}
              strokeWidth={0.6}
              style={{ stroke: 'var(--warning)', transition: 'x1 1200ms ease, x2 1200ms ease' }}
            />
          ) : null}
          <line
            x1={X(b.x)}
            y1={0.5}
            x2={X(b.x)}
            y2={53.5}
            strokeWidth={0.6}
            style={{ stroke: color, transition: 'x1 1200ms ease, x2 1200ms ease' }}
          />
          <g
            style={{
              transform: `translate(${X(b.x)}px, 27px)`,
              transition: 'transform 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <ellipse
              rx={1.9}
              ry={1.15}
              style={{ fill: 'var(--foreground)', stroke: 'var(--background)' }}
              strokeWidth={0.4}
            />
          </g>
        </svg>
        <BeatPill color={color} team={team} label={b.label} k={index} />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border bg-card px-4 py-3 text-xs">
        <span className="inline-flex items-center gap-2 font-semibold text-foreground">
          <span className="size-2 rounded-full" style={{ background: color }} />
          {b.down ? `${b.down} at ${spot(b.x)}` : spot(b.x)}
        </span>
        {model.live?.drive ? (
          <span className="text-muted-foreground">Drive {model.live.drive}</span>
        ) : null}
      </div>
    </div>
  )
}

// ─── Live stats + timeline ────────────────────────────────────

function LiveStatsCard({ model }: { model: SportsEventModel }) {
  const [view, setView] = useState<'stats' | 'timeline'>('stats')
  const live = model.live
  if (!live) return null
  return (
    <section data-name="event-live-stats" className={cn(CARD, 'overflow-hidden')}>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <Tabs value={view} onValueChange={(v) => setView(v as 'stats' | 'timeline')}>
          <TabsList>
            <TabsTrigger value="stats" className="px-3">
              Stats
            </TabsTrigger>
            <TabsTrigger value="timeline" className="px-3">
              {model.sport === 'nfl' ? 'Scoring' : 'Timeline'}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <TeamKey model={model} />
      </div>
      {view === 'stats' ? (
        <div className="flex flex-col gap-3.5 px-4 pb-4 pt-1">
          {live.stats.map((row) => (
            <StatBar key={row.label} row={row} awayFirst={model.awayFirst} />
          ))}
        </div>
      ) : (
        <Timeline model={model} incidents={live.incidents} />
      )}
    </section>
  )
}

function TeamKey({ model }: { model: SportsEventModel }) {
  return (
    <span className="flex items-center gap-3 text-xs text-muted-foreground">
      {sidesOf(model).map((side) => (
        <span key={side} className="inline-flex items-center gap-1.5">
          <span
            className="size-2 rounded-full"
            style={{ background: side === 'home' ? HOME : AWAY }}
          />
          {teamAbbr(model.event, side)}
        </span>
      ))}
    </span>
  )
}

function fmtStat(v: number, format?: EventStatRow['format']) {
  if (format === 'clock') return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`
  return String(v)
}

function StatBar({ row, awayFirst }: { row: EventStatRow; awayFirst: boolean }) {
  const [h, a] = row.values
  const [l, r] = awayFirst ? [a, h] : [h, a]
  const [lc, rc] = awayFirst ? [AWAY, HOME] : [HOME, AWAY]
  const total = l + r || 1
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-semibold tabular-nums text-foreground">{fmtStat(l, row.format)}</span>
        <span className="text-muted-foreground">{row.label}</span>
        <span className="font-semibold tabular-nums text-foreground">{fmtStat(r, row.format)}</span>
      </div>
      <div className="flex gap-1">
        <div className="flex h-1.5 flex-1 justify-end overflow-hidden rounded-full bg-secondary">
          <span
            className="rounded-full"
            style={{ width: `${(l / total) * 100}%`, background: lc }}
          />
        </div>
        <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
          <span
            className="rounded-full"
            style={{ width: `${(r / total) * 100}%`, background: rc }}
          />
        </div>
      </div>
    </div>
  )
}

function IncidentGlyph({ kind }: { kind: EventIncident['kind'] }) {
  if (kind === 'goal') return <IconBallFootball className="size-4 text-foreground" stroke={1.5} />
  if (kind === 'td')
    return <IconBallAmericanFootball className="size-4 text-foreground" stroke={1.5} />
  if (kind === 'fg' || kind === 'safety')
    return (
      <span className="inline-flex h-4 min-w-5 items-center justify-center rounded-[4px] bg-secondary px-1 text-[9px] font-bold text-foreground">
        {kind === 'fg' ? 'FG' : 'SF'}
      </span>
    )
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block h-3.5 w-2.5 rounded-[2px]',
        kind === 'red' ? 'bg-destructive' : 'bg-warning',
      )}
    />
  )
}

function Timeline({ model, incidents }: { model: SportsEventModel; incidents: EventIncident[] }) {
  const ordered = [...incidents].sort((x, y) => y.at - x.at)
  const [leftSide] = sidesOf(model)
  const scoreText = (s: [number, number]) =>
    model.awayFirst ? `${s[1]}-${s[0]}` : `${s[0]}-${s[1]}`
  return (
    <ol className="flex flex-col px-4 pb-3">
      {ordered.map((i) => {
        const team = teamName(model.event, i.side)
        const right = i.side !== leftSide
        const kindLabel =
          i.kind === 'td'
            ? 'Touchdown'
            : i.kind === 'fg'
              ? 'Field goal'
              : i.kind === 'safety'
                ? 'Safety'
                : null
        return (
          <li
            key={`${i.at}-${i.player}`}
            className={cn(
              'flex items-center gap-3 border-b border-border py-2.5 last:border-b-0',
              right && 'flex-row-reverse text-right',
            )}
          >
            <span className="w-14 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
              {i.label}
            </span>
            <span className="flex size-5 shrink-0 items-center justify-center">
              <IncidentGlyph kind={i.kind} />
            </span>
            <span className="min-w-0 flex-1">
              <Typography as="span" shape="small" weight="medium" className="block truncate">
                {i.player}
              </Typography>
              <Typography as="span" shape="xs" variant="muted" className="block truncate">
                {kindLabel
                  ? [kindLabel, i.detail, i.score ? scoreText(i.score) : null]
                      .filter(Boolean)
                      .join(' · ')
                  : (i.detail ?? team)}
              </Typography>
            </span>
          </li>
        )
      })}
      <li className="flex items-center justify-center gap-2 py-2.5 text-xs text-muted-foreground">
        {model.sport === 'nfl' ? 'Kickoff' : 'Kick off'}
      </li>
    </ol>
  )
}

// ─── Pregame ──────────────────────────────────────────────────

function SideCard({
  title,
  children,
  action,
}: {
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section className={cn(CARD, 'px-4 pb-4 pt-3.5')}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <Typography as="h2" shape="small" weight="semibold">
          {title}
        </Typography>
        {action}
      </div>
      {children}
    </section>
  )
}

function WinProbabilityCard({ model }: { model: SportsEventModel }) {
  const { event, info } = model
  const [ph, pd, pa] = info.winProb
  const pct = (p: number) => Math.round(p * 100)
  const team = (side: Side) => ({
    label: teamAbbr(event, side),
    team: teamName(event, side),
    value: pct(side === 'home' ? ph : pa),
    color: side === 'home' ? HOME : AWAY,
  })
  const [l, r] = sidesOf(model)
  const segments: { label: string; team?: string; value: number; color: string }[] =
    pd > 0.001
      ? [team(l), { label: 'Tie', value: pct(pd), color: 'var(--muted-foreground)' }, team(r)]
      : [team(l), team(r)]
  return (
    <SideCard title={event.live ? 'Win probability' : 'Who wins?'}>
      <div className="flex h-2 gap-1">
        {segments.map((s) => (
          <span
            key={s.label}
            className="rounded-full"
            style={{ width: `${s.value}%`, background: s.color, opacity: s.team ? 1 : 0.35 }}
          />
        ))}
      </div>
      <div
        className={cn('mt-3 grid text-xs', segments.length === 3 ? 'grid-cols-3' : 'grid-cols-2')}
      >
        {segments.map((s, i) => (
          <span
            key={s.label}
            className={cn(
              'flex items-center gap-1.5',
              segments.length === 3 && i === 1 && 'justify-center',
              i === segments.length - 1 && 'justify-end',
            )}
          >
            {s.team ? <BoardTeamBadge name={s.team} /> : null}
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-semibold tabular-nums text-foreground">{s.value}%</span>
          </span>
        ))}
      </div>
    </SideCard>
  )
}

const FORM_CHIP: Record<FormResult, string> = {
  W: 'bg-success text-success-foreground',
  D: 'bg-secondary text-muted-foreground',
  L: 'bg-destructive text-destructive-foreground',
}

function FormRow({ team, form }: { team: string; form: FormResult[] }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <BoardTeamBadge name={team} />
        <Typography as="span" shape="small" className="truncate">
          {team}
        </Typography>
      </span>
      <span className="flex shrink-0 gap-1" aria-label={`Last five: ${form.join(' ')}`}>
        {form.map((r, i) => (
          <span
            key={i}
            className={cn(
              'inline-flex size-6 items-center justify-center rounded-md text-[11px] font-semibold',
              FORM_CHIP[r],
            )}
          >
            {r}
          </span>
        ))}
      </span>
    </div>
  )
}

function PreMatchCards({ model }: { model: SportsEventModel }) {
  const { event, info } = model
  const noTies = model.sport === 'nfl'
  const tally = info.h2h.reduce(
    (acc, m) => {
      const homeGoals = m.home === event.home ? m.score[0] : m.score[1]
      const awayGoals = m.home === event.home ? m.score[1] : m.score[0]
      if (homeGoals > awayGoals) acc.home++
      else if (homeGoals === awayGoals) acc.tie++
      else acc.away++
      return acc
    },
    { home: 0, tie: 0, away: 0 },
  )
  const [l, r] = sidesOf(model)
  const tiles = [
    { n: tally[l], l: `${teamAbbr(event, l)} wins` },
    ...(noTies ? [] : [{ n: tally.tie, l: 'Ties' }]),
    { n: tally[r], l: `${teamAbbr(event, r)} wins` },
  ]

  return (
    <>
      <SideCard
        title="Form"
        action={
          <Typography as="span" shape="xs" variant="muted">
            Last 5
          </Typography>
        }
      >
        <div className="flex flex-col gap-3">
          {[l, r].map((side) => (
            <FormRow
              key={side}
              team={teamName(event, side)}
              form={side === 'home' ? info.homeForm : info.awayForm}
            />
          ))}
        </div>
      </SideCard>

      <SideCard title="Head to head">
        <div
          className={cn(
            'mb-3 grid rounded-lg bg-secondary py-2.5 text-center',
            tiles.length === 3 ? 'grid-cols-3' : 'grid-cols-2',
          )}
        >
          {tiles.map((t) => (
            <span key={t.l} className="flex flex-col gap-0.5">
              <span className="text-lg font-bold tabular-nums leading-6 text-foreground">
                {t.n}
              </span>
              <span className="text-[11px] text-muted-foreground">{t.l}</span>
            </span>
          ))}
        </div>
        <ul className="flex flex-col">
          {info.h2h.map((m) => (
            <li
              key={m.date}
              className="grid grid-cols-[76px_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b border-border py-2 text-xs last:border-b-0"
            >
              <span className="text-muted-foreground">{m.date}</span>
              <span className="flex min-w-0 items-center justify-end gap-1.5">
                <span className="truncate text-right">{model.awayFirst ? m.away : m.home}</span>
                <BoardTeamBadge name={model.awayFirst ? m.away : m.home} />
              </span>
              <span className="rounded-md bg-secondary px-2 py-0.5 font-semibold tabular-nums">
                {model.awayFirst ? `${m.score[1]}-${m.score[0]}` : `${m.score[0]}-${m.score[1]}`}
              </span>
              <span className="flex min-w-0 items-center gap-1.5">
                <BoardTeamBadge name={model.awayFirst ? m.home : m.away} />
                <span className="truncate">{model.awayFirst ? m.home : m.away}</span>
              </span>
            </li>
          ))}
        </ul>
      </SideCard>

      <SideCard title={model.sport === 'nfl' ? 'Game info' : 'Match info'}>
        <dl className="flex flex-col gap-2.5 text-sm">
          {info.rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="truncate text-right text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      </SideCard>
    </>
  )
}
