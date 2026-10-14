'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const introText = 'Hi, My name is Lilly.'

export function LillySpeechBubble() {
  const [show, setShow] = useState(false)
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    // Show bubble after character arrives (3 seconds walk + 0.5 delay)
    const showTimer = setTimeout(() => setShow(true), 3500)
    
    // Hide bubble after 30 seconds
    const hideTimer = setTimeout(() => setShow(false), 33500) // 3.5s show delay + 30s display
    
    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  // Typewriter effect
  useEffect(() => {
    if (!show) return

    let currentIndex = 0
    const typeSpeed = 50 // milliseconds per character

    const typeInterval = setInterval(() => {
      if (currentIndex < introText.length) {
        setDisplayedText(introText.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        clearInterval(typeInterval)
      }
    }, typeSpeed)

    return () => clearInterval(typeInterval)
  }, [show])

  if (!show) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: '-50%',
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            opacity: {
              duration: 0.3,
            },
            scale: {
              duration: 0.3,
            },
          }}
          className="absolute pointer-events-none"
          style={{ 
            zIndex: 101,
            top: '-60px',
            left: '50%',
          }}
        >
          <div className="relative">
            {/* Speech bubble */}
            <div className="neu-soft rounded-xl px-4 py-2 min-w-[200px]">
              <div className="text-white/90 text-sm font-light text-center">
                {displayedText}
                {displayedText.length < introText.length && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                    className="inline-block w-1 h-4 bg-white/90 ml-1"
                  />
                )}
              </div>
            </div>
            {/* Tail pointing down to character - animated */}
            <motion.div 
              className="absolute left-1/2 transform -translate-x-1/2"
              style={{ bottom: '-6px' }}
              animate={{
                y: [0, -3, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-t-[6px] border-t-white/20 border-r-[4px] border-r-transparent" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
