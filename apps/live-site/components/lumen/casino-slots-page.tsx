'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { IconChevronDown } from '@tabler/icons-react'
import { CasinoGameTile } from '@/components/lumen/casino-game-tile'
import { CasinoProviderRow, CasinoTop10 } from '@/components/lumen/casino-lobby-page'
import { useShell } from '@/components/site/shell-context'
import { Typography } from '@/components/ui/typography'
import {
  SLOTS_TOP10_GAMES,
  SLOTS_WALLPAPER_GAMES,
  type CasinoLobbyGame,
} from '@/lib/lumen/casino-lobby-catalog'
import { cn } from '@/lib/utils'

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'az', label: 'A–Z' },
  { id: 'popular', label: 'Popular' },
] as const

type SortId = (typeof SORT_OPTIONS)[number]['id']

function sortSlots(games: CasinoLobbyGame[], sort: SortId) {
  const copy = [...games]
  switch (sort) {
    case 'oldest':
      return copy.reverse()
    case 'az':
      return copy.sort((a, b) => a.title.localeCompare(b.title))
    case 'popular':
      // Catalog order already skews “popular”; reverse A–Z as a stand-in until real scores exist.
      return copy.sort((a, b) => b.title.localeCompare(a.title))
    case 'newest':
    default:
      return copy
  }
}

/** Local menu — avoids Radix portal/z-index fights in the shell. */
function SlotsSortMenu({
  value,
  onChange,
}: {
  value: SortId
  onChange: (id: SortId) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const label = SORT_OPTIONS.find((o) => o.id === value)?.label ?? 'Newest'

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative z-40 shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Sort by: ${label}`}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-10 w-[200px] items-center justify-between gap-2 rounded-md border border-border bg-secondary px-3 text-sm text-foreground',
          'outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        <span className="min-w-0 truncate text-left">
          <span className="text-muted-foreground">Sort by: </span>
          <span className="font-medium">{label}</span>
        </span>
        <IconChevronDown
          className={cn('size-4 shrink-0 opacity-50 transition-transform', open && 'rotate-180')}
          strokeWidth={1.5}
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label="Sort options"
          className="absolute right-0 top-[calc(100%+4px)] z-50 w-[200px] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {SORT_OPTIONS.map((opt) => (
            <li key={opt.id} role="option" aria-selected={opt.id === value}>
              <button
                type="button"
                className={cn(
                  'flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none',
                  'hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent',
                  opt.id === value && 'bg-accent text-accent-foreground',
                )}
                onClick={() => {
                  onChange(opt.id)
                  setOpen(false)
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/** Casino-Lumen Slots wallpaper — Figma 115:389970. */
export function CasinoSlotsLobby() {
  const { launchGame } = useShell()
  const [sort, setSort] = useState<SortId>('newest')
  const games = useMemo(() => sortSlots(SLOTS_WALLPAPER_GAMES, sort), [sort])

  return (
    <div data-name="slot_content" className="w-full bg-background pb-8 pt-2">
      <CasinoTop10
        title="Top 10 Slots"
        games={SLOTS_TOP10_GAMES}
        onLaunch={launchGame}
        hideTitle
      />

      <CasinoProviderRow hideTitle />

      <section data-name="all-slots" aria-label="All Slots" className="pt-8 pb-2">
        <div className="mb-3 flex h-10 items-center justify-between gap-4 px-6">
          <Typography as="h2" shape="h4" weight="semibold" className="min-w-0 truncate">
            All Slots
          </Typography>
          <SlotsSortMenu value={sort} onChange={setSort} />
        </div>

        {/* Wallpaper grid — Figma 8-up desktop, portrait 152×207 tiles. */}
        <div
          className={cn(
            'grid gap-3 px-6',
            'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8',
          )}
        >
          {games.map((game) => (
            <div key={game.id} className="aspect-[152/207] w-full min-w-0">
              <CasinoGameTile
                game={game}
                onLaunch={launchGame}
                hideTitle
                className="!h-full !w-full"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
