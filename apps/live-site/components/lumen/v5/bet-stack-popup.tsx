'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { IconCheck, IconChevronLeft, IconChevronRight, IconDice5, IconGift, IconHandFinger, IconX } from '@tabler/icons-react'
import { toast } from '@/components/ui/sonner'
import type { SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import { useShell } from '@/components/site/shell-context'
import { revealShellDock } from '@/components/site/shell-scroll'
import { LIVE_GAMES, ORIGINALS_GAMES, SLOTS_GAMES, type CasinoLobbyGame } from '@/lib/lumen/casino-lobby-catalog'
import { setSoccerSlip, useSoccerSlip } from '@/lib/lumen/soccer-slip-store'
import { useSportsBets, type SportsBet } from '@/lib/lumen/sports-bets-store'
import {
  comboDecimal,
  decimalOf,
  eventLadders,
  featuredCombos,
  fmtX,
  leadOutcome,
  teamOutcomes,
  toggleLeg,
  v5Games,
  winnerYesPick,
} from '@/lib/lumen/v5-combos'
import { flyBetDotToSlip } from '@/lib/lumen/vip-celebrate'
import { cn } from '@/lib/utils'
import { ComboMark } from './combo-mark'
import { LiveDot, fmtUsd } from './combo-ui'

/** Each card stays up for 20s, then the deck shuffles to the next. The clock never pauses. */
const CARD_MS = 20_000

type StackCard =
  | { kind: 'combo'; id: string; note: string; title: string; legs: SoccerSlipPick[] }
  | { kind: 'casino'; id: string; game: CasinoLobbyGame; live?: boolean }
  | { kind: 'spins'; id: string; game: CasinoLobbyGame; spins: number }

// ─── Store: the slip calls showBetStack when it closes on a receipt ───

let current: SportsBet | null = null
const shown = new Set<string>()
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

/** Open the follow-up deck for the bet just placed (the biggest one if several). Once per bet. */
export function showBetStack(placed: SportsBet[]) {
  const bet = [...placed].sort((a, b) => b.legs.length - a.legs.length)[0]
  if (!bet || shown.has(bet.id)) return
  shown.add(bet.id)
  current = bet
  emit()
}

function closeBetStack() {
  current = null
  emit()
}

function useStackBet(): SportsBet | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current,
    () => null,
  )
}

// ─── Cards ────────────────────────────────────────────────────

/** Related follow-ups for the bet that just went on — bigger combos, plus one casino card. */
function buildStack(bet: SportsBet): StackCard[] {
  const games = v5Games('all')
  const placedEvents = new Set(bet.legs.map((l) => l.eventLabel))
  const placedIds = new Set(bet.legs.map((l) => l.id))
  /* Team-level legs only — no player props on a follow-up card. */
  const TEAM_MARKET = /moneyline|match result|1x2|winner|spread|handicap|total|over|under|double chance|both teams/i
  const asPicks: SoccerSlipPick[] = bet.legs
    .filter((l) => TEAM_MARKET.test(l.market))
    .slice(0, 3)
    .map((l) => ({
      id: l.id,
      label: l.label,
      odds: l.odds,
      eventLabel: l.eventLabel,
      market: l.market,
      eventHref: l.eventHref,
      sport: l.sport,
    }))
  const cards: StackCard[] = []

  /* 1 · Same game, more legs — total + spread on the game they just backed. */
  const home = games.find((g) => placedEvents.has(g.eventLabel))
  if (home) {
    const extra = eventLadders(home)
      .map((l) => l.rungs[l.defaultIndex]!.yes)
      .filter((p) => !placedIds.has(p.id))
    if (extra.length) {
      cards.push({
        kind: 'combo',
        id: 'same-game',
        note: 'Same game, more legs',
        title: home.title,
        legs: extra.reduce((acc, p) => toggleLeg(acc, p), [] as SoccerSlipPick[]),
      })
    }
  }

  /* 2 · Build on it — their picks plus two favourites from other games. */
  const others = games.filter((g) => !placedEvents.has(g.eventLabel))
  const favs = others.slice(0, 2).map((g) => {
    const lead = leadOutcome(g)
    return winnerYesPick(g, lead.label === 'Draw' ? teamOutcomes(g)[0]! : lead)
  })
  if (favs.length) {
    cards.push({
      kind: 'combo',
      id: 'build-on-it',
      note: 'Build on your bet',
      title: asPicks.length ? `Your picks + ${favs.length} favourites` : 'Back the favourites',
      legs: [...asPicks, ...favs],
    })
  }

  /* 3 · Casino break. */
  const game = ORIGINALS_GAMES[Math.floor(Math.random() * Math.min(8, ORIGINALS_GAMES.length))]
  if (game) cards.push({ kind: 'casino', id: `casino-${game.id}`, game })

  /* 4 · More from the same league — its three biggest other games. */
  if (home) {
    const league = others.filter((g) => g.leagueName === home.leagueName).sort((a, b) => b.volume - a.volume).slice(0, 3)
    if (league.length > 1) {
      cards.push({
        kind: 'combo',
        id: 'same-league',
        note: `More ${home.leagueName}`,
        title: `${home.leagueName} favourites`,
        legs: league.map((g) => {
          const lead = leadOutcome(g)
          return winnerYesPick(g, lead.label === 'Draw' ? teamOutcomes(g)[0]! : lead)
        }),
      })
    }
  }

  /* 5 · Live now — favourites in games already under way. */
  const live = others.filter((g) => g.live && teamOutcomes(g).length === 2).slice(0, 3)
  if (live.length > 1) {
    cards.push({
      kind: 'combo',
      id: 'live-now',
      note: 'Live now',
      title: `${live.length} live favourites`,
      legs: live.map((g) => winnerYesPick(g, leadOutcome(g).label === 'Draw' ? teamOutcomes(g)[0]! : leadOutcome(g))),
    })
  }

  /* 6 · Bigger price — the underdogs from the busiest games. */
  const dogs = others
    .filter((g) => !g.live && teamOutcomes(g).length === 2)
    .sort((a, b) => b.volume - a.volume)
    .slice(2, 5)
  if (dogs.length > 1) {
    cards.push({
      kind: 'combo',
      id: 'bigger-price',
      note: 'Bigger price',
      title: `${dogs.length} upsets`,
      legs: dogs.map((g) => {
        const sides = teamOutcomes(g)
        return winnerYesPick(g, sides.reduce((a, b) => (b.chance < a.chance ? b : a), sides[0]!))
      }),
    })
  }

  /* 7 · Popular combos from other games. */
  featuredCombos('all')
    .filter((c) => c.legs.every((l) => !placedEvents.has(l.eventLabel)))
    .slice(0, 2)
    .forEach((pop) => cards.push({ kind: 'combo', id: `pop-${pop.id}`, note: 'Popular combo', title: pop.title, legs: pop.legs }))

  /* Casino through the deck — free spins on a slot, a live table — never two casino cards in a row. */
  const slot = SLOTS_GAMES[Math.floor(Math.random() * Math.min(10, SLOTS_GAMES.length))]
  const table = LIVE_GAMES[Math.floor(Math.random() * Math.min(8, LIVE_GAMES.length))]
  const extras: StackCard[] = [
    ...(slot ? [{ kind: 'spins' as const, id: `spins-${slot.id}`, game: slot, spins: 20 }] : []),
    ...(table ? [{ kind: 'casino' as const, id: `live-${table.id}`, game: table, live: true }] : []),
  ]
  extras.forEach((card, k) => cards.splice(Math.min(cards.length, 5 + k * 3), 0, card))
  return cards
}

/**
 * V5 only. After the player closes the betslip on a receipt, a compact deck of follow-ups
 * docks where the slip was. The top card holds for 10s, then shuffles to the back.
 * Design review: `?stack=preview` opens it on the newest bet.
 */
export function BetStackPopup() {
  const bet = useStackBet()
  const bets = useSportsBets()
  const [mounted, setMounted] = useState(false)
  const previewed = useRef(false)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (!mounted || previewed.current || !bets.length) return
    previewed.current = true
    if (new URLSearchParams(window.location.search).get('stack') !== 'preview') return
    const newest = [...bets].sort((a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt))[0]!
    const t = setTimeout(() => showBetStack([newest]), 600)
    return () => clearTimeout(t)
  }, [mounted, bets])

  if (!mounted) return null
  return createPortal(
    <div data-trade-sheet-root="" data-name="v5-bet-stack" className="pointer-events-none">
      <AnimatePresence>{bet ? <Deck key={bet.id} bet={bet} onClose={closeBetStack} /> : null}</AnimatePresence>
    </div>,
    document.body,
  )
}

const SWIPE_PX = 110
const SWIPE_V = 600

/**
 * Tinder-style deck — the top card drags on x (swipe away on phones), flies off and the next
 * card rises; cards behind sit scaled down. The 20s clock flicks the top card on its own.
 */
function Deck({ bet, onClose }: { bet: SportsBet; onClose: () => void }) {
  const cards = useMemo(() => buildStack(bet), [bet])
  /* Absolute position in an endless deck — keys stay unique as cards cycle. */
  const [n, setN] = useState(0)
  const [dir, setDir] = useState<1 | -1>(-1)
  const [elapsed, setElapsed] = useState(0)
  const elapsedRef = useRef(0)
  const { launchGame } = useShell()
  const picks = useSoccerSlip()

  /* Phones, first time: the top card nudges left and right with a "Swipe" chip so the gesture is obvious. */
  const [hint, setHint] = useState(false)
  useEffect(() => {
    try {
      if (!window.matchMedia('(pointer: coarse)').matches || sessionStorage.getItem('v5-stack-swipe-hint')) return
      sessionStorage.setItem('v5-stack-swipe-hint', '1')
    } catch {
      return
    }
    setHint(true)
    const t = window.setTimeout(() => setHint(false), 3400)
    return () => window.clearTimeout(t)
  }, [])

  const fling = useCallback((d: 1 | -1) => {
    setHint(false)
    elapsedRef.current = 0
    setElapsed(0)
    setDir(d)
    setN((i) => i + 1)
  }, [])
  /* Desktop ← — bring the previous card back on top. */
  const back = useCallback(() => {
    elapsedRef.current = 0
    setElapsed(0)
    setDir(1)
    setN((i) => i - 1)
  }, [])

  /* 20s per card — keeps running, hover or not. */
  useEffect(() => {
    if (cards.length < 2) return
    const base = Date.now() - elapsedRef.current
    const id = setInterval(() => {
      const e = Date.now() - base
      if (e >= CARD_MS) fling(-1)
      else {
        elapsedRef.current = e
        setElapsed(e)
      }
    }, 100)
    return () => clearInterval(id)
  }, [n, cards.length, fling])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') fling(-1)
      if (e.key === 'ArrowLeft') back()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, fling, back])

  /* Add straight into Selections — the deck stays up, the slip stays closed. */
  const addCombo = (legs: SoccerSlipPick[], el?: HTMLElement | null) => {
    setSoccerSlip((prev) => legs.reduce((acc, p) => (acc.some((x) => x.id === p.id) ? acc : toggleLeg(acc, p)), prev))
    revealShellDock()
    if (legs[0]) flyBetDotToSlip(el ?? null, legs[0].id)
  }

  if (!cards.length) return null
  const left = Math.max(0, Math.ceil((CARD_MS - elapsed) / 1000))
  const progress = Math.min(1, elapsed / CARD_MS)
  const legs = bet.legs.length
  const depth = Math.min(3, cards.length)
  const at = (i: number) => ((i % cards.length) + cards.length) % cards.length
  const visible = Array.from({ length: depth }, (_, d) => ({ k: n + d, d, card: cards[at(n + d)]! }))
  const active = at(n)

  /* Centre stage — blurred overlay behind, the deck pops up in the middle like a game. */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="pointer-events-auto fixed inset-0 z-[150] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close suggestions"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/60"
      />
    <motion.div
      initial={{ y: 48, scale: 0.92, opacity: 0 }}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      exit={{ y: 32, scale: 0.95, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="relative flex w-[min(420px,calc(100vw-32px))] flex-col gap-3"
    >
      {/* Receipt bar — what just went on, the clock, close. */}
      <div className="dark flex items-center gap-3 rounded-[14px] border border-border bg-popover py-2.5 pl-3 pr-2 text-popover-foreground shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
          <IconCheck className="size-4" stroke={3} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold leading-5 tracking-tight text-foreground">
            {legs > 1 ? `${legs}-leg combo placed` : 'Bet placed'}
          </span>
          <span className="block truncate text-xs tabular-nums text-muted-foreground">
            {fmtUsd(bet.stake)} to win {fmtUsd(bet.toWin)}
          </span>
        </span>
        {cards.length > 1 ? <Countdown seconds={left} progress={progress} /> : null}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <IconX className="size-4" stroke={2} />
        </button>
      </div>

      {/* The deck */}
      <div className="relative grid pb-5">
        <AnimatePresence initial={false} custom={dir}>
          {[...visible].reverse().map(({ k, d, card }) => (
            <SwipeCard key={k} depth={d} custom={dir} onSwipe={fling} hint={hint && d === 0}>
              {card.kind === 'casino' ? (
                <CasinoCard
                  game={card.game}
                  live={card.live}
                  onPlay={(el) => {
                    onClose()
                    launchGame(card.game, el, { skipFunds: true })
                  }}
                />
              ) : card.kind === 'spins' ? (
                <SpinsCard
                  game={card.game}
                  spins={card.spins}
                  onClaim={(el) => {
                    onClose()
                    toast.success(`${card.spins} free spins added on ${card.game.title}`)
                    launchGame(card.game, el, { skipFunds: true })
                  }}
                />
              ) : (
                <ComboCard
                  card={card}
                  added={card.legs.every((l) => picks.some((p) => p.id === l.id))}
                  onAdd={(el) => addCombo(card.legs, el)}
                />
              )}
            </SwipeCard>
          ))}
        </AnimatePresence>
        <AnimatePresence>
          {hint ? (
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="dark pointer-events-none absolute inset-x-0 bottom-[68px] z-30 mx-auto flex w-max items-center gap-2 rounded-full bg-foreground px-3.5 py-2 text-xs font-bold text-background shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
            >
              <IconChevronLeft className="size-3.5" stroke={2.5} aria-hidden />
              <motion.span animate={{ x: [0, -6, 0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
                <IconHandFinger className="size-4" stroke={2} aria-hidden />
              </motion.span>
              Swipe for more
              <IconChevronRight className="size-3.5" stroke={2.5} aria-hidden />
            </motion.span>
          ) : null}
        </AnimatePresence>
        {/* Pagination — centred along the bottom of the top card. */}
        <div className="dark pointer-events-none absolute inset-x-0 bottom-9 z-20 flex justify-center gap-1.5" aria-hidden>
          {cards.map((c, i) => (
            <span
              key={c.id}
              className={cn('h-1.5 rounded-full transition-all duration-300', i === active ? 'w-5 bg-foreground' : 'w-1.5 bg-muted-foreground opacity-60')}
            />
          ))}
        </div>
        {/* Desktop only — not everyone has a trackpad to swipe. */}
        {cards.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous suggestion"
              onClick={back}
              className="v5-glass absolute -left-14 top-[calc(50%-10px)] hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-accent lg:inline-flex"
            >
              <IconChevronLeft className="size-5" stroke={2} />
            </button>
            <button
              type="button"
              aria-label="Next suggestion"
              onClick={() => fling(-1)}
              className="v5-glass absolute -right-14 top-[calc(50%-10px)] hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-accent lg:inline-flex"
            >
              <IconChevronRight className="size-5" stroke={2} />
            </button>
          </>
        ) : null}
      </div>

    </motion.div>
    </motion.div>
  )
}

/* Cards rise from below into the stack; the top one flies off with a spin and a lift. */
const FLY = {
  /* The new back card just fades in where it sits — no rising from behind. */
  enter: { opacity: 0 },
  exit: (d: 1 | -1) => ({
    x: d * 720,
    y: -70,
    rotate: d * 34,
    scale: 0.9,
    opacity: 0,
    transition: { duration: 0.48, ease: [0.32, 0.72, 0, 1] },
  }),
}

/** One card in the deck. Depth 0 drags; behind cards wait scaled down and dimmed. */
function SwipeCard({
  depth,
  custom,
  onSwipe,
  hint,
  children,
}: {
  depth: number
  custom: 1 | -1
  onSwipe: (d: 1 | -1) => void
  /** First-time nudge on phones. */
  hint?: boolean
  children: React.ReactNode
}) {
  const x = useMotionValue(0)
  useEffect(() => {
    if (!hint) return
    const run = animate(x, [0, -64, 0, 48, 0], { duration: 1.7, delay: 0.5, ease: 'easeInOut' })
    return () => run.stop()
  }, [hint, x])
  const rotate = useTransform(x, [-260, 0, 260], [-14, 0, 14])
  const top = depth === 0
  return (
    <motion.div
      custom={custom}
      variants={FLY}
      initial="enter"
      exit="exit"
      animate={{ scale: 1 - depth * 0.05, y: depth * 14, opacity: depth > 1 ? 0.55 : depth === 1 ? 0.8 : 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      style={{ x: top ? x : 0, rotate: top ? rotate : 0, zIndex: 10 - depth, gridArea: '1 / 1' }}
      drag={top ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > SWIPE_PX || Math.abs(info.velocity.x) > SWIPE_V) onSwipe(info.offset.x > 0 ? 1 : -1)
      }}
      className={cn(
        'dark origin-bottom overflow-hidden rounded-[16px] border border-border bg-popover text-popover-foreground',
        'shadow-[0_16px_48px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.05)]',
        top ? 'cursor-grab touch-pan-y active:cursor-grabbing' : 'pointer-events-none',
      )}
      aria-hidden={!top}
    >
      <div key={top ? 'top' : 'back'} className={cn(!top && 'invisible')}>
        {children}
      </div>
    </motion.div>
  )
}

/** Seconds left on this card — the ring empties as it counts down. */
function Countdown({ seconds, progress }: { seconds: number; progress: number }) {
  const r = 15
  const c = 2 * Math.PI * r
  /* Last five seconds: red, and a little shake on every tick. */
  const urgent = seconds > 0 && seconds <= 5
  return (
    <motion.span
      key={urgent ? `t${seconds}` : 'calm'}
      animate={urgent ? { x: [0, -3, 3, -2, 2, 0], rotate: [0, -10, 10, -6, 6, 0], scale: [1, 1.14, 1] } : {}}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative inline-flex size-9 shrink-0 items-center justify-center"
      aria-label={`Next card in ${seconds} seconds`}
    >
      <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke={urgent ? 'var(--destructive)' : 'var(--foreground)'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * progress}
          className="transition-[stroke-dashoffset,stroke] duration-100 ease-linear"
        />
      </svg>
      <span className={cn('relative text-xs font-bold tabular-nums transition-colors', urgent ? 'text-destructive' : 'text-foreground')}>
        {seconds}
      </span>
    </motion.span>
  )
}

function ComboCard({
  card,
  added,
  onAdd,
}: {
  card: Extract<StackCard, { kind: 'combo' }>
  added: boolean
  onAdd: (el?: HTMLElement | null) => void
}) {
  const decimal = comboDecimal(card.legs)
  const shown = card.legs.slice(0, 3)
  return (
    <div className="p-5 pb-14">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <ComboMark className="size-4" /> {card.note}
      </p>
      <p className="mt-1.5 truncate text-xl font-bold leading-7 tracking-tight text-foreground">{card.title}</p>
      {/* Leg timeline — same as the SGP cards */}
      <ol className="mt-4 flex flex-col">
        {shown.map((l, i) => {
          const last = i === shown.length - 1 && card.legs.length <= shown.length
          return (
            <li key={l.id} className={cn('relative flex gap-3', !last && 'pb-3.5')}>
              {!last ? <span className="absolute bottom-0 left-[7.5px] top-5 w-px bg-border" aria-hidden /> : null}
              <span
                className={cn(
                  'relative mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full transition-colors',
                  added ? 'bg-primary' : 'border-2 border-muted-foreground bg-popover',
                )}
                aria-hidden
              >
                {added ? <IconCheck className="size-2.5 text-primary-foreground" stroke={3.5} /> : null}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-bold leading-5 text-foreground">{l.label}</span>
              <span className="text-xs leading-5 tabular-nums text-muted-foreground">{fmtX(decimalOf(l.odds))}</span>
            </li>
          )
        })}
        {card.legs.length > shown.length ? (
          <li className="pl-[26px] text-xs text-muted-foreground">+{card.legs.length - shown.length} more</li>
        ) : null}
      </ol>
      {/* Payout — the hero: rolls up from the stake, then a soft light sweeps across it. */}
      <div className="mt-5 rounded-xl border border-border bg-card px-4 pb-3 pt-2.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {card.legs.length}-leg combo · {fmtX(decimal)}
          </span>
          <span className="tabular-nums">$10 stake</span>
        </div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-muted-foreground">Pays</span>
          <RollUp value={10 * decimal} className="v5-pay-shimmer text-[34px] font-bold leading-10 tabular-nums tracking-tight" />
        </div>
      </div>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => (added ? undefined : onAdd(e.currentTarget))}
        aria-pressed={added}
        className={cn(
          'mt-4 inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-xl text-[15px] font-bold transition-colors',
          added ? 'bg-secondary text-foreground' : 'bg-primary text-primary-foreground hover:opacity-90',
        )}
      >
        {added ? (
          <>
            <IconCheck className="size-4" stroke={3} aria-hidden /> In Selections
          </>
        ) : (
          'Add to Selections'
        )}
      </button>
    </div>
  )
}

/** Counts up from the stake to the payout (ease-out, ~0.9s). Reduced motion: shows the number. */
function RollUp({ value, from = 10, className }: { value: number; from?: number; className?: string }) {
  const [shown, setShown] = useState(from)
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setShown(value)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 900)
      setShown(from + (value - from) * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, from])
  return (
    <span className={className} aria-label={fmtUsd(value)}>
      {fmtUsd(shown)}
    </span>
  )
}

function CasinoCard({
  game,
  live,
  onPlay,
}: {
  game: CasinoLobbyGame
  live?: boolean
  onPlay: (el: HTMLElement) => void
}) {
  /* Same build as the combo cards: eyebrow, title, the content, one full-width action. */
  const rows: [string, string][] = live
    ? [
        ['Studio', game.vendor],
        ['Table', 'Live dealer'],
        ['Seats', 'Open now'],
      ]
    : [
        ['Studio', game.vendor],
        ['Opens in', 'Mini player'],
        ['Deposit', 'Not needed to try'],
      ]
  return (
    <div className="p-5 pb-14">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        {live ? (
          <>
            <LiveDot /> Live casino
          </>
        ) : (
          <>
            <IconDice5 className="size-4" stroke={1.75} aria-hidden /> Play while you wait
          </>
        )}
      </p>
      <p className="mt-1.5 truncate text-xl font-bold leading-7 tracking-tight text-foreground">{game.title}</p>
      <div className="mt-4 flex gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={game.imageSrc}
          alt=""
          className="h-[148px] w-[110px] shrink-0 rounded-xl object-cover object-top shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
        />
        <dl className="flex min-w-0 flex-1 flex-col justify-center gap-2.5 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-3 border-b border-border pb-2 last:border-b-0 last:pb-0">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="truncate font-semibold text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => onPlay(e.currentTarget)}
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary text-[15px] font-bold text-primary-foreground transition-opacity hover:opacity-90"
      >
        {live ? `Join the table` : `Play ${game.title}`}
      </button>
    </div>
  )
}

/** Free spins on a slot — the count is the hero, one claim button. */
function SpinsCard({
  game,
  spins,
  onClaim,
}: {
  game: CasinoLobbyGame
  spins: number
  onClaim: (el: HTMLElement) => void
}) {
  return (
    <div className="p-5 pb-14">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <IconGift className="size-4" stroke={1.75} aria-hidden /> Free spins
      </p>
      <p className="mt-1.5 truncate text-xl font-bold leading-7 tracking-tight text-foreground">
        {spins} free spins on {game.title}
      </p>
      <div className="mt-4 flex gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={game.imageSrc}
          alt=""
          className="h-[148px] w-[110px] shrink-0 rounded-xl object-cover object-top shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <span className="v5-pay-shimmer text-[56px] font-bold leading-none tabular-nums tracking-tight">{spins}</span>
          <span className="mt-1 text-sm font-semibold text-foreground">free spins, ready now</span>
          <span className="mt-3 text-xs text-muted-foreground">
            {game.vendor} · use within 24 hours
          </span>
        </div>
      </div>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => onClaim(e.currentTarget)}
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary text-[15px] font-bold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Claim {spins} free spins
      </button>
    </div>
  )
}
