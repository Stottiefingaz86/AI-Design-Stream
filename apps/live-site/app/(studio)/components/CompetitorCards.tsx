'use client'

import { motion } from 'framer-motion'
import type { Competitor } from '@/lib/agent/schemas'
import { staggerContainer, staggerItem } from '@/lib/motion/transitions'

interface CompetitorCardsProps {
  competitors: Competitor[]
}

export function CompetitorCards({ competitors }: CompetitorCardsProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {competitors.map((competitor, index) => (
        <motion.div
          key={competitor.name}
          variants={staggerItem}
          className="p-4 border border-white/20 rounded bg-black"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold mb-1">{competitor.name}</h3>
              <a
                href={competitor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/60 hover:text-white underline"
              >
                {competitor.url}
              </a>
            </div>
          </div>
          <p className="text-sm text-white/80 mb-3">{competitor.headline}</p>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-white/60 mb-1">Value Props</div>
              <div className="flex flex-wrap gap-1">
                {competitor.valueProps.map((prop, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs border border-white/20 rounded"
                  >
                    {prop}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/60 mb-1">Tone</div>
              <div className="flex flex-wrap gap-1">
                {competitor.toneTags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs border border-white/10 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/60 mb-1">Visual</div>
              <div className="flex flex-wrap gap-1">
                {competitor.visualTags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs border border-white/10 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
