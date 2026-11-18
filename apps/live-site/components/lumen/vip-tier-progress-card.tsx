'use client'

import NumberFlow from '@number-flow/react'
import { motion } from 'framer-motion'
import { useGrowProgress } from '@/lib/lumen/use-grow-progress'
import { useVipLevelUpCeremony } from '@/lib/lumen/use-vip-level-up-ceremony'
import { VipProgressCrown } from '@/components/lumen/vip-progress-crown'
import { cn } from '@/lib/utils'

const FILL = {
  bronze: 'linear-gradient(90deg, var(--vip-rewards-bronze-400, #e39e3d), #f59e0b)',
  silver:
    'linear-gradient(90deg, var(--vip-rewards-silver-300, #d8d6d6), var(--vip-rewards-silver-400, #b4b2b2))',
} as const

export function VipTierProgressCard({
  compact = false,
  onClick,
  className,
}: {
  compact?: boolean
  /** @deprecated Labels come from shell ceremony. */
  fromTier?: string
  toTier?: string
  percent?: number
  updatedLabel?: string
  onClick?: () => void
  className?: string
}) {
  const {
    displayPercent,
    levelLabel,
    crownTone,
    barTone,
    updatedLabel,
  } = useVipLevelUpCeremony()
  const animatedPercent = useGrowProgress(displayPercent, compact ? 700 : 1200)

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
        <VipProgressCrown
          tone={crownTone}
          size={compact ? 28 : 40}
          className={compact ? 'size-7' : 'size-10'}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p
              className={cn(
                'font-semibold text-white',
                compact ? 'text-xs leading-tight' : 'text-sm',
              )}
            >
              {levelLabel}
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
                style={{ background: FILL[barTone] }}
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
