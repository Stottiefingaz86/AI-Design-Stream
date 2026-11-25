'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IconArrowRight,
  IconChevronLeft,
  IconSearch,
  IconStack2,
  IconX,
} from '@tabler/icons-react'
import { Typography } from '@/components/ui/typography'
import type { SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import { SoccerBetslip } from '@/components/lumen/soccer-betslip'
import { LiveClock } from '@/components/lumen/sports-home-page'
import { ModePillTrack } from '@/components/lumen/soccer-sport-page'
import { useShell } from '@/components/site/shell-context'
import { setSoccerSlip, useSoccerSlip } from '@/lib/lumen/soccer-slip-store'
import type { SportsMarket } from '@/lib/lumen/sports-markets'
import {
  closeComboBuilder,
  comboDecimal,
  eventLadders,
  featuredCombos,
  fmtX,
  kickoffTime,
  leadOutcome,
  leagueLogo,
  noCents,
  openComboBuilder,
  pickFor,
  teamOutcomes,
  toggleLeg,
  useComboBuilder,
  v5Games,
  v5Leagues,
  yesCents,
  type V5Sport,
} from '@/lib/lumen/v5-combos'
import { cn } from '@/lib/utils'
import { showBetStack } from './bet-stack-popup'
import {
  Crest,
  DrawMark,
  LeaguePills,
  ProbBar,
  V5_CARD,
  V5_LIGHT_UP,
  V5_TITLE,
  YesNoButton,
  fmtUsd,
  fmtVol,
} from './combo-ui'
import { ComboPackCard, V5Shelf } from './v5-shelves'

type MarketTab = 'winner' | 'spread' | 'total'

const MARKET_TABS: { id: MarketTab; label: string }[] = [
  { id: 'winner', label: 'Moneyline' },
  { id: 'spread', label: 'Spread' },
  { id: 'total', label: 'Total' },
]

/** Full-screen combo builder — opened from the Selections bar or a Build-your-own card. */
export function ComboBuilderOverlay() {
  const { open, sport } = useComboBuilder()
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
            transition={{ duration: 0.2 }}
            className="absolute inset-0 overflow-y-auto bg-background"
          >
            <Builder initialSport={sport} />
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

function Builder({ initialSport }: { initialSport: V5Sport }) {
  /** 'all' or a league name. */
  const [scope, setScope] = useState<string>('all')
  const [tab, setTab] = useState<MarketTab>('winner')
  const [query, setQuery] = useState('')
  const picks = useSoccerSlip()
  const selected = useMemo(() => new Set(picks.map((p) => p.id)), [picks])
  const leagues = v5Leagues(initialSport)

  const games = useMemo(() => {
    const q = query.trim().toLowerCase()
    return v5Games(initialSport)
      .filter((g) => scope === 'all' || g.leagueName === scope)
      .filter((g) => !q || g.title.toLowerCase().includes(q) || g.leagueName.toLowerCase().includes(q))
  }, [initialSport, scope, query])

  const byLeague = useMemo(() => {
    const map = new Map<string, SportsMarket[]>()
    for (const g of games) map.set(g.leagueName, [...(map.get(g.leagueName) ?? []), g])
    return [...map.entries()]
  }, [games])

  const combos = featuredCombos(initialSport)
  const pills = [
    { id: 'all', label: 'All', icon: <IconStack2 className="size-5" stroke={1.75} /> },
    ...leagues.map((l) => ({ id: l.name, label: l.name === 'NCAA Football' ? 'NCAA' : l.name, logo: l.logo })),
  ]

  return (
    <div className="min-h-full">
      {/* Top bar — back, breadcrumb, search field, one close. */}
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 md:px-6">
          <button
            type="button"
            onClick={closeComboBuilder}
            aria-label="Back"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary transition-colors hover:bg-accent"
          >
            <IconChevronLeft className="size-4" stroke={1.5} />
          </button>
          <span className="hidden min-w-0 items-center gap-1.5 text-sm leading-none sm:flex">
            <span className="text-muted-foreground">Sports</span>
            <span className="text-muted-foreground/70" aria-hidden>
              /
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <IconStack2 className="size-4" stroke={1.75} aria-hidden /> Combo builder
            </span>
          </span>
          <label className="ml-auto flex h-9 w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-secondary px-3 focus-within:border-input">
            <IconSearch className="size-4 shrink-0 text-muted-foreground" stroke={1.75} aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation()
                  setQuery('')
                }
              }}
              placeholder="Search teams or leagues"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery('')}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            ) : null}
          </label>
          <button
            type="button"
            aria-label="Close combo builder"
            onClick={closeComboBuilder}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-foreground transition-colors hover:bg-accent"
          >
            <IconX className="size-4" stroke={1.5} />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 pb-40 pt-4 md:px-6 lg:pb-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_375px]">
          <div className="min-w-0">
            <h1 className={V5_TITLE}>Build your combo</h1>
            <Typography shape="small" variant="muted" className="mt-2">
              Pick 2 or more markets from any game. Every leg multiplies the payout.
            </Typography>

            <LeaguePills className="mt-6" items={pills} active={scope} onChange={setScope} />

            {combos.length && !query ? (
              <V5Shelf title="Popular Combos" className="mt-8" bleedRight={false}>
                {combos.map((c) => (
                  <ComboPackCard key={c.id} combo={c} />
                ))}
              </V5Shelf>
            ) : null}

            <ModePillTrack active={tab} onChange={setTab} modes={MARKET_TABS} ariaLabel="Market" className="mb-6 mt-8" />

            {byLeague.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">No games match “{query}”.</p>
            ) : null}

            {byLeague.map(([league, list]) => (
              <section key={league} className="mb-6">
                <div className="mb-3 flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={leagueLogo(league, list[0]!.leagueIcon)} alt="" className="size-7 object-contain" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">{league}</h2>
                </div>
                <div className="grid gap-3 xl:grid-cols-2">
                  {list.map((g) => (
                    <BuilderGameCard key={g.id} game={g} tab={tab} selected={selected} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-[72px]">
              {/* The real betslip, in place — prompts for 2 markets until it's a combo. */}
              <SoccerBetslip
                inline
                variant="v5"
                picks={picks}
                onRemove={(id) => setSoccerSlip((prev) => prev.filter((p) => p.id !== id))}
                onClear={() => setSoccerSlip([])}
                onChange={setSoccerSlip}
                onClosedAfterPlace={showBetStack}
              />
            </div>
          </aside>
        </div>
      </div>

      <MobileComboBar />
    </div>
  )
}

/** Opens the builder — first tile of the Combos grid. Centred mark, soft shimmer. */
export function BuildOwnCard({ sport }: { sport: V5Sport }) {
  return (
    <button
      type="button"
      onClick={() => openComboBuilder(sport)}
      className={cn(
        V5_CARD,
        V5_LIGHT_UP,
        'lm-shimmer flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-[14px] p-6 text-center',
      )}
    >
      {/* Three legs fanned behind the mark — the combo, before you've built it. */}
      <span className="relative mb-2 flex h-16 w-24 items-center justify-center" aria-hidden>
        <span className="absolute h-12 w-16 -rotate-12 rounded-lg border border-border bg-secondary" />
        <span className="absolute h-12 w-16 rotate-12 rounded-lg border border-border bg-secondary" />
        <span className="relative inline-flex h-14 w-16 items-center justify-center rounded-lg border border-border bg-card">
          <IconStack2 className="size-7 text-foreground" stroke={1.75} />
        </span>
      </span>
      <span className="text-xl font-bold leading-7 text-foreground">Build your own combo</span>
      <span className="max-w-[260px] text-sm text-muted-foreground">Pick from every game. Each leg multiplies the payout.</span>
      <span className="mt-2 inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground">
        Open combo builder <IconArrowRight className="size-4" stroke={2} aria-hidden />
      </span>
    </button>
  )
}

function BuilderGameCard({ game, tab, selected }: { game: SportsMarket; tab: MarketTab; selected: Set<string> }) {
  const lead = leadOutcome(game)
  const toggle = (pick: SoccerSlipPick) => setSoccerSlip((prev) => toggleLeg(prev, pick))
  const ladder = tab === 'winner' ? null : eventLadders(game).find((l) => l.kind === tab)
  const rung = ladder ? ladder.rungs[ladder.defaultIndex]! : null
  const rows = [...teamOutcomes(game), ...game.outcomes.filter((x) => x.label === 'Draw')]
  return (
    <div className={cn(V5_CARD, 'overflow-hidden')}>
      <Link
        href={game.href}
        onClick={closeComboBuilder}
        className="flex h-[34px] items-center gap-2 border-b border-border px-3 transition-colors hover:bg-accent"
      >
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">{game.title}</span>
        {game.live ? (
          <LiveClock when={game.when} />
        ) : (
          <span className="shrink-0 text-xs text-muted-foreground">
            {game.when.split(',')[0]} · {kickoffTime(game)}
          </span>
        )}
      </Link>

      {tab === 'winner' ? (
        <div className="flex flex-col gap-2.5 px-3 py-3">
          {rows.map((o) => {
            const yes = pickFor(game, o, 'yes')
            const no = pickFor(game, o, 'no')
            const isDraw = o.label === 'Draw'
            return (
              <div key={o.id} className="flex items-center gap-3">
                {isDraw ? <DrawMark /> : <Crest name={o.team ?? o.label} />}
                <div className="min-w-0 flex-1">
                  <Typography as="p" shape="small" weight="medium" className={cn('truncate', isDraw && 'text-muted-foreground')}>
                    {o.label}
                  </Typography>
                  {!isDraw ? <ProbBar value={o.chance} lead={o.id === lead.id} className="mt-1.5 max-w-[160px]" /> : null}
                </div>
                <YesNoButton side="yes" value={yesCents(o.chance)} compact selected={selected.has(yes.id)} onClick={() => toggle(yes)} />
                <YesNoButton side="no" value={noCents(o.chance)} compact selected={selected.has(no.id)} onClick={() => toggle(no)} />
              </div>
            )
          })}
        </div>
      ) : ladder && rung ? (
        <div className="flex items-center gap-3 px-3 py-3">
          <Typography as="p" shape="small" weight="medium" className="min-w-0 flex-1">
            {ladder.lead} <span className="font-bold">{rung.line}</span> {ladder.unit}
          </Typography>
          <YesNoButton side="yes" value={yesCents(rung.chance)} compact selected={selected.has(rung.yes.id)} onClick={() => toggle(rung.yes)} />
          <YesNoButton side="no" value={noCents(rung.chance)} compact selected={selected.has(rung.no.id)} onClick={() => toggle(rung.no)} />
        </div>
      ) : (
        <p className="px-3 py-3 text-sm text-muted-foreground">No line on this game yet.</p>
      )}

      <div className="flex h-9 items-center border-t border-border px-3 text-xs text-muted-foreground">{fmtVol(game.volume)}</div>
    </div>
  )
}

/** Hand the combo to the existing betslip to stake and place. */
function useReview() {
  const { openSportsBetslip } = useShell()
  return () => {
    closeComboBuilder()
    window.setTimeout(() => openSportsBetslip(), 120)
  }
}

/** Mobile: payout bar pinned to the bottom of the builder. */
function MobileComboBar() {
  const picks = useSoccerSlip()
  const review = useReview()
  const decimal = comboDecimal(picks)
  return (
    <AnimatePresence>
      {picks.length ? (
        <motion.div
          initial={{ y: 90 }}
          animate={{ y: 0 }}
          exit={{ y: 90 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="dark fixed inset-x-0 bottom-0 z-30 border-t border-border bg-popover p-3 pb-[max(env(safe-area-inset-bottom),12px)] text-popover-foreground lg:hidden"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {picks.length}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-muted-foreground">
                {picks.length >= 2 ? `${picks.length}-leg combo` : '1 selection'} · {fmtX(decimal)}
              </span>
              <span className="block text-sm font-semibold">$10 pays {fmtUsd(10 * decimal)}</span>
            </span>
            <button
              type="button"
              onClick={review}
              className="inline-flex h-10 shrink-0 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Review
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
