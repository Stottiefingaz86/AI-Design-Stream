'use client'

import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'
import { useMemo } from 'react'

export function CharacterAura() {
  const requestArea = useSceneStore((state) => state.requestArea)
  const userRequest = useSceneStore((state) => state.userRequest)
  const deadline = useSceneStore((state) => state.deadline)
  const assignedDesigner = useSceneStore((state) => state.assignedDesigner)

  // Calculate knowledge progress (0-1)
  const knowledgeProgress = useMemo(() => {
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

  // Calculate aura size and intensity based on progress
  const auraSize = 100 + knowledgeProgress * 150 // 100px to 250px
  const auraIntensity = knowledgeProgress * 0.3 // 0 to 0.3 opacity (more subtle)
  const auraColor = `rgba(255, 255, 255, ${auraIntensity})`

  // Color progression: white -> subtle pink/purple as knowledge grows
  const hue = 300 + knowledgeProgress * 20 // 300 to 320 (pink to purple range)
  const saturation = knowledgeProgress * 25 // 0 to 25% (subtle)
  const colorAura = `hsla(${hue}, ${saturation}%, 60%, ${auraIntensity})`

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Outer glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${auraSize}px`,
          height: `${auraSize}px`,
          background: `radial-gradient(circle, ${colorAura} 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [auraIntensity * 0.8, auraIntensity, auraIntensity * 0.8],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Inner glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${auraSize * 0.6}px`,
          height: `${auraSize * 0.6}px`,
          background: `radial-gradient(circle, ${colorAura} 0%, transparent 60%)`,
          filter: 'blur(10px)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [auraIntensity * 0.6, auraIntensity * 0.9, auraIntensity * 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}
