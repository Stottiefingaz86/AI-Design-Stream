'use client'

import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'
import { useMemo } from 'react'

export function KnowledgeTags() {
  const requestArea = useSceneStore((state) => state.requestArea)
  const userRequest = useSceneStore((state) => state.userRequest)
  const deadline = useSceneStore((state) => state.deadline)
  const assignedDesigner = useSceneStore((state) => state.assignedDesigner)

  // Collect all knowledge items
  const knowledgeItems = useMemo(() => {
    const items: Array<{ label: string; value: string }> = []

    if (requestArea) items.push({ label: 'Area', value: requestArea })
    if (userRequest.what) {
      // Truncate long requests
      const truncated = userRequest.what.length > 40 ? userRequest.what.substring(0, 40) + '...' : userRequest.what
      items.push({ label: 'What', value: truncated })
    }
    if (userRequest.goals) {
      const truncated = userRequest.goals.length > 40 ? userRequest.goals.substring(0, 40) + '...' : userRequest.goals
      items.push({ label: 'Goals', value: truncated })
    }
    if (userRequest.useCases) {
      const truncated = userRequest.useCases.length > 40 ? userRequest.useCases.substring(0, 40) + '...' : userRequest.useCases
      items.push({ label: 'Use Cases', value: truncated })
    }
    if (deadline) items.push({ label: 'Deadline', value: deadline })
    if (assignedDesigner) items.push({ label: 'Designer', value: assignedDesigner })

    return items
  }, [
    requestArea,
    userRequest.what,
    userRequest.goals,
    userRequest.useCases,
    deadline,
    assignedDesigner,
  ])

  if (knowledgeItems.length === 0) return null

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 pointer-events-none p-6" 
      style={{ zIndex: 20 }}
    >
      <div className="max-w-6xl mx-auto flex flex-wrap gap-3 justify-center">
        {knowledgeItems.map((item, index) => {
          return (
            <motion.div
              key={`${item.label}-${item.value}-${index}`}
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: 0,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                delay: index * 0.1,
                type: 'spring',
                stiffness: 200,
                damping: 20,
              }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="neu-soft rounded-full px-4 py-2 whitespace-nowrap">
                <span className="text-white/60 text-xs font-light mr-2">{item.label}:</span>
                <span className="text-white text-sm font-light">{item.value}</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
