'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { IconFilter, IconSearch, IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import { CasinoGameTile } from '@/components/lumen/casino-game-tile'
import { useShellOptional } from '@/components/site/shell-context'
import {
  LIVE_GAMES,
  NEW_GAMES,
  ORIGINALS_GAMES,
  type CasinoLobbyGame,
} from '@/lib/lumen/casino-lobby-catalog'
import { cn } from '@/lib/utils'

/** Figma Casino Master Search `536:264454` — empty enabled / recommended. */
const RECOMMENDED: CasinoLobbyGame[] = [
  ...ORIGINALS_GAMES.slice(0, 8),
  ...LIVE_GAMES.slice(0, 2),
  ...NEW_GAMES.slice(0, 2),
]

const SEARCHABLE: CasinoLobbyGame[] = [
  ...ORIGINALS_GAMES,
  ...LIVE_GAMES,
  ...NEW_GAMES,
]

const POP_IN = {
  initial: { opacity: 0, scale: 0.96, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: 6 },
  transition: { type: 'spring' as const, stiffness: 420, damping: 32, mass: 0.85 },
}

/**
 * Full-viewport search — portaled to `document.body` with `data-casino-search-root`
 * so legacy `body > div { position: relative !important }` rules cannot unstick it.
 */
export function CasinoSearchOverlay({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const titleId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const shell = useShellOptional()

  const trimmed = query.trim()
  const results = useMemo(() => {
    if (!trimmed) return []
    const q = trimmed.toLowerCase()
    return SEARCHABLE.filter(
      (g) => g.title.toLowerCase().includes(q) || g.tag.toLowerCase().includes(q),
    )
  }, [trimmed])

  const showingResults = trimmed.length > 0
  const games = showingResults ? results : RECOMMENDED

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    const scroll = document.getElementById('shell-scroll')
    const prevBody = document.body.style.overflow
    const prevScroll = scroll instanceof HTMLElement ? scroll.style.overflow : ''
    document.body.style.overflow = 'hidden'
    if (scroll instanceof HTMLElement) scroll.style.overflow = 'hidden'
    const t = window.setTimeout(() => inputRef.current?.focus(), 180)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevBody
      if (scroll instanceof HTMLElement) scroll.style.overflow = prevScroll
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="casino-search"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          data-casino-search-root=""
          data-name="search_content"
          className="fixed inset-0 z-[300] flex flex-col bg-background origin-center"
          initial={POP_IN.initial}
          animate={POP_IN.animate}
          exit={{ ...POP_IN.exit, transitionEnd: { display: 'none' } }}
          transition={POP_IN.transition}
        >
          <div className="mx-auto flex h-full w-full max-w-[1440px] flex-col gap-6 overflow-y-auto overscroll-contain px-4 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-6">
            <div className="flex items-center gap-4">
              <div className="relative min-w-0 flex-1">
                <IconSearch
                  className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
                  stroke={2}
                  aria-hidden
                />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  aria-label="Search games"
                  className={cn(
                    'h-10 border-border bg-background pl-9 shadow-none',
                    'focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0',
                  )}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-10 shrink-0 gap-1.5 px-3"
                onClick={onClose}
              >
                Close
                <IconX className="size-4" stroke={2} aria-hidden />
              </Button>
            </div>

            <div className="flex h-8 items-center gap-4">
              <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5">
                <IconFilter className="size-3.5" stroke={2} aria-hidden />
                Advanced Search
              </Button>
              <Typography as="p" shape="small" variant="muted">
                No filters applied
              </Typography>
            </div>

            <div className="flex flex-1 flex-col gap-4 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
              <Typography as="h2" id={titleId} shape="h4" weight="semibold">
                {showingResults ? `Results for “${trimmed}”` : 'Recommended games'}
              </Typography>

              {showingResults && games.length === 0 ? (
                <div className="rounded-[10px] border border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground shadow-[0_0_16px_rgba(0,0,0,0.06)]">
                  No games match “{trimmed}”.
                </div>
              ) : (
                <div
                  className={cn(
                    'grid gap-3',
                    'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8',
                  )}
                >
                  {games.map((game) => (
                    <div key={`${showingResults ? 'r' : 'rec'}-${game.id}`} className="flex justify-center">
                      <CasinoGameTile game={game} onLaunch={shell?.launchGame} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
