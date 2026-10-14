'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface DialogueBubbleProps {
  children: ReactNode
  show: boolean
  onContinue?: () => void
  showButton?: boolean
}

export function DialogueBubble({ children, show, onContinue, showButton = false }: DialogueBubbleProps) {
  if (!show) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="relative min-w-[300px] max-w-[500px]">
            {/* Bubble */}
            <div className="px-6 py-4 bg-black border-2 border-white">
              <div className="text-white text-center">
                {children}
              </div>
              {showButton && onContinue && (
                <motion.button
                  onClick={onContinue}
                  className="mt-4 w-full py-2 border-2 border-white hover:bg-white hover:text-black transition-colors font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue
                </motion.button>
              )}
            </div>
            {/* Tail pointing down */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black border-r-2 border-b-2 border-white transform rotate-45" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
