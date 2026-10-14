'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'
import { ThinkingBubble } from '../ThinkingBubble'

const thinkingMessages = [
  'Crafting your brand system...',
  'Selecting typography pairings...',
  'Defining tone of voice...',
  'Creating messaging examples...',
  'Finalizing brand identity...',
]

// DEPRECATED: This component is from the old brand book flow and is not currently used
export function SceneProduction() {
  const brandSystem: any = null
  const setBrandSystem = (_data: any) => {}
  const selectedDirection = null
  const creativeDirections: any[] = []
  const industry = ''
  const targetAudience = ''
  const companyPillars: string[] = []
  const colorPreferences: string[] = []
  const typographyPreference = ''
  const designStyle = ''
  const researchData = null
  const goToScene = useSceneStore((state) => state.goToScene)
  const [isGenerating, setIsGenerating] = useState(true)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (isGenerating && !brandSystem) {
      const fetchBrandSystem = async () => {
        try {
          const response = await fetch('/api/creative', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              industry,
              targetAudience,
              companyPillars,
              colorPreferences,
              typographyPreference,
              designStyle,
              researchData,
            }),
          })
          const data = await response.json()
          setBrandSystem(data.brandSystem)
          setIsGenerating(false)
          setTimeout(() => setShowContent(true), 500)
        } catch (error) {
          console.error('Brand system generation failed:', error)
          setIsGenerating(false)
        }
      }

      fetchBrandSystem()
    } else if (!isGenerating) {
      setShowContent(true)
    }
  }, [isGenerating, brandSystem, industry, targetAudience, companyPillars, colorPreferences, typographyPreference, designStyle, researchData, setBrandSystem])

  const handleContinue = () => {
    // Deprecated scene - do nothing
  }

  return (
    <div className="h-full flex flex-col">
      {isGenerating && (
        <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
          <div className="text-center space-y-4 w-full">
            <h2 className="text-white text-2xl font-bold sf-title mb-4">Building Your Brand System...</h2>
            <ThinkingBubble messages={thinkingMessages} inline={true} />
          </div>
        </div>
      )}

      {showContent && brandSystem && (
        <>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h2 className="text-white text-2xl font-bold sf-title mb-2">Brand System</h2>
              <p className="text-white/50 text-sm font-light mb-6">
                Your complete brand identity, ready for production.
              </p>
            </div>

            {/* Selected Direction */}
            {creativeDirections && selectedDirection !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="neu-soft rounded-xl p-5"
              >
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-2">Selected Direction</h3>
                <p className="text-white/80 text-xl font-light">
                  {selectedDirection !== null && creativeDirections.length > 0 ? creativeDirections[Number(selectedDirection)]?.name : ''}
                </p>
              </motion.div>
            )}

            {/* Color Palette */}
            {brandSystem && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="neu-soft rounded-xl p-5"
              >
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-4">Color Palette</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-white/60 text-sm mb-2">Primary</p>
                    <div className="flex gap-3 flex-wrap">
                      {brandSystem?.palette?.primary?.map((color: string, i: number) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div
                          className="w-16 h-16 rounded-lg border border-white/10 shadow-lg"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-white/50 text-xs font-mono">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {brandSystem?.palette?.secondary && brandSystem.palette.secondary.length > 0 && (
                  <div>
                    <p className="text-white/60 text-sm mb-2">Secondary</p>
                    <div className="flex gap-3 flex-wrap">
                      {brandSystem.palette.secondary.map((color: string, i: number) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <div
                            className="w-16 h-16 rounded-lg border border-white/10 shadow-lg"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-white/50 text-xs font-mono">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              </motion.div>
            )}

            {/* Design Style */}
            {brandSystem?.designStyle && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="neu-soft rounded-xl p-5"
              >
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Design Style</h3>
                <p className="text-white/80 text-lg font-light">{brandSystem?.designStyle || ''}</p>
              </motion.div>
            )}

            {/* Typography */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="neu-soft rounded-xl p-5"
            >
              <h3 className="text-white/40 text-xs uppercase tracking-wider mb-4">Typography</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-white/60 text-sm mb-2">Heading</p>
                  <p className="text-white/80 text-2xl font-light" style={{ fontFamily: brandSystem.typography.heading }}>
                    Sample Heading
                  </p>
                  <p className="text-white/50 text-xs mt-1 font-mono">{brandSystem.typography.heading}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-2">Body</p>
                  <p className="text-white/70 text-base font-light" style={{ fontFamily: brandSystem.typography.body }}>
                    This is how body text will appear. Clear, readable, and consistent.
                  </p>
                  <p className="text-white/50 text-xs mt-1 font-mono">{brandSystem.typography.body}</p>
                </div>
              </div>
            </motion.div>

            {/* Tone of Voice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="neu-soft rounded-xl p-5"
            >
              <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Tone of Voice</h3>
              <p className="text-white/70 text-sm font-light leading-relaxed">{brandSystem.toneOfVoice}</p>
            </motion.div>

            {/* Messaging Examples */}
            {brandSystem.messagingExamples && brandSystem.messagingExamples.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="neu-soft rounded-xl p-5"
              >
                <h3 className="text-white/40 text-xs uppercase tracking-wider mb-4">Messaging Examples</h3>
                <div className="space-y-3">
                    {brandSystem?.messagingExamples?.map((example: any, index: number) => (
                    <motion.p
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="text-white/70 text-sm font-light italic"
                    >
                      "{example}"
                    </motion.p>
                  ))}
                </div>
              </motion.div>
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
              Continue to Delivery
            </motion.button>
          </div>
        </>
      )}
    </div>
  )
}
