'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'
import { ChatInput } from '../ChatInput'

const industries = [
  'SaaS',
  'E-commerce',
  'Healthcare',
  'Finance',
  'Education',
  'Creative Agency',
  'Real Estate',
  'Food & Beverage',
  'Fashion',
  'Technology',
  'Consulting',
  'Non-profit',
]

// DEPRECATED: This component is from the old brand book flow and is not currently used
export function SceneIndustry() {
  const setIndustry = (_value: string) => {}
  const triggerKool = useSceneStore((state) => state.triggerKool)
  const [value, setValue] = useState('')
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowInput(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleSelect = (industry: string) => {
    triggerKool() // Trigger kool animation
    setIndustry(industry)
  }

  const handleSubmit = (input: string) => {
    if (input.trim()) {
      triggerKool() // Trigger kool animation
      setIndustry(input.trim())
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Question and options */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-white text-2xl font-bold mb-2 sf-title">What industry are we entering?</h2>
          <p className="text-white/50 text-sm font-light mb-6">
            💡 This helps us analyze your competitive landscape and identify opportunities.
          </p>
        </div>

        <div className="space-y-3">
          {industries.map((industry, index) => (
            <motion.button
              key={industry}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}
              onClick={() => handleSelect(industry)}
              className="w-full px-4 py-3 neu-flat rounded-lg hover:neu-inset hover:ring-2 hover:ring-white/20 transition-all text-sm font-light text-left"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {industry}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat input at bottom of sidebar */}
      <div className="border-t border-white/5 p-4">
        <ChatInput
          show={showInput}
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          placeholder="Or type your own..."
        />
      </div>
    </div>
  )
}
