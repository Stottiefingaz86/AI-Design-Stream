'use client'

import { useEffect, useMemo, useState } from 'react'
import NumberFlow from '@number-flow/react'
import { AnimatePresence, motion } from 'framer-motion'
import type { SportsMarket } from '@/lib/lumen/sports-markets'
import { agoLabel, bettorsNow, nextLiveBet, seedLiveBets, type LiveBet } from '@/lib/lumen/v5-combos'
import { cn } from '@/lib/utils'
import { LiveDot, V5_CARD, avatarTone, fmtUsd } from './combo-ui'

const MAX_ROWS = 8

/**
 * People placing bets in real time (demo). New rows drop in on top every couple of
 * seconds; volume and "betting now" tick up with them. Pass several games for a
 * cross-sport feed on the lobby.
 */
export function LiveBetsFeed({
  games,
  title = 'Live bets',
  onVolume,
  className,
  compact = false,
}: {
  games: SportsMarket[]
  title?: string
  /** Lets the event page bump its volume counter with each bet. */
  onVolume?: (amount: number) => void
  className?: string
  compact?: boolean
}) {
  const key = games.map((g) => g.id).join('|')
  const seed = useMemo(
    () =>
      games
        .slice(0, 3)
        .flatMap((g) => seedLiveBets(g, games.length > 1 ? 3 : 6).map((b) => ({ ...b, game: g.title })))
        .sort((a, b) => b.at - a.at)
        .slice(0, MAX_ROWS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  )
  const [rows, setRows] = useState<(LiveBet & { game: string })[]>(seed)
  const [now, setNow] = useState(() => Date.now())
  const [watching, setWatching] = useState(() =>
    games.reduce((a, g) => a + bettorsNow(g), 0),
  )
  const [lastHour, setLastHour] = useState(() => seed.reduce((a, b) => a + b.amount, 0) * 23)

  useEffect(() => {
    setRows(seed)
  }, [seed])

  useEffect(() => {
    if (!games.length) return
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      const game = games[Math.floor(Math.random() * games.length)]!
      const bet = { ...nextLiveBet(game), game: game.title }
      setRows((prev) => [bet, ...prev].slice(0, MAX_ROWS))
      setLastHour((v) => v + bet.amount)
      setWatching((v) => Math.max(12, v + Math.round((Math.random() - 0.4) * 6)))
      onVolume?.(bet.amount)
      timer = setTimeout(tick, 1400 + Math.random() * 1900)
    }
    timer = setTimeout(tick, 1200)
    const clock = setInterval(() => setNow(Date.now()), 1000)
    return () => {
      clearTimeout(timer)
      clearInterval(clock)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return (
    <section data-name="live-bets-feed" className={cn(V5_CARD, 'overflow-hidden', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <LiveDot />
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
        </div>
        <p className="text-xs tabular-nums text-muted-foreground">
          <NumberFlow value={watching} className="font-semibold text-foreground" /> betting now
        </p>
      </div>
      <div className="flex items-baseline justify-between px-4 pt-3">
        <span className="text-xs text-muted-foreground">Last hour</span>
        <span className="text-sm font-bold tabular-nums text-foreground">
          $
          <NumberFlow value={Math.round(lastHour)} format={{ useGrouping: true }} />
        </span>
      </div>
      <ul className={cn('relative flex flex-col px-2 pb-2 pt-1', compact ? 'h-[300px]' : 'h-[392px]', 'overflow-hidden')}>
        <AnimatePresence initial={false}>
          {rows.map((b) => (
            <motion.li
              key={b.key}
              layout
              initial={{ opacity: 0, y: -18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-2 py-2',
                b.big && 'bg-[var(--opacity-warning-10)]',
              )}
            >
              <span
                className={cn(
                  'inline-flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground',
                  avatarTone(b.who),
                )}
                aria-hidden
              >
                {b.who[0]!.toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-foreground">
                  <span className="font-semibold">{b.who}</span>{' '}
                  <span className="text-muted-foreground">bought</span>{' '}
                  <span className={cn('font-semibold', b.side === 'yes' ? 'text-success' : 'text-destructive')}>
                    {b.side === 'yes' ? 'Yes' : 'No'}
                  </span>{' '}
                  <span className="font-semibold">· {b.pick}</span>
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {b.comboLegs ? `in a ${b.comboLegs}-leg combo` : 'single'} · {b.multiplier}
                  {games.length > 1 ? ` · ${b.game}` : ''}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end">
                <span className={cn('text-sm font-bold tabular-nums', b.big ? 'text-[var(--warning)]' : 'text-foreground')}>
                  {fmtUsd(b.amount, 0)}
                </span>
                <span className="text-[11px] tabular-nums text-muted-foreground">{agoLabel(b.at, now)}</span>
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent"
        />
      </ul>
    </section>
  )
}
