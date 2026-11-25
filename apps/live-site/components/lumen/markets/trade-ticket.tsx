'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconCheck, IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { ShellIcon } from '@/components/site/shell-icons'
import { useShell } from '@/components/site/shell-context'
import { useDragToClose } from '@/components/site/use-drag-to-close'
import {
  MARKET_CARD,
  PriceButton,
  TeamMark,
  fmtCents,
  fmtChance,
  fmtMoney,
  fmtPct,
  fmtShares,
} from '@/components/lumen/markets/market-ui'
import { LiveClock } from '@/components/lumen/sports-home-page'
import { addSportsBets, newBetId, type SportsBet } from '@/lib/lumen/sports-bets-store'
import { priceToAmerican, type MarketOutcome, type SportsMarket } from '@/lib/lumen/sports-markets'
import { fireJoinWelcomeConfetti } from '@/lib/lumen/vip-celebrate'
import { cn } from '@/lib/utils'

const QUICK_ADD = [10, 25, 100]
const MIN_BUY = 1

type Receipt = { outcome: MarketOutcome; shares: number; cost: number }

export function TradeTicket({
  market,
  outcomeId,
  onOutcome,
  onClose,
  className,
}: {
  market: SportsMarket
  outcomeId: string
  onOutcome: (id: string) => void
  onClose?: () => void
  className?: string
}) {
  const router = useRouter()
  const {
    loggedIn,
    openAuth,
    balance,
    spendBalance,
    setCashierOpen,
    canPlaceSportsBets,
    joinJourney,
    openProfileGate,
    startNavigating,
  } = useShell()
  const [amount, setAmount] = useState('')
  const [receipt, setReceipt] = useState<Receipt | null>(null)

  useEffect(() => {
    setReceipt(null)
  }, [market.id])

  const outcome = market.outcomes.find((o) => o.id === outcomeId) ?? market.outcomes[0]!
  const binary = market.kind === 'line'
  const amt = Number.parseFloat(amount) || 0
  const shares = amt > 0 ? (amt * 100) / outcome.price : 0
  const ret = amt > 0 ? ((shares - amt) / amt) * 100 : 0
  const needsDeposit = loggedIn && amt > 0 && balance + 1e-9 < amt

  const cta = !loggedIn
    ? 'Login'
    : needsDeposit
      ? 'Deposit to buy'
      : amt > 0
        ? `Buy ${outcome.short} · ${fmtMoney(amt)}`
        : `Buy ${outcome.short}`

  const buy = () => {
    if (!loggedIn) return openAuth('login')
    if (amt < MIN_BUY) return
    if (needsDeposit) return setCashierOpen(true)
    if (!canPlaceSportsBets) {
      return openProfileGate(joinJourney === 3 ? 'sports-level' : 'sports-name')
    }
    if (!spendBalance(amt)) return setCashierOpen(true)
    const odds = priceToAmerican(outcome.price)
    const bet: SportsBet = {
      id: newBetId(),
      type: 'straight',
      odds,
      stake: amt,
      toWin: Math.round(shares * 100) / 100,
      status: 'pending',
      placedAt: new Date().toISOString(),
      legs: [
        {
          id: outcome.id,
          label: outcome.position,
          market: market.market,
          eventLabel: market.eventLabel,
          odds,
          status: 'pending',
          sport: market.sport,
          eventHref: market.href || undefined,
          when: market.live ? 'Live' : market.when,
        },
      ],
    }
    addSportsBets([bet])
    setReceipt({ outcome, shares, cost: amt })
    setAmount('')
    window.setTimeout(() => fireJoinWelcomeConfetti(), 80)
  }

  const goMyBets = () => {
    onClose?.()
    startNavigating('/sports/my-bets')
    router.push('/sports/my-bets')
  }

  return (
    <div data-name="trade-ticket" className={cn('flex flex-col', className)}>
      <div className="flex items-start gap-2 px-4 pb-3 pt-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={market.leagueIcon} alt="" className="size-4 object-contain" />
            <span className="truncate">{market.leagueName}</span>
            {market.live ? <LiveClock when={market.when} /> : <span>{market.when}</span>}
          </div>
          <h2 className="text-base font-semibold leading-snug text-foreground">{market.title}</h2>
        </div>
        {onClose ? (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <IconX className="size-4" stroke={2} />
          </button>
        ) : null}
      </div>

      {receipt ? (
        <div className="flex flex-col items-center px-6 pb-6 pt-4 text-center">
          <motion.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="flex size-14 items-center justify-center rounded-full bg-primary"
          >
            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 16, delay: 0.12 }}
            >
              <IconCheck className="size-7 text-primary-foreground" stroke={3} />
            </motion.span>
          </motion.span>
          <h3 className="mt-5 text-[22px] font-bold leading-tight tracking-tight text-foreground">
            Order filled
          </h3>
          <p className="mt-1.5 text-sm tabular-nums text-muted-foreground">
            {fmtShares(receipt.shares)} shares · {receipt.outcome.position} · {fmtMoney(receipt.cost)}
          </p>
          <div className="mt-5 flex flex-col items-center gap-2.5">
            <Button type="button" onClick={goMyBets} className="h-10 w-auto gap-2 rounded-lg px-5">
              <ShellIcon name="ticket" tone="token" className="size-4 text-primary-foreground" />
              My Bets
            </Button>
            <button
              type="button"
              onClick={() => setReceipt(null)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Buy more
            </button>
          </div>
        </div>
      ) : (
        <>
          <OutcomePicker market={market} selectedId={outcome.id} onPick={onOutcome} />

          <div className="flex flex-col gap-2 px-4 pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">Amount</span>
              {loggedIn ? (
                <span className="tabular-nums text-muted-foreground">
                  Balance {fmtMoney(balance)}
                </span>
              ) : null}
            </div>
            <label className="flex h-14 items-center gap-1 rounded-lg border border-input bg-secondary px-3 focus-within:ring-2 focus-within:ring-ring">
              <span className="text-2xl font-semibold text-muted-foreground">$</span>
              <input
                inputMode="decimal"
                aria-label="Amount"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, '').slice(0, 9))}
                className="min-w-0 flex-1 bg-transparent text-2xl font-semibold tabular-nums text-foreground outline-none placeholder:text-muted-foreground"
              />
            </label>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_ADD.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setAmount(String(Math.round((amt + n) * 100) / 100))}
                  className="h-8 rounded-lg bg-secondary text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  +${n}
                </button>
              ))}
              <button
                type="button"
                disabled={!loggedIn || balance <= 0}
                onClick={() => setAmount(String(Math.floor(balance * 100) / 100))}
                className="h-8 rounded-lg bg-secondary text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
              >
                Max
              </button>
            </div>
          </div>

          <dl className="mx-4 mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm">
            <Row label="Avg price" value={fmtCents(outcome.price)} />
            <Row label="Shares" value={amt > 0 ? fmtShares(shares) : '0'} />
            <Row
              label={
                binary
                  ? `Payout if ${outcome.label}`
                  : outcome.label === 'Draw'
                    ? 'Payout if draw'
                    : `Payout if ${outcome.short} wins`
              }
              value={
                <span className="font-semibold text-success">
                  {fmtMoney(shares)}
                  {amt > 0 ? <span className="ml-1 text-xs font-medium">({fmtPct(ret)})</span> : null}
                </span>
              }
            />
          </dl>

          <div className="flex flex-col gap-2 p-4">
            <Button
              type="button"
              onClick={buy}
              disabled={loggedIn && !needsDeposit && amt < MIN_BUY}
              className="h-11 w-full rounded-lg text-sm font-semibold"
            >
              {cta}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Each share pays $1.00 if right.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums text-foreground">{value}</dd>
    </div>
  )
}

function OutcomePicker({
  market,
  selectedId,
  onPick,
}: {
  market: SportsMarket
  selectedId: string
  onPick: (id: string) => void
}) {
  if (market.outcomes.length <= 3) {
    return (
      <div
        className="grid gap-2 px-4"
        style={{ gridTemplateColumns: `repeat(${market.outcomes.length}, minmax(0, 1fr))` }}
      >
        {market.outcomes.map((o) => (
          <PriceButton
            key={o.id}
            outcome={o}
            selected={o.id === selectedId}
            onSelect={() => onPick(o.id)}
            className="h-11 min-w-0 px-2.5"
          />
        ))}
      </div>
    )
  }
  return (
    <ul className="scrollbar-hide mx-4 flex max-h-[208px] flex-col gap-1 overflow-y-auto rounded-lg border border-border p-1">
      {market.outcomes.map((o) => {
        const on = o.id === selectedId
        return (
          <li key={o.id}>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => onPick(o.id)}
              className={cn(
                'flex h-10 w-full items-center gap-2 rounded-md px-2 text-left text-sm transition-colors',
                on ? 'bg-secondary text-foreground' : 'text-foreground hover:bg-accent',
              )}
            >
              <TeamMark outcome={o} />
              <span className="min-w-0 flex-1 truncate font-medium">{o.label}</span>
              <span className="tabular-nums text-muted-foreground">{fmtChance(o.chance)}</span>
              <span
                className={cn(
                  'w-11 text-right font-semibold tabular-nums',
                  on ? 'text-primary' : 'text-foreground',
                )}
              >
                {fmtCents(o.price)}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
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
    const timer = window.setTimeout(() => setMounted(false), 320)
    return () => window.clearTimeout(timer)
  }, [open])
  return { mounted, shown }
}

/** Desktop right sheet / mobile bottom sheet. `belowLg` keeps it off desktop (inline ticket there). */
export function TradeSheet({
  selection,
  onOutcome,
  onClose,
  belowLg = false,
}: {
  selection: { market: SportsMarket; outcomeId: string } | null
  onOutcome: (id: string) => void
  onClose: () => void
  belowLg?: boolean
}) {
  const open = !!selection
  const [last, setLast] = useState(selection)
  useEffect(() => {
    if (selection) setLast(selection)
  }, [selection])
  const view = selection ?? last
  const { mounted, shown } = useAnimatedOpen(open)
  const { sheetRef, offset, dragging, bind } = useDragToClose(open, onClose)
  const [portalReady, setPortalReady] = useState(false)
  useEffect(() => setPortalReady(true), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const ticket = useMemo(
    () =>
      view ? (
        <TradeTicket
          market={view.market}
          outcomeId={view.outcomeId}
          onOutcome={onOutcome}
          onClose={onClose}
        />
      ) : null,
    [view, onOutcome, onClose],
  )

  if (!mounted || !portalReady || !view) return null

  return createPortal(
    <div
      data-name="trade-sheet-root"
      data-trade-sheet-root=""
      className={cn(
        'pointer-events-none fixed inset-0',
        belowLg && 'lg:hidden',
        shown && 'pointer-events-auto',
      )}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={cn(
          'absolute inset-0 border-0 bg-black/60 transition-opacity duration-300',
          shown ? 'opacity-100' : 'opacity-0',
        )}
      />
      <aside
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Buy ${view.market.title}`}
        data-state={shown ? 'open' : 'closed'}
        {...bind}
        className={cn(
          MARKET_CARD,
          'absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto rounded-b-none rounded-t-[16px] border-b-0 bg-popover text-popover-foreground',
          'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          'md:inset-x-auto md:inset-y-0 md:right-0 md:max-h-none md:w-full md:max-w-[400px] md:rounded-none md:border-y-0 md:border-r-0',
          shown ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full md:translate-y-0',
        )}
        style={
          dragging && offset > 0
            ? { transform: `translateY(${offset}px)`, transition: 'none' }
            : undefined
        }
      >
        <div
          data-drag-handle=""
          className="flex w-full cursor-grab touch-none items-center justify-center pb-1 pt-3 md:hidden"
          aria-label="Drag down to close"
        >
          <span className="h-1.5 w-12 rounded-full bg-foreground/25" />
        </div>
        {ticket}
      </aside>
    </div>,
    document.body,
  )
}
