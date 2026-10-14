'use client'

import { useState, useEffect } from 'react'
import { useSceneStore } from '@/lib/store/sceneStore'
import { ChatInput } from '../ChatInput'

// DEPRECATED: This component is from the old brand book flow and is not currently used
export function SceneBrandName() {
  const setBrandName = (_value: string) => {}
  const triggerKool = useSceneStore((state) => state.triggerKool)
  const [value, setValue] = useState('')
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowInput(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = (value: string) => {
    if (value.trim()) {
      triggerKool() // Trigger kool animation
      setBrandName(value.trim())
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Question */}
      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-white text-2xl font-bold mb-2 sf-title">What's the brand name?</h2>
        <p className="text-white/50 text-sm font-light">
          💡 The name that will represent your brand identity
        </p>
      </div>

      {/* Chat input at bottom of sidebar */}
      <div className="border-t border-white/5 p-4">
        <ChatInput
          show={showInput}
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          placeholder="Enter brand name..."
        />
      </div>
    </div>
  )
}
