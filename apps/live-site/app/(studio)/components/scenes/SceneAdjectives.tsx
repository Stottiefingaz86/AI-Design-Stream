'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'
import { ChatInput } from '../ChatInput'

// DEPRECATED: This component is from the old brand book flow and is not currently used
export function SceneAdjectives() {
  // Using empty defaults since these properties no longer exist in the store
  const adjectives: string[] = []
  const addAdjective = (_value: string) => {}
  const removeAdjective = (_index: number) => {}
  const [value, setValue] = useState('')
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowInput(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = (value: string) => {
    if (value.trim() && adjectives.length < 3) {
      addAdjective(value.trim())
      setValue('')
    }
  }

  return (
    <>
      <ChatInput
        show={showInput}
        value={value}
        onChange={setValue}
        onSubmit={handleSubmit}
        placeholder={`Word ${adjectives.length + 1} of 3`}
      >
        <p className="text-xl font-light">Give me 3 words this brand must live by.</p>
      </ChatInput>

      {/* Word tokens - appear above input */}
      {adjectives.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 max-w-4xl mx-auto px-4 z-40"
        >
          <div className="flex gap-3 justify-center flex-wrap">
            {adjectives.map((adj, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-5 py-2 neu-soft rounded-lg text-lg font-light flex items-center gap-3"
              >
                {adj}
                <button
                  onClick={() => removeAdjective(index)}
                  className="text-white/50 hover:text-white/80 text-xl"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </>
  )
}
