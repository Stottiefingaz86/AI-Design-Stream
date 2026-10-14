'use client'

import { useState, useEffect } from 'react'
import { useSceneStore } from '@/lib/store/sceneStore'
import { ChatInput } from '../ChatInput'

export function SceneComplete() {
  // This component is from the old brand book flow and is not currently used
  // Keeping it for potential future use but removing references to removed store properties
  const requestArea = useSceneStore((state) => state.requestArea)
  const userRequest = useSceneStore((state) => state.userRequest)
  const goToScene = useSceneStore((state) => state.goToScene)
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowInput(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (showInput) {
      // Deprecated scene - do nothing
    }
  }, [showInput, goToScene])

  return (
    <ChatInput show={showInput} showButton={false}>
      <div className="space-y-2">
        <p className="text-xl font-light">Perfect. I've got everything I need.</p>
        <div className="text-sm text-white/60 font-light space-y-1">
          <p><span className="text-white/40">Area:</span> {requestArea}</p>
          <p><span className="text-white/40">What:</span> {userRequest.what}</p>
          <p><span className="text-white/40">Why:</span> {userRequest.why}</p>
        </div>
        <p className="text-lg text-white/70 mt-4 font-light">
          Let me do some research. I'll be back soon...
        </p>
      </div>
    </ChatInput>
  )
}
