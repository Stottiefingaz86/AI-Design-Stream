'use client'

import { Children, createContext, isValidElement, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconCheck, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { LiveClock, useCardMotion } from '@/components/lumen/sports-home-page'
import { BoardTeamBadge, LIVE_ROW_STYLE, OddsButton } from '@/components/lumen/soccer-sport-page'
import { useShell } from '@/components/site/shell-context'
import { revealShellDock } from '@/components/site/shell-scroll'
import { setSoccerSlip, useSoccerSlip, withOneLegPerMarket } from '@/lib/lumen/soccer-slip-store'
import {
  sportMegaParlays,
  sportOddsBoosts,
  sportSgpPacks,
  sportsHomeMegaParlays,
  sportsHomeOddsBoosts,
  sportsHomeSgpPacks,
  type OddsBoost,
} from '@/lib/lumen/sports-home'
import type { SportsMarket } from '@/lib/lumen/sports-markets'
import {
  decimalToAmerican,
  eventLadders,
  featuredCombos,
  leadOutcome,
  pickFor,
  fmtX,
  decimalOf,
  kickoffTime,
  leagueLogo,
  teamOutcomes,
  toggleLeg,
  v5Games,
  type FeaturedCombo,
  type V5Sport,
} from '@/lib/lumen/v5-combos'
import { genBoostTitle, isGenerated, sportDef, type V5Game } from '@/lib/lumen/v5-sportsbook'
import { flyBetDotToSlip } from '@/lib/lumen/vip-celebrate'
import { cn } from '@/lib/utils'
import { BoostMark, ComboMark } from './combo-mark'
import { Crest, LeagueLink, LiveDot, V5_CARD, V5_HEADING, V5_LIGHT_UP, V5_NUM, fmtPctRound, fmtUsd, PendingVeil, V5_PRESS, usePending } from './combo-ui'


// ─── Shelf — casino shelf header (title · See All box · arrow boxes) + snap rail ───

/** Whether shelves bleed past the column's right edge — off when a rail sits beside them. */
export const ShelfBleed = createContext(true)

export const SHELF_BOX =
  'inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-border bg-secondary transition-colors hover:bg-muted disabled:opacity-45'

export function V5Shelf({
  title,
  onSeeAll,
  label,
  children,
  className,
  bleedRight: bleedProp,
  fill,
  minCard = 280,
}: {
  title: string
  onSeeAll?: () => void
  label?: string
  children: ReactNode
  className?: string
  /** Off when something sits to the right (builder slip) — the rail stops at the column edge. */
  bleedRight?: boolean
  /**
   * Cards per row on a wide column. Cards size to the column so the row always ends flush —
   * fewer items than slots just get wider cards, and the arrows only show when there is more.
   */
  fill?: number
  /** Smallest card width before a shelf drops a column. */
  minCard?: number
}) {
  const bleedCtx = useContext(ShelfBleed)
  const bleedRight = bleedProp ?? bleedCtx
  const sectionRef = useRef<HTMLElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ back: false, more: false })
  const [colW, setColW] = useState(0)
  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    setEdge({ back: el.scrollLeft > 4, more: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 })
    if (sectionRef.current) setColW(sectionRef.current.clientWidth)
  }, [])
  useLayoutEffect(() => {
    measure()
    const el = ref.current
    const sec = sectionRef.current
    if (!el || !sec) return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    ro.observe(sec)
    return () => ro.disconnect()
  }, [measure, children])
  const items = Children.toArray(children)
  let n = 0
  if (fill && colW) {
    const fit = Math.max(1, Math.min(fill, Math.floor((colW + 12) / (minCard + 12))))
    n = fit === 1 && items.length > 1 ? 1.15 : Math.min(fit, items.length)
  }
  const cardW = n ? (colW - 12 * (Math.ceil(n) - 1)) / n : undefined
  const by = (d: 1 | -1) => {
    const el = ref.current
    if (!el) return
    const card = el.querySelector<HTMLElement>(':scope > *')
    el.scrollBy({ left: d * (card ? card.offsetWidth + 12 : el.clientWidth * 0.8), behavior: 'smooth' })
  }
  const scrolls = edge.back || edge.more
  /* Column-edge shelves fade out instead of clipping a card in half. */
  const fade = `linear-gradient(to right, ${edge.back ? 'transparent 0, black 56px' : 'black 0'}, ${
    edge.more ? 'black calc(100% - 88px), transparent 100%' : 'black 100%'
  })`
  return (
    <section ref={sectionRef} className={cn('mb-10', className)}>
      <header className="mb-3 flex h-9 items-center justify-between gap-4">
        <h2 className={cn(V5_HEADING, 'min-w-0 truncate')}>{title}</h2>
        <div className="flex shrink-0 items-center gap-2">
          {onSeeAll ? (
            <button type="button" onClick={onSeeAll} className={cn(SHELF_BOX, 'px-3 text-xs font-medium text-muted-foreground hover:text-foreground')}>
              See All
            </button>
          ) : null}
          {scrolls ? (
            <div className="hidden items-center gap-2 md:flex">
              <button type="button" aria-label={`Scroll ${title} back`} disabled={!edge.back} onClick={() => by(-1)} className={cn(SHELF_BOX, 'size-9 p-0 text-foreground')}>
                <IconChevronLeft className="size-4" stroke={2} />
              </button>
              <button type="button" aria-label={`Scroll ${title} forward`} disabled={!edge.more} onClick={() => by(1)} className={cn(SHELF_BOX, 'size-9 p-0 text-foreground')}>
                <IconChevronRight className="size-4" stroke={2} />
              </button>
            </div>
          ) : null}
        </div>
      </header>
      <div
        className={bleedRight ? '-mx-4 md:-mx-6' : '-ml-4 overflow-hidden md:-ml-6'}
        style={bleedRight || !scrolls ? undefined : { maskImage: fade, WebkitMaskImage: fade }}
      >
        <div
          ref={ref}
          onScroll={measure}
          aria-label={label ?? title}
          className={cn(
            'scrollbar-hide -my-2 flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-px-4 px-4 py-2 md:scroll-px-6 md:px-6 [&>*]:snap-start',
            !bleedRight && 'pr-0 md:pr-0',
          )}
        >
          {fill
            ? items.map((child, i) => (
                <div
                  key={isValidElement(child) && child.key != null ? child.key : i}
                  className="flex shrink-0 [&>*]:!w-full [&>*]:min-w-0"
                  style={cardW ? { width: cardW } : undefined}
                >
                  {child}
                </div>
              ))
            : children}
        </div>
      </div>
    </section>
  )
}

// ─── Popular — live and big games, grouped by league ───────────

/** Popular carousel — league groups ("NFL · 3 of 8"), live cards show the score, the rest show chances. */
export function PopularCarousel({ sport, title = 'Popular' }: { sport: V5Sport; title?: string }) {
  const router = useRouter()
  const { startNavigating } = useShell()
  const groups = useMemo(() => {
    /* Races list every runner — they live on their own cards, not in the two-team Popular tiles. */
    const all = v5Games(sport).filter((g) => !(isGenerated(g) && g.field))
    const map = new Map<string, SportsMarket[]>()
    for (const g of all) map.set(g.leagueName, [...(map.get(g.leagueName) ?? []), g])
    return [...map.entries()]
      .map(([league, games]) => ({
        league,
        total: games.length,
        games: [...games].sort((a, b) => Number(b.live) - Number(a.live) || b.volume - a.volume).slice(0, 3),
        live: games.some((g) => g.live),
      }))
      .sort((a, b) => Number(b.live) - Number(a.live))
  }, [sport])
  if (!groups.length) return null
  const go = (href: string) => {
    startNavigating(href)
    router.push(href)
  }
  return (
    <V5Shelf title={title}>
          {groups.map((grp) => (
            <div key={grp.league} className="flex shrink-0 flex-col">
              <p className="mb-2 flex items-baseline gap-2 px-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                <span className="text-foreground">{grp.league}</span>
                <span>
                  {grp.games.length} of {grp.total}
                </span>
              </p>
              <div className="flex gap-3">
                {grp.games.map((g) => (
                  <PopularCard key={g.id} game={g} onOpen={() => go(g.href)} />
                ))}
              </div>
            </div>
          ))}
    </V5Shelf>
  )
}

function PopularCard({ game, onOpen }: { game: SportsMarket; onOpen: () => void }) {
  const teams = teamOutcomes(game)
  const [pending, startPending] = usePending()
  return (
    <button
      type="button"
      onClick={() => {
        startPending()
        onOpen()
      }}
      style={game.live ? LIVE_ROW_STYLE : undefined}
      className={cn(V5_CARD, V5_LIGHT_UP, V5_PRESS, 'relative flex h-[132px] w-[264px] shrink-0 flex-col gap-2.5 p-4 text-left')}
    >
      <PendingVeil on={pending} />
      {game.live ? (
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground">
          <LiveDot /> Live <span className="font-semibold normal-case tracking-normal text-muted-foreground">· {game.when}</span>
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">
          {game.when.split(',')[0]} · {kickoffTime(game)}
        </span>
      )}
      {teams.map((o, i) => (
        <span key={o.id} className="flex items-center gap-2.5">
          <Crest name={o.team ?? o.label} />
          <span className="min-w-0 flex-1 truncate text-[15px] font-bold tracking-tight text-foreground">
            {o.label}
          </span>
          {game.live && game.score ? (
            <span className={cn('inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-border px-2 text-sm', V5_NUM)}>
              {game.score[i]}
            </span>
          ) : (
            <span className={cn('text-[15px]', V5_NUM)}>{fmtPctRound(o.chance)}</span>
          )}
        </span>
      ))}
    </button>
  )
}

// ─── Odds Boosts — V1 boost cards ──────────────────────────────

export function BoostsShelf({
  sport,
  title = 'Odds Boosts',
  onSeeAll,
  fill = 3,
}: {
  sport: V5Sport
  title?: string
  onSeeAll?: () => void
  fill?: number
}) {
  const boosts = useMemo<OddsBoost[]>(() => boostsFor(sport), [sport])
  const cards = useBoostCards(boosts)
  if (!boosts.length) return null
  return (
    <V5Shelf title={title} onSeeAll={onSeeAll} fill={fill}>
      {cards}
    </V5Shelf>
  )
}

export function BoostsGrid({ sport }: { sport: V5Sport }) {
  const boosts = useMemo<OddsBoost[]>(() => boostsFor(sport), [sport])
  const cards = useBoostCards(boosts)
  if (!boosts.length) return <p className="py-16 text-center text-sm text-muted-foreground">No Odds Boosts right now.</p>
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 [&>*]:!w-full">{cards}</div>
}

/** V1 boosts for Football / Soccer, generated ones for every other sport (home gets a mix). */
/* V1 boost copy names real players — V5 demos only use invented athletes. */
const INVENTED: [RegExp, string][] = [
  [/Erling Haaland/g, 'Nils Brekke'],
  [/Kenneth Walker III/g, 'Darnell Pike'],
  [/Josh Allen/g, 'Cole Brandt'],
]
function noRealNames(b: OddsBoost): OddsBoost {
  const fix = (t: string) => INVENTED.reduce((s, [re, to]) => s.replace(re, to), t)
  return { ...b, title: fix(b.title), pick: { ...b.pick, label: fix(b.pick.label) } }
}

function boostsFor(sport: V5Sport): OddsBoost[] {
  if (sport === 'nfl' || sport === 'soccer') return sportOddsBoosts(sport).map(noRealNames)
  const gen = (games: SportsMarket[]) =>
    games
      .filter((g): g is V5Game => isGenerated(g))
      .slice(0, 6)
      .map((g): OddsBoost => {
        const { title, was, boosted } = genBoostTitle(g)
        const sides = g.outcomes.filter((o) => o.label !== 'Draw')
        return {
          id: `boost-${g.id}`,
          sport: g.sport,
          leagueName: g.leagueName,
          leagueIcon: g.leagueIcon,
          when: g.when,
          live: g.live,
          teams: [sides[0]?.label ?? '', sides[1]?.label ?? ''],
          eventHref: g.href,
          title,
          was: `+${was}`,
          boosted: `+${boosted}`,
          pick: {
            id: `boost-${g.id}`,
            label: title,
            odds: `+${boosted}`,
            eventLabel: g.eventLabel,
            market: 'Odds Boost',
            eventId: g.eventId,
            eventHref: g.href,
            sport: g.sport,
            live: g.live,
            outright: true,
          },
        }
      })
  if (sport === 'all') {
    const picks = ['basketball', 'hockey', 'tennis', 'mma'] as const
    return [...sportsHomeOddsBoosts().map(noRealNames), ...picks.flatMap((id) => gen(v5Games(id).filter((g) => !g.live)).slice(0, 1))]
  }
  return gen(v5Games(sport))
}

function useBoostCards(boosts: OddsBoost[]) {
  const router = useRouter()
  const { startNavigating } = useShell()
  const picks = useSoccerSlip()
  const selected = useMemo(() => new Set(picks.map((p) => p.id)), [picks])
  return boosts.map((boost) => (
    <V5BoostCard
      key={boost.id}
      boost={boost}
      selected={selected.has(boost.pick.id)}
      onAdd={(el) => {
        if (selected.has(boost.pick.id)) {
          setSoccerSlip((prev) => prev.filter((p) => p.id !== boost.pick.id))
          return
        }
        /* Boosts stay straight — same rule as V1. */
        setSoccerSlip((prev) => (boost.pick.outright ? [boost.pick, ...prev] : withOneLegPerMarket(prev, boost.pick)))
        revealShellDock()
        flyBetDotToSlip(el ?? null, boost.pick.id)
      }}
      onOpen={() => {
        startNavigating(boost.eventHref)
        router.push(boost.eventHref)
      }}
    />
  ))
}

/** V1 boost card layout — neutral rocket (no red icons), was → boosted. */
function V5BoostCard({
  boost,
  selected,
  onAdd,
  onOpen,
}: {
  boost: OddsBoost
  selected: boolean
  onAdd: (el?: HTMLElement | null) => void
  onOpen: () => void
}) {
  const motionProps = useCardMotion()
  return (
    <motion.article
      data-name="v5-boost-card"
      {...motionProps}
      style={boost.live ? LIVE_ROW_STYLE : undefined}
      className={cn(V5_CARD, 'relative z-0 flex w-[min(320px,85vw)] shrink-0 flex-col overflow-hidden motion-reduce:!transform-none')}
    >
      <div className="flex flex-col gap-2.5 p-3">
        <div className="flex items-center gap-2">
          <LeagueLink
            sport={boost.sport}
            league={boost.leagueName}
            className="flex min-w-0 flex-1 items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={leagueLogo(boost.leagueName, boost.leagueIcon)} alt="" className="size-4 object-contain" />
            <span className="min-w-0 truncate">{boost.leagueName}</span>
          </LeagueLink>
          {boost.live ? <LiveClock when={boost.when} /> : <span className="text-xs text-muted-foreground">{boost.when}</span>}
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2.5 text-left transition-colors hover:bg-accent"
        >
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            {boost.teams.map((t) => (
              <span key={t} className="flex min-w-0 items-center gap-2">
                <BoardTeamBadge name={t} />
                <span className="truncate text-sm font-semibold text-foreground">{t}</span>
              </span>
            ))}
          </span>
          <IconChevronRight className="size-4 shrink-0 text-muted-foreground" stroke={1.75} />
        </button>
      </div>
      <div className="flex flex-1 items-start gap-2 px-4 pb-4 pt-1">
        <BoostMark className="mt-0.5 size-5" />
        <p className="text-sm font-semibold leading-5 text-foreground">{boost.title}</p>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2 border-t border-border p-3">
        <div className="flex h-12 flex-col items-center justify-center gap-0.5 rounded-lg border border-border px-2 text-center">
          <span className="text-[10px] font-medium leading-3.5 text-muted-foreground">Was</span>
          <span className="text-sm font-semibold tabular-nums leading-5 text-muted-foreground line-through">{boost.was}</span>
        </div>
        <OddsButton
          pick={{ id: boost.id, label: 'Boosted', odds: boost.boosted }}
          selected={selected}
          onSelect={(_, el) => onAdd(el)}
          className="h-12 w-full"
        />
      </div>
    </motion.article>
  )
}

// ─── Popular combos — SGP-style cards ──────────────────────────

/** Ready-made combo in the V1 SGP card style — leg timeline, one chip adds every leg. */
export function ComboPackCard({
  combo,
  fluid = false,
  kind = 'combo',
}: {
  combo: FeaturedCombo
  fluid?: boolean
  /** Chip copy — "5-leg combo", "3-leg same game combo", "6-leg mega combo". */
  kind?: 'combo' | 'same game combo' | 'mega combo'
}) {
  const motionProps = useCardMotion()
  const picks = useSoccerSlip()
  const selected = combo.legs.every((l) => picks.some((p) => p.id === l.id))
  const add = () =>
    setSoccerSlip((prev) => {
      if (selected) return prev.filter((p) => !combo.legs.some((l) => l.id === p.id))
      return combo.legs.reduce((acc, leg) => (acc.some((p) => p.id === leg.id) ? acc : toggleLeg(acc, leg)), prev)
    })
  return (
    <motion.article
      data-name="v5-combo-pack"
      {...motionProps}
      className={cn(
        V5_CARD,
        'relative z-0 flex shrink-0 flex-col overflow-hidden motion-reduce:!transform-none',
        fluid ? 'w-full' : 'w-[min(320px,85vw)]',
      )}
    >
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <ComboMark className="size-5" />
        <p className="min-w-0 flex-1 truncate text-base font-bold tracking-tight text-foreground">{combo.title}</p>
        <span className="shrink-0 text-xs text-muted-foreground">{combo.bettors.toLocaleString('en-US')} on this</span>
      </div>
      <ol className="flex flex-col px-4 py-3">
        {combo.legs.map((leg, i) => {
          const last = i === combo.legs.length - 1
          return (
            <li key={leg.id} className={cn('relative flex gap-3', !last && 'pb-3')}>
              {!last ? <span className="absolute bottom-0 left-[7.5px] top-5 w-px bg-border" aria-hidden /> : null}
              <span
                className={cn(
                  'relative mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full transition-colors',
                  selected ? 'bg-primary' : 'border-2 border-muted-foreground bg-card',
                )}
                aria-hidden
              >
                {selected ? <IconCheck className="size-2.5 text-primary-foreground" stroke={3.5} /> : null}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold leading-5 text-foreground">{'display' in leg ? String((leg as { display: string }).display) : leg.label}</div>
                <div className="truncate text-xs leading-4 text-muted-foreground">{leg.eventLabel}</div>
              </div>
              <span className="shrink-0 text-xs leading-5 tabular-nums text-muted-foreground">{fmtX(decimalOf(leg.odds))}</span>
            </li>
          )
        })}
      </ol>
      <div className="mt-auto border-t border-border p-3">
        <OddsButton
          pick={{
            id: combo.id,
            label: selected ? 'Added to Betslip' : `${combo.legs.length}-leg ${kind} · $10 pays ${fmtUsd(10 * combo.decimal, 0)}`,
            odds: decimalToAmerican(combo.decimal),
          }}
          selected={selected}
          onSelect={() => add()}
          className="h-12 w-full"
        />
      </div>
    </motion.article>
  )
}

export function CombosShelf({
  sport,
  onSeeAll,
  lead,
  bleedRight,
  fill = 3,
}: {
  sport: V5Sport
  onSeeAll?: () => void
  /** First card — Build your own. */
  lead?: ReactNode
  bleedRight?: boolean
  fill?: number
}) {
  const combos = featuredCombos(sport)
  if (!combos.length) return null
  return (
    <V5Shelf title="Popular Combos" onSeeAll={onSeeAll} fill={fill} bleedRight={bleedRight}>
      {lead}
      {combos.map((c) => (
        <ComboPackCard key={c.id} combo={c} />
      ))}
    </V5Shelf>
  )
}

// ─── Same Game Combos + Mega Combos (V1 SGP packs / mega parlays, V5 names) ───

function pseudo(id: string, lo: number, hi: number): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.round(lo + (((h >>> 0) % 1000) / 1000) * (hi - lo))
}

/** Same-game packs as combos — every leg on one game. */
export function sameGameCombos(sport: V5Sport): FeaturedCombo[] {
  const v1 = (s: 'soccer' | 'nfl' | 'all') =>
    (s === 'all' ? sportsHomeSgpPacks() : sportSgpPacks(s)).map((p) => ({
      id: p.id,
      title: p.eventLabel,
      league: p.leagueName,
      leagueLogo: leagueLogo(p.leagueName, p.leagueIcon),
      legs: p.legs,
      decimal: decimalOf(p.odds),
      volume: pseudo(p.id, 120_000, 900_000),
      bettors: pseudo(`${p.id}-b`, 140, 1_800),
    }))
  if (sport === 'all') return [...v1('all'), ...genSameGame('basketball', 1), ...genSameGame('hockey', 1)]
  if (sport === 'nfl' || sport === 'soccer') return [...v1(sport), ...(sport === 'soccer' ? genSameGame('soccer', 2) : [])]
  return genSameGame(sport, 4)
}

/** Generated same-game combos — winner, the main total and a line, all on one game. */
function genSameGame(sport: Exclude<V5Sport, 'all'>, n: number): FeaturedCombo[] {
  return v5Games(sport)
    .filter((g): g is V5Game => isGenerated(g) && !g.field && !g.live)
    .slice(0, n)
    .map((g) => {
      const lead = leadOutcome(g)
      const win = pickFor(g, lead.label === 'Draw' ? g.outcomes[0]! : lead, 'yes')
      const ladders = eventLadders(g)
      const total = ladders.find((l) => l.kind === 'total')
      const spread = ladders.find((l) => l.kind === 'spread')
      const legs = [
        { ...win, label: `${win.label}` },
        ...(total ? [total.rungs[total.defaultIndex]!.yes] : []),
        ...(spread ? [spread.rungs[Math.max(0, spread.defaultIndex - 1)]!.yes] : []),
      ]
      return {
        id: `sgc-${g.id}`,
        title: g.title,
        league: g.leagueName,
        leagueLogo: leagueLogo(g.leagueName, g.leagueIcon),
        legs,
        decimal: legs.reduce((a, l) => a * decimalOf(l.odds), 1) * 0.82 + 0.18,
        volume: pseudo(g.id, 90_000, 700_000),
        bettors: pseudo(`${g.id}-b`, 90, 1_400),
      }
    })
}

/** Mega combos — big multi-game tickets. */
export function megaCombos(sport: V5Sport): FeaturedCombo[] {
  const v1 = (s: 'soccer' | 'nfl' | 'all') =>
    (s === 'all' ? sportsHomeMegaParlays() : sportMegaParlays(s)).map((m) => ({
      id: m.id,
      title: m.title,
      league: m.sport === 'nfl' ? 'NFL' : 'Premier League',
      leagueLogo: leagueLogo(m.sport === 'nfl' ? 'NFL' : 'Premier League'),
      legs: m.legs,
      decimal: decimalOf(m.odds),
      volume: pseudo(m.id, 300_000, 2_400_000),
      bettors: pseudo(`${m.id}-b`, 400, 4_200),
    }))
  if (sport === 'all') return [...v1('all'), ...genMega('basketball')]
  if (sport === 'nfl' || sport === 'soccer') return v1(sport)
  return [genMega(sport), genMega(sport, true)].flat()
}

function genMega(sport: Exclude<V5Sport, 'all'>, dogs = false): FeaturedCombo[] {
  const games = v5Games(sport).filter((g) => !g.live && !(isGenerated(g) && g.field)).slice(dogs ? 1 : 0)
  if (games.length < 4) return []
  const legs = games.slice(0, 6).map((g) => {
    const sides = g.outcomes.filter((o) => o.label !== 'Draw')
    const pick = dogs ? sides.reduce((a, b) => (b.chance < a.chance ? b : a)) : sides.reduce((a, b) => (b.chance > a.chance ? b : a))
    return pickFor(g, pick, 'yes')
  })
  const label = sportDef(sport).label
  const id = `mega-${sport}-${dogs ? 'dogs' : 'favs'}`
  return [
    {
      id,
      title: dogs ? `${label} long shots` : `${label} mega`,
      league: games[0]!.leagueName,
      leagueLogo: leagueLogo(games[0]!.leagueName, games[0]!.leagueIcon),
      legs,
      decimal: legs.reduce((a, l) => a * decimalOf(l.odds), 1),
      volume: pseudo(id, 200_000, 1_600_000),
      bettors: pseudo(`${id}-b`, 300, 3_000),
    },
  ]
}

export function SameGameCombosShelf({ sport, onSeeAll }: { sport: V5Sport; onSeeAll?: () => void }) {
  const combos = sameGameCombos(sport)
  if (!combos.length) return null
  return (
    <V5Shelf title="Same Game Combos" onSeeAll={onSeeAll} fill={3}>
      {combos.map((c) => (
        <ComboPackCard key={c.id} combo={c} kind="same game combo" />
      ))}
    </V5Shelf>
  )
}

export function MegaCombosShelf({ sport, onSeeAll }: { sport: V5Sport; onSeeAll?: () => void }) {
  const combos = megaCombos(sport)
  if (!combos.length) return null
  return (
    <V5Shelf title="Mega Combos" onSeeAll={onSeeAll} fill={3}>
      {combos.map((c) => (
        <ComboPackCard key={c.id} combo={c} kind="mega combo" />
      ))}
    </V5Shelf>
  )
}
