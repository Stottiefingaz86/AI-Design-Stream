'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export function LillySprite() {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [hasArrived, setHasArrived] = useState(false)
  const [animationState, setAnimationState] = useState<'walking' | 'idle'>('walking')

  // Walking animation: 4 frames
  const walkingFrameCount = 4
  // Idle animation: 6 frames from lilly_idle folder
  const idleFrameCount = 6
  const fps = 10
  const displayHeight = 120

  // Check if first image loads
  useEffect(() => {
    const img = new Image()
    img.src = '/walk/idle/kool/lilly_walk/1.png'
    img.onload = () => {
      setImageLoaded(true)
    }
    img.onerror = () => {
      console.error('Failed to load Lilly sprite')
    }
  }, [])

  // Animate through walking frames while walking
  useEffect(() => {
    if (animationState !== 'walking' || !imageLoaded || hasArrived) return

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % walkingFrameCount)
    }, 1000 / fps)

    return () => clearInterval(interval)
  }, [animationState, walkingFrameCount, fps, imageLoaded, hasArrived])

  // Loop idle animation when arrived
  useEffect(() => {
    if (animationState !== 'idle' || !hasArrived || !imageLoaded) return

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % idleFrameCount)
    }, 1000 / fps)

    return () => clearInterval(interval)
  }, [animationState, hasArrived, imageLoaded, idleFrameCount, fps])

  // Stop walking when arrived
  useEffect(() => {
    if (hasArrived && animationState === 'walking') {
      setAnimationState('idle')
      setCurrentFrame(0)
    }
  }, [hasArrived, animationState])

  // Get current sprite file
  const getSpriteFile = () => {
    if (animationState === 'walking') {
      // Walking animation: use frames 1-4 from lilly_walk folder
      return `/walk/idle/kool/lilly_walk/${currentFrame + 1}.png`
    } else {
      // Idle animation: use frames 1-6 from lilly_idle folder
      return `/walk/idle/kool/lilly_walk/lilly_idle/${currentFrame + 1}.png`
    }
  }

  const spriteFile = getSpriteFile()

  const handleAnimationComplete = () => {
    setHasArrived(true)
  }

  return (
    <motion.div
      className="relative"
      initial={{ 
        opacity: 0,
        x: '-100vw',
      }}
      animate={{ 
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      transition={{
        x: {
          duration: 3,
          ease: 'easeInOut',
          onComplete: handleAnimationComplete,
        },
        opacity: {
          duration: 0.5,
        },
      }}
      style={{
        position: 'relative',
        transform: 'translateX(0)',
        width: 'auto',
        height: 'auto',
      }}
    >
      {imageLoaded ? (
        <motion.img
          src={spriteFile}
          alt="Lilly character"
          style={{
            height: `${displayHeight}px`,
            width: 'auto',
            maxWidth: 'none',
            objectFit: 'contain',
            imageRendering: 'pixelated' as const,
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))',
          }}
          key={spriteFile}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            scale: 1,
          }}
          transition={{ duration: 0.1 }}
        />
      ) : (
        <div className="w-24 h-24 flex items-center justify-center text-white/50 text-xs border border-white/20">
          Loading...
        </div>
      )}
    </motion.div>
  )
}
