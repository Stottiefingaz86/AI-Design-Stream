'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface SpeechBubbleProps {
  children: ReactNode
  show: boolean
  onContinue?: () => void
  showButton?: boolean
}

export function SpeechBubble({ children, show, onContinue, showButton = false }: SpeechBubbleProps) {
  if (!show) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed pointer-events-auto"
          style={{ 
            zIndex: 40,
            left: '20%',
            top: '30%',
            transform: 'translateX(0)'
          }}
        >
          <div className="relative">
            {/* Speech bubble */}
            <div className="neu-soft rounded-2xl p-6 min-w-[280px] max-w-md">
              <div className="text-white/90 text-lg font-light leading-relaxed">
                {children}
              </div>
              {showButton && onContinue && (
                <motion.button
                  onClick={onContinue}
                  className="mt-4 w-full py-3 neu-flat rounded-lg hover:neu-inset transition-all font-light"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue
                </motion.button>
              )}
            </div>
            {/* Tail pointing down-left to character */}
            <div className="absolute left-6 -bottom-3">
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-t-[16px] border-t-white/20 border-r-[12px] border-r-transparent" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
