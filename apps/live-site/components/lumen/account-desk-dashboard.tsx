'use client'

import Link from 'next/link'
import { createPortal } from 'react-dom'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  IconArrowsExchange,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCreditCard,
  IconHistory,
  IconX,
} from '@tabler/icons-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from '@/components/ui/carousel'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Typography } from '@/components/ui/typography'
import {
  CASINO_TILE_H,
  CasinoGameTile,
} from '@/components/lumen/casino-game-tile'
import { FilterSelectBox } from '@/components/lumen/filter-select-box'
import { CasinoLobbyBannerRow } from '@/components/lumen/casino-lobby-banners'
import { CASINO_LOBBY_PROMO_BANNERS } from '@/lib/lumen/casino-lobby-promos'
import { useShell } from '@/components/site/shell-context'
import {
  DESK_PERIODS,
  deskBiggestLosses,
  deskBiggestWins,
  deskPnL,
  deskPlayerDossier,
  deskTopPerformers,
  formatDeskMoney,
  formatDeskVolume,
  type DeskBiggestWin,
  type DeskPeriod,
  type DeskPlayerDossier,
  type DeskTopPerformer,
} from '@/lib/lumen/account-desk'
import {
  BET_HISTORY_ROWS,
  BET_STATUS_STYLE,
  type BetStatus,
} from '@/lib/lumen/bet-history'
import {
  formatTrend,
  myTrendsShelves,
} from '@/lib/lumen/casino-trends'
import { VIP_LEVEL_COLOR, type VipLevel } from '@/lib/lumen/my-account'
import type { VipTierId } from '@/lib/lumen/vip-hub'
import { PAYMENT_ROWS } from '@/lib/lumen/payments'
import { TRANSACTION_ROWS } from '@/lib/lumen/transactions'
import { cn } from '@/lib/utils'

const CARD =
  'rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]'

const ROW_HOVER = 'hover:!bg-surface-muted-3'

/** Same chrome as casino lobby / Trends shelves — square, secondary, desktop only. */
const CAROUSEL_ARROW =
  'inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-secondary p-0 text-foreground transition-colors hover:bg-muted disabled:opacity-45'

/**
 * Trading-desk style overview under My Account profile header.
 * Flat My Trends shelves (casino carousel chrome) + win/loss cards + activity previews.
 */
export function AccountDeskDashboard() {
  const { launchGame, startNavigating, profile, vipTier } = useShell()
  const [period, setPeriod] = useState<DeskPeriod>('today')
  const pnl = useMemo(() => deskPnL(period), [period])
  const nickname = (() => {
    const n = profile.fullName.trim()
    if (!n || /^B\d{5,}$/i.test(n)) return 'stottiefingaz'
    return n
  })()
  const youVipLevel = vipTierToLevel(vipTier)
  const topPerf = useMemo(
    () => deskTopPerformers(period, pnl.net, nickname, youVipLevel),
    [period, pnl.net, nickname, youVipLevel],
  )
  const wins = useMemo(() => deskBiggestWins(period), [period])
  const losses = useMemo(() => deskBiggestLosses(period), [period])
  const shelves = useMemo(() => myTrendsShelves(period), [period])
  const bets = useMemo(() => BET_HISTORY_ROWS.slice(0, 6), [])
  const txs = useMemo(() => TRANSACTION_ROWS.slice(0, 6), [])
  const pays = useMemo(() => PAYMENT_ROWS.slice(0, 6), [])

  return (
    <div
      data-name="module-account-desk"
      className="flex w-full flex-col gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold leading-7 text-foreground lg:text-2xl lg:leading-8">
          Performance
        </h2>
        <FilterSelectBox
          label="Period"
          value={period}
          options={DESK_PERIODS.map((o) => ({ id: o.id, label: o.label }))}
          onChange={setPeriod}
          triggerClassName="w-[156px]"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <PnLStrip pnl={pnl} />
        <Top10Block topPerf={topPerf} />
      </div>

      {/* Flat shelves — no outer card; casino carousel arrows. */}
      <div className="flex flex-col gap-5 py-1" data-name="desk-my-trends">
        <h2 className="text-xl font-semibold leading-7 text-foreground lg:text-2xl lg:leading-8">
          My Trends
        </h2>
        {shelves.map((shelf) => (
          <DeskShelf
            key={shelf.id}
            title={shelf.title}
            rows={shelf.rows}
            onLaunch={launchGame}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BiggestTable
          title="Biggest wins"
          rows={wins}
          tone="win"
          onLaunch={launchGame}
        />
        <BiggestTable
          title="Biggest losses"
          rows={losses}
          tone="loss"
          onLaunch={launchGame}
        />
      </div>

      {/* Promo carousel breaks up the dense table grid below. Promo cards only —
          VIP / Daily Races cards belong on the casino lobby, not the account desk. */}
      <CasinoLobbyBannerRow
        flush
        vip={false}
        dailyRaces={false}
        promos={CASINO_LOBBY_PROMO_BANNERS}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <MiniTable
          title="Bet History"
          href="/account/bet-history"
          icon={<IconHistory className="size-4" strokeWidth={1.5} />}
          onViewAll={startNavigating}
        >
          {bets.map((row) => (
            <MiniRow
              key={row.id}
              title={row.description}
              meta={row.type}
              value={row.status === 'Won' ? row.toWin : row.risk}
              valueClass={
                row.status === 'Won'
                  ? 'text-success'
                  : row.status === 'Lost'
                    ? 'text-destructive'
                    : undefined
              }
              status={row.status}
              statusStyle={BET_STATUS_STYLE[row.status as BetStatus]}
            />
          ))}
        </MiniTable>

        <MiniTable
          title="Transactions"
          href="/account/transactions"
          icon={<IconArrowsExchange className="size-4" strokeWidth={1.5} />}
          onViewAll={startNavigating}
        >
          {txs.map((row) => (
            <MiniRow
              key={row.id}
              title={row.description}
              meta={`${row.type} · ${row.date}`}
              value={formatDeskMoney(row.amount, true)}
              valueClass={row.amount > 0 ? 'text-success' : undefined}
              status={row.product}
            />
          ))}
        </MiniTable>

        <MiniTable
          title="Payments"
          href="/account/payments"
          icon={<IconCreditCard className="size-4" strokeWidth={1.5} />}
          onViewAll={startNavigating}
        >
          {pays.map((row) => (
            <MiniRow
              key={row.id}
              title={row.method}
              meta={`${row.type} · ${row.date}`}
              value={formatDeskMoney(row.totalAmount, true)}
              valueClass={row.totalAmount > 0 ? 'text-success' : undefined}
              status={row.detail.status}
              statusClass={
                row.detail.status === 'Pending'
                  ? 'text-warning'
                  : row.detail.status === 'Declined'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
              }
            />
          ))}
        </MiniTable>
      </div>
    </div>
  )
}



function vipTierToLevel(tier: VipTierId): VipLevel {
  if (tier === 'silver') return 'Silver'
  if (tier === 'gold') return 'Gold'
  return 'Bronze'
}

function VipLevelCrown({
  level,
  size = 14,
}: {
  level: VipLevel
  size?: number
}) {
  return (
    <span
      className="inline-block shrink-0"
      title={level}
      aria-label={`${level} VIP`}
      style={{
        width: size,
        height: size,
        backgroundColor: VIP_LEVEL_COLOR[level],
        WebkitMaskImage: 'url(/shell/figma/account/vip-crown.svg)',
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskImage: 'url(/shell/figma/account/vip-crown.svg)',
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
      }}
    />
  )
}


function PnLStrip({
  pnl,
}: {
  pnl: ReturnType<typeof deskPnL>
}) {
  const positive = pnl.net >= 0

  return (
    <section
      className={cn(CARD, 'flex flex-col overflow-hidden')}
      data-name="desk-pnl"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Net P&L
          </p>
          <p
            className={cn(
              'mt-1 font-semibold tabular-nums tracking-tight text-[28px] leading-none sm:text-[32px]',
              positive ? 'text-success' : 'text-destructive',
            )}
          >
            {formatDeskMoney(pnl.net, true)}
          </p>
        </div>
        <span
          className={cn(
            'rounded-md border px-2 py-1 text-[11px] font-semibold tabular-nums',
            positive
              ? 'border-success/30 bg-success/10 text-success'
              : 'border-destructive/30 bg-destructive/10 text-destructive',
          )}
        >
          {positive ? 'Profit' : 'Loss'}
        </span>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        <FinanceMetric label="Win rate" value={`${pnl.winRate}%`} />
        <FinanceMetric label="Volume" value={formatDeskVolume(pnl.volume)} />
        <FinanceMetric label="Sessions" value={String(pnl.sessions)} />
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2 sm:px-4">
        <DeskAreaChart
          series={pnl.series}
          net={pnl.net}
          ariaLabel="Net P&L over the selected period"
        />
      </div>
    </section>
  )
}

function FinanceMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-3 sm:px-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold tabular-nums text-foreground sm:text-base">
        {value}
      </p>
    </div>
  )
}

function Top10Block({
  topPerf,
}: {
  topPerf: ReturnType<typeof deskTopPerformers>
}) {
  const { board, you, youInTop10 } = topPerf
  const [selected, setSelected] = useState<DeskTopPerformer | null>(null)
  const leaderNet = Math.max(...board.map((r) => r.net), you.net, 1)
  const leader = board.find((r) => r.rank === 1)
  const delta = you.net - (leader?.net ?? leaderNet)
  const gapLabel =
    Math.abs(delta) < 0.005
      ? 'Tied for #1'
      : delta > 0
        ? `${formatDeskMoney(delta, true)} ahead of #1`
        : `${formatDeskMoney(delta, true)} behind #1`

  const rows = youInTop10 ? board : [...board, you]
  const dossier = useMemo(
    () => (selected ? deskPlayerDossier(selected) : null),
    [selected],
  )

  return (
    <section
      className={cn(CARD, 'flex flex-col overflow-hidden')}
      data-name="desk-vs-top10"
    >
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            vs Top 10
          </p>
          <button
            type="button"
            onClick={() => setSelected(you)}
            className="mt-1 flex min-w-0 max-w-full items-center gap-1.5 text-left text-base font-semibold text-foreground hover:underline"
          >
            <VipLevelCrown level={you.vipLevel} size={16} />
            <span className="truncate">{you.player}</span>
          </button>
          <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
            {youInTop10 ? `Rank #${you.rank}` : `Outside top 10 · #${you.rank}`}
            {' · '}
            <span className={you.net >= 0 ? 'text-success' : 'text-destructive'}>
              {formatDeskMoney(you.net, true)}
            </span>
            {' · '}
            {gapLabel}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground sm:px-5">
        <span className="w-7 shrink-0">#</span>
        <span className="min-w-0 flex-1">Player</span>
        <span className="w-[88px] shrink-0 text-right sm:w-[108px]">Net</span>
      </div>

      <ul className="max-h-[280px] flex-1 overflow-y-auto overscroll-contain shell-scroll">
        {rows.map((row) => (
          <Top10FinanceRow
            key={row.id}
            row={row}
            maxNet={leaderNet}
            onOpen={() => setSelected(row)}
          />
        ))}
      </ul>

      {dossier ? (
        <PlayerDossierModal dossier={dossier} onClose={() => setSelected(null)} />
      ) : null}
    </section>
  )
}

function Top10FinanceRow({
  row,
  maxNet,
  onOpen,
}: {
  row: DeskTopPerformer
  maxNet: number
  onOpen: () => void
}) {
  const up = row.net >= 0
  const width = Math.max(4, Math.round((Math.abs(row.net) / Math.max(maxNet, 1)) * 100))
  return (
    <li
      className={cn(
        'relative flex items-center gap-2 border-b border-border/80 px-4 py-2.5 last:border-b-0 sm:px-5',
        row.isYou ? 'bg-primary/10' : 'hover:bg-surface-muted-3',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 opacity-[0.14]',
          row.isYou ? 'bg-primary' : up ? 'bg-success' : 'bg-destructive',
        )}
        style={{ width: `${width}%` }}
      />
      <span className="relative w-7 shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
        {row.rank}
      </span>
      <button
        type="button"
        onClick={onOpen}
        className="relative flex min-w-0 flex-1 items-center gap-1.5 text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
      >
        <VipLevelCrown level={row.vipLevel} />
        <span className="min-w-0 truncate text-sm font-medium text-foreground">
          {row.player}
        </span>
        {row.isYou ? (
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-primary">
            You
          </span>
        ) : null}
      </button>
      <span
        className={cn(
          'relative w-[88px] shrink-0 text-right text-sm font-semibold tabular-nums sm:w-[108px]',
          up ? 'text-success' : 'text-destructive',
        )}
      >
        {formatDeskMoney(row.net, true)}
      </span>
    </li>
  )
}

function DeskAreaChart({
  series,
  net,
  ariaLabel,
}: {
  series: number[]
  net: number
  ariaLabel: string
}) {
  const plotRef = useRef<HTMLDivElement>(null)
  const [plotW, setPlotW] = useState(420)
  const [hover, setHover] = useState<number | null>(null)
  const positive = net >= 0

  useEffect(() => {
    const el = plotRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setPlotW(el.clientWidth || 420))
    ro.observe(el)
    setPlotW(el.clientWidth || 420)
    return () => ro.disconnect()
  }, [])

  const n = series.length
  const lo0 = Math.min(...series, 0)
  const hi0 = Math.max(...series, 0)
  const pad = (hi0 - lo0) * 0.12 || 40
  const lo = lo0 - pad
  const hi = hi0 + pad
  const H = 168
  const m = { t: 12, r: 12, b: 22, l: 58 }
  const pw = Math.max(40, plotW - m.l - m.r)
  const ph = H - m.t - m.b
  const x = (i: number) => m.l + (n < 2 ? 0 : (i / (n - 1)) * pw)
  const y = (v: number) => m.t + ph - ((v - lo) / (hi - lo)) * ph
  const tipI = hover ?? n - 1
  const tipV = series[tipI] ?? net
  const stroke = positive ? 'var(--success)' : 'var(--destructive)'
  const fill = positive ? 'color-mix(in oklab, var(--success) 22%, transparent)' : 'color-mix(in oklab, var(--destructive) 22%, transparent)'

  let line = ''
  series.forEach((v, i) => {
    line += i === 0 ? `M${x(i)},${y(v)}` : `L${x(i)},${y(v)}`
  })
  const area = `${line} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`

  /* Prefer hi / 0 / lo, but drop labels that land on top of each other. */
  const tickCandidates = [hi0, 0, lo0].filter((v, i, arr) => arr.indexOf(v) === i)
  const ticks: number[] = []
  for (const tv of tickCandidates) {
    const ty = y(tv)
    if (ticks.every((kept) => Math.abs(y(kept) - ty) >= 14)) ticks.push(tv)
  }

  return (
    <div ref={plotRef} className="min-w-0">
      <svg
        width={plotW}
        height={H}
        viewBox={`0 0 ${plotW} ${H}`}
        className="w-full overflow-visible"
        role="img"
        aria-label={ariaLabel}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const px = e.clientX - rect.left
          const i = Math.round(((px - m.l) / pw) * (n - 1))
          setHover(Math.max(0, Math.min(n - 1, i)))
        }}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((tv) => (
          <g key={`t-${tv}`}>
            <line
              x1={m.l}
              x2={m.l + pw}
              y1={y(tv)}
              y2={y(tv)}
              className="stroke-border"
              strokeWidth={1}
              strokeDasharray={tv === 0 ? undefined : '3 4'}
            />
            <text
              x={m.l - 6}
              y={y(tv) + 3}
              textAnchor="end"
              className="fill-muted-foreground"
              fontSize={9}
            >
              {formatDeskMoney(tv, true)}
            </text>
          </g>
        ))}
        <path d={area} fill={fill} />
        <path
          d={line}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx={x(tipI)} cy={y(tipV)} r={hover == null ? 3 : 4.5} fill={stroke} />
        <text
          x={m.l}
          y={H - 6}
          className="fill-muted-foreground"
          fontSize={9}
        >
          Start
        </text>
        <text
          x={m.l + pw}
          y={H - 6}
          textAnchor="end"
          className="fill-muted-foreground"
          fontSize={9}
        >
          Now
        </text>
      </svg>
      {hover != null ? (
        <p className="mt-0.5 text-center text-[11px] tabular-nums text-muted-foreground">
          {formatDeskMoney(tipV, true)}
        </p>
      ) : (
        <p className="mt-0.5 h-[15px]" aria-hidden />
      )}
    </div>
  )
}


function BiggestTable({
  title,
  rows,
  tone,
  onLaunch,
}: {
  title: string
  rows: DeskBiggestWin[]
  tone: 'win' | 'loss'
  onLaunch: ReturnType<typeof useShell>['launchGame']
}) {
  return (
    <div className={cn(CARD, 'overflow-hidden')} data-name={`desk-${tone}s`}>
      <div className="border-b border-border px-4 py-3.5 sm:px-5">
        <Typography as="h2" shape="h4" weight="semibold" className="text-base sm:text-lg">
          {title}
        </Typography>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-11 pl-4 text-xs sm:pl-5">Game</TableHead>
            <TableHead className="h-11 text-xs">
              {tone === 'win' ? 'Payout' : 'Loss'}
            </TableHead>
            <TableHead className="hidden h-11 text-xs sm:table-cell">Multi</TableHead>
            <TableHead className="h-11 pr-4 text-right text-xs sm:pr-5">When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className={cn('border-border transition-colors', ROW_HOVER)}
            >
              <TableCell className="py-2.5 pl-4 sm:pl-5">
                <button
                  type="button"
                  className="flex max-w-full items-center gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={(e) => onLaunch(row.game, e.currentTarget)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={row.game.imageSrc}
                    alt=""
                    width={40}
                    height={54}
                    className="size-10 shrink-0 rounded-md object-cover"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {row.game.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {row.game.vendor}
                    </span>
                  </span>
                </button>
              </TableCell>
              <TableCell
                className={cn(
                  'py-2.5 tabular-nums font-medium',
                  tone === 'win' ? 'text-success' : 'text-destructive',
                )}
              >
                {formatDeskMoney(row.payout, true)}
              </TableCell>
              <TableCell className="hidden py-2.5 tabular-nums text-muted-foreground sm:table-cell">
                {row.multi.toFixed(1)}×
              </TableCell>
              <TableCell className="py-2.5 pr-4 text-right text-muted-foreground sm:pr-5">
                {row.when}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function MiniTable({
  title,
  href,
  icon,
  onViewAll,
  children,
}: {
  title: string
  href: string
  icon: ReactNode
  onViewAll: (href: string) => void
  children: ReactNode
}) {
  return (
    <div className={cn(CARD, 'flex flex-col overflow-hidden')} data-name={`desk-mini-${title}`}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground">
            {icon}
          </span>
          <Typography as="h3" shape="h4" weight="semibold" className="truncate text-sm sm:text-base">
            {title}
          </Typography>
        </div>
        <Link
          href={href}
          className="shrink-0 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => onViewAll(href)}
        >
          View all
        </Link>
      </div>
      <ul className="flex flex-col divide-y divide-border">{children}</ul>
    </div>
  )
}

function MiniRow({
  title,
  meta,
  value,
  valueClass,
  status,
  statusStyle,
  statusClass,
}: {
  title: string
  meta: string
  value: string
  valueClass?: string
  status: string
  statusStyle?: { backgroundColor: string; borderColor: string; color: string }
  statusClass?: string
}) {
  return (
    <li className={cn('flex items-center gap-3 px-4 py-2.5 transition-colors', ROW_HOVER)}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{meta}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={cn('text-sm font-medium tabular-nums text-foreground', valueClass)}>
          {value}
        </p>
        {statusStyle ? (
          <span
            className="mt-0.5 inline-flex rounded border px-1.5 py-px text-[10px] font-medium leading-4"
            style={statusStyle}
          >
            {status}
          </span>
        ) : (
          <p className={cn('text-[11px] font-medium uppercase tracking-wide', statusClass ?? 'text-muted-foreground')}>
            {status}
          </p>
        )}
      </div>
    </li>
  )
}

function DeskShelf({
  title,
  rows,
  onLaunch,
}: {
  title: string
  rows: ReturnType<typeof myTrendsShelves>[number]['rows']
  onLaunch: ReturnType<typeof useShell>['launchGame']
}) {
  return (
    <section className="py-0.5">
      <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
        <DeskCarouselChrome title={title} />
        <CarouselContent className="!ml-0 gap-3 py-3">
          {rows.map((row) => (
            <CarouselItem
              key={`${title}-${row.game.id}`}
              className="basis-auto pl-0 first:pl-0 last:pr-0"
            >
              <div
                className="flex w-[152px] shrink-0 flex-col"
                style={{ minHeight: CASINO_TILE_H + 56 }}
              >
                <CasinoGameTile game={row.game} onLaunch={onLaunch} hideTitle />
                <p className="mt-2 truncate text-sm font-medium text-foreground">
                  {row.game.title}
                </p>
                <p className="text-xs tabular-nums text-foreground">{row.stat}</p>
                <div className="mt-0.5 flex items-center justify-between gap-1 text-[11px]">
                  <span className="truncate text-muted-foreground">{row.detail}</span>
                  <span
                    className={cn(
                      'shrink-0 tabular-nums font-medium',
                      row.trend > 0
                        ? 'text-success'
                        : row.trend < 0
                          ? 'text-destructive'
                          : 'text-muted-foreground',
                    )}
                  >
                    {formatTrend(row.trend)}
                  </span>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}

/** Desktop arrows only — same as casino Trends / lobby shelves. */
function DeskCarouselChrome({ title }: { title: string }) {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel()

  return (
    <header className="mb-1 flex min-h-9 items-center justify-between gap-3">
      <Typography
        as="h3"
        shape="h4"
        weight="semibold"
        className="min-w-0 truncate text-sm sm:text-base"
      >
        {title}
      </Typography>
      <div className="hidden items-center gap-1 md:flex">
        <button
          type="button"
          aria-label="Previous"
          className={CAROUSEL_ARROW}
          disabled={!canScrollPrev}
          onClick={scrollPrev}
        >
          <IconChevronLeft className="size-4" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-label="Next"
          className={CAROUSEL_ARROW}
          disabled={!canScrollNext}
          onClick={scrollNext}
        >
          <IconChevronRight className="size-4" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  )
}


const DOSSIER_EXPAND_EASE = 'duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'

function DossierSection({
  title,
  children,
  defaultOpen = true,
  className,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className={cn('flex flex-col', className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 py-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="min-w-0 flex-1 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {title}
        </span>
        <IconChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none',
            DOSSIER_EXPAND_EASE,
            open && 'rotate-180',
          )}
          strokeWidth={2.25}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows] motion-reduce:transition-none',
          DOSSIER_EXPAND_EASE,
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pt-2">{children}</div>
        </div>
      </div>
    </section>
  )
}


function PlayerDossierModal({
  dossier,
  onClose,
}: {
  dossier: DeskPlayerDossier
  onClose: () => void
}) {
  const [portalReady, setPortalReady] = useState(false)
  const { launchGame } = useShell()

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  if (!portalReady) return null

  return createPortal(
    <div
      data-player-dossier-root=""
      data-brand="betonline"
      className="dark fixed inset-0 z-[260] flex items-end justify-center p-3 sm:items-center sm:p-5 text-foreground"
      role="presentation"
      onClick={onClose}
    >
      <div aria-hidden className="absolute inset-0 bg-black/70" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${dossier.player} activity`}
        className={cn(
          'relative z-10 flex max-h-[min(88svh,720px)] w-full max-w-[480px] flex-col overflow-hidden',
          'rounded-[10px] border border-white/15 bg-[#1a1a1a] shadow-[0_0_16px_rgba(0,0,0,0.06)]',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Player
            </p>
            <div className="mt-1 flex min-w-0 items-center gap-1.5">
              <VipLevelCrown level={dossier.vipLevel} size={16} />
              <h2 className="truncate text-lg font-semibold text-foreground">
                {dossier.player}
              </h2>
              {dossier.isYou ? (
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  You
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
              Rank #{dossier.rank}
              {' · '}
              <span className={dossier.net >= 0 ? 'text-success' : 'text-destructive'}>
                {formatDeskMoney(dossier.net, true)}
              </span>
              {' · '}
              {dossier.vipLevel} VIP
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent"
          >
            <IconX className="size-4" strokeWidth={2} />
          </button>
        </div>

        <div className="shell-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          <DossierSection title="Sports mix" defaultOpen>
            <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card/40 p-3">
              {dossier.sportsMix.map((row) => (
                <div key={row.sport} className="flex items-center gap-2">
                  <span className="w-[72px] shrink-0 text-xs font-medium text-foreground">
                    {row.sport}
                  </span>
                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
                    {row.pct}%
                  </span>
                </div>
              ))}
            </div>
          </DossierSection>

          <DossierSection title="Last 5 sports bets" className="mt-3">
            <ul className="overflow-hidden rounded-lg border border-border">
              {dossier.recentBets.map((bet) => (
                <li
                  key={bet.id}
                  className="flex items-start gap-3 border-b border-border/80 px-3 py-2.5 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {bet.event}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-foreground">
                      {bet.selection}
                      <span className="text-muted-foreground">
                        {' · '}
                        {bet.market}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
                      {bet.sport}
                      {' · '}
                      Risk {formatDeskMoney(bet.stake)} · To win{' '}
                      {formatDeskMoney(bet.toWin)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold',
                      bet.status === 'Won' &&
                        'border-success/40 bg-success/10 text-success',
                      bet.status === 'Lost' &&
                        'border-destructive/40 bg-destructive/10 text-destructive',
                      bet.status === 'Pending' &&
                        'border-warning/40 bg-warning/10 text-warning',
                    )}
                  >
                    {bet.status}
                  </span>
                </li>
              ))}
            </ul>
          </DossierSection>

          <DossierSection title="Last 5 casino games" className="mt-3 pb-1">
            <ul className="overflow-hidden rounded-lg border border-border">
              {dossier.casinoGames.map((row) => (
                <li
                  key={row.game.id}
                  className="flex items-center gap-3 border-b border-border/80 px-3 py-2.5 last:border-b-0"
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={(e) => launchGame(row.game, e.currentTarget)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={row.game.imageSrc}
                      alt=""
                      width={40}
                      height={54}
                      className="size-10 shrink-0 rounded-md object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {row.game.title}
                      </span>
                      <span className="block text-[11px] tabular-nums text-muted-foreground">
                        {row.spins} spins
                      </span>
                    </span>
                  </button>
                  <span
                    className={cn(
                      'shrink-0 text-sm font-semibold tabular-nums',
                      row.net >= 0 ? 'text-success' : 'text-destructive',
                    )}
                  >
                    {formatDeskMoney(row.net, true)}
                  </span>
                </li>
              ))}
            </ul>
          </DossierSection>
        </div>
      </div>
    </div>,
    document.body,
  )
}

