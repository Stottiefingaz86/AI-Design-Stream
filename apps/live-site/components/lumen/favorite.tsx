'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconHeart } from '@tabler/icons-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ParticleBurst } from './animations'

export function Favorite({
  favoriteLabel = 'Add game to favorites',
  unfavoriteLabel = 'Remove game from favorites',
  isFavorited = false,
  onFavoriteChange,
  title,
  /** Inline chrome (game launcher header) — always visible, not tile-absolute. */
  inline = false,
  className,
}: {
  favoriteLabel?: string
  unfavoriteLabel?: string
  isFavorited?: boolean
  onFavoriteChange?: (next: boolean) => void
  title?: string
  inline?: boolean
  className?: string
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [on, setOn] = useState(isFavorited)
  const [animating, setAnimating] = useState(false)
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null)
  const [mounted, setMounted] = useState(false)

  useLayoutEffect(() => {
    setMounted(true)
  }, [])

  const toggle = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const next = !on
    setOn(next)
    onFavoriteChange?.(next)
    if (next) {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (rect) setOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
      setAnimating(true)
      toast.success(title ? `${title} saved to favorites` : 'Saved to favorites')
    } else {
      setAnimating(false)
      setOrigin(null)
      toast.message(title ? `${title} removed` : 'Removed from favorites')
    }
  }

  const burst =
    mounted && animating && origin
      ? createPortal(
          <span
            className="twitter-heart-sprite is-animating pointer-events-none fixed z-[100200]"
            style={{
              left: origin.x,
              top: origin.y,
              width: 100,
              height: 100,
              marginLeft: -50,
              marginTop: -50,
            }}
            onAnimationEnd={() => {
              setAnimating(false)
              setOrigin(null)
            }}
            aria-hidden
          />,
          document.body
        )
      : null

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-pressed={on}
        aria-label={on ? unfavoriteLabel : favoriteLabel}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') toggle(e)
        }}
        className={cn(
          'flex size-8 items-center justify-center overflow-visible rounded-full',
          inline
            ? 'relative z-10 size-7 shrink-0 rounded-lg p-1.5 text-[rgba(255,255,255,0.87)] transition-colors hover:bg-white/10'
            : 'absolute right-1.5 top-1.5 z-40 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100',
          className
        )}
      >
        {!inline ? (
          <span
            className="pointer-events-none absolute inset-0 rounded-full border border-white/15 bg-black/45 shadow-[0_4px_12px_rgba(0,0,0,0.35)] backdrop-blur-md"
            aria-hidden
          />
        ) : null}
        <ParticleBurst playing={animating} count={12}>
          <IconHeart
            className={cn(
              'relative z-10 size-4 shrink-0',
              on ? 'fill-pink-500 text-pink-500' : inline ? 'text-[rgba(255,255,255,0.87)]' : 'text-white',
            )}
            strokeWidth={2}
            aria-hidden
          />
        </ParticleBurst>
      </button>
      {burst}
    </>
  )
}
