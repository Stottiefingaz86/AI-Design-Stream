'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSceneStore } from '@/lib/store/sceneStore'
import { ThinkingBubble } from '../ThinkingBubble'

const deliveringMessages = [
  'Submitting to Mattermost...',
  'Creating Craft.io ticket...',
  'Notifying design team...',
  'Almost done...',
]

export function SceneDelivering() {
  const requestArea = useSceneStore((state) => state.requestArea)
  const userRequest = useSceneStore((state) => state.userRequest)
  const deadline = useSceneStore((state) => state.deadline)
  const assignedDesigner = useSceneStore((state) => state.assignedDesigner)
  const setIsWalkingOut = useSceneStore((state) => state.setIsWalkingOut)
  const reset = useSceneStore((state) => state.reset)
  const goToScene = useSceneStore((state) => state.goToScene)
  const setShowLilly = useSceneStore((state) => state.setShowLilly)
  const [isDelivering, setIsDelivering] = useState(true)
  const [deliveryComplete, setDeliveryComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deliveryResults, setDeliveryResults] = useState<{
    mattermost?: { sent: boolean; error: string | null }
    craft?: { sent: boolean; error: string | null }
  } | null>(null)

  const handleBackToCH = () => {
    // Reset state and go back to intro
    setShowLilly(false)
    setIsWalkingOut(false)
    reset()
    // Small delay to ensure reset completes before scene change
    setTimeout(() => {
      goToScene('intro')
      // Trigger event to reset chat and bring CH back
      const event = new CustomEvent('resetChatAndCH')
      window.dispatchEvent(event)
    }, 100)
  }

  useEffect(() => {
    const deliverRequest = async () => {
      try {
        const response = await fetch('/api/deliver', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestArea,
            userRequest,
            deadline,
            assignedDesigner,
          }),
        })

        const data = await response.json()

        if (data.success) {
          setDeliveryComplete(true)
          setIsDelivering(false)
          setDeliveryResults({
            mattermost: data.mattermost,
            craft: data.craft,
          })
          
          // Automatically bring CH back after 3 seconds
          setTimeout(() => {
            handleBackToCH()
          }, 3000)
        } else {
          setError(data.error || 'Failed to submit request')
          setIsDelivering(false)
        }
      } catch (err) {
        console.error('Delivery error:', err)
        setError('Failed to submit request. Please try again.')
        setIsDelivering(false)
      }
    }

    deliverRequest()
  }, [requestArea, userRequest, deadline, assignedDesigner, setShowLilly, setIsWalkingOut, reset, goToScene])

  if (isDelivering) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
          <div className="text-center space-y-4 w-full">
            <h2 className="text-white text-2xl font-bold sf-title mb-4">Submitting Request...</h2>
            <ThinkingBubble messages={deliveringMessages} inline={true} />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
          <div className="text-center space-y-4 w-full max-w-md">
            <h2 className="text-white text-2xl font-bold sf-title mb-4">Error</h2>
            <p className="text-white/70 text-sm font-light mb-6">{error}</p>
            <motion.button
              onClick={() => window.location.reload()}
              className="px-6 py-3 neu-flat rounded-lg hover:neu-inset transition-all font-light"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Try Again
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  const handleCreateCraftTicket = async () => {
    try {
      const response = await fetch('/api/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestArea,
          userRequest,
          deadline,
          assignedDesigner,
          createCraftTicket: true,
        }),
      })

      const data = await response.json()
      
      if (data.success && data.craft?.sent) {
        // Update delivery results
        setDeliveryResults(prev => ({
          ...prev,
          craft: { sent: true, error: null },
        }))
      } else {
        console.error('Failed to create Craft ticket:', data.craft?.error)
      }
    } catch (err) {
      console.error('Error creating Craft ticket:', err)
    }
  }

  if (deliveryComplete) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 w-full max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-4xl mb-4"
            >
              ✨
            </motion.div>
            <h2 className="text-white text-2xl font-bold sf-title mb-2">Request Submitted!</h2>
            
            {/* Delivery Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full neu-soft rounded-lg p-4 border border-white/10 space-y-3"
            >
              {/* Mattermost Status */}
              {deliveryResults?.mattermost && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Mattermost</span>
                  <span className={deliveryResults.mattermost.sent ? 'text-green-400' : 'text-red-400'}>
                    {deliveryResults.mattermost.sent ? '✓ Sent' : '✗ Failed'}
                  </span>
                </div>
              )}
              
              {/* Craft.io Status */}
              {deliveryResults?.craft && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Craft.io</span>
                  <span className={deliveryResults.craft.sent ? 'text-green-400' : 'text-yellow-400'}>
                    {deliveryResults.craft.sent ? '✓ Created' : 'Not created'}
                  </span>
                </div>
              )}
              
              {/* Craft Ticket Options */}
              {(!deliveryResults?.craft?.sent || deliveryResults.craft.error) && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <p className="text-white/60 text-xs text-left">Create Craft.io Ticket:</p>
                  <motion.button
                    onClick={handleCreateCraftTicket}
                    className="w-full px-4 py-2.5 neu-flat rounded-lg hover:neu-inset transition-all text-white/80 text-sm font-light text-left"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between">
                      <span>Create Craft Ticket</span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 12L10 8L6 4" />
                      </svg>
                    </div>
                  </motion.button>
                </div>
              )}
            </motion.div>
            
            {assignedDesigner && (
              <p className="text-white/50 text-xs font-light">
                {assignedDesigner} will be notified
              </p>
            )}
            
            {/* Back to CH button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={handleBackToCH}
              className="mt-4 px-8 py-3 neu-flat rounded-lg hover:neu-inset transition-all font-light text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to CH
            </motion.button>
          </motion.div>
        </div>
      </div>
    )
  }

  return null
}
