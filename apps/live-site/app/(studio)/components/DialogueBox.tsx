'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface DialogueBoxProps {
  children: ReactNode
  show: boolean
  delay?: number
}

export function DialogueBox({ children, show, delay = 0 }: DialogueBoxProps) {
  if (!show) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ 
            delay,
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-2xl px-8 z-50"
        >
          <div className="neu-soft p-8 rounded-lg">
            <div className="text-white/95 leading-relaxed">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
