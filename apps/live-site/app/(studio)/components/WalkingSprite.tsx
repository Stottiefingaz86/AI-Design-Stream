'use client'

import { motion } from 'framer-motion'
import { useSceneStore, type Scene } from '@/lib/store/sceneStore'
import { useState, useEffect, useCallback } from 'react'
import { WalkingOutBubble } from './WalkingOutBubble'
import { CHIntroBubble } from './CHIntroBubble'

export function WalkingSprite() {
  const currentScene = useSceneStore((state) => state.currentScene)
  const triggerKoolAnimation = useSceneStore((state) => state.triggerKoolAnimation)
  const isDesigning = useSceneStore((state) => state.isDesigning)
  const isWalkingOut = useSceneStore((state) => state.isWalkingOut)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isWalking, setIsWalking] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [hasArrived, setHasArrived] = useState(false)
  const [walkOutComplete, setWalkOutComplete] = useState(false)
  const [animationState, setAnimationState] = useState<'walking' | 'idle' | 'kool' | 'designing' | 'walkingOut'>('walking')
  
  // Listen for reset event to bring CH back
  useEffect(() => {
    const handleReset = () => {
      // Reset to walk in again
      setHasArrived(false)
      setAnimationState('walking')
      setCurrentFrame(0)
      setWalkOutComplete(false)
      setIsWalking(true)
    }
    
    window.addEventListener('resetChatAndCH', handleReset)
    return () => window.removeEventListener('resetChatAndCH', handleReset)
  }, [])
  
  // Debug: Log important state changes
  useEffect(() => {
    if (animationState === 'idle' || animationState === 'kool' || hasArrived) {
      console.log('CH Animation State:', { animationState, hasArrived, triggerKoolAnimation, imageLoaded })
    }
  }, [animationState, hasArrived, triggerKoolAnimation, imageLoaded])

  // Walking animation: 4 frames
  const walkingFrameCount = 4
  // Idle animation: 6 frames (images 5-10)
  const idleFrameCount = 6
  const idleStartFrame = 5 // First idle frame number
  // Kool animation: 6 frames (1-6)
  const koolFrameCount = 6
  // Designing animation: loop kool animation
  const designingFrameCount = 6
  const fps = 10
  const displayHeight = 120

  // REMOVED: Reset logic that was causing walking animation to restart
  // The walking animation should only play once on initial mount, then transition to idle
  // We don't need to reset on scene changes - let the idle animation continue

  // Check if first image loads
  useEffect(() => {
    const img = new Image()
    img.src = '/walk/image 1.png'
    img.onload = () => {
      setImageLoaded(true)
    }
    img.onerror = () => {
      console.error('Failed to load sprite')
    }
  }, [])

  // Fallback: Set hasArrived after walk-in animation duration (3 seconds)
  // This ensures hasArrived is set even if onComplete doesn't fire
  useEffect(() => {
    if (!hasArrived && imageLoaded && animationState === 'walking' && !isWalkingOut) {
      const timer = setTimeout(() => {
        console.log('Fallback timer: setting hasArrived to true after 3 seconds')
        setHasArrived(true)
        setAnimationState('idle')
        setCurrentFrame(0)
      }, 3000) // Match the walk-in animation duration

      return () => clearTimeout(timer)
    }
  }, [hasArrived, imageLoaded, animationState, isWalkingOut])

  const resetKoolTrigger = useSceneStore((state) => state.resetKoolTrigger)

  // Trigger kool animation when requested (ONLY from chat, not automatically)
  // IMPORTANT: Only trigger kool when explicitly requested from chat, never automatically
  useEffect(() => {
    // Only trigger kool if:
    // 1. triggerKoolAnimation is true (set by chat)
    // 2. We've arrived (walk-in complete)
    // 3. We're currently in idle state (not walking, not already kool)
    if (triggerKoolAnimation && hasArrived && animationState === 'idle' && !isWalkingOut) {
      setAnimationState('kool')
      setCurrentFrame(0) // Start from first kool frame
      resetKoolTrigger() // Reset the trigger flag immediately
    }
  }, [triggerKoolAnimation, hasArrived, animationState, resetKoolTrigger, isWalkingOut])

  // Trigger designing animation when isDesigning is true
  useEffect(() => {
    if (isDesigning && hasArrived && animationState === 'idle') {
      setAnimationState('designing')
      setCurrentFrame(0)
    } else if (!isDesigning && animationState === 'designing') {
      setAnimationState('idle')
      setCurrentFrame(0)
    }
  }, [isDesigning, hasArrived, animationState])

  // Trigger walking out animation
  useEffect(() => {
    if (isWalkingOut && hasArrived) {
      // If currently idle, kool, or designing, transition to walking out
      if (animationState === 'idle' || animationState === 'kool' || animationState === 'designing') {
        setAnimationState('walkingOut')
        setCurrentFrame(0)
      }
    } else if (!isWalkingOut && animationState === 'walkingOut') {
      // If isWalkingOut becomes false while walking out, reset to idle
      setAnimationState('idle')
      setCurrentFrame(0)
    }
  }, [isWalkingOut, hasArrived, animationState])

  // Animate through walking frames while walking
  // CRITICAL: This should ONLY run when we're walking AND haven't arrived yet
  useEffect(() => {
    // Stop immediately if arrived - NEVER start walking animation if we've already arrived
    if (hasArrived) {
      console.log('Walking animation: BLOCKED - hasArrived is true, should be idle')
      return
    }
    
    // Stop if not in walking state
    if (animationState !== 'walking') {
      console.log('Walking animation: BLOCKED - not in walking state', { animationState })
      return
    }
    
    // Wait for image to load
    if (!imageLoaded) {
      console.log('Walking animation: waiting for image')
      return
    }

    console.log('Walking animation: starting loop', { animationState, hasArrived, imageLoaded })
    const interval = setInterval(() => {
      // CRITICAL: Check conditions inside interval - stop immediately if arrived
      if (hasArrived) {
        console.log('Walking animation: STOPPING - hasArrived became true')
        clearInterval(interval)
        return
      }
      if (animationState !== 'walking') {
        console.log('Walking animation: STOPPING - state changed to', animationState)
        clearInterval(interval)
        return
      }
      setCurrentFrame((prev) => (prev + 1) % walkingFrameCount)
    }, 1000 / fps)

    return () => {
      console.log('Walking animation: cleanup interval')
      clearInterval(interval)
    }
  }, [animationState, walkingFrameCount, fps, imageLoaded, hasArrived])

  // Animate through walking frames while walking out
  useEffect(() => {
    if (animationState !== 'walkingOut' || !imageLoaded) return

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % walkingFrameCount)
    }, 1000 / fps)

    return () => clearInterval(interval)
  }, [animationState, walkingFrameCount, fps, imageLoaded])

  // Loop idle animation when arrived
  useEffect(() => {
    // Only run if all conditions are met
    if (animationState !== 'idle') return
    if (!hasArrived) return
    if (!imageLoaded) return

    console.log('Starting idle animation loop', { animationState, hasArrived, imageLoaded })
    
    // Start idle animation loop immediately - cycle through frames 0-5 (images 5-10)
    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        const next = (prev + 1) % idleFrameCount
        return next
      })
    }, 1000 / fps)

    return () => {
      console.log('Cleaning up idle animation interval')
      clearInterval(interval)
    }
  }, [animationState, hasArrived, imageLoaded, idleFrameCount, fps])

  // Play kool animation once, then return to idle
  useEffect(() => {
    if (animationState !== 'kool' || !imageLoaded) return

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev + 1 >= koolFrameCount) {
          // Animation complete, return to idle (idle loop will start automatically)
          setAnimationState('idle')
          return 0 // Reset to first idle frame
        }
        return prev + 1
      })
    }, 1000 / fps)

    return () => clearInterval(interval)
  }, [animationState, imageLoaded, koolFrameCount, fps])

  // Loop designing animation while isDesigning is true
  useEffect(() => {
    if (animationState !== 'designing' || !imageLoaded) return

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % designingFrameCount)
    }, 1000 / fps)

    return () => clearInterval(interval)
  }, [animationState, imageLoaded, designingFrameCount, fps])

  // Stop walking when arrived and transition to idle
  useEffect(() => {
    if (hasArrived && animationState === 'walking') {
      console.log('Transitioning to idle state')
      setIsWalking(false)
      setAnimationState('idle')
      setCurrentFrame(0) // Start from first idle frame (image 5.png)
      // The idle animation loop useEffect will start automatically
    }
  }, [hasArrived, animationState])


  // Get current sprite file
  const getSpriteFile = () => {
    if (animationState === 'walking' || animationState === 'walkingOut') {
      // Walking animation: use frames 1-4
      return `/walk/image ${currentFrame + 1}.png`
    } else if (animationState === 'kool') {
      // Kool animation: use frames 1-6 from kool folder
      return `/walk/idle/kool/${currentFrame + 1}.png`
    } else if (animationState === 'designing') {
      // Designing animation: loop kool animation
      return `/walk/idle/kool/${currentFrame + 1}.png`
    } else if (animationState === 'idle') {
      // Idle animation: use frames 5-10 from idle folder
      const idleFrameNumber = idleStartFrame + currentFrame
      const path = `/walk/idle/image ${idleFrameNumber}.png`
      console.log('Idle animation frame:', { currentFrame, idleFrameNumber, path, animationState })
      return path
    } else {
      // Default to idle if state is unclear (shouldn't happen, but fallback)
      const idleFrameNumber = idleStartFrame + currentFrame
      console.log('Default to idle (unclear state):', { animationState, currentFrame, idleFrameNumber })
      return `/walk/idle/image ${idleFrameNumber}.png`
    }
  }

  const spriteFile = getSpriteFile()

  const handleAnimationComplete = useCallback(() => {
    console.log('Walk-in animation complete, setting hasArrived to true')
    setHasArrived(true)
    // Immediately transition to idle state
    setAnimationState('idle')
    setCurrentFrame(0)
  }, [])

  const handleWalkOutComplete = () => {
    setWalkOutComplete(true)
  }

  // Determine animation based on state
  const getAnimationProps = () => {
    if (animationState === 'walkingOut') {
      return {
        animate: {
          opacity: 1,
          x: '100vw',
          scale: 1,
        },
        transition: {
          x: {
            duration: 3,
            ease: 'easeInOut',
            onComplete: handleWalkOutComplete,
          },
          opacity: {
            duration: 0.5,
          },
        },
      }
    } else if (!hasArrived) {
      return {
        initial: {
          opacity: 0,
          x: '-100vw',
        },
        animate: {
          opacity: 1,
          x: 0,
          scale: 1,
        },
        transition: {
          x: {
            duration: 3,
            ease: 'easeInOut',
            onComplete: handleAnimationComplete,
          },
          opacity: {
            duration: 0.5,
          },
        },
      }
    } else {
      return {
        animate: {
          opacity: 1,
          x: 0,
          scale: 1,
        },
      }
    }
  }

  return (
    <motion.div
      className="relative"
      {...getAnimationProps()}
      style={{
        position: 'relative',
        width: 'auto',
        height: 'auto',
      }}
    >
      {imageLoaded ? (
        <motion.img
          src={spriteFile}
          alt={
            animationState === 'walking' 
              ? "Walking character" 
              : animationState === 'walkingOut'
              ? "Walking out character"
              : animationState === 'kool'
              ? "Kool animation"
              : animationState === 'designing'
              ? "Designing character"
              : "Idle character"
          }
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
            scale: 1, // Ensure no scaling during animation
          }}
          transition={{ duration: 0.1 }}
        />
      ) : (
        <div className="w-24 h-24 flex items-center justify-center text-white/50 text-xs border border-white/20">
          Loading...
        </div>
      )}
      <WalkingOutBubble />
      <CHIntroBubble />
    </motion.div>
  )
}
