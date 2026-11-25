'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import NumberFlow from '@number-flow/react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IconArrowRight,
  IconCheck,
  IconChevronLeft,
  IconSearch,
  IconStack2,
  IconUsers,
  IconX,
} from '@tabler/icons-react'
import { Typography } from '@/components/ui/typography'
import type { SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import { HorizontalRail, LiveClock } from '@/components/lumen/sports-home-page'
import { LeagueQuickLinks, ModePillTrack } from '@/components/lumen/soccer-sport-page'
import { useShell } from '@/components/site/shell-context'
import type { SoccerQuickLink } from '@/lib/lumen/soccer-sport'
import { setSoccerSlip, useSoccerSlip } from '@/lib/lumen/soccer-slip-store'
import type { SportsMarket } from '@/lib/lumen/sports-markets'
import {
  closeComboBuilder,
  comboDecimal,
  decimalOf,
  decimalToAmerican,
  eventLadders,
  featuredCombos,
  fmtX,
  kickoffTime,
  leadOutcome,
  noCents,
  openComboBuilder,
  pickFor,
  teamOutcomes,
  toggleLeg,
  useComboBuilder,
  v5Games,
  v5Leagues,
  yesCents,
  type FeaturedCombo,
  type V5Sport,
} from '@/lib/lumen/v5-combos'
import { cn } from '@/lib/utils'
import { Crest, DrawMark, ProbBar, V5_CARD, V5_LIGHT_UP, YesNoButton, fmtUsd, fmtVol } from './combo-ui'

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
  const [searching, setSearching] = useState(false)
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
  const links: SoccerQuickLink[] = [
    { id: 'all', label: 'All', icon: '' },
    ...leagues.map((l) => ({ id: l.name, label: l.name === 'NCAA Football' ? 'NCAA' : l.name, icon: l.logo })),
  ]

  return (
    <div className="min-h-full">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 md:px-6">
          <button
            type="button"
            onClick={closeComboBuilder}
            aria-label="Back"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary transition-colors hover:bg-accent"
          >
            <IconChevronLeft className="size-4" stroke={1.5} />
          </button>
          {searching ? (
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search teams or leagues"
              className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-secondary px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          ) : (
            <span className="flex min-w-0 flex-1 items-center gap-1.5 text-sm leading-none">
              <span className="text-muted-foreground">Sports</span>
              <span className="text-muted-foreground/70" aria-hidden>
                /
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <IconStack2 className="size-4 text-primary" stroke={1.75} aria-hidden /> Combo builder
              </span>
            </span>
          )}
          <button
            type="button"
            aria-label={searching ? 'Close search' : 'Search'}
            onClick={() => {
              setSearching((v) => !v)
              setQuery('')
            }}
            className="inline-flex size-8 items-center justify-center rounded-lg bg-secondary text-foreground transition-colors hover:bg-accent"
          >
            {searching ? <IconX className="size-4" stroke={1.5} /> : <IconSearch className="size-4" stroke={1.5} />}
          </button>
          <button
            type="button"
            aria-label="Close combo builder"
            onClick={closeComboBuilder}
            className="inline-flex size-8 items-center justify-center rounded-lg bg-secondary text-foreground transition-colors hover:bg-accent"
          >
            <IconX className="size-4" stroke={1.5} />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 pb-40 pt-4 md:px-6 lg:pb-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_375px]">
          <div className="min-w-0">
            <Typography as="h1" shape="lead" weight="semibold">
              Build your combo
            </Typography>
            <Typography shape="small" variant="muted" className="mt-1">
              Pick 2 or more from any game. Every leg multiplies the payout.
            </Typography>

            <LeagueQuickLinks
              links={links}
              activeId={scope}
              onPick={setScope}
              allIcon={<IconStack2 className="size-6 text-foreground" stroke={1.5} />}
            />

            {combos.length && !query ? (
              <section className="mb-6">
                <div className="mb-3 flex h-9 items-center gap-2 px-0.5">
                  <Typography as="h2" shape="small" weight="semibold" className="flex-1">
                    Popular Combos
                  </Typography>
                  <span className="text-xs text-muted-foreground">Add every leg in one tap</span>
                </div>
                <div className="-mx-4 md:-mx-6 lg:mr-0">
                  <HorizontalRail label="Popular combos">
                    {combos.map((c) => (
                      <FeaturedComboCard key={c.id} combo={c} />
                    ))}
                  </HorizontalRail>
                </div>
              </section>
            ) : null}

            <ModePillTrack active={tab} onChange={setTab} modes={MARKET_TABS} ariaLabel="Market" />

            {byLeague.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">No games match “{query}”.</p>
            ) : null}

            {byLeague.map(([league, list]) => (
              <section key={league} className="mb-6">
                <div className="mb-3 flex h-9 items-center gap-2 px-0.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={list[0]!.leagueIcon} alt="" className="size-[18px] object-contain" />
                  <Typography as="h2" shape="small" weight="semibold">
                    {league}
                  </Typography>
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
              <BuilderComboCard />
            </div>
          </aside>
        </div>
      </div>

      <MobileComboBar />
    </div>
  )
}

/** Opens the builder — first tile of the Popular Combos grid. */
export function BuildOwnCard({ sport }: { sport: V5Sport }) {
  return (
    <button
      type="button"
      onClick={() => openComboBuilder(sport)}
      className={cn(V5_CARD, V5_LIGHT_UP, 'flex min-h-[188px] flex-col items-start gap-3 p-4 text-left')}
    >
      <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <IconStack2 className="size-5" stroke={1.75} aria-hidden />
      </span>
      <span>
        <Typography as="span" shape="small" weight="semibold" className="block">
          Build your own combo
        </Typography>
        <Typography as="span" shape="xs" variant="muted" className="mt-1 block">
          Pick from every game. Each leg multiplies the payout.
        </Typography>
      </span>
      <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-foreground">
        Open combo builder <IconArrowRight className="size-4" stroke={1.5} aria-hidden />
      </span>
    </button>
  )
}

/** Ready-made combo — legs, payout on $10, one tap adds every leg. */
export function FeaturedComboCard({ combo, fluid = false }: { combo: FeaturedCombo; fluid?: boolean }) {
  const picks = useSoccerSlip()
  const all = combo.legs.every((l) => picks.some((p) => p.id === l.id))
  const add = () =>
    setSoccerSlip((prev) => {
      if (all) return prev.filter((p) => !combo.legs.some((l) => l.id === p.id))
      return combo.legs.reduce((acc, leg) => (acc.some((p) => p.id === leg.id) ? acc : toggleLeg(acc, leg)), prev)
    })
  const shown = combo.legs.slice(0, 3)
  return (
    <div
      data-name="v5-combo-card"
      className={cn(V5_CARD, 'flex min-h-[188px] shrink-0 flex-col overflow-hidden', fluid ? 'w-full' : 'w-[min(320px,85vw)]')}
    >
      <div className="flex h-[34px] items-center gap-2 border-b border-border px-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={combo.leagueLogo} alt="" className="size-4 object-contain" />
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{combo.title}</span>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <IconUsers className="size-3.5" stroke={1.5} aria-hidden />
          {combo.bettors.toLocaleString('en-US')}
        </span>
      </div>
      <ul className="flex flex-col gap-1.5 px-3 pt-3">
        {shown.map((l) => (
          <li key={l.id} className="flex items-center gap-2">
            <Typography as="span" shape="small" className="min-w-0 flex-1 truncate">
              {l.label}
            </Typography>
            <span className="text-xs tabular-nums text-muted-foreground">{fmtX(decimalOf(l.odds))}</span>
          </li>
        ))}
        {combo.legs.length > shown.length ? (
          <li className="text-xs text-muted-foreground">+{combo.legs.length - shown.length} more</li>
        ) : null}
      </ul>
      <div className="mt-auto flex items-end gap-3 px-3 pb-3 pt-3">
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-muted-foreground">$10 pays</span>
          <span className="block text-base font-semibold tabular-nums text-foreground">{fmtUsd(10 * combo.decimal)}</span>
        </span>
        <button
          type="button"
          onClick={add}
          aria-pressed={all}
          className={cn(
            'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors',
            all ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-secondary text-foreground hover:bg-accent',
          )}
        >
          {all ? (
            <>
              <IconCheck className="size-4" stroke={2} aria-hidden /> Added
            </>
          ) : (
            `Add ${combo.legs.length} legs`
          )}
        </button>
      </div>
    </div>
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
        className="flex h-[34px] items-center gap-2 border-b border-border px-3 transition-colors hover:bg-surface-muted-2"
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
            {ladder.lead} <span className="text-primary">{rung.line}</span> {ladder.unit}
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

/** Desktop rail — the combo growing as you pick, in the betslip's own surface. */
function BuilderComboCard() {
  const picks = useSoccerSlip()
  const review = useReview()
  const decimal = comboDecimal(picks)
  const combo = picks.length >= 2
  return (
    <div className="dark overflow-hidden rounded-[10px] border border-border bg-popover text-popover-foreground shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-2 px-4 pb-3 pt-4">
        <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
          {picks.length}
        </span>
        <Typography as="span" shape="small" weight="semibold" className="min-w-0 flex-1 truncate">
          {combo ? `${picks.length}-leg combo` : picks.length ? '1 selection' : 'Your combo'}
        </Typography>
        {picks.length ? (
          <span className="text-sm font-semibold tabular-nums">{decimalToAmerican(decimal)}</span>
        ) : null}
      </div>
      <div className="mx-4 h-px bg-border" />

      {picks.length === 0 ? (
        <Typography shape="small" variant="muted" className="px-4 py-6">
          Pick Yes or No on any game. Legs stack up here, then go to your betslip.
        </Typography>
      ) : (
        <ul className="max-h-[46vh] overflow-y-auto px-2 py-2 scrollbar-hide">
          <AnimatePresence initial={false}>
            {picks.map((leg) => (
              <motion.li
                key={leg.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-2 rounded-lg px-2 py-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{leg.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {leg.market} · {leg.eventLabel}
                  </span>
                </span>
                <span className="text-xs font-semibold tabular-nums">{fmtX(decimalOf(leg.odds))}</span>
                <button
                  type="button"
                  aria-label={`Remove ${leg.label}`}
                  onClick={() => setSoccerSlip((prev) => prev.filter((p) => p.id !== leg.id))}
                  className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <IconX className="size-3.5" stroke={1.5} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <div className="border-t border-border p-4">
        {picks.length ? (
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">$10 pays</span>
            <span className="text-lg font-semibold tabular-nums">
              $
              <NumberFlow
                value={Math.round(10 * decimal * 100) / 100}
                format={{ minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }}
              />
            </span>
          </div>
        ) : null}
        <button
          type="button"
          disabled={picks.length === 0}
          onClick={review}
          className="flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {combo ? 'Review combo in betslip' : 'Open betslip'}
        </button>
        {picks.length ? (
          <button
            type="button"
            onClick={() => setSoccerSlip([])}
            className="mx-auto mt-2 block text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear all
          </button>
        ) : null}
      </div>
    </div>
  )
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
