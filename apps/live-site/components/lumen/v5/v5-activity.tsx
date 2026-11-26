'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react'
import type { SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import { ShellIcon } from '@/components/site/shell-icons'
import { revealShellDock } from '@/components/site/shell-scroll'
import { filterPool, poolForVariant, type BaCrown, type BaSportsRow } from '@/lib/lumen/ba-workshop'
import { setSoccerSlip, useSoccerSlip } from '@/lib/lumen/soccer-slip-store'
import type { SportsMarket } from '@/lib/lumen/sports-markets'
import {
  decimalOf,
  eventLadders,
  fmtX,
  leadOutcome,
  leagueLogo,
  pickFor,
  teamOutcomes,
  toggleLeg,
  v5Games,
  v5Leagues,
  type V5Sport,
} from '@/lib/lumen/v5-combos'
import { isGenerated, sportDef, type V5SportId } from '@/lib/lumen/v5-sportsbook'
import { flyBetDotToSlip } from '@/lib/lumen/vip-celebrate'
import { cn } from '@/lib/utils'
import { ComboMark } from './combo-mark'
import { V5_CARD, V5_HEADING, fmtUsd } from './combo-ui'
import { RadioMenu } from './v5-market-cards'

/**
 * V5 · Sports Activity — the /BA sports feed (PRD: public/ba/ACTIVITY_FEED_BEHAVIOUR.md) on sports pages.
 * Page-aware: home mixes every sport, a sport page shows that sport, a league page that league.
 * Open bets add to the slip; graded wins are display-only. ~900ms tick, hover pauses, play/pause.
 */

const VISIBLE = 8
const TICK_MS = 900
const ROW_H = 'h-16'
const ROW_CSS = '4rem'
const EASE = [0.22, 1, 0.36, 1] as const

export const ACTIVITY_USERS = ['Hidden', 'ace_***', 'lux***', 'nova***', 'bolt***', 'kira***', 'zen***', 'fox***', 'rex***', 'ivy***']
const CROWNS: BaCrown[] = ['gold', 'purple', 'silver']
const STAKES = [250, 80, 100, 150, 60, 135, 40, 500, 25, 75]

type Leg = { pick: SoccerSlipPick; game: SportsMarket }
type Row =
  | { kind: 'single'; key: string; user: string; crown: BaCrown; leg: Leg; stake: number }
  | { kind: 'combo'; key: string; user: string; crown: BaCrown; legs: Leg[]; stake: number }
  | { kind: 'graded'; key: string; user: string; crown: BaCrown; bet: BaSportsRow }
type LiveRow = Row & { id: string }

const GRADED_SPORT: Partial<Record<V5SportId, BaSportsRow['sport']>> = {
  nfl: 'NFL',
  basketball: 'NBA',
  soccer: 'Soccer',
  baseball: 'MLB',
  hockey: 'NHL',
}
const GRADED_LEAGUE: Record<string, string> = { NFL: 'NFL', NBA: 'NBA', 'Premier League': 'EPL', NHL: 'NHL' }

function seeded(key: string) {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

const isField = (g: SportsMarket) => isGenerated(g) && Boolean(g.field)

/** One open pick on a game — mostly the favourite, sometimes the other side, a spread or a total. */
function legFor(game: SportsMarket, i: number): Leg {
  const r = seeded(`${game.id}:${i}`)
  if (!isField(game) && r > 0.55) {
    const ladders = eventLadders(game)
    const ladder = ladders[r > 0.78 ? 1 : 0] ?? ladders[0]
    if (ladder) return { game, pick: ladder.rungs[ladder.defaultIndex]!.yes }
  }
  const sides = isField(game) ? game.outcomes.slice(0, 4) : teamOutcomes(game)
  const outcome = r < 0.3 && sides.length > 1 ? sides.find((o) => o.id !== leadOutcome(game).id)! : leadOutcome(game)
  return { game, pick: pickFor(game, outcome, 'yes') }
}

function buildPool(sport: V5Sport, league?: string): Row[] {
  const games = v5Games(sport)
    .filter((g) => !league || g.leagueName === league)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 24)
  if (!games.length) return []
  const rows: Row[] = []
  const n = Math.max(16, games.length)
  for (let i = 0; i < n; i++) {
    const user = ACTIVITY_USERS[i % ACTIVITY_USERS.length]!
    const crown = CROWNS[i % CROWNS.length]!
    const stake = STAKES[i % STAKES.length]!
    if (i % 3 === 2 && games.length > 2) {
      const size = 2 + (i % 3)
      const legs = Array.from({ length: size }, (_, k) => legFor(games[(i + k * 3) % games.length]!, i + k)).filter(
        (l, k, all) => all.findIndex((x) => x.game.id === l.game.id) === k,
      )
      if (legs.length > 1) {
        rows.push({ kind: 'combo', key: `c${i}`, user, crown, legs, stake: Math.round(stake / 4) })
        continue
      }
    }
    rows.push({ kind: 'single', key: `s${i}`, user, crown, leg: legFor(games[i % games.length]!, i), stake })
  }
  return rows
}

/** Graded wins — finished games from the /BA feed, mapped to this page's sport or league. */
function gradedPool(sport: V5Sport, league?: string): Row[] {
  const wins = filterPool('sports', 'graded', poolForVariant('sports')) as BaSportsRow[]
  const want = sport === 'all' ? null : GRADED_SPORT[sport]
  if (sport !== 'all' && !want) return []
  const leagueKey = league ? GRADED_LEAGUE[league] : undefined
  if (league && !leagueKey) return []
  return wins
    .filter((b) => (!want || b.sport === want) && (!leagueKey || b.league === leagueKey))
    .map((bet, i) => ({ kind: 'graded' as const, key: `g${i}`, user: bet.user, crown: bet.crown, bet }))
}

const legsOf = (row: Row): Leg[] => (row.kind === 'single' ? [row.leg] : row.kind === 'combo' ? row.legs : [])
const decimalOfRow = (row: Row) =>
  row.kind === 'graded' ? decimalOf(row.bet.odds.replace('−', '-')) : legsOf(row).reduce((d, l) => d * decimalOf(l.pick.odds), 1)

type Kind = 'all' | 'combos' | 'graded'

/** Width of the feed itself (it sits in the main column next to the rail, so viewport breakpoints lie). */
export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [w, setW] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(e!.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

export function SportsActivity({
  sport,
  league,
  titleSlot,
}: {
  sport: V5Sport
  league?: string
  /** Replaces the "Activity" heading (homepage: heading + Casino / Sports switch). */
  titleSlot?: ReactNode
}) {
  /* Scope — home: a sport; sport page: a league; league page: fixed. */
  const scopes = useMemo(() => {
    if (league) return []
    if (sport === 'all') {
      const ids: V5SportId[] = ['nfl', 'basketball', 'soccer', 'hockey', 'tennis', 'mma']
      return [{ id: 'all', label: 'All sports' }, ...ids.map((id) => ({ id, label: sportDef(id).label }))]
    }
    const top = v5Leagues(sport)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
    return top.length > 1 ? [{ id: 'all', label: 'All leagues' }, ...top.map((l) => ({ id: l.name, label: l.name }))] : []
  }, [sport, league])
  const [scope, setScope] = useState('all')
  const scopeSport: V5Sport = sport === 'all' && scope !== 'all' ? (scope as V5SportId) : sport
  const scopeLeague = league ?? (sport !== 'all' && scope !== 'all' ? scope : undefined)

  const open = useMemo(() => buildPool(scopeSport, scopeLeague), [scopeSport, scopeLeague])
  const graded = useMemo(() => gradedPool(scopeSport, scopeLeague), [scopeSport, scopeLeague])
  const kinds = useMemo(() => {
    const k: { id: Kind; label: string }[] = [{ id: 'all', label: 'All' }]
    if (open.some((r) => r.kind === 'combo')) k.push({ id: 'combos', label: 'Combos' })
    if (graded.length) k.push({ id: 'graded', label: 'Wins' })
    return k
  }, [open, graded])
  const [kind, setKind] = useState<Kind>('all')
  const activeKind = kinds.some((k) => k.id === kind) ? kind : 'all'

  const pool = useMemo(() => {
    const list = activeKind === 'graded' ? graded : activeKind === 'combos' ? open.filter((r) => r.kind === 'combo') : open
    /* Never an empty rail — repeat templates (PRD: padFeedPool). */
    if (!list.length) return list
    const out = [...list]
    for (let i = 0; out.length < VISIBLE * 2; i++) out.push(list[i % list.length]!)
    return out
  }, [activeKind, open, graded])

  const slip = useSoccerSlip()
  /* Plays by default; a mouse resting on the card pauses it (touch never does). */
  const [playing, setPlaying] = useState(true)
  const [hovered, setHovered] = useState(false)
  const live = playing && !hovered
  const seq = useRef(0)
  const seed = (p: Row[]) => p.slice(0, VISIBLE).map((r, i) => ({ ...r, id: `seed-${r.key}-${i}` }))
  const [rows, setRows] = useState<LiveRow[]>(() => seed(pool))
  const [boxRef, width] = useWidth<HTMLDivElement>()
  const showUser = width >= 560

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

  if (!open.length && !graded.length) return null

  /* Open bets → slip (a combo adds every leg); tap again to take them off. Graded wins: no tap. */
  const inSlip = (row: Row) => {
    const legs = legsOf(row)
    return legs.length > 0 && legs.every((l) => slip.some((p) => p.id === l.pick.id))
  }
  const add = (row: Row, el: HTMLElement) => {
    const legs = legsOf(row)
    if (!legs.length) return
    if (inSlip(row)) {
      const ids = new Set(legs.map((l) => l.pick.id))
      setSoccerSlip((prev) => prev.filter((p) => !ids.has(p.id)))
      return
    }
    let added = false
    setSoccerSlip((prev) =>
      legs.reduce((acc, l) => {
        if (acc.some((p) => p.id === l.pick.id)) return acc
        added = true
        return toggleLeg(acc, l.pick)
      }, prev),
    )
    if (added) {
      revealShellDock()
      flyBetDotToSlip(el, legs[0]!.pick.id)
    }
  }

  return (
    <section data-name="v5-sports-activity" aria-label="Activity" className="mb-10">
      {/* Title · kind switch · scope menu · play/pause — one tidy row, wraps on phones. */}
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-3">
        {titleSlot ? <div className="mr-auto">{titleSlot}</div> : <h2 className={cn(V5_HEADING, 'mr-auto')}>Activity</h2>}
        {kinds.length > 1 ? (
          <div role="tablist" aria-label="Bet type" className="inline-flex h-10 items-center rounded-full border border-border bg-card p-1">
            {kinds.map((k) => (
              <button
                key={k.id}
                type="button"
                role="tab"
                aria-selected={activeKind === k.id}
                onClick={() => setKind(k.id)}
                className={cn(
                  'h-8 rounded-full px-3.5 text-sm font-semibold transition-colors',
                  activeKind === k.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {k.label}
              </button>
            ))}
          </div>
        ) : null}
        {scopes.length ? <RadioMenu label="Filter" options={scopes} value={scope} onChange={setScope} /> : null}
        <PlayToggle live={playing} onToggle={() => setPlaying((v) => !v)} />
      </div>

      {/* One line per bet: what they backed, where, and the price — tap the price to copy it. */}
      <div
        ref={boxRef}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        className={cn(V5_CARD, 'overflow-hidden rounded-[14px]')}
      >
        <div className="relative overflow-hidden" style={{ height: `calc(${VISIBLE} * ${ROW_CSS})` }}>
          <AnimatePresence initial={false} mode="popLayout">
            {rows.map((row) => (
              <motion.div
                key={row.id}
                layout
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.25, ease: EASE, layout: { duration: 0.25, ease: EASE } }}
                className={cn('flex items-center gap-3 border-b border-border px-4 last:border-b-0', ROW_H)}
              >
                <RowIcon row={row} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold leading-5 text-foreground">{selectionText(row)}</span>
                  <EventLine row={row} />
                </span>
                {showUser ? (
                  <span className="w-28 shrink-0 text-right text-xs leading-4">
                    <span className="flex items-center justify-end gap-1 text-muted-foreground">
                      <CrownMark tone={row.crown} />
                      <span className="truncate">{row.user}</span>
                    </span>
                    <span className="block tabular-nums text-muted-foreground">
                      {row.kind === 'graded' ? row.bet.stake : fmtUsd(row.stake)} stake
                    </span>
                  </span>
                ) : null}
                {row.kind === 'graded' ? (
                  <span className="w-[84px] shrink-0 text-right">
                    <span className="block text-sm font-bold tabular-nums text-success">{row.bet.toWin}</span>
                    <span className="block text-xs text-muted-foreground">Won</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    aria-pressed={inSlip(row)}
                    aria-label={`${inSlip(row) ? 'Remove' : 'Copy'} bet: ${selectionText(row)} at ${fmtX(decimalOfRow(row))}`}
                    onClick={(e) => add(row, e.currentTarget)}
                    className={cn(
                      'inline-flex h-10 w-[84px] shrink-0 items-center justify-center rounded-lg border text-sm font-bold tabular-nums transition-colors',
                      inSlip(row)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-secondary text-foreground hover:bg-accent',
                    )}
                  >
                    {fmtX(decimalOfRow(row))}
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function selectionText(row: Row): string {
  if (row.kind === 'graded') return row.bet.selection
  if (row.kind === 'combo') return `${row.legs.length}-leg combo`
  return row.leg.pick.label
}

const matchup = (g: SportsMarket) => (isField(g) ? g.title.split(' · ')[0] ?? g.title : g.title)

/** League tile — the league's logo, or the combo mark for multi-game bets. */
function RowIcon({ row }: { row: Row }) {
  const tile = 'inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary'
  if (row.kind === 'combo')
    return (
      <span className={tile}>
        <ComboMark className="size-5" />
      </span>
    )
  if (row.kind === 'graded')
    return (
      <span className={tile}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={row.bet.homeLogo} alt="" className="size-6 object-contain" />
      </span>
    )
  const g = row.leg.game
  return (
    <span className={tile}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={leagueLogo(g.leagueName, g.leagueIcon)} alt="" className="size-6 object-contain" />
    </span>
  )
}

/** Live clock (or kickoff / Final) · game · league — one muted line. */
function EventLine({ row }: { row: Row }) {
  const cls = 'block truncate text-xs leading-4 text-muted-foreground'
  if (row.kind === 'graded') {
    const b = row.bet
    return (
      <span className={cls}>
        Final {b.score ? `${b.score[0]}–${b.score[1]}` : ''} · {b.home} vs {b.away}
      </span>
    )
  }
  if (row.kind === 'combo') {
    const liveLeg = row.legs.find((l) => l.game.live)
    return (
      <span className={cls}>
        {liveLeg ? <span className="font-semibold text-destructive">Live · </span> : null}
        {row.legs
          .map((l) => (isField(l.game) ? l.pick.label : l.pick.label.replace(/ to win$/, '')))
          .slice(0, 3)
          .join(' · ')}
        {row.legs.length > 3 ? ` +${row.legs.length - 3}` : ''}
      </span>
    )
  }
  const g = row.leg.game
  return (
    <span className={cls}>
      {g.live ? (
        <span className="font-semibold text-destructive">
          {g.when}
          {g.score ? ` ${g.score[0]}–${g.score[1]}` : ''} ·{' '}
        </span>
      ) : (
        `${g.when.split(',')[0]} · `
      )}
      {matchup(g)} · {g.leagueName}
    </span>
  )
}

export function CrownMark({ tone }: { tone: BaCrown }) {
  return (
    <ShellIcon
      name="crown"
      tone="token"
      className={cn(
        'size-3.5',
        tone === 'gold'
          ? 'text-[var(--brand-gaminggold-500)]'
          : tone === 'purple'
            ? 'text-[var(--brand-superpurple-500)]'
            : 'text-muted-foreground',
      )}
    />
  )
}

export function PlayToggle({ live, onToggle }: { live: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-label={live ? 'Pause live feed' : 'Resume live feed'}
      aria-pressed={live}
      onClick={onToggle}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent"
    >
      {live ? <IconPlayerPause className="size-4" stroke={2} /> : <IconPlayerPlay className="size-4" stroke={2} />}
    </button>
  )
}
