'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'
import { ChatInput } from '../ChatInput'

const suggestedPillars = [
  'Innovation',
  'Excellence',
  'Integrity',
  'Transparency',
  'Customer Focus',
  'Sustainability',
  'Collaboration',
  'Growth',
  'Quality',
  'Trust',
  'Simplicity',
  'Impact',
]

// DEPRECATED: This component is from the old brand book flow and is not currently used
export function SceneCompanyPillars() {
  const companyPillars: string[] = []
  const addCompanyPillar = (_value: string) => {}
  const removeCompanyPillar = (_index: number) => {}
  const goToScene = useSceneStore((state) => state.goToScene)
  const triggerKool = useSceneStore((state) => state.triggerKool)
  const [value, setValue] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowInput(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = (input: string) => {
    if (input.trim() && companyPillars.length < 4) {
      triggerKool() // Trigger kool animation
      addCompanyPillar(input.trim())
      setValue('')
    }
  }

  const handleSelectSuggestion = (pillar: string) => {
    if (!companyPillars.includes(pillar) && companyPillars.length < 4) {
      triggerKool() // Trigger kool animation
      addCompanyPillar(pillar)
    }
  }

  const handleContinue = () => {
    if (companyPillars.length >= 2) {
      // Deprecated scene - do nothing
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Question and content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-white text-2xl font-bold mb-2 sf-title">What are your company pillars?</h2>
          <p className="text-white/50 text-sm font-light mb-4">
            💡 <strong>What are pillars?</strong> They're your core values—the fundamental beliefs that guide your design. Choose 2-4 values that truly define your approach.
          </p>
        </div>

        {/* Selected pillars */}
        {companyPillars.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-white/40 text-xs uppercase tracking-wider">Selected Pillars</h3>
            <div className="flex flex-wrap gap-2">
              {companyPillars.map((pillar, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-4 py-2 neu-soft rounded-lg text-sm font-light flex items-center gap-2"
                >
                  {pillar}
                  <button
                    onClick={() => removeCompanyPillar(index)}
                    className="text-white/50 hover:text-white/80 text-lg leading-none"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Suggested pillars */}
        <div>
          <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Suggested Pillars</h3>
          <div className="grid grid-cols-2 gap-2">
            {suggestedPillars.map((pillar, index) => {
              const isSelected = companyPillars.includes(pillar)
              return (
                <motion.button
                  key={pillar}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                  onClick={() => handleSelectSuggestion(pillar)}
                  disabled={isSelected || companyPillars.length >= 4}
                  className={`px-4 py-3 neu-flat rounded-lg hover:neu-inset hover:ring-2 hover:ring-white/20 transition-all text-sm font-light text-left ${
                    isSelected ? 'ring-2 ring-white/50 neu-inset' : ''
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                  whileHover={{ scale: isSelected || companyPillars.length >= 4 ? 1 : 1.02, y: isSelected || companyPillars.length >= 4 ? 0 : -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {pillar}
                  {isSelected && <span className="ml-2">✓</span>}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Chat input at bottom */}
      <div className="border-t border-white/5 p-4 space-y-4">
        <ChatInput
          show={showInput}
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          placeholder={
            companyPillars.length < 4
              ? `Pillar ${companyPillars.length + 1}...`
              : 'Maximum 4 pillars'
          }
        />
        
        {companyPillars.length >= 2 && (
          <motion.button
            onClick={handleContinue}
            className="w-full px-6 py-3 neu-flat rounded-lg hover:neu-inset transition-all font-light"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue
          </motion.button>
        )}
      </div>
    </div>
  )
}
