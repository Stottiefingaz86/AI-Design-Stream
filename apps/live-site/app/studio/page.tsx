'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { WalkingSprite } from './(studio)/components/WalkingSprite'
import { LillySprite } from './(studio)/components/LillySprite'
import { LillySpeechBubble } from './(studio)/components/LillySpeechBubble'
import { CharacterAura } from './(studio)/components/CharacterAura'
import { ClarityGradient } from './(studio)/components/ClarityGradient'
import { KnowledgeTags } from './(studio)/components/KnowledgeTags'
import { SceneIntro } from './(studio)/components/scenes/SceneIntro'
import { SceneRequestArea } from './(studio)/components/scenes/SceneRequestArea'
import { SceneUserRequest } from './(studio)/components/scenes/SceneUserRequest'
import { SceneDeadline } from './(studio)/components/scenes/SceneDeadline'
import { SceneConfirmation } from './(studio)/components/scenes/SceneConfirmation'
import { SceneDelivering } from './(studio)/components/scenes/SceneDelivering'
import { ChatWithCH } from './(studio)/components/ChatWithCH'
import { useSceneStore } from '@/lib/store/sceneStore'

export default function StudioPage() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint is 768px
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  const currentScene = useSceneStore((state) => state.currentScene)
  const showLilly = useSceneStore((state) => state.showLilly)
  const isWalkingOut = useSceneStore((state) => state.isWalkingOut)
  const requestArea = useSceneStore((state) => state.requestArea)
  const userRequest = useSceneStore((state) => state.userRequest)
  
  // Use a stable key for WalkingSprite so it doesn't remount during normal scene transitions
  // The component's internal useEffect will handle resetting when needed
  const spriteKey = 'walking-sprite'

  const renderScene = () => {
    switch (currentScene) {
      case 'intro':
        return <SceneIntro key="intro" />
      case 'request_area':
        return <SceneRequestArea key="request_area" />
      case 'user_request':
        return <SceneUserRequest key="user_request" />
      case 'deadline':
        return <SceneDeadline key="deadline" />
      case 'confirmation':
        return <SceneConfirmation key="confirmation" />
      case 'delivering':
        return <SceneDelivering key="delivering" />
      default:
        return null
    }
  }

  // Show mobile message if on mobile
  if (isMobile) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-8 max-w-md"
        >
          <div className="mb-6">
            <img 
              src="/logo..svg" 
              alt="Logo" 
              className="h-8 w-auto mx-auto mb-8 opacity-60"
            />
          </div>
          <h1 className="text-white text-2xl font-light mb-4">
            Desktop View Required
          </h1>
          <p className="text-white/60 text-sm font-light leading-relaxed">
            Please check this experience on a desktop device for the best experience.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-background flex flex-col md:flex-row relative overflow-hidden">
      {/* Logo - top left */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-50 pointer-events-none">
        <img 
          src="/logo..svg" 
          alt="Logo" 
          className="h-6 md:h-8 w-auto"
        />
      </div>

      {/* Mobile: Character - positioned in upper area, not cut off */}
      <div className="md:hidden relative h-[30vh] flex items-center justify-center overflow-visible">
        {/* Character Aura - mobile (smaller) */}
        <div className="scale-75 origin-center">
          <CharacterAura />
        </div>
        
        {/* Walking Sprite - mobile (smaller) */}
        <div className="relative pointer-events-none scale-75 origin-center" style={{ zIndex: 100 }}>
          {(isWalkingOut || !showLilly) && (
            <WalkingSprite key={spriteKey} />
          )}
          {showLilly && (
            <div className="relative">
              <LillySprite />
              <LillySpeechBubble />
            </div>
          )}
        </div>
        
        {/* Chat with CH - mobile, positioned below character, above sprite */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full px-4 z-[101]">
          <ChatWithCH />
        </div>
      </div>

      {/* Desktop: Center - Character area with aura and knowledge tags */}
      <div className="hidden md:flex flex-1 items-center justify-center relative overflow-hidden">
        {/* Knowledge Tags at bottom - lowest z-index */}
        <KnowledgeTags />
        
        {/* Clarity Gradient - grows as questions are answered */}
        <ClarityGradient />
        
        {/* Character Aura - middle z-index */}
        <CharacterAura />
        
        {/* Walking Sprite - centered - highest z-index, always on top */}
        <div className="relative flex flex-col items-center gap-6" style={{ zIndex: 100 }}>
          <div className="relative pointer-events-none">
            {/* Show CH if not showing Lilly, or if CH is walking out (so we see both) */}
            {/* Priority: if isWalkingOut is true, always show CH */}
            {/* Use resetKey to force remount when going back to intro after reset */}
            {(isWalkingOut || !showLilly) && (
              <WalkingSprite key={spriteKey} />
            )}
            {/* Show Lilly when showLilly is true - appears while CH is walking out */}
            {showLilly && (
              <div className="relative">
                <LillySprite />
                <LillySpeechBubble />
              </div>
            )}
          </div>
        </div>
        
      </div>
      
      {/* Desktop: Right sidebar - Chat replaces the sidebar */}
      <div className="hidden md:flex w-96 border-l border-white/5 bg-background h-full overflow-hidden relative" style={{ zIndex: 40 }}>
        <ChatWithCH />
      </div>

      {/* Mobile: Toast overlay for sidebar content - taller to show more content */}
      <AnimatePresence mode="wait">
        {currentScene && (
          <motion.div
            key={currentScene}
            initial={{ y: '55%', opacity: 0 }}
            animate={{ y: '55%', opacity: 1 }}
            exit={{ y: '55%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed top-[55%] left-0 right-0 -translate-y-1/2 z-[100] bg-background border border-white/10 rounded-2xl shadow-2xl h-[65vh] overflow-hidden flex flex-col mx-4"
          >
            {/* Drag handle */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2 mb-1 flex-shrink-0" />
            <div className="flex-1 overflow-y-auto min-h-0">
              {renderScene()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
