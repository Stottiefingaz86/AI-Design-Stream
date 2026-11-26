'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import type { SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import { AlternateLinePicker } from '@/components/lumen/soccer-sport-page'
import { SORT_MODES, type KCard, type KRow, type SortMode } from '@/lib/lumen/v5-markets'
import { cn } from '@/lib/utils'
import { Crest, LeagueLink, ProbBar, TopicGlyph, V5_CARD, V5_LIGHT_UP, V5_NUM, fmtPctRound, fmtVol } from './combo-ui'

type OnPick = (pick: SoccerSlipPick, el?: HTMLElement | null) => void

const PREVIEW = 3

// ─── Market card ───────────────────────────────────────────────

/** Uniform market card — header, rows (chance bar · multiplier · Yes / No), volume, view market. */
export function KMarketCard({ card, selected, onPick }: { card: KCard; selected: Set<string>; onPick: OnPick }) {
  const [open, setOpen] = useState(false)
  const rows = open ? card.rows : card.rows.slice(0, PREVIEW)
  const hidden = card.rows.length - PREVIEW
  const titleEl = <span className="block truncate text-[17px] font-bold leading-6 tracking-tight text-foreground">{card.title}</span>
  /* Logo and league line open the league page; the title opens the market. */
  const head = (
    <>
      <LeagueLink sport={card.sport} league={card.league} className="shrink-0">
        {card.glyph ? (
          <TopicGlyph name={card.glyph} />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={card.icon} alt="" className="size-9 shrink-0 object-contain" />
        )}
      </LeagueLink>
      <span className="min-w-0 flex-1">
        {card.href ? (
          <Link href={card.href} className="block transition-opacity hover:opacity-80">
            {titleEl}
          </Link>
        ) : (
          titleEl
        )}
        <LeagueLink
          sport={card.sport}
          league={card.league}
          className={cn('block truncate text-xs', card.live ? 'text-destructive' : 'text-muted-foreground')}
        >
          {card.sub}
        </LeagueLink>
      </span>
    </>
  )
  return (
    <article data-name="v5-market-card" className={cn(V5_CARD, V5_LIGHT_UP, 'flex flex-col overflow-hidden rounded-[14px]')}>
      <div className="flex items-center gap-3 px-4 pt-4">{head}</div>
      <div className="flex flex-col gap-3 px-4 py-4">
        {rows.map((r) => (
          <KRowView key={r.id} row={r} selected={selected} onPick={onPick} />
        ))}
        {hidden > 0 ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1 self-start text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            {open ? 'Show less' : `Show ${hidden} more`}
            <IconChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} stroke={2} />
          </button>
        ) : null}
      </div>
      <div className="mt-auto flex h-10 items-center border-t border-border px-4 text-xs text-muted-foreground">
        <span>{fmtVol(card.volume)}</span>
        {card.href ? (
          <Link href={card.href} className="ml-auto inline-flex items-center gap-0.5 font-bold text-foreground hover:underline">
            View market <IconChevronRight className="size-3.5" stroke={2} />
          </Link>
        ) : null}
      </div>
    </article>
  )
}

function KRowView({ row: initial, selected, onPick }: { row: KRow; selected: Set<string>; onPick: OnPick }) {
  const [step, setStep] = useState(initial.steps?.index ?? 0)
  const row = initial.steps ? initial.steps.rows[step] ?? initial : initial
  const yesOn = selected.has(row.yes.id)
  const noOn = row.no ? selected.has(row.no.id) : false
  const stepped = initial.steps && initial.steps.rows.length > 1 && initial.steps.rows.every((r) => r.no) ? initial.steps : null
  return (
    <div className="flex items-center gap-3">
      {row.crest ? (
        <Crest name={row.crest} className="size-8" />
      ) : row.badge ? (
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-muted-foreground">
          {row.badge}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold leading-5 tracking-tight text-foreground">{row.label}</p>
        {row.sub ? <p className="truncate text-xs text-muted-foreground">{row.sub}</p> : null}
        <ProbBar value={row.chance} lead={row.chance >= 50} className="mt-1.5 max-w-[60%]" />
      </div>
      {row.score !== undefined ? (
        <span className={cn('inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-md border border-border px-2 text-sm', V5_NUM)}>
          {row.score}
        </span>
      ) : null}
      {row.no && stepped ? (
        /* Yes / No chips, then the V1 ⇅ picker — its menu opens over the chips. */
        <div className="flex shrink-0 items-stretch gap-1.5" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-2">
            <SidePill label="Yes" pct={row.yesPrice ?? row.chance} on={yesOn} onClick={(el) => onPick(row.yes, el)} />
            <SidePill label="No" pct={row.noPrice ?? 100 - row.chance} on={noOn} onClick={(el) => onPick(row.no!, el)} />
          </div>
          <AlternateLinePicker
            family={/\b(over|under)\b/i.test(row.label) ? 'total' : 'spread'}
            title="Alternate lines"
            pairs={stepped.rows.map((r, i) => ({
              line: Number.parseFloat(stepped.labels[i] ?? '') || i,
              a: { id: r.yes.id, label: `Yes ${stepped.labels[i]}`, odds: `${Math.round(r.yesPrice ?? r.chance)}%` },
              b: { id: r.no!.id, label: `No ${stepped.labels[i]}`, odds: `${Math.round(r.noPrice ?? 100 - r.chance)}%` },
            }))}
            selectedIds={selected}
            mainLine={Number.parseFloat(stepped.labels[step] ?? '')}
            columns={['Yes', 'No']}
            onPick={(p) => {
              const i = stepped.rows.findIndex((r) => r.yes.id === p.id || r.no?.id === p.id)
              if (i < 0) return
              setStep(i)
              const r = stepped.rows[i]!
              const pick = r.yes.id === p.id ? r.yes : r.no!
              if (!selected.has(pick.id)) onPick(pick)
            }}
          />
        </div>
      ) : row.no ? (
        <>
          <SidePill label="Yes" pct={row.yesPrice ?? row.chance} on={yesOn} onClick={(el) => onPick(row.yes, el)} />
          <SidePill label="No" pct={row.noPrice ?? 100 - row.chance} on={noOn} onClick={(el) => onPick(row.no!, el)} />
        </>
      ) : (
        <>
          <span className="w-12 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
            {(100 / Math.max(1, row.yesPrice ?? Math.round(row.chance))).toFixed(2)}x
          </span>
          <button
            type="button"
            aria-pressed={yesOn}
            onClick={(e) => onPick(row.yes, e.currentTarget)}
            className={cn(
              'inline-flex h-11 min-w-[78px] shrink-0 items-center justify-center rounded-full border px-3 text-base transition-colors',
              V5_NUM,
              yesOn ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-secondary text-foreground hover:bg-accent',
            )}
          >
            {fmtPctRound(row.chance)}
          </button>
        </>
      )}
    </div>
  )
}

function SidePill({ label, pct, on, onClick }: { label: string; pct: number; on: boolean; onClick: (el: HTMLElement) => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={(e) => onClick(e.currentTarget)}
      className={cn(
        'inline-flex h-11 min-w-[84px] shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 text-sm transition-colors',
        on ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-secondary text-foreground hover:bg-accent',
      )}
    >
      <span className={cn('font-semibold', on ? 'text-primary-foreground/80' : 'text-muted-foreground')}>{label}</span>
      <span className={cn('text-[15px]', V5_NUM)}>{Math.round(pct)}%</span>
    </button>
  )
}

// ─── Sort menu ─────────────────────────────────────────────────

export function SortMenu({
  value,
  reverse,
  onChange,
  onReverse,
}: {
  value: SortMode
  reverse: boolean
  onChange: (m: SortMode) => void
  onReverse: (v: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])
  const label = SORT_MODES.find((m) => m.id === value)?.label ?? 'Sort'
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-[15px] font-bold tracking-tight text-foreground transition-colors hover:bg-accent"
      >
        {label}
        <IconChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} stroke={2.25} />
      </button>
      {open ? (
        <div
          role="listbox"
          aria-label="Sort"
          className="absolute right-0 top-full z-40 mt-2 w-64 rounded-[14px] border border-border bg-popover p-2 text-popover-foreground shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          {SORT_MODES.map((m) => {
            const on = m.id === value
            return (
              <button
                key={m.id}
                type="button"
                role="option"
                aria-selected={on}
                onClick={() => {
                  onChange(m.id)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[15px] font-semibold text-foreground transition-colors hover:bg-accent"
              >
                <span
                  className={cn(
                    'inline-flex size-5 shrink-0 items-center justify-center rounded-full border-2',
                    on ? 'border-primary' : 'border-muted-foreground',
                  )}
                  aria-hidden
                >
                  {on ? <span className="size-2.5 rounded-full bg-primary" /> : null}
                </span>
                {m.label}
              </button>
            )
          })}
          <div className="my-1.5 h-px bg-border" />
          <button
            type="button"
            role="switch"
            aria-checked={reverse}
            onClick={() => onReverse(!reverse)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[15px] font-bold text-foreground hover:bg-accent"
          >
            Reverse sort
            <span
              className={cn('relative inline-flex h-6 w-10 items-center rounded-full transition-colors', reverse ? 'bg-primary' : 'bg-secondary')}
              aria-hidden
            >
              <span
                className={cn(
                  'absolute size-5 rounded-full bg-foreground shadow transition-transform',
                  reverse ? 'translate-x-[18px]' : 'translate-x-0.5',
                )}
              />
            </span>
          </button>
        </div>
      ) : null}
    </div>
  )
}

/** Pill-button dropdown with radio options and optional switches (Browse markets filters). */
export function RadioMenu<T extends string>({
  label,
  options,
  value,
  onChange,
  switches,
  icon,
}: {
  label?: string
  options?: { id: T; label: string }[]
  value?: T
  onChange?: (v: T) => void
  switches?: { label: string; on: boolean; onToggle: (v: boolean) => void }[]
  icon?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDoc)
    return () => document.removeEventListener('pointerdown', onDoc)
  }, [open])
  const current = options?.find((o) => o.id === value)?.label
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label ?? current}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-bold text-foreground transition-colors hover:bg-accent"
      >
        {icon ?? (
          <>
            {current ?? label}
            <IconChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} stroke={2.25} />
          </>
        )}
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-40 mt-2 w-60 rounded-[14px] border border-border bg-popover p-2 text-popover-foreground shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
          {switches?.map((sw) => (
            <button
              key={sw.label}
              type="button"
              role="switch"
              aria-checked={sw.on}
              onClick={() => sw.onToggle(!sw.on)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-bold text-foreground hover:bg-accent"
            >
              {sw.label}
              <span className={cn('relative inline-flex h-6 w-10 items-center rounded-full transition-colors', sw.on ? 'bg-primary' : 'bg-secondary')} aria-hidden>
                <span className={cn('absolute size-5 rounded-full bg-foreground shadow transition-transform', sw.on ? 'translate-x-[18px]' : 'translate-x-0.5')} />
              </span>
            </button>
          ))}
          {switches?.length && options?.length ? <div className="my-1.5 h-px bg-border" /> : null}
          {options?.map((o) => {
            const on = o.id === value
            return (
              <button
                key={o.id}
                type="button"
                role="option"
                aria-selected={on}
                onClick={() => {
                  onChange?.(o.id)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-accent"
              >
                <span
                  className={cn('inline-flex size-5 shrink-0 items-center justify-center rounded-full border-2', on ? 'border-primary' : 'border-muted-foreground')}
                  aria-hidden
                >
                  {on ? <span className="size-2.5 rounded-full bg-primary" /> : null}
                </span>
                {o.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
