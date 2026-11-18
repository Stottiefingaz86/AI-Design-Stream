'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { Favorite } from '@/components/lumen/favorite'
import {
  BaccaratHistory,
  BlackjackSeats,
  RouletteHistory,
  seedBaccaratResults,
  seedRouletteResults,
} from '@/components/lumen/live-casino-history'
import { ShellIcon } from '@/components/site/shell-icons'
import { useShellOptional } from '@/components/site/shell-context'
import { usePressHandlers } from '@/components/site/use-tap-action'
import { cn } from '@/lib/utils'
import {
  pickRandomLobbyGame,
  type CasinoLobbyGame,
  type CasinoTileTag,
} from '@/lib/lumen/casino-lobby-catalog'

const TAG_CLASS: Record<CasinoTileTag, string> = {
  Original: 'border-white/25 bg-white/10 text-white',
  Live: 'border-transparent bg-[#dc2626] text-white',
  Tournament: 'border-[#edc555] bg-[#6d4e03] text-white',
}

/** Soft spring — long settle, no snappy overshoot (desktop hover lift). */
const TILE_SPRING = { type: 'spring' as const, stiffness: 260, damping: 28, mass: 0.85 }
/** Snappier press for touch — no hover lift on mobile. */
const TILE_PRESS_SPRING = { type: 'spring' as const, stiffness: 420, damping: 32, mass: 0.7 }

/** Standard lobby poster — every shelf uses this except Top 10. */
export const CASINO_TILE_W = 152
export const CASINO_TILE_H = 207

/** Casino Master `Tiles (Covers)` — desktop hover play → click loading. */
const PLAY_MS = 2200
/** Preloader in the play button (desktop) / tile (mobile), then open launcher. */
const LAUNCH_PRELOAD_MS = 1000

const FINE_POINTER_MQ = '(hover: hover) and (pointer: fine)'

function useFinePointer() {
  const [fine, setFine] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(FINE_POINTER_MQ)
    const sync = () => setFine(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return fine
}

/** Centered arc spinner — Figma notch SVG’s mass isn’t on-center, so CSS spin wobbles. */
export function TileSpinner({ className }: { className?: string }) {
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
  hideTitle = false,
  onLaunch,
}: {
  game: CasinoLobbyGame
  className?: string
  /** Top-10 / compact posters — keep chrome from crushing the art. */
  dense?: boolean
  /** Cover baked-in title band on originals / slots wallpaper art. */
  hideTitle?: boolean
  /** Opens the game launcher after the tile loading beat. Pass tile el for rakeback origin. */
  onLaunch?: (game: CasinoLobbyGame, originEl?: HTMLElement | null) => void
}) {
  const [loading, setLoading] = useState(false)
  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tileRef = useRef<HTMLElement | null>(null)
  const finePointer = useFinePointer()
  const shell = useShellOptional()
  const loggedIn = shell?.loggedIn ?? true

  useEffect(() => {
    return () => {
      if (loadTimer.current) clearTimeout(loadTimer.current)
    }
  }, [])

  const startPlay = (event?: MouseEvent | KeyboardEvent) => {
    event?.stopPropagation()
    if (loading) return
    if (loadTimer.current) clearTimeout(loadTimer.current)
    const originEl =
      (event?.currentTarget as HTMLElement | null) ?? tileRef.current
    if (onLaunch) {
      /* Logged out → open auth immediately (no 1s spinner wait Embla can cancel). */
      if (!loggedIn) {
        onLaunch(game, originEl)
        return
      }
      setLoading(true)
      loadTimer.current = setTimeout(() => {
        onLaunch(game, originEl)
        setLoading(false)
      }, LAUNCH_PRELOAD_MS)
      return
    }
    setLoading(true)
    loadTimer.current = setTimeout(() => setLoading(false), PLAY_MS)
  }

  /* Embla shelves eat native click on short finger jitter — fire on pointerup. */
  const press = usePressHandlers(() => startPlay(), { disabled: loading })

  return (
    <motion.article
      ref={tileRef}
      data-name="game-tile"
      data-casino-game-id={game.id}
      data-state={loading ? 'loading' : undefined}
      data-tile-tag={game.tag}
      role="button"
      tabIndex={0}
      aria-label={`Play ${game.title}`}
      aria-busy={loading}
      /* Desktop: Casino Master hover lift + play. Mobile: press shrink only — no sticky hover play. */
      whileHover={
        finePointer && !loading ? { scale: 1.04, y: -6, zIndex: 10 } : undefined
      }
      whileTap={
        loading
          ? undefined
          : finePointer
            ? { scale: 1.015, y: -2 }
            : { scale: 0.94 }
      }
      animate={loading && !finePointer ? { scale: 0.94 } : { scale: 1 }}
      transition={finePointer ? TILE_SPRING : TILE_PRESS_SPRING}
      onPointerDown={press.onPointerDown}
      onPointerUp={press.onPointerUp}
      onPointerCancel={press.onPointerCancel}
      onClick={press.onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          startPlay(e)
        }
      }}
      className={cn(
        /* overflow-visible so favorite glass / hover chrome isn’t clipped at the edge */
        'group relative z-0 h-[207px] w-[152px] shrink-0 cursor-pointer overflow-visible rounded-[10px] bg-card',
        'shadow-[0_0_16px_rgba(0,0,0,0.06)] touch-manipulation',
        'motion-reduce:!transform-none',
        className,
      )}
    >
      <img
        src={game.imageSrc}
        alt=""
        className="absolute inset-0 size-full rounded-[10px] object-cover"
      />
      {/* Originals / hideTitle art already includes title + brand — no bottom fade. */}
      {game.tag !== 'Original' && !hideTitle ? (
        <div className="pointer-events-none absolute inset-0 rounded-[10px] bg-gradient-to-t from-black/90 from-0% to-transparent to-[46%]" />
      ) : null}

      {/* Dim — desktop hover / focus only; always on while loading. */}
      <div
        className={cn(
          'absolute inset-0 z-20 rounded-[10px] bg-black/55 transition-opacity duration-200 ease-out',
          loading
            ? 'opacity-100'
            : 'pointer-events-none opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 group-focus-visible:opacity-100',
        )}
        aria-hidden
      />

      {/*
        Fixed 50×50 slot at true center — play and spinner swap in-place (no shift).
        Play pops in on desktop hover only; spinner takes the same box on click (all devices).
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
              : 'scale-50 opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 motion-reduce:scale-100 motion-reduce:transition-none',
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
          title={game.title}
          favoriteLabel={`Add ${game.title} to favorites`}
          unfavoriteLabel={`Remove ${game.title} from favorites`}
          isFavorited={shell?.isFavorite(game.id) ?? false}
          onFavoriteChange={() => shell?.toggleFavorite(game)}
          className={cn(
            '!relative right-0 top-0 hidden opacity-100 md:inline-flex',
            dense ? 'size-6' : 'size-7',
          )}
        />
      </div>

      {game.live ? (
        <div className="absolute inset-x-0 bottom-0 z-10 p-2">
          <p className="text-xs font-semibold leading-4 text-white">{game.live.title}</p>
          <div className="mt-1">
            {game.live.kind === 'roulette' ? (
              <RouletteHistory results={seedRouletteResults(game.live.seed)} />
            ) : null}
            {game.live.kind === 'baccarat' ? (
              <BaccaratHistory results={seedBaccaratResults(game.live.seed)} />
            ) : null}
            {(game.live.kind === 'blackjack' || game.live.kind === 'poker') && game.live.seats ? (
              <BlackjackSeats occupied={game.live.seats.occupied} total={game.live.seats.total} />
            ) : null}
          </div>
          <p className="mt-1 text-[10px] font-medium leading-[14px] text-white">{game.live.range}</p>
        </div>
      ) : null}
    </motion.article>
  )
}

export function PlayRandomTile({
  className,
  onLaunch,
}: {
  className?: string
  onLaunch?: (game: CasinoLobbyGame) => void
}) {
  const finePointer = useFinePointer()
  return (
    <motion.button
      type="button"
      data-name="play-random"
      whileHover={
        finePointer ? { scale: 1.04, y: -6, zIndex: 10 } : undefined
      }
      whileTap={finePointer ? { scale: 1.015, y: -2 } : { scale: 0.94 }}
      transition={finePointer ? TILE_SPRING : TILE_PRESS_SPRING}
      onClick={() => onLaunch?.(pickRandomLobbyGame())}
      className={cn(
        'relative z-0 flex h-[207px] w-[152px] shrink-0 flex-col items-center justify-center gap-4 rounded-[10px] border border-border bg-card',
        'shadow-[0_0_16px_rgba(0,0,0,0.06)]',
        'transition-colors active:bg-accent',
        'motion-reduce:!transform-none',
        className,
      )}
    >
      <ShellIcon name="random" tone="token" className="size-[50px] text-foreground" />
      <span className="text-sm font-semibold text-foreground">Play Random</span>
    </motion.button>
  )
}
