'use client'

import { useEffect, useState } from 'react'
import NumberFlow from '@number-flow/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const CROWN_GOLD = 'var(--vip-rewards-bronze-400, #e39e3d)'

function VipCrownMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        transform="translate(1.3333 1.3328) scale(1.021277)"
        d="M1.95833 11.75V10.4444H11.0972V11.75H1.95833ZM1.95833 9.46528L1.12604 4.22674C1.10428 4.22674 1.0798 4.22946 1.0526 4.2349C1.02541 4.24034 1.00093 4.24306 0.979167 4.24306C0.707176 4.24306 0.475984 4.14786 0.28559 3.95747C0.0951968 3.76707 0 3.53588 0 3.26389C0 2.9919 0.0951968 2.76071 0.28559 2.57031C0.475984 2.37992 0.707176 2.28472 0.979167 2.28472C1.25116 2.28472 1.48235 2.37992 1.67274 2.57031C1.86314 2.76071 1.95833 2.9919 1.95833 3.26389C1.95833 3.34005 1.95017 3.41076 1.93385 3.47604C1.91753 3.54132 1.8985 3.60116 1.87674 3.65556L3.91667 4.56944L5.9566 1.77882C5.83692 1.69178 5.73901 1.57755 5.66285 1.43611C5.58669 1.29468 5.54861 1.14236 5.54861 0.979167C5.54861 0.707176 5.64381 0.475984 5.8342 0.28559C6.0246 0.0951968 6.25579 0 6.52778 0C6.79977 0 7.03096 0.0951968 7.22135 0.28559C7.41175 0.475984 7.50695 0.707176 7.50695 0.979167C7.50695 1.14236 7.46887 1.29468 7.39271 1.43611C7.31655 1.57755 7.21864 1.69178 7.09896 1.77882L9.13889 4.56944L11.1788 3.65556C11.1571 3.60116 11.138 3.54132 11.1217 3.47604C11.1054 3.41076 11.0972 3.34005 11.0972 3.26389C11.0972 2.9919 11.1924 2.76071 11.3828 2.57031C11.5732 2.37992 11.8044 2.28472 12.0764 2.28472C12.3484 2.28472 12.5796 2.37992 12.77 2.57031C12.9604 2.76071 13.0556 2.9919 13.0556 3.26389C13.0556 3.53588 12.9604 3.76707 12.77 3.95747C12.5796 4.14786 12.3484 4.24306 12.0764 4.24306C12.0546 4.24306 12.0302 4.24034 12.003 4.2349C11.9758 4.22946 11.9513 4.22674 11.9295 4.22674L11.0972 9.46528H1.95833Z"
        fill="#EAAF6D"
      />
    </svg>
  )
}

export function VipTierProgressCard({
  compact = false,
  fromTier = 'Bronze',
  toTier = 'Silver',
  percent = 75,
  updatedLabel = 'Updated 12/25/2025, 8:00PM ET',
  onClick,
  className,
}: {
  compact?: boolean
  fromTier?: string
  toTier?: string
  percent?: number
  updatedLabel?: string
  onClick?: () => void
  className?: string
}) {
  const [animatedPercent, setAnimatedPercent] = useState(0)

  useEffect(() => {
    const duration = compact ? 700 : 1200
    const start = performance.now()
    let raf = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 3
      setAnimatedPercent(percent * eased)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [percent, compact])

  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'w-full rounded-[10px] border border-white/20 bg-white/[0.08] text-left backdrop-blur-md transition-colors',
        compact ? 'p-2.5' : 'p-3.5',
        onClick && 'hover:border-white/30 hover:bg-white/[0.12]',
        className,
      )}
    >
      <div className={cn('flex items-start', compact ? 'gap-2' : 'gap-3')}>
        <div
          className={cn(
            'flex shrink-0 items-center justify-center',
            compact ? 'size-7' : 'size-10',
          )}
        >
          <VipCrownMark className={compact ? 'size-5' : 'size-[22px]'} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p
              className={cn(
                'font-semibold text-white',
                compact ? 'text-xs leading-tight' : 'text-sm',
              )}
            >
              {fromTier} to {toTier}
            </p>
            <span
              className={cn(
                'shrink-0 font-medium tabular-nums text-white/70',
                compact ? 'text-[10px]' : 'text-xs',
              )}
            >
              <NumberFlow value={Math.round(animatedPercent)} />%
            </span>
          </div>
          <div className={cn('mt-2', compact && 'mt-1.5')}>
            <div
              className={cn(
                'relative min-w-0 overflow-hidden rounded-full bg-white/10',
                compact ? 'h-1' : 'h-1.5',
              )}
              role="progressbar"
              aria-valuenow={Math.round(animatedPercent)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="VIP tier progress"
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${CROWN_GOLD}, #f59e0b)` }}
                initial={false}
                animate={{ width: `${animatedPercent}%` }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              />
            </div>
          </div>
          {!compact ? (
            <p className="mt-2 text-[10px] leading-tight text-white/45">{updatedLabel}</p>
          ) : null}
        </div>
      </div>
    </Tag>
  )
}
