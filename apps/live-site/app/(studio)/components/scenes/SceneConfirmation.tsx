'use client'

import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'

export function SceneConfirmation() {
  const requestArea = useSceneStore((state) => state.requestArea)
  const userRequest = useSceneStore((state) => state.userRequest)
  const deadline = useSceneStore((state) => state.deadline)
  const assignedDesigner = useSceneStore((state) => state.assignedDesigner)

  const goToScene = useSceneStore((state) => state.goToScene)

  const handleSubmit = () => {
    // Move to delivering scene
    goToScene('delivering')
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h2 className="text-white text-2xl font-bold mb-2 sf-title">Request Summary</h2>
          <p className="text-white/50 text-sm font-light mb-6">
            Review your design request before submitting
          </p>
        </div>

        {/* Request Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="neu-soft rounded-xl p-5 space-y-4"
        >
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Area</p>
            <p className="text-white text-lg font-light">{requestArea}</p>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">What</p>
              <p className="text-white/80 text-sm font-light">{userRequest.what}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Why</p>
              <p className="text-white/80 text-sm font-light">{userRequest.why}</p>
            </div>
            {userRequest.context && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Context</p>
                <p className="text-white/80 text-sm font-light">{userRequest.context}</p>
              </div>
            )}
            {userRequest.goals && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Goals</p>
                <p className="text-white/80 text-sm font-light">{userRequest.goals}</p>
              </div>
            )}
            {userRequest.useCases && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Use Cases</p>
                <p className="text-white/80 text-sm font-light">{userRequest.useCases}</p>
              </div>
            )}
          </div>
          
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Deadline</p>
            <p className="text-white text-lg font-light">{deadline}</p>
          </div>
          
          {assignedDesigner && (
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Assigned To</p>
              <p className="text-white text-lg font-light">{assignedDesigner}</p>
              <p className="text-white/50 text-xs mt-1">
                {assignedDesigner === 'Lilly' && 'Designer for Casino & Loyalty'}
                {assignedDesigner === 'Sam' && 'Designer for Sports'}
                {assignedDesigner === 'Nek' && 'Designer for Auth & Casino'}
                {assignedDesigner === 'Victor' && 'Designer for Poker'}
              </p>
            </div>
          )}
          
          {!assignedDesigner && (
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Assigned To</p>
              <p className="text-white/60 text-sm font-light">CH (Head of Design) will review</p>
            </div>
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={handleSubmit}
          className="w-full px-8 py-4 neu-flat rounded-lg hover:neu-inset transition-all font-light text-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Submit Request
        </motion.button>
      </div>
    </div>
  )
}
