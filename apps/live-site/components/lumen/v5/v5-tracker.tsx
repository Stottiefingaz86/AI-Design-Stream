'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IconChartBar, IconChartDots3, IconPlayerPlayFilled } from '@tabler/icons-react'
import { useShell } from '@/components/site/shell-context'
import { outcomeColor } from '@/components/lumen/markets/market-ui'
import type { SportsMarket } from '@/lib/lumen/sports-markets'
import { teamOutcomes } from '@/lib/lumen/v5-combos'
import { v5SportOf, type V5SportId } from '@/lib/lumen/v5-sportsbook'
import { cn } from '@/lib/utils'
import { LiveDot, V5_CARD } from './combo-ui'

/**
 * V5 · match tracker for every sport V1 doesn't cover (V1 has soccer pitch + NFL field).
 * A sport-specific surface, the side in possession lit, the ball moving through a loop of
 * plays, a one-line play-by-play and four live stat bars. Built on Lumen tokens only.
 */

type Surface = 'court' | 'rink' | 'net' | 'table' | 'diamond' | 'cage' | 'ring' | 'pitch' | 'pool' | 'football'

const SURFACE: Partial<Record<V5SportId, Surface>> = {
  basketball: 'court',
  hockey: 'rink',
  lacrosse: 'rink',
  tennis: 'net',
  volleyball: 'net',
  'table-tennis': 'table',
  baseball: 'diamond',
  mma: 'cage',
  boxing: 'ring',
  rugby: 'pitch',
  pool: 'pool',
  soccer: 'football',
}

/** Sample streams we actually have — sports without one get the tracker only. */
const STREAM: Partial<Record<V5SportId, string>> = { soccer: '/sports/soccer-stream.mp4' }

const PLAYS: Record<Surface, string[]> = {
  court: ['Brings it up', 'Drives to the rim', 'Three-point attempt', 'Offensive rebound', 'Fast break', 'Free throws'],
  rink: ['Wins the faceoff', 'Carries over the blue line', 'Shot on goal', 'Power play', 'Clears the zone', 'Breakaway'],
  net: ['Serving', 'Long rally', 'Attacks the net', 'Break point', 'Ace', 'Forced error'],
  table: ['Serving', 'Topspin rally', 'Smash', 'Edge ball', 'Long rally', 'Point won'],
  diamond: ['At bat', 'Ball in play', 'Runner on 2nd', 'Stolen base', 'Strikeout', 'Pitching change'],
  cage: ['Feeling out', 'Clinch against the fence', 'Takedown attempt', 'Strikes landed', 'Ground and pound', 'Back on the feet'],
  ring: ['Jab working', 'Combination lands', 'On the ropes', 'Body shots', 'Clinch', 'Round winding down'],
  pitch: ['Phase play', 'Line break', 'Ruck in the 22', 'Lineout', 'Scrum', 'Kick for touch'],
  pool: ['At the table', 'Safety shot', 'Long pot', 'Snookered', 'Break-off', 'Runs out'],
  football: ['Ball safe', 'Attack', 'Dangerous attack', 'Corner', 'Shot on target', 'Free kick'],
}

const STATS: Record<Surface, [string, number, number][]> = {
  court: [['Field goal %', 38, 58], ['3-pointers', 4, 16], ['Rebounds', 14, 40], ['Turnovers', 3, 14]],
  rink: [['Shots on goal', 8, 34], ['Faceoffs won', 10, 32], ['Hits', 8, 30], ['Power plays', 0, 5]],
  net: [['Aces', 0, 12], ['1st serve %', 52, 78], ['Winners', 6, 34], ['Break points won', 0, 5]],
  table: [['Points won', 12, 44], ['Serve points', 6, 22], ['Longest rally', 4, 18], ['Edge balls', 0, 4]],
  diamond: [['Hits', 2, 12], ['Runs', 0, 8], ['Strikeouts', 2, 11], ['Left on base', 1, 9]],
  cage: [['Sig. strikes', 12, 64], ['Takedowns', 0, 5], ['Control time (min)', 0, 6], ['Knockdowns', 0, 2]],
  ring: [['Punches landed', 20, 90], ['Jabs', 10, 60], ['Power punches', 8, 40], ['Knockdowns', 0, 2]],
  pitch: [['Territory %', 38, 62], ['Carries', 30, 90], ['Tackles', 40, 120], ['Line breaks', 0, 8]],
  pool: [['Pot success %', 70, 96], ['Highest break', 20, 120], ['Safety success %', 50, 90], ['Frames won', 0, 6]],
  football: [['Possession %', 38, 62], ['Shots', 2, 14], ['Corners', 0, 8], ['Fouls', 4, 14]],
}

function rng(seed: string) {
  let s = 2166136261
  for (let i = 0; i < seed.length; i++) s = Math.imul(s ^ seed.charCodeAt(i), 16777619)
  s >>>= 0
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 10000) / 10000
  }
}

export function hasGenTracker(game: SportsMarket): boolean {
  return Boolean(SURFACE[v5SportOf(game)])
}

export function GenTracker({
  game,
  statsSlot,
}: {
  game: SportsMarket
  /** Phones: a Stats tab on the tracker (live bars + form, H2H, info) instead of cards at the page bottom. */
  statsSlot?: ReactNode
}) {
  const sport = v5SportOf(game)
  const surface = SURFACE[sport] ?? 'court'
  const sides = teamOutcomes(game).slice(0, 2)
  const colors = sides.map((o) => outcomeColor(o, game.outcomes))
  const abbr = sides.map((o) => o.short || o.label.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase())
  const lead = sides[0] && sides[1] && sides[1].chance > sides[0].chance ? 1 : 0

  /* A loop of plays — favourite has the ball a bit more often. */
  const beats = useMemo(() => {
    const r = rng(game.id)
    return Array.from({ length: 12 }, (_, i) => {
      const side = (r() < 0.58 ? lead : 1 - lead) as 0 | 1
      const deep = 0.3 + r() * 0.65
      const x = side === 0 ? 100 + deep * 88 : 100 - deep * 88
      return { side, label: PLAYS[surface][Math.floor(r() * PLAYS[surface].length)]!, x, y: 16 + r() * 80, i }
    })
  }, [game.id, surface, lead])
  const stats = useMemo(() => {
    const r = rng(`${game.id}:stats`)
    return STATS[surface].map(([label, lo, hi]) => {
      const a = Math.round(lo + r() * (hi - lo))
      const b = Math.round(lo + r() * (hi - lo))
      return { label, values: [a, b] as [number, number] }
    })
  }, [game.id, surface])

  const [step, setStep] = useState(0)
  useEffect(() => {
    if (!game.live) return
    const id = window.setInterval(() => setStep((s) => (s + 1) % beats.length), 3200)
    return () => window.clearInterval(id)
  }, [game.live, beats.length])
  const beat = beats[step]!
  const fight = surface === 'cage' || surface === 'ring'
  const us = ['nfl', 'basketball', 'hockey', 'baseball', 'lacrosse'].includes(sport)
  const stream = STREAM[sport]
  const [media, setMedia] = useState<'stream' | 'tracker' | 'stats'>(stream ? 'stream' : 'tracker')
  const { loggedIn, openAuth } = useShell()
  const trackerLabel = us ? 'Game tracker' : 'Match tracker'
  const score = game.score ?? [0, 0]

  return (
    <section data-name="v5-gen-tracker" className={cn(V5_CARD, 'overflow-hidden rounded-[14px]')}>
      <div className="flex items-center gap-2 px-4 pb-2 pt-3">
        <span className="text-sm font-semibold text-foreground">
          {media === 'stream' ? 'Live stream' : media === 'stats' ? 'Stats' : trackerLabel}
        </span>
        {game.live ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive">
            <LiveDot />
            {game.when}
          </span>
        ) : null}
        {stream || statsSlot ? (
          <span role="tablist" aria-label="Live media" className="ml-auto flex items-center gap-1.5">
            {(
              [
                ...(stream ? ([{ id: 'stream', label: 'Live stream', Icon: IconPlayerPlayFilled }] as const) : []),
                { id: 'tracker', label: trackerLabel, Icon: IconChartDots3 } as const,
                ...(statsSlot ? ([{ id: 'stats', label: 'Stats', Icon: IconChartBar }] as const) : []),
              ]
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={media === id}
                aria-label={label}
                onClick={() => setMedia(id)}
                className={cn(
                  'inline-flex size-8 items-center justify-center rounded-full border transition-colors',
                  media === id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <Icon className="size-4" stroke={1.75} />
              </button>
            ))}
          </span>
        ) : null}
      </div>

      {stream && media === 'stream' ? (
        <div className="relative mx-3 aspect-video overflow-hidden rounded-xl bg-black">
          <video
            src={stream}
            className={cn('absolute inset-0 size-full object-cover', !loggedIn && 'scale-105 blur-md brightness-50')}
            autoPlay
            muted
            loop
            playsInline
          />
          {loggedIn ? (
            <span className="pointer-events-none absolute left-2.5 top-2.5 flex items-center gap-2 rounded-md bg-[color-mix(in_srgb,var(--background)_70%,transparent)] px-2 py-1 text-[11px] font-semibold text-foreground backdrop-blur-sm">
              {abbr[0]} {score[0]} – {score[1]} {abbr[1]}
              <span className="font-medium text-muted-foreground">{game.when}</span>
            </span>
          ) : (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="text-base font-semibold text-foreground">Watch this match live</span>
              <span className="max-w-[240px] text-sm text-muted-foreground">Log in to stream it here while you bet.</span>
              <span className="flex gap-2">
                <button type="button" onClick={() => openAuth('login')} className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
                  Log in
                </button>
                <button type="button" onClick={() => openAuth('join')} className="h-9 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground">
                  Join
                </button>
              </span>
            </span>
          )}
        </div>
      ) : null}

      <div className={cn('px-3', media !== 'tracker' && 'hidden')}>
        <svg viewBox="0 0 200 112" className="block w-full rounded-xl bg-secondary" role="img" aria-label={`${abbr[beat.side]}: ${beat.label}`}>
          {/* Side in possession — its attacking half lights up in its colour. */}
          {!fight ? (
            <motion.rect
              y={0}
              height={112}
              width={100}
              initial={false}
              animate={{ x: beat.side === 0 ? 100 : 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              fill={colors[beat.side]}
              fillOpacity={0.14}
            />
          ) : null}
          <SurfaceLines surface={surface} />
          {fight ? (
            <>
              <motion.circle r={5} initial={false} animate={{ cx: 92 + (beat.x - 100) * 0.25, cy: beat.y * 0.6 + 22 }} fill={colors[0]} transition={{ duration: 0.8 }} />
              <motion.circle r={5} initial={false} animate={{ cx: 108 + (beat.x - 100) * 0.25, cy: beat.y * 0.6 + 30 }} fill={colors[1]} transition={{ duration: 0.8 }} />
            </>
          ) : (
            <>
              <motion.circle
                r={7}
                initial={false}
                animate={{ cx: beat.x, cy: beat.y }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                fill={colors[beat.side]}
                fillOpacity={0.25}
              />
              <motion.circle
                r={3}
                initial={false}
                animate={{ cx: beat.x, cy: beat.y }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                fill="var(--foreground)"
              />
            </>
          )}
        </svg>
      </div>

      {/* Play-by-play — one line, the newest play slides in. */}
      <div className={cn('relative h-11 overflow-hidden px-4', media !== 'tracker' && 'hidden')}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.p
            key={`${step}-${beat.label}`}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex h-11 items-center gap-2 text-sm"
          >
            <span className="size-2 shrink-0 rounded-full" style={{ background: colors[beat.side] }} aria-hidden />
            <span className="font-semibold text-foreground">{abbr[beat.side]}</span>
            <span className="truncate text-muted-foreground">{beat.label}</span>
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Live bars — always under the tracker on desktop; their own tab (with form, H2H) on phones. */}
      <div
        className={cn(
          'flex flex-col gap-3 px-4 pb-4 pt-3',
          statsSlot ? media !== 'stats' && 'hidden' : 'border-t border-border',
        )}
      >
        <div className="flex items-center justify-between text-xs font-semibold">
          {abbr.map((a, i) => (
            <span key={a + i} className="inline-flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-full" style={{ background: colors[i] }} aria-hidden />
              {a}
            </span>
          ))}
        </div>
        {stats.map((s) => {
          const total = s.values[0] + s.values[1] || 1
          return (
            <div key={s.label}>
              <div className="flex items-center justify-between text-xs tabular-nums">
                <span className="font-semibold text-foreground">{s.values[0]}</span>
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-semibold text-foreground">{s.values[1]}</span>
              </div>
              <div className="mt-1 flex h-1.5 gap-1 overflow-hidden rounded-full">
                <span className="rounded-full" style={{ width: `${(s.values[0] / total) * 100}%`, background: colors[0] }} />
                <span className="flex-1 rounded-full" style={{ background: colors[1] }} />
              </div>
            </div>
          )
        })}
      </div>
      {statsSlot && media === 'stats' ? <div className="border-t border-border px-4 pb-1 pt-3">{statsSlot}</div> : null}
    </section>
  )
}

/** Court, rink, net, table, diamond, cage, ring, pitch or pool — thin lines in the foreground tone. */
function SurfaceLines({ surface }: { surface: Surface }) {
  const stroke = 'color-mix(in srgb, var(--foreground) 28%, transparent)'
  const p = { fill: 'none', stroke, strokeWidth: 1.2 } as const
  switch (surface) {
    case 'court':
      return (
        <g {...p}>
          <rect x={4} y={4} width={192} height={104} rx={6} />
          <line x1={100} y1={4} x2={100} y2={108} />
          <circle cx={100} cy={56} r={13} />
          <rect x={4} y={38} width={34} height={36} />
          <rect x={162} y={38} width={34} height={36} />
          <path d="M4 12 Q 78 56 4 100" />
          <path d="M196 12 Q 122 56 196 100" />
        </g>
      )
    case 'rink':
      return (
        <g {...p}>
          <rect x={4} y={4} width={192} height={104} rx={30} />
          <line x1={100} y1={4} x2={100} y2={108} />
          <line x1={70} y1={4} x2={70} y2={108} />
          <line x1={130} y1={4} x2={130} y2={108} />
          <circle cx={100} cy={56} r={11} />
          <path d="M18 46 A 10 10 0 0 1 18 66" />
          <path d="M182 46 A 10 10 0 0 0 182 66" />
        </g>
      )
    case 'net':
      return (
        <g {...p}>
          <rect x={6} y={10} width={188} height={92} />
          <line x1={6} y1={22} x2={194} y2={22} />
          <line x1={6} y1={90} x2={194} y2={90} />
          <line x1={52} y1={22} x2={52} y2={90} />
          <line x1={148} y1={22} x2={148} y2={90} />
          <line x1={52} y1={56} x2={148} y2={56} />
          <line x1={100} y1={4} x2={100} y2={108} strokeWidth={2.4} />
        </g>
      )
    case 'table':
      return (
        <g {...p}>
          <rect x={16} y={16} width={168} height={80} rx={3} />
          <line x1={16} y1={56} x2={184} y2={56} />
          <line x1={100} y1={10} x2={100} y2={102} strokeWidth={2.4} />
        </g>
      )
    case 'diamond':
      return (
        <g {...p}>
          <path d="M16 70 Q 100 -18 184 70" />
          <polygon points="100,100 140,64 100,28 60,64" />
          <rect x={137} y={61} width={6} height={6} />
          <rect x={97} y={25} width={6} height={6} />
          <rect x={57} y={61} width={6} height={6} />
          <circle cx={100} cy={66} r={4} />
        </g>
      )
    case 'cage': {
      const pts = Array.from({ length: 8 }, (_, i) => {
        const a = (Math.PI / 8) * (2 * i + 1)
        return `${100 + Math.cos(a) * 52},${56 + Math.sin(a) * 50}`
      }).join(' ')
      return (
        <g {...p}>
          <polygon points={pts} />
          <circle cx={100} cy={56} r={14} />
        </g>
      )
    }
    case 'ring':
      return (
        <g {...p}>
          <rect x={44} y={6} width={112} height={100} />
          <rect x={50} y={12} width={100} height={88} />
          <rect x={56} y={18} width={88} height={76} />
        </g>
      )
    case 'pool':
      return (
        <g {...p}>
          <rect x={6} y={8} width={188} height={96} rx={10} />
          <rect x={16} y={18} width={168} height={76} rx={2} />
          {[
            [16, 18],
            [100, 16],
            [184, 18],
            [16, 94],
            [100, 96],
            [184, 94],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={4} />
          ))}
          <line x1={52} y1={18} x2={52} y2={94} />
        </g>
      )
    case 'football':
      return (
        <g {...p}>
          <rect x={4} y={4} width={192} height={104} rx={2} />
          <line x1={100} y1={4} x2={100} y2={108} />
          <circle cx={100} cy={56} r={13} />
          <rect x={4} y={30} width={28} height={52} />
          <rect x={168} y={30} width={28} height={52} />
          <rect x={4} y={44} width={10} height={24} />
          <rect x={186} y={44} width={10} height={24} />
        </g>
      )
    case 'pitch':
    default:
      return (
        <g {...p}>
          <rect x={4} y={4} width={192} height={104} rx={2} />
          <line x1={100} y1={4} x2={100} y2={108} />
          <line x1={22} y1={4} x2={22} y2={108} />
          <line x1={178} y1={4} x2={178} y2={108} />
          <line x1={58} y1={4} x2={58} y2={108} strokeDasharray="4 4" />
          <line x1={142} y1={4} x2={142} y2={108} strokeDasharray="4 4" />
        </g>
      )
  }
}
