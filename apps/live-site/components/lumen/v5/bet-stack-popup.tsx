'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { IconCheck, IconChevronRight, IconPlayerPlayFilled, IconStack2, IconX } from '@tabler/icons-react'
import { Typography } from '@/components/ui/typography'
import type { SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import { useShell } from '@/components/site/shell-context'
import { ORIGINALS_GAMES, type CasinoLobbyGame } from '@/lib/lumen/casino-lobby-catalog'
import { setSoccerSlip } from '@/lib/lumen/soccer-slip-store'
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
import { cn } from '@/lib/utils'
import { fmtUsd } from './combo-ui'

/** Each card stays up for 10s, then the deck shuffles to the next. */
const CARD_MS = 10_000

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
  const [paused, setPaused] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const elapsedRef = useRef(0)
  const { openSportsBetslip, launchGame } = useShell()

  const next = useCallback(() => {
    elapsedRef.current = 0
    setElapsed(0)
    setIndex((i) => (i + 1) % Math.max(1, cards.length))
  }, [cards.length])

  /* 10s per card; hovering the deck pauses the clock. */
  useEffect(() => {
    if (paused || cards.length < 2) return
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
  }, [paused, index, cards.length, next])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const addCombo = (legs: SoccerSlipPick[]) => {
    setSoccerSlip((prev) => legs.reduce((acc, p) => (acc.some((x) => x.id === p.id) ? acc : toggleLeg(acc, p)), prev))
    onClose()
    window.setTimeout(() => openSportsBetslip(), 150)
  }

  const card = cards[index]
  if (!card) return null
  const progress = Math.min(1, elapsed / CARD_MS)
  const legs = bet.legs.length

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 24, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="pointer-events-auto absolute inset-x-0 bottom-24 mx-auto w-[min(375px,calc(100vw-24px))] lg:bottom-[92px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Deck edges — two cards waiting underneath. */}
      <span aria-hidden className="absolute inset-x-6 -bottom-3 h-8 rounded-[10px] border border-border bg-popover opacity-40 dark" />
      <span aria-hidden className="absolute inset-x-3 -bottom-1.5 h-8 rounded-[10px] border border-border bg-popover opacity-70 dark" />

      <div
        className={cn(
          'dark relative overflow-hidden rounded-[10px] border border-border bg-popover text-popover-foreground',
          'shadow-[0_8px_40px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.06)]',
        )}
      >
        {/* Bet placed */}
        <div className="flex items-center gap-2 px-3 pb-2 pt-3">
          <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
            <IconCheck className="size-3.5" stroke={3} aria-hidden />
          </span>
          <Typography as="p" shape="xs" className="min-w-0 flex-1 truncate">
            <span className="font-semibold text-foreground">{legs > 1 ? `${legs}-leg combo placed` : 'Bet placed'}</span>
            <span className="text-muted-foreground">
              {' · '}
              {fmtUsd(bet.stake)} to win {fmtUsd(bet.toWin)}
            </span>
          </Typography>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <IconX className="size-4" stroke={1.5} />
          </button>
        </div>

        {/* 10s clock */}
        <div className="mx-3 h-0.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary transition-[width] duration-100 ease-linear" style={{ width: `${progress * 100}%` }} />
        </div>

        <div className="relative min-h-[148px]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={card.id}
              initial={{ x: 48, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -48, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
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
                <ComboCard card={card} onAdd={() => addCombo(card.legs)} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-border px-3 py-1.5">
          <div className="flex gap-1">
            {cards.map((c, i) => (
              <span
                key={c.id}
                className={cn('h-1 rounded-full transition-all', i === index ? 'w-4 bg-foreground' : 'w-1 bg-muted-foreground/50')}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            className="inline-flex h-7 items-center gap-0.5 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Next <IconChevronRight className="size-3.5" stroke={1.5} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function ComboCard({ card, onAdd }: { card: Extract<StackCard, { kind: 'combo' }>; onAdd: () => void }) {
  const decimal = comboDecimal(card.legs)
  const shown = card.legs.slice(0, 3)
  return (
    <div className="px-3 pb-3 pt-2.5">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <IconStack2 className="size-3.5 text-primary" stroke={1.75} aria-hidden /> {card.note}
      </p>
      <Typography as="p" shape="small" weight="semibold" className="mt-0.5 truncate">
        {card.title}
      </Typography>
      <ul className="mt-2 flex flex-col gap-1">
        {shown.map((l) => (
          <li key={l.id} className="flex items-center gap-2 rounded-md bg-secondary px-2 py-1.5">
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">{l.label}</span>
            <span className="text-[11px] tabular-nums text-muted-foreground">{fmtX(decimalOf(l.odds))}</span>
          </li>
        ))}
        {card.legs.length > shown.length ? (
          <li className="px-2 text-[11px] text-muted-foreground">+{card.legs.length - shown.length} more</li>
        ) : null}
      </ul>
      <div className="mt-3 flex items-center gap-3">
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] text-muted-foreground">
            {card.legs.length}-leg combo · {fmtX(decimal)}
          </span>
          <span className="block text-sm font-semibold tabular-nums text-foreground">$10 pays {fmtUsd(10 * decimal)}</span>
        </span>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-9 shrink-0 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Add to slip
        </button>
      </div>
    </div>
  )
}

function CasinoCard({ game, onPlay }: { game: CasinoLobbyGame; onPlay: (el: HTMLElement) => void }) {
  return (
    <div className="flex items-center gap-3 px-3 pb-3 pt-2.5">
      {/* Same tile as the slip's Play while you wait row. */}
      <span className="relative h-[92px] w-[68px] shrink-0 overflow-hidden rounded-[10px] border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={game.imageSrc} alt="" className="absolute inset-0 size-full object-cover object-top" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-muted-foreground">Play while you wait</span>
        <Typography as="span" shape="small" weight="semibold" className="block truncate">
          {game.title}
        </Typography>
        <span className="block truncate text-xs text-muted-foreground">{game.vendor}</span>
        <button
          type="button"
          onClick={(e) => onPlay(e.currentTarget)}
          className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <IconPlayerPlayFilled className="size-3.5" aria-hidden /> Play now
        </button>
      </span>
    </div>
  )
}
