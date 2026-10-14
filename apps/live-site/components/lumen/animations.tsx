'use client'

import { useState, type CSSProperties, type ReactNode } from 'react'

export function Shimmer({
  className = '',
  active = true,
  tint = 'foreground',
  trigger = 'always',
  children,
}: {
  className?: string
  active?: boolean
  tint?: 'foreground' | 'primary' | 'muted'
  trigger?: 'hover' | 'always'
  children?: ReactNode
}) {
  if (!children) {
    return <span className={`lm-shimmer block rounded-lg bg-muted ${className || 'h-24 w-64'}`} aria-hidden />
  }
  return (
    <span
      data-slot="shimmer"
      data-active={active || undefined}
      data-tint={tint}
      data-trigger={trigger}
      className={`lm-shimmer-wrap ${className}`}
    >
      {children}
    </span>
  )
}

export function ShimmerText({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`lm-shimmer-text font-bold ${className}`}>{children}</span>
}

export function TileShimmer({ className = '' }: { className?: string }) {
  return <span className={`lm-tile-shimmer pointer-events-none absolute inset-0 ${className}`} aria-hidden />
}

const CHART_TONES = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5']
const BRAND_TONES = ['bg-primary', 'bg-success', 'bg-warning', 'bg-info', 'bg-vip-rewards', 'bg-featured']

export function Confetti({
  area = 'parent',
  duration = 2.5,
  palette = 'brand',
  particleCount = 48,
  children,
}: {
  area?: 'parent' | 'viewport'
  duration?: number
  palette?: 'chart' | 'brand'
  particleCount?: number
  children?: ReactNode
}) {
  const tones = palette === 'chart' ? CHART_TONES : BRAND_TONES
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: particleCount }).map((_, i) => (
        <span
          key={i}
          className={`lm-confetti top-0 h-2 w-1.5 rounded-sm ${tones[i % tones.length]}`}
          style={
            {
              left: `${(i * 97) % 100}%`,
              position: area === 'viewport' ? 'fixed' : 'absolute',
              animationDelay: `${(i % 10) * 0.08}s`,
              animationDuration: `${duration}s`,
            } as CSSProperties
          }
        />
      ))}
      {children}
    </div>
  )
}

export function ParticleBurst({
  count = 16,
  playing = true,
  children,
}: {
  count?: number
  playing?: boolean
  children?: ReactNode
}) {
  if (!playing) return <>{children}</>
  return (
    <span className="relative inline-flex">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className={`lm-particle absolute left-1/2 top-1/2 h-2 w-2 rounded-full ${BRAND_TONES[i % BRAND_TONES.length]}`}
          style={{ ['--lm-angle' as string]: `${(360 / count) * i}deg`, animationDelay: `${(i % 4) * 0.05}s` }}
        />
      ))}
      <span className="relative">{children}</span>
    </span>
  )
}

export function SlidingIndicator({
  items,
  value,
  onChange,
  variant = 'pills',
}: {
  items: string[]
  value?: number
  onChange?: (index: number) => void
  variant?: 'segmented' | 'pills' | 'underline'
}) {
  const [i, setI] = useState(value ?? 0)
  const active = value ?? i
  const select = (idx: number) => {
    setI(idx)
    onChange?.(idx)
  }
  if (variant === 'pills') {
    return (
      <div className="relative inline-flex rounded-3xl bg-muted p-0.5">
        <span
          className="lm-slide-pill absolute bottom-0.5 top-0.5 rounded-2xl bg-primary shadow-sm"
          style={{
            width: `calc((100% - 0.25rem) / ${items.length})`,
            left: `calc(0.125rem + (100% - 0.25rem) / ${items.length} * ${active})`,
          }}
          aria-hidden
        />
        {items.map((it, idx) => (
          <button
            key={it}
            type="button"
            onClick={() => select(idx)}
            className={`relative z-10 h-9 flex-1 px-4 text-xs font-medium transition ${
              idx === active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {it}
          </button>
        ))}
      </div>
    )
  }
  return null
}
