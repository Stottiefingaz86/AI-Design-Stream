'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'
import { ThinkingBubble } from '../ThinkingBubble'

const thinkingMessages = [
  'Brainstorming creative routes...',
  'Visualizing brand aesthetics...',
  'Crafting compelling narratives...',
  'Developing unique brand expressions...',
]

// DEPRECATED: This component is from the old brand book flow and is not currently used
export function SceneCreativeDirections() {
  const creativeDirections: any[] = []
  const selectedDirection: string | null = null
  const selectDirection = (_id: string) => {}
  const setCreativeDirections = (_data: any) => {}
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
    if (isGenerating && !creativeDirections) {
      const fetchDirections = async () => {
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
          setCreativeDirections(data.creativeDirections)
          setIsGenerating(false)
          setTimeout(() => setShowContent(true), 500)
        } catch (error) {
          console.error('Failed to fetch creative directions:', error)
          setIsGenerating(false)
        }
      }
      fetchDirections()
    } else if (!isGenerating) {
      setShowContent(true)
    }
  }, [isGenerating, creativeDirections, industry, targetAudience, companyPillars, colorPreferences, typographyPreference, designStyle, researchData, setCreativeDirections])

  const handleSelect = (index: number) => {
    selectDirection(String(index))
  }

  const handleContinue = () => {
    if (selectedDirection !== null) {
      // Deprecated scene - do nothing
    }
  }

  return (
    <div className="h-full flex flex-col">
      {isGenerating && (
        <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
          <div className="text-center space-y-4 w-full">
            <h2 className="text-white text-2xl font-bold sf-title mb-4">Exploring Creative Directions...</h2>
            <ThinkingBubble messages={thinkingMessages} inline={true} />
          </div>
        </div>
      )}

      {showContent && creativeDirections && (
        <>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h2 className="text-white text-2xl font-bold sf-title mb-2">Creative Directions</h2>
              <p className="text-white/50 text-sm font-light mb-6">
                Three distinct routes. Each with a different strategic intent and visual language.
              </p>
            </div>

            <div className="space-y-4">
              {creativeDirections.map((direction, index) => (
                <motion.button
                  key={direction.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  onClick={() => handleSelect(index)}
                  className={`w-full neu-soft rounded-xl p-5 text-left transition-all ${
                    selectedDirection === index
                      ? 'ring-2 ring-white/50 neu-inset'
                      : 'hover:neu-inset hover:ring-2 hover:ring-white/20'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white text-xl font-light">{direction.name}</h4>
                    {selectedDirection === index && (
                      <span className="text-white/80 text-sm">✓</span>
                    )}
                  </div>
                  
                  <p className="text-white/70 text-sm mb-3 font-light">{direction.strategicIntent}</p>
                  
                  <div className="mb-3">
                    <p className="text-white/40 text-xs mb-2">Mood:</p>
                    <div className="flex flex-wrap gap-2">
                      {direction.moodKeywords.map((keyword: string, i: number) => (
                        <span key={i} className="px-2 py-1 neu-flat rounded text-xs text-white/70">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-white/40 text-xs mb-1">Visual:</p>
                      <p className="text-white/60 text-xs font-light">{direction.visualDirection}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs mb-1">Copy:</p>
                      <p className="text-white/60 text-xs font-light">{direction.copyDirection}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Continue button at bottom */}
          {selectedDirection !== null && (
            <div className="border-t border-white/5 p-4">
              <motion.button
                onClick={handleContinue}
                className="w-full px-6 py-3 neu-flat rounded-lg hover:neu-inset transition-all font-light"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue to Production
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
