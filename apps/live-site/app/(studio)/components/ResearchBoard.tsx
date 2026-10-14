'use client'

import { motion } from 'framer-motion'
import type { ResearchOutput } from '@/lib/agent/schemas'
import { CompetitorCards } from './CompetitorCards'
import { PositioningMapComponent } from './PositioningMap'
import { fadeIn, staggerContainer, staggerItem } from '@/lib/motion/transitions'

interface ResearchBoardProps {
  research: ResearchOutput
}

export function ResearchBoard({ research }: ResearchBoardProps) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Category Definition */}
      <div>
        <h3 className="text-lg font-bold mb-3">Category Definition</h3>
        <p className="text-white/80 leading-relaxed">{research.categoryDefinition}</p>
      </div>

      {/* Competitors */}
      <div>
        <h3 className="text-lg font-bold mb-4">Competitor Analysis</h3>
        <CompetitorCards competitors={research.competitors} />
      </div>

      {/* Messaging Patterns */}
      <div>
        <h3 className="text-lg font-bold mb-4">Messaging Patterns</h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-white/60 mb-2">Common Claims</div>
            <div className="flex flex-wrap gap-2">
              {research.messagingPatterns.commonClaims.map((claim, i) => (
                <span
                  key={i}
                  className="px-3 py-1 border border-white/20 rounded text-sm"
                >
                  {claim}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-2">Overused Words</div>
            <div className="flex flex-wrap gap-2">
              {research.messagingPatterns.overusedWords.map((word, i) => (
                <span
                  key={i}
                  className="px-3 py-1 border border-white/10 rounded text-sm text-white/60"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Positioning Map */}
      <div>
        <h3 className="text-lg font-bold mb-4">Positioning Map</h3>
        <PositioningMapComponent map={research.positioningMap} />
      </div>

      {/* Whitespace Opportunities */}
      <div>
        <h3 className="text-lg font-bold mb-4">Whitespace Opportunities</h3>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {research.whitespaceOpportunities.map((opp, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="p-4 border border-white/20 rounded bg-black"
            >
              <h4 className="font-bold mb-2">{opp.title}</h4>
              <p className="text-sm text-white/80 mb-2">{opp.insight}</p>
              <div className="space-y-1">
                <div className="text-xs text-white/60">Recommended Angle:</div>
                <p className="text-sm">{opp.recommendedAngle}</p>
                <div className="text-xs text-white/60 mt-2">Visual Direction:</div>
                <p className="text-sm">{opp.visualDirection}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
