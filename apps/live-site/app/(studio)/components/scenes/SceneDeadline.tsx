'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'
import { ChatInput } from '../ChatInput'
import { WIPOverlay } from '../WIPOverlay'

const deadlineOptions = [
  'ASAP',
  'This week',
  'Next week',
  'In 2 weeks',
  'In a month',
  'Flexible',
]

export function SceneDeadline() {
  const deadline = useSceneStore((state) => state.deadline)
  const setDeadline = useSceneStore((state) => state.setDeadline)
  const triggerKool = useSceneStore((state) => state.triggerKool)
  const requestArea = useSceneStore((state) => state.requestArea)
  const assignedDesigner = useSceneStore((state) => state.assignedDesigner)
  const userRequest = useSceneStore((state) => state.userRequest)
  const previousScene = useSceneStore((state) => state.previousScene)
  const [showOptions, setShowOptions] = useState(false)
  const [customDeadline, setCustomDeadline] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [showWIPOverlay, setShowWIPOverlay] = useState(false)
  
  // Determine designer based on area
  const getDesigner = () => {
    const area = requestArea.toLowerCase()
    if (area === 'casino' || area === 'loyalty') {
      return 'Lilly'
    } else if (area === 'sports') {
      return 'Sam'
    } else if (area === 'authentication' || area === 'auth') {
      return 'Nek'
    } else if (area === 'poker') {
      return 'Victor'
    }
    return assignedDesigner
  }

  const currentDesigner = getDesigner()
  const showWIPButton = currentDesigner === 'Lilly' || assignedDesigner === 'Lilly'

  useEffect(() => {
    const timer = setTimeout(() => setShowOptions(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleSelectDeadline = (deadlineOption: string) => {
    if (deadlineOption === 'Custom') {
      setShowCustomInput(true)
    } else {
      triggerKool() // Trigger kool animation
      setDeadline(deadlineOption)
    }
  }

  const handleCustomSubmit = (value: string) => {
    if (value.trim()) {
      triggerKool() // Trigger kool animation
      setDeadline(value.trim())
    }
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Back Button */}
      <div className="p-4 md:p-6 pb-2">
        <motion.button
          onClick={() => previousScene()}
          className="flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors group"
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-1 transition-transform">
            <path d="M12 4l-6 6 6 6" />
          </svg>
          <span className="text-sm font-light">Back</span>
        </motion.button>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-0">
        <h2 className="text-white text-xl md:text-2xl font-bold mb-2 sf-title">when do you need this?</h2>
        <p className="text-white/50 text-xs md:text-sm font-light mb-4 md:mb-6">
          Help us prioritize your request
        </p>

        {/* WIP Button - Show if Lilly is assigned */}
        {showWIPButton && showOptions && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowWIPOverlay(true)}
            className="w-full neu-soft rounded-xl p-4 text-left mb-4 hover:neu-inset hover:ring-2 hover:ring-white/20 transition-all group"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-base font-medium mb-1">see what lilly is currently working on</div>
                <div className="text-white/40 text-xs">View and reprioritize {currentDesigner}'s work</div>
              </div>
              <div className="text-white/30 group-hover:text-white/60 transition-colors">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 4l6 6-6 6" />
                </svg>
              </div>
            </div>
          </motion.button>
        )}

        {/* Options */}
        {showOptions && (
          <div className="space-y-2 md:space-y-3">
            {deadlineOptions.map((option, index) => (
              <motion.button
                key={option}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelectDeadline(option)}
                className={`w-full neu-soft rounded-xl p-3 md:p-4 text-left transition-all ${
                  deadline === option
                    ? 'ring-2 ring-white/50 neu-inset'
                    : 'hover:neu-inset hover:ring-2 hover:ring-white/20 active:neu-inset'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-white text-base md:text-lg font-light">{option}</span>
              </motion.button>
            ))}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: deadlineOptions.length * 0.1 }}
              onClick={() => handleSelectDeadline('Custom')}
              className={`w-full neu-soft rounded-xl p-4 text-left transition-all ${
                showCustomInput
                  ? 'ring-2 ring-white/50 neu-inset'
                  : 'hover:neu-inset hover:ring-2 hover:ring-white/20'
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-white text-lg font-light">Custom</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Custom input at bottom if "Custom" selected */}
      {showCustomInput && (
        <div className="border-t border-white/5 p-4">
          <ChatInput
            show={true}
            value={customDeadline}
            onChange={setCustomDeadline}
            onSubmit={handleCustomSubmit}
            placeholder="Enter deadline..."
          />
        </div>
      )}

      {/* WIP Overlay */}
      <WIPOverlay
        isOpen={showWIPOverlay}
        onClose={() => setShowWIPOverlay(false)}
        designer={currentDesigner}
        currentRequest={
          requestArea && userRequest.what
            ? {
                area: requestArea,
                what: userRequest.what,
                deadline: deadline || 'Not set',
                priority: deadline === 'ASAP' ? 'high' : deadline === 'This week' ? 'high' : 'medium',
                status: 'todo', // New requests start as todo
              }
            : undefined
        }
      />
    </div>
  )
}
