'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'

const typographyOptions = [
  { name: 'Modern Sans', font: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif', description: 'Clean, versatile, professional', weight: 'normal' },
  { name: 'Classic Serif', font: 'Georgia, "Times New Roman", serif', description: 'Traditional, trustworthy, elegant', weight: 'normal' },
  { name: 'Geometric Bold', font: 'Arial, Helvetica, sans-serif', description: 'Bold, contemporary, structured', weight: 'bold' },
  { name: 'Humanist', font: 'Verdana, Geneva, sans-serif', description: 'Friendly, approachable, readable', weight: 'normal' },
  { name: 'Display Serif', font: '"Times New Roman", Times, serif', description: 'Elegant, distinctive, editorial', weight: 'normal' },
  { name: 'Monospace', font: '"Courier New", Courier, monospace', description: 'Technical, precise, modern', weight: 'normal' },
  { name: 'Light Sans', font: 'system-ui, -apple-system, sans-serif', description: 'Soft, friendly, approachable', weight: '300' },
  { name: 'Bold Condensed', font: 'Arial, Helvetica, sans-serif', description: 'Bold, impactful, space-efficient', weight: 'bold' },
  { name: 'Rounded Sans', font: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif', description: 'Friendly, approachable, modern', weight: 'normal', style: 'rounded' },
  { name: 'Elegant Script', font: 'Georgia, serif', description: 'Sophisticated, refined, classic', weight: 'normal', style: 'italic' },
  { name: 'Tech Mono', font: '"Courier New", "Lucida Console", monospace', description: 'Technical, precise, code-like', weight: 'normal' },
  { name: 'Display Bold', font: 'Arial Black, Arial, sans-serif', description: 'Bold, attention-grabbing, impactful', weight: 'bold' },
  { name: 'Thin Modern', font: 'system-ui, -apple-system, sans-serif', description: 'Light, airy, contemporary', weight: '100' },
  { name: 'Classic Roman', font: 'Georgia, "Times New Roman", serif', description: 'Traditional, authoritative, timeless', weight: 'normal' },
  { name: 'Geometric Sans', font: 'Arial, Helvetica, sans-serif', description: 'Structured, clean, mathematical', weight: 'normal' },
  { name: 'Handwritten', font: 'Georgia, serif', description: 'Personal, authentic, human', weight: 'normal', style: 'italic' },
]

// DEPRECATED: This component is from the old brand book flow and is not currently used
export function SceneTypography() {
  const typographyPreference = ''
  const setTypographyPreference = (_value: string) => {}
  const goToScene = useSceneStore((state) => state.goToScene)
  const triggerKool = useSceneStore((state) => state.triggerKool)

  const handleSelectTypography = (typography: string) => {
    triggerKool()
    setTypographyPreference(typography)
  }

  const handleContinue = () => {
    if (typographyPreference) {
      // Deprecated scene - do nothing
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Question and content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-white text-2xl font-bold mb-2 sf-title">Choose your typography</h2>
          <p className="text-white/50 text-sm font-light mb-6">
            💡 Typography sets the tone for how your design communicates
          </p>
        </div>

        {/* Typography Selection */}
        <div className="space-y-3">
          {typographyOptions.map((option, index) => {
            const isSelected = typographyPreference === option.font
            return (
              <motion.button
                key={option.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.02 }}
                onClick={() => handleSelectTypography(option.font)}
                className={`w-full neu-flat rounded-lg p-4 text-left transition-all ${
                  isSelected ? 'ring-2 ring-white/50 neu-inset' : 'hover:neu-inset hover:ring-2 hover:ring-white/20'
                }`}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p 
                    className="text-white text-base"
                    style={{ 
                      fontFamily: option.font,
                      fontWeight: option.weight || 'normal',
                      fontStyle: option.style || 'normal'
                    }}
                  >
                    {option.name}
                  </p>
                  {isSelected && (
                    <span className="text-white/80 text-sm">✓</span>
                  )}
                </div>
                <p className="text-white/50 text-xs font-light mb-2">{option.description}</p>
                <div className="text-white/70 text-sm" style={{ 
                  fontFamily: option.font,
                  fontWeight: option.weight || 'normal',
                  fontStyle: option.style || 'normal'
                }}>
                  The quick brown fox jumps over the lazy dog
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Continue button */}
      {typographyPreference && (
        <div className="border-t border-white/5 p-4">
          <motion.button
            onClick={handleContinue}
            className="w-full px-6 py-3 neu-flat rounded-lg hover:neu-inset transition-all font-light"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue
          </motion.button>
        </div>
      )}
    </div>
  )
}
