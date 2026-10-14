'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'
import { ThinkingBubble } from '../ThinkingBubble'

const designingMessages = [
  'Creating your Figma design...',
  'Applying design system...',
  'Building components...',
  'Finalizing layouts...',
  'Almost ready...',
]

// DEPRECATED: This component is from the old brand book flow and is not currently used
export function SceneDelivery() {
  const requestArea = useSceneStore((state) => state.requestArea)
  const userRequest = useSceneStore((state) => state.userRequest)
  const brandSystem = null
  const isDesigning = useSceneStore((state) => state.isDesigning)
  const setIsDesigning = useSceneStore((state) => state.setIsDesigning)
  const setIsWalkingOut = useSceneStore((state) => state.setIsWalkingOut)
  const [showContent, setShowContent] = useState(false)
  const [designReady, setDesignReady] = useState(false)

  // Check if all data is ready
  const isDataReady = brandSystem !== null

  useEffect(() => {
    // If we're designing, simulate the design process
    if (isDesigning && !designReady) {
      const timer = setTimeout(() => {
        setDesignReady(true)
        setIsDesigning(false)
        setTimeout(() => setShowContent(true), 500)
      }, 5000) // 5 seconds of designing

      return () => clearTimeout(timer)
    }
  }, [isDesigning, designReady, setIsDesigning])

  const handleCreateDesign = () => {
    if (isDataReady) {
      setIsDesigning(true)
      setDesignReady(false)
      setShowContent(false)
    }
  }

  const handleDownload = () => {
    // Mock download - in production, this would generate and download a Figma file
    const link = document.createElement('a')
    link.href = '#'
    link.download = `${requestArea || 'Design'}_Figma_File.fig`
    link.click()
    alert('Figma design download started! (This is a mock - Figma generation coming soon)')
    
    // Trigger character to walk out after a short delay
    setTimeout(() => {
      setIsWalkingOut(true)
    }, 1000)
  }

  return (
    <div className="h-full flex flex-col">
      {isDesigning && (
        <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
          <div className="text-center space-y-4 w-full">
            <h2 className="text-white text-2xl font-bold sf-title mb-4">Creating Your Design...</h2>
            <ThinkingBubble messages={designingMessages} inline={true} />
          </div>
        </div>
      )}

      {!isDesigning && !showContent && isDataReady && (
        <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
          <div className="text-center space-y-6 w-full max-w-md">
            <h2 className="text-white text-3xl font-bold sf-title mb-4">Ready to Create Your Design?</h2>
            <p className="text-white/60 text-sm font-light mb-6">
              All your design information is ready. Click below to generate your Figma deliverable.
            </p>
            <motion.button
              onClick={handleCreateDesign}
              className="w-full px-8 py-4 neu-flat rounded-lg hover:neu-inset transition-all font-light text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Design
            </motion.button>
          </div>
        </div>
      )}

      {showContent && designReady && (
        <>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="neu-soft rounded-xl p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-4xl mb-4"
              >
                ✨
              </motion.div>
              <h2 className="text-white text-2xl font-bold sf-title mb-2">Your Design is Ready</h2>
              <p className="text-white/70 text-sm font-light">
                Your {requestArea} design request is complete.
              </p>
            </motion.div>

            {/* Deliverables */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="neu-soft rounded-xl p-5"
            >
              <h3 className="text-white/40 text-xs uppercase tracking-wider mb-4">Deliverables</h3>
              <div className="space-y-3">
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={handleDownload}
                  className="w-full neu-flat rounded-lg p-5 text-left hover:neu-inset transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-lg font-light mb-1">Figma Design File</h4>
                      <p className="text-white/60 text-xs">Complete design using our internal design system</p>
                    </div>
                    <span className="text-white/40 text-xl">↓</span>
                  </div>
                </motion.button>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="neu-flat rounded-lg p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white text-lg font-light mb-1">Design Assets</h4>
                      <p className="text-white/60 text-xs">Components, styles, and design tokens</p>
                    </div>
                    <span className="text-white/40 text-xs">Coming soon</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
