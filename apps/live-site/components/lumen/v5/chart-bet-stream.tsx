'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { SportsMarket } from '@/lib/lumen/sports-markets'
import { nextLiveBet } from '@/lib/lumen/v5-combos'

type Tick = { id: number; text: string; color: string; lane: number }

const LANES = 5

/**
 * Bets being placed, streamed up the chart's left edge: "+ $25" in the colour of the
 * side it backs. Each one rises and fades; `onBet` lets the page tick its volume.
 */
export function ChartBetStream({
  game,
  colorOf,
  onBet,
}: {
  game: SportsMarket
  colorOf: (outcomeId: string) => string
  onBet?: (amount: number) => void
}) {
  const [ticks, setTicks] = useState<Tick[]>([])
  const seq = useRef(0)
  const lane = useRef(0)
  const onBetRef = useRef(onBet)
  onBetRef.current = onBet

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const spawn = () => {
      const bet = nextLiveBet(game)
      const outcome = game.outcomes.find((o) => (o.label === 'Draw' ? 'Draw' : o.label) === bet.pick)
      seq.current += 1
      lane.current = (lane.current + 1 + Math.floor(Math.random() * 2)) % LANES
      const tick: Tick = {
        id: seq.current,
        text: `+ $${bet.amount.toLocaleString('en-US')}`,
        color: outcome ? colorOf(outcome.id) : 'var(--foreground)',
        lane: lane.current,
      }
      setTicks((prev) => [...prev.slice(-9), tick])
      onBetRef.current?.(bet.amount)
      timer = setTimeout(spawn, 700 + Math.random() * 1500)
    }
    timer = setTimeout(spawn, 600)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.id])

  return (
    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 overflow-hidden" aria-hidden>
      <AnimatePresence>
        {ticks.map((t) => (
          <motion.span
            key={t.id}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -150, opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3.6, ease: 'easeOut', times: [0, 0.12, 0.7, 1] }}
            onAnimationComplete={() => setTicks((prev) => prev.filter((x) => x.id !== t.id))}
            className="absolute bottom-6 whitespace-nowrap text-[13px] font-bold tabular-nums"
            style={{ left: 4 + (t.lane % 2) * 6, bottom: 24 + t.lane * 18, color: t.color }}
          >
            {t.text}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}
