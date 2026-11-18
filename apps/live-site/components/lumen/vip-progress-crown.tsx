'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const CROWN_SRC = {
  bronze: '/shell/figma/vip/crown.svg',
  silver: '/shell/figma/vip/crown-silver.svg',
} as const

/** Bronze slides out left; silver slides in — used across hub / banner / hero. */
export function VipProgressCrown({
  tone,
  size = 52,
  className,
}: {
  tone: 'bronze' | 'silver'
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn('relative inline-flex shrink-0 overflow-hidden', className)}
      style={{ width: size, height: size }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={tone}
          className="absolute inset-0 grid place-items-center"
          initial={{ x: tone === 'silver' ? 28 : 0, opacity: 0, scale: 0.86 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: -28, opacity: 0, scale: 0.86 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        >
          <Image
            src={CROWN_SRC[tone]}
            alt=""
            width={size}
            height={size}
            className="size-full"
            unoptimized
          />
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function VipProgressBarFill({
  percent,
  tone,
  className,
}: {
  percent: number
  tone: 'bronze' | 'silver'
  className?: string
}) {
  const fill =
    tone === 'bronze'
      ? 'var(--vip-rewards-bronze-400,#e39e3d)'
      : 'linear-gradient(90deg, var(--vip-rewards-silver-300,#d8d6d6), var(--vip-rewards-silver-400,#b4b2b2))'

  return (
    <div
      className={cn('h-full rounded-full transition-[width] duration-500 ease-out', className)}
      style={{
        width: `${Math.min(100, Math.max(0, percent))}%`,
        background: fill,
      }}
    />
  )
}
