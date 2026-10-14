'use client'

import { motion } from 'framer-motion'

interface LockedCardProps {
  title: string
  unlocked: boolean
  index: number
}

export function LockedCard({ title, unlocked, index }: LockedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`p-5 neu-flat rounded-lg transition-all ${
        unlocked
          ? 'border-white/10'
          : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-lg font-light">{title}</div>
        {!unlocked && (
          <div className="text-lg opacity-30">🔒</div>
        )}
        {unlocked && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-lg opacity-60"
          >
            ✓
          </motion.div>
        )}
      </div>
      {unlocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-sm text-white/40 font-light"
        >
          Ready
        </motion.div>
      )}
    </motion.div>
  )
}
