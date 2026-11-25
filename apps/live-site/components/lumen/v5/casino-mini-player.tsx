'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import { IconArrowsDiagonal, IconArrowsDiagonalMinimize2, IconGripHorizontal, IconMaximize, IconX } from '@tabler/icons-react'
import { useShell } from '@/components/site/shell-context'
import type { CasinoLobbyGame } from '@/lib/lumen/casino-lobby-catalog'
import { cn } from '@/lib/utils'

/**
 * V5 · Casino mini player — games from the sports rail open in a small floating player you can
 * drag anywhere, blow up to a centred theatre view, or hand to the full-screen game launcher.
 */

type Mode = 'mini' | 'theater'
type State = { game: CasinoLobbyGame | null; mode: Mode }

let state: State = { game: null, mode: 'mini' }
const subs = new Set<() => void>()
const set = (next: State) => {
  state = next
  subs.forEach((f) => f())
}
const subscribe = (f: () => void) => {
  subs.add(f)
  return () => subs.delete(f)
}

export function openMiniPlayer(game: CasinoLobbyGame) {
  set({ game, mode: state.game ? state.mode : 'mini' })
}
export function closeMiniPlayer() {
  set({ game: null, mode: 'mini' })
}
const setMode = (mode: Mode) => set({ ...state, mode })

const SPRING = { type: 'spring' as const, stiffness: 380, damping: 34 }

export function CasinoMiniPlayer() {
  const { game, mode } = useSyncExternalStore(subscribe, () => state, () => state)
  const { launchGame } = useShell()
  const boundsRef = useRef<HTMLDivElement>(null)
  const drag = useDragControls()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (mode !== 'theater') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMode('mini')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mode])

  if (!mounted) return null
  const theater = mode === 'theater'

  const controls = game ? (
    <div className="flex shrink-0 items-center gap-1">
      <ControlButton
        label={theater ? 'Back to mini player' : 'Theatre view'}
        onClick={() => setMode(theater ? 'mini' : 'theater')}
      >
        {theater ? <IconArrowsDiagonalMinimize2 className="size-4" stroke={2} /> : <IconArrowsDiagonal className="size-4" stroke={2} />}
      </ControlButton>
      <ControlButton
        label="Full screen"
        onClick={(el) => {
          closeMiniPlayer()
          launchGame(game, el, { skipFunds: true })
        }}
      >
        <IconMaximize className="size-4" stroke={2} />
      </ControlButton>
      <ControlButton label="Close game" onClick={closeMiniPlayer}>
        <IconX className="size-4" stroke={2} />
      </ControlButton>
    </div>
  ) : null

  return createPortal(
    <div ref={boundsRef} data-trade-sheet-root data-name="v5-casino-mini-player" className="pointer-events-none fixed inset-0 z-[70]">
      <AnimatePresence>
        {game && theater ? (
          <motion.button
            key="scrim"
            type="button"
            aria-label="Back to mini player"
            onClick={() => setMode('mini')}
            className="pointer-events-auto absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {game ? (
          <div
            key={mode}
            className={cn('absolute', theater ? 'inset-0 flex items-center justify-center p-6' : 'bottom-28 right-6')}
          >
            <motion.div
              role="dialog"
              aria-label={`${game.title} — ${theater ? 'theatre view' : 'mini player'}`}
              drag={!theater}
              dragControls={drag}
              dragListener={false}
              dragConstraints={boundsRef}
              dragMomentum={false}
              dragElastic={0.06}
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={SPRING}
              className={cn(
                'pointer-events-auto flex flex-col overflow-hidden rounded-[14px] border border-border bg-popover text-popover-foreground shadow-[0_24px_64px_rgba(0,0,0,0.55)]',
                theater ? 'w-[min(1040px,100%)]' : 'w-[360px] max-w-[calc(100vw-32px)]',
              )}
            >
              <div
                onPointerDown={(e) => {
                  if (!theater && !(e.target as HTMLElement).closest('button')) drag.start(e)
                }}
                className={cn('flex h-11 items-center gap-2 border-b border-border pl-3 pr-1.5', !theater && 'cursor-grab touch-none active:cursor-grabbing')}
              >
                {!theater ? <IconGripHorizontal className="size-4 shrink-0 text-muted-foreground" stroke={2} aria-hidden /> : null}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold leading-4 text-foreground">{game.title}</span>
                  <span className="block truncate text-[11px] leading-4 text-muted-foreground">{game.vendor}</span>
                </span>
                {controls}
              </div>
              <div className="relative aspect-video bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={game.imageSrc} alt="" className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                  <p className="rounded-full border border-white/20 bg-black/50 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                    Click to continue
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>,
    document.body,
  )
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: (el: HTMLElement) => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => onClick(e.currentTarget)}
      className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  )
}
