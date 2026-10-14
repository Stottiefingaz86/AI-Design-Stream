'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'
import { ChatInput } from '../ChatInput'

const areaOptions = [
  'Sports',
  'Casino',
  'Loyalty',
  'Authentication',
  'Poker',
  'Other area',
]

export function SceneRequestArea() {
  const requestArea = useSceneStore((state) => state.requestArea)
  const setRequestArea = useSceneStore((state) => state.setRequestArea)
  const triggerKool = useSceneStore((state) => state.triggerKool)
  const [showOptions, setShowOptions] = useState(false)
  const [customArea, setCustomArea] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowOptions(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleSelectArea = (area: string) => {
    if (area === 'Other area') {
      setShowCustomInput(true)
    } else {
      triggerKool() // Trigger kool animation
      setRequestArea(area)
    }
  }

  const handleCustomSubmit = (value: string) => {
    if (value.trim()) {
      triggerKool() // Trigger kool animation
      setRequestArea(value.trim())
    }
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Question */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <h2 className="text-white text-xl md:text-2xl font-bold mb-2 sf-title">which area are you requesting?</h2>
        <p className="text-white/50 text-xs md:text-sm font-light mb-4 md:mb-6">
          Select the area you need design work for
        </p>

        {/* Options */}
        {showOptions && (
          <div className="space-y-2 md:space-y-3">
            {areaOptions.map((area, index) => (
              <motion.button
                key={area}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelectArea(area)}
                className={`w-full neu-soft rounded-xl p-3 md:p-4 text-left transition-all ${
                  requestArea === area
                    ? 'ring-2 ring-white/50 neu-inset'
                    : 'hover:neu-inset hover:ring-2 hover:ring-white/20 active:neu-inset'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-white text-base md:text-lg font-light">{area}</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Custom input at bottom if "Other area" selected */}
      {showCustomInput && (
        <div className="border-t border-white/5 p-4">
          <ChatInput
            show={true}
            value={customArea}
            onChange={setCustomArea}
            onSubmit={handleCustomSubmit}
            placeholder="Enter area name..."
          />
        </div>
      )}
    </div>
  )
}
