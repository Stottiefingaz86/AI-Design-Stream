'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'

export function CreationPanel() {
  // This component is from the old brand book flow and is not currently used
  // Keeping it for potential future use but removing references to removed store properties
  const requestArea = useSceneStore((state) => state.requestArea)
  const userRequest = useSceneStore((state) => state.userRequest)
  const currentScene = useSceneStore((state) => state.currentScene)

  const hasBriefingData = requestArea || userRequest.what || userRequest.why
  // These old scenes no longer exist in the current flow
  const hasResearch = false
  const hasProduction = currentScene === 'delivering'

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <h2 className="text-white text-xl font-bold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}>
        The Creation
      </h2>

      {/* Briefing Data */}
      {hasBriefingData && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="text-white/40 text-xs uppercase tracking-wider font-bold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif' }}>
            Brief
          </h3>
          
          {requestArea && (
            <div className="neu-soft rounded-xl p-4">
              <p className="text-white/60 text-xs mb-1">Request Area</p>
              <p className="text-white text-lg font-light">{requestArea}</p>
            </div>
          )}

          {userRequest.what && (
            <div className="neu-soft rounded-xl p-4">
              <p className="text-white/60 text-xs mb-1">What</p>
              <p className="text-white text-lg font-light">{userRequest.what}</p>
            </div>
          )}

          {userRequest.why && (
            <div className="neu-soft rounded-xl p-4">
              <p className="text-white/60 text-xs mb-1">Why</p>
              <p className="text-white text-lg font-light">{userRequest.why}</p>
            </div>
          )}
        </motion.div>
      )}


      {!hasBriefingData && !hasResearch && !hasProduction && (
        <div className="text-center py-12">
          <p className="text-white/30 text-sm font-light">Knowledge will appear here as you answer questions</p>
        </div>
      )}
    </div>
  )
}
