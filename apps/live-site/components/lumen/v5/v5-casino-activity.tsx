'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useShell } from '@/components/site/shell-context'
import type { BaCrown } from '@/lib/lumen/ba-workshop'
import { ACTIVITY_ROWS, activityGameFromTitle } from '@/lib/lumen/casino-lobby-catalog'
import { cn } from '@/lib/utils'
import { V5_CARD, V5_HEADING } from './combo-ui'
import { ACTIVITY_USERS, CrownMark, PlayToggle, useWidth } from './v5-activity'

/**
 * V5 · Casino Activity — the casino feed in the same shape as the sports one: game tile, game and
 * result on two lines, player and bet on the right, and the multiplier as the button (tap to play).
 * Same tick (~900ms), mouse-hover pause and play / pause as Sports Activity.
 */

const VISIBLE = 8
const TICK_MS = 900
const ROW_CSS = '4rem'
const EASE = [0.22, 1, 0.36, 1] as const

type Kind = 'all' | 'wins' | 'high'
type Row = {
  key: string
  user: string
  crown: BaCrown
  game: string
  bet: string
  betValue: number
  multi: string
  payout: string
  win: boolean
}
type LiveRow = Row & { id: string }

const money = (s: string) => Number(s.replace(/[^0-9.]/g, '')) || 0

const POOL: Row[] = ACTIVITY_ROWS.map((r, i) => ({
  key: `c${i}`,
  user: ACTIVITY_USERS[(i * 3 + 1) % ACTIVITY_USERS.length]!,
  crown: r.crown as BaCrown,
  game: r.game,
  bet: r.bet,
  betValue: money(r.bet),
  multi: r.multi,
  payout: r.payout,
  win: r.win,
}))

const KINDS: { id: Kind; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'wins', label: 'Wins' },
  { id: 'high', label: 'High rollers' },
]

export function CasinoActivityFeed({ titleSlot }: { titleSlot?: ReactNode }) {
  const { launchGame } = useShell()
  const [kind, setKind] = useState<Kind>('all')
  const pool = useMemo(() => {
    const list = kind === 'wins' ? POOL.filter((r) => r.win) : kind === 'high' ? POOL.filter((r) => r.betValue >= 200) : POOL
    /* Never an empty rail — repeat templates (PRD: padFeedPool). */
    const out = [...list]
    for (let i = 0; list.length && out.length < VISIBLE * 2; i++) out.push(list[i % list.length]!)
    return out
  }, [kind])

  const [playing, setPlaying] = useState(true)
  const [hovered, setHovered] = useState(false)
  const live = playing && !hovered
  const seq = useRef(0)
  const seed = (p: Row[]) => p.slice(0, VISIBLE).map((r, i) => ({ ...r, id: `seed-${r.key}-${i}` }))
  const [rows, setRows] = useState<LiveRow[]>(() => seed(pool))
  const [boxRef, width] = useWidth<HTMLDivElement>()
  const showUser = width >= 560
  const [launching, setLaunching] = useState<string | null>(null)

  useEffect(() => {
    seq.current = 0
    setRows(seed(pool))
  }, [pool])

  useEffect(() => {
    if (!live || !pool.length) return
    const tick = window.setInterval(() => {
      seq.current += 1
      const next = pool[(VISIBLE + seq.current) % pool.length]!
      setRows((prev) => [{ ...next, id: `live-${seq.current}-${next.key}` }, ...prev].slice(0, VISIBLE))
    }, TICK_MS)
    return () => window.clearInterval(tick)
  }, [live, pool])

  useEffect(() => {
    if (!launching) return
    const t = window.setTimeout(() => setLaunching(null), 900)
    return () => window.clearTimeout(t)
  }, [launching])

  const play = (row: LiveRow) => {
    if (launching) return
    setLaunching(row.id)
    launchGame(activityGameFromTitle(row.game))
  }

  return (
    <section data-name="v5-casino-activity" aria-label="Activity" className="mb-10">
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-3">
        {titleSlot ? <div className="mr-auto">{titleSlot}</div> : <h2 className={cn(V5_HEADING, 'mr-auto')}>Activity</h2>}
        <div role="tablist" aria-label="Bet type" className="inline-flex h-10 items-center rounded-full border border-border bg-card p-1">
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              role="tab"
              aria-selected={kind === k.id}
              onClick={() => setKind(k.id)}
              className={cn(
                'h-8 rounded-full px-3.5 text-sm font-semibold transition-colors',
                kind === k.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {k.label}
            </button>
          ))}
        </div>
        <PlayToggle live={playing} onToggle={() => setPlaying((v) => !v)} />
      </div>

      <div
        ref={boxRef}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        className={cn(V5_CARD, 'overflow-hidden rounded-[14px]')}
      >
        <div className="relative overflow-hidden" style={{ height: `calc(${VISIBLE} * ${ROW_CSS})` }}>
          <AnimatePresence initial={false} mode="popLayout">
            {rows.map((row) => {
              const game = activityGameFromTitle(row.game)
              const busy = launching === row.id
              return (
                /* The whole row launches the game; the multiplier chip shows the spinner. */
                <motion.button
                  key={row.id}
                  type="button"
                  layout
                  aria-label={`Play ${row.game}`}
                  aria-busy={busy || undefined}
                  onClick={() => play(row)}
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.25, ease: EASE, layout: { duration: 0.25, ease: EASE } }}
                  className="group flex h-16 w-full items-center gap-3 border-b border-border px-4 text-left transition-colors last:border-b-0 hover:bg-[var(--v5-hover)] focus-visible:bg-[var(--v5-hover)] focus-visible:outline-none"
                >
                  <span className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-secondary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={game.imageSrc} alt="" className="size-full object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold leading-5 text-foreground">{row.game}</span>
                    <span className="block truncate text-xs leading-4 text-muted-foreground">
                      Originals ·{' '}
                      <span className={cn('font-semibold tabular-nums', row.win ? 'text-success' : 'text-muted-foreground')}>
                        {row.win ? `Won ${row.payout.replace(/^\+/, '')}` : `Lost ${row.payout.replace(/^-/, '')}`}
                      </span>
                    </span>
                  </span>
                  {showUser ? (
                    <span className="w-28 shrink-0 text-right text-xs leading-4">
                      <span className="flex items-center justify-end gap-1 text-muted-foreground">
                        <CrownMark tone={row.crown} />
                        <span className="truncate">{row.user}</span>
                      </span>
                      <span className="block tabular-nums text-muted-foreground">{row.bet} bet</span>
                    </span>
                  ) : null}
                  <span
                    aria-hidden
                    className={cn(
                      'inline-flex h-10 w-[84px] shrink-0 items-center justify-center rounded-lg border text-sm font-bold tabular-nums transition-colors',
                      'border-border bg-secondary group-hover:bg-accent',
                      row.win ? 'text-success' : 'text-foreground',
                    )}
                  >
                    {busy ? (
                      <span className="size-4 animate-spin rounded-full border-2 border-[color-mix(in_srgb,var(--foreground)_25%,transparent)] border-t-foreground" />
                    ) : (
                      row.multi
                    )}
                  </span>
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
