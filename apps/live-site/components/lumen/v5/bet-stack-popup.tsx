'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { IconCheck, IconChevronRight, IconStack2, IconX } from '@tabler/icons-react'
import type { SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import { useShell } from '@/components/site/shell-context'
import { revealShellDock } from '@/components/site/shell-scroll'
import { ORIGINALS_GAMES, type CasinoLobbyGame } from '@/lib/lumen/casino-lobby-catalog'
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
import { fmtUsd } from './combo-ui'

/** Each card stays up for 20s, then the deck shuffles to the next. The clock never pauses. */
const CARD_MS = 20_000

type StackCard =
  | { kind: 'combo'; id: string; note: string; title: string; legs: SoccerSlipPick[] }
  | { kind: 'casino'; id: string; game: CasinoLobbyGame }

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

  /* 4 · A popular combo from other games. */
  const pop = featuredCombos('all').find((c) => c.legs.every((l) => !placedEvents.has(l.eventLabel)))
  if (pop) cards.push({ kind: 'combo', id: `pop-${pop.id}`, note: 'Popular combo', title: pop.title, legs: pop.legs })
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

function Deck({ bet, onClose }: { bet: SportsBet; onClose: () => void }) {
  const cards = useMemo(() => buildStack(bet), [bet])
  const [index, setIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const elapsedRef = useRef(0)
  const { launchGame } = useShell()
  const picks = useSoccerSlip()

  const next = useCallback(() => {
    elapsedRef.current = 0
    setElapsed(0)
    setIndex((i) => (i + 1) % Math.max(1, cards.length))
  }, [cards.length])

  /* 20s per card — keeps running, hover or not. */
  useEffect(() => {
    if (cards.length < 2) return
    const base = Date.now() - elapsedRef.current
    const id = setInterval(() => {
      const e = Date.now() - base
      if (e >= CARD_MS) next()
      else {
        elapsedRef.current = e
        setElapsed(e)
      }
    }, 100)
    return () => clearInterval(id)
  }, [index, cards.length, next])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  /* Add straight into Selections — the deck stays up, the slip stays closed. */
  const addCombo = (legs: SoccerSlipPick[], el?: HTMLElement | null) => {
    setSoccerSlip((prev) => legs.reduce((acc, p) => (acc.some((x) => x.id === p.id) ? acc : toggleLeg(acc, p)), prev))
    revealShellDock()
    if (legs[0]) flyBetDotToSlip(el ?? null, legs[0].id)
  }

  const card = cards[index]
  if (!card) return null
  const left = Math.max(0, Math.ceil((CARD_MS - elapsed) / 1000))
  const progress = Math.min(1, elapsed / CARD_MS)
  const legs = bet.legs.length

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 24, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="pointer-events-auto absolute inset-x-0 bottom-24 mx-auto w-[min(375px,calc(100vw-24px))] lg:bottom-[92px]"
    >
      {/* Deck edges — the next cards waiting underneath. */}
      <span aria-hidden className="dark absolute inset-x-6 -bottom-3 h-10 rounded-[14px] border border-border bg-popover opacity-40" />
      <span aria-hidden className="dark absolute inset-x-3 -bottom-1.5 h-10 rounded-[14px] border border-border bg-popover opacity-70" />

      <div
        className={cn(
          'dark relative overflow-hidden rounded-[14px] border border-border bg-popover text-popover-foreground',
          'shadow-[0_12px_48px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.06)]',
        )}
      >
        {/* Bet placed + countdown */}
        <div className="flex items-center gap-3 px-4 pb-3 pt-4">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
            <IconCheck className="size-4" stroke={3} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-base font-bold tracking-tight text-foreground">
              {legs > 1 ? `${legs}-leg combo placed` : 'Bet placed'}
            </span>
            <span className="block truncate text-xs tabular-nums text-muted-foreground">
              {fmtUsd(bet.stake)} to win {fmtUsd(bet.toWin)}
            </span>
          </span>
          <Countdown seconds={left} progress={progress} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <IconX className="size-4" stroke={1.5} />
          </button>
        </div>

        <div className="mx-4 h-px bg-border" />

        <div className="relative min-h-[176px]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={card.id}
              initial={{ x: 56, opacity: 0, rotate: 2 }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              exit={{ x: -56, opacity: 0, rotate: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {card.kind === 'casino' ? (
                <CasinoCard
                  game={card.game}
                  onPlay={(el) => {
                    onClose()
                    launchGame(card.game, el)
                  }}
                />
              ) : (
                <ComboCard
                  card={card}
                  added={card.legs.every((l) => picks.some((p) => p.id === l.id))}
                  onAdd={(el) => addCombo(card.legs, el)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <div className="flex gap-1">
            {cards.map((c, i) => (
              <button
                key={c.id}
                type="button"
                aria-label={`Card ${i + 1}`}
                onClick={() => {
                  elapsedRef.current = 0
                  setElapsed(0)
                  setIndex(i)
                }}
                className={cn('h-1.5 rounded-full outline-none transition-all', i === index ? 'w-5 bg-foreground' : 'w-1.5 bg-muted-foreground hover:bg-foreground')}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            className="inline-flex h-8 items-center gap-0.5 rounded-lg px-2 text-xs font-bold text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring"
          >
            Next <IconChevronRight className="size-3.5" stroke={2} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/** Seconds left on this card — the ring empties as it counts down. */
function Countdown({ seconds, progress }: { seconds: number; progress: number }) {
  const r = 15
  const c = 2 * Math.PI * r
  return (
    <span className="relative inline-flex size-10 shrink-0 items-center justify-center" aria-label={`Next card in ${seconds} seconds`}>
      <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="var(--foreground)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * progress}
          className="transition-[stroke-dashoffset] duration-100 ease-linear"
        />
      </svg>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={seconds}
          initial={{ y: 6, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -6, opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.18 }}
          className={cn('relative text-sm font-bold tabular-nums', 'text-foreground')}
        >
          {seconds}
        </motion.span>
      </AnimatePresence>
    </span>
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
    <div className="px-4 pb-4 pt-3">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        <IconStack2 className="size-3.5" stroke={2} aria-hidden /> {card.note}
      </p>
      <p className="mt-1 truncate text-lg font-bold leading-6 tracking-tight text-foreground">{card.title}</p>
      {/* Leg timeline — same as the SGP cards */}
      <ol className="mt-3 flex flex-col">
        {shown.map((l, i) => {
          const last = i === shown.length - 1 && card.legs.length <= shown.length
          return (
            <li key={l.id} className={cn('relative flex gap-2.5', !last && 'pb-2.5')}>
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
      <div className="mt-4 flex items-end gap-3">
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-muted-foreground">
            {card.legs.length}-leg combo · {fmtX(decimal)}
          </span>
          <span className="block text-2xl font-bold leading-7 tabular-nums tracking-tight text-foreground">
            $10 pays {fmtUsd(10 * decimal)}
          </span>
        </span>
        <button
          type="button"
          onClick={(e) => (added ? undefined : onAdd(e.currentTarget))}
          aria-pressed={added}
          className={cn(
            'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-4 text-sm font-bold transition-colors',
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
    </div>
  )
}

function CasinoCard({ game, onPlay }: { game: CasinoLobbyGame; onPlay: (el: HTMLElement) => void }) {
  return (
    <div className="px-4 pb-4 pt-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Play while you wait</p>
      <button
        type="button"
        onClick={(e) => onPlay(e.currentTarget)}
        className="group relative mt-2 flex h-[148px] w-full items-center gap-4 overflow-hidden rounded-[12px] border border-border p-3 text-left"
      >
        {/* Blurred art fills the card; the real tile sits on top. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={game.imageSrc} alt="" aria-hidden className="absolute inset-0 size-full scale-125 object-cover opacity-50 blur-2xl" />
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, transparent 0%, var(--popover) 85%)' }}
        />
        <span className="relative h-[124px] w-[92px] shrink-0 overflow-hidden rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:-translate-y-0.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={game.imageSrc} alt="" className="absolute inset-0 size-full object-cover object-top" />
        </span>
        <span className="relative min-w-0 flex-1">
          <span className="block truncate text-lg font-bold leading-6 text-foreground">{game.title}</span>
          <span className="block truncate text-xs text-muted-foreground">{game.vendor}</span>
          <span className="mt-3 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition-opacity group-hover:opacity-90">
            Play now
          </span>
        </span>
      </button>
    </div>
  )
}
