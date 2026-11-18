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
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IconCheck,
  IconCopy,
  IconDownload,
  IconFileText,
  IconPlayerPause,
  IconPlayerPlay,
  IconX,
} from '@tabler/icons-react'
import { CasinoLiveWinsCarousel } from '@/components/lumen/casino-live-wins-carousel'
import {
  SoccerBetslip,
  type SoccerSlipPick,
} from '@/components/lumen/soccer-betslip'
import { useShell } from '@/components/site/shell-context'
import { revealShellDock } from '@/components/site/shell-scroll'
import { flyBetDotToSlip } from '@/lib/lumen/vip-celebrate'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import {
  activityGameFromTitle,
} from '@/lib/lumen/casino-lobby-catalog'
import {
  BA_ACTIVITY_TICK_MS,
  BA_ACTIVITY_VISIBLE,
  BA_PRD_URL,
  isGradedBetStatus,
  type BaBetStatus,
  BA_VARIANTS,
  filterPool,
  filtersForVariant,
  padFeedPool,
  poolForVariant,
  rowHeightClass,
  rowHeightCss,
  type BaCrown,
  type BaFeedRow,
  type BaFilter,
  type BaOpenSportsBet,
  type BaParlayLeg,
  type BaParlayRow,
  type BaSportsRow,
  type BaVariant,
} from '@/lib/lumen/ba-workshop'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const
const PILL_COVER_MS = 240

const VIP_CROWN_PATH =
  'M4.7063 17.875C4.24606 17.875 3.87297 17.5019 3.87297 17.0417V16.9583C3.87297 16.4981 4.24606 16.125 4.7063 16.125H15.2896C15.7499 16.125 16.123 16.4981 16.123 16.9583V17.0417C16.123 17.5019 15.7499 17.875 15.2896 17.875H4.7063ZM4.58435 14.8125C4.17459 14.8125 3.82564 14.5146 3.76134 14.1099L2.75734 7.79062C2.72817 7.79062 2.69536 7.79427 2.6589 7.80156C2.62244 7.80885 2.58963 7.8125 2.56047 7.8125C2.19588 7.8125 1.88599 7.6849 1.63078 7.42969C1.37557 7.17448 1.24797 6.86458 1.24797 6.5C1.24797 6.13542 1.37557 5.82552 1.63078 5.57031C1.88599 5.3151 2.19588 5.1875 2.56047 5.1875C2.92505 5.1875 3.23494 5.3151 3.49015 5.57031C3.74536 5.82552 3.87297 6.13542 3.87297 6.5C3.87297 6.60208 3.86203 6.69687 3.84015 6.78437C3.81828 6.87187 3.79276 6.95208 3.76359 7.025L6.19023 8.11213C6.36969 8.19253 6.58092 8.13652 6.69696 7.97777L9.23234 4.50937C9.07192 4.39271 8.94067 4.23958 8.83859 4.05C8.73651 3.86042 8.68546 3.65625 8.68546 3.4375C8.68546 3.07292 8.81307 2.76302 9.06828 2.50781C9.32349 2.2526 9.63338 2.125 9.99797 2.125C10.3625 2.125 10.6724 2.2526 10.9277 2.50781C11.1829 2.76302 11.3105 3.07292 11.3105 3.4375C11.3105 3.65625 11.2594 3.86042 11.1573 4.05C11.0553 4.23958 10.924 4.39271 10.7636 4.50937L13.299 7.97777C13.415 8.13652 13.6262 8.19253 13.8057 8.11213L16.2323 7.025C16.2032 6.95208 16.1777 6.87187 16.1558 6.78437C16.1339 6.69687 16.123 6.60208 16.123 6.5C16.123 6.13542 16.2506 5.82552 16.5058 5.57031C16.761 5.3151 17.0709 5.1875 17.4355 5.1875C17.8 5.1875 18.1099 5.3151 18.3652 5.57031C18.6204 5.82552 18.748 6.13542 18.748 6.5C18.748 6.86458 18.6204 7.17448 18.3652 7.42969C18.1099 7.6849 17.8 7.8125 17.4355 7.8125C17.4063 7.8125 17.3735 7.80885 17.337 7.80156C17.3006 7.79427 17.2678 7.79062 17.2386 7.79062L16.2346 14.1099C16.1703 14.5146 15.8213 14.8125 15.4116 14.8125H4.58435Z'

function Crown({ tone }: { tone: BaCrown }) {
  const fill = tone === 'gold' ? '#E39E3D' : tone === 'purple' ? '#A855F7' : '#CBD5E1'
  return (
    <svg viewBox="0 0 20 20" className="size-3.5 shrink-0" aria-hidden>
      <path fill={fill} d={VIP_CROWN_PATH} />
    </svg>
  )
}

function WorkshopFilterTrack({
  filters,
  active,
  onChange,
  label,
}: {
  filters: BaFilter[]
  active: string
  onChange: (id: string) => void
  label: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState({ x: 0, w: 0, ready: false })
  const [coveredId, setCoveredId] = useState<string | null>(active)
  const firstCover = useRef(true)

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
  }, [active, filters, measureThumb])

  useEffect(() => {
    if (firstCover.current) {
      firstCover.current = false
      setCoveredId(active)
      return
    }
    setCoveredId(null)
    const id = window.setTimeout(() => setCoveredId(active), PILL_COVER_MS)
    return () => window.clearTimeout(id)
  }, [active])

  return (
    <div data-name="ba-filter-track" className="-mx-6 mb-4 md:mx-0">
      <div className="min-w-0 w-full md:relative md:w-max md:max-w-full md:overflow-hidden md:rounded-full">
        <div className="scrollbar-hide w-full min-w-0 overflow-x-auto overflow-y-hidden">
          <div
            ref={trackRef}
            className="relative mx-6 flex h-12 w-max items-center gap-1 rounded-full bg-secondary p-0.5 md:mx-0"
            role="tablist"
            aria-label={label}
          >
            <span
              aria-hidden
              data-sub-menu-thumb=""
              className="pointer-events-none absolute top-0.5 h-11 rounded-full bg-primary transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ left: thumb.x, width: thumb.w, opacity: thumb.ready ? 1 : 0 }}
            />
            {filters.map((item) => {
              const on = item.id === active
              const covered = item.id === coveredId
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  data-sub-menu-pill=""
                  data-active={on ? 'true' : 'false'}
                  onClick={() => onChange(item.id)}
                  className={cn(
                    'shell-chrome-btn relative z-10 h-11 shrink-0 rounded-full bg-transparent px-4 text-sm leading-5',
                    'transition-[transform,background-color,color] duration-150 active:scale-[0.97]',
                    covered
                      ? 'font-medium text-primary-foreground'
                      : 'font-normal text-muted-foreground hover:bg-[var(--surface-muted-3)] hover:text-foreground',
                  )}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function PlayToggle({ live, onToggle }: { live: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-label={live ? 'Pause live feed' : 'Resume live feed'}
      aria-pressed={live}
      onClick={onToggle}
      className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-secondary text-foreground transition-colors hover:bg-muted"
    >
      {live ? (
        <IconPlayerPlay className="size-3.5" stroke={2} />
      ) : (
        <IconPlayerPause className="size-3.5" stroke={2} />
      )}
    </button>
  )
}

function TeamLogo({
  src,
  name,
  className,
}: {
  src: string
  name: string
  className?: string
}) {
  const [failed, setFailed] = useState(!src)
  if (failed || !src) {
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join('')
    return (
      <span
        className={cn(
          'inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-muted-3 text-[8px] font-semibold text-muted-foreground ring-1 ring-background',
          className,
        )}
        aria-hidden
      >
        {initials}
      </span>
    )
  }
  return (
    <img
      src={src}
      alt=""
      className={cn(
        'size-5 shrink-0 rounded-full bg-white/5 object-contain ring-1 ring-background',
        className,
      )}
      onError={() => setFailed(true)}
    />
  )
}

/** One parlay leg as overlapping home/away avatars — no team names. */
function ParlayLegStack({
  leg,
  live,
}: {
  leg: BaParlayLeg
  live?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center',
        live && 'rounded-full ring-1 ring-destructive/50 ring-offset-1 ring-offset-card',
      )}
      title={`${leg.home} vs ${leg.away}`}
    >
      <TeamLogo src={leg.homeLogo} name={leg.home} className="relative z-[1]" />
      <TeamLogo src={leg.awayLogo} name={leg.away} className="relative -ml-1.5" />
    </span>
  )
}

/**
 * Matchup — teams free; score-only box, each number on its team row with a
 * hairline between scores.
 */
function MatchupBoard({
  home,
  homeLogo,
  away,
  awayLogo,
  score,
}: {
  home: string
  homeLogo: string
  away: string
  awayLogo: string
  score?: [number, number] | null
}) {
  return (
    <div className="inline-flex max-w-full items-stretch gap-1.5">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex h-5 min-w-0 items-center gap-2">
          <TeamLogo src={homeLogo} name={home} />
          <span className="min-w-0 truncate text-[13px] font-medium leading-4 text-foreground">
            {home}
          </span>
        </div>
        <div className="flex h-5 min-w-0 items-center gap-2">
          <TeamLogo src={awayLogo} name={away} />
          <span className="min-w-0 truncate text-[13px] font-medium leading-4 text-foreground">
            {away}
          </span>
        </div>
      </div>
      {score ? (
        <div
          className="grid shrink-0 grid-rows-2 overflow-hidden rounded-md border border-border bg-secondary tabular-nums"
          aria-label={`Score ${score[0]}–${score[1]}`}
        >
          <span className="flex h-5 min-w-[1.25rem] items-center justify-center px-1.5 text-[13px] font-semibold leading-none text-foreground">
            {score[0]}
          </span>
          <span className="flex h-5 min-w-[1.25rem] items-center justify-center border-t border-border px-1.5 text-[13px] font-semibold leading-none text-foreground">
            {score[1]}
          </span>
        </div>
      ) : null}
    </div>
  )
}

/**
 * Sportsbook matchup — teams outside; boxed score column when live.
 */
function MatchupCell({ row }: { row: BaSportsRow }) {
  const live = row.status === 'live'
  const graded = isGradedBetStatus(row.status)
  const score =
    (live || graded) && row.score != null ? row.score : null
  return (
    <div className="min-w-0 w-[min(42%,300px)] shrink-0 px-3">
      <div className="mb-1.5 flex items-center gap-1.5">
        {live ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium leading-none text-destructive">
            <IconPlayerPlay className="size-3 fill-current" stroke={0} />
            {row.when}
          </span>
        ) : (
          <span className="text-[11px] leading-none text-muted-foreground">{row.when}</span>
        )}
        <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
          {row.league}
        </span>
      </div>
      <MatchupBoard
        home={row.home}
        homeLogo={row.homeLogo}
        away={row.away}
        awayLogo={row.awayLogo}
        score={score}
      />
    </div>
  )
}

function SportsStatus({
  status,
  amountWon,
}: {
  status: BaBetStatus
  /** Graded wins — Status shows payout amount, not the word “Won”. */
  amountWon?: string
}) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1 font-medium text-destructive">
        <IconPlayerPlay className="size-3 fill-current" stroke={0} />
        Live
      </span>
    )
  }
  if (status === 'won') {
    return (
      <span className="font-medium tabular-nums text-success">
        {amountWon?.trim() || 'Won'}
      </span>
    )
  }
  if (status === 'lost') {
    return <span className="text-muted-foreground">Lost</span>
  }
  if (status === 'push') {
    return <span className="text-muted-foreground">Push</span>
  }
  return <span className="text-muted-foreground">Pending</span>
}

/**
 * Parlay Event — logo stacks per leg (no names). Distinct from straight matchups.
 * Live leg gets a light ring; Status column still Pending/Live for the whole bet.
 */
function ParlayMatchupCell({ row }: { row: BaParlayRow }) {
  const primary =
    row.status === 'live'
      ? (row.legs.find((l) => l.status === 'live') ?? row.legs[0]!)
      : row.legs[0]!
  const live = primary.status === 'live'
  const visible = row.legs.slice(0, 4)
  const overflow = row.legs.length - visible.length
  return (
    <div className="min-w-0 w-[min(42%,300px)] shrink-0 px-3">
      <div className="mb-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <span className="text-[11px] font-semibold leading-none text-foreground">
          {row.legs.length}-Pick Parlay
        </span>
        {live ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium leading-none text-destructive">
            <IconPlayerPlay className="size-3 fill-current" stroke={0} />
            {primary.when}
          </span>
        ) : (
          <span className="text-[11px] leading-none text-muted-foreground">{primary.when}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {visible.map((leg, i) => (
          <ParlayLegStack
            key={`${leg.home}-${leg.away}-${i}`}
            leg={leg}
            live={leg.status === 'live'}
          />
        ))}
        {overflow > 0 ? (
          <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
            +{overflow}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function ParlaySelection({ row }: { row: BaParlayRow }) {
  const preview = row.legs
    .slice(0, 2)
    .map((l) => l.selection)
    .join(' · ')
  const extra = row.legs.length > 2 ? ` +${row.legs.length - 2}` : ''
  return (
    <div className="min-w-0">
      <p className="truncate font-medium text-foreground">
        {row.legs.length}-Pick Parlay
      </p>
      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
        {preview}
        {extra}
      </p>
    </div>
  )
}

type LiveRow = BaFeedRow & { id: string }

function seedRows(pool: BaFeedRow[]): LiveRow[] {
  const source = pool.length > 0 ? pool : poolForVariant('casino')
  return source.slice(0, BA_ACTIVITY_VISIBLE).map((row, i) => ({
    ...row,
    id: `seed-${i}`,
  }))
}

function BaActivityTable({
  variant,
  filterId,
  onAddSportsPick,
}: {
  variant: BaVariant
  filterId: string
  onAddSportsPick: (row: BaOpenSportsBet, originEl?: HTMLElement | null) => void
}) {
  const { launchGame: openLauncher } = useShell()
  const pool = useMemo(
    () => padFeedPool(filterPool(variant, filterId, poolForVariant(variant))),
    [variant, filterId],
  )
  const [playing, setPlaying] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [rows, setRows] = useState<LiveRow[]>(() => seedRows(pool))
  const [launchingId, setLaunchingId] = useState<string | null>(null)
  const seqRef = useRef(0)
  const launchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const live = playing && !hovered
  const rh = rowHeightCss(variant)
  const rhClass = rowHeightClass(variant)

  useEffect(() => {
    seqRef.current = 0
    setRows(seedRows(pool))
  }, [pool])

  useEffect(() => {
    if (!live || pool.length === 0) return
    const push = () => {
      seqRef.current += 1
      const template = pool[seqRef.current % pool.length]!
      setRows((prev) =>
        [{ ...template, id: `live-${seqRef.current}-${Date.now()}` }, ...prev].slice(
          0,
          BA_ACTIVITY_VISIBLE,
        ),
      )
    }
    const tick = window.setInterval(push, BA_ACTIVITY_TICK_MS)
    return () => window.clearInterval(tick)
  }, [live, pool])

  useEffect(() => {
    return () => {
      if (launchTimer.current) clearTimeout(launchTimer.current)
    }
  }, [])

  const launchCasino = (row: Extract<LiveRow, { kind: 'casino' }>) => {
    if (launchingId) return
    setLaunchingId(row.id)
    openLauncher(activityGameFromTitle(row.game))
    if (launchTimer.current) clearTimeout(launchTimer.current)
    launchTimer.current = setTimeout(() => setLaunchingId(null), 900)
  }

  const sportsMode = variant === 'sports'
  const casinoMode = variant === 'casino'

  const desktopHeads = sportsMode
    ? ['User', 'Event', 'Selection', 'Odds', 'Stake', 'Status']
    : casinoMode
      ? ['User', 'Game', 'Bet Amount', 'Multiplier', 'Payout']
      : ['User', 'Detail', 'Line', 'Amount', 'Status']

  return (
    <section data-name="ba-activity" aria-label="Activity" className="px-6 pb-8">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <Typography as="h3" shape="h4" weight="semibold">
          Activity
        </Typography>
        <p className="text-[11px] tabular-nums text-muted-foreground">
          Tick {BA_ACTIVITY_TICK_MS}ms · hover pauses
        </p>
      </div>

      <div
        data-name="ba-activity-card"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]"
      >
        <div className="hidden h-[42px] items-center border-b border-border bg-surface-muted-1 text-sm font-medium text-muted-foreground md:flex">
          {desktopHeads.map((head) => (
            <div
              key={head}
              className={cn(
                'min-w-0 px-3',
                head === 'Event' || head === 'Detail'
                  ? 'w-[min(42%,300px)] shrink-0'
                  : 'flex-1',
              )}
            >
              {head}
            </div>
          ))}
          <div className="px-3">
            <PlayToggle live={live} onToggle={() => setPlaying((v) => !v)} />
          </div>
        </div>
        <div className="flex h-[42px] items-center border-b border-border bg-surface-muted-1 text-sm font-medium text-muted-foreground md:hidden">
          <span className="min-w-0 flex-1 px-3">
            {sportsMode ? 'Event' : casinoMode ? 'Game' : 'Activity'}
          </span>
          <div className="flex items-center gap-2 px-3">
            <span>{sportsMode ? 'Status' : 'Payout'}</span>
            <PlayToggle live={live} onToggle={() => setPlaying((v) => !v)} />
          </div>
        </div>

        <div
          className="relative overflow-hidden"
          style={{ height: `calc(${BA_ACTIVITY_VISIBLE} * ${rh})` }}
        >
          {pool.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted-foreground">
              No rows for this filter — try All.
            </p>
          ) : (
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
                      ease: EASE,
                      layout: { duration: 0.25, ease: EASE },
                    }}
                    className={cn(
                      'flex items-center overflow-hidden border-b border-border text-sm transition-colors last:border-b-0 hover:bg-surface-muted-1',
                      rhClass,
                      (row.kind === 'sports' || row.kind === 'parlay') &&
                        !isGradedBetStatus(row.status) &&
                        'cursor-pointer',
                      isGradedBetStatus(row.status) && 'cursor-default',
                    )}
                    onClick={
                      (row.kind === 'sports' || row.kind === 'parlay') &&
                      !isGradedBetStatus(row.status)
                        ? (e) => {
                            const target = e.target as HTMLElement
                            if (target.closest('button')) return
                            onAddSportsPick(row, e.currentTarget)
                          }
                        : undefined
                    }
                  >
                    <div className="hidden min-w-0 flex-1 px-3 md:block">
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <Crown tone={row.crown} />
                        <span className="truncate">{row.user}</span>
                      </span>
                    </div>

                    {row.kind === 'casino' ? (
                      <>
                        <div className="min-w-0 flex-1 px-3">
                          <button
                            type="button"
                            onClick={() => launchCasino(row)}
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
                                src={activityGameFromTitle(row.game).imageSrc}
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
                        </div>
                        <div className="hidden min-w-0 flex-1 px-3 md:block">{row.bet}</div>
                        <div className="hidden min-w-0 flex-1 px-3 md:block">{row.multi}</div>
                        <div
                          className={cn(
                            'min-w-0 shrink-0 px-3 text-right tabular-nums md:flex-1 md:text-left',
                            row.win ? 'text-success' : 'text-foreground',
                          )}
                        >
                          {row.payout}
                        </div>
                      </>
                    ) : row.kind === 'parlay' ? (
                      <>
                        <ParlayMatchupCell row={row} />
                        <div className="hidden min-w-0 flex-1 px-3 md:block">
                          <button
                            type="button"
                            className="w-full text-left hover:underline"
                            onClick={(e) => {
                              e.stopPropagation()
                              onAddSportsPick(row, e.currentTarget)
                            }}
                          >
                            <ParlaySelection row={row} />
                          </button>
                        </div>
                        <div className="hidden min-w-0 flex-1 px-3 tabular-nums md:block">
                          {row.odds}
                        </div>
                        <div className="hidden min-w-0 flex-1 px-3 tabular-nums md:block">
                          {row.stake}
                        </div>
                        <div className="min-w-0 shrink-0 px-3 text-right md:flex-1 md:text-left">
                          <SportsStatus status={row.status} amountWon={row.toWin} />
                        </div>
                      </>
                    ) : (
                      <>
                        <MatchupCell row={row} />
                        <div className="hidden min-w-0 flex-1 px-3 md:block">
                          {isGradedBetStatus(row.status) ? (
                            <span className="truncate font-medium">{row.selection}</span>
                          ) : (
                            <button
                              type="button"
                              className="truncate font-medium text-left hover:underline"
                              onClick={(e) => {
                                e.stopPropagation()
                                onAddSportsPick(row, e.currentTarget)
                              }}
                            >
                              {row.selection}
                            </button>
                          )}
                        </div>
                        <div className="hidden min-w-0 flex-1 px-3 tabular-nums md:block">
                          {row.odds}
                        </div>
                        <div className="hidden min-w-0 flex-1 px-3 tabular-nums md:block">
                          {row.stake}
                        </div>
                        <div className="min-w-0 shrink-0 px-3 text-right md:flex-1 md:text-left">
                          <SportsStatus status={row.status} amountWon={row.toWin} />
                        </div>
                      </>
                    )}

                    <div className="hidden w-11 shrink-0 md:block" aria-hidden />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  )
}

const BA_ARTIFACT_KEYS = new Set([
  'app/BA/page.tsx',
  'apps/live-site/app/BA/page.tsx',
  'components/lumen/ba-workshop-page.tsx',
  'lib/lumen/ba-workshop.ts',
  'public/ba/ACTIVITY_FEED_BEHAVIOUR.md',
  'ACTIVITY_FEED_BEHAVIOUR.md',
  'casino-lobby-page.tsx',
  'components/lumen/casino-lobby-page.tsx',
  'casino-live-wins-carousel.tsx',
  'components/lumen/casino-live-wins-carousel.tsx',
  'soccer-betslip.tsx',
  'components/lumen/soccer-betslip.tsx',
  'app/lumen.css',
  'Tokens',
  'tokens',
  'CasinoActivity',
  'CasinoLiveWinsCarousel',
  'SoccerBetslip',
  'useShell()',
  'useShell',
])

function isArtifactPath(code: string) {
  if (BA_ARTIFACT_KEYS.has(code)) return true
  if (code.includes('/') && /\.(tsx?|css|md)$/.test(code)) return true
  return false
}

function mdInline(
  text: string,
  onOpenArtifact?: (path: string) => void,
): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter((p) => p.length > 0)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      const code = part.slice(1, -1)
      if (onOpenArtifact && isArtifactPath(code)) {
        return (
          <button
            key={i}
            type="button"
            onClick={() => onOpenArtifact(code)}
            className="rounded-md border border-border bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {code}
          </button>
        )
      }
      return (
        <code
          key={i}
          className="rounded-md border border-border bg-secondary px-1 py-0.5 font-mono text-[11px] text-foreground"
        >
          {code}
        </code>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function simpleMarkdown(
  md: string,
  onOpenArtifact?: (path: string) => void,
): ReactNode[] {
  const blocks = md.replace(/\r\n/g, '\n').split(/\n{2,}/)
  return blocks.map((block, i) => {
    const line = block.trim()
    if (!line) return null
    if (line === '---') {
      return <hr key={i} className="border-border" />
    }
    if (line.startsWith('# ')) {
      return (
        <h1 key={i} className="text-xl font-semibold tracking-tight text-foreground">
          {mdInline(line.slice(2), onOpenArtifact)}
        </h1>
      )
    }
    if (line.startsWith('## ')) {
      return (
        <h2 key={i} className="mt-3 border-b border-border pb-2 text-base font-semibold text-foreground">
          {mdInline(line.slice(3), onOpenArtifact)}
        </h2>
      )
    }
    if (line.startsWith('### ')) {
      return (
        <h3 key={i} className="mt-2 text-sm font-semibold text-foreground">
          {mdInline(line.slice(4), onOpenArtifact)}
        </h3>
      )
    }
    if (line.startsWith('| ') && line.includes('|')) {
      const rows = line.split('\n').filter((r) => r.trim().startsWith('|'))
      const body = rows.filter((r) => !/^\|\s*-+/.test(r))
      return (
        <div key={i} className="overflow-x-auto rounded-[10px] border border-border bg-card">
          <table className="w-full min-w-[420px] text-left text-xs">
            <tbody>
              {body.map((r, ri) => {
                const cells = r
                  .split('|')
                  .slice(1, -1)
                  .map((c) => c.trim())
                const Tag = ri === 0 ? 'th' : 'td'
                return (
                  <tr key={ri} className={ri === 0 ? 'bg-surface-muted-1' : 'border-t border-border'}>
                    {cells.map((c, ci) => (
                      <Tag
                        key={ci}
                        className={cn(
                          'px-2.5 py-2 align-top leading-5',
                          ri === 0 ? 'font-medium text-muted-foreground' : 'text-foreground',
                        )}
                      >
                        {mdInline(c, onOpenArtifact)}
                      </Tag>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )
    }
    if (line.startsWith('```')) {
      const code = line.replace(/^```\w*\n?/, '').replace(/\n?```$/, '')
      return (
        <pre
          key={i}
          className="overflow-x-auto rounded-[10px] border border-border bg-secondary p-3 font-mono text-[11px] leading-5 text-foreground"
        >
          {code}
        </pre>
      )
    }
    if (
      line.startsWith('- ') ||
      line.startsWith('* ') ||
      /^\d+\.\s/.test(line) ||
      line.includes('\n- ') ||
      line.includes('\n* ')
    ) {
      const items = line.split('\n').filter(Boolean)
      const ordered = /^\d+\.\s/.test(items[0] ?? '')
      const List = ordered ? 'ol' : 'ul'
      return (
        <List
          key={i}
          className={cn(
            'space-y-1.5 pl-5 text-sm leading-5 text-muted-foreground',
            ordered ? 'list-decimal' : 'list-disc',
          )}
        >
          {items.map((item, ii) => (
            <li key={ii}>
              {mdInline(item.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, ''), onOpenArtifact)}
            </li>
          ))}
        </List>
      )
    }
    return (
      <p key={i} className="text-sm leading-6 text-muted-foreground">
        {mdInline(line, onOpenArtifact)}
      </p>
    )
  })
}

function PrdSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [md, setMd] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [portalReady, setPortalReady] = useState(false)
  const [artifactPath, setArtifactPath] = useState<string | null>(null)
  const [artifactText, setArtifactText] = useState<string>('')
  const [artifactFile, setArtifactFile] = useState<string>('')
  const [artifactError, setArtifactError] = useState<string | null>(null)
  const [artifactLoading, setArtifactLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [packBusy, setPackBusy] = useState(false)

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setError(null)
    fetch(`${BA_PRD_URL}?v=handover-4`)
      .then((r) => {
        if (!r.ok) throw new Error(`Could not load ${BA_PRD_URL}`)
        return r.text()
      })
      .then((text) => {
        if (!cancelled) setMd(text)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (!artifactPath) return
    let cancelled = false
    setArtifactLoading(true)
    setArtifactError(null)
    setArtifactText('')
    setArtifactFile('')
    setCopied(false)

    const load = async () => {
      /* Static preview files ship on CDN — works in prod without serverless fs. */
      try {
        const manRes = await fetch('/ba/preview/manifest.json')
        if (manRes.ok) {
          const manifest = (await manRes.json()) as Record<string, string>
          const slug = manifest[artifactPath]
          if (slug) {
            const fileRes = await fetch(`/ba/preview/${slug}.txt`)
            if (fileRes.ok) {
              const text = await fileRes.text()
              if (!cancelled) {
                setArtifactText(text)
                setArtifactFile(artifactPath)
              }
              return
            }
          }
        }
      } catch {
        /* fall through to API */
      }

      const r = await fetch(
        `/api/ba-artifact?path=${encodeURIComponent(artifactPath)}`,
      )
      const data = (await r.json()) as {
        text?: string
        path?: string
        error?: string
      }
      if (!r.ok) throw new Error(data.error || 'Could not load file')
      if (!cancelled) {
        setArtifactText(data.text ?? '')
        setArtifactFile(data.path ?? artifactPath)
      }
    }

    load()
      .catch((e: Error) => {
        if (!cancelled) setArtifactError(e.message)
      })
      .finally(() => {
        if (!cancelled) setArtifactLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [artifactPath])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (artifactPath) {
          setArtifactPath(null)
          return
        }
        onOpenChange(false)
      }
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onOpenChange, artifactPath])

  const downloadPack = async () => {
    setPackBusy(true)
    try {
      const res = await fetch('/api/ba-handover-pack')
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'activity-feed-handover.zip'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      /* ignore — button resets */
    } finally {
      setPackBusy(false)
    }
  }

  const copyArtifact = async () => {
    if (!artifactText) return
    try {
      await navigator.clipboard.writeText(artifactText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  if (!open || !portalReady) return null

  return createPortal(
    <div
      data-ba-prd-root=""
      data-brand="betonline"
      className="dark fixed inset-0 z-[260] flex justify-end text-foreground"
      role="presentation"
      onClick={() => onOpenChange(false)}
    >
      <div aria-hidden className="absolute inset-0 bg-black/70" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Activity feed PRD"
        className={cn(
          'relative z-10 flex h-full w-full max-w-xl flex-col overflow-hidden sm:max-w-2xl',
          'border-l border-border bg-background shadow-[0_0_16px_rgba(0,0,0,0.06)]',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-foreground">Activity feed PRD</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Match this <span className="font-medium text-foreground">/BA</span> page. Tap a path to
              preview.
            </p>
            <div className="mt-3">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={packBusy}
                onClick={() => void downloadPack()}
                className="gap-1.5"
              >
                <IconDownload className="size-3.5" stroke={1.75} />
                {packBusy ? 'Preparing…' : 'Download package'}
              </Button>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <IconX className="size-4" stroke={1.75} />
          </button>
        </div>
        <div className="shell-scroll min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : md ? (
            simpleMarkdown(md, setArtifactPath)
          ) : (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}
        </div>

        {artifactPath ? (
          <div
            className="absolute inset-0 z-20 flex items-end justify-center bg-black/80 p-4 sm:items-center"
            role="presentation"
            onClick={() => setArtifactPath(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Preview ${artifactPath}`}
              className="flex max-h-[min(80vh,720px)] w-full max-w-xl flex-col overflow-hidden rounded-[10px] border border-border bg-popover text-popover-foreground shadow-[0_0_24px_rgba(0,0,0,0.45)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-muted-foreground">{artifactPath}</p>
                  {artifactFile ? (
                    <p className="mt-0.5 truncate text-sm font-medium text-foreground">{artifactFile}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={artifactLoading || !artifactText}
                    onClick={() => void copyArtifact()}
                    className="gap-1.5"
                  >
                    {copied ? (
                      <IconCheck className="size-3.5" stroke={1.75} />
                    ) : (
                      <IconCopy className="size-3.5" stroke={1.75} />
                    )}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <button
                    type="button"
                    aria-label="Close preview"
                    onClick={() => setArtifactPath(null)}
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <IconX className="size-4" stroke={1.75} />
                  </button>
                </div>
              </div>
              <div className="shell-scroll min-h-0 flex-1 overflow-auto bg-popover p-4">
                {artifactLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : artifactError ? (
                  <p className="text-sm text-destructive">{artifactError}</p>
                ) : (
                  <pre className="whitespace-pre-wrap break-all font-mono text-[11px] leading-5 text-foreground">
                    {artifactText}
                  </pre>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

/** Workshop lab — `/BA`. Casino and Sports are separate tables + PRD. */
export function BaWorkshopPage() {
  const { setSportsBetCount, openSportsBetslip } = useShell()
  const [variant, setVariant] = useState<BaVariant>('casino')
  const [filterId, setFilterId] = useState('all')
  const [prdOpen, setPrdOpen] = useState(false)
  const [slipPicks, setSlipPicks] = useState<SoccerSlipPick[]>([])
  const filters = filtersForVariant(variant)
  const meta = BA_VARIANTS.find((v) => v.id === variant)!

  useEffect(() => {
    setFilterId('all')
  }, [variant])

  useEffect(() => {
    setSportsBetCount(slipPicks.length)
  }, [slipPicks.length, setSportsBetCount])

  const onAddSportsPick = (row: BaOpenSportsBet, originEl?: HTMLElement | null) => {
    /* Graded wins are display-only — never reach here if UI is correct. */
    if (isGradedBetStatus(row.status)) return
    const toId = (parts: string[]) => parts.join('-').replace(/\s+/g, '-')
    const legs =
      row.kind === 'parlay'
        ? row.legs.map((leg, i) => ({
            id: toId([
              'ba-parlay',
              String(row.legs.length),
              leg.home,
              leg.away,
              leg.selection,
              String(i),
            ]),
            label: leg.selection,
            odds: leg.odds,
            eventLabel: `${leg.home} vs ${leg.away}`,
            market: `${row.legs.length}-Pick Parlay · ${leg.league}`,
          }))
        : [
            {
              id: toId(['ba', row.sport, row.home, row.away, row.selection]),
              label: row.selection,
              odds: row.odds,
              eventLabel: `${row.home} vs ${row.away}`,
              market: row.league,
            },
          ]
    setSlipPicks((prev) => {
      const next = [...prev]
      for (const leg of legs) {
        if (!next.some((p) => p.id === leg.id)) next.unshift(leg)
      }
      return next
    })
    revealShellDock()
    openSportsBetslip()
    flyBetDotToSlip(originEl, legs[0]?.id)
  }

  const showCarousel = variant === 'casino'

  return (
    <div data-name="ba-workshop" className="w-full bg-background pb-10">
      <header className="border-b border-border px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Workshop
            </p>
            <Typography as="h1" shape="h3" weight="semibold" className="mt-1">
              BA — Activity & Live Wins
            </Typography>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{meta.hint}</p>
          </div>
          <Button
            type="button"
            variant="default"
            size="default"
            className="shrink-0 gap-2"
            onClick={() => setPrdOpen(true)}
            aria-label="Open Activity feed PRD for engineers"
          >
            <IconFileText className="size-4" stroke={1.75} />
            View PRD
          </Button>
        </div>

        <div
          className="mt-4 inline-flex rounded-lg border border-border bg-secondary p-0.5"
          role="tablist"
          aria-label="Workshop variant"
        >
          {BA_VARIANTS.map((v) => {
            const on = v.id === variant
            return (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setVariant(v.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm transition-colors',
                  on
                    ? 'bg-card font-medium text-foreground shadow-[0_0_16px_rgba(0,0,0,0.06)]'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {v.label}
              </button>
            )
          })}
        </div>
      </header>

      {showCarousel ? (
        <div className="pt-4">
          <CasinoLiveWinsCarousel />
        </div>
      ) : (
        <div className="mx-6 mt-4 rounded-[10px] border border-dashed border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          Sports variant — Live Wins carousel omitted (works with casino game tiles only).
        </div>
      )}

      {filters.length > 0 ? (
        <div className="px-6 pt-4">
          <WorkshopFilterTrack
            filters={filters}
            active={filterId}
            onChange={setFilterId}
            label="Sport / league filters"
          />
        </div>
      ) : null}

      <BaActivityTable
        variant={variant}
        filterId={filterId}
        onAddSportsPick={onAddSportsPick}
      />
      <SoccerBetslip
        picks={slipPicks}
        onRemove={(id) => setSlipPicks((prev) => prev.filter((p) => p.id !== id))}
        onClear={() => setSlipPicks([])}
        onChange={setSlipPicks}
      />
      <PrdSheet open={prdOpen} onOpenChange={setPrdOpen} />
    </div>
  )
}
