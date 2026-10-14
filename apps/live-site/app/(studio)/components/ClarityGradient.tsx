'use client'

import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'
import { useMemo } from 'react'

export function ClarityGradient() {
  const requestArea = useSceneStore((state) => state.requestArea)
  const userRequest = useSceneStore((state) => state.userRequest)
  const deadline = useSceneStore((state) => state.deadline)
  const assignedDesigner = useSceneStore((state) => state.assignedDesigner)

  // Calculate clarity progress (0-1) based on answered questions
  const clarityProgress = useMemo(() => {
    let progress = 0
    const maxSteps = 4

    if (requestArea) progress += 1
    if (userRequest.what) progress += 1
    if (deadline) progress += 1
    if (assignedDesigner) progress += 1

    return Math.min(progress / maxSteps, 1)
  }, [
    requestArea,
    userRequest.what,
    deadline,
    assignedDesigner,
  ])

  // Gradient becomes more visible and colorful as clarity increases
  const gradientSize = 150 + clarityProgress * 400 // 150px to 550px
  const gradientOpacity = 0.01 + clarityProgress * 0.08 // 0.01 to 0.09 opacity (very subtle)
  
  // Subtle pinks and purples for a soft, elegant aura
  const color1 = `hsla(300, 40%, 60%, ${gradientOpacity})` // Soft Pink
  const color2 = `hsla(280, 45%, 65%, ${gradientOpacity})` // Soft Purple
  const color3 = `hsla(320, 35%, 70%, ${gradientOpacity})` // Light Pink
  const color4 = `hsla(270, 40%, 60%, ${gradientOpacity})` // Deep Purple
  const color5 = `hsla(310, 38%, 65%, ${gradientOpacity})` // Rose Pink

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 25 }}
    >
      {/* Base gradient layer - largest, most subtle */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${gradientSize}px`,
          height: `${gradientSize}px`,
          background: `radial-gradient(circle, 
            ${color1} 0%,
            ${color2} 25%,
            ${color3} 50%,
            ${color4} 75%,
            transparent 85%
          )`,
          filter: 'blur(50px)',
        }}
        animate={{
          scale: [1, 1.03, 1],
          opacity: [gradientOpacity * 0.5, gradientOpacity * 0.8, gradientOpacity * 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Middle gradient layer - medium size, more vibrant */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${gradientSize * 0.75}px`,
          height: `${gradientSize * 0.75}px`,
          background: `radial-gradient(circle, 
            ${color2} 0%,
            ${color5} 30%,
            ${color1} 60%,
            transparent 75%
          )`,
          filter: 'blur(35px)',
        }}
        animate={{
          scale: [1, 1.04, 1],
          opacity: [gradientOpacity * 0.4, gradientOpacity * 0.7, gradientOpacity * 0.4],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Inner gradient layer - smallest, most intense */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${gradientSize * 0.5}px`,
          height: `${gradientSize * 0.5}px`,
          background: `radial-gradient(circle, 
            ${color3} 0%,
            ${color4} 40%,
            ${color5} 70%,
            transparent 85%
          )`,
          filter: 'blur(25px)',
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [gradientOpacity * 0.3, gradientOpacity * 0.6, gradientOpacity * 0.3],
          rotate: [0, -120, -240, -360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}
