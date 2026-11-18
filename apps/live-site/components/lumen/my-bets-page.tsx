'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconInfoCircle,
  IconMinus,
  IconPlayerPlayFilled,
  IconSearch,
  IconX,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LumenTooltip } from '@/components/ui/lumen-tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DetailRow,
  EXPAND_EASE,
  ExpandPanel,
  ROW_HOVER,
  ROW_OPEN,
  TablePager,
} from '@/components/lumen/bet-history-page'
import { CasinoLiveWinsCarousel } from '@/components/lumen/casino-live-wins-carousel'
import { SoccerBetslip } from '@/components/lumen/soccer-betslip'
import { ModePillTrack } from '@/components/lumen/soccer-sport-page'
import { useShell } from '@/components/site/shell-context'
import { BET_STATUS_STYLE } from '@/lib/lumen/bet-history'
import { NFL_GAME_SECTIONS } from '@/lib/lumen/nfl-sport'
import { SOCCER_GAME_SECTIONS } from '@/lib/lumen/soccer-sport'
import { setSoccerSlip, useSoccerSlip } from '@/lib/lumen/soccer-slip-store'
import { rememberSportsReturn } from '@/lib/lumen/sports-return'
import {
  useSportsBets,
  type BetLeg,
  type BetStatus,
  type BetType,
  type SportsBet,
} from '@/lib/lumen/sports-bets-store'
import { cn } from '@/lib/utils'

const CARD = 'rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]'
/** Bet History chip recipe — selected reads like a picked daily box. */
const CHIP =
  'inline-flex h-[26px] items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors'

type Tab = 'pending' | 'settled' | 'all'
const TYPE_OPTIONS: { id: BetType | 'all'; label: string }[] = [
  { id: 'all', label: 'All bets' },
  { id: 'straight', label: 'Straights' },
  { id: 'parlay', label: 'Parlays' },
  { id: 'sgp', label: 'SGPs' },
]
const SPORT_OPTIONS = [
  { id: 'nfl', label: 'Football' },
  { id: 'soccer', label: 'Soccer' },
] as const

const TYPE_LABEL: Record<BetType, string> = {
  straight: 'Straight',
  sgp: 'Same Game Parlay',
  parlay: 'Parlay',
}

const money = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const signedMoney = (n: number) => `${n > 0 ? '+' : n < 0 ? '-' : ''}${money(Math.abs(n))}`

const DATE_FMT = new Intl.DateTimeFormat('en-US', {
  month: '2-digit',
  day: '2-digit',
  year: 'numeric',
  timeZone: 'America/New_York',
})
const DATE_TIME_FMT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/New_York',
})
const fmtDay = (iso: string) => DATE_FMT.format(new Date(iso))
const fmtStamp = (iso?: string) => (iso ? `${DATE_TIME_FMT.format(new Date(iso))} ET` : 'Pending')

function betTitle(bet: SportsBet): string {
  if (bet.legs.length === 1) return bet.legs[0]!.label
  return `${bet.legs.length}-Leg ${bet.type === 'sgp' ? 'SGP' : 'Parlay'}`
}

function betSubtitle(bet: SportsBet): string {
  if (bet.legs.length === 1) return `${bet.legs[0]!.market} · ${bet.legs[0]!.eventLabel}`
  if (bet.type === 'sgp') return bet.legs[0]!.eventLabel
  const games = new Set(bet.legs.map((l) => l.eventLabel)).size
  const sgps = new Set(bet.legs.map((l) => l.group).filter(Boolean)).size
  return `${games} games${sgps ? ` · includes ${sgps} SGP` : ''}`
}

const STATUS_COPY: Record<BetStatus, string> = {
  pending: 'Pending',
  won: 'Won',
  lost: 'Lost',
  push: 'Push',
  void: 'Void',
}
const STATUS_STYLE: Record<BetStatus, keyof typeof BET_STATUS_STYLE> = {
  pending: 'Pending',
  won: 'Won',
  lost: 'Lost',
  push: 'Cancelled',
  void: 'Cancelled',
}

/** Bet History badge — graded wins carry the amount. */
function StatusBadge({ bet, size = 'md' }: { bet: SportsBet; size?: 'sm' | 'md' }) {
  const label =
    bet.status === 'won' ? `Won ${money(bet.payout ?? bet.toWin)}` : STATUS_COPY[bet.status]
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border font-medium tabular-nums',
        size === 'sm' ? 'h-5 px-1.5 text-xs' : 'h-[26px] px-3 text-xs',
      )}
      style={BET_STATUS_STYLE[STATUS_STYLE[bet.status]]}
    >
      {label}
    </span>
  )
}

function LegNode({ status }: { status: BetStatus }) {
  if (status === 'won')
    return (
      <span className="flex size-4 items-center justify-center rounded-full bg-success">
        <IconCheck className="size-2.5 text-success-foreground" stroke={3.5} />
      </span>
    )
  if (status === 'lost')
    return (
      <span className="flex size-4 items-center justify-center rounded-full bg-destructive">
        <IconX className="size-2.5 text-white" stroke={3.5} />
      </span>
    )
  if (status === 'push' || status === 'void')
    return (
      <span className="flex size-4 items-center justify-center rounded-full bg-muted-foreground">
        <IconMinus className="size-2.5 text-background" stroke={3.5} />
      </span>
    )
  return <span className="block size-4 rounded-full border-2 border-muted-foreground bg-card" />
}

export function MyBetsPage() {
  const pathname = usePathname()
  const { loggedIn, openAuth, startNavigating } = useShell()
  const bets = useSportsBets()
  const slipPicks = useSoccerSlip()
  const [tab, setTab] = useState<Tab>('all')

  useEffect(() => {
    rememberSportsReturn(pathname)
  }, [pathname])
  const [type, setType] = useState<BetType | 'all'>('all')
  const [sport, setSport] = useState<'nfl' | 'soccer' | null>(null)
  const [query, setQuery] = useState('')

  const pendingCount = bets.filter((b) => b.status === 'pending').length
  const filtered = useMemo(
    () =>
      bets.filter((b) => {
        if (tab === 'pending' && b.status !== 'pending') return false
        if (tab === 'settled' && b.status === 'pending') return false
        if (type !== 'all' && b.type !== type) return false
        if (sport && !b.legs.some((l) => l.sport === sport)) return false
        if (query && !b.id.includes(query.trim())) return false
        return true
      }),
    [bets, tab, type, sport, query],
  )

  const summary = useMemo(() => {
    const settled = filtered.filter((b) => b.status !== 'pending')
    const back = settled.reduce((s, b) => s + (b.payout ?? 0), 0)
    return {
      count: filtered.length,
      staked: filtered.reduce((s, b) => s + b.stake, 0),
      pendingWin: filtered.filter((b) => b.status === 'pending').reduce((s, b) => s + b.toWin, 0),
      back,
      net: back - settled.reduce((s, b) => s + b.stake, 0),
    }
  }, [filtered])

  const filtersOn = type !== 'all' || sport !== null || query !== ''

  return (
    <section
      data-name="section-my-bets"
      className="mx-auto w-full max-w-[1440px] bg-background px-4 pb-14 pt-4 lg:px-6 lg:pt-6"
    >
      <div className="mb-4 flex items-center gap-1.5">
        <h1 className="text-xl font-semibold leading-7 text-foreground lg:text-2xl lg:leading-8">
          My Bets
        </h1>
        <LumenTooltip label="Open and settled sports bets" side="bottom">
          <button
            type="button"
            aria-label="About My Bets"
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <IconInfoCircle className="size-4" stroke={1.75} aria-hidden />
          </button>
        </LumenTooltip>
      </div>

      {!loggedIn ? (
        <div className={cn(CARD, 'flex flex-col items-center gap-2 px-6 py-14 text-center')}>
          <p className="text-sm font-semibold text-foreground">Login to see your bets</p>
          <p className="text-xs text-muted-foreground">
            Open bets, settled results and every Bet ID live here.
          </p>
          <Button type="button" className="mt-2 h-10 px-5" onClick={() => openAuth('login')}>
            Login
          </Button>
        </div>
      ) : (
        <>
          <ModePillTrack
            active={tab}
            onChange={setTab}
            modes={[
              { id: 'all', label: 'All' },
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'settled', label: 'Settled' },
            ]}
            ariaLabel="Bet status"
          />

          <div
            data-name="my-bets-figures"
            className={cn(
              CARD,
              'mb-4 grid grid-cols-2 overflow-hidden md:grid-cols-4',
              '[&>*]:border-border max-md:[&>*:nth-child(-n+2)]:border-b max-md:[&>*:nth-child(odd)]:border-r md:[&>*:not(:last-child)]:border-r',
            )}
          >
            <Figure label="Bets" value={String(summary.count)} />
            <Figure label="Staked" value={money(summary.staked)} />
            <Figure label="Potential return" value={money(summary.pendingWin)} />
            <Figure
              label="Net P&L"
              value={signedMoney(summary.net)}
              tone={summary.net > 0 ? 'success' : summary.net < 0 ? 'destructive' : undefined}
            />
          </div>

          <div data-name="sort-&-filters" className="mb-4 flex flex-wrap items-center gap-2">
            {TYPE_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                aria-pressed={type === o.id}
                onClick={() => setType(o.id)}
                className={cn(
                  CHIP,
                  type === o.id
                    ? 'border-foreground/25 bg-accent text-foreground'
                    : 'border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {o.label}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-border" aria-hidden />
            {SPORT_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                aria-pressed={sport === o.id}
                onClick={() => setSport(sport === o.id ? null : o.id)}
                className={cn(
                  CHIP,
                  sport === o.id
                    ? 'border-foreground/25 bg-accent text-foreground'
                    : 'border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {o.label}
                {sport === o.id ? <IconX className="size-3" stroke={2} aria-hidden /> : null}
              </button>
            ))}
            <div className="relative w-full sm:ml-auto sm:w-[200px]">
              <IconSearch
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                stroke={1.5}
              />
              <Input
                type="text"
                inputMode="numeric"
                value={query}
                onChange={(e) => setQuery(e.target.value.replace(/\D/g, ''))}
                placeholder="Bet ID"
                aria-label="Search by Bet ID"
                className="h-8 rounded-md border-border bg-background pl-9 text-base shadow-none md:text-sm"
              />
            </div>
          </div>

          <BetsTable
            key={`${tab}-${type}-${sport}-${query}`}
            bets={filtered}
            empty={
              tab === 'pending' && !filtersOn
                ? 'No open bets right now.'
                : 'No bets match the selected filters.'
            }
            onNavigate={(href) => startNavigating(href)}
          />
        </>
      )}

      <div className="-mx-4 mt-8 lg:-mx-6">
        <CasinoLiveWinsCarousel />
      </div>

      <SoccerBetslip
        picks={slipPicks}
        onRemove={(id) => setSoccerSlip((prev) => prev.filter((p) => p.id !== id))}
        onClear={() => setSoccerSlip([])}
        onChange={setSoccerSlip}
      />
    </section>
  )
}

function Figure({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'success' | 'destructive'
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 px-4 py-3.5 md:px-5 md:py-4">
      <span className="truncate text-xs leading-4 text-muted-foreground">{label}</span>
      <span
        className={cn(
          'truncate text-lg font-semibold leading-6 tabular-nums text-foreground',
          tone === 'success' && 'text-success',
          tone === 'destructive' && 'text-destructive',
        )}
      >
        {value}
      </span>
    </div>
  )
}

/** Live score for a leg's game, read from the board data. */
function liveScoreFor(href?: string): { line: string; clock: string } | null {
  if (!href) return null
  const id = href.split('/').pop()
  const nfl = href.startsWith('/sports/football')
  const sections = nfl ? NFL_GAME_SECTIONS : SOCCER_GAME_SECTIONS
  for (const section of sections) {
    const e = section.events.find((x) => x.id === id)
    if (!e) continue
    if (!e.live || !e.score) return null
    const [h, a] = e.score
    return {
      line: nfl ? `${e.awayAbbr} ${a}-${h} ${e.homeAbbr}` : `${e.homeAbbr} ${h}-${a} ${e.awayAbbr}`,
      clock: e.when,
    }
  }
  return null
}

function LiveScore({
  score,
  className,
}: {
  score: { line: string; clock: string }
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium tabular-nums',
        className,
      )}
    >
      <span className="inline-flex items-center gap-1 text-destructive">
        <IconPlayerPlayFilled className="size-3" aria-hidden />
        {score.clock}
      </span>
      <span className="text-foreground">{score.line}</span>
    </span>
  )
}

function BetsTable({
  bets,
  empty,
  onNavigate,
}: {
  bets: SportsBet[]
  empty: string
  onNavigate: (href: string) => void
}) {
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState('10')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const perPage = Number(rowsPerPage) || 10
  const pageCount = Math.max(1, Math.ceil(bets.length / perPage))
  const safePage = Math.min(page, pageCount)
  const pageRows = bets.slice((safePage - 1) * perPage, safePage * perPage)

  const toggle = (id: string) => setExpandedId((cur) => (cur === id ? null : id))

  return (
    <div
      data-name="table-my-bets"
      className={cn(CARD, '[&>div]:overflow-x-hidden md:[&>div]:overflow-x-auto')}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="hidden h-11 w-[120px] text-xs md:table-cell">Date</TableHead>
            <TableHead className="h-11 text-xs">Description</TableHead>
            <TableHead className="hidden h-11 text-xs md:table-cell">Type</TableHead>
            <TableHead className="hidden h-11 text-xs md:table-cell">Odds</TableHead>
            <TableHead className="hidden h-11 text-xs md:table-cell">Risk</TableHead>
            <TableHead className="hidden h-11 text-xs lg:table-cell">To Win</TableHead>
            <TableHead className="h-11 w-px whitespace-nowrap text-xs">Status</TableHead>
            <TableHead className="hidden h-11 w-[60px] text-center text-xs md:table-cell">
              More
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                {empty}
              </TableCell>
            </TableRow>
          ) : (
            pageRows.map((bet) => {
              const open = expandedId === bet.id
              const live =
                bet.status === 'pending' && new Set(bet.legs.map((l) => l.eventHref)).size === 1
                  ? liveScoreFor(bet.legs[0]!.eventHref)
                  : null
              return (
                <Fragment key={bet.id}>
                  <TableRow
                    role="button"
                    tabIndex={0}
                    aria-expanded={open}
                    data-name="my-bets-row"
                    className={cn(
                      'cursor-pointer border-border transition-colors',
                      ROW_HOVER,
                      open && ROW_OPEN,
                    )}
                    onClick={() => toggle(bet.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggle(bet.id)
                      }
                    }}
                  >
                    <TableCell className="hidden py-3 font-medium tabular-nums md:table-cell">
                      {fmtDay(bet.placedAt)}
                    </TableCell>
                    <TableCell className="min-w-0 max-w-0 py-3 md:max-w-[320px]">
                      <div className="truncate font-medium text-foreground">{betTitle(bet)}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {betSubtitle(bet)}
                      </div>
                      {live ? <LiveScore score={live} className="mt-1" /> : null}
                    </TableCell>
                    <TableCell className="hidden py-3 md:table-cell">
                      {TYPE_LABEL[bet.type]}
                    </TableCell>
                    <TableCell className="hidden py-3 tabular-nums md:table-cell">
                      {bet.odds}
                    </TableCell>
                    <TableCell className="hidden py-3 tabular-nums md:table-cell">
                      {money(bet.stake)}
                    </TableCell>
                    <TableCell className="hidden py-3 tabular-nums lg:table-cell">
                      {money(bet.toWin)}
                    </TableCell>
                    <TableCell className="w-px whitespace-nowrap py-3 align-middle">
                      <div className="inline-flex items-center gap-1.5">
                        <StatusBadge bet={bet} />
                        <span
                          className="inline-flex size-8 shrink-0 items-center justify-center md:hidden"
                          aria-hidden
                        >
                          <IconChevronDown
                            className={cn(
                              'size-4 text-muted-foreground transition-transform',
                              EXPAND_EASE,
                              open && 'rotate-180',
                            )}
                            stroke={2}
                          />
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden py-3 text-center md:table-cell">
                      <span className="inline-flex size-8 items-center justify-center" aria-hidden>
                        <IconChevronDown
                          className={cn(
                            'size-4 text-muted-foreground transition-transform',
                            EXPAND_EASE,
                            open && 'rotate-180',
                          )}
                          stroke={2}
                        />
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableCell colSpan={8} className="border-0 p-0">
                      <ExpandPanel open={open}>
                        <div className="border-b border-border bg-background">
                          <BetExpanded bet={bet} onNavigate={onNavigate} />
                        </div>
                      </ExpandPanel>
                    </TableCell>
                  </TableRow>
                </Fragment>
              )
            })
          )}
        </TableBody>
      </Table>
      <TablePager
        page={safePage}
        pageCount={pageCount}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsChange={(next) => {
          setRowsPerPage(next)
          setPage(1)
        }}
      />
    </div>
  )
}

/** Bet History expand — selections on a rail, then the ticket facts. */
function BetExpanded({ bet, onNavigate }: { bet: SportsBet; onNavigate: (href: string) => void }) {
  const refunded = bet.status === 'push' || bet.status === 'void'
  return (
    <div className="flex flex-col gap-5 px-3 py-4 lg:flex-row lg:items-start lg:gap-16">
      <ol className="flex w-full min-w-0 flex-col lg:max-w-[420px]">
        {bet.legs.map((leg, i) => {
          const groupStart = leg.group && leg.group !== bet.legs[i - 1]?.group
          return (
            <li key={`${leg.id}-${i}`}>
              {groupStart ? (
                <div className="mb-2 pl-7 text-xs font-semibold text-foreground">
                  Same Game Parlay
                </div>
              ) : null}
              <LegLine leg={leg} last={i === bet.legs.length - 1} onNavigate={onNavigate} />
            </li>
          )
        })}
      </ol>
      <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:gap-10 lg:gap-16">
        <div className="flex w-full max-w-[300px] flex-col gap-2.5">
          <DetailRow label="Bet ID:">{bet.id}</DetailRow>
          <DetailRow label="Accepted Date:">{fmtStamp(bet.placedAt)}</DetailRow>
          <DetailRow label="Graded Date:">{fmtStamp(bet.settledAt)}</DetailRow>
        </div>
        <div className="flex w-full max-w-[200px] flex-col gap-2.5">
          <DetailRow label="Risk:">{money(bet.stake)}</DetailRow>
          <DetailRow label="To Win:">{money(bet.toWin)}</DetailRow>
          {bet.status !== 'pending' ? (
            <DetailRow label={refunded ? 'Refunded:' : 'Payout:'}>
              {money(bet.payout ?? 0)}
            </DetailRow>
          ) : null}
          <DetailRow label="Status:">
            <StatusBadge bet={bet} size="sm" />
          </DetailRow>
        </div>
      </div>
    </div>
  )
}

function LegLine({
  leg,
  last,
  onNavigate,
}: {
  leg: BetLeg
  last: boolean
  onNavigate: (href: string) => void
}) {
  const score = liveScoreFor(leg.eventHref)
  return (
    <div className={cn('relative flex gap-3', !last && 'pb-3.5')}>
      {!last ? (
        <span className="absolute bottom-0 left-[7.5px] top-5 w-px bg-border" aria-hidden />
      ) : null}
      <span className="relative mt-0.5 flex shrink-0">
        <LegNode status={leg.status} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="min-w-0 flex-1 truncate text-xs font-semibold leading-4 text-foreground">
            {leg.label}
          </span>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{leg.odds}</span>
        </div>
        <div className="truncate text-xs leading-4 text-muted-foreground">
          {leg.market} · {leg.eventLabel}
        </div>
        {score && leg.status === 'pending' ? (
          <div className="mt-1">
            <LiveScore score={score} />
          </div>
        ) : null}
        {leg.eventHref ? (
          <Link
            href={leg.eventHref}
            onClick={() => onNavigate(leg.eventHref!)}
            className="mt-1 flex w-max items-center gap-0.5 text-xs font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
          >
            {leg.status === 'pending' && score ? 'Watch live' : 'View event'}
            <IconChevronRight className="size-3" stroke={2} />
          </Link>
        ) : (
          <div className="mt-0.5 text-xs text-muted-foreground">No longer available</div>
        )}
      </div>
    </div>
  )
}
