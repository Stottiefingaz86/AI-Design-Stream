'use client'

import { useCallback, useRef, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const spotlightSurfaceStyle = {
  '--spot-x': '50%',
  '--spot-y': '50%',
  '--spot-opacity': '0',
} as CSSProperties

/** Cursor-following red glow — BOL SHAD VIP benefit / hub row pattern. */
export function useCursorSpotlight() {
  const ref = useRef<HTMLDivElement | null>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`)
    el.style.setProperty('--spot-opacity', '1')
  }, [])

  const handleMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--spot-opacity', '0')
  }, [])

  return {
    ref,
    handleMouseMove,
    handleMouseLeave,
    spotlightSurfaceStyle,
  }
}

export function SpotlightOverlay({
  radiusPx = 220,
  mixPercent = 22,
  className,
}: {
  radiusPx?: number
  mixPercent?: number
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 z-[1] transition-opacity duration-200',
        className,
      )}
      style={{
        background: `radial-gradient(${radiusPx}px circle at var(--spot-x) var(--spot-y), color-mix(in srgb, var(--primary, #ee3536) ${mixPercent}%, transparent), transparent 60%)`,
        opacity: 'var(--spot-opacity)',
      }}
    />
  )
}

export function SpotlightCardShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const { ref, handleMouseMove, handleMouseLeave, spotlightSurfaceStyle } = useCursorSpotlight()

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={spotlightSurfaceStyle}
      className={cn('group relative overflow-hidden', className)}
    >
      <SpotlightOverlay />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
