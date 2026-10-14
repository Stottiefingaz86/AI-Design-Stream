'use client'

import { useEffect } from 'react'
import { useSceneStore } from '@/lib/store/sceneStore'
import { ChatInput } from '../ChatInput'
import { ThinkingBubble } from '../ThinkingBubble'

const thinkingMessages = [
  'Analyzing the competitive landscape...',
  'Mapping positioning opportunities...',
  'Identifying whitespace...',
  'Researching messaging patterns...',
]

// DEPRECATED: This component is from the old brand book flow and is not currently used
export function SceneResearching() {
  const goToScene = useSceneStore((state) => state.goToScene)
  const setResearchData = (_data: any) => {}
  const industry = ''
  const targetAudience = ''
  const companyPillars: string[] = []
  const colorPreferences: string[] = []
  const typographyPreference = ''
  const designStyle = ''

  useEffect(() => {
    const fetchResearch = async () => {
      try {
        const response = await fetch('/api/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            industry,
            targetAudience,
            companyPillars,
            colorPreferences,
            typographyPreference,
            designStyle,
          }),
        })
        const data = await response.json()
        setResearchData(data)
        // Deprecated scene - do nothing
      } catch (error) {
        console.error('Research failed:', error)
      }
    }

    fetchResearch()
  }, [industry, targetAudience, companyPillars, colorPreferences, typographyPreference, designStyle, setResearchData, goToScene])

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <div className="text-center space-y-4 w-full">
          <h2 className="text-white text-2xl font-bold sf-title mb-4">Researching...</h2>
          <ThinkingBubble messages={thinkingMessages} inline={true} />
        </div>
      </div>
      <div className="border-t border-white/5 p-4">
        <ChatInput show={true} showButton={false}>
          <p className="text-sm font-light">Analyzing the competitive landscape...</p>
        </ChatInput>
      </div>
    </div>
  )
}
