'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import NumberFlow from '@number-flow/react'
import { AnimatePresence, motion } from 'framer-motion'
import { IconChevronUp, IconStack2, IconTrash, IconX } from '@tabler/icons-react'
import type { SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import { useShell } from '@/components/site/shell-context'
import { fireConfetti } from '@/lib/confetti'
import { setSoccerSlip, useSoccerSlip } from '@/lib/lumen/soccer-slip-store'
import { addSportsBets, newBetId, type BetLeg, type SportsBet } from '@/lib/lumen/sports-bets-store'
import {
  comboDecimal,
  comboType,
  decimalOf,
  decimalToAmerican,
  fmtX,
  nextLegDecimal,
  openComboBuilder,
} from '@/lib/lumen/v5-combos'
import { cn } from '@/lib/utils'
import { ComboGlow, fmtUsd } from './combo-ui'

const STAKE_CHIPS = [5, 10, 25, 50]
const MIN_STAKE = 1
const MAX_STAKE = { straight: 5000, sgp: 1000, parlay: 1000 } as const
const LEG_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

type Placed = { legs: number; stake: number; pays: number }

/** Stake, payout and place — shared by the rail slip, the mobile sheet and the builder. */
function useCombo() {
  const picks = useSoccerSlip()
  const {
    loggedIn,
    openAuth,
    balance,
    spendBalance,
    setCashierOpen,
    canPlaceSportsBets,
    openProfileGate,
    joinJourney,
  } = useShell()
  const [stake, setStake] = useState(10)
  const [placed, setPlaced] = useState<Placed | null>(null)
  const [error, setError] = useState<string | null>(null)

  const decimal = comboDecimal(picks)
  const type = comboType(picks)
  const pays = stake * decimal
  const combo = picks.length >= 2

  useEffect(() => {
    if (picks.length > 0) setPlaced(null)
    setError(null)
  }, [picks.length])

  const place = (button?: HTMLElement | null) => {
    if (!loggedIn) {
      openAuth('login')
      return
    }
    if (picks.length === 0) return
    if (stake < MIN_STAKE) {
      setError(`Minimum is ${fmtUsd(MIN_STAKE)}.`)
      return
    }
    if (stake > MAX_STAKE[type]) {
      setError(`Max on this ${combo ? 'combo' : 'bet'} is ${fmtUsd(MAX_STAKE[type], 0)}.`)
      return
    }
    if (balance + 1e-9 < stake) {
      setCashierOpen(true)
      return
    }
    if (!canPlaceSportsBets) {
      openProfileGate(joinJourney === 3 ? 'sports-level' : 'sports-name')
      return
    }
    if (!spendBalance(stake)) {
      setCashierOpen(true)
      return
    }
    const events = new Map<string, number>()
    for (const p of picks) {
      const key = p.eventId ?? p.eventLabel
      events.set(key, (events.get(key) ?? 0) + 1)
    }
    const legs: BetLeg[] = picks.map((p) => {
      const key = p.eventId ?? p.eventLabel
      return {
        id: p.id,
        label: p.label,
        market: p.market,
        eventLabel: p.eventLabel,
        odds: p.odds,
        status: 'pending',
        sport: p.sport ?? 'soccer',
        eventHref: p.eventHref,
        when: p.live ? 'Live' : undefined,
        group: type === 'parlay' && (events.get(key) ?? 0) > 1 ? key : undefined,
      }
    })
    const bet: SportsBet = {
      id: newBetId(),
      type,
      odds: picks.length === 1 ? picks[0]!.odds : decimalToAmerican(decimal),
      stake,
      toWin: pays,
      status: 'pending',
      placedAt: new Date().toISOString(),
      legs,
    }
    addSportsBets([bet])
    setPlaced({ legs: picks.length, stake, pays })
    setSoccerSlip([])
    const rect = button?.getBoundingClientRect()
    fireConfetti({
      particleCount: combo ? 140 : 70,
      spread: 80,
      startVelocity: 38,
      origin: rect
        ? { x: (rect.left + rect.width / 2) / window.innerWidth, y: rect.top / window.innerHeight }
        : { x: 0.5, y: 0.7 },
    })
  }

  return { picks, stake, setStake, decimal, type, pays, combo, place, placed, setPlaced, error, loggedIn }
}

function groupLegs(picks: SoccerSlipPick[]) {
  const groups: { key: string; eventLabel: string; href?: string; legs: SoccerSlipPick[] }[] = []
  for (const p of picks) {
    const key = p.eventId ?? p.eventLabel
    const g = groups.find((x) => x.key === key)
    if (g) g.legs.push(p)
    else groups.push({ key, eventLabel: p.eventLabel, href: p.eventHref, legs: [p] })
  }
  return groups
}

/**
 * The V5 slip. Empty → invites a combo. One pick → single. Two or more → it lights up
 * into a combo: glow border, payout counter, legs stacking in from the right.
 */
export function ComboSlip({
  variant = 'rail',
  onClose,
  className,
}: {
  variant?: 'rail' | 'sheet' | 'builder'
  onClose?: () => void
  className?: string
}) {
  const { picks, stake, setStake, decimal, pays, combo, place, placed, setPlaced, error, loggedIn } =
    useCombo()
  const groups = useMemo(() => groupLegs(picks), [picks])
  const next = nextLegDecimal(picks)
  const [stakeText, setStakeText] = useState(String(stake))
  useEffect(() => setStakeText(String(stake)), [stake])
  const placeRef = useRef<HTMLButtonElement>(null)

  const body = (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-4">
        <div className="min-w-0">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={combo ? 'combo' : picks.length === 1 ? 'single' : 'empty'}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.25, ease: LEG_EASE }}
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              {combo ? `${picks.length}-leg combo` : picks.length === 1 ? 'Single pick' : 'Your combo'}
            </motion.p>
          </AnimatePresence>
          {picks.length > 0 ? (
            <p className="mt-1 flex items-baseline gap-1.5 text-xl font-bold tracking-tight text-foreground">
              <span className="tabular-nums">{fmtUsd(stake)}</span>
              <span className="text-base font-semibold text-muted-foreground">pays</span>
              <span className="inline-flex items-baseline tabular-nums text-success">
                $
                <NumberFlow
                  value={Math.round(pays * 100) / 100}
                  format={{ minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }}
                  transformTiming={{ duration: 600, easing: 'ease-out' }}
                />
              </span>
            </p>
          ) : (
            <p className="mt-1 text-base font-semibold text-foreground">Pick 2+ markets</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {picks.length > 0 ? (
            <motion.span
              key={fmtX(decimal)}
              initial={{ scale: 1.25 }}
              animate={{ scale: 1 }}
              className={cn(
                'inline-flex h-7 items-center rounded-full px-2.5 text-xs font-bold tabular-nums',
                combo ? 'bg-foreground text-background' : 'bg-secondary text-foreground',
              )}
            >
              {fmtX(decimal)}
            </motion.span>
          ) : null}
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <IconX className="size-4" stroke={2} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Placed receipt */}
      {placed && picks.length === 0 ? (
        <div className="mx-4 mb-4 rounded-xl bg-[var(--opacity-success-10)] p-4 text-center">
          <p className="text-sm font-semibold text-foreground">
            {placed.legs > 1 ? `${placed.legs}-leg combo placed` : 'Bet placed'}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-success">{fmtUsd(placed.pays)}</p>
          <p className="text-xs text-muted-foreground">if it lands · {fmtUsd(placed.stake)} staked</p>
          <div className="mt-3 flex justify-center gap-2">
            <Link
              href="/sports/my-bets"
              className="inline-flex h-9 items-center rounded-full bg-secondary px-4 text-sm font-semibold text-foreground hover:bg-accent"
            >
              My Bets
            </Link>
            <button
              type="button"
              onClick={() => {
                setPlaced(null)
                openComboBuilder()
              }}
              className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-semibold text-background"
            >
              Build another
            </button>
          </div>
        </div>
      ) : null}

      {/* Empty */}
      {picks.length === 0 && !placed ? (
        <div className="mx-4 mb-4 flex flex-col items-center rounded-xl border border-dashed border-border px-4 py-6 text-center">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-secondary text-foreground">
            <IconStack2 className="size-5" stroke={1.75} aria-hidden />
          </span>
          <p className="mt-3 text-sm font-semibold text-foreground">No selections yet</p>
          <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
            Tap a % to add a pick. Stack two or more and they become a combo.
          </p>
          {variant !== 'builder' ? (
            <button
              type="button"
              onClick={() => openComboBuilder()}
              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-semibold text-background"
            >
              <IconStack2 className="size-4" stroke={2} aria-hidden />
              Open combo builder
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Legs */}
      {picks.length > 0 ? (
        <div className={cn('px-4', variant === 'rail' && 'max-h-[30vh] overflow-y-auto')}>
          <ul className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {groups.map((g) => (
                <motion.li
                  key={g.key}
                  layout
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -40, opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: LEG_EASE }}
                  className="rounded-xl bg-secondary p-3"
                >
                  <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {g.eventLabel}
                  </p>
                  <ul className="mt-1.5 flex flex-col gap-1.5 border-l-2 border-border pl-3">
                    <AnimatePresence initial={false}>
                      {g.legs.map((leg) => (
                        <motion.li
                          key={leg.id}
                          layout
                          initial={{ x: 24, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -24, opacity: 0 }}
                          transition={{ duration: 0.25, ease: LEG_EASE }}
                          className="flex items-center gap-2"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-foreground">
                              {leg.label}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">{leg.market}</span>
                          </span>
                          <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                            {fmtX(decimalOf(leg.odds))}
                          </span>
                          <button
                            type="button"
                            aria-label={`Remove ${leg.label}`}
                            onClick={() => setSoccerSlip((prev) => prev.filter((p) => p.id !== leg.id))}
                            className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                          >
                            <IconX className="size-3.5" stroke={2} />
                          </button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            {picks.length === 1 ? (
              <>Add 1 more pick to make it a combo.</>
            ) : (
              <>
                One more leg →{' '}
                <span className="font-semibold text-foreground">{fmtX(next)}</span> ·{' '}
                <span className="font-semibold text-success">{fmtUsd(stake * next)}</span>
              </>
            )}
          </p>
        </div>
      ) : null}

      {/* Stake + place */}
      {picks.length > 0 ? (
        <div className="mt-4 border-t border-border px-4 pb-4 pt-3">
          <div className="flex items-center gap-2">
            <label className="flex h-11 min-w-0 flex-1 items-center rounded-xl border border-input bg-popover px-3">
              <span className="text-sm text-muted-foreground">Cost</span>
              <span className="ml-auto text-base font-semibold text-foreground">$</span>
              <input
                inputMode="decimal"
                value={stakeText}
                onChange={(e) => {
                  const t = e.target.value.replace(/[^0-9.]/g, '')
                  setStakeText(t)
                  const n = Number.parseFloat(t)
                  setStake(Number.isFinite(n) ? n : 0)
                }}
                aria-label="Stake"
                className="w-20 bg-transparent text-right text-base font-semibold tabular-nums text-foreground outline-none"
              />
            </label>
          </div>
          <div className="mt-2 flex gap-1.5">
            {STAKE_CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setStake((s) => Math.round((s + c) * 100) / 100)}
                className="h-8 flex-1 rounded-full border border-border text-xs font-semibold text-foreground hover:bg-accent"
              >
                +${c}
              </button>
            ))}
          </div>
          {error ? <p className="mt-2 text-xs font-medium text-destructive">{error}</p> : null}
          <motion.button
            ref={placeRef}
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => place(placeRef.current)}
            className="mt-3 flex h-12 w-full items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {!loggedIn
              ? 'Log in to place'
              : combo
                ? `Place combo · ${fmtUsd(stake)}`
                : `Place bet · ${fmtUsd(stake)}`}
          </motion.button>
          <button
            type="button"
            onClick={() => setSoccerSlip([])}
            className="mx-auto mt-2 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <IconTrash className="size-3.5" stroke={1.75} aria-hidden />
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  )

  if (variant === 'sheet') return <div className={className}>{body}</div>
  return (
    <ComboGlow active={combo} className={cn('shadow-sm', className)}>
      {body}
    </ComboGlow>
  )
}

/**
 * Mobile: a glowing pill above the dock (legs · multiplier · pays) that opens the slip
 * as a bottom sheet. Also answers the dock's Betslip button.
 */
export function ComboDock({
  zClass = 'z-[60]',
  bottomClass = 'bottom-[96px]',
  syncShell = true,
}: {
  zClass?: string
  /** Above the shell dock by default; the builder has no dock under it. */
  bottomClass?: string
  /** Badge + dock Betslip button — only the page-level dock owns these. */
  syncShell?: boolean
}) {
  const picks = useSoccerSlip()
  const { setSportsBetCount, sportsBetslipOpenTick, setSportsBetslipOpen } = useShell()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const tickSeen = useRef(sportsBetslipOpenTick)
  const decimal = comboDecimal(picks)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (!syncShell) return
    setSportsBetCount(picks.length)
    return () => setSportsBetCount(0)
  }, [picks.length, setSportsBetCount, syncShell])
  useEffect(() => {
    if (!syncShell || sportsBetslipOpenTick === tickSeen.current) return
    tickSeen.current = sportsBetslipOpenTick
    setOpen(true)
  }, [sportsBetslipOpenTick, syncShell])
  useEffect(() => {
    if (!syncShell) return
    setSportsBetslipOpen(open)
    return () => setSportsBetslipOpen(false)
  }, [open, setSportsBetslipOpen, syncShell])

  if (!mounted) return null
  return createPortal(
    <div data-trade-sheet-root="" className={cn('pointer-events-none lg:hidden', zClass)}>
      <AnimatePresence>
        {picks.length > 0 && !open ? (
          <motion.div
            key="pill"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className={cn('pointer-events-auto absolute inset-x-4', bottomClass)}
          >
            <ComboGlow rounded="rounded-full" active={picks.length >= 2} className="shadow-lg">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex h-14 w-full items-center gap-3 rounded-full px-5 text-left"
              >
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
                  {picks.length}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {picks.length >= 2 ? `${picks.length}-leg combo` : 'Single'}
                  </span>
                  <span className="block text-sm font-bold text-foreground">
                    $10 pays <span className="text-success">{fmtUsd(10 * decimal)}</span>
                  </span>
                </span>
                <span className="text-sm font-bold tabular-nums text-foreground">{fmtX(decimal)}</span>
                <IconChevronUp className="size-4 text-muted-foreground" stroke={2} aria-hidden />
              </button>
            </ComboGlow>
          </motion.div>
        ) : null}
        {open ? (
          <motion.button
            key="backdrop"
            type="button"
            aria-label="Close combo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="pointer-events-auto absolute inset-0 bg-background"
          />
        ) : null}
        {open ? (
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="pointer-events-auto absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto rounded-t-3xl border-t border-border bg-card pb-[max(env(safe-area-inset-bottom),12px)]"
          >
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border" aria-hidden />
            <ComboSlip variant="sheet" onClose={() => setOpen(false)} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>,
    document.body,
  )
}
