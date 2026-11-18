'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import { useShell } from '@/components/site/shell-context'
import { ShellIcon } from '@/components/site/shell-icons'
import { useDragToClose } from '@/components/site/use-drag-to-close'
import { ORIGINALS_GAMES } from '@/lib/lumen/casino-lobby-catalog'
import { fireJoinWelcomeConfetti } from '@/lib/lumen/vip-celebrate'
import { cn } from '@/lib/utils'

/** Cross-sell strip after place — busy originals shelf. */
const BETSLIP_CROSS_SELL = ORIGINALS_GAMES.slice(0, 8)
/** Same glass edge recipe as soccer odds rails — desktop only. */
const CROSS_SELL_ARROW =
  'absolute top-1/2 z-20 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/55 text-foreground backdrop-blur-md outline-none hover:bg-background/75 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-35'

export type SoccerSlipPick = {
  id: string
  label: string
  odds: string
  eventLabel: string
  market: string
}

const DEFAULT_STAKE = '0.00'
/** Same field recipe as RAF + cashier wallet converter. */
const FIELD = 'rounded-lg border border-input bg-popover'
/** Match casino activity feed enter. */
const LEG_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

function parseAmerican(odds: string): number {
  const n = Number.parseFloat(odds.replace(/^\+/, ''))
  return Number.isFinite(n) ? n : -110
}

function americanToDecimal(american: number): number {
  if (american > 0) return 1 + american / 100
  return 1 + 100 / Math.abs(american)
}

function decimalToAmerican(decimal: number): string {
  if (decimal >= 2) return `+${Math.round((decimal - 1) * 100)}`
  return `${Math.round(-100 / (decimal - 1))}`
}

export function combineAmericanOdds(picks: SoccerSlipPick[]): string {
  if (picks.length === 0) return ''
  if (picks.length === 1) return picks[0]!.odds
  const decimal = picks.reduce((acc, p) => acc * americanToDecimal(parseAmerican(p.odds)), 1)
  return decimalToAmerican(decimal)
}

function winForOdds(odds: string, stake: number): number {
  if (stake <= 0) return 0
  return stake * americanToDecimal(parseAmerican(odds))
}

function parseStake(text: string): number {
  const n = Number.parseFloat(text.replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : 0
}

function formatStakeInput(raw: string): string {
  return raw.replace(/[^0-9.]/g, '')
}

function useAnimatedOpen(open: boolean) {
  const [mounted, setMounted] = useState(false)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      setShown(false)
      let timeout = 0
      const frame = window.requestAnimationFrame(() => {
        timeout = window.setTimeout(() => setShown(true), 24)
      })
      return () => {
        window.cancelAnimationFrame(frame)
        window.clearTimeout(timeout)
      }
    }
    setShown(false)
    const timer = window.setTimeout(() => setMounted(false), 280)
    return () => window.clearTimeout(timer)
  }, [open])

  return { mounted, shown }
}

function StakeField({
  value,
  onChange,
  toWin,
  ariaLabel,
}: {
  value: string
  onChange: (next: string) => void
  toWin: number
  ariaLabel: string
}) {
  return (
    <div className="flex w-[112px] shrink-0 flex-col gap-1.5">
      <Input
        type="text"
        inputMode="decimal"
        aria-label={ariaLabel}
        value={value ? `$${value}` : ''}
        placeholder="$0.00"
        onChange={(e) => onChange(formatStakeInput(e.target.value.replace(/^\$/, '')))}
        onFocus={(e) => e.target.select()}
        className={cn(
          FIELD,
          /* text-base (16px) — iOS auto-zooms focused inputs under 16px and sticks zoomed. */
          'h-9 px-3 text-right text-base tabular-nums text-foreground shadow-none focus-visible:ring-1',
        )}
      />
      <p className="px-0.5 text-right text-xs leading-4 text-muted-foreground">
        To Win ${toWin.toFixed(2)}
      </p>
    </div>
  )
}

/**
 * PropShopX betslip — straight legs + sticky parlay when 2+.
 * Mobile: dock opens drawer (no floating Selection bar, no minimize).
 * Desktop: Selection dock when minimized; minimize chevron in header.
 */
export function SoccerBetslip({
  picks,
  onRemove,
  onClear,
}: {
  picks: SoccerSlipPick[]
  onRemove: (id: string) => void
  onClear: () => void
}) {
  const router = useRouter()
  const {
    setSportsBetCount,
    sportsBetslipOpenTick,
    setSportsBetslipOpen,
    startNavigating,
    launchGame,
    canPlaceSportsBets,
    joinJourney,
    openProfileGate,
    loggedIn,
    openAuth,
  } = useShell()
  const [open, setOpen] = useState(false)
  const [portalReady, setPortalReady] = useState(false)
  /** Per-pick straight stakes */
  const [straightStakes, setStraightStakes] = useState<Record<string, string>>({})
  const [parlayStake, setParlayStake] = useState(DEFAULT_STAKE)
  /** Post–Place Bet confirmation (confetti + My Bets + cross-sell). */
  const [confirmed, setConfirmed] = useState(false)
  const [confirmedStake, setConfirmedStake] = useState(0)
  const [confirmedWin, setConfirmedWin] = useState(0)
  const [confirmedCount, setConfirmedCount] = useState(0)
  const [crossSellCanPrev, setCrossSellCanPrev] = useState(false)
  const [crossSellCanNext, setCrossSellCanNext] = useState(false)
  const crossSellRef = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef(0)
  const dismissedRef = useRef(false)
  /** Desktop Selection bar only after user minimizes — never on first bet. */
  const [showDesktopDock, setShowDesktopDock] = useState(false)
  const openTickSeenRef = useRef(sportsBetslipOpenTick)

  const combined = combineAmericanOdds(picks)
  const hasPicks = picks.length > 0
  const showParlay = picks.length > 1
  const picksLenRef = useRef(picks.length)
  picksLenRef.current = picks.length

  const closeDrawer = useCallback(() => {
    setOpen(false)
    if (picksLenRef.current > 0) {
      dismissedRef.current = true
      setShowDesktopDock(true)
    } else {
      setShowDesktopDock(false)
    }
  }, [])

  const { mounted, shown } = useAnimatedOpen(open)
  const { sheetRef, offset, dragging, bind } = useDragToClose(open, closeDrawer)

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    setSportsBetslipOpen(open)
    return () => setSportsBetslipOpen(false)
  }, [open, setSportsBetslipOpen])

  useEffect(() => {
    setSportsBetCount(picks.length)
    return () => setSportsBetCount(0)
  }, [picks.length, setSportsBetCount])

  /* Seed stake when a new pick lands */
  useEffect(() => {
    setStraightStakes((prev) => {
      const next = { ...prev }
      let changed = false
      for (const p of picks) {
        if (next[p.id] === undefined) {
          next[p.id] = DEFAULT_STAKE
          changed = true
        }
      }
      for (const id of Object.keys(next)) {
        if (!picks.some((p) => p.id === id)) {
          delete next[id]
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [picks])

  useEffect(() => {
    const prev = prevCountRef.current
    const next = picks.length
    prevCountRef.current = next

    if (next === 0) {
      setStraightStakes({})
      setParlayStake(DEFAULT_STAKE)
      setShowDesktopDock(false)
      dismissedRef.current = false
      return
    }

    /* Desktop: first pick opens drawer. Mobile: keep dock for fly → Betslip icon. */
    if (prev === 0 && next > 0) {
      setShowDesktopDock(false)
      setConfirmed(false)
      const desktop =
        typeof window !== 'undefined' &&
        window.matchMedia('(min-width: 1024px)').matches
      if (!dismissedRef.current && desktop) setOpen(true)
    }
  }, [picks.length])

  /* Dock Betslip always opens the drawer — empty shows empty state. */
  useEffect(() => {
    if (sportsBetslipOpenTick === openTickSeenRef.current) return
    openTickSeenRef.current = sportsBetslipOpenTick
    dismissedRef.current = false
    setShowDesktopDock(false)
    setOpen(true)
  }, [sportsBetslipOpenTick])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
    }
    document.addEventListener('keydown', onKey)
    const prevBodyOverflow = document.body.style.overflow
    const prevHtmlOverscroll = document.documentElement.style.overscrollBehaviorY
    const prevBodyOverscroll = document.body.style.overscrollBehaviorY
    const shell = document.getElementById('shell-scroll')
    const prevShellOverscroll = shell?.style.overscrollBehaviorY ?? ''
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overscrollBehaviorY = 'none'
    document.body.style.overscrollBehaviorY = 'none'
    if (shell) shell.style.overscrollBehaviorY = 'none'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.style.overscrollBehaviorY = prevHtmlOverscroll
      document.body.style.overscrollBehaviorY = prevBodyOverscroll
      if (shell) shell.style.overscrollBehaviorY = prevShellOverscroll
    }
  }, [open, closeDrawer])

  const parlayStakeNum = parseStake(parlayStake)
  const parlayWin = showParlay ? winForOdds(combined, parlayStakeNum) : 0

  const straightTotalStake = picks.reduce(
    (sum, p) => sum + parseStake(straightStakes[p.id] ?? ''),
    0,
  )
  const straightTotalWin = picks.reduce(
    (sum, p) => sum + winForOdds(p.odds, parseStake(straightStakes[p.id] ?? '')),
    0,
  )
  const placeStake = showParlay
    ? straightTotalStake + parlayStakeNum
    : straightTotalStake
  const placeWin = showParlay ? straightTotalWin + parlayWin : straightTotalWin

  const onPlaceBet = () => {
    if (placeStake <= 0 || picks.length === 0) return
    if (!loggedIn) {
      openAuth('join')
      return
    }
    if (!canPlaceSportsBets) {
      openProfileGate(joinJourney === 3 ? 'sports-level' : 'sports-name')
      return
    }
    setConfirmedCount(picks.length)
    setConfirmedStake(placeStake)
    setConfirmedWin(placeWin)
    setConfirmed(true)
    window.setTimeout(() => fireJoinWelcomeConfetti(), 80)
  }

  const onReuseSelection = () => {
    setConfirmed(false)
  }

  const onMyBets = () => {
    startNavigating('/account/bet-history')
    router.push('/account/bet-history')
    closeDrawer()
  }

  const syncCrossSellArrows = useCallback(() => {
    const el = crossSellRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setCrossSellCanPrev(el.scrollLeft > 4)
    setCrossSellCanNext(max - el.scrollLeft > 4)
  }, [])

  useEffect(() => {
    if (!confirmed) return
    const el = crossSellRef.current
    if (!el) return
    syncCrossSellArrows()
    el.addEventListener('scroll', syncCrossSellArrows, { passive: true })
    window.addEventListener('resize', syncCrossSellArrows)
    return () => {
      el.removeEventListener('scroll', syncCrossSellArrows)
      window.removeEventListener('resize', syncCrossSellArrows)
    }
  }, [confirmed, syncCrossSellArrows])

  const scrollCrossSell = (dir: -1 | 1) => {
    const el = crossSellRef.current
    if (!el) return
    el.scrollBy({ left: dir * 160, behavior: 'smooth' })
  }

  const backdropOpacity = shown ? Math.max(0, 1 - offset / 320) : 0

  const sheet =
    mounted && portalReady
      ? createPortal(
          <div
            data-soccer-betslip-root=""
            data-name="soccer-betslip-root"
            className={cn(
              'fixed inset-0 z-[120] lg:pointer-events-none lg:inset-x-0 lg:bottom-0 lg:top-auto',
              shown ? 'pointer-events-auto' : 'pointer-events-none',
            )}
          >
            {/* Mobile: catch off-handle swipes so the page doesn’t pull-to-refresh. */}
            <button
              type="button"
              aria-label="Close betslip"
              data-soccer-betslip-backdrop=""
              data-state={shown ? 'open' : 'closed'}
              onClick={closeDrawer}
              className="absolute inset-0 border-0 bg-black/60 lg:hidden"
              style={
                dragging
                  ? { opacity: backdropOpacity, transition: 'none' }
                  : { opacity: shown ? 1 : 0 }
              }
            />
            <aside
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label="Betslip"
              data-name="soccer-betslip"
              data-brand="betonline"
              data-state={shown ? 'open' : 'closed'}
              data-dragging={dragging ? 'true' : undefined}
              {...bind}
              className={cn(
                /* Mobile: flush bottom drawer. Desktop: 375 card. */
                'dark pointer-events-auto absolute inset-x-0 bottom-0 flex w-full flex-col',
                'mx-auto max-w-none lg:max-w-[375px]',
                'max-h-[min(85dvh,640px)] overflow-hidden rounded-t-[10px]',
                'border border-border border-b-0 bg-popover text-popover-foreground',
                'shadow-[0_8px_40px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.06)]',
              )}
              style={
                offset > 0
                  ? { transform: `translateY(${offset}px)`, transition: 'none' }
                  : undefined
              }
            >
              <div
                data-drag-handle=""
                className="flex w-full shrink-0 cursor-grab touch-none items-center justify-center px-4 pb-2 pt-3 active:cursor-grabbing"
                aria-label="Drag down to close"
              >
                <span />
              </div>

              {/* Header — trash when picks; minimize desktop-only */}
              <div className="flex shrink-0 items-center gap-1 px-4 pb-2">
                {confirmed ? null : (
                  <span
                    data-betslip-fly-target=""
                    className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-medium leading-4 text-primary-foreground"
                  >
                    {picks.length}
                  </span>
                )}
                <Typography
                  as="span"
                  shape="small"
                  weight="semibold"
                  className={cn(
                    'min-w-0 flex-1 truncate',
                    confirmed && 'tabular-nums text-muted-foreground',
                  )}
                >
                  {confirmed
                    ? `${confirmedCount} selection${confirmedCount === 1 ? '' : 's'} · $${confirmedStake.toFixed(2)} to win $${confirmedWin.toFixed(2)}`
                    : hasPicks
                      ? `Selection${picks.length > 1 ? 's' : ''}`
                      : 'Betslip'}
                </Typography>
                {hasPicks && !confirmed ? (
                  <span className="tabular-nums text-sm font-semibold text-foreground">
                    {combined}
                  </span>
                ) : null}
                {hasPicks && !confirmed ? (
                  <button
                    type="button"
                    aria-label="Remove all"
                    onClick={onClear}
                    className="shell-chrome-btn inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-destructive transition-colors duration-200 ease-in-out hover:bg-accent"
                  >
                    <IconTrash className="size-4" stroke={1.5} />
                  </button>
                ) : null}
                <button
                  type="button"
                  aria-label="Minimize betslip"
                  onClick={closeDrawer}
                  className="shell-chrome-btn hidden size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 ease-in-out hover:bg-accent hover:text-foreground lg:inline-flex"
                >
                  <IconChevronDown className="size-4" stroke={1.5} />
                </button>
              </div>

              <div className="mx-4 h-px shrink-0 bg-border" />

              {confirmed ? (
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-hide">
                  {/* Join-welcome success pattern — primary disc + bold check, concrete copy. */}
                  <div className="flex flex-col items-center px-6 pb-5 pt-7 text-center">
                    <motion.div
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                    >
                      <span className="relative flex size-14 items-center justify-center rounded-full bg-primary">
                        <motion.span
                          initial={{ scale: 0, rotate: -30 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 16,
                            delay: 0.12,
                          }}
                        >
                          <IconCheck
                            className="size-7 text-primary-foreground"
                            stroke={3}
                          />
                        </motion.span>
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="mt-5"
                    >
                      <h3 className="text-[22px] font-bold leading-tight tracking-tight text-foreground">
                        Bets placed
                      </h3>
                    </motion.div>
                  </div>

                  <div className="flex flex-col items-center gap-2.5 px-4 pb-4">
                    <Button
                      type="button"
                      onClick={onMyBets}
                      className={cn(
                        'inline-flex h-10 w-auto items-center justify-center gap-2 rounded-lg px-5',
                        'bg-primary text-primary-foreground',
                        'transition-colors hover:bg-[color-mix(in_srgb,var(--primary)_88%,black)]',
                        'active:bg-[color-mix(in_srgb,var(--primary)_80%,black)]',
                      )}
                    >
                      <ShellIcon
                        name="ticket"
                        tone="token"
                        className="size-4 text-primary-foreground"
                      />
                      My Bets
                    </Button>
                    <button
                      type="button"
                      onClick={onReuseSelection}
                      className="text-xs font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
                    >
                      Reuse selection
                    </button>
                  </div>

                  <div className="mx-4 h-px shrink-0 bg-border" />

                  <div className="flex items-center justify-between gap-2 px-4 pb-2 pt-3">
                    <Typography as="p" shape="xs" weight="medium" className="text-muted-foreground">
                      Play while you wait
                    </Typography>
                  </div>
                  {/* py room so hover lift isn’t clipped by overflow-x */}
                  <div className="relative pb-4 pt-1">
                    <div
                      ref={crossSellRef}
                      className="scrollbar-hide overflow-x-auto overscroll-x-contain py-2"
                    >
                      <div className="flex w-max gap-2 px-4">
                        {BETSLIP_CROSS_SELL.map((game) => (
                          <button
                            key={game.id}
                            type="button"
                            aria-label={`Play ${game.title}`}
                            onClick={(e) => launchGame(game, e.currentTarget)}
                            className={cn(
                              'relative z-0 h-[92px] w-[68px] shrink-0 overflow-hidden rounded-[10px]',
                              'border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]',
                              'transition-transform duration-200',
                              '[@media(hover:hover)_and_(pointer:fine)]:hover:z-10 [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-1',
                            )}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={game.imageSrc}
                              alt=""
                              className="absolute inset-0 size-full object-cover object-top"
                            />
                            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-1 pb-1.5 pt-6">
                              <span className="block truncate text-center text-[9px] font-semibold leading-tight text-white">
                                {game.title}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Desktop only — mobile stays swipe. */}
                    <button
                      type="button"
                      aria-label="Previous games"
                      disabled={!crossSellCanPrev}
                      onClick={() => scrollCrossSell(-1)}
                      className={cn(
                        CROSS_SELL_ARROW,
                        'left-1 hidden [@media(hover:hover)_and_(pointer:fine)]:inline-flex',
                      )}
                    >
                      <IconChevronLeft className="size-4" stroke={2} />
                    </button>
                    <button
                      type="button"
                      aria-label="Next games"
                      disabled={!crossSellCanNext}
                      onClick={() => scrollCrossSell(1)}
                      className={cn(
                        CROSS_SELL_ARROW,
                        'right-1 hidden [@media(hover:hover)_and_(pointer:fine)]:inline-flex',
                      )}
                    >
                      <IconChevronRight className="size-4" stroke={2} />
                    </button>
                  </div>
                </div>
              ) : hasPicks ? (
                <>
                  {/* Straight bets — label scrolls with picks (not sticky) */}
                  <div className="min-h-0 flex-1 overflow-y-auto px-3 scrollbar-hide">
                    <Typography
                      as="div"
                      shape="xs"
                      weight="medium"
                      className="px-1 pb-1 pt-2 uppercase tracking-wide text-muted-foreground"
                    >
                      Straight bet
                    </Typography>
                    <AnimatePresence initial={false} mode="popLayout">
                      {picks.map((pick, i) => {
                        const stakeText = straightStakes[pick.id] ?? DEFAULT_STAKE
                        const stakeNum = parseStake(stakeText)
                        const toWin = winForOdds(pick.odds, stakeNum)
                        return (
                          <motion.div
                            key={pick.id}
                            layout
                            data-name="betslip-leg"
                            data-betslip-leg={pick.id}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 12, transition: { duration: 0.18 } }}
                            transition={{
                              duration: 0.25,
                              ease: LEG_EASE,
                              layout: { duration: 0.25, ease: LEG_EASE },
                            }}
                            className={cn(
                              'flex items-start gap-2 py-3',
                              i > 0 && 'border-t border-border',
                            )}
                          >
                            <button
                              type="button"
                              aria-label={`Remove ${pick.label}`}
                              className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                              onClick={() => onRemove(pick.id)}
                            >
                              <IconX className="size-4" stroke={2} />
                            </button>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold leading-5 text-foreground">
                                {pick.label}
                              </div>
                              <div className="truncate text-xs leading-4 text-foreground">
                                {pick.market}
                              </div>
                              <div className="truncate text-xs leading-4 text-muted-foreground">
                                {pick.eventLabel}
                              </div>
                            </div>
                            <span className="w-11 shrink-0 pt-2 text-right text-sm font-semibold tabular-nums text-foreground">
                              {pick.odds}
                            </span>
                            <StakeField
                              value={stakeText}
                              onChange={(next) =>
                                setStraightStakes((s) => ({ ...s, [pick.id]: next }))
                              }
                              toWin={toWin}
                              ariaLabel={`Stake for ${pick.label}`}
                            />
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>

                  {/* Sticky parlay — only when 2+ picks */}
                  {showParlay ? (
                    <div
                      data-name="betslip-parlay"
                      className="shrink-0 border-t border-border bg-secondary/60 px-4 py-3"
                    >
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <Typography as="div" shape="small" weight="semibold">
                            {picks.length}-Pick Parlay
                          </Typography>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{picks.length} Legs</span>
                            <span className="tabular-nums font-semibold text-foreground">
                              {combined}
                            </span>
                          </div>
                        </div>
                        <StakeField
                          value={parlayStake}
                          onChange={setParlayStake}
                          toWin={parlayWin}
                          ariaLabel="Parlay stake"
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="shrink-0 px-4 pt-2 pb-1">
                    <Button
                      type="button"
                      disabled={placeStake <= 0}
                      onClick={onPlaceBet}
                      className={cn(
                        'flex h-auto w-full flex-col items-center justify-center gap-0.5 rounded-lg px-4 py-2.5',
                        'border border-border bg-success text-success-foreground',
                        'hover:bg-[color-mix(in_srgb,var(--success)_88%,transparent)]',
                        'disabled:opacity-45',
                      )}
                    >
                      <span className="text-sm font-semibold leading-5">
                        Place ${placeStake > 0 ? placeStake.toFixed(2) : '0.00'}
                      </span>
                      <span className="text-xs font-normal leading-4 opacity-90">
                        To Win ${placeWin.toFixed(2)}
                      </span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex min-h-[160px] flex-1 flex-col items-center justify-center gap-1 px-6 py-10 text-center">
                  <Typography as="p" shape="small" weight="semibold" className="text-foreground">
                    No bets at this time
                  </Typography>
                  <Typography as="p" shape="xs" className="text-muted-foreground">
                    Tap odds on the board to build your slip.
                  </Typography>
                </div>
              )}
            </aside>
          </div>,
          document.body,
        )
      : null

  return (
    <>
      {/* Desktop only — after minimize, not on first bet. Mobile uses shell dock. */}
      {hasPicks && !open && showDesktopDock ? (
        <button
          type="button"
          data-name="soccer-betslip-dock"
          data-shell-betslip=""
          onClick={() => {
            dismissedRef.current = false
            setShowDesktopDock(false)
            setOpen(true)
          }}
          className={cn(
            'fixed inset-x-0 z-[120] mx-auto hidden w-full max-w-[375px] items-center gap-2 px-3 lg:flex',
            'lg:bottom-6',
          )}
        >
          <span
            className={cn(
              'dark flex w-full items-center gap-2 rounded-[10px] border border-border bg-popover px-4 py-3',
              'shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.06)]',
            )}
          >
            <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {picks.length}
            </span>
            <Typography as="span" shape="small" weight="semibold" className="flex-1 text-left text-popover-foreground">
              Selection{picks.length > 1 ? 's' : ''}
            </Typography>
            <span className="tabular-nums text-sm font-semibold text-popover-foreground">
              {combined}
            </span>
          </span>
        </button>
      ) : null}
      {sheet}
    </>
  )
}
