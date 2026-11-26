'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { IconChevronDown, IconSearch, IconWorld } from '@tabler/icons-react'
import { leagueCountry } from '@/lib/lumen/v5-sportsbook'
import { cn } from '@/lib/utils'
import { FadeScroll } from './v5-fade-scroll'

export type MenuLeague = { name: string; logo: string; count: number; live?: number; volume?: number }

/**
 * League navigation that scales to hundreds of leagues: All + the popular few as tabs, then an
 * "All leagues" menu — search, grouped by country, logo + game count per league.
 */
export function LeagueMenu({
  leagues,
  active,
  onChange,
  popular = 4,
  short = (n: string) => n,
  className,
}: {
  leagues: MenuLeague[]
  active: string
  onChange: (league: string) => void
  popular?: number
  short?: (name: string) => string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
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

  const top = useMemo(
    () => [...leagues].sort((a, b) => (b.volume ?? b.count) - (a.volume ?? a.count)).slice(0, popular),
    [leagues, popular],
  )
  /* Keep the picked league visible as a tab even when it isn't one of the popular few. */
  const tabs = active !== 'all' && !top.some((l) => l.name === active) ? [...top, ...leagues.filter((l) => l.name === active)] : top

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const map = new Map<string, MenuLeague[]>()
    for (const l of leagues) {
      const country = leagueCountry(l.name)
      if (needle && !`${l.name} ${country}`.toLowerCase().includes(needle)) continue
      map.set(country, [...(map.get(country) ?? []), l])
    }
    return [...map.entries()].sort(([a], [b]) => (a === 'International' ? 1 : b === 'International' ? -1 : a.localeCompare(b)))
  }, [leagues, q])

  /* Keep the active chip in view — on phones the row would otherwise land half-way through it. */
  useEffect(() => {
    const row = ref.current?.querySelector<HTMLElement>('[role="tablist"]')
    const on = row?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (!row || !on || row.scrollWidth <= row.clientWidth) return
    row.scrollTo({ left: Math.max(0, on.offsetLeft - 16), behavior: 'auto' })
  }, [active])

  const pick = (name: string) => {
    onChange(name)
    setOpen(false)
    setQ('')
  }

  const CHIP = 'inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 text-sm font-semibold transition-colors'
  const chip = (id: string, label: string, logo?: string) => {
    const on = id === active
    return (
      <button
        key={id}
        type="button"
        role="tab"
        aria-selected={on}
        onClick={() => onChange(id)}
        className={cn(CHIP, on ? 'border-foreground bg-foreground text-background' : 'border-border bg-card text-foreground hover:bg-accent')}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="size-5 shrink-0 object-contain" />
        ) : null}
        {label}
      </button>
    )
  }

  const menuButton = (cls: string) =>
    leagues.length > popular ? (
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(CHIP, 'border-border bg-card text-foreground hover:bg-accent', open && 'bg-accent', cls)}
      >
        <IconWorld className="size-4" stroke={2} aria-hidden />
        All leagues
        <span className="text-muted-foreground">{leagues.length}</span>
        <IconChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} stroke={2.25} aria-hidden />
      </button>
    ) : null

  return (
    <div ref={ref} className={cn('relative -mx-4 flex min-w-0 items-center gap-2 md:mx-0', className)}>
      {/* Phones: one edge-to-edge row (menu first, then the chips) — swipe, no fade, nothing clipped. */}
      <FadeScroll
        axis="x"
        role="tablist"
        className="scrollbar-hide flex min-w-0 flex-1 gap-2 overflow-x-auto overflow-y-hidden px-4 max-md:![-webkit-mask-image:none] max-md:![mask-image:none] md:px-0"
      >
        {menuButton('md:hidden')}
        {chip('all', 'All')}
        {tabs.map((l) => chip(l.name, short(l.name), l.logo))}
      </FadeScroll>

      {menuButton('hidden md:inline-flex')}

      {open ? (
        <button
          type="button"
          aria-label="Close leagues"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[94] bg-[color-mix(in_srgb,var(--background)_70%,transparent)] md:hidden"
        />
      ) : null}
      {open ? (
        <div
          role="dialog"
          aria-label="All leagues"
          className={cn(
            'flex flex-col overflow-hidden border border-border bg-popover text-popover-foreground shadow-[0_16px_48px_rgba(0,0,0,0.45)]',
            /* Phone: bottom sheet. Desktop: popover under the button. */
            'fixed inset-x-0 bottom-0 z-[95] max-h-[80dvh] rounded-t-[20px] pb-[env(safe-area-inset-bottom)]',
            'md:absolute md:inset-x-auto md:bottom-auto md:right-0 md:top-full md:z-40 md:mt-2 md:max-h-[min(520px,70dvh)] md:w-[360px] md:rounded-[14px] md:pb-0',
          )}
        >
          <span className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-secondary md:hidden" aria-hidden />
          <label className="m-2 flex h-10 shrink-0 items-center gap-2 rounded-lg border border-border bg-secondary px-3">
            <IconSearch className="size-4 shrink-0 text-muted-foreground" stroke={1.75} aria-hidden />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search leagues or countries"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>
          <FadeScroll className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            {groups.length ? (
              groups.map(([country, list]) => (
                <div key={country} className="pt-2">
                  <p className="px-2 pb-1 text-xs font-semibold text-muted-foreground">{country}</p>
                  {list.map((l) => {
                    const on = l.name === active
                    return (
                      <button
                        key={l.name}
                        type="button"
                        onClick={() => pick(l.name)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent',
                          on && 'bg-accent',
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={l.logo} alt="" className="size-6 shrink-0 object-contain" />
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{l.name}</span>
                        {l.live ? <span className="text-xs font-semibold text-destructive">{l.live} live</span> : null}
                        <span className="text-xs tabular-nums text-muted-foreground">{l.count}</span>
                      </button>
                    )
                  })}
                </div>
              ))
            ) : (
              <p className="px-2 py-8 text-center text-sm text-muted-foreground">No leagues match “{q}”.</p>
            )}
          </FadeScroll>
        </div>
      ) : null}
    </div>
  )
}
