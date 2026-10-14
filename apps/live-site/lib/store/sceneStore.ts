import { create } from 'zustand'

export type Scene = 
  | 'intro'
  | 'request_area'
  | 'user_request'
  | 'deadline'
  | 'confirmation'
  | 'delivering'

interface SceneState {
  currentScene: Scene
  triggerKoolAnimation: boolean
  isDesigning: boolean
  isWalkingOut: boolean
  showLilly: boolean
  
  // Request data
  requestArea: string
  userRequest: {
    what: string
    why: string
    context: string
    goals: string
    useCases: string
  }
  deadline: string
  assignedDesigner: string | null
  
  
  // Actions
  setRequestArea: (area: string) => void
  setUserRequest: (request: { what: string; why: string; context: string; goals: string; useCases: string }) => void
  setDeadline: (deadline: string) => void
  setAssignedDesigner: (designer: string | null) => void
  triggerKool: () => void
  resetKoolTrigger: () => void
  setIsDesigning: (isDesigning: boolean) => void
  setIsWalkingOut: (isWalkingOut: boolean) => void
  setShowLilly: (show: boolean) => void
  goToScene: (scene: Scene) => void
  nextScene: () => void
  previousScene: () => void
  reset: () => void
}

const briefingScenes: Scene[] = ['intro', 'request_area', 'user_request', 'deadline']

export const useSceneStore = create<SceneState>((set, get) => ({
  currentScene: 'intro',
  triggerKoolAnimation: false,
  isDesigning: false,
  isWalkingOut: false,
  showLilly: false,
  requestArea: '',
  userRequest: {
    what: '',
    why: '',
    context: '',
    goals: '',
    useCases: '',
  },
  deadline: '',
  assignedDesigner: null,
  
  setRequestArea: (requestArea) => {
    set({ requestArea })
    if (requestArea.trim()) {
      // If Casino or Loyalty is selected, CH walks out and Lilly appears
      const area = requestArea.toLowerCase()
      if (area === 'casino' || area === 'loyalty') {
        setTimeout(() => {
          // Set isWalkingOut first to ensure CH stays visible
          get().setIsWalkingOut(true)
          // Then immediately show Lilly so they animate together
          setTimeout(() => {
            get().setShowLilly(true)
          }, 50) // Small delay to ensure isWalkingOut is processed first
        }, 500)
      }
      setTimeout(() => get().nextScene(), 500)
    }
  },
  
  setUserRequest: (userRequest) => {
    set({ userRequest })
    // Don't auto-advance scene - let the component handle navigation
    // The component will call nextScene() when useCases is complete or skipped
  },
  
  setDeadline: (deadline) => {
    set({ deadline })
    // Auto-assign designer based on area
    const area = get().requestArea.toLowerCase()
    let designer: string | null = null
    
    if (area === 'sports') {
      designer = 'Sam'
    } else if (area === 'casino') {
      // Casino can be Lilly or Nek, default to Lilly
      designer = 'Lilly'
    } else if (area === 'loyalty') {
      designer = 'Lilly'
    } else if (area === 'authentication' || area === 'auth') {
      designer = 'Nek'
    } else if (area === 'poker') {
      designer = 'Victor'
    }
    
    if (designer) {
      set({ assignedDesigner: designer })
    }
    
    if (deadline.trim()) {
      setTimeout(() => get().goToScene('confirmation'), 500)
    }
  },
  
  setAssignedDesigner: (designer) => set({ assignedDesigner: designer }),
  
  triggerKool: () => set({ triggerKoolAnimation: true }),
  resetKoolTrigger: () => set({ triggerKoolAnimation: false }),
  setIsDesigning: (isDesigning) => set({ isDesigning }),
  setIsWalkingOut: (isWalkingOut) => set({ isWalkingOut }),
  setShowLilly: (showLilly) => set({ showLilly }),
  
  goToScene: (scene) => set({ currentScene: scene }),
  
  nextScene: () => {
    const current = get().currentScene
    const briefingIndex = briefingScenes.indexOf(current)
    if (briefingIndex >= 0 && briefingIndex < briefingScenes.length - 1) {
      const nextScene = briefingScenes[briefingIndex + 1]
      set({ currentScene: nextScene })
    }
  },
  
  previousScene: () => {
    const current = get().currentScene
    const allScenes: Scene[] = ['intro', 'request_area', 'user_request', 'deadline', 'confirmation', 'delivering']
    const currentIndex = allScenes.indexOf(current)
    if (currentIndex > 0) {
      const previousScene = allScenes[currentIndex - 1]
      set({ currentScene: previousScene })
    }
  },
  
  reset: () => {
    set({
      currentScene: 'intro',
      triggerKoolAnimation: false,
      isDesigning: false,
      isWalkingOut: false,
      showLilly: false,
      requestArea: '',
      userRequest: {
        what: '',
        why: '',
        context: '',
        goals: '',
        useCases: '',
      },
      deadline: '',
      assignedDesigner: null,
    })
  },
}))
