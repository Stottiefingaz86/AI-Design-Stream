'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'

const colorPalettes = [
  { name: 'Bold & Vibrant', colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'] },
  { name: 'Minimal & Clean', colors: ['#000000', '#FFFFFF', '#808080', '#E0E0E0'] },
  { name: 'Warm & Inviting', colors: ['#FF8C42', '#FFB347', '#FFD700', '#FFA07A'] },
  { name: 'Cool & Professional', colors: ['#2C3E50', '#3498DB', '#5DADE2', '#85C1E2'] },
  { name: 'Nature & Organic', colors: ['#27AE60', '#2ECC71', '#52BE80', '#7FB069'] },
  { name: 'Elegant & Sophisticated', colors: ['#8B4C8F', '#9B59B6', '#BB8FCE', '#D2B4DE'] },
  { name: 'Energetic & Dynamic', colors: ['#E74C3C', '#F39C12', '#F1C40F', '#E67E22'] },
  { name: 'Calm & Serene', colors: ['#5DADE2', '#85C1E2', '#AED6F1', '#D6EAF8'] },
]

// DEPRECATED: This component is from the old brand book flow and is not currently used
export function SceneColorPreferences() {
  const colorPreferences: string[] = []
  const addColorPreference = (_value: string) => {}
  const removeColorPreference = (_index: number) => {}
  const goToScene = useSceneStore((state) => state.goToScene)
  const triggerKool = useSceneStore((state) => state.triggerKool)

  const handleSelectPalette = (paletteName: string) => {
    if (!colorPreferences.includes(paletteName)) {
      triggerKool() // Trigger kool animation
      addColorPreference(paletteName)
    }
  }

  const handleRemovePreference = (index: number) => {
    removeColorPreference(index)
  }

  const handleContinue = () => {
    if (colorPreferences.length > 0) {
      // Deprecated scene - do nothing
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Question and content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-white text-2xl font-bold mb-2 sf-title">Which color palettes do you like?</h2>
          <p className="text-white/50 text-sm font-light mb-6">
            💡 Select any that resonate with your brand vision
          </p>
        </div>

        {/* Color palettes */}
        <div className="space-y-3">
          {colorPalettes.map((palette, index) => {
            const isSelected = colorPreferences.includes(palette.name)
            return (
              <motion.button
                key={palette.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.03 }}
                onClick={() => handleSelectPalette(palette.name)}
                className={`w-full neu-soft rounded-xl p-4 text-left transition-all ${
                  isSelected ? 'ring-2 ring-white/50 neu-inset' : 'hover:neu-inset hover:ring-2 hover:ring-white/20'
                }`}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white text-base font-light">{palette.name}</h4>
                  {isSelected && (
                    <span className="text-white/80 text-sm">✓</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {palette.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-lg border border-white/10 flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Selected preferences */}
        {colorPreferences.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-white/40 text-xs uppercase tracking-wider">Selected Palettes</h3>
            <div className="flex flex-wrap gap-2">
              {colorPreferences.map((pref, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-2 neu-flat rounded-lg text-sm font-light flex items-center gap-2"
                >
                  {pref}
                  <button
                    onClick={() => handleRemovePreference(index)}
                    className="text-white/50 hover:text-white/80 text-lg leading-none"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Continue button */}
      {colorPreferences.length > 0 && (
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
