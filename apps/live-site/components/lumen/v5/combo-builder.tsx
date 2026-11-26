'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import {
  IconCheck,
  IconChevronLeft,
  IconChevronUp,
  IconPlus,
  IconSearch,
  IconStack2,
  IconX,
} from '@tabler/icons-react'
import { Typography } from '@/components/ui/typography'
import type { SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import { SoccerBetslip } from '@/components/lumen/soccer-betslip'
import { useIsDesktop } from '@/components/lumen/sports-event-view'
import { LiveClock } from '@/components/lumen/sports-home-page'
import { V5PillTrack } from './v5-pill-track'
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
  nextLegDecimal,
  noCents,
  openComboBuilder,
  pickFor,
  registerComboBuilderHost,
  teamOutcomes,
  toggleLeg,
  useComboBuilder,
  v5Games,
  v5Leagues,
  yesCents,
  type V5Sport,
} from '@/lib/lumen/v5-combos'
import { cn } from '@/lib/utils'
import { ComboMark } from './combo-mark'
import { ComboBoostMeter, comboBoostFor, qualifyingLegs } from './v5-combo-boost'
import { LeagueMenu } from './v5-league-menu'
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
  useV5Pick,
} from './combo-ui'
import { ComboPackCard, V5Shelf, megaCombos } from './v5-shelves'
import { KMarketCard } from './v5-market-cards'
import { AUTO_GRID } from './v5-widgets'
import { futureCards, gamePropCards, playerPropCards } from '@/lib/lumen/v5-markets'
import { sportDef, type V5SportId } from '@/lib/lumen/v5-sportsbook'

type MarketTab = 'winner' | 'spread' | 'total' | 'props' | 'players' | 'futures'

const MARKET_TABS: { id: MarketTab; label: string }[] = [
  { id: 'winner', label: 'Moneyline' },
  { id: 'spread', label: 'Spread' },
  { id: 'total', label: 'Total' },
  { id: 'props', label: 'Game props' },
  { id: 'players', label: 'Player props' },
  { id: 'futures', label: 'Futures' },
]

const BUILDER_SPORTS: V5SportId[] = ['soccer', 'nfl', 'basketball', 'hockey', 'tennis', 'baseball', 'mma', 'boxing', 'golf', 'horse-racing', 'rugby', 'volleyball', 'table-tennis', 'lacrosse', 'pool']

/** Full-screen combo builder — opened from the Selections bar or a Build-your-own card. */
export function ComboBuilderOverlay() {
  const { open, sport } = useComboBuilder()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  useEffect(() => registerComboBuilderHost(), [])
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
  const [sport, setSport] = useState<V5Sport>(initialSport)
  /** 'all' or a league name. */
  const [scope, setScope] = useState<string>('all')
  const [tab, setTab] = useState<MarketTab>('winner')
  const [query, setQuery] = useState('')
  const picks = useSoccerSlip()
  const selected = useMemo(() => new Set(picks.map((p) => p.id)), [picks])
  const onPick = useV5Pick()
  /* Phones: the slip opens as a sheet over the builder — you never leave the page. */
  const desktop = useIsDesktop()
  const [sheet, setSheet] = useState(false)
  useEffect(() => {
    if (desktop) setSheet(false)
  }, [desktop])
  const leagues = v5Leagues(sport)
  const q = query.trim().toLowerCase()

  const games = useMemo(() => {
    return v5Games(sport)
      .filter((g) => scope === 'all' || g.leagueName === scope)
      .filter((g) => !q || g.title.toLowerCase().includes(q) || g.leagueName.toLowerCase().includes(q))
  }, [sport, scope, q])

  const byLeague = useMemo(() => {
    const map = new Map<string, SportsMarket[]>()
    for (const g of games) map.set(g.leagueName, [...(map.get(g.leagueName) ?? []), g])
    return [...map.entries()]
  }, [games])

  /* Props, player props and futures — every V5 market card can join the combo. */
  const cards = useMemo(() => {
    if (tab !== 'props' && tab !== 'players' && tab !== 'futures') return []
    const all = tab === 'props' ? gamePropCards(sport) : tab === 'players' ? playerPropCards(sport) : futureCards(sport)
    return all
      .filter((c) => scope === 'all' || c.league === scope)
      .filter((c) => !q || `${c.title} ${c.league}`.toLowerCase().includes(q))
      .slice(0, 30)
  }, [tab, sport, scope, q])

  const combos = featuredCombos(sport)
  /* Mega combos — the big ones, 5 legs and up. */
  const megas = useMemo(() => megaCombos(sport).filter((c) => c.legs.length >= 5), [sport])
  const sportPills = [
    { id: 'all', label: 'All sports', icon: <IconStack2 className="size-5" stroke={1.75} /> },
    ...BUILDER_SPORTS.map((id) => ({ id, label: sportDef(id).label, icon: <SportGlyph id={id} /> })),
  ]

  return (
    <div className="min-h-full">
      {/* Top bar — back, breadcrumb, search field, one close. */}
      <header className="v5-glass sticky top-0 z-40 border-b border-border">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 md:px-6">
          {/* Phones: search + close only. sm+: back + breadcrumb. */}
          <button
            type="button"
            onClick={closeComboBuilder}
            aria-label="Back"
            className="hidden size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary transition-colors hover:bg-accent sm:inline-flex"
          >
            <IconChevronLeft className="size-4" stroke={1.5} />
          </button>
          <span className="hidden min-w-0 items-center gap-1.5 text-sm leading-none sm:flex">
            <span className="text-muted-foreground">Sports</span>
            <span className="text-muted-foreground/70" aria-hidden>
              /
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <ComboMark className="size-4" /> Combo builder
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

            <LeaguePills
              className="mt-6"
              items={sportPills}
              active={sport}
              onChange={(id) => {
                setSport(id as V5Sport)
                setScope('all')
              }}
            />
            {sport !== 'all' && leagues.length > 1 ? (
              <LeagueMenu
                className="mt-4"
                leagues={leagues.map((l) => {
                  const lg = v5Games(sport).filter((g) => g.leagueName === l.name)
                  return { ...l, live: lg.filter((g) => g.live).length, volume: lg.reduce((a, g) => a + g.volume, 0) }
                })}
                active={scope}
                onChange={setScope}
                short={(n) => (n === 'NCAA Football' ? 'NCAA' : n)}
              />
            ) : null}

            <ComboMeter />

            {combos.length && !query ? (
              <V5Shelf title="Popular Combos" className="mt-8" bleedRight={false} fill={3}>
                {combos.map((c) => (
                  <ComboPackCard key={c.id} combo={c} />
                ))}
              </V5Shelf>
            ) : null}

            {megas.length && !query ? (
              <V5Shelf title="Mega Combos · 5+ legs" label="Mega combos" bleedRight={false} fill={3}>
                {megas.map((c) => (
                  <ComboPackCard key={c.id} combo={c} kind="mega combo" />
                ))}
              </V5Shelf>
            ) : null}

            <V5PillTrack active={tab} onChange={setTab} modes={MARKET_TABS} ariaLabel="Market" className="mb-6 mt-8" />

            {tab === 'props' || tab === 'players' || tab === 'futures' ? (
              cards.length ? (
                <div className={AUTO_GRID}>
                  {cards.map((c) => (
                    <KMarketCard key={c.id} card={c} selected={selected} onPick={onPick} />
                  ))}
                </div>
              ) : (
                <p className="py-16 text-center text-sm text-muted-foreground">Nothing here for this sport yet.</p>
              )
            ) : (
              <>
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
                        <BuilderGameCard key={g.id} game={g} tab={tab as 'winner' | 'spread' | 'total'} selected={selected} />
                      ))}
                    </div>
                  </section>
                ))}
              </>
            )}
          </div>

          <aside className="hidden lg:block">
            {/* Full-height slip rail — the betslip fills the column, stake and Place pinned to the bottom. */}
            <div className="sticky top-[72px] flex h-[calc(100dvh-88px)] flex-col [&>aside]:!max-h-none [&>aside]:flex-1">
              {/* The real betslip, in place — prompts for 2 markets until it's a combo. */}
              {desktop === false ? null : (
                <SoccerBetslip
                  inline
                  variant="v5"
                  picks={picks}
                  onRemove={(id) => setSoccerSlip((prev) => prev.filter((p) => p.id !== id))}
                  onClear={() => setSoccerSlip([])}
                  onChange={setSoccerSlip}
                  onClosedAfterPlace={showBetStack}
                />
              )}
            </div>
          </aside>
        </div>
      </div>

      {desktop === false ? (
        <>
          <MobileComboBar hidden={sheet} onOpen={() => setSheet(true)} />
          <MobileComboSheet open={sheet} onClose={() => setSheet(false)} picks={picks} />
        </>
      ) : null}
    </div>
  )
}

/** Combo meter — how many legs, what $10 pays now, and what one more leg would pay. */
function ComboMeter() {
  const picks = useSoccerSlip()
  const n = picks.length
  const dec = comboDecimal(picks)
  const next = nextLegDecimal(picks)
  /* Boost ladder (x1.05 → x1.5) with what $10 pays underneath. */
  return (
    <ComboBoostMeter
      picks={picks}
      className="mt-6"
      footer={
        n === 0
          ? 'Every leg you add multiplies the payout.'
          : n === 1
            ? `One more leg makes it a combo · about ${fmtUsd(10 * next)} on $10`
            : `${n}-leg combo · ${fmtX(dec)} · $10 pays ${fmtUsd(10 * dec)} now, about ${fmtUsd(10 * next)} with one more leg`
      }
    />
  )
}

/** Opens the builder — first tile of the Combos grid. Centred mark, soft shimmer. */
/** Same monochrome sport glyphs as the sub-nav — they follow the text colour in light and dark. */
function SportGlyph({ id }: { id: string }) {
  const file = id === 'nfl' ? 'football' : id
  return (
    <span
      aria-hidden
      className="inline-block size-5 shrink-0 bg-current"
      style={{
        maskImage: `url(/shell/figma/sports/lumen/${file}.svg)`,
        WebkitMaskImage: `url(/shell/figma/sports/lumen/${file}.svg)`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  )
}

export function BuildOwnCard({ sport }: { sport: V5Sport }) {
  return (
    <button
      type="button"
      onClick={() => openComboBuilder(sport)}
      className={cn(
        V5_CARD,
        V5_LIGHT_UP,
        'flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-[14px] p-6 text-center',
      )}
    >
      {/* A combo slip being built — two legs ticked, the third waiting, payout climbing. */}
      <span className="mb-3 flex w-[200px] flex-col gap-1.5" aria-hidden>
        {[
          { on: true, w: 'w-[62%]', x: 'x2.10' },
          { on: true, w: 'w-[48%]', x: 'x1.85' },
          { on: false, w: 'w-[56%]', x: '' },
        ].map((leg, i) => (
          <span
            key={i}
            className={cn(
              'flex h-9 items-center gap-2.5 rounded-lg border px-3',
              leg.on ? 'border-border bg-secondary' : 'border-dashed border-border bg-transparent',
            )}
          >
            <span
              className={cn(
                'inline-flex size-4 shrink-0 items-center justify-center rounded-full',
                leg.on ? 'bg-primary text-primary-foreground' : 'border-2 border-muted-foreground',
              )}
            >
              {leg.on ? <IconCheck className="size-2.5" stroke={3.5} /> : null}
            </span>
            <span className={cn('h-1.5 rounded-full bg-muted-foreground opacity-40', leg.w)} />
            <span className="ml-auto text-[11px] font-bold tabular-nums text-muted-foreground">
              {leg.on ? leg.x : <IconPlus className="size-3.5" stroke={2.5} />}
            </span>
          </span>
        ))}
        <span className="mt-1 flex items-center justify-between px-1 text-xs">
          <span className="text-muted-foreground">2-leg combo</span>
          <span className="font-bold tabular-nums text-foreground">$10 pays $38.85</span>
        </span>
      </span>
      <span className="text-xl font-bold leading-7 text-foreground">Build your own combo</span>
      <span className="max-w-[260px] text-sm text-muted-foreground">Pick from every game. Each leg multiplies the payout.</span>
      <span className="v5-combo-sheen mt-2 inline-flex h-10 items-center gap-2 rounded-lg bg-secondary px-4 text-sm font-bold text-foreground">
        <ComboMark className="size-5" /> Open combo builder
      </span>
    </button>
  )
}

function BuilderGameCard({ game, tab, selected }: { game: SportsMarket; tab: 'winner' | 'spread' | 'total'; selected: Set<string> }) {
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

/** Mobile: payout bar pinned to the bottom of the builder — tap it to open the slip sheet. */
function MobileComboBar({ hidden, onOpen }: { hidden: boolean; onOpen: () => void }) {
  const picks = useSoccerSlip()
  const decimal = comboDecimal(picks)
  const n = picks.length
  const legs = qualifyingLegs(picks)
  const boost = comboBoostFor(legs)
  /* Floating glass capsule — mark + count, payout as the hero, a quiet open chevron, boost progress on the edge. */
  return (
    <AnimatePresence>
      {n && !hidden ? (
        <motion.div
          initial={{ y: 110, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 110, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="fixed inset-x-3 bottom-[max(env(safe-area-inset-bottom),12px)] z-30 lg:hidden"
        >
          <button
            type="button"
            onClick={onOpen}
            aria-label={`Open your ${n}-leg combo`}
            className="v5-glass relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-border p-2 pl-2.5 pr-3 text-left shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          >
            <span className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <ComboMark className="size-6" />
              <span className="absolute -right-1.5 -top-1.5 inline-flex size-5 items-center justify-center rounded-full bg-foreground text-[11px] font-bold tabular-nums text-background">
                {n}
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs text-muted-foreground">
                {n >= 2 ? `${n}-leg combo · ${fmtX(decimal)}` : 'Add 1 more leg'}
                {boost > 1 ? ` · x${boost.toFixed(2)} boost` : ''}
              </span>
              <span className="flex items-baseline gap-1.5">
                <span className="text-xs text-muted-foreground">$10 pays</span>
                <span className="v5-pay-shimmer text-lg font-bold leading-6 tabular-nums tracking-tight">{fmtUsd(10 * decimal)}</span>
              </span>
            </span>
            {/* Same round control as the slip's minimise — it just points the other way. */}
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground" aria-hidden>
              <IconChevronUp className="size-4" stroke={2} />
            </span>
            {/* Boost progress — 12 legs at 1.50x+ is the max. */}
            <span className="absolute inset-x-4 bottom-0 h-0.5 overflow-hidden rounded-full bg-secondary" aria-hidden>
              <span
                className="block h-full rounded-full bg-success transition-[width] duration-300"
                style={{ width: `${Math.min(100, (legs / 12) * 100)}%` }}
              />
            </span>
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

/**
 * Mobile: the combo slip as a sheet over the builder (same overlay as other modals). It stays
 * mounted so stakes survive closing it; drag the handle down, tap the scrim or minimise to close.
 */
function MobileComboSheet({ open, onClose, picks }: { open: boolean; onClose: () => void; picks: SoccerSlipPick[] }) {
  const drag = useDragControls()
  /* Every close (scrim, drag, minimise) bumps this — the slip hands a placed ticket to the bet stack. */
  const [dismissTick, setDismissTick] = useState(0)
  const close = () => {
    onClose()
    setDismissTick((t) => t + 1)
  }
  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.button
            key="combo-sheet-scrim"
            type="button"
            aria-label="Close betslip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-40 cursor-default bg-black/60 lg:hidden"
          />
        ) : null}
      </AnimatePresence>
      <motion.div
        data-name="combo-builder-sheet"
        aria-hidden={!open}
        initial={false}
        animate={{ y: open ? 0 : '105%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        drag="y"
        dragControls={drag}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.7 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 90 || info.velocity.y > 600) close()
        }}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 lg:hidden',
          '[&>aside]:!max-h-[88dvh] [&>aside]:!rounded-b-none [&>aside]:!rounded-t-[20px] [&>aside]:!pt-6 [&>aside]:pb-[env(safe-area-inset-bottom)]',
          !open && 'pointer-events-none',
        )}
      >
        {/* Grab handle — drags the sheet; the slip itself still scrolls. */}
        <div
          onPointerDown={(e) => drag.start(e)}
          className="absolute inset-x-0 top-0 z-10 flex h-6 cursor-grab touch-none justify-center pt-2"
          aria-hidden
        >
          <span className="h-1 w-10 rounded-full bg-border" />
        </div>
        <SoccerBetslip
          inline
          variant="v5"
          picks={picks}
          onRemove={(id) => setSoccerSlip((prev) => prev.filter((p) => p.id !== id))}
          onClear={() => setSoccerSlip([])}
          onChange={setSoccerSlip}
          onMinimize={close}
          dismissTick={dismissTick}
          onClosedAfterPlace={(placed) => {
            onClose()
            showBetStack(placed)
          }}
        />
      </motion.div>
    </>
  )
}
