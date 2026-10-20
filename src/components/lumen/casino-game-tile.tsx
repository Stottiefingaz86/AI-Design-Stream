'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Favorite } from './casino'
import { cn } from '@/lib/utils'
import type { CasinoLobbyGame, CasinoTileTag } from '@/lib/lumen/casino-lobby-catalog'

const TAG_CLASS: Record<CasinoTileTag, string> = {
  Original: 'border-white/25 bg-white/10 text-white',
  Live: 'border-transparent bg-[#dc2626] text-white',
  Tournament: 'border-[#edc555] bg-[#6d4e03] text-white',
}

/** Soft spring — long settle, no snappy overshoot. */
const TILE_SPRING = { type: 'spring' as const, stiffness: 260, damping: 28, mass: 0.85 }

/** Standard lobby poster — every shelf uses this except Top 10 layout (same size, tucked). */
export const CASINO_TILE_W = 152
export const CASINO_TILE_H = 207

/** Casino Master `Tiles (Covers)` — hover play → click loading. */
const PLAY_MS = 2200

/** Centered arc spinner — Figma notch SVG’s mass isn’t on-center, so CSS spin wobbles. */
function TileSpinner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 50 50"
      width={50}
      height={50}
      className={cn('size-[50px] animate-spin motion-reduce:animate-none', className)}
      aria-hidden
    >
      <circle
        cx="25"
        cy="25"
        r="18"
        fill="none"
        stroke="white"
        strokeOpacity={0.22}
        strokeWidth={4}
      />
      <circle
        cx="25"
        cy="25"
        r="18"
        fill="none"
        stroke="white"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray="28 100"
      />
    </svg>
  )
}

export function CasinoGameTile({
  game,
  className,
  dense = false,
}: {
  game: CasinoLobbyGame
  className?: string
  /** Top-10 / compact posters — keep chrome from crushing the art. */
  dense?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (loadTimer.current) clearTimeout(loadTimer.current)
    }
  }, [])

  const startPlay = () => {
    if (loading) return
    setLoading(true)
    if (loadTimer.current) clearTimeout(loadTimer.current)
    loadTimer.current = setTimeout(() => setLoading(false), PLAY_MS)
  }

  return (
    <motion.article
      data-name="game-tile"
      data-state={loading ? 'loading' : undefined}
      role="button"
      tabIndex={0}
      aria-label={`Play ${game.title}`}
      aria-busy={loading}
      whileHover={loading ? undefined : { scale: 1.04, y: -6, zIndex: 30 }}
      whileTap={loading ? undefined : { scale: 1.015, y: -2 }}
      transition={TILE_SPRING}
      onClick={startPlay}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          startPlay()
        }
      }}
      className={cn(
        'group relative z-0 h-[207px] w-[152px] shrink-0 cursor-pointer overflow-hidden rounded-[10px] bg-card',
        'shadow-[0_0_16px_rgba(0,0,0,0.06)]',
        'motion-reduce:!transform-none',
        className,
      )}
    >
      <img src={game.imageSrc} alt="" className="absolute inset-0 size-full object-cover" />
      {/* Originals Figma art already includes title + brand — skip bottom vignette. */}
      {game.tag !== 'Original' ? (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 from-0% to-transparent to-[46%]" />
      ) : null}

      {/* Dim overlay */}
      <div
        className={cn(
          'absolute inset-0 z-20 bg-black/55 transition-opacity duration-200 ease-out',
          loading
            ? 'opacity-100'
            : 'pointer-events-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
        )}
        aria-hidden
      />

      {/*
        Fixed 50×50 slot at true center — play and spinner swap in-place (no shift).
        Play pops in on hover; spinner takes the same box on click.
      */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-20 size-[50px] -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      >
        <img
          src="/casino/play-circle.svg"
          alt=""
          width={50}
          height={50}
          className={cn(
            'absolute inset-0 size-[50px] origin-center transition-[transform,opacity] duration-200 ease-out',
            loading
              ? 'pointer-events-none scale-100 opacity-0'
              : 'scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 motion-reduce:scale-100 motion-reduce:transition-none',
          )}
        />
        <div
          className={cn(
            'absolute inset-0 flex size-[50px] items-center justify-center transition-opacity duration-150',
            loading ? 'opacity-100' : 'opacity-0',
          )}
        >
          <TileSpinner />
        </div>
      </div>

      {/* Tags + favorite stay on hover / play (Casino Master hover keeps chrome). */}
      <div
        className={cn(
          'absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-1 py-1',
          dense ? 'px-1' : 'px-2',
        )}
      >
        <div className="flex min-w-0 items-center gap-1">
          <span
            className={cn(
              'flex shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-black/50',
              dense ? 'size-4' : 'size-[18px]',
            )}
          >
            <img
              src={game.vendorLogo}
              alt=""
              className={cn('object-contain', dense ? 'size-3' : 'size-3.5')}
            />
          </span>
          {!dense ? (
            <span
              className={cn(
                'inline-flex h-[18px] items-center rounded-full border px-1.5 text-[10px] font-medium leading-[14px]',
                TAG_CLASS[game.tag],
              )}
            >
              {game.tag}
            </span>
          ) : null}
        </div>
        <Favorite
          favoriteLabel={`Add ${game.title} to favorites`}
          unfavoriteLabel={`Remove ${game.title} from favorites`}
          className={cn(dense ? 'size-6' : 'size-7')}
        />
      </div>

      {game.live ? (
        <div className="absolute inset-x-0 bottom-0 z-10 p-2">
          <p className="text-xs font-semibold leading-4 text-white">{game.live.title}</p>
          <div className="mt-1 flex items-center gap-0.5">
            {game.live.numbers.map((n, i) => (
              <span
                key={`${n.value}-${i}`}
                className={cn(
                  'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-medium text-white',
                  n.tone === 'red' && 'bg-[#b71c1c]',
                  n.tone === 'green' && 'bg-[#388e3c]',
                  n.tone === 'black' && 'bg-[#171717]',
                )}
              >
                {n.value}
              </span>
            ))}
          </div>
          <p className="mt-1 text-[10px] font-medium leading-[14px] text-white">{game.live.range}</p>
        </div>
      ) : null}
    </motion.article>
  )
}

export function PlayRandomTile({ className }: { className?: string }) {
  return (
    <motion.button
      type="button"
      data-name="play-random"
      whileHover={{ scale: 1.04, y: -6, zIndex: 30 }}
      whileTap={{ scale: 1.015, y: -2 }}
      transition={TILE_SPRING}
      className={cn(
        'relative z-0 flex h-[207px] w-[152px] shrink-0 flex-col items-center justify-center gap-4 rounded-[10px] border border-border bg-card',
        'shadow-[0_0_16px_rgba(0,0,0,0.06)]',
        'motion-reduce:!transform-none',
        className,
      )}
    >
      <img src="/shell/figma/casino/random.svg" alt="" width={50} height={50} className="size-[50px]" />
      <span className="text-sm font-semibold text-foreground">Play Random</span>
    </motion.button>
  )
}
