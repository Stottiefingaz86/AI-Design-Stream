'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IconBallAmericanFootball,
  IconBallFootball,
  IconChevronLeft,
  IconChevronRight,
  IconFlame,
  IconLayoutGrid,
  IconSearch,
  IconUsers,
  IconX,
} from '@tabler/icons-react'
import { setSoccerSlip, useSoccerSlip } from '@/lib/lumen/soccer-slip-store'
import type { SportsMarket } from '@/lib/lumen/sports-markets'
import {
  closeComboBuilder,
  eventLadders,
  featuredCombos,
  fmtX,
  kickoffTime,
  leadOutcome,
  leagueLogo,
  noCents,
  pickFor,
  teamOutcomes,
  toggleLeg,
  useComboBuilder,
  v5Games,
  yesCents,
  type FeaturedCombo,
  type V5Sport,
} from '@/lib/lumen/v5-combos'
import { cn } from '@/lib/utils'
import { ComboSlip, ComboDock } from './combo-slip'
import {
  AvatarStack,
  ComboGlow,
  Crest,
  LeagueTile,
  LiveDot,
  ProbBar,
  YesNoButton,
  fmtUsd,
  fmtVol,
} from './combo-ui'

type MarketTab = 'winner' | 'spread' | 'total'

const SPORTS: { id: V5Sport; label: string; Icon: typeof IconLayoutGrid }[] = [
  { id: 'all', label: 'All', Icon: IconLayoutGrid },
  { id: 'nfl', label: 'Football', Icon: IconBallAmericanFootball },
  { id: 'soccer', label: 'Soccer', Icon: IconBallFootball },
]

const MARKET_TABS: { id: MarketTab; label: string }[] = [
  { id: 'winner', label: 'Moneyline' },
  { id: 'spread', label: 'Spread' },
  { id: 'total', label: 'Total' },
]

/** Full-screen combo builder — opened from any COMBO button in V5. */
export function ComboBuilderOverlay() {
  const { open, sport: initialSport } = useComboBuilder()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (!open) return
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeComboBuilder()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])
  if (!mounted) return null
  return createPortal(
    <AnimatePresence>
      {open ? (
        <div data-trade-sheet-root="" data-name="combo-builder">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 overflow-y-auto bg-background"
          >
            <Builder initialSport={initialSport} />
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

function Builder({ initialSport }: { initialSport: V5Sport }) {
  const [sport, setSport] = useState<V5Sport>(initialSport)
  const [tab, setTab] = useState<MarketTab>('winner')
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const picks = useSoccerSlip()
  const selected = useMemo(() => new Set(picks.map((p) => p.id)), [picks])

  const games = useMemo(() => {
    const q = query.trim().toLowerCase()
    return v5Games(sport).filter(
      (g) => !q || g.title.toLowerCase().includes(q) || g.leagueName.toLowerCase().includes(q),
    )
  }, [sport, query])

  const leagues = useMemo(() => {
    const map = new Map<string, SportsMarket[]>()
    for (const g of games) map.set(g.leagueName, [...(map.get(g.leagueName) ?? []), g])
    return [...map.entries()]
  }, [games])

  const combos = featuredCombos(sport)

  return (
    <div className="min-h-full">
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-4 md:px-6">
          <span className="hidden w-24 md:block" />
          <div className="flex min-w-0 flex-1 items-center justify-center">
            {searching ? (
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search teams or leagues"
                className="h-10 w-full max-w-md rounded-full border border-input bg-popover px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            ) : (
              <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">Combo builder</h2>
            )}
          </div>
          <div className="flex w-24 justify-end gap-2">
            <button
              type="button"
              aria-label="Search"
              onClick={() => {
                setSearching((v) => !v)
                setQuery('')
              }}
              className="inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground hover:bg-accent"
            >
              <IconSearch className="size-4" stroke={2} />
            </button>
            <button
              type="button"
              aria-label="Close combo builder"
              onClick={closeComboBuilder}
              className="inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground hover:bg-accent"
            >
              <IconX className="size-4" stroke={2} />
            </button>
          </div>
        </div>
        {/* Sports */}
        <div className="mx-auto flex max-w-[1280px] items-end justify-center gap-1 overflow-x-auto px-4 pb-2 md:gap-2">
          {SPORTS.map(({ id, label, Icon }) => {
            const on = sport === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSport(id)}
                className={cn(
                  'flex min-w-[88px] flex-col items-center gap-1.5 rounded-xl px-3 pb-2 pt-2 text-xs font-semibold transition-colors',
                  on ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'inline-flex size-9 items-center justify-center rounded-full transition-colors',
                    on ? 'bg-foreground text-background' : 'bg-secondary',
                  )}
                >
                  <Icon className="size-5" stroke={1.75} />
                </span>
                {label}
                <span
                  className={cn('h-0.5 w-6 rounded-full transition-colors', on ? 'bg-foreground' : 'bg-transparent')}
                />
              </button>
            )
          })}
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 pb-40 pt-6 md:px-6 lg:pb-16">
        {/* Featured combos */}
        {combos.length ? (
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <IconFlame className="size-5 text-[var(--brand-superorange-500)]" stroke={2} aria-hidden />
              <h3 className="text-lg font-bold text-foreground">Popular combos</h3>
            </div>
            <FeaturedRail combos={combos} />
          </section>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            {/* Market tabs */}
            <div className="mb-4 flex gap-1.5" role="tablist" aria-label="Market">
              {MARKET_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'h-9 rounded-full px-4 text-sm font-semibold transition-colors',
                    tab === t.id ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {leagues.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">No games match “{query}”.</p>
            ) : null}

            {leagues.map(([league, list]) => (
              <section key={league} className="mb-8">
                <div className="mb-3 flex items-center gap-2.5">
                  <LeagueTile src={leagueLogo(league, list[0]?.leagueIcon)} size="sm" />
                  <h3 className="text-xl font-bold tracking-tight text-foreground">{league}</h3>
                  <span className="text-sm text-muted-foreground">{list.length}</span>
                </div>
                <div className="grid gap-3 xl:grid-cols-2">
                  {list.map((g) => (
                    <BuilderGameCard
                      key={g.id}
                      game={g}
                      tab={tab}
                      selected={selected}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-[150px]">
              <ComboSlip variant="builder" />
            </div>
          </aside>
        </div>
      </div>
      <ComboDock zClass="z-[300]" bottomClass="bottom-6" syncShell={false} />
    </div>
  )
}

function FeaturedRail({ combos }: { combos: FeaturedCombo[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 340, behavior: 'smooth' })
  return (
    <div className="relative">
      <div
        ref={ref}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:-mx-6 md:px-6"
      >
        {combos.map((c) => (
          <FeaturedComboCard key={c.id} combo={c} />
        ))}
      </div>
      <button
        type="button"
        aria-label="Previous"
        onClick={() => scroll(-1)}
        className="absolute -left-3 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm hover:bg-accent lg:inline-flex"
      >
        <IconChevronLeft className="size-4" stroke={2} />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => scroll(1)}
        className="absolute -right-3 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm hover:bg-accent lg:inline-flex"
      >
        <IconChevronRight className="size-4" stroke={2} />
      </button>
    </div>
  )
}

/** "$10 pays $1,818" card — tap adds every leg to your combo. */
export function FeaturedComboCard({ combo }: { combo: FeaturedCombo }) {
  const picks = useSoccerSlip()
  const all = combo.legs.every((l) => picks.some((p) => p.id === l.id))
  const add = () =>
    setSoccerSlip((prev) => {
      if (all) return prev.filter((p) => !combo.legs.some((l) => l.id === p.id))
      return combo.legs.reduce((acc, leg) => (acc.some((p) => p.id === leg.id) ? acc : toggleLeg(acc, leg)), prev)
    })
  return (
    <ComboGlow active={all} className="w-[300px] shrink-0 snap-start md:w-[330px]">
      <button type="button" onClick={add} className="flex h-full w-full flex-col p-4 text-left">
        <div className="flex items-center gap-2.5">
          <LeagueTile src={combo.leagueLogo} size="sm" />
          <div className="min-w-0">
            <p className="text-base font-bold text-foreground">
              $10 pays <span className="text-success">{fmtUsd(10 * combo.decimal, 0)}</span>
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Combo · {combo.title}
            </p>
          </div>
        </div>
        <div className="mt-3 border-l-2 border-border pl-3">
          <p className="truncate text-sm font-medium text-foreground">{combo.legs[0]!.label}</p>
          <p className="text-sm text-muted-foreground">
            {combo.legs.length - 1} more · {fmtX(combo.decimal)}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
          <span>{fmtVol(combo.volume)}</span>
          <span className="flex items-center gap-1.5">
            <AvatarStack names={['Sam', 'Mai', 'NEK']} />
            <IconUsers className="size-3.5" stroke={2} aria-hidden />
            {combo.bettors.toLocaleString('en-US')}
          </span>
        </div>
        <span
          className={cn(
            'mt-3 inline-flex h-9 items-center justify-center rounded-full text-sm font-semibold transition-colors',
            all ? 'bg-foreground text-background' : 'bg-secondary text-foreground',
          )}
        >
          {all ? 'Added · tap to remove' : 'Add to my combo'}
        </span>
      </button>
    </ComboGlow>
  )
}

function BuilderGameCard({
  game,
  tab,
  selected,
}: {
  game: SportsMarket
  tab: MarketTab
  selected: Set<string>
}) {
  const lead = leadOutcome(game)
  const toggle = (pick: Parameters<typeof toggleLeg>[1]) => setSoccerSlip((prev) => toggleLeg(prev, pick))
  const ladder = tab === 'winner' ? null : eventLadders(game).find((l) => l.kind === tab)
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <Link href={game.href} onClick={closeComboBuilder} className="min-w-0 hover:underline">
          <p className="truncate text-base font-bold text-foreground">{game.title}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {game.live ? (
              <>
                <LiveDot /> <span className="font-semibold text-[var(--live)]">{game.when}</span>
                {game.score ? <span className="font-semibold text-foreground">· {game.score.join('–')}</span> : null}
              </>
            ) : (
              <span>
                {game.when.split(',')[0]} @ {kickoffTime(game)}
              </span>
            )}
            <span>· {game.leagueName}</span>
          </p>
        </Link>
      </div>

      {tab === 'winner' ? (
        <div className="mt-3 flex flex-col gap-2.5">
          {teamOutcomes(game).map((o) => {
            const yes = pickFor(game, o, 'yes')
            const no = pickFor(game, o, 'no')
            return (
              <div key={o.id} className="flex items-center gap-3">
                <Crest name={o.team ?? o.label} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{o.label}</p>
                  <ProbBar value={o.chance} lead={o.id === lead.id} className="mt-1.5 max-w-[180px]" />
                </div>
                <YesNoButton
                  side="yes"
                  cents={o.chance}
                  showPercent
                  compact
                  selected={selected.has(yes.id)}
                  onClick={() => toggle(yes)}
                />
                <YesNoButton
                  side="no"
                  cents={100 - o.chance}
                  showPercent
                  compact
                  selected={selected.has(no.id)}
                  onClick={() => toggle(no)}
                />
              </div>
            )
          })}
        </div>
      ) : ladder ? (
        <div className="mt-3 flex items-center gap-3">
          <p className="min-w-0 flex-1 text-sm font-semibold text-foreground">
            {ladder.lead}{' '}
            <span className="text-success">{ladder.rungs[ladder.defaultIndex]!.line}</span> {ladder.unit}
          </p>
          <YesNoButton
            side="yes"
            cents={yesCents(ladder.rungs[ladder.defaultIndex]!.chance)}
            compact
            selected={selected.has(ladder.rungs[ladder.defaultIndex]!.yes.id)}
            onClick={() => toggle(ladder.rungs[ladder.defaultIndex]!.yes)}
          />
          <YesNoButton
            side="no"
            cents={noCents(ladder.rungs[ladder.defaultIndex]!.chance)}
            compact
            selected={selected.has(ladder.rungs[ladder.defaultIndex]!.no.id)}
            onClick={() => toggle(ladder.rungs[ladder.defaultIndex]!.no)}
          />
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">No line on this game yet.</p>
      )}

      <p className="mt-3 text-xs text-muted-foreground">{fmtVol(game.volume)}</p>
    </div>
  )
}
