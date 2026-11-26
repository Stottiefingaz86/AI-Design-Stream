'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { IconChevronDown, IconSearch, IconWorld, IconX } from '@tabler/icons-react'
import { leagueCountry } from '@/lib/lumen/v5-sportsbook'
import { cn } from '@/lib/utils'
import { FadeScroll } from './v5-fade-scroll'
import { useMenuPosition } from './v5-market-cards'

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
  /* A dropdown (fixed, clamped to the screen, never taller than the space below it) anchored to whichever
   * button opened it — replaces the phone bottom sheet that got stuck and couldn't be closed. */
  const anchorRef = useRef<HTMLElement>(null) as React.MutableRefObject<HTMLElement | null>
  const panelRef = useRef<HTMLDivElement>(null)
  const pos = useMenuPosition(open, anchorRef as React.RefObject<HTMLElement>, 360)
  const panelTop = typeof pos.top === 'number' ? pos.top : 0
  const room =
    typeof window === 'undefined'
      ? 480
      : /* Phones keep clear of the floating bottom bar. */
        window.innerHeight - panelTop - (window.innerWidth < 768 ? 96 : 24)
  const panelStyle = { ...pos, maxHeight: Math.max(220, Math.min(480, room)) }
  /* Tap feedback: the tapped chip lights up (with a spinner) straight away while its page loads. */
  const [pendingId, setPendingId] = useState<string | null>(null)
  useEffect(() => setPendingId(null), [active])
  useEffect(() => {
    if (!pendingId) return
    const t = window.setTimeout(() => setPendingId(null), 8000)
    return () => window.clearTimeout(t)
  }, [pendingId])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: PointerEvent) => {
      const t = e.target as Node
      if (!ref.current?.contains(t) && !panelRef.current?.contains(t)) setOpen(false)
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
    /* Only when it's out of view — otherwise the row stays put and the All leagues button stays visible. */
    const fits = on.offsetLeft >= row.scrollLeft && on.offsetLeft + on.offsetWidth <= row.scrollLeft + row.clientWidth
    if (fits) return
    row.scrollTo({ left: Math.max(0, on.offsetLeft - 16), behavior: 'auto' })
  }, [active])

  const choose = (id: string) => {
    if (id !== active) setPendingId(id)
    onChange(id)
  }
  const pick = (name: string) => {
    choose(name)
    setOpen(false)
    setQ('')
  }

  const CHIP = 'inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 text-sm font-semibold transition-colors'
  const chip = (id: string, label: string, logo?: string) => {
    const on = id === (pendingId ?? active)
    const loading = pendingId === id
    return (
      <button
        key={id}
        type="button"
        role="tab"
        aria-selected={id === active}
        aria-busy={loading || undefined}
        onClick={() => choose(id)}
        className={cn(CHIP, on ? 'border-foreground bg-foreground text-background' : 'border-border bg-card text-foreground hover:bg-accent')}
      >
        {loading ? (
          <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-[color-mix(in_srgb,var(--background)_35%,transparent)] border-t-background" aria-hidden />
        ) : logo ? (
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
        onClick={(e) => {
          anchorRef.current = e.currentTarget
          setOpen((v) => !v)
        }}
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
            <div
              ref={panelRef}
              role="dialog"
              aria-label="All leagues"
              data-name="v5-league-menu-panel"
              style={panelStyle}
              className="z-[95] flex flex-col overflow-hidden rounded-[14px] border border-border bg-popover text-popover-foreground shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
            >
              <div className="flex shrink-0 items-center gap-2 px-2 pt-2">
                <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-secondary px-3">
                  <IconSearch className="size-4 shrink-0 text-muted-foreground" stroke={1.75} aria-hidden />
                  <input
                    /* Desktop only — on phones the keyboard would cover the list the moment it opens. */
                    autoFocus={typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search leagues or countries"
                    className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </label>
                <button
                  type="button"
                  aria-label="Close leagues"
                  onClick={() => setOpen(false)}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <IconX className="size-4" stroke={2} />
                </button>
              </div>
              {/* overscroll-contain: the list scrolls on its own and never drags the page with it. */}
              <FadeScroll className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-2">
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
