'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Typography } from '@/components/ui/typography'
import { FilterSelectBox } from '@/components/lumen/filter-select-box'
import { useShell } from '@/components/site/shell-context'
import {
  TRENDS_CHART_VARS,
  TRENDS_METRICS,
  TRENDS_RANGES,
  formatMetric,
  formatMetricDelta,
  formatPlays,
  metricAt,
  seedMarketSeries,
  tickMarketSeries,
  type MarketGameSeries,
  type TrendsMetric,
  type TrendsPeriod,
  type TrendsRangeMins,
} from '@/lib/lumen/casino-trends'
import { cn } from '@/lib/utils'

const CARD =
  'rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]'

/** Live step chart for top-5 Overall games — Kalshi-style board. */
export function CasinoTrendsMarkets({ period }: { period: TrendsPeriod }) {
  const { launchGame } = useShell()
  const [series, setSeries] = useState<MarketGameSeries[]>(() =>
    seedMarketSeries(period),
  )
  const [metric, setMetric] = useState<TrendsMetric>('rate')
  const [range, setRange] = useState<TrendsRangeMins>(180)
  const plotRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [plotW, setPlotW] = useState(600)

  useEffect(() => {
    setSeries(seedMarketSeries(period))
  }, [period])

  useEffect(() => {
    const id = window.setInterval(() => {
      setSeries((prev) => tickMarketSeries(prev))
    }, 1200)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const el = plotRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setPlotW(el.clientWidth || 600))
    ro.observe(el)
    setPlotW(el.clientWidth || 600)
    return () => ro.disconnect()
  }, [])

  const last = Math.max(0, (series[0]?.buckets.length ?? 1) - 1)
  const from = Math.max(0, last - range + 1)
  const idx = useMemo(() => {
    const out: number[] = []
    for (let i = from; i <= last; i++) out.push(i)
    return out
  }, [from, last])

  const values = useMemo(
    () =>
      series.map((_, gi) =>
        idx.map((i) =>
          metricAt(series, gi, i, metric, metric === 'spins' ? 5 : 30),
        ),
      ),
    [series, idx, metric],
  )

  const allVals = values.flat()
  const lo0 = metric === 'spins' ? 0 : Math.min(...allVals, 0)
  const hi0 = Math.max(...allVals, 1)
  const pad = (hi0 - lo0) * 0.12 || 1
  const lo = metric === 'spins' ? 0 : lo0 - pad
  const hi = hi0 + pad

  const H = 220
  const m = { t: 10, r: 44, b: 22, l: 8 }
  const pw = Math.max(40, plotW - m.l - m.r)
  const ph = H - m.t - m.b
  const n = idx.length
  const x = (i: number) => m.l + (n < 2 ? 0 : (i / (n - 1)) * pw)
  const y = (v: number) => m.t + ph - ((v - lo) / (hi - lo)) * ph

  const metricMeta = TRENDS_METRICS.find((x) => x.id === metric)!
  const totSpins = series.reduce((s, gm) => {
    const slice = gm.buckets.slice(from)
    return s + slice.reduce((a, b) => a + b.spins, 0)
  }, 0)
  const tipI = hover ?? n - 1

  return (
    <section
      className={cn(CARD, 'mx-4 overflow-hidden sm:mx-6')}
      data-name="trends-live-markets"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
        <Typography
          as="h2"
          shape="h4"
          weight="semibold"
          className="text-base tracking-tight sm:text-lg"
        >
          Live markets
        </Typography>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-popover px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
          </span>
          Live
        </span>
      </div>

      <div className="scrollbar-hide flex gap-3 overflow-x-auto border-b border-border px-4 py-3 sm:px-5">
        {series.map((gm, i) => {
          const v = values[i]?.[values[i]!.length - 1] ?? 0
          return (
            <span
              key={gm.game.id}
              className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground"
            >
              <i
                className="size-2.5 rounded-full"
                style={{ background: TRENDS_CHART_VARS[i] }}
                aria-hidden
              />
              <span className="text-foreground">{gm.game.title}</span>
              <b className="font-semibold tabular-nums text-foreground">
                {formatMetric(metric, v)}
              </b>
            </span>
          )
        })}
      </div>

      <div className="relative px-2 pt-3 sm:px-4" ref={plotRef}>
        <svg
          width={plotW}
          height={H}
          viewBox={`0 0 ${plotW} ${H}`}
          className="w-full overflow-visible"
          role="img"
          aria-label={`${metricMeta.label} over the last ${TRENDS_RANGES.find((r) => r.mins === range)?.label}`}
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const px = e.clientX - rect.left
            const i = Math.round(((px - m.l) / pw) * (n - 1))
            setHover(Math.max(0, Math.min(n - 1, i)))
          }}
          onPointerLeave={() => setHover(null)}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const v = lo + (hi - lo) * (1 - t)
            const yy = m.t + ph * t
            return (
              <g key={t}>
                <line
                  x1={m.l}
                  x2={m.l + pw}
                  y1={yy}
                  y2={yy}
                  className="stroke-border"
                  strokeWidth={1}
                />
                <text
                  x={m.l + pw + 8}
                  y={yy + 4}
                  className="fill-muted-foreground text-[10px]"
                >
                  {formatMetric(metric, v).replace(/\.0(?=%|$)/, '')}
                </text>
              </g>
            )
          })}
          {series.map((gm, gi) => {
            const vals = values[gi] ?? []
            let d = ''
            vals.forEach((v, i) => {
              d += i === 0 ? `M${x(i)},${y(v)}` : `H${x(i)}V${y(v)}`
            })
            const lastV = vals[vals.length - 1] ?? 0
            return (
              <g key={gm.game.id}>
                <path
                  d={d}
                  fill="none"
                  stroke={TRENDS_CHART_VARS[gi]}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
                <circle
                  cx={x(n - 1)}
                  cy={y(lastV)}
                  r={4}
                  fill={TRENDS_CHART_VARS[gi]}
                />
              </g>
            )
          })}
          {hover != null && (
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={m.t}
              y2={m.t + ph}
              className="stroke-muted-foreground/40"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}
          <text x={m.l} y={H - 6} className="fill-muted-foreground text-[10px]">
            {TRENDS_RANGES.find((r) => r.mins === range)?.label ?? ''} ago
          </text>
          <text
            x={m.l + pw}
            y={H - 6}
            textAnchor="end"
            className="fill-muted-foreground text-[10px]"
          >
            Now
          </text>
        </svg>

        {hover != null && (
          <div
            className="pointer-events-none absolute z-10 min-w-[140px] rounded-lg border border-border bg-popover px-2.5 py-2 text-xs shadow-md"
            style={{
              left: Math.min(Math.max(x(tipI) - 70, 8), plotW - 150),
              top: 8,
            }}
          >
            <p className="mb-1 font-medium text-muted-foreground">
              {tipI === n - 1 ? 'Now' : `${n - 1 - tipI}m ago`}
            </p>
            {[...series]
              .map((gm, gi) => ({
                gm,
                gi,
                v: values[gi]?.[tipI] ?? 0,
              }))
              .sort((a, b) => b.v - a.v)
              .map(({ gm, gi, v }) => (
                <div key={gm.game.id} className="flex items-center gap-2 py-0.5">
                  <i
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: TRENDS_CHART_VARS[gi] }}
                  />
                  <span className="min-w-0 flex-1 truncate text-foreground">
                    {gm.game.title}
                  </span>
                  <b className="tabular-nums">{formatMetric(metric, v)}</b>
                </div>
              ))}
          </div>
        )}
      </div>

      <div
        data-name="sort-&-filters"
        className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5"
      >
        <p className="text-xs tabular-nums text-muted-foreground">
          {formatPlays(totSpins)} spins · last{' '}
          {TRENDS_RANGES.find((r) => r.mins === range)?.label}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelectBox
            label="Metric"
            value={metric}
            options={TRENDS_METRICS.map((o) => ({
              id: o.id,
              label: o.short,
            }))}
            onChange={setMetric}
            triggerClassName="w-[148px]"
          />
          <FilterSelectBox
            label="Range"
            value={String(range)}
            options={TRENDS_RANGES.map((o) => ({
              id: String(o.mins),
              label: o.label,
            }))}
            onChange={(id) => setRange(Number(id) as TrendsRangeMins)}
            triggerClassName="w-[112px]"
          />
        </div>
      </div>

      <div className="border-t border-border">
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:grid-cols-[1fr_120px_160px] sm:px-5">
          <span>Game</span>
          <span className="text-right">{metricMeta.label}</span>
          <span className="hidden text-right sm:block">Volume</span>
        </div>
        {series.map((gm, i) => {
          const L = last
          const v = metricAt(series, i, L, metric, metric === 'spins' ? 5 : 30)
          const prev = metricAt(
            series,
            i,
            Math.max(0, L - 60),
            metric,
            metric === 'spins' ? 5 : 30,
          )
          const d = v - prev
          const slice = gm.buckets.slice(from)
          const spins = slice.reduce((a, b) => a + b.spins, 0)
          const wins = slice.reduce((a, b) => a + b.wins, 0)
          return (
            <button
              key={gm.game.id}
              type="button"
              onClick={() => launchGame(gm.game)}
              className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-2 border-t border-border px-4 py-3 text-left transition-colors hover:!bg-surface-muted-3 sm:grid-cols-[1fr_120px_160px] sm:px-5"
            >
              <span className="flex min-w-0 items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={gm.game.imageSrc}
                  alt=""
                  width={40}
                  height={54}
                  className="h-[54px] w-10 shrink-0 rounded-md object-cover"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {gm.game.title}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    #{gm.rank} overall · {gm.game.vendor}
                  </span>
                </span>
              </span>
              <span className="text-right">
                <span className="block text-sm font-semibold tabular-nums text-foreground">
                  {formatMetric(metric, v)}
                </span>
                <span
                  className={cn(
                    'block text-[11px] tabular-nums',
                    d >= 0 ? 'text-success' : 'text-destructive',
                  )}
                >
                  {formatMetricDelta(metric, d)} vs 1h
                </span>
              </span>
              <span className="hidden items-center justify-end gap-1.5 sm:flex">
                <span className="rounded-full border border-border bg-popover px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                  Spins <b className="text-foreground">{formatPlays(spins, true)}</b>
                </span>
                <span className="rounded-full border border-border bg-popover px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                  Wins <b className="text-foreground">{formatPlays(wins, true)}</b>
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
