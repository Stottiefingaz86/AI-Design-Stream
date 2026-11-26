'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IconAlertTriangle,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconChevronLeft,
  IconChevronRight,
  IconArrowBackUp,
  IconRepeat,
  IconShare,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/sonner'
import { Typography } from '@/components/ui/typography'
import { useShell } from '@/components/site/shell-context'
import { ShellIcon } from '@/components/site/shell-icons'
import { useDragToClose } from '@/components/site/use-drag-to-close'
import { ORIGINALS_GAMES } from '@/lib/lumen/casino-lobby-catalog'
import {
  addSportsBets,
  newBetId,
  type BetLeg,
  type BetType,
  type SportsBet,
} from '@/lib/lumen/sports-bets-store'
import { getSlipAddTick, useSlipAddTick } from '@/lib/lumen/soccer-slip-store'
import { slipLiveMeta } from '@/lib/lumen/slip-live'
import { fireJoinWelcomeConfetti } from '@/lib/lumen/vip-celebrate'
import { cn } from '@/lib/utils'
import { ComboMark } from './v5/combo-mark'
import { ComboBoostMeter } from './v5/v5-combo-boost'

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
  /** Same-game grouping (SGP) — falls back to `eventLabel` for older slips. */
  eventId?: string
  eventHref?: string
  sport?: 'soccer' | 'nfl'
  live?: boolean
  /** Futures — straight only, never in an SGP or parlay. */
  outright?: boolean
}

const DEFAULT_STAKE = '0.00'
/** Same field recipe as RAF + cashier wallet converter. */
const FIELD = 'rounded-lg border border-input bg-popover'
/** Match casino activity feed enter. */
const LEG_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
/** Same-game legs are correlated — price only part of the straight product. */
const SGP_HAIRCUT = 0.82
const MIN_RISK = 1
const MAX_RISK: Record<BetType, number> = { straight: 5000, sgp: 1000, parlay: 1000 }

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

const decimalOf = (odds: string) => americanToDecimal(parseAmerican(odds))

export function combineAmericanOdds(picks: SoccerSlipPick[]): string {
  if (picks.length === 0) return ''
  if (picks.length === 1) return picks[0]!.odds
  return decimalToAmerican(picks.reduce((acc, p) => acc * decimalOf(p.odds), 1))
}

function sgpOdds(legs: SoccerSlipPick[]): string {
  const product = legs.reduce((acc, p) => acc * decimalOf(p.odds), 1)
  return decimalToAmerican(1 + (product - 1) * SGP_HAIRCUT)
}

/** Live price moved against the player (demo drift on first place). */
function driftOdds(odds: string): string {
  return decimalToAmerican(1 + (decimalOf(odds) - 1) * 0.92)
}

function winForOdds(odds: string, stake: number): number {
  if (stake <= 0) return 0
  return stake * decimalOf(odds)
}

function parseStake(text: string): number {
  const n = Number.parseFloat(text.replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : 0
}

function formatStakeInput(raw: string): string {
  return raw.replace(/[^0-9.]/g, '')
}

const money = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

type SgpUnit = { key: string; eventLabel: string; legs: SoccerSlipPick[]; odds: string }
type ParlayUnit = { key: string; legs: SoccerSlipPick[]; odds: string; sgp: boolean }

/** Every pick is a straight; 2+ legs on one game form an SGP; 2+ units form a parlay. */
function buildSlip(picks: SoccerSlipPick[]) {
  const groups = new Map<string, SoccerSlipPick[]>()
  for (const p of picks) {
    if (p.outright) continue
    const key = p.eventId ?? p.eventLabel
    groups.set(key, [...(groups.get(key) ?? []), p])
  }
  const sgps: SgpUnit[] = []
  const units: ParlayUnit[] = []
  for (const [key, legs] of groups) {
    if (legs.length > 1) {
      const odds = sgpOdds(legs)
      sgps.push({ key: `sgp:${key}`, eventLabel: legs[0]!.eventLabel, legs, odds })
      units.push({ key, legs, odds, sgp: true })
    } else {
      units.push({ key, legs, odds: legs[0]!.odds, sgp: false })
    }
  }
  const parlayOdds =
    units.length > 1 ? decimalToAmerican(units.reduce((acc, u) => acc * decimalOf(u.odds), 1)) : ''
  return { sgps, units, parlayOdds }
}

type Rejection = { key: string; title: string; reason: string }
type Receipt = { placed: SportsBet[]; rejected: Rejection[]; reuse: SoccerSlipPick[] }

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
  error,
}: {
  value: string
  onChange: (next: string) => void
  toWin: number
  ariaLabel: string
  error?: boolean
}) {
  return (
    <div className="flex w-[112px] shrink-0 flex-col gap-1.5">
      <Input
        type="text"
        inputMode="decimal"
        aria-label={ariaLabel}
        aria-invalid={error || undefined}
        value={value ? `$${value}` : ''}
        placeholder="$0.00"
        onChange={(e) => onChange(formatStakeInput(e.target.value.replace(/^\$/, '')))}
        onFocus={(e) => e.target.select()}
        className={cn(
          FIELD,
          /* text-base (16px) — iOS auto-zooms focused inputs under 16px and sticks zoomed. */
          'h-9 px-3 text-right text-base tabular-nums text-foreground shadow-none focus-visible:ring-1',
          error && 'border-destructive',
        )}
      />
      <p className="px-0.5 text-right text-xs leading-4 text-muted-foreground">
        To Win ${toWin.toFixed(2)}
      </p>
    </div>
  )
}

function OddsTag({ odds, was }: { odds: string; was?: string }) {
  return (
    <span className="flex shrink-0 flex-col items-end pt-2 leading-4">
      <span
        className={cn(
          'text-sm font-semibold tabular-nums',
          was ? 'text-warning' : 'text-foreground',
        )}
      >
        {odds}
      </span>
      {was ? (
        <span className="text-[11px] tabular-nums text-muted-foreground line-through">{was}</span>
      ) : null}
    </span>
  )
}

function RejectNote({ reason }: { reason?: string }) {
  if (!reason) return null
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs leading-4 text-destructive">
      <IconAlertTriangle className="size-3.5 shrink-0" stroke={1.75} />
      {reason}
    </p>
  )
}

/**
 * PropShopX betslip — straights for every pick, auto SGP per game, parlay across units.
 * Mobile: dock opens drawer (no floating Selection bar, no minimize).
 * Desktop: Selection dock when minimized; minimize chevron in header.
 */
export function SoccerBetslip({
  picks,
  onRemove,
  onClear,
  onChange,
  comboAction,
  variant,
  onClosedAfterPlace,
  inline = false,
}: {
  picks: SoccerSlipPick[]
  onRemove: (id: string) => void
  onClear: () => void
  /** Whole-slip writes (odds accept, partial place, reuse). */
  onChange?: (next: SoccerSlipPick[]) => void
  /**
   * V5 only — combo builder lives in the Selections bar: a button in the slip header and
   * the desktop dock (the dock also shows when the slip is empty). Other versions omit it.
   */
  comboAction?: { label: string; onClick: () => void }
  /** V5 only — bold slip: selections timeline, singles tucked away, SGP + combo at the bottom. */
  variant?: 'v5'
  /** V5 only — the player left the receipt (slip closed, or placed from an inline slip). */
  onClosedAfterPlace?: (placed: SportsBet[]) => void
  /** V5 combo builder — the same slip rendered in place (no drawer, no dock, no shell sync). */
  inline?: boolean
}) {
  const router = useRouter()
  const v5 = variant === 'v5'
  /* V5 — bet-type filter in the slip header (Combo · Singles · Same game combo). */
  const [betTypePick, setBetTypePick] = useState<'combo' | 'singles' | 'sgp' | null>(null)
  const [typeMenu, setTypeMenu] = useState(false)
  const onClosedAfterPlaceRef = useRef(onClosedAfterPlace)
  onClosedAfterPlaceRef.current = onClosedAfterPlace
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
    balance,
    spendBalance,
    setCashierOpen,
  } = useShell()
  const [open, setOpen] = useState(false)
  const [portalReady, setPortalReady] = useState(false)
  const [straightStakes, setStraightStakes] = useState<Record<string, string>>({})
  const [sgpStakes, setSgpStakes] = useState<Record<string, string>>({})
  const [sgpOpen, setSgpOpen] = useState<Record<string, boolean>>({})
  const [parlayStake, setParlayStake] = useState(DEFAULT_STAKE)
  /** Odds moved since the player staked — id → previous price. */
  const [drifts, setDrifts] = useState<Record<string, string>>({})
  /** Bet key → reason; rejected bets stay in the slip. */
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  /** V5 — per-leg single stakes live behind "Bet as singles". */
  const [singlesOpen, setSinglesOpen] = useState(false)
  const [crossSellCanPrev, setCrossSellCanPrev] = useState(false)
  const [crossSellCanNext, setCrossSellCanNext] = useState(false)
  const crossSellRef = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef(0)
  const prevPicksRef = useRef<SoccerSlipPick[]>(picks)
  const driftedRef = useRef(new Set<string>())
  /** Partial place rewrites the slip — keep its rejection notes through that one change. */
  const keepErrorsRef = useRef(false)
  const dismissedRef = useRef(false)
  /** Desktop Selection bar only after user minimizes — never on first bet. */
  const [showDesktopDock, setShowDesktopDock] = useState(false)
  const openTickSeenRef = useRef(sportsBetslipOpenTick)
  const addTick = useSlipAddTick()
  const addTickSeenRef = useRef<number | null>(null)

  const writeSlip = useCallback(
    (next: SoccerSlipPick[]) => {
      if (onChange) return onChange(next)
      if (next.length === 0) return onClear()
      const keep = new Set(next.map((p) => p.id))
      picks.filter((p) => !keep.has(p.id)).forEach((p) => onRemove(p.id))
    },
    [onChange, onClear, onRemove, picks],
  )

  const { sgps, units, parlayOdds } = useMemo(() => buildSlip(picks), [picks])
  const hasPicks = picks.length > 0
  const showParlay = units.length > 1
  /* Only the bet types this slip can actually make. */
  const betTypes: { id: 'combo' | 'singles' | 'sgp'; label: string; sub: string }[] = [
    ...(units.length > 1 ? [{ id: 'combo' as const, label: 'Combo', sub: `${units.length} legs · ${parlayOdds}` }] : []),
    /* The combo builder's slip is combos only — no singles there. */
    ...(picks.length > 1 && !inline ? [{ id: 'singles' as const, label: 'Singles', sub: `${picks.length} separate bets` }] : []),
    ...(sgps.length
      ? [{ id: 'sgp' as const, label: 'Same game combo', sub: `${sgps.length} game${sgps.length > 1 ? 's' : ''}` }]
      : []),
  ]
  const betType = betTypes.some((t) => t.id === betTypePick) ? betTypePick! : (betTypes[0]?.id ?? 'combo')
  /* The filter only jumps to (and opens) a section — combo, singles and SGPs can all go on together. */
  const chooseBetType = (id: 'combo' | 'singles' | 'sgp') => {
    setBetTypePick(id)
    setTypeMenu(false)
    if (id === 'singles') setSinglesOpen(true)
    window.requestAnimationFrame(() => {
      const target =
        id === 'singles'
          ? document.querySelector('[data-name="betslip-v5-singles"]')
          : id === 'sgp'
            ? document.querySelector('[data-name="betslip-sgp"]')
            : document.querySelector('[data-name="betslip-v5-legs"]')
      target?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }
  const sgpCount = units.filter((u) => u.sgp).length
  const headerOdds =
    picks.length === 1 ? picks[0]!.odds : showParlay ? parlayOdds : (sgps[0]?.odds ?? '')
  const picksLenRef = useRef(picks.length)
  picksLenRef.current = picks.length

  const closeDrawer = useCallback(() => {
    setOpen(false)
    const placed = receiptRef.current?.placed ?? []
    if (placed.length && onClosedAfterPlaceRef.current) onClosedAfterPlaceRef.current(placed)
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
    if (inline) return
    setSportsBetslipOpen(open)
    return () => setSportsBetslipOpen(false)
  }, [open, setSportsBetslipOpen, inline])

  useEffect(() => {
    if (inline) return
    setSportsBetCount(picks.length)
    return () => setSportsBetCount(0)
  }, [picks.length, setSportsBetCount, inline])

  /* Same market on the same game: the newer pick replaced a leg — say so. */
  useEffect(() => {
    const prev = prevPicksRef.current
    prevPicksRef.current = picks
    const nowIds = new Set(picks.map((p) => p.id))
    const prevIds = new Set(prev.map((p) => p.id))
    for (const next of picks) {
      if (prevIds.has(next.id)) continue
      const old = prev.find(
        (p) => !nowIds.has(p.id) && p.eventLabel === next.eventLabel && p.market === next.market,
      )
      if (old) toast.message(`Replaced ${old.label} with ${next.label}`)
    }
  }, [picks])

  /* Seed stakes when picks land; drop state for legs that left. */
  useEffect(() => {
    const ids = new Set(picks.map((p) => p.id))
    setStraightStakes((prev) => {
      const next: Record<string, string> = {}
      for (const p of picks) next[p.id] = prev[p.id] ?? DEFAULT_STAKE
      return next
    })
    setDrifts((prev) => {
      const kept = Object.entries(prev).filter(([id]) => ids.has(id))
      return kept.length === Object.keys(prev).length ? prev : Object.fromEntries(kept)
    })
    if (keepErrorsRef.current) keepErrorsRef.current = false
    else setErrors({})
  }, [picks])

  const receiptRef = useRef(receipt)
  receiptRef.current = receipt

  /* Inline (combo builder) slip has no close — its receipt's "More picks" opens the cards instead. */

  useEffect(() => {
    if (picks.length > 0) return
    /* Removing the last leg closes the slip — no empty state flash. Receipts stay up. */
    if (prevCountRef.current > 0 && !receiptRef.current) setOpen(false)
    setStraightStakes({})
    setSgpStakes({})
    setParlayStake(DEFAULT_STAKE)
    setShowDesktopDock(false)
    dismissedRef.current = false
  }, [picks.length])

  /*
   * Desktop: the player's first pick opens the drawer. Keyed off real adds in the slip store, so
   * moving between sports pages (remount + hydrate) never pops the slip open.
   */
  useEffect(() => {
    /* Hydration renders the server tick (0) first — read the store's real value on mount. */
    if (addTickSeenRef.current === null) {
      addTickSeenRef.current = getSlipAddTick()
      return
    }
    if (addTick === addTickSeenRef.current) return
    addTickSeenRef.current = addTick
    /* V5: picks build up in the Selections bar — the slip never pops open on its own. */
    if (inline || v5) return
    if (prevCountRef.current > 0 || picks.length === 0) return
    setShowDesktopDock(false)
    setReceipt(null)
    const desktop =
      typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
    if (!dismissedRef.current && desktop) setOpen(true)
  }, [addTick, picks.length])

  useEffect(() => {
    prevCountRef.current = picks.length
  })

  /* Dock Betslip always opens the drawer — empty shows empty state. */
  useEffect(() => {
    if (sportsBetslipOpenTick === openTickSeenRef.current) return
    openTickSeenRef.current = sportsBetslipOpenTick
    if (inline) return
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

  /** Everything the player has put money on, as bets. */
  const staked = useMemo(() => {
    const out: {
      key: string
      type: BetType
      title: string
      odds: string
      stake: number
      legs: SoccerSlipPick[]
      groups?: Map<string, string>
    }[] = []
    for (const p of picks) {
      const stake = parseStake(straightStakes[p.id] ?? '')
      if (stake > 0)
        out.push({ key: p.id, type: 'straight', title: p.label, odds: p.odds, stake, legs: [p] })
    }
    for (const g of sgps) {
      const stake = parseStake(sgpStakes[g.key] ?? '')
      if (stake > 0)
        out.push({
          key: g.key,
          type: 'sgp',
          title: `Same Game Parlay · ${g.legs.length} legs`,
          odds: g.odds,
          stake,
          legs: g.legs,
        })
    }
    const pStake = showParlay ? parseStake(parlayStake) : 0
    if (pStake > 0) {
      const groups = new Map<string, string>()
      for (const u of units) if (u.sgp) for (const l of u.legs) groups.set(l.id, l.eventLabel)
      out.push({
        key: 'parlay',
        type: 'parlay',
        title: `${units.length}-Pick Parlay`,
        odds: parlayOdds,
        stake: pStake,
        legs: units.flatMap((u) => u.legs),
        groups,
      })
    }
    return out
  }, [picks, sgps, units, straightStakes, sgpStakes, parlayStake, showParlay, parlayOdds])

  const placeStake = staked.reduce((sum, b) => sum + b.stake, 0)
  const placeWin = staked.reduce((sum, b) => sum + winForOdds(b.odds, b.stake), 0)
  const driftCount = Object.keys(drifts).length

  const needsDeposit = loggedIn && placeStake > 0 && balance + 1e-9 < placeStake

  const onPlaceBet = () => {
    if (!loggedIn) {
      openAuth('login')
      return
    }
    if (placeStake <= 0 || picks.length === 0) return
    if (needsDeposit) {
      setCashierOpen(true)
      return
    }
    if (!canPlaceSportsBets) {
      openProfileGate(joinJourney === 3 ? 'sports-level' : 'sports-name')
      return
    }

    /* Live legs re-price between stake and place — player confirms the new number. */
    if (driftCount === 0) {
      const liveLeg = staked
        .flatMap((b) => b.legs)
        .find((l) => l.live && !driftedRef.current.has(l.id))
      if (liveLeg) {
        driftedRef.current.add(liveLeg.id)
        setDrifts({ [liveLeg.id]: liveLeg.odds })
        writeSlip(picks.map((p) => (p.id === liveLeg.id ? { ...p, odds: driftOdds(p.odds) } : p)))
        return
      }
    }
    setDrifts({})

    const rejected: Rejection[] = []
    const placed: SportsBet[] = []
    const placedAt = new Date().toISOString()
    for (const b of staked) {
      const max = MAX_RISK[b.type]
      const reason =
        b.stake < MIN_RISK
          ? `Minimum risk is ${money(MIN_RISK)}.`
          : b.stake > max
            ? `Max risk on this bet is ${money(max)}.`
            : null
      if (reason) {
        rejected.push({ key: b.key, title: b.title, reason })
        continue
      }
      const legs: BetLeg[] = b.legs.map((l) => ({
        id: l.id,
        label: l.label,
        market: l.market,
        eventLabel: l.eventLabel,
        odds: l.odds,
        status: 'pending',
        sport: l.sport ?? 'soccer',
        eventHref: l.eventHref,
        when: l.live ? 'Live' : undefined,
        group: b.groups?.get(l.id),
      }))
      placed.push({
        id: newBetId(),
        type: b.type,
        odds: b.odds,
        stake: b.stake,
        toWin: winForOdds(b.odds, b.stake),
        status: 'pending',
        placedAt,
        legs,
      })
    }

    if (placed.length === 0) {
      setErrors(Object.fromEntries(rejected.map((r) => [r.key, r.reason])))
      return
    }

    const spent = placed.reduce((sum, b) => sum + b.stake, 0)
    if (!spendBalance(spent)) {
      setCashierOpen(true)
      return
    }

    addSportsBets(placed)
    const rejectedKeys = new Set(rejected.map((r) => r.key))
    const stillNeeded = new Set(
      staked.filter((b) => rejectedKeys.has(b.key)).flatMap((b) => b.legs.map((l) => l.id)),
    )
    const placedLegIds = new Set(
      staked.filter((b) => !rejectedKeys.has(b.key)).flatMap((b) => b.legs.map((l) => l.id)),
    )
    const reuse = picks.filter((p) => placedLegIds.has(p.id))
    const remaining = picks.filter((p) => !placedLegIds.has(p.id) || stillNeeded.has(p.id))

    setStraightStakes((s) => {
      const next = { ...s }
      for (const b of staked)
        if (b.type === 'straight' && !rejectedKeys.has(b.key)) next[b.key] = DEFAULT_STAKE
      return next
    })
    setSgpStakes((s) => {
      const next = { ...s }
      for (const b of staked) if (b.type === 'sgp' && !rejectedKeys.has(b.key)) delete next[b.key]
      return next
    })
    if (!rejectedKeys.has('parlay')) setParlayStake(DEFAULT_STAKE)

    setReceipt({ placed, rejected, reuse })
    setErrors(Object.fromEntries(rejected.map((r) => [r.key, r.reason])))
    if (remaining.length !== picks.length) {
      keepErrorsRef.current = true
      writeSlip(remaining)
    }
    window.setTimeout(() => fireJoinWelcomeConfetti(), 80)
  }

  const onReuseSelection = () => {
    if (!receipt) return
    const ids = new Set(picks.map((p) => p.id))
    writeSlip([...picks, ...receipt.reuse.filter((p) => !ids.has(p.id))])
    setReceipt(null)
  }

  /* V5 — open the follow-up cards now (closing the slip also opens them). */
  const onOpenStack = () => {
    const placed = receipt?.placed ?? []
    if (!placed.length) return
    if (inline) {
      onClosedAfterPlaceRef.current?.(placed)
      setReceipt(null)
    } else closeDrawer()
  }

  /* V5 — share the ticket: native share sheet where there is one, otherwise copy the text. */
  const onShareReceipt = async () => {
    if (!receipt?.placed.length) return
    const bet = receipt.placed[0]!
    const what =
      bet.legs.length === 1 ? `${bet.legs[0]!.label} (${bet.odds})` : `a ${bet.legs.length}-leg combo at ${bet.odds}`
    const text = `I just backed ${what} — ${money(bet.stake)} to win ${money(bet.toWin)}.`
    const url = `${window.location.origin}/sports/my-bets`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My bet', text, url })
        return
      }
      await navigator.clipboard.writeText(`${text} ${url}`)
      toast.success('Bet copied — paste it anywhere')
    } catch {
      /* share sheet dismissed */
    }
  }

  const onMyBets = () => {
    startNavigating('/sports/my-bets')
    router.push('/sports/my-bets')
    /* V5: heading to My Bets — no follow-up stack on the way out. */
    if (v5) receiptRef.current = null
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
    if (!receipt) return
    const el = crossSellRef.current
    if (!el) return
    syncCrossSellArrows()
    el.addEventListener('scroll', syncCrossSellArrows, { passive: true })
    window.addEventListener('resize', syncCrossSellArrows)
    return () => {
      el.removeEventListener('scroll', syncCrossSellArrows)
      window.removeEventListener('resize', syncCrossSellArrows)
    }
  }, [receipt, syncCrossSellArrows])

  const scrollCrossSell = (dir: -1 | 1) => {
    const el = crossSellRef.current
    if (!el) return
    el.scrollBy({ left: dir * 160, behavior: 'smooth' })
  }

  const backdropOpacity = shown ? Math.max(0, 1 - offset / 320) : 0
  const receiptStake = receipt?.placed.reduce((s, b) => s + b.stake, 0) ?? 0
  const receiptWin = receipt?.placed.reduce((s, b) => s + b.toWin, 0) ?? 0
  const receiptTotal = receipt ? receipt.placed.length + receipt.rejected.length : 0

  const placeLabel = !loggedIn
    ? 'Login to bet'
    : needsDeposit
      ? 'Deposit to place bet'
      : driftCount > 0
        ? 'Accept odds & place'
        : `Place ${money(placeStake)}`

  /* ─── V5 slip body — selections timeline, singles tucked away, SGP + combo at the bottom ─── */
  const singlesTotal = picks.reduce((sum, p) => sum + parseStake(straightStakes[p.id] ?? ''), 0)
  const onlyPick = picks.length === 1 ? picks[0]! : null
  const comboHint =
    units.length >= 2
      ? null
      : picks.length === 1
        ? 'Pick 1 more market to make a combo'
        : 'Add a pick from another game to make a combo'

  const dockSingle = onlyPick && !inline ? onlyPick : null

  const v5Body = (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3 scrollbar-hide">
        <ol data-name="betslip-v5-legs" className="flex flex-col pt-3">
          <AnimatePresence initial={false} mode="popLayout">
            {picks.map((pick, i) => {
              const live = slipLiveMeta(pick)
              const last = i === picks.length - 1
              return (
                <motion.li
                  key={pick.id}
                  layout
                  data-name="betslip-leg"
                  data-betslip-leg={pick.id}
                  data-live={live ? '' : undefined}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.22, ease: LEG_EASE, layout: { duration: 0.22, ease: LEG_EASE } }}
                  className={cn('relative flex gap-3', !last && 'pb-4')}
                >
                  {!last ? <span className="absolute bottom-0 left-[7.5px] top-5 w-px bg-border" aria-hidden /> : null}
                  <span className="relative mt-[3px] flex size-4 shrink-0 items-center justify-center rounded-full bg-primary" aria-hidden>
                    <IconCheck className="size-2.5 text-primary-foreground" stroke={3.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold leading-5 tracking-tight text-foreground">{pick.label}</p>
                    <p className="truncate text-xs leading-4 text-muted-foreground">
                      {live ? (
                        <span className="font-semibold text-destructive">
                          {live.clock} {live.score}
                          {' · '}
                        </span>
                      ) : null}
                      {pick.market} · {pick.eventLabel}
                    </p>
                    <RejectNote reason={errors[pick.id]} />
                  </div>
                  <span className="flex shrink-0 flex-col items-end leading-5">
                    <span
                      className={cn(
                        'text-base font-bold tabular-nums tracking-tight',
                        drifts[pick.id] ? 'text-warning' : 'text-foreground',
                      )}
                    >
                      {pick.odds}
                    </span>
                    <span className="text-[11px] leading-4 tabular-nums text-muted-foreground">
                      {drifts[pick.id] ? (
                        <span className="line-through">{drifts[pick.id]}</span>
                      ) : (
                        `${decimalOf(pick.odds).toFixed(2)}x`
                      )}
                    </span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${pick.label}`}
                    onClick={() => onRemove(pick.id)}
                    className="-mr-1.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <IconX className="size-4" stroke={1.5} />
                  </button>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ol>

        <ComboBoostMeter picks={picks} compact className="mt-4" />
        {comboHint ? (
          <div
            data-name="betslip-v5-combo-hint"
            className="mt-4 flex items-center gap-2.5 rounded-lg bg-secondary px-3 py-2.5"
          >
            <ComboMark className="size-5" />
            <span className="min-w-0 flex-1 text-xs font-semibold leading-4 text-foreground">{comboHint}</span>
            {comboAction ? (
              <button
                type="button"
                onClick={() => {
                  closeDrawer()
                  comboAction.onClick()
                }}
                className="shrink-0 text-xs font-bold text-foreground underline-offset-2 hover:underline"
              >
                {comboAction.label}
              </button>
            ) : null}
          </div>
        ) : null}

        {/* One pick: its stake lives in the dock below. */}
        {onlyPick || inline ? null : (
          <div data-name="betslip-v5-singles" className="mt-4 scroll-mt-3 rounded-lg border border-border">
            <button
              type="button"
              aria-expanded={singlesOpen}
              onClick={() => setSinglesOpen((v) => !v)}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
            >
              <span className="min-w-0 flex-1 text-sm font-bold text-foreground">Singles</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {singlesTotal > 0 ? `${money(singlesTotal)} staked` : `${picks.length} bets`}
              </span>
              <IconChevronDown
                className={cn('size-4 text-muted-foreground transition-transform duration-200', singlesOpen && 'rotate-180')}
                stroke={1.5}
              />
            </button>
            {singlesOpen ? (
              <div className="flex flex-col gap-2 border-t border-border px-3 py-2.5">
                {picks.map((pick) => {
                  const stakeText = straightStakes[pick.id] ?? DEFAULT_STAKE
                  return (
                    <div key={pick.id} className="flex items-start gap-2">
                      <span className="min-w-0 flex-1 pt-2">
                        <span className="block truncate text-xs font-bold text-foreground">{pick.label}</span>
                        <span className="block text-[11px] tabular-nums text-muted-foreground">{pick.odds}</span>
                      </span>
                      <StakeField
                        value={stakeText}
                        onChange={(next) => setStraightStakes((st) => ({ ...st, [pick.id]: next }))}
                        toWin={winForOdds(pick.odds, parseStake(stakeText))}
                        ariaLabel={`Stake for ${pick.label}`}
                        error={!!errors[pick.id]}
                      />
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        )}

        {/* Same Game Parlays — V1 SGP block, bolder (Same game combo filter) */}
        {sgps.map((g) => {
          const stakeText = sgpStakes[g.key] ?? DEFAULT_STAKE
          const expanded = sgpOpen[g.key] ?? true
          const live = slipLiveMeta(g.legs[0]!)
          return (
            <div
              key={g.key}
              data-name="betslip-sgp"
              data-live={live ? '' : undefined}
              className="mt-3 rounded-lg border border-border bg-card px-3 py-2.5"
            >
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setSgpOpen((st) => ({ ...st, [g.key]: !expanded }))}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="flex items-center gap-1 text-[15px] font-bold leading-5 tracking-tight text-foreground">
                    {g.legs.length}-leg SGP
                    <IconChevronDown
                      className={cn('size-3.5 text-muted-foreground transition-transform duration-200', expanded && 'rotate-180')}
                      stroke={2}
                    />
                  </span>
                  <span className="block truncate text-xs leading-4 text-muted-foreground">
                    {live ? <span className="font-semibold text-destructive">{live.clock} </span> : null}
                    {g.eventLabel} · {decimalOf(g.odds).toFixed(2)}x
                  </span>
                </button>
                <OddsTag odds={g.odds} />
                <StakeField
                  value={stakeText}
                  onChange={(next) => setSgpStakes((st) => ({ ...st, [g.key]: next }))}
                  toWin={winForOdds(g.odds, parseStake(stakeText))}
                  ariaLabel={`Stake for ${g.eventLabel} Same Game Parlay`}
                  error={!!errors[g.key]}
                />
              </div>
              <RejectNote reason={errors[g.key]} />
              {expanded ? (
                <LegRail legs={g.legs.map((l) => ({ id: l.id, label: l.label, sub: l.market, odds: l.odds }))} />
              ) : null}
            </div>
          )
        })}
      </div>

      {/* Dock — the stake and the place button, pinned under the legs (same surface as the slip). */}
      <div data-name="betslip-v5-dock" className="shrink-0 border-t border-border">
      {/* Combo — pinned at the bottom (2+ units; an SGP counts as one) */}
      {showParlay ? (
        <div data-name="betslip-parlay" className="px-4 pt-3">
          {/* Compact pinned footer — the slip above keeps the room. */}
          <div className="flex items-center gap-1.5 text-sm leading-5">
            <ComboMark className="size-4" />
            <span className="font-bold tracking-tight text-foreground">{units.length}-leg combo</span>
            <span className="min-w-0 truncate text-muted-foreground">
              · {decimalOf(parlayOdds).toFixed(2)}x · {Math.max(1, Math.round(100 / decimalOf(parlayOdds)))}% chance
              {sgpCount > 0 ? ` · ${sgpCount} SGP` : ''}
            </span>
            <span className="ml-auto font-bold tabular-nums text-foreground">{parlayOdds}</span>
          </div>
          <V5StakeBox
            value={parlayStake}
            onChange={setParlayStake}
            toWin={winForOdds(parlayOdds, parseStake(parlayStake))}
            ariaLabel="Combo stake"
            error={!!errors.parlay}
            chance={100 / decimalOf(parlayOdds)}
            note={`If all ${units.length} legs win`}
          />
          <RejectNote reason={errors.parlay} />
        </div>
      ) : dockSingle ? (
        <div data-name="betslip-single" className="px-4 pt-3">
          <div className="flex items-center gap-1.5 text-sm leading-5">
            <span className="font-bold tracking-tight text-foreground">Single</span>
            <span className="min-w-0 truncate text-muted-foreground">
              · {decimalOf(dockSingle.odds).toFixed(2)}x · {Math.max(1, Math.round(100 / decimalOf(dockSingle.odds)))}% chance
            </span>
            <span className="ml-auto font-bold tabular-nums text-foreground">{dockSingle.odds}</span>
          </div>
          <V5StakeBox
            value={straightStakes[dockSingle.id] ?? DEFAULT_STAKE}
            onChange={(next) => setStraightStakes((st) => ({ ...st, [dockSingle.id]: next }))}
            toWin={winForOdds(dockSingle.odds, parseStake(straightStakes[dockSingle.id] ?? ''))}
            ariaLabel={`Stake for ${dockSingle.label}`}
            error={!!errors[dockSingle.id]}
            chance={100 / decimalOf(dockSingle.odds)}
            note="If it wins"
          />
          <RejectNote reason={errors[dockSingle.id]} />
        </div>
      ) : null}

      {driftCount > 0 ? (
        <div className="mx-4 mt-2 flex shrink-0 items-center gap-2 rounded-lg bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] px-3 py-2 text-xs text-foreground">
          <IconAlertTriangle className="size-4 shrink-0 text-warning" stroke={1.75} />
          <span className="min-w-0 flex-1">
            Odds changed on {driftCount} selection{driftCount > 1 ? 's' : ''}.
          </span>
        </div>
      ) : null}

      <div className="px-4 pb-3 pt-2.5">
        <Button
          type="button"
          disabled={loggedIn && placeStake <= 0}
          onClick={onPlaceBet}
          className={cn(
            'flex h-12 w-full flex-col items-center justify-center gap-0 rounded-xl px-4',
            'border border-border disabled:opacity-45',
            needsDeposit
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : ['bg-success text-success-foreground', 'hover:bg-[color-mix(in_srgb,var(--success)_88%,transparent)]'],
          )}
        >
          <span className="text-base font-bold leading-5 tracking-tight">{placeLabel}</span>
          {loggedIn ? (
            <span className="text-xs font-medium leading-4 opacity-90">
              {needsDeposit
                ? `${money(placeStake)} · Balance ${money(balance)}`
                : `${driftCount > 0 ? `${money(placeStake)} · ` : ''}To win ${money(placeWin)}`}
            </span>
          ) : null}
        </Button>
      </div>
      </div>
    </>
  )

  const v5Empty = (
    <div className="flex min-h-[200px] flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <ComboMark className="mb-1 size-10 opacity-80" />
      <p className="text-base font-semibold text-muted-foreground">No selections yet</p>
      <p className="max-w-[220px] text-xs text-muted-foreground">Tap any price to add it. Every leg you add multiplies the payout.</p>
    </div>
  )

  const panel = (
            <>
              {/* V5 — "Your combo" header: what it is, how far along, help. */}
              {v5 && !receipt ? (
                <div className="flex shrink-0 items-center gap-2 px-4 pb-3">
                  <span data-betslip-fly-target="" className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-muted-foreground">Your combo</span>
                    <span className="block truncate text-xl font-bold leading-7 tracking-tight text-foreground">
                      {picks.length === 0
                        ? 'Pick 2+ markets'
                        : picks.length === 1
                          ? 'Add 1 more market'
                          : `${units.length > 1 ? units.length : picks.length} legs${units.length > 1 && headerOdds ? ` · ${headerOdds}` : ''}`}
                    </span>
                  </span>
                  {betTypes.length > 1 ? (
                    <span className="relative">
                      <button
                        type="button"
                        aria-haspopup="listbox"
                        aria-expanded={typeMenu}
                        aria-label="Bet type"
                        onClick={() => setTypeMenu((v) => !v)}
                        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-border px-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
                      >
                        {betTypes.find((t) => t.id === betType)?.label === 'Same game combo'
                          ? 'SGP'
                          : betTypes.find((t) => t.id === betType)?.label}
                        <IconChevronDown className={cn('size-3.5 transition-transform', typeMenu && 'rotate-180')} stroke={2.25} />
                      </button>
                      {typeMenu ? (
                        <span
                          role="listbox"
                          aria-label="Bet type"
                          className="absolute right-0 top-11 z-20 flex w-60 flex-col rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
                        >
                          {betTypes.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              role="option"
                              aria-selected={betType === t.id}
                              onClick={() => chooseBetType(t.id)}
                              /* Hover is the only fill — the picked type just gets the tick. */
                              className="flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                            >
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-foreground">{t.label}</span>
                                <span className="block truncate text-xs tabular-nums text-muted-foreground">{t.sub}</span>
                              </span>
                              {betType === t.id ? <IconCheck className="size-4 shrink-0 text-foreground" stroke={2.5} /> : null}
                            </button>
                          ))}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                  {hasPicks ? (
                    <button
                      type="button"
                      aria-label="Remove all"
                      onClick={onClear}
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <IconTrash className="size-4" stroke={1.75} />
                    </button>
                  ) : null}
                  {inline ? null : (
                    <button
                      type="button"
                      aria-label="Minimize betslip"
                      onClick={closeDrawer}
                      className="hidden size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:inline-flex"
                    >
                      <IconChevronDown className="size-4" stroke={1.75} />
                    </button>
                  )}
                </div>
              ) : null}
              {/* V5 receipt — one compact row: check · Bet placed · what it was · minimise. */}
              {v5 && receipt ? (
                <div className="flex shrink-0 items-center gap-3 px-4 pb-3">
                  <motion.span
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground"
                  >
                    <IconCheck className="size-5" stroke={3} />
                  </motion.span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-bold leading-6 tracking-tight text-foreground">
                      {receipt.rejected.length > 0
                        ? `${receipt.placed.length} of ${receiptTotal} bets placed`
                        : receipt.placed.length === 1
                          ? 'Bet placed'
                          : 'Bets placed'}
                    </span>
                    <span className="block truncate text-xs tabular-nums text-muted-foreground">
                      {receipt.placed.length} bet{receipt.placed.length === 1 ? '' : 's'} · {money(receiptStake)} to win {money(receiptWin)}
                    </span>
                  </span>
                  {inline ? null : (
                    <button
                      type="button"
                      aria-label="Minimize betslip"
                      onClick={closeDrawer}
                      className="hidden size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:inline-flex"
                    >
                      <IconChevronDown className="size-4" stroke={1.75} />
                    </button>
                  )}
                </div>
              ) : null}
              {/* Header — trash when picks; minimize desktop-only */}
              <div className={cn('flex shrink-0 items-center gap-1 px-4 pb-2', v5 && 'hidden')}>
                {receipt || v5 ? null : (
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
                    v5 && !receipt && 'text-base font-bold',
                    receipt && 'tabular-nums text-muted-foreground',
                  )}
                >
                  {receipt
                    ? `${receipt.placed.length} bet${receipt.placed.length === 1 ? '' : 's'} · ${money(receiptStake)} to win ${money(receiptWin)}`
                    : hasPicks
                      ? `Selection${picks.length > 1 ? 's' : ''}`
                      : 'Betslip'}
                </Typography>
                {hasPicks && !receipt && headerOdds ? (
                  <span className="tabular-nums text-sm font-semibold text-foreground">
                    {headerOdds}
                  </span>
                ) : null}
                {hasPicks && !receipt ? (
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
                  className={cn(
                    'shell-chrome-btn hidden size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 ease-in-out hover:bg-accent hover:text-foreground',
                    !inline && 'lg:inline-flex',
                  )}
                >
                  <IconChevronDown className="size-4" stroke={1.5} />
                </button>
              </div>

              <div className="mx-4 h-px shrink-0 bg-border" />

              {receipt ? (
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-hide">
                  {/* Join-welcome success pattern — primary disc + bold check, concrete copy. (V5: header row instead.) */}
                  <div className={cn('flex flex-col items-center px-6 pb-4 pt-7 text-center', v5 && 'hidden')}>
                    <motion.div
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                    >
                      <span className={cn('relative flex size-14 items-center justify-center rounded-full', v5 ? 'bg-success' : 'bg-primary')}>
                        <motion.span
                          initial={{ scale: 0, rotate: -30 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 16, delay: 0.12 }}
                        >
                          <IconCheck className={cn('size-7', v5 ? 'text-success-foreground' : 'text-primary-foreground')} stroke={3} />
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
                        {receipt.rejected.length > 0
                          ? `${receipt.placed.length} of ${receiptTotal} bets placed`
                          : receipt.placed.length === 1
                            ? 'Bet placed'
                            : 'Bets placed'}
                      </h3>
                    </motion.div>
                  </div>

                  <div className={cn('mx-4 flex flex-col gap-2 pb-4', v5 && 'gap-3 pt-3')}>
                    {receipt.placed.map((bet) => (
                      <ReceiptRow key={bet.id} bet={bet} combo={v5} />
                    ))}
                    {receipt.rejected.map((r) => (
                      <div
                        key={r.key}
                        className="rounded-lg border border-border bg-card px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                            {r.title}
                          </span>
                          <span className="rounded-full bg-[color-mix(in_srgb,var(--destructive)_16%,transparent)] px-2 py-0.5 text-[11px] font-medium text-destructive">
                            Rejected
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {r.reason} Still in your slip.
                        </p>
                      </div>
                    ))}
                  </div>

                  {v5 ? (
                    /* V5 — share-sheet row: Share · My Bets · Reuse (or Back to slip). */
                    <div className="flex items-start justify-center gap-5 px-4 pb-5 pt-1">
                      {[
                        { key: 'share', label: 'Share', icon: <IconShare className="size-5" stroke={1.75} />, onClick: onShareReceipt },
                        {
                          key: 'bets',
                          label: 'My Bets',
                          icon: <ShellIcon name="ticket" tone="token" className="size-5 text-foreground" />,
                          onClick: onMyBets,
                        },
                        { key: 'more', label: 'More picks', icon: <ComboMark className="size-5" />, onClick: onOpenStack },
                        receipt.rejected.length > 0
                          ? { key: 'back', label: 'Back to slip', icon: <IconArrowBackUp className="size-5" stroke={1.75} />, onClick: () => setReceipt(null) }
                          : { key: 'reuse', label: 'Reuse', icon: <IconRepeat className="size-5" stroke={1.75} />, onClick: onReuseSelection },
                      ].map((a) => (
                        <button
                          key={a.key}
                          type="button"
                          onClick={a.onClick}
                          className="group flex w-16 flex-col items-center gap-1.5 text-xs font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground"
                        >
                          <span
                            className={cn(
                              'inline-flex size-12 items-center justify-center rounded-full transition-colors group-focus-visible:ring-2 group-focus-visible:ring-ring',
                              'primary' in a && a.primary
                                ? 'bg-primary text-primary-foreground group-hover:opacity-90'
                                : 'border border-border bg-card text-foreground group-hover:bg-accent',
                            )}
                          >
                            {a.icon}
                          </span>
                          {a.label}
                        </button>
                      ))}
                    </div>
                  ) : (
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
                      onClick={
                        receipt.rejected.length > 0 ? () => setReceipt(null) : onReuseSelection
                      }
                      className="text-xs font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
                    >
                      {receipt.rejected.length > 0 ? 'Back to slip' : 'Reuse selection'}
                    </button>
                  </div>
                  )}

                  {/* V5 keeps the receipt clean — no casino cross-sell. */}
                  {v5 ? null : (
                  <>
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
                  </>
                  )}
                </div>
              ) : hasPicks && v5 ? (
                v5Body
              ) : hasPicks ? (
                <>
                  <div className="min-h-0 flex-1 overflow-y-auto px-3 scrollbar-hide">
                    <SlipHeading>Straight{picks.length > 1 ? 's' : ''}</SlipHeading>
                    <AnimatePresence initial={false} mode="popLayout">
                      {picks.map((pick, i) => {
                        const stakeText = straightStakes[pick.id] ?? DEFAULT_STAKE
                        const toWin = winForOdds(pick.odds, parseStake(stakeText))
                        const live = slipLiveMeta(pick)
                        return (
                          <motion.div
                            key={pick.id}
                            layout
                            data-name="betslip-leg"
                            data-betslip-leg={pick.id}
                            data-live={live ? '' : undefined}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 12, transition: { duration: 0.18 } }}
                            transition={{
                              duration: 0.25,
                              ease: LEG_EASE,
                              layout: { duration: 0.25, ease: LEG_EASE },
                            }}
                            className={cn('py-3', i > 0 && 'border-t border-border')}
                          >
                            <div className="flex items-start gap-2">
                              <button
                                type="button"
                                aria-label={`Remove ${pick.label}`}
                                className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                onClick={() => onRemove(pick.id)}
                              >
                                <IconX className="size-4" stroke={2} />
                              </button>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  {pick.live ? (
                                    <span
                                      className="size-1.5 shrink-0 rounded-full bg-destructive"
                                      aria-label="Live"
                                    />
                                  ) : null}
                                  <span className="truncate text-sm font-semibold leading-5 text-foreground">
                                    {pick.label}
                                  </span>
                                </div>
                                <div className="truncate text-xs leading-4 text-foreground">
                                  {pick.market}
                                </div>
                                {live ? (
                                  <div className="flex min-w-0 items-center gap-1.5 text-xs leading-4">
                                    <span className="shrink-0 font-medium tabular-nums text-destructive">
                                      {live.clock}
                                    </span>
                                    <span className="shrink-0 font-semibold tabular-nums text-foreground">
                                      {live.score}
                                    </span>
                                    <span className="min-w-0 truncate text-muted-foreground">
                                      {pick.eventLabel}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="truncate text-xs leading-4 text-muted-foreground">
                                    {pick.eventLabel}
                                  </div>
                                )}
                              </div>
                              <OddsTag odds={pick.odds} was={drifts[pick.id]} />
                              <StakeField
                                value={stakeText}
                                onChange={(next) =>
                                  setStraightStakes((s) => ({ ...s, [pick.id]: next }))
                                }
                                toWin={toWin}
                                ariaLabel={`Stake for ${pick.label}`}
                                error={!!errors[pick.id]}
                              />
                            </div>
                            <div className="pl-9">
                              <RejectNote reason={errors[pick.id]} />
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>

                    {sgps.length > 0 ? (
                      <SlipHeading>Same Game Parlay{sgps.length > 1 ? 's' : ''}</SlipHeading>
                    ) : null}
                    {sgps.map((g) => {
                      const stakeText = sgpStakes[g.key] ?? DEFAULT_STAKE
                      const expanded = sgpOpen[g.key] ?? false
                      const live = slipLiveMeta(g.legs[0]!)
                      return (
                        <div
                          key={g.key}
                          data-name="betslip-sgp"
                          data-live={live ? '' : undefined}
                          className="mb-2 rounded-lg border border-border bg-card px-3 py-2.5"
                        >
                          <div className="flex items-start gap-2">
                            <button
                              type="button"
                              aria-expanded={expanded}
                              onClick={() => setSgpOpen((s) => ({ ...s, [g.key]: !expanded }))}
                              className="min-w-0 flex-1 text-left"
                            >
                              <span className="flex items-center gap-1 text-sm font-semibold leading-5 text-foreground">
                                {g.legs.length} Leg SGP
                                <IconChevronDown
                                  className={cn(
                                    'size-3.5 text-muted-foreground transition-transform duration-200',
                                    expanded && 'rotate-180',
                                  )}
                                  stroke={2}
                                />
                              </span>
                              {live ? (
                                <span className="flex min-w-0 items-center gap-1.5 text-xs leading-4">
                                  <span className="shrink-0 font-medium tabular-nums text-destructive">
                                    {live.clock}
                                  </span>
                                  <span className="shrink-0 font-semibold tabular-nums text-foreground">
                                    {live.score}
                                  </span>
                                  <span className="min-w-0 truncate text-muted-foreground">
                                    {g.eventLabel}
                                  </span>
                                </span>
                              ) : (
                                <span className="block truncate text-xs leading-4 text-muted-foreground">
                                  {g.eventLabel}
                                </span>
                              )}
                            </button>
                            <OddsTag odds={g.odds} />
                            <StakeField
                              value={stakeText}
                              onChange={(next) => setSgpStakes((s) => ({ ...s, [g.key]: next }))}
                              toWin={winForOdds(g.odds, parseStake(stakeText))}
                              ariaLabel={`Stake for ${g.eventLabel} Same Game Parlay`}
                              error={!!errors[g.key]}
                            />
                          </div>
                          <RejectNote reason={errors[g.key]} />
                          {expanded ? (
                            <LegRail
                              legs={g.legs.map((l) => ({
                                id: l.id,
                                label: l.label,
                                sub: l.market,
                                odds: l.odds,
                              }))}
                            />
                          ) : (
                            <p className="mt-1.5 truncate text-xs text-muted-foreground">
                              {g.legs.map((l) => l.label).join(', ')}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Sticky parlay — 2+ units (an SGP counts as one) */}
                  {showParlay ? (
                    <div
                      data-name="betslip-parlay"
                      className="shrink-0 border-t border-border bg-secondary/60 px-4 py-3"
                    >
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <Typography as="div" shape="small" weight="semibold">
                            {units.length}-Pick Parlay
                          </Typography>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="truncate">
                              {sgpCount > 0
                                ? `Includes ${sgpCount} SGP${sgpCount > 1 ? 's' : ''}`
                                : `${units.length} legs`}
                            </span>
                            <span className="tabular-nums font-semibold text-foreground">
                              {parlayOdds}
                            </span>
                          </div>
                        </div>
                        <StakeField
                          value={parlayStake}
                          onChange={setParlayStake}
                          toWin={winForOdds(parlayOdds, parseStake(parlayStake))}
                          ariaLabel="Parlay stake"
                          error={!!errors.parlay}
                        />
                      </div>
                      <RejectNote reason={errors.parlay} />
                    </div>
                  ) : null}

                  {driftCount > 0 ? (
                    <div className="mx-4 mt-2 flex shrink-0 items-center gap-2 rounded-lg bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] px-3 py-2 text-xs text-foreground">
                      <IconAlertTriangle className="size-4 shrink-0 text-warning" stroke={1.75} />
                      <span className="min-w-0 flex-1">
                        Odds changed on {driftCount} selection{driftCount > 1 ? 's' : ''}.
                      </span>
                    </div>
                  ) : null}

                  <div className="shrink-0 px-4 pb-1 pt-2">
                    <Button
                      type="button"
                      disabled={loggedIn && placeStake <= 0}
                      onClick={onPlaceBet}
                      className={cn(
                        'flex h-auto w-full flex-col items-center justify-center gap-0.5 rounded-lg px-4 py-2.5',
                        'border border-border disabled:opacity-45',
                        needsDeposit
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : [
                              'bg-success text-success-foreground',
                              'hover:bg-[color-mix(in_srgb,var(--success)_88%,transparent)]',
                            ],
                      )}
                    >
                      <span className="text-sm font-semibold leading-5">{placeLabel}</span>
                      {loggedIn ? (
                        <span className="text-xs font-normal leading-4 opacity-90">
                          {needsDeposit
                            ? `${money(placeStake)} · Balance ${money(balance)}`
                            : `${driftCount > 0 ? `${money(placeStake)} · ` : ''}To Win ${money(placeWin)}`}
                        </span>
                      ) : null}
                    </Button>
                  </div>
                </>
              ) : v5 ? (
                v5Empty
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
            </>
  )

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
                'max-h-[min(85dvh,680px)] overflow-hidden rounded-t-[10px]',
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

              {panel}
            </aside>
          </div>,
          document.body,
        )
      : null

  if (inline) {
    return (
      <aside
        aria-label="Betslip"
        data-name="soccer-betslip-inline"
        className={cn(
          'dark flex max-h-[calc(100dvh-96px)] w-full flex-col overflow-hidden rounded-[10px] pt-3',
          'border border-border bg-popover text-popover-foreground',
          'shadow-[0_8px_32px_rgba(0,0,0,0.35)]',
        )}
      >
        {panel}
      </aside>
    )
  }

  return (
    <>
      {/* V5 — Selections bar with the combo builder built in; empty slip shows the builder entry. */}
      {comboAction && !open && !mounted ? (
        <div
          data-name="soccer-betslip-dock"
          data-shell-betslip=""
          className="fixed inset-x-0 z-[120] mx-auto hidden w-full max-w-[375px] px-3 lg:bottom-6 lg:flex"
        >
          <span
            className={cn(
              'dark flex w-full items-center gap-1 rounded-[10px] border border-border bg-popover p-1.5',
              'shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.06)]',
            )}
          >
            {hasPicks ? (
              <button
                type="button"
                onClick={() => {
                  dismissedRef.current = false
                  setShowDesktopDock(false)
                  setOpen(true)
                }}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-accent"
              >
                <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {picks.length}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-popover-foreground">
                  Selection{picks.length > 1 ? 's' : ''}
                </span>
                <span className="tabular-nums text-sm font-bold text-popover-foreground">{headerOdds}</span>
                <IconChevronUp aria-hidden className="size-4 shrink-0 text-muted-foreground" stroke={1.5} />
              </button>
            ) : null}
            <button
              type="button"
              onClick={comboAction.onClick}
              className={cn(
                'v5-combo-sheen flex shrink-0 items-center gap-2 rounded-lg text-sm font-semibold text-popover-foreground transition-colors',
                hasPicks ? 'h-9 bg-secondary px-3 hover:bg-accent' : 'h-9 flex-1 px-2.5 hover:bg-accent',
              )}
            >
              <ComboMark className="size-5" />
              {comboAction.label}
              {hasPicks ? null : (
                <>
                  <span className="ml-auto text-xs font-normal text-muted-foreground">Pick 2 markets</span>
                  <IconChevronRight aria-hidden className="size-4 shrink-0 text-muted-foreground" stroke={1.5} />
                </>
              )}
            </button>
          </span>
        </div>
      ) : null}
      {/* Desktop only — whenever the slip holds picks and the drawer is closed. Mobile uses shell dock. */}
      {!comboAction && hasPicks && !open && !mounted ? (
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
            <Typography
              as="span"
              shape="small"
              weight="semibold"
              className="flex-1 text-left text-popover-foreground"
            >
              Selection{picks.length > 1 ? 's' : ''}
            </Typography>
            <span className="tabular-nums text-sm font-semibold text-popover-foreground">
              {headerOdds}
            </span>
            <IconChevronUp
              aria-hidden
              className="-mr-1 size-4 shrink-0 text-muted-foreground"
              stroke={1.5}
            />
          </span>
        </button>
      ) : null}
      {sheet}
    </>
  )
}

function SlipHeading({ children }: { children: ReactNode }) {
  return (
    <Typography
      as="div"
      shape="xs"
      weight="medium"
      className="px-1 pb-1 pt-2 uppercase tracking-wide text-muted-foreground"
    >
      {children}
    </Typography>
  )
}

/** Combo legs on a quiet rail — node per leg, line between. */
/** V5 — stake field (label left, amount right), quick stakes, chance + payout rows. */
function V5StakeBox({
  value,
  onChange,
  toWin,
  ariaLabel,
  error,
  chance,
  note,
}: {
  value: string
  onChange: (next: string) => void
  toWin: number
  ariaLabel: string
  error?: boolean
  /** Implied chance of the bet, 0–100. */
  chance: number
  /** Under "To win" — "If all 4 legs win". */
  note?: string
}) {
  const [focused, setFocused] = useState(false)
  const hasStake = parseStake(value) > 0
  /* A filled field (a touch lighter than the slip, input-strength edge) with a blinking caret
   * where the amount goes, so it reads as "type here". Quick amounts left · to-win right. */
  const idle = !hasStake && !focused
  return (
    <div className="mt-2">
      <label
        className={cn(
          'flex h-12 cursor-text items-center gap-1 rounded-xl border bg-[color-mix(in_srgb,var(--foreground)_5%,var(--popover))] px-3.5 transition-colors focus-within:border-foreground',
          error ? 'border-destructive' : 'border-input',
          /* Empty + not focused: the edge sweeps, the caret blinks and the hint shimmers. */
          !error && idle && 'v5-stake-attn',
        )}
      >
        <span className={cn('text-lg font-bold', idle ? 'text-muted-foreground' : 'text-foreground')} aria-hidden>
          $
        </span>
        <span className="relative flex min-w-0 flex-1 items-center">
          {idle ? <span aria-hidden className="v5-caret pointer-events-none absolute left-0" /> : null}
          <input
            type="text"
            inputMode="decimal"
            aria-label={ariaLabel}
            aria-invalid={error || undefined}
            value={value && value !== DEFAULT_STAKE ? value : ''}
            placeholder="0.00"
            onChange={(e) => onChange(formatStakeInput(e.target.value.replace(/^\$/, '')))}
            onFocus={(e) => {
              setFocused(true)
              e.target.select()
            }}
            onBlur={() => setFocused(false)}
            className="min-w-0 flex-1 bg-transparent pl-1 text-left text-lg font-bold tabular-nums text-foreground outline-none placeholder:text-muted-foreground"
          />
        </span>
        <span className={cn('shrink-0 text-sm', hasStake ? 'text-muted-foreground' : 'v5-pay-shimmer font-semibold')}>
          {hasStake ? 'Stake' : 'Enter stake'}
        </span>
      </label>
      <div className="mt-2 flex items-center gap-1.5">
        {['5.00', '10.00', '25.00', '50.00'].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              'inline-flex h-7 items-center justify-center rounded-full border px-2.5 text-xs font-semibold tabular-nums transition-colors',
              value === v
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-popover text-foreground hover:bg-accent',
            )}
          >
            ${Number(v)}
          </button>
        ))}
        <span className="ml-auto flex items-baseline gap-1.5" title={note ? `${note} · ${Math.round(chance)}% chance` : undefined}>
          <span className="text-xs text-muted-foreground">To win</span>
          <span className="text-lg font-bold leading-none tabular-nums text-foreground">
            ${toWin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </span>
      </div>
    </div>
  )
}

export function LegRail({
  legs,
}: {
  legs: { id: string; label: string; sub?: string; odds?: string; node?: ReactNode }[]
}) {
  return (
    <ol className="mt-2 flex flex-col">
      {legs.map((leg, i) => (
        <li key={leg.id} className="relative flex gap-2.5 pb-2.5 last:pb-0">
          {i < legs.length - 1 ? (
            <span className="absolute bottom-0 left-[5px] top-3.5 w-px bg-border" aria-hidden />
          ) : null}
          <span className="relative mt-1 flex size-[11px] shrink-0 items-center justify-center">
            {leg.node ?? (
              <span className="size-[9px] rounded-full border-2 border-muted-foreground bg-card" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium leading-4 text-foreground">
              {leg.label}
            </span>
            {leg.sub ? (
              <span className="block truncate text-[11px] leading-4 text-muted-foreground">
                {leg.sub}
              </span>
            ) : null}
          </span>
          {leg.odds ? (
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{leg.odds}</span>
          ) : null}
        </li>
      ))}
    </ol>
  )
}

function comboNote(bet: SportsBet): string {
  const games = new Set(bet.legs.map((l) => l.eventLabel)).size
  const sgps = new Set(bet.legs.map((l) => l.group).filter(Boolean)).size
  return `${games} games${sgps ? ` · includes ${sgps} SGP` : ''}`
}

/** V5 receipt — a ticket: bet + legs (same timeline as the slip), perforation, stake / to win, ticket no. */
function TicketReceipt({ bet }: { bet: SportsBet }) {
  const single = bet.legs.length === 1 ? bet.legs[0]! : null
  const sgp = bet.type === 'sgp'
  const placed = new Date(bet.placedAt)
  const when = Number.isNaN(placed.getTime())
    ? ''
    : `${placed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · ${placed.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
  return (
    <div data-name="betslip-v5-ticket" className="text-left drop-shadow-[0_6px_16px_rgba(0,0,0,0.18)]">
      {/* Top stub — bottom corners notched out (mask), so the edge line never crosses the cut. */}
      <div className="relative rounded-t-2xl border border-b-0 border-border bg-card px-4 pb-4 pt-3.5" style={notch('bottom')}>
        <div className="flex items-center gap-2">
          {single ? null : <ComboMark className="size-4" />}
          <span className="min-w-0 flex-1 truncate text-[15px] font-bold tracking-tight text-foreground">
            {single ? single.label : `${bet.legs.length}-leg ${sgp ? 'same game combo' : 'combo'}`}
          </span>
          <span className="shrink-0 text-[15px] font-bold tabular-nums text-foreground">{bet.odds}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {single
            ? `${single.market} · ${single.eventLabel}`
            : `${decimalOf(bet.odds).toFixed(2)}x · ${sgp ? bet.legs[0]!.eventLabel : comboNote(bet)}`}
        </p>
        {single ? null : (
          <ol className="mt-3 flex flex-col">
            {bet.legs.map((leg, i) => {
              const last = i === bet.legs.length - 1
              return (
                <li key={leg.id} className={cn('relative flex gap-3', !last && 'pb-3')}>
                  {!last ? <span className="absolute bottom-0 left-[7.5px] top-5 w-px bg-border" aria-hidden /> : null}
                  <span className="relative mt-[2px] flex size-4 shrink-0 items-center justify-center rounded-full bg-primary" aria-hidden>
                    <IconCheck className="size-2.5 text-primary-foreground" stroke={3.5} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold leading-5 text-foreground">{leg.label}</span>
                    <span className="block truncate text-xs leading-4 text-muted-foreground">
                      {leg.market} · {leg.eventLabel}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs leading-5 tabular-nums text-muted-foreground">{decimalOf(leg.odds).toFixed(2)}x</span>
                </li>
              )
            })}
          </ol>
        )}
        {/* Tear line */}
        <span className="absolute inset-x-4 bottom-0 border-t border-dashed border-border" aria-hidden />
      </div>

      {/* Bottom stub — top corners notched out. */}
      <div className="rounded-b-2xl border border-t-0 border-border bg-card" style={notch('top')}>
      <div className="flex items-end justify-between gap-3 px-4 pb-3 pt-4">
        <span>
          <span className="block text-[11px] font-medium text-muted-foreground">Stake</span>
          <span className="block text-base font-bold tabular-nums text-foreground">{money(bet.stake)}</span>
        </span>
        <span className="text-right">
          <span className="block text-[11px] font-medium text-muted-foreground">To win</span>
          <span className="block text-2xl font-bold leading-7 tabular-nums tracking-tight text-success">{money(bet.toWin)}</span>
        </span>
      </div>
      <div className="flex items-center justify-between px-4 pb-3 text-[11px] tabular-nums text-muted-foreground">
        <span>Ticket #{bet.id}</span>
        <span>{when}</span>
      </div>
      </div>
    </div>
  )
}

/** Ticket notch — two 10px bites out of the left and right edge (top or bottom corner of a stub). */
function notch(edge: 'top' | 'bottom'): React.CSSProperties {
  const y = edge === 'top' ? '0' : '100%'
  const bite = (x: string) => `radial-gradient(circle 10px at ${x} ${y}, transparent 9.5px, black 10px)`
  const image = `${bite('0')}, ${bite('100%')}`
  return {
    maskImage: image,
    WebkitMaskImage: image,
    maskSize: '51% 100%',
    WebkitMaskSize: '51% 100%',
    maskPosition: 'left, right',
    WebkitMaskPosition: 'left, right',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
  }
}

function ReceiptRow({ bet, combo }: { bet: SportsBet; combo?: boolean }) {
  if (combo) return <TicketReceipt bet={bet} />
  const single = bet.legs.length === 1 ? bet.legs[0]! : null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 text-left">
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
          {single
            ? single.label
            : combo
              ? `${bet.legs.length}-leg ${bet.type === 'sgp' ? 'same game combo' : 'combo'}`
              : `${bet.legs.length}-Leg ${bet.type === 'sgp' ? 'SGP' : 'Parlay'}`}
        </span>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
          {bet.odds}
        </span>
      </div>
      <p className="truncate text-xs text-muted-foreground">
        {single
          ? `${single.market} · ${single.eventLabel}`
          : bet.type === 'sgp'
            ? bet.legs[0]!.eventLabel
            : comboNote(bet)}
      </p>
      {single ? null : (
        <LegRail legs={bet.legs.map((l) => ({ id: l.id, label: l.label, sub: l.market }))} />
      )}
      <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-xs">
        <span className="tabular-nums text-muted-foreground">
          {money(bet.stake)} to win {money(bet.toWin)}
        </span>
        <span className="tabular-nums text-muted-foreground">#{bet.id}</span>
      </div>
    </div>
  )
}
