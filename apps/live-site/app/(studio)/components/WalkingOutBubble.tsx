'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useSceneStore } from '@/lib/store/sceneStore'

const bleepedWords = [
  'F*u@k',
  'Sh*t',
  'C*@t',
  'bulls@h*t',
  'F*u@k',
  'Sh*t',
]

export function WalkingOutBubble() {
  const [currentWord, setCurrentWord] = useState(0)
  const isWalkingOut = useSceneStore((state) => state.isWalkingOut)
  const [isWalkingIn, setIsWalkingIn] = useState(true)

  // Show during walk-in (first 3 seconds) or walk-out
  useEffect(() => {
    // Hide after walk-in completes (3 seconds)
    const walkInTimer = setTimeout(() => {
      setIsWalkingIn(false)
    }, 3000)

    return () => clearTimeout(walkInTimer)
  }, [])

  useEffect(() => {
    if (!isWalkingIn && !isWalkingOut) return
    
    // Cycle through bleeped words
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % bleepedWords.length)
    }, 600) // Change word every 600ms

    return () => clearInterval(interval)
  }, [isWalkingIn, isWalkingOut])

  if (!isWalkingIn && !isWalkingOut) return null

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
        <div className="neu-soft rounded-xl px-4 py-2 min-w-[100px]">
          <div className="text-white/90 text-sm font-light text-center">
            {bleepedWords[currentWord]}
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
