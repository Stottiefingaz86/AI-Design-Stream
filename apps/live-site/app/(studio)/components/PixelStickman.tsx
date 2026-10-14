'use client'

import { motion } from 'framer-motion'
import { useStudioStore, Phase } from '@/lib/store/studioStore'

const getStickmanState = (phase: Phase): string => {
  switch (phase) {
    case 'briefing':
      return 'idle'
    case 'researching':
    case 'synthesizing':
    case 'generating':
      return 'thinking'
    case 'presenting':
      return 'presenting'
    case 'delivering':
      return 'celebrate'
    default:
      return 'idle'
  }
}

// Simple pixel stickman using CSS
export function PixelStickman() {
  const phase = useStudioStore((state) => state.phase)
  const state = getStickmanState(phase)

  return (
    <motion.div
      className="relative w-32 h-48 flex items-center justify-center"
      animate={{
        scale: state === 'celebrate' ? [1, 1.1, 1] : 1,
      }}
      transition={{
        duration: 0.5,
        repeat: state === 'celebrate' ? Infinity : 0,
      }}
    >
      {/* Stickman body */}
      <div className="relative">
        {/* Head */}
        <div className="w-8 h-8 border-2 border-white rounded-full mx-auto mb-1" />
        
        {/* Body */}
        <div className="w-0.5 h-12 bg-white mx-auto" />
        
        {/* Arms */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-8">
          <div className="w-0.5 h-8 bg-white origin-top-left" 
            style={{
              transform: state === 'thinking' ? 'rotate(-45deg)' : 
                         state === 'presenting' ? 'rotate(-20deg)' : 
                         state === 'celebrate' ? 'rotate(-60deg)' : 'rotate(0deg)',
            }}
          />
          <div className="w-0.5 h-8 bg-white origin-top-right"
            style={{
              transform: state === 'thinking' ? 'rotate(45deg)' : 
                         state === 'presenting' ? 'rotate(20deg)' : 
                         state === 'celebrate' ? 'rotate(60deg)' : 'rotate(0deg)',
            }}
          />
        </div>
        
        {/* Legs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 flex gap-4">
          <div className="w-0.5 h-10 bg-white origin-top"
            style={{
              transform: state === 'celebrate' ? 'rotate(-15deg)' : 'rotate(0deg)',
            }}
          />
          <div className="w-0.5 h-10 bg-white origin-top"
            style={{
              transform: state === 'celebrate' ? 'rotate(15deg)' : 'rotate(0deg)',
            }}
          />
        </div>
      </div>

      {/* State indicator */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/60 agency-font whitespace-nowrap">
        {state.toUpperCase()}
      </div>
    </motion.div>
  )
}
