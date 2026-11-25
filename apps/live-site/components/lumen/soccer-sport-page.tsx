'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  IconBallFootball,
  IconChevronDown,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconPlayerPlay,
  IconSelector,
  IconX,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import { ShelfSeeMore } from '@/components/lumen/shelf-see-more'
import { CasinoLiveWinsCarousel } from '@/components/lumen/casino-live-wins-carousel'
import { SoccerBetslip, type SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import {
  SportBoostsShelf,
  SportMegaShelf,
  SportSgpShelf,
} from '@/components/lumen/sports-home-page'
import { useShell } from '@/components/site/shell-context'
import { revealShellDock } from '@/components/site/shell-scroll'
import { flyBetDotToSlip } from '@/lib/lumen/vip-celebrate'
import { setSoccerSlip, useSoccerSlip, withOneLegPerMarket } from '@/lib/lumen/soccer-slip-store'
import { soccerEventHref } from '@/lib/lumen/soccer-event'
import { rememberSportsReturn } from '@/lib/lumen/sports-return'
import {
  DESKTOP_MARKET_HEADERS,
  SOCCER_COUNTRY_GROUPS,
  SOCCER_COUNTRY_OPTIONS,
  SOCCER_LEAGUE_MODES,
  SOCCER_LEAGUE_OPTIONS,
  SOCCER_MODES,
  SOCCER_OUTRIGHTS,
  SOCCER_QUICK_LINKS,
  isSoccerLeagueView,
  soccerSectionsForFilter,
  picksWithActiveLines,
  soccerTeamLogo,
  type SoccerEvent,
  type SoccerFuture,
  type SoccerLeagueSection,
  type SoccerLineFamily,
  type SoccerLinePair,
  type SoccerMode,
  type SoccerOdds,
  type SoccerQuickLink,
} from '@/lib/lumen/soccer-sport'
import { cn } from '@/lib/utils'

const CARD = 'rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]'
const TILE_SPRING = { type: 'spring' as const, stiffness: 260, damping: 28, mass: 0.85 }

/** Custom menu — portals to body so mobile sticky chrome never clips it. */
export function BreadcrumbMenu({
  label,
  options,
  active,
  onPick,
  emphasize,
}: {
  label: string
  options: { id: string; label: string }[]
  active: string
  onPick: (id: string) => void
  emphasize?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return
    const r = rootRef.current.getBoundingClientRect()
    const width = 200
    const left = Math.min(r.left, window.innerWidth - width - 8)
    setPos({ top: r.bottom + 6, left: Math.max(8, left) })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('touchstart', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('touchstart', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative inline-flex shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-1.5 leading-none transition-colors hover:bg-accent hover:text-foreground',
          open && 'bg-accent text-foreground',
          emphasize ? 'font-medium text-foreground' : 'text-muted-foreground',
        )}
      >
        {label}
        <IconChevronDown
          className={cn('size-3.5 shrink-0 opacity-70 transition-transform', open && 'rotate-180')}
          stroke={1.5}
        />
      </button>
      {open && typeof document !== 'undefined'
        ? createPortal(
            <ul
              ref={menuRef}
              role="listbox"
              style={{ top: pos.top, left: pos.left }}
              className="fixed z-[220] max-h-[min(60vh,320px)] min-w-[180px] overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
            >
              {options.map((opt) => (
                <li key={opt.id} role="option" aria-selected={opt.id === active}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
                      opt.id === active && 'bg-accent/60 font-medium',
                    )}
                    onClick={() => {
                      onPick(opt.id)
                      setOpen(false)
                    }}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>,
            document.body,
          )
        : null}
    </div>
  )
}

function marketForPick(pick: SoccerOdds, all: SoccerOdds[]): string {
  if (pick.family === 'spread') return 'Spread'
  if (pick.family === 'total') return 'Total'
  const i = all.findIndex((p) => p.id === pick.id)
  if (i < 0) return 'Moneyline'
  if (i < 3) return DESKTOP_MARKET_HEADERS[0]
  if (i < 5) return DESKTOP_MARKET_HEADERS[1]
  if (i < 7) return DESKTOP_MARKET_HEADERS[2]
  return DESKTOP_MARKET_HEADERS[3]
}

export function ModePillTrack<T extends string = SoccerMode>({
  active,
  onChange,
  modes,
  ariaLabel = 'Soccer views',
  className,
}: {
  active: T
  onChange: (id: T) => void
  modes: { id: T; label: string }[]
  ariaLabel?: string
  className?: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState({ x: 0, w: 0, ready: false })
  const [coveredId, setCoveredId] = useState(active)

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
  }, [active, modes, measureThumb])

  useLayoutEffect(() => {
    const id = window.setTimeout(() => setCoveredId(active), 280)
    return () => window.clearTimeout(id)
  }, [active])

  return (
    <div data-name="soccer-mode-pills" className={cn('mb-4', className)}>
      <div
        ref={trackRef}
        data-name="sub-menu-pill-track"
        className="relative flex h-12 w-max max-w-full items-center gap-1 overflow-x-auto rounded-full bg-secondary p-0.5"
        role="tablist"
        aria-label={ariaLabel}
      >
        <span
          aria-hidden
          data-sub-menu-thumb=""
          className="pointer-events-none absolute top-0.5 h-11 rounded-full bg-primary transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ left: thumb.x, width: thumb.w, opacity: thumb.ready ? 1 : 0 }}
        />
        {modes.map((item) => {
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
                covered
                  ? 'font-medium text-primary-foreground'
                  : 'font-normal text-muted-foreground hover:bg-[var(--surface-muted-3)] hover:text-foreground dark:hover:bg-accent',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Casino sub-nav glass chevrons — sit on the clipped odds rail edges. */
export const ODDS_EDGE_ARROW =
  'absolute top-1/2 z-20 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/55 text-foreground backdrop-blur-md outline-none hover:bg-background/75 focus-visible:ring-2 focus-visible:ring-ring'

export function LeagueQuickLinks({
  links,
  activeId,
  onPick,
  onNavigate,
  allIcon,
}: {
  links: SoccerQuickLink[]
  activeId: string
  onPick: (id: string) => void
  onNavigate?: (href: string) => void
  /** "All" tile mark — soccer ball by default. */
  allIcon?: ReactNode
}) {
  return (
    <div data-name="quicklinks" className="-mx-4 mb-5 md:mx-0">
      {/*
        overflow-x forces a clip port — pad the scroll box so lift/scale/border
        never gets chopped (All Soccer was losing its bottom corners).
      */}
      <div className="overflow-x-auto px-4 py-5 scrollbar-hide md:px-0">
        <div className="flex w-max items-end gap-2 px-0.5">
          {links.map((link, i) => {
            const external = Boolean(link.href)
            const on = !external && activeId === link.id
            const casinoStart = Boolean(link.href) && !links[i - 1]?.href
            const isArt = Boolean(link.art && link.icon)

            if (isArt) {
              return (
                <motion.button
                  key={link.id}
                  type="button"
                  aria-label={`Go to ${link.label}`}
                  onClick={() => {
                    if (link.href && onNavigate) onNavigate(link.href)
                  }}
                  whileHover={{ scale: 1.04, y: -4, zIndex: 10 }}
                  whileTap={{ scale: 1.01, y: -1 }}
                  transition={TILE_SPRING}
                  className={cn(
                    /* Same outer height as league chips (92); width keeps DVD 152/207. */
                    'group relative z-0 h-[92px] w-[68px] shrink-0 overflow-hidden rounded-[10px]',
                    'border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]',
                    'outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0',
                    'motion-reduce:!transform-none',
                    casinoStart && 'ml-3',
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={link.icon}
                    alt=""
                    className="absolute inset-0 size-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-1 pb-1.5 pt-6">
                    <span className="block truncate text-center text-[9px] font-semibold leading-tight text-white">
                      {link.label}
                    </span>
                  </span>
                </motion.button>
              )
            }

            return (
              <motion.button
                key={link.id}
                type="button"
                aria-pressed={external ? undefined : on}
                aria-label={link.label}
                onClick={() => {
                  if (link.href && onNavigate) {
                    onNavigate(link.href)
                    return
                  }
                  onPick(link.id)
                }}
                animate={on ? { scale: 1.04, y: -4, zIndex: 10 } : { scale: 1, y: 0, zIndex: 0 }}
                whileHover={{ scale: 1.04, y: -4, zIndex: 10 }}
                whileTap={{ scale: 1.01, y: -1 }}
                transition={TILE_SPRING}
                className={cn(
                  'relative z-0 flex h-[92px] w-[80px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-[10px] border px-1.5 py-2.5 text-center',
                  'shadow-[0_0_16px_rgba(0,0,0,0.06)]',
                  'outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0',
                  'transition-[background-color,border-color,box-shadow] duration-150',
                  'motion-reduce:!transform-none',
                  on
                    ? 'border-border bg-secondary/80 shadow-[0_0_20px_rgba(0,0,0,0.1)]'
                    : 'border-transparent bg-card hover:border-border hover:bg-secondary/80 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]',
                )}
              >
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-md',
                    link.id === 'all' || !link.icon ? 'bg-transparent' : 'bg-white',
                  )}
                >
                  {link.id === 'all' || !link.icon ? (
                    (allIcon ?? (
                      <IconBallFootball className="size-7 text-foreground" stroke={1.5} />
                    ))
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={link.icon}
                      alt=""
                      width={28}
                      height={28}
                      className="max-h-7 max-w-7 object-contain"
                    />
                  )}
                </span>
                <span className="w-full px-0.5 text-center text-[10px] font-medium leading-[12px] text-foreground">
                  {link.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function OddsButton({
  pick,
  selected,
  onSelect,
  className,
}: {
  pick: SoccerOdds
  selected: boolean
  onSelect: (pick: SoccerOdds, originEl?: HTMLElement | null) => void
  className?: string
}) {
  return (
    <button
      type="button"
      data-pick-id={pick.id}
      onClick={(e) => onSelect(pick, e.currentTarget)}
      className={cn(
        'flex min-w-[72px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg border px-2 py-1.5 text-center transition-colors',
        /* Light: popover === card white — use secondary wash + border so chips read as cards */
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-secondary text-foreground hover:bg-accent',
        className,
      )}
    >
      <span
        className={cn(
          'text-[10px] font-medium leading-3.5',
          selected ? 'text-primary-foreground/80' : 'text-muted-foreground',
        )}
      >
        {pick.label}
      </span>
      <span className="text-sm font-semibold tabular-nums leading-5">{pick.odds}</span>
    </button>
  )
}

const EVENT_ROW_H = 'h-[112px]'
/** Top league shows every game; leagues below it preview this many, then Show more. */
export const LEAGUE_PREVIEW_ROWS = 3

/** Live games — faint red wash on the left edge only. */
export const LIVE_ROW_STYLE: CSSProperties = {
  backgroundImage:
    'linear-gradient(90deg, color-mix(in srgb, var(--destructive) 7%, transparent), transparent 22%)',
}
const SCORE_COL_W = 'w-[min(42%,300px)]'

export function BoardTeamBadge({ name }: { name: string }) {
  const src = soccerTeamLogo(name)
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
        className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-muted-3 text-[8px] font-semibold text-muted-foreground"
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
      className="size-5 shrink-0 rounded-full object-contain bg-white/5"
      onError={() => setFailed(true)}
    />
  )
}

function EventScoreboard({ event }: { event: SoccerEvent }) {
  const { startNavigating } = useShell()
  const score = event.live && event.score != null ? event.score : null
  const href = soccerEventHref(event.id)
  return (
    <Link
      href={href}
      onClick={() => startNavigating(href)}
      aria-label={`${event.home} vs ${event.away}, open event`}
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
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex h-5 min-w-0 items-center gap-2">
              <BoardTeamBadge name={event.home} />
              <Typography as="span" shape="small" weight="medium" className="truncate">
                {event.home}
              </Typography>
            </div>
            <div className="flex h-5 min-w-0 items-center gap-2">
              <BoardTeamBadge name={event.away} />
              <Typography as="span" shape="small" weight="medium" className="truncate">
                {event.away}
              </Typography>
            </div>
          </div>
          {score ? (
            <div
              className="grid shrink-0 grid-rows-2 self-stretch overflow-hidden rounded-sm border border-border bg-secondary tabular-nums"
              aria-label={`Score ${score[0]}–${score[1]}`}
            >
              <span className="flex h-5 min-w-[1.25rem] items-center justify-center px-1.5 text-sm font-semibold leading-none text-foreground">
                {score[0]}
              </span>
              <span className="flex h-5 min-w-[1.25rem] items-center justify-center border-t border-border px-1.5 text-sm font-semibold leading-none text-foreground">
                {score[1]}
              </span>
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

/**
 * Alt-line control — same height as odds chips; menu portals left of the
 * selector and is vertically centered on the arrows. Outside-dismiss deferred
 * so the opening click cannot immediately close the menu.
 */
/**
 * Alt lines: board-sized chips with the same hover / selected look as the board.
 * Rows run high → low in half points (e.g. 5, 4.5, 4, **3.5**, 3, 2.5, 2). The main (default) line is
 * always the centre row and always sits on the event-row chips — even after an alt line is picked.
 * Tap a chip → that pair goes on the event row, the tapped side goes on the betslip → close.
 */
const ALT_HEADER_H = 32
/** Team / Over-Under label row under the menu title. */
const ALT_COLS_H = 32
const ALT_PAD = 8
/** Menu `border` width — offsets the list so the active row lands pixel-exact on the board chips. */
const ALT_BORDER = 1
const ALT_GAP = 4
const ALT_MAX_ROWS = 7

export function AlternateLinePicker({
  family,
  pairs,
  selectedIds,
  onPick,
  forceOpen = false,
  title,
  mainLine,
  columns,
}: {
  family: SoccerLineFamily
  pairs: SoccerLinePair[]
  selectedIds: Set<string>
  onPick: (pick: SoccerOdds) => void
  /** Figma handover capture only — keeps menu open for screenshot. */
  forceOpen?: boolean
  /** Menu header — defaults to Spreads / Totals. */
  title?: string
  /** Main line when the ladder isn't symmetric (event-view goals, corners, props). */
  mainLine?: number
  /** Side labels above the two chip columns — team names for spreads, Over / Under for totals. */
  columns?: [string, string]
}) {
  const [open, setOpen] = useState(forceOpen)
  useEffect(() => {
    if (forceOpen) setOpen(true)
  }, [forceOpen])
  const [pos, setPos] = useState({ top: 0, left: 0, width: 216, rowH: 44, listH: 120 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const rows = useMemo(() => [...pairs].sort((x, y) => y.line - x.line), [pairs])
  /** Board ladders are symmetric; event-view ladders pass their main line. */
  const mainAt = mainLine == null ? -1 : rows.findIndex((r) => r.line === mainLine)
  const mainIndex = mainAt >= 0 ? mainAt : Math.floor(rows.length / 2)
  const heading = title ?? (family === 'spread' ? 'Spreads' : 'Totals')
  const headerH = ALT_HEADER_H + (columns ? ALT_COLS_H : 0)

  const rowH = pos.rowH
  const contentH = rows.length * rowH + Math.max(0, rows.length - 1) * ALT_GAP
  const listH = pos.listH
  const menuH = ALT_PAD + headerH + listH + ALT_PAD
  const needsScroll = contentH > listH + 1

  const boardChipsEl = useCallback((): HTMLElement | null => {
    const trigger = triggerRef.current
    if (!trigger) return null
    const prev = trigger.previousElementSibling
    return prev instanceof HTMLElement ? prev : null
  }, [])

  /** Long lists keep the active row in the middle slot of the visible window. */
  const scrollTopFor = useCallback(
    (index: number, rowStride: number, listHeight: number, total: number) => {
      const maxTop = Math.max(0, total - listHeight)
      const centreSlot = Math.floor((ALT_MAX_ROWS - 1) / 2)
      return Math.max(0, Math.min(maxTop, (index - centreSlot) * rowStride))
    },
    [],
  )

  const placeMenu = useCallback(() => {
    const chips = boardChipsEl()
    if (!chips) return
    const c = chips.getBoundingClientRect()
    const width = Math.round(c.width)
    const measuredRowH = Math.max(36, Math.round(c.height))
    const nextStride = measuredRowH + ALT_GAP
    const nextContentH = rows.length * measuredRowH + Math.max(0, rows.length - 1) * ALT_GAP
    const nextMaxListH = ALT_MAX_ROWS * measuredRowH + (ALT_MAX_ROWS - 1) * ALT_GAP
    const nextListH = Math.min(nextContentH, nextMaxListH)
    const nextMenuH = ALT_PAD + headerH + nextListH + ALT_PAD
    const scrollTop = scrollTopFor(mainIndex, nextStride, nextListH, nextContentH)
    /* Shift the menu so the active row lands exactly on the board chips. */
    let top = c.top - ALT_BORDER - ALT_PAD - headerH - (mainIndex * nextStride - scrollTop)
    let left = c.left - ALT_BORDER - ALT_PAD
    top = Math.max(8, Math.min(top, window.innerHeight - nextMenuH - 8))
    left = Math.max(8, Math.min(left, window.innerWidth - width - ALT_PAD * 2 - 8))
    setPos({ top, left, width, rowH: measuredRowH, listH: nextListH })
    const sc = scrollRef.current
    if (sc) sc.scrollTop = scrollTop
  }, [mainIndex, boardChipsEl, rows.length, scrollTopFor, headerH])

  useLayoutEffect(() => {
    if (!open) return
    placeMenu()
    const raf = window.requestAnimationFrame(placeMenu)
    const onWin = (e: Event) => {
      if (e.target instanceof Node && scrollRef.current?.contains(e.target)) return
      placeMenu()
    }
    window.addEventListener('scroll', onWin, true)
    window.addEventListener('resize', onWin)
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onWin, true)
      window.removeEventListener('resize', onWin)
    }
  }, [open, placeMenu])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const timer = window.setTimeout(() => {
      document.addEventListener('pointerdown', onDoc, true)
      document.addEventListener('keydown', onKey)
    }, 0)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('pointerdown', onDoc, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (pairs.length < 2) return null

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Alternate ${heading.toLowerCase()}`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!open) placeMenu()
          setOpen((v) => !v)
        }}
        className={cn(
          'inline-flex w-7 shrink-0 flex-col items-center justify-center self-stretch rounded-md border border-border bg-secondary text-muted-foreground transition-colors',
          'hover:bg-accent hover:text-foreground',
          open && 'border-primary bg-accent text-foreground',
        )}
      >
        <IconSelector className="size-4" stroke={1.75} />
      </button>
      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={menuRef}
              data-soccer-alt-line-menu=""
              role="dialog"
              aria-label={`Alternate ${heading.toLowerCase()}`}
              style={{
                top: pos.top,
                left: pos.left,
                width: pos.width + (ALT_PAD + ALT_BORDER) * 2,
                height: menuH + ALT_BORDER * 2,
                padding: ALT_PAD,
              }}
              className="box-border overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div
                className="flex shrink-0 items-center justify-between gap-2"
                style={{ height: ALT_HEADER_H }}
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {heading}
                </p>
                <button
                  type="button"
                  aria-label="Close"
                  className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  <IconX className="size-3.5" stroke={1.75} />
                </button>
              </div>
              {columns ? (
                <div
                  className="grid grid-cols-2 gap-1 pb-2"
                  style={{ height: ALT_COLS_H, width: pos.width }}
                >
                  {columns.map((label) => (
                    <span
                      key={label}
                      className="flex min-w-0 items-center justify-center gap-1.5 text-xs text-muted-foreground"
                    >
                      {family === 'spread' ? <BoardTeamBadge name={label} /> : null}
                      <span className="truncate">{label}</span>
                    </span>
                  ))}
                </div>
              ) : null}
              <div style={{ height: listH, width: pos.width }}>
                <div
                  ref={scrollRef}
                  data-soccer-alt-line-list=""
                  className={cn(
                    'h-full overflow-x-hidden overscroll-contain',
                    needsScroll ? 'overflow-y-auto' : 'overflow-y-hidden',
                  )}
                >
                  <div className="flex flex-col" style={{ gap: ALT_GAP, width: pos.width }}>
                    {rows.map((pair, index) => (
                      <div
                        key={pair.line}
                        data-main-line={index === mainIndex ? '' : undefined}
                        style={{ height: rowH, width: pos.width }}
                        className="grid shrink-0 grid-cols-2 gap-1"
                      >
                        {[pair.a, pair.b].map((pick) => {
                          const selected = selectedIds.has(pick.id)
                          return (
                            <button
                              key={pick.id}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => {
                                onPick(pick)
                                setOpen(false)
                              }}
                              className={cn(
                                'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg border px-2 py-1.5 text-center transition-colors',
                                selected
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-border bg-secondary text-foreground hover:bg-accent',
                              )}
                            >
                              <span
                                className={cn(
                                  'text-[10px] font-medium leading-3.5',
                                  selected ? 'text-primary-foreground/80' : 'text-muted-foreground',
                                )}
                              >
                                {pick.label}
                              </span>
                              <span className="text-sm font-semibold tabular-nums leading-5">
                                {pick.odds}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

function DesktopMarketColumns({
  picks,
  selectedIds,
  onSelect,
  spreadLines,
  totalLines,
  onPickAltLine,
  forceOpenSpreadMenu = false,
  teams,
}: {
  picks: SoccerOdds[]
  selectedIds: Set<string>
  onSelect: (pick: SoccerOdds, originEl?: HTMLElement | null) => void
  spreadLines?: SoccerLinePair[]
  totalLines?: SoccerLinePair[]
  onPickAltLine?: (family: SoccerLineFamily, pick: SoccerOdds) => void
  forceOpenSpreadMenu?: boolean
  teams?: [string, string]
}) {
  const groups = [
    picks.slice(0, 3),
    picks.slice(3, 5),
    picks.slice(5, 7),
    picks.slice(7, 10),
  ] as const

  return (
    <div className="flex w-max gap-2">
      {groups.map((group, i) => {
        const header = DESKTOP_MARKET_HEADERS[i]
        const isSpread = i === 1
        const isTotal = i === 2
        const pairs = isSpread ? spreadLines : isTotal ? totalLines : undefined
        return (
          <div
            key={header ?? i}
            className={cn(
              'flex shrink-0 flex-col gap-1',
              i === 0 || i === 3 ? 'w-[220px]' : 'w-[248px]',
            )}
          >
            <Typography as="span" shape="xs" variant="muted" className="text-center">
              {header}
            </Typography>
            <div className="flex items-stretch gap-1">
              <div className="flex min-w-0 flex-1 gap-1">
                {group.map((pick) => (
                  <OddsButton
                    key={pick.id}
                    pick={pick}
                    selected={selectedIds.has(pick.id)}
                    onSelect={onSelect}
                    className="min-w-0 flex-1"
                  />
                ))}
              </div>
              {pairs && pairs.length > 1 && onPickAltLine ? (
                <AlternateLinePicker
                  family={isSpread ? 'spread' : 'total'}
                  pairs={pairs}
                  selectedIds={selectedIds}
                  onPick={(pick) => onPickAltLine(isSpread ? 'spread' : 'total', pick)}
                  forceOpen={isSpread && forceOpenSpreadMenu}
                  columns={isSpread ? teams : ['Over', 'Under']}
                />
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Desktop odds scroller — edge chevrons only for fine pointer (mouse).
 * Never on touch / coarse pointer — swipe only (Chris hard rule).
 */
function EventOddsRail({
  picks,
  selectedIds,
  onSelect,
  label,
  spreadLines,
  totalLines,
  onPickAltLine,
  teams,
  forceOpenSpreadMenu = false,
}: {
  picks: SoccerOdds[]
  selectedIds: Set<string>
  onSelect: (pick: SoccerOdds, originEl?: HTMLElement | null) => void
  label: string
  spreadLines?: SoccerLinePair[]
  totalLines?: SoccerLinePair[]
  onPickAltLine?: (family: SoccerLineFamily, pick: SoccerOdds) => void
  teams?: [string, string]
  forceOpenSpreadMenu?: boolean
}) {
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
  }, [measure, picks.length])

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.min(220, el.clientWidth * 0.7), behavior: 'smooth' })
  }

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden">
      <div
        ref={scrollRef}
        data-name="event-odds-scroll"
        className="scrollbar-hide flex h-full items-center overflow-x-auto overflow-y-hidden"
        onScroll={measure}
      >
        <div className="w-max px-3">
          <DesktopMarketColumns
            picks={picks}
            selectedIds={selectedIds}
            onSelect={onSelect}
            spreadLines={spreadLines}
            totalLines={totalLines}
            onPickAltLine={onPickAltLine}
            forceOpenSpreadMenu={forceOpenSpreadMenu}
            teams={teams}
          />
        </div>
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

/**
 * Mobile — full desktop markets; swipe only (never overlay chevrons).
 * Full-bleed to card edges — no inset gutters while scrolling.
 */
function MobileOddsCarousel({
  picks,
  selectedIds,
  onSelect,
  spreadLines,
  totalLines,
  onPickAltLine,
  teams,
}: {
  picks: SoccerOdds[]
  selectedIds: Set<string>
  onSelect: (pick: SoccerOdds, originEl?: HTMLElement | null) => void
  spreadLines?: SoccerLinePair[]
  totalLines?: SoccerLinePair[]
  onPickAltLine?: (family: SoccerLineFamily, pick: SoccerOdds) => void
  teams?: [string, string]
}) {
  return (
    <div
      data-name="mobile-odds-carousel"
      /* No touch-pan-x — it locks vertical page scroll when finger starts on the rail. */
      className="scrollbar-hide min-w-0 overflow-x-auto overscroll-x-contain"
    >
      <div className="w-max px-3">
        <DesktopMarketColumns
          picks={picks}
          selectedIds={selectedIds}
          onSelect={onSelect}
          spreadLines={spreadLines}
          totalLines={totalLines}
          onPickAltLine={onPickAltLine}
          teams={teams}
        />
      </div>
    </div>
  )
}

function EventRowMobile({
  event,
  selectedIds,
  onSelect,
  activeSpread,
  activeTotal,
  onPickAltLine,
}: {
  event: SoccerEvent
  selectedIds: Set<string>
  onSelect: (pick: SoccerOdds, event: SoccerEvent, originEl?: HTMLElement | null) => void
  activeSpread?: number
  activeTotal?: number
  onPickAltLine?: (family: SoccerLineFamily, pick: SoccerOdds) => void
}) {
  const picks = picksWithActiveLines(event, activeSpread, activeTotal)
  return (
    <article
      data-name="event-row-mobile"
      className="border-b border-border last:border-b-0 md:hidden"
      style={event.live ? LIVE_ROW_STYLE : undefined}
    >
      <div className="flex flex-col gap-3 py-3">
        <div className="px-3">
          <EventScoreboard event={event} />
        </div>
        <MobileOddsCarousel
          picks={picks}
          selectedIds={selectedIds}
          onSelect={(p, originEl) => onSelect(p, event, originEl)}
          spreadLines={event.spreadLines}
          totalLines={event.totalLines}
          onPickAltLine={onPickAltLine}
          teams={[event.home, event.away]}
        />
      </div>
    </article>
  )
}

/** Active board line for an event's Spread / Total pair — keys `${eventId}:spread|total`. */
function activeLineFor(
  lineState: Record<string, number>,
  event: SoccerEvent,
  family: SoccerLineFamily,
): number | undefined {
  return (
    lineState[`${event.id}:${family}`] ??
    (family === 'spread' ? event.defaultSpreadLine : event.defaultTotalLine)
  )
}

function LeagueGamesCard({
  section,
  expanded,
  onToggleMore,
  selectedIds,
  onSelect,
  lineState,
  onPickAltLine,
  hideSeeAll = false,
  onSeeAll,
  forceOpenSpreadEventId,
}: {
  section: SoccerLeagueSection
  expanded: boolean
  onToggleMore: () => void
  selectedIds: Set<string>
  onSelect: (pick: SoccerOdds, event: SoccerEvent, originEl?: HTMLElement | null) => void
  lineState: Record<string, number>
  onPickAltLine: (event: SoccerEvent, family: SoccerLineFamily, pick: SoccerOdds) => void
  /** League drill (355:27661) — already in-league, no See All. */
  hideSeeAll?: boolean
  onSeeAll?: (leagueId: string) => void
  /** Figma handover — keep Spread alt menu open on this event. */
  forceOpenSpreadEventId?: string
}) {
  const visible = expanded ? section.events : section.events.slice(0, LEAGUE_PREVIEW_ROWS)
  const hidden = section.events.length - visible.length
  const lineFor = (event: SoccerEvent, family: SoccerLineFamily) =>
    activeLineFor(lineState, event, family)

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
        {!hideSeeAll ? (
          <ShelfSeeMore label="See All" onClick={() => onSeeAll?.(section.id)} />
        ) : null}
      </div>

      {/* Mobile stacked rows */}
      <div className={cn(CARD, 'overflow-hidden md:hidden')}>
        {visible.map((event) => (
          <EventRowMobile
            key={event.id}
            event={event}
            selectedIds={selectedIds}
            onSelect={onSelect}
            activeSpread={lineFor(event, 'spread')}
            activeTotal={lineFor(event, 'total')}
            onPickAltLine={(family, pick) => onPickAltLine(event, family, pick)}
          />
        ))}
      </div>

      {/* Desktop: one flex row per event — each odds rail has its own sub-nav arrows */}
      <div className={cn(CARD, 'hidden overflow-hidden md:block')}>
        {visible.map((event) => {
          const activeSpread = lineFor(event, 'spread')
          const activeTotal = lineFor(event, 'total')
          const desktop = picksWithActiveLines(event, activeSpread, activeTotal)
          return (
            <div
              key={event.id}
              data-live={event.live ? '' : undefined}
              className="flex border-b border-border last:border-b-0"
              style={event.live ? LIVE_ROW_STYLE : undefined}
            >
              <div
                className={cn(
                  SCORE_COL_W,
                  EVENT_ROW_H,
                  'flex shrink-0 items-center border-r border-border px-4',
                )}
              >
                <EventScoreboard event={event} />
              </div>
              <div className={cn(EVENT_ROW_H, 'flex min-w-0 flex-1')}>
                <EventOddsRail
                  picks={desktop}
                  selectedIds={selectedIds}
                  onSelect={(pick, originEl) => onSelect(pick, event, originEl)}
                  label={`${event.home} vs ${event.away}`}
                  spreadLines={event.spreadLines}
                  totalLines={event.totalLines}
                  teams={[event.home, event.away]}
                  onPickAltLine={(family, pick) => onPickAltLine(event, family, pick)}
                  forceOpenSpreadMenu={forceOpenSpreadEventId === event.id}
                />
              </div>
            </div>
          )
        })}
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

/** Soccer league board with its own alt-line state — same block as `/sports/soccer`. */
export function SoccerLeagueBoard({
  section,
  expanded,
  onToggleMore,
  onSeeAll,
}: {
  section: SoccerLeagueSection
  expanded: boolean
  onToggleMore: () => void
  onSeeAll?: (leagueId: string) => void
}) {
  const slipPicks = useSoccerSlip()
  const selectedIds = useMemo(() => new Set(slipPicks.map((p) => p.id)), [slipPicks])
  const [lineState, setLineState] = useState<Record<string, number>>({})

  const onSelect = (pick: SoccerOdds, event: SoccerEvent, originEl?: HTMLElement | null) => {
    if (selectedIds.has(pick.id)) {
      setSoccerSlip((prev) => prev.filter((p) => p.id !== pick.id))
      return
    }
    const all = picksWithActiveLines(
      event,
      activeLineFor(lineState, event, 'spread'),
      activeLineFor(lineState, event, 'total'),
    )
    const next: SoccerSlipPick = {
      id: pick.id,
      label: pick.label,
      odds: pick.odds,
      eventLabel: `${event.home} vs ${event.away}`,
      market: marketForPick(pick, all),
      ...boardPickMeta(event),
    }
    setSoccerSlip((prev) => withOneLegPerMarket(prev, next))
    revealShellDock()
    flyBetDotToSlip(originEl, next.id)
  }

  const onPickAltLine = (event: SoccerEvent, family: SoccerLineFamily, pick: SoccerOdds) => {
    const pairs = family === 'spread' ? event.spreadLines : event.totalLines
    if (!pairs?.length || pick.line == null) return
    setLineState((s) => ({ ...s, [`${event.id}:${family}`]: pick.line! }))
    if (selectedIds.has(pick.id)) {
      setSoccerSlip((prev) => prev.filter((p) => p.id !== pick.id))
      return
    }
    const next: SoccerSlipPick = {
      id: pick.id,
      label: pick.label,
      odds: pick.odds,
      eventLabel: `${event.home} vs ${event.away}`,
      market: family === 'spread' ? 'Spread' : 'Total',
      ...boardPickMeta(event),
    }
    setSoccerSlip((prev) => withOneLegPerMarket(prev, next))
    revealShellDock()
    window.requestAnimationFrame(() => {
      const origin = [...document.querySelectorAll<HTMLElement>('[data-pick-id]')].find(
        (el) => el.dataset.pickId === pick.id && el.getBoundingClientRect().width > 0,
      )
      flyBetDotToSlip(origin ?? null, pick.id)
    })
  }

  return (
    <LeagueGamesCard
      section={section}
      expanded={expanded}
      onToggleMore={onToggleMore}
      selectedIds={selectedIds}
      onSelect={onSelect}
      lineState={lineState}
      onPickAltLine={onPickAltLine}
      hideSeeAll={!onSeeAll}
      onSeeAll={onSeeAll}
    />
  )
}

function AllLeaguesView({ onSelectLeague }: { onSelectLeague: (id: string) => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({ top: true, england: true })

  return (
    <div className="space-y-2">
      {SOCCER_COUNTRY_GROUPS.map((group) => {
        const isOpen = !!open[group.id]
        return (
          <div key={group.id} className={CARD}>
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:!bg-surface-muted-3"
              onClick={() => setOpen((s) => ({ ...s, [group.id]: !isOpen }))}
              aria-expanded={isOpen}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={group.flag}
                alt=""
                width={20}
                height={20}
                className="size-5 object-contain"
              />
              <Typography as="span" shape="small" weight="medium" className="flex-1">
                {group.name}
              </Typography>
              <IconChevronDown
                className={cn(
                  'size-4 text-muted-foreground transition-transform',
                  isOpen && 'rotate-180',
                )}
                stroke={1.5}
              />
            </button>
            {isOpen && group.leagues.length > 0 ? (
              <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
                {group.leagues.map((league) => (
                  <button
                    key={league.id}
                    type="button"
                    onClick={() => onSelectLeague(league.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-popover px-3 py-1.5 text-sm transition-colors hover:bg-accent"
                  >
                    {league.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={league.icon}
                        alt=""
                        width={16}
                        height={16}
                        className="size-4 object-contain"
                      />
                    ) : null}
                    {league.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

const OUTRIGHT_PREVIEW = 12

/**
 * Outright / futures — one collapsible card per market. Long markets (Champions League, World Cup)
 * show the top 12 by price, then Show all; 12+ selections get a search.
 */
export function OutrightsBoard({
  futures,
  eventLabel,
  sport,
  selectedIds,
  onPick,
}: {
  futures: SoccerFuture[]
  eventLabel: string
  sport: 'soccer' | 'nfl'
  selectedIds: Set<string>
  onPick: (pick: SoccerSlipPick, originEl?: HTMLElement | null) => void
}) {
  return (
    <div data-name="outrights-board" className="flex flex-col gap-3">
      {futures.map((f, i) => (
        <OutrightMarket
          key={f.id}
          future={f}
          defaultOpen={i === 0}
          eventLabel={eventLabel}
          sport={sport}
          selectedIds={selectedIds}
          onPick={onPick}
        />
      ))}
    </div>
  )
}

function OutrightMarket({
  future,
  defaultOpen,
  eventLabel,
  sport,
  selectedIds,
  onPick,
}: {
  future: SoccerFuture
  defaultOpen: boolean
  eventLabel: string
  sport: 'soccer' | 'nfl'
  selectedIds: Set<string>
  onPick: (pick: SoccerSlipPick, originEl?: HTMLElement | null) => void
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [all, setAll] = useState(false)
  const [query, setQuery] = useState('')
  const total = future.picks.length
  const q = query.trim().toLowerCase()
  const matches = q ? future.picks.filter((p) => p.label.toLowerCase().includes(q)) : future.picks
  const shown = q || all ? matches : matches.slice(0, OUTRIGHT_PREVIEW)
  const picked = future.picks.filter((p) => selectedIds.has(p.id)).length

  return (
    <section
      data-name="outright-market"
      data-market={future.id}
      className={cn(CARD, 'overflow-hidden')}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="m-1 flex h-11 w-[calc(100%-0.5rem)] items-center gap-2 rounded-lg px-3 text-left transition-colors hover:bg-surface-muted-3"
      >
        <Typography as="h3" shape="small" weight="semibold" className="min-w-0 truncate">
          {future.name}
        </Typography>
        <span className="shrink-0 text-xs text-muted-foreground">{total} selections</span>
        {picked > 0 ? (
          <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
            {picked} on slip
          </span>
        ) : null}
        <span className="flex-1" />
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
          {total > OUTRIGHT_PREVIEW ? (
            <div className="relative mb-3 w-full sm:w-[280px]">
              <IconSearch
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                stroke={1.5}
              />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${total} selections`}
                aria-label={`Search ${future.name}`}
                className="h-9 rounded-md border-border bg-background pl-9 text-base shadow-none md:text-sm"
              />
            </div>
          ) : null}
          {shown.length === 0 ? (
            <Typography as="p" shape="xs" variant="muted" className="px-1 py-4">
              No selections match “{query}”.
            </Typography>
          ) : (
            <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 xl:grid-cols-3">
              {shown.map((pick) => {
                const on = selectedIds.has(pick.id)
                return (
                  <button
                    key={pick.id}
                    type="button"
                    data-pick-id={pick.id}
                    aria-pressed={on}
                    onClick={(e) =>
                      onPick(
                        {
                          id: pick.id,
                          label: pick.label,
                          odds: pick.odds,
                          eventLabel,
                          market: future.name,
                          sport,
                          outright: true,
                        },
                        e.currentTarget,
                      )
                    }
                    className={cn(
                      'flex h-11 min-w-0 items-center gap-2 rounded-lg border px-3 text-left transition-colors',
                      on
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-secondary text-foreground hover:bg-accent',
                    )}
                  >
                    {pick.team ? <BoardTeamBadge name={pick.team} /> : null}
                    <span className="min-w-0 flex-1 truncate text-sm">{pick.label}</span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">{pick.odds}</span>
                  </button>
                )
              })}
            </div>
          )}
          {!q && total > OUTRIGHT_PREVIEW ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAll((v) => !v)}
              className="mt-2 h-8 w-full gap-1 text-muted-foreground hover:text-foreground"
            >
              {all ? 'Show fewer' : `Show all ${total}`}
              <IconChevronDown
                className={cn('size-3.5 transition-transform', all && 'rotate-180')}
                stroke={1.5}
              />
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

/** PropShopX 321:209953 — Soccer Games; 355:27661 — league-specific drill. */
/** Board legs carry the game so the slip can group SGPs and My Bets can link back. */
function boardPickMeta(event: SoccerEvent) {
  return {
    eventId: event.id,
    eventHref: soccerEventHref(event.id),
    sport: 'soccer' as const,
    live: !!event.live,
  }
}

export function SoccerSportPage({
  className,
  markets,
}: {
  className?: string
  /** V3 — sport-filtered Markets shelf under the boards. */
  markets?: ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { startNavigating } = useShell()
  /** Figma capture states: board | menu | updated */
  const handover = searchParams.get('handover')
  const handoverEventId = 'mun-mci'
  const [mode, setMode] = useState<SoccerMode>('games')
  const [leagueFilter, setLeagueFilter] = useState('all')
  const [countryId, setCountryId] = useState<string>('all')
  const [leagueId, setLeagueId] = useState<string>('all')
  const slipPicks = useSoccerSlip()
  const setSlipPicks = setSoccerSlip
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  /** Active alternate line per event — keys `${eventId}:spread|total`. */
  const [lineState, setLineState] = useState<Record<string, number>>({})
  const [handoverSeeded, setHandoverSeeded] = useState(false)

  useEffect(() => {
    rememberSportsReturn(pathname)
  }, [pathname])

  useEffect(() => {
    if (handoverSeeded || !handover) return
    const event = soccerSectionsForFilter('all')
      .flatMap((s) => s.events)
      .find((e) => e.id === handoverEventId)
    if (!event?.spreadLines?.length) return
    const main =
      event.spreadLines.find((p) => p.line === event.defaultSpreadLine) ?? event.spreadLines[3]
    const alt = event.spreadLines.find((p) => p.line === 2) ?? event.spreadLines[4]
    if (!main || !alt) return
    if (handover === 'updated') {
      setLineState({ [`${event.id}:spread`]: alt.line })
      setSlipPicks([
        {
          id: alt.a.id,
          label: alt.a.label,
          odds: alt.a.odds,
          eventLabel: `${event.home} vs ${event.away}`,
          market: 'Spread',
        },
      ])
    } else if (handover === 'board' || handover === 'menu') {
      setSlipPicks([
        {
          id: main.a.id,
          label: main.a.label,
          odds: main.a.odds,
          eventLabel: `${event.home} vs ${event.away}`,
          market: 'Spread',
        },
      ])
    } else if (handover === 'menu-noslip') {
      /* Points menu open, betslip closed / empty — anatomy without dock. */
      setSlipPicks([])
    }
    setHandoverSeeded(true)
  }, [handover, handoverSeeded])

  const leagueView = isSoccerLeagueView(leagueFilter)
  const sections = soccerSectionsForFilter(leagueFilter)
  /** Full sport rail always — football Figma siblings only apply to NFL/NCAA, not soccer. */
  const modePills = leagueView ? SOCCER_LEAGUE_MODES : SOCCER_MODES
  /** League page only has Games | All Leagues — clamp Outrights away. */
  const displayMode: SoccerMode = leagueView && mode === 'outrights' ? 'games' : mode

  const selectedIds = useMemo(() => new Set(slipPicks.map((p) => p.id)), [slipPicks])

  const countryLabel =
    SOCCER_COUNTRY_OPTIONS.find((c) => c.id === countryId)?.label ?? 'Select Country'
  const leagueOptions = useMemo(
    () =>
      SOCCER_LEAGUE_OPTIONS.filter(
        (l) => countryId === 'all' || l.country === 'all' || l.country === countryId,
      ),
    [countryId],
  )
  const leagueLabel = SOCCER_LEAGUE_OPTIONS.find((l) => l.id === leagueId)?.label ?? 'Select League'

  const exitLeagueView = () => {
    setLeagueFilter('all')
    setLeagueId('all')
    setCountryId('all')
    setMode('games')
  }

  const goBack = () => {
    if (leagueView) {
      exitLeagueView()
      return
    }
    startNavigating('/sports')
    router.push('/sports')
  }

  const onTogglePick = (pick: SoccerOdds, event: SoccerEvent, originEl?: HTMLElement | null) => {
    const removing = slipPicks.some((p) => p.id === pick.id)
    if (removing) {
      setSlipPicks((prev) => prev.filter((p) => p.id !== pick.id))
      return
    }
    const all = picksWithActiveLines(
      event,
      activeLineFor(lineState, event, 'spread'),
      activeLineFor(lineState, event, 'total'),
    )
    const next: SoccerSlipPick = {
      id: pick.id,
      label: pick.label,
      odds: pick.odds,
      eventLabel: `${event.home} vs ${event.away}`,
      market: marketForPick(pick, all),
      ...boardPickMeta(event),
    }
    setSlipPicks((prev) => withOneLegPerMarket(prev, next))
    revealShellDock()
    flyBetDotToSlip(originEl, next.id)
  }

  const onPickOutright = (next: SoccerSlipPick, originEl?: HTMLElement | null) => {
    if (slipPicks.some((p) => p.id === next.id)) {
      setSlipPicks((prev) => prev.filter((p) => p.id !== next.id))
      return
    }
    setSlipPicks((prev) => [next, ...prev])
    revealShellDock()
    flyBetDotToSlip(originEl, next.id)
  }

  /**
   * Alt-line tap: the tapped pair goes on the event row, the tapped side goes on the betslip
   * (replacing any leg already in that market). Tapping a chip that's already on the slip removes it.
   */
  const onPickAltLine = (event: SoccerEvent, family: SoccerLineFamily, pick: SoccerOdds) => {
    const pairs = family === 'spread' ? event.spreadLines : event.totalLines
    if (!pairs?.length || pick.line == null) return
    setLineState((s) => ({ ...s, [`${event.id}:${family}`]: pick.line! }))

    if (slipPicks.some((p) => p.id === pick.id)) {
      setSlipPicks((prev) => prev.filter((p) => p.id !== pick.id))
      return
    }
    const next: SoccerSlipPick = {
      id: pick.id,
      label: pick.label,
      odds: pick.odds,
      eventLabel: `${event.home} vs ${event.away}`,
      market: family === 'spread' ? 'Spread' : 'Total',
      ...boardPickMeta(event),
    }
    setSlipPicks((prev) => withOneLegPerMarket(prev, next))
    revealShellDock()
    /* Fly from the board chip that just took the tapped line (popover chip is unmounting). */
    window.requestAnimationFrame(() => {
      const origin = [...document.querySelectorAll<HTMLElement>('[data-pick-id]')].find(
        (el) => el.dataset.pickId === pick.id && el.getBoundingClientRect().width > 0,
      )
      flyBetDotToSlip(origin ?? null, pick.id)
    })
  }

  const onRemovePick = (id: string) => {
    setSlipPicks((prev) => prev.filter((p) => p.id !== id))
  }

  const onModeChange = (id: SoccerMode) => {
    if (leagueView && id === 'outrights') return
    setMode(id)
  }

  const onPickCountry = (id: string) => {
    setCountryId(id)
    setLeagueId('all')
    if (id === 'england') {
      setLeagueFilter('epl')
      setLeagueId('epl')
    } else if (id === 'spain') {
      setLeagueFilter('laliga')
      setLeagueId('laliga')
    } else if (id === 'italy') {
      setLeagueFilter('seriea')
      setLeagueId('seriea')
    } else if (id === 'germany') {
      setLeagueFilter('bundesliga')
      setLeagueId('bundesliga')
    } else if (id === 'france') {
      setLeagueFilter('ligue1')
      setLeagueId('ligue1')
    } else {
      setLeagueFilter('all')
    }
    setMode('games')
  }

  const enterLeague = (id: string) => {
    if (id === 'all') {
      exitLeagueView()
      return
    }
    setLeagueFilter(id)
    setLeagueId(id)
    const opt = SOCCER_LEAGUE_OPTIONS.find((l) => l.id === id)
    if (opt && opt.country !== 'all') setCountryId(opt.country)
    else if (id === 'epl' || id === 'championship') setCountryId('england')
    else if (id === 'laliga') setCountryId('spain')
    else if (id === 'seriea') setCountryId('italy')
    else if (id === 'bundesliga') setCountryId('germany')
    else if (id === 'ligue1') setCountryId('france')
    setMode('games')
  }

  const onPickLeague = (id: string) => {
    if (id === 'all') {
      exitLeagueView()
      setMode('leagues')
      return
    }
    enterLeague(id)
  }

  const onQuickLink = (id: string) => {
    enterLeague(id)
  }

  const onQuickNavigate = (href: string) => {
    startNavigating(href)
    router.push(href)
  }

  return (
    <div
      data-name={leagueView ? 'soccer-league-page' : 'soccer-sport-page'}
      className={cn('mx-auto w-full max-w-[1440px] px-4 py-4 md:px-6 md:py-6', className)}
    >
      {/* Breadcrumbs — swipe to see overflow (scrollport ≠ flex row). */}
      <div data-name="breadcrumbs" className="mb-4 flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={goBack}
          aria-label={leagueView ? 'Back to soccer' : 'Back to sports home'}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary transition-colors hover:bg-accent"
        >
          <IconChevronLeft className="size-4" stroke={1.5} />
        </button>
        <div className="scrollbar-hide min-w-0 flex-1 overflow-x-auto overscroll-x-contain">
          <div className="flex w-max items-center gap-1.5 whitespace-nowrap pr-1 text-sm leading-none">
            <span className="inline-flex h-7 shrink-0 items-center gap-1.5 font-medium text-foreground">
              <IconBallFootball className="size-4 shrink-0" stroke={1.5} />
              Soccer
            </span>
            <span
              className="inline-flex h-7 shrink-0 items-center text-muted-foreground/70"
              aria-hidden
            >
              /
            </span>
            <BreadcrumbMenu
              label={countryId === 'all' ? 'Select Country' : countryLabel}
              options={SOCCER_COUNTRY_OPTIONS.map((c) => ({ id: c.id, label: c.label }))}
              active={countryId}
              onPick={onPickCountry}
              emphasize={leagueView}
            />
            <span
              className="inline-flex h-7 shrink-0 items-center text-muted-foreground/70"
              aria-hidden
            >
              /
            </span>
            <BreadcrumbMenu
              label={leagueId === 'all' ? 'Select League' : leagueLabel}
              options={leagueOptions.map((l) => ({ id: l.id, label: l.label }))}
              active={leagueId}
              onPick={onPickLeague}
              emphasize={leagueView}
            />
          </div>
        </div>
      </div>

      <LeagueQuickLinks
        links={SOCCER_QUICK_LINKS}
        activeId={leagueFilter}
        onPick={onQuickLink}
        onNavigate={onQuickNavigate}
      />

      <ModePillTrack active={displayMode} onChange={onModeChange} modes={modePills} />

      {displayMode === 'games'
        ? sections.map((section, i) => (
            <LeagueGamesCard
              key={section.id}
              section={section}
              expanded={leagueView || i === 0 || !!expanded[section.id]}
              onToggleMore={() => setExpanded((s) => ({ ...s, [section.id]: !s[section.id] }))}
              selectedIds={selectedIds}
              onSelect={onTogglePick}
              lineState={lineState}
              onPickAltLine={onPickAltLine}
              hideSeeAll={leagueView}
              onSeeAll={enterLeague}
              forceOpenSpreadEventId={
                handover === 'menu' || handover === 'menu-noslip' ? handoverEventId : undefined
              }
            />
          ))
        : null}

      {displayMode === 'games' && markets ? markets : null}

      {displayMode === 'sgp' ? <SportSgpShelf sport="soccer" bleed /> : null}
      {displayMode === 'boosts' ? <SportBoostsShelf sport="soccer" bleed /> : null}
      {displayMode === 'mega' ? <SportMegaShelf sport="soccer" bleed /> : null}

      {displayMode === 'outrights' && !leagueView ? (
        <OutrightsBoard
          futures={SOCCER_OUTRIGHTS}
          eventLabel="Soccer Outrights"
          sport="soccer"
          selectedIds={selectedIds}
          onPick={onPickOutright}
        />
      ) : null}
      {displayMode === 'leagues' ? <AllLeaguesView onSelectLeague={enterLeague} /> : null}

      {displayMode === 'games' && sections.length === 0 ? (
        <div className={cn(CARD, 'px-6 py-12 text-center')}>
          <Typography as="p" shape="small" variant="muted">
            No games for this league right now.
          </Typography>
        </div>
      ) : null}

      {/* Sports → casino funnel — social proof under the board. */}
      <div className="-mx-4 mt-6 md:-mx-6">
        <CasinoLiveWinsCarousel />
      </div>

      <SoccerBetslip
        picks={slipPicks}
        onRemove={onRemovePick}
        onClear={() => setSlipPicks([])}
        onChange={setSlipPicks}
      />
    </div>
  )
}
