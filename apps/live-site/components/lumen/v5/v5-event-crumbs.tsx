'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { IconCheck, IconChevronDown, IconChevronLeft } from '@tabler/icons-react'
import type { SportsEventModel } from '@/lib/lumen/sports-event'
import { leagueLogo, leaguePageHref, v5Leagues } from '@/lib/lumen/v5-combos'
import { sportDef, sportHref, type V5SportId } from '@/lib/lumen/v5-sportsbook'
import { cn } from '@/lib/utils'

/**
 * V5 event breadcrumb — round back · sport (own glyph) / league ▾ / game ▾.
 * League switches to another league page; game switches to another game in this league.
 */
export function V5EventCrumbs({
  model,
  sport,
  onBack,
}: {
  model: SportsEventModel
  sport: V5SportId
  onBack: () => void
}) {
  const def = sportDef(sport)
  const glyph = sport === 'nfl' ? 'football' : sport
  const { event, siblings } = model
  const first = model.awayFirst ? event.awayAbbr : event.homeAbbr
  const second = model.awayFirst ? event.homeAbbr : event.awayAbbr
  const title = `${first} ${model.awayFirst ? '@' : 'vs'} ${second}`
  const leagues = v5Leagues(sport)
    .slice()
    .sort((a, b) => b.count - a.count)
    .map((l) => ({ ...l, href: leaguePageHref(sport, l.name) }))
    .filter((l): l is typeof l & { href: string } => Boolean(l.href))

  return (
    <nav aria-label="Breadcrumb" data-name="v5-event-crumbs" className="mb-5 flex min-w-0 items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent"
      >
        <IconChevronLeft className="size-5" stroke={2} />
      </button>
      <ol className="flex min-w-0 items-center gap-1 text-sm">
        <li className="shrink-0">
          <Link
            href={sportHref(sport)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <span
              aria-hidden
              className="inline-block size-4 shrink-0 bg-current"
              style={{
                maskImage: `url(/shell/figma/sports/lumen/${glyph}.svg)`,
                WebkitMaskImage: `url(/shell/figma/sports/lumen/${glyph}.svg)`,
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
              }}
            />
            <span className="hidden sm:inline">{def.label}</span>
          </Link>
        </li>
        <li aria-hidden className="text-muted-foreground">
          /
        </li>
        <li className="min-w-0 shrink">
          <CrumbMenu
            label={`${def.label} leagues`}
            tone="muted"
            trigger={
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={leagueLogo(model.league.name, model.league.icon)} alt="" className="size-4 shrink-0 object-contain" />
                <span className="truncate">{model.league.name}</span>
              </>
            }
            items={leagues.map((l) => ({
              key: l.name,
              href: l.href,
              current: l.name === model.league.name,
              icon: l.logo,
              title: l.name,
              sub: `${l.count} game${l.count === 1 ? '' : 's'}`,
            }))}
          />
        </li>
        <li aria-hidden className="text-muted-foreground">
          /
        </li>
        <li className="shrink-0">
          <CrumbMenu
            label={`${model.league.name} games`}
            tone="current"
            trigger={<span>{title}</span>}
            items={siblings.map((e) => {
              const a = model.awayFirst ? e.away : e.home
              const b = model.awayFirst ? e.home : e.away
              return {
                key: e.id,
                href: model.hrefFor(e.id),
                current: e.id === event.id,
                title: `${a} ${model.awayFirst ? '@' : 'vs'} ${b}`,
                sub: e.live ? `Live · ${e.when}` : e.when,
                live: !!e.live,
                right:
                  e.live && e.score
                    ? model.awayFirst
                      ? `${e.score[1]}–${e.score[0]}`
                      : `${e.score[0]}–${e.score[1]}`
                    : undefined,
              }
            })}
          />
        </li>
      </ol>
    </nav>
  )
}

type CrumbItem = {
  key: string
  href: string
  title: string
  sub?: string
  icon?: string
  right?: string
  live?: boolean
  current?: boolean
}

/** A breadcrumb step that opens a list — fill on hover/open only, no outline box. */
function CrumbMenu({
  trigger,
  items,
  label,
  tone,
}: {
  trigger: ReactNode
  items: CrumbItem[]
  label: string
  tone: 'muted' | 'current'
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])
  const can = items.length > 1
  return (
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-current={tone === 'current' ? 'page' : undefined}
        disabled={!can}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-8 max-w-full items-center gap-1.5 rounded-full px-2 outline-none transition-colors',
          'hover:bg-accent focus-visible:bg-accent disabled:hover:bg-transparent',
          tone === 'current' ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground',
          open && 'bg-accent text-foreground',
        )}
      >
        {trigger}
        {can ? (
          <IconChevronDown className={cn('size-3.5 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} stroke={2.25} />
        ) : null}
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute left-0 top-10 z-40 max-h-[min(60vh,420px)] w-80 overflow-y-auto rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
        >
          {items.map((it) => (
            <li key={it.key} role="option" aria-selected={!!it.current}>
              <Link
                href={it.href}
                onClick={() => setOpen(false)}
                className="grid grid-cols-[auto_minmax(0,1fr)_2.75rem] items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent"
              >
                {it.icon ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={it.icon} alt="" className="size-6 object-contain" />
                ) : (
                  <span className="w-0" aria-hidden />
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">{it.title}</span>
                  {it.sub ? (
                    <span className={cn('block truncate text-xs', it.live ? 'font-semibold text-destructive' : 'text-muted-foreground')}>
                      {it.sub}
                    </span>
                  ) : null}
                </span>
                {/* One right column on every row: live score, else a tick on the current one. */}
                <span className="flex justify-end text-sm font-bold tabular-nums text-foreground">
                  {it.right ?? (it.current ? <IconCheck className="size-4" stroke={2.5} /> : null)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
