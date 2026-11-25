'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { IconArrowRight, IconChevronRight, IconFlame, IconStack2, IconUsers } from '@tabler/icons-react'
import { setSoccerSlip, useSoccerSlip } from '@/lib/lumen/soccer-slip-store'
import type { SportsMarket } from '@/lib/lumen/sports-markets'
import {
  bettorsNow,
  featuredCombos,
  fmtX,
  groupByDay,
  kickoffTime,
  leadOutcome,
  leagueLogo,
  openComboBuilder,
  pickFor,
  teamOutcomes,
  teamRecord,
  toggleLeg,
  v5Games,
  v5Leagues,
  yesCents,
  type V5Sport,
} from '@/lib/lumen/v5-combos'
import { cn } from '@/lib/utils'
import { ComboBuilderOverlay, FeaturedComboCard } from './combo-builder'
import { ComboDock, ComboSlip } from './combo-slip'
import {
  ChancePill,
  ComboButton,
  ComboGlow,
  Crest,
  LeagueTile,
  LiveDot,
  ProbBar,
  V5_CARD,
  fmtUsd,
  fmtVol,
} from './combo-ui'
import { LiveBetsFeed } from './live-bets-feed'

const TITLES: Record<V5Sport, string> = { all: 'Sports', nfl: 'Football', soccer: 'Soccer' }

/**
 * V5 · Combos lobby — prediction-market layout: games grouped by day, chance pills,
 * multipliers and probability bars, the combo slip always on the right.
 */
export function ComboSportsPage({ sport = 'all' }: { sport?: V5Sport }) {
  const [filter, setFilter] = useState<string>('trending')
  const picks = useSoccerSlip()
  const selected = useMemo(() => new Set(picks.map((p) => p.id)), [picks])
  const all = v5Games(sport)
  const leagues = v5Leagues(sport)
  const liveCount = all.filter((g) => g.live).length

  const games = useMemo(() => {
    if (filter === 'trending') return [...all].sort((a, b) => Number(b.live) - Number(a.live) || b.volume - a.volume)
    if (filter === 'live') return all.filter((g) => g.live)
    if (filter === 'nfl' || filter === 'soccer') return all.filter((g) => g.sport === filter)
    return all.filter((g) => g.leagueName === filter)
  }, [all, filter])

  const groups = filter === 'trending' ? [{ label: 'Trending', games: games.slice(0, 8) }, ...groupByDay(games.slice(8))] : groupByDay(games)
  const combos = featuredCombos(sport)

  const chips: { id: string; label: string; logo?: string }[] = [
    { id: 'trending', label: 'Trending' },
    ...(liveCount ? [{ id: 'live', label: `Live · ${liveCount}` }] : []),
    ...(sport === 'all'
      ? [
          { id: 'nfl', label: 'Football' },
          { id: 'soccer', label: 'Soccer' },
        ]
      : []),
    ...leagues.map((l) => ({ id: l.name, label: l.name, logo: l.logo })),
  ]

  return (
    <div data-name="v5-combo-sports" className="px-4 pb-32 pt-4 md:px-6 lg:pb-12">
      {/* Title row */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">{TITLES[sport]}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            {liveCount ? (
              <>
                <LiveDot /> <span className="font-semibold text-foreground">{liveCount} live</span> ·
              </>
            ) : null}
            {all.length} games · tap a % to pick, stack picks into a combo
          </p>
        </div>
        <ComboButton onClick={() => openComboBuilder(sport)} className="hidden md:block" />
      </div>

      {/* Combo hero */}
      <ComboHero sport={sport} />

      {/* Filter chips */}
      <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:-mx-6 md:px-6">
        {chips.map((c) => {
          const on = filter === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilter(c.id)}
              className={cn(
                'inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition-colors',
                on
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              {c.logo ? <img src={c.logo} alt="" className="size-4 object-contain" /> : null}
              {c.id === 'live' ? <LiveDot /> : null}
              {c.label}
            </button>
          )
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {/* Popular combos */}
          {combos.length ? (
            <section className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                  <IconFlame className="size-5 text-[var(--brand-superorange-500)]" stroke={2} aria-hidden />
                  Popular combos
                </h2>
                <button
                  type="button"
                  onClick={() => openComboBuilder(sport)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
                >
                  Build your own <IconChevronRight className="size-4" stroke={2} />
                </button>
              </div>
              <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:-mx-6 md:px-6">
                {combos.map((c) => (
                  <FeaturedComboCard key={c.id} combo={c} />
                ))}
              </div>
            </section>
          ) : null}

          {groups.map((group) =>
            group.games.length ? (
              <section key={group.label} className="mb-8">
                <h2 className="mb-3 flex items-center gap-2 text-2xl font-black tracking-tight text-foreground">
                  {group.label === 'Live now' ? <LiveDot className="size-2.5" /> : null}
                  {group.label}
                </h2>
                <div className="grid gap-3 xl:grid-cols-2">
                  {group.games.map((g) => (
                    <GameCard key={g.id} game={g} selected={selected} />
                  ))}
                </div>
              </section>
            ) : null,
          )}
          {games.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Nothing here right now.</p>
          ) : null}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-[164px] flex max-h-[calc(100vh-180px)] flex-col gap-4 overflow-y-auto pb-2 [scrollbar-width:none]">
            <ComboButton onClick={() => openComboBuilder(sport)} className="w-full" />
            <ComboSlip />
            <LiveBetsFeed games={all.filter((g) => g.live).concat(all).slice(0, 6)} title="Live bets" compact />
          </div>
        </aside>
      </div>

      <div className="mt-2 lg:hidden">
        <LiveBetsFeed games={all.filter((g) => g.live).concat(all).slice(0, 6)} title="Live bets" compact />
      </div>

      <ComboDock />
      <ComboBuilderOverlay />
    </div>
  )
}

/** Big glowing entry into the builder — sample legs drift past like a ticker. */
function ComboHero({ sport }: { sport: V5Sport }) {
  const best = featuredCombos(sport)[0]
  const legs = featuredCombos(sport).flatMap((c) => c.legs).slice(0, 10)
  return (
    <ComboGlow className="mt-5" innerClassName="overflow-hidden">
      <button
        type="button"
        onClick={() => openComboBuilder(sport)}
        className="grid w-full gap-4 p-5 text-left md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-6"
      >
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <IconStack2 className="size-4" stroke={2} aria-hidden /> Combo builder
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight text-foreground md:text-3xl">
            Stack your picks.{' '}
            {best ? (
              <>
                $10 could pay <span className="text-success">{fmtUsd(10 * best.decimal, 0)}</span>
              </>
            ) : null}
          </p>
          <div className="relative mt-4 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
            <motion.div
              className="flex w-max gap-2"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
            >
              {[...legs, ...legs].map((l, i) => (
                <span
                  key={`${l.id}-${i}`}
                  className="inline-flex h-8 shrink-0 items-center gap-2 rounded-full border border-border bg-secondary px-3 text-xs font-semibold text-foreground"
                >
                  {l.label}
                  <span className="text-muted-foreground">{fmtX(decimalFromOdds(l.odds))}</span>
                </span>
              ))}
            </motion.div>
          </div>
        </div>
        <span className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-bold text-background">
          Open combo builder <IconArrowRight className="size-4" stroke={2.25} aria-hidden />
        </span>
      </button>
    </ComboGlow>
  )
}

function decimalFromOdds(odds: string): number {
  const n = Number.parseFloat(odds.replace(/^\+/, ''))
  if (!Number.isFinite(n)) return 0
  return n > 0 ? 1 + n / 100 : 1 + 100 / Math.abs(n)
}

/** Lobby game card — the exchange's game row: crest · name + chance bar · multiplier · % pill. */
function GameCard({ game, selected }: { game: SportsMarket; selected: Set<string> }) {
  const router = useRouter()
  const lead = leadOutcome(game)
  const draw = game.outcomes.find((o) => o.label === 'Draw')
  const toggle = (o: (typeof game.outcomes)[number]) =>
    setSoccerSlip((prev) => toggleLeg(prev, pickFor(game, o, 'yes')))
  return (
    <motion.div
      layout
      onClick={() => router.push(game.href)}
      className={cn(V5_CARD, 'group cursor-pointer p-4 transition-colors hover:border-muted-foreground md:p-5')}
    >
      <div className="flex items-start gap-3">
        <LeagueTile src={leagueLogo(game.leagueName, game.leagueIcon)} />
        <div className="min-w-0 flex-1">
          <Link
            href={game.href}
            onClick={(e) => e.stopPropagation()}
            className="block truncate text-base font-bold text-foreground group-hover:underline"
          >
            {game.title}
          </Link>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {game.live ? (
              <>
                <LiveDot />
                <span className="font-semibold text-[var(--live)]">{game.when}</span>
              </>
            ) : (
              <span>
                {game.when.split(',')[0]} @ {kickoffTime(game)}
              </span>
            )}
            <span>· {game.leagueName}</span>
          </p>
        </div>
        {game.live && game.score ? (
          <span className="shrink-0 rounded-lg bg-secondary px-2.5 py-1 text-sm font-black tabular-nums text-foreground">
            {game.score.join(' – ')}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {teamOutcomes(game).map((o) => {
          const pick = pickFor(game, o, 'yes')
          const record = teamRecord(game, o)
          return (
            <div key={o.id} className="flex items-center gap-3">
              <Crest name={o.team ?? o.label} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {o.label}
                  {record ? <span className="ml-1.5 font-normal text-muted-foreground">({record})</span> : null}
                </p>
                <ProbBar value={o.chance} lead={o.id === lead.id} className="mt-1.5 max-w-[220px]" />
              </div>
              <span className="w-12 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                {(100 / yesCents(o.chance)).toFixed(2)}x
              </span>
              <ChancePill chance={o.chance} selected={selected.has(pick.id)} onClick={() => toggle(o)} />
            </div>
          )
        })}
        {draw ? (
          <div className="flex items-center gap-3">
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-muted-foreground">
              X
            </span>
            <p className="min-w-0 flex-1 text-sm font-semibold text-muted-foreground">Draw</p>
            <span className="w-12 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
              {(100 / yesCents(draw.chance)).toFixed(2)}x
            </span>
            <ChancePill
              chance={draw.chance}
              selected={selected.has(pickFor(game, draw, 'yes').id)}
              onClick={() => toggle(draw)}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span>{fmtVol(game.volume)}</span>
        <span className="flex items-center gap-1">
          <IconUsers className="size-3.5" stroke={2} aria-hidden />
          {bettorsNow(game)} betting now
        </span>
        <span className="hidden items-center gap-0.5 font-semibold text-foreground sm:inline-flex">
          All markets <IconChevronRight className="size-3.5" stroke={2} />
        </span>
      </div>
    </motion.div>
  )
}
