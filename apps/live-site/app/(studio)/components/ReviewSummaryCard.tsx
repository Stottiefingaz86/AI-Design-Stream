'use client'

import { motion } from 'framer-motion'

interface ReviewSummaryCardProps {
  overallRating?: number
  totalReviews?: number
  commonThemes: string[]
  strengths?: string[]
}

export function ReviewSummaryCard({ overallRating, totalReviews, commonThemes, strengths }: ReviewSummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-4 space-y-3"
    >
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <div className="text-2xl">⭐</div>
        <div>
          {overallRating && (
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">{overallRating.toFixed(1)}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= Math.round(overallRating) ? 'text-yellow-400' : 'text-white/20'}>
                    ★
                  </span>
                ))}
              </div>
            </div>
          )}
          {totalReviews && (
            <p className="text-white/50 text-xs mt-0.5">{totalReviews} reviews</p>
          )}
        </div>
      </div>

      {commonThemes.length > 0 && (
        <div>
          <p className="text-white/70 text-xs font-medium mb-2">📊 Common Themes:</p>
          <div className="flex flex-wrap gap-1.5">
            {commonThemes.map((theme, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded-full bg-white/10 text-white/70 text-xs border border-white/10"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {strengths && strengths.length > 0 && (
        <div>
          <p className="text-white/70 text-xs font-medium mb-2">✨ Strengths:</p>
          <ul className="space-y-1">
            {strengths.map((strength, idx) => (
              <li key={idx} className="text-white/60 text-xs flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}
