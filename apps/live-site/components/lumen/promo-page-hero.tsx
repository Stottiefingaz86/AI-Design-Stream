'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** White Register-style CTA — same recipe as the homepage “Built for winners.” hero. */
export const PROMO_HERO_CTA =
  'h-11 rounded-[10px] bg-white px-6 text-[15px] font-semibold text-[#1a1a1a] hover:bg-white/90'

/**
 * V2 Challenges / Raffles / Races page header — solid primary banner, Figtree 900 white title,
 * matching the homepage hero. Copy (+ actions) left, `children` (countdown) right. No icon tile.
 */
export function PromoPageHero({
  eyebrow,
  title,
  subtitle,
  actions,
  footer,
  children,
  as: Heading = 'h1',
  className,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  /** CTA under the subtitle. */
  actions?: ReactNode
  /** Full-width row under the header (stats). */
  footer?: ReactNode
  /** Right side — countdown. */
  children?: ReactNode
  as?: 'h1' | 'h2'
  className?: string
}) {
  return (
    <section
      data-name="promo-page-hero"
      className={cn(
        'flex flex-col gap-5 overflow-clip rounded-[14px] bg-primary px-[clamp(16px,3vw,40px)] py-[clamp(16px,2.2vw,28px)] text-white',
        className,
      )}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              {eyebrow}
            </p>
          ) : null}
          <Heading
            className="text-[clamp(28px,3.4vw,44px)] font-black leading-[0.95] tracking-[-0.035em] text-white"
            style={{ fontFamily: 'var(--font-figtree), Figtree, sans-serif' }}
          >
            {title}
          </Heading>
          {subtitle ? (
            <p className="mt-2 text-[15px] leading-[1.4] text-white/95">{subtitle}</p>
          ) : null}
          {actions ? <div className="mt-4 flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
        {children ? <div className="flex shrink-0 flex-col gap-4">{children}</div> : null}
      </div>
      {footer}
    </section>
  )
}
