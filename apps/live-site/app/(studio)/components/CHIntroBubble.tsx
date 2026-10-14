'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useSceneStore } from '@/lib/store/sceneStore'

const introText = 'Hi im CH, head of design'

export function CHIntroBubble() {
  const [displayedText, setDisplayedText] = useState('')
  const [showBubble, setShowBubble] = useState(false)
  const showLilly = useSceneStore((state) => state.showLilly)
  const isWalkingOut = useSceneStore((state) => state.isWalkingOut)

  // Show bubble after walk-in completes (3 seconds) and before walk-out
  useEffect(() => {
    // Wait for walk-in to complete (3 seconds) before showing intro
    const timer = setTimeout(() => {
      if (!showLilly && !isWalkingOut) {
        setShowBubble(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [showLilly, isWalkingOut])

  // Typewriter effect
  useEffect(() => {
    if (!showBubble) return

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
  }, [showBubble])

  // Hide bubble when walking out or when Lilly appears
  useEffect(() => {
    if (isWalkingOut || showLilly) {
      setShowBubble(false)
      setDisplayedText('')
    }
  }, [isWalkingOut, showLilly])

  if (!showBubble || showLilly || isWalkingOut) return null

  return (
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
        top: '-60px',
        left: '50%',
        zIndex: 101, // Above character
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
  )
}
