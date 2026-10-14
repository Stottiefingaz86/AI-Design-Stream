'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'
import { ChatInput } from '../ChatInput'

const audienceOptions = [
  'Tech-savvy professionals',
  'Creative entrepreneurs',
  'Small business owners',
  'Enterprise decision makers',
  'Gen Z consumers',
  'Millennial professionals',
  'Startup founders',
  'Marketing teams',
  'Design professionals',
  'Developers & engineers',
  'Healthcare professionals',
  'Educators & students',
  'E-commerce shoppers',
  'B2B buyers',
  'Content creators',
]

// DEPRECATED: This component is from the old brand book flow and is not currently used
export function SceneTargetAudience() {
  const setTargetAudience = (_value: string) => {}
  const triggerKool = useSceneStore((state) => state.triggerKool)
  const [value, setValue] = useState('')
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowInput(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleSelect = (audience: string) => {
    triggerKool() // Trigger kool animation
    setTargetAudience(audience)
  }

  const handleSubmit = (input: string) => {
    if (input.trim()) {
      triggerKool() // Trigger kool animation
      setTargetAudience(input.trim())
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Question and options */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-white text-2xl font-bold mb-2 sf-title">Who are we building this for?</h2>
          <p className="text-white/50 text-sm font-light mb-6">
            💡 Select an option or type your own below
          </p>
        </div>

        <div className="space-y-3">
          {audienceOptions.map((audience, index) => (
            <motion.button
              key={audience}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}
              onClick={() => handleSelect(audience)}
              className="w-full px-4 py-3 neu-flat rounded-lg hover:neu-inset hover:ring-2 hover:ring-white/20 transition-all text-sm font-light text-left"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {audience}
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
