'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'

// DEPRECATED: This component is from the old brand book flow and is not currently used
export function SceneResearch() {
  const researchData: any = null
  const goToScene = useSceneStore((state) => state.goToScene)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500)
    return () => clearTimeout(timer)
  }, [])

  if (!researchData) return null

  const handleContinue = () => {
    // Deprecated scene - do nothing
  }

  return (
    <div className="h-full flex flex-col">
      {/* Research content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-white text-2xl font-bold sf-title mb-2">Research Complete</h2>
          <p className="text-white/50 text-sm font-light mb-6">
            Here's what we discovered about your competitive landscape
          </p>
        </div>

        {showContent && (
          <>
            {/* Category Definition */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="neu-soft rounded-xl p-4"
            >
              <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3 font-bold sf-title">Category Definition</h3>
              <p className="text-white/80 text-sm font-light leading-relaxed">{researchData?.categoryDefinition || ''}</p>
            </motion.div>

            {/* Competitors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <h3 className="text-white/40 text-xs uppercase tracking-wider font-bold sf-title">Competitive Landscape</h3>
              <div className="space-y-2">
                {researchData?.competitors?.slice(0, 6).map((competitor: any, index: number) => (
                  <motion.div
                    key={competitor.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="neu-flat rounded-lg p-4"
                  >
                    <h4 className="text-white text-sm font-light mb-1">{competitor.name}</h4>
                    <p className="text-white/60 text-xs mb-2">{competitor.positioning}</p>
                    <div className="space-y-1">
                      <p className="text-white/40 text-xs">Strengths: {competitor.strengths.slice(0, 2).join(', ')}</p>
                      <p className="text-white/40 text-xs">Weaknesses: {competitor.weaknesses.slice(0, 2).join(', ')}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Whitespace Opportunities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="neu-soft rounded-xl p-4"
            >
              <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3 font-bold sf-title">Whitespace Opportunities</h3>
              <ul className="space-y-2">
                {researchData?.whitespaceOpportunities?.map((opp: any, index: number) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="text-white/80 text-sm font-light"
                  >
                    • {opp}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </div>

      {/* Continue button at bottom */}
      <div className="border-t border-white/5 p-4">
        <motion.button
          onClick={handleContinue}
          className="w-full px-6 py-3 neu-flat rounded-lg hover:neu-inset transition-all font-light"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue to Strategy
        </motion.button>
      </div>
    </div>
  )
}
