'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BubbleBackgroundProps {
  interactive?: boolean
  className?: string
}

export function BubbleBackground({ interactive = false, className }: BubbleBackgroundProps) {
  const bubbles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 150 + 50,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }))

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0">
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            className="absolute rounded-full bg-white/10 blur-xl"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
            }}
            animate={{
              x: [0, Math.random() * 40 - 20, Math.random() * 40 - 20, 0],
              y: [0, Math.random() * 40 - 20, Math.random() * 40 - 20, 0],
              scale: [1, 1.1, 0.9, 1],
              opacity: [0.3, 0.5, 0.4, 0.3],
            }}
            transition={{
              duration: bubble.duration,
              delay: bubble.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  )
}
