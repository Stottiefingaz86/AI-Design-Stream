'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import NumberFlow from '@number-flow/react'
import { motion } from 'framer-motion'
import { IconChevronLeft, IconChevronRight, IconShare3, IconStack2, IconUsers } from '@tabler/icons-react'
import { LineChart, RangeTabs, ChangeChip } from '@/components/lumen/markets/market-ui'
import { setSoccerSlip, useSoccerSlip } from '@/lib/lumen/soccer-slip-store'
import {
  CHART_RANGES,
  marketEvent,
  marketSeries,
  type ChartRange,
  type MarketSport,
  type SportsMarket,
} from '@/lib/lumen/sports-markets'
import {
  bettorsNow,
  eventLadders,
  kickoffTime,
  leadOutcome,
  leagueLogo,
  noCents,
  openComboBuilder,
  pickFor,
  teamOutcomes,
  teamRecord,
  toggleLeg,
  v5Games,
  yesCents,
  type Ladder,
} from '@/lib/lumen/v5-combos'
import { cn } from '@/lib/utils'
import { ComboBuilderOverlay } from './combo-builder'
import { ComboDock, ComboSlip } from './combo-slip'
import { ComboButton, Crest, LeagueTile, LiveDot, V5_CARD, YesNoButton, fmtPctRound } from './combo-ui'
import { LiveBetsFeed } from './live-bets-feed'

/** V5 event colours — Lumen chart tokens per side (draw stays muted). */
const SIDE_COLOR = ['var(--chart-1)', 'var(--chart-2)', 'var(--muted-foreground)']

/**
 * V5 · Combos event view — chart hero, who-wins rows with Yes ¢ / No ¢, spread and
 * total steppers, and people placing bets in real time beside the combo slip.
 */
export function ComboEventPage({ sport, eventId }: { sport: MarketSport; eventId: string }) {
  const ev = marketEvent(sport, eventId)
  const picks = useSoccerSlip()
  const selected = useMemo(() => new Set(picks.map((p) => p.id)), [picks])
  const [range, setRange] = useState<ChartRange>('1W')
  const [extraVolume, setExtraVolume] = useState(0)

  if (!ev) {
    return (
      <div className="px-4 py-16 text-center md:px-6">
        <p className="text-lg font-semibold text-foreground">This game is no longer available</p>
        <Link href="/sports" className="mt-3 inline-block text-sm font-semibold text-muted-foreground hover:text-foreground">
          Back to sports
        </Link>
      </div>
    )
  }

  const game = ev.game
  const sides = teamOutcomes(game)
  const lead = leadOutcome(game)
  const colorOf = (id: string) => {
    const i = game.outcomes.findIndex((o) => o.id === id)
    const o = game.outcomes[i]
    return o?.label === 'Draw' ? SIDE_COLOR[2]! : SIDE_COLOR[Math.min(1, sides.findIndex((s) => s.id === id))]!
  }
  const series = marketSeries(game, range)
  const lines = game.outcomes.map((o, i) => ({
    id: o.id,
    label: o.short || o.label,
    color: colorOf(o.id),
    values: series[i]!,
    dash: o.label === 'Draw' ? '3 4' : undefined,
  }))
  const ladders = eventLadders(game)
  const toggle = (pick: Parameters<typeof toggleLeg>[1]) => setSoccerSlip((prev) => toggleLeg(prev, pick))
  const more = v5Games(sport)
    .filter((g) => g.id !== game.id)
    .slice(0, 4)

  return (
    <div data-name="v5-combo-event" className="px-4 pb-32 pt-4 md:px-6 lg:pb-12">
      <Link
        href={sport === 'nfl' ? '/sports/football' : '/sports/soccer'}
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <IconChevronLeft className="size-4" stroke={2} /> {game.leagueName}
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          {/* Header */}
          <div className="flex items-start gap-4">
            <LeagueTile src={leagueLogo(game.leagueName, game.leagueIcon)} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {game.leagueName}
              </p>
              <h1 className="mt-1 text-2xl font-black leading-tight tracking-tight text-foreground md:text-4xl">
                {game.title}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                {game.live ? (
                  <>
                    <LiveDot />
                    <span className="font-semibold text-[var(--live)]">Live · {game.when}</span>
                    {game.score ? (
                      <span className="rounded-md bg-secondary px-2 py-0.5 font-black tabular-nums text-foreground">
                        {game.score.join(' – ')}
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span>
                    Begins {game.when.split(',')[0]} · {kickoffTime(game)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  · <IconUsers className="size-3.5" stroke={2} aria-hidden /> {bettorsNow(game)} watching
                </span>
              </p>
            </div>
            <div className="hidden shrink-0 items-center gap-2 md:flex">
              <button
                type="button"
                aria-label="Share"
                className="inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground hover:bg-accent"
              >
                <IconShare3 className="size-4" stroke={2} />
              </button>
              <ComboButton onClick={() => openComboBuilder(sport)} />
            </div>
          </div>

          {/* Chart */}
          <section className={cn(V5_CARD, 'mt-6 p-4 md:p-5')}>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {game.outcomes.map((o) => (
                <span key={o.id} className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ background: colorOf(o.id) }} aria-hidden />
                  <span className="text-sm font-semibold text-foreground">{o.short || o.label}</span>
                  <span className="text-2xl font-black tabular-nums" style={{ color: colorOf(o.id) }}>
                    {fmtPctRound(o.chance)}
                  </span>
                </span>
              ))}
            </div>
            <LineChart lines={lines} height={240} showLegend={false} className="mt-3" />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-sm tabular-nums text-muted-foreground">
                $<NumberFlow value={game.volume + extraVolume} format={{ useGrouping: true }} /> vol
              </span>
              <RangeTabs value={range} onChange={setRange} ranges={CHART_RANGES} />
            </div>
          </section>

          {/* Live feed on small screens sits right under the chart */}
          <div className="mt-6 lg:hidden">
            <LiveBetsFeed games={[game]} onVolume={(a) => setExtraVolume((v) => v + a)} compact />
          </div>

          {/* Who wins */}
          <section className="mt-8">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Who wins?</h2>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chance</span>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {game.outcomes.map((o) => {
                const yes = pickFor(game, o, 'yes')
                const no = pickFor(game, o, 'no')
                const record = teamRecord(game, o)
                return (
                  <motion.div
                    key={o.id}
                    whileHover={{ x: 2 }}
                    className="flex flex-wrap items-center gap-3 py-4 md:flex-nowrap"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      {o.label === 'Draw' ? (
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-muted-foreground">
                          X
                        </span>
                      ) : (
                        <Crest name={o.team ?? o.label} className="size-8" />
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-base font-semibold text-foreground">{o.label}</span>
                        {record ? <span className="block text-xs text-muted-foreground">{record}</span> : null}
                      </span>
                    </div>
                    <span className="flex w-28 shrink-0 items-center gap-1">
                      <span className={cn('text-2xl font-black tabular-nums', o.id === lead.id ? 'text-foreground' : 'text-muted-foreground')}>
                        {fmtPctRound(o.chance)}
                      </span>
                      <ChangeChip value={o.change} />
                    </span>
                    <span className="flex w-full shrink-0 gap-2 md:w-auto">
                      <YesNoButton
                        side="yes"
                        cents={yesCents(o.chance)}
                        selected={selected.has(yes.id)}
                        onClick={() => toggle(yes)}
                        className="flex-1 md:flex-none"
                      />
                      <YesNoButton
                        side="no"
                        cents={noCents(o.chance)}
                        selected={selected.has(no.id)}
                        onClick={() => toggle(no)}
                        className="flex-1 md:flex-none"
                      />
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </section>

          {/* Spread + total */}
          {ladders.length ? (
            <section className="mt-10">
              <h2 className="mb-1 text-xl font-bold tracking-tight text-foreground">Spread and total</h2>
              <div className="divide-y divide-border border-y border-border">
                {ladders.map((l) => (
                  <LadderRow key={l.kind} ladder={l} selected={selected} onPick={toggle} />
                ))}
              </div>
            </section>
          ) : null}

          {/* Combo nudge */}
          <section className="mt-10 rounded-2xl border border-dashed border-border p-5 text-center">
            <IconStack2 className="mx-auto size-6 text-foreground" stroke={1.75} aria-hidden />
            <p className="mt-2 text-base font-bold text-foreground">Make it a combo</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add picks from other games and multiply the payout.
            </p>
            <button
              type="button"
              onClick={() => openComboBuilder(sport)}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-bold text-background"
            >
              Open combo builder
            </button>
          </section>

          {/* More games */}
          {more.length ? (
            <section className="mt-10">
              <h2 className="mb-3 text-xl font-bold tracking-tight text-foreground">More {game.sport === 'nfl' ? 'football' : 'soccer'}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {more.map((g) => (
                  <MoreGameCard key={g.id} game={g} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-[164px] flex max-h-[calc(100vh-180px)] flex-col gap-4 overflow-y-auto pb-2 [scrollbar-width:none]">
            <ComboSlip />
            <LiveBetsFeed games={[game]} onVolume={(a) => setExtraVolume((v) => v + a)} compact />
          </div>
        </aside>
      </div>

      <ComboDock />
      <ComboBuilderOverlay />
    </div>
  )
}

/** One question with a line stepper (‹ 2.5 · 3.5 · 4.5 ›) — chance and prices follow the line. */
function LadderRow({
  ladder,
  selected,
  onPick,
}: {
  ladder: Ladder
  selected: Set<string>
  onPick: (pick: Ladder['rungs'][number]['yes']) => void
}) {
  const [index, setIndex] = useState(ladder.defaultIndex)
  const rung = ladder.rungs[index]!
  const step = (d: 1 | -1) => setIndex((i) => Math.min(ladder.rungs.length - 1, Math.max(0, i + d)))
  const windowStart = Math.min(Math.max(0, index - 2), Math.max(0, ladder.rungs.length - 5))
  const visible = ladder.rungs.slice(windowStart, windowStart + 5)
  return (
    <div className="flex flex-wrap items-center gap-3 py-4 md:flex-nowrap">
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-foreground">
          {ladder.lead} <span className="text-success">{rung.line}</span> {ladder.unit}
        </p>
        <div className="mt-2 inline-flex h-9 items-center rounded-full border border-border px-1">
          <button
            type="button"
            aria-label="Lower line"
            onClick={() => step(-1)}
            disabled={index === 0}
            className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
          >
            <IconChevronLeft className="size-4" stroke={2} />
          </button>
          {visible.map((r) => {
            const i = ladder.rungs.indexOf(r)
            return (
              <button
                key={r.line}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  'h-7 min-w-[44px] rounded-full px-2 text-xs font-semibold tabular-nums transition-colors',
                  i === index ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {r.line}
              </button>
            )
          })}
          <button
            type="button"
            aria-label="Higher line"
            onClick={() => step(1)}
            disabled={index === ladder.rungs.length - 1}
            className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
          >
            <IconChevronRight className="size-4" stroke={2} />
          </button>
        </div>
      </div>
      <span className="flex w-28 shrink-0 items-center gap-1">
        <motion.span
          key={rung.line}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl font-black tabular-nums text-foreground"
        >
          {fmtPctRound(rung.chance)}
        </motion.span>
        <ChangeChip value={rung.change} />
      </span>
      <span className="flex w-full shrink-0 gap-2 md:w-auto">
        <YesNoButton
          side="yes"
          cents={yesCents(rung.chance)}
          selected={selected.has(rung.yes.id)}
          onClick={() => onPick(rung.yes)}
          className="flex-1 md:flex-none"
        />
        <YesNoButton
          side="no"
          cents={noCents(rung.chance)}
          selected={selected.has(rung.no.id)}
          onClick={() => onPick(rung.no)}
          className="flex-1 md:flex-none"
        />
      </span>
    </div>
  )
}

function MoreGameCard({ game }: { game: SportsMarket }) {
  const lead = leadOutcome(game)
  return (
    <Link href={game.href} className={cn(V5_CARD, 'flex items-center gap-3 p-4 transition-colors hover:border-muted-foreground')}>
      <LeagueTile src={leagueLogo(game.leagueName, game.leagueIcon)} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-foreground">{game.title}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {game.live ? `Live · ${game.when}` : `${game.when.split(',')[0]} · ${kickoffTime(game)}`}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-xs text-muted-foreground">{lead.short || lead.label}</span>
        <span className="block text-lg font-black tabular-nums text-foreground">{fmtPctRound(lead.chance)}</span>
      </span>
    </Link>
  )
}
