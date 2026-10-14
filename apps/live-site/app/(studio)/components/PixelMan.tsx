'use client'

import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'

export function PixelMan() {
  const currentScene = useSceneStore((state) => state.currentScene)

  const getPose = () => {
    switch (currentScene) {
      case 'intro':
      case 'request_area':
      case 'user_request':
      case 'deadline':
      case 'confirmation':
      case 'delivering':
        return 'idle'
      default:
        return 'idle'
    }
  }

  const pose = getPose()

  return (
    <motion.div
      className="relative w-40 h-56 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: pose === 'celebrate' ? [1, 1.12, 1] : 1,
        y: pose === 'talking' ? [0, -6, 0] : 0,
      }}
      transition={{
        opacity: { duration: 1, ease: 'easeOut' },
        scale: { duration: 0.8 },
        y: { 
          duration: 0.6,
          repeat: pose === 'celebrate' ? Infinity : pose === 'talking' ? Infinity : 0,
          repeatDelay: 0.3,
        },
      }}
    >
      {/* Character with soft shadows */}
      <div className="relative">
        {/* Head */}
        <motion.div
          className="w-12 h-12 border-2 border-white/90 rounded-full mx-auto mb-2 bg-black/20"
          style={{
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.1)',
          }}
          animate={{
            scale: pose === 'talking' ? [1, 1.06, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: pose === 'talking' ? Infinity : 0,
          }}
        >
          {/* Eyes */}
          <div className="absolute top-3 left-2.5 w-1.5 h-1.5 bg-white/90 rounded-full" />
          <div className="absolute top-3 right-2.5 w-1.5 h-1.5 bg-white/90 rounded-full" />
          {/* Mouth - animates when talking */}
          {pose === 'talking' && (
            <motion.div
              className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-2 h-1 border border-white/80 rounded-full"
              animate={{
                height: [2, 4, 2],
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
              }}
            />
          )}
        </motion.div>
        
        {/* Body */}
        <div 
          className="w-1 h-16 bg-white/90 mx-auto"
          style={{
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          }}
        />
        
        {/* Arms - more animated */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-10">
          <motion.div
            className="w-1 h-10 bg-white/90 origin-top-left"
            style={{
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
            animate={{
              rotate: pose === 'celebrate' ? -70 : pose === 'talking' ? [-8, -4, -8] : 0,
            }}
            transition={{
              duration: pose === 'talking' ? 0.6 : 0.3,
              repeat: pose === 'talking' ? Infinity : 0,
            }}
          />
          <motion.div
            className="w-1 h-10 bg-white/90 origin-top-right"
            style={{
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
            animate={{
              rotate: pose === 'celebrate' ? 70 : pose === 'talking' ? [8, 4, 8] : 0,
            }}
            transition={{
              duration: pose === 'talking' ? 0.6 : 0.3,
              repeat: pose === 'talking' ? Infinity : 0,
            }}
          />
        </div>
        
        {/* Legs */}
        <div className="absolute top-26 left-1/2 -translate-x-1/2 flex gap-6">
          <motion.div
            className="w-1 h-12 bg-white/90 origin-top"
            style={{
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
            animate={{
              rotate: pose === 'celebrate' ? -18 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="w-1 h-12 bg-white/90 origin-top"
            style={{
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
            animate={{
              rotate: pose === 'celebrate' ? 18 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  )
}
