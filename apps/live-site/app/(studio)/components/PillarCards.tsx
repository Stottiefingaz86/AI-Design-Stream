'use client'

import { motion } from 'framer-motion'
import { useStudioStore } from '@/lib/store/studioStore'
import { staggerContainer, staggerItem } from '@/lib/motion/transitions'

export function PillarCards() {
  const brandPillars = useStudioStore((state) => state.brandPillars)
  const approvePillar = useStudioStore((state) => state.approvePillar)

  if (brandPillars.length === 0) return null

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {brandPillars.map((pillar) => (
        <motion.div
          key={pillar.id}
          variants={staggerItem}
          className={`relative p-6 rounded-xl border-2 transition-all ${
            pillar.approved
              ? 'border-green-500 bg-green-500/10'
              : 'border-white/20 bg-white/5 hover:bg-white/10'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-bold">{pillar.name}</h3>
            {pillar.approved && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
              >
                <span className="text-white text-xs">✓</span>
              </motion.div>
            )}
          </div>
          <p className="text-sm text-white/70 mb-4">{pillar.description}</p>
          {!pillar.approved && (
            <button
              onClick={() => approvePillar(pillar.id)}
              className="text-xs text-white/60 hover:text-white transition-colors"
            >
              Approve →
            </button>
          )}
        </motion.div>
      ))}
    </motion.div>
  )
}
