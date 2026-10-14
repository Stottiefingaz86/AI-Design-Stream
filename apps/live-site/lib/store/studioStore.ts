import { create } from 'zustand'
import type {
  BriefData,
  ResearchOutput,
  BrandPillar,
  Positioning,
  TaglineOption,
  CreativeDirection,
  BrandSystem,
} from '@/lib/agent/schemas'

export type Phase = 
  | 'briefing'
  | 'researching'
  | 'synthesizing'
  | 'presenting'
  | 'generating'
  | 'delivering'

interface StudioState {
  // Phase management
  phase: Phase
  setPhase: (phase: Phase) => void
  
  // Thinking state
  thinkingText: string
  setThinkingText: (text: string) => void
  
  // Brief Data
  briefData: BriefData | null
  setBriefData: (data: BriefData) => void
  
  // Research Data
  researchData: ResearchOutput | null
  setResearchData: (data: ResearchOutput) => void
  
  // Strategy / Synthesis
  brandPillars: BrandPillar[]
  setBrandPillars: (pillars: BrandPillar[]) => void
  approvePillar: (id: string) => void
  positioning: Positioning | null
  setPositioning: (positioning: Positioning) => void
  approvePositioning: () => void
  taglineOptions: TaglineOption[]
  setTaglineOptions: (options: TaglineOption[]) => void
  approveTagline: (id: string) => void
  
  // Creative Directions
  creativeDirections: CreativeDirection[]
  setCreativeDirections: (directions: CreativeDirection[]) => void
  selectedDirection: string | null
  selectDirection: (id: string) => void
  
  // Brand System
  brandSystem: BrandSystem | null
  setBrandSystem: (system: BrandSystem) => void
  approvePalette: () => void
  approveTypography: () => void
  approveToneOfVoice: () => void
  
  // Actions
  submitBrief: () => void
  approveStrategy: () => void
  approveCreativeDirection: () => void
  approveProduction: () => void
  startDelivery: () => void
}

export const useStudioStore = create<StudioState>((set) => ({
  // Initial state
  phase: 'briefing',
  thinkingText: '',
  briefData: null,
  researchData: null,
  brandPillars: [],
  positioning: null,
  taglineOptions: [],
  creativeDirections: [],
  selectedDirection: null,
  brandSystem: null,
  
  // Phase management
  setPhase: (phase) => set({ phase }),
  
  // Thinking state
  setThinkingText: (thinkingText) => set({ thinkingText }),
  
  // Brief Data
  setBriefData: (data) => set({ briefData: data }),
  
  // Research Data
  setResearchData: (data) => set({ researchData: data }),
  
  // Strategy
  setBrandPillars: (pillars) => set({ brandPillars: pillars }),
  approvePillar: (id) => set((state) => ({
    brandPillars: state.brandPillars.map((p) =>
      p.id === id ? { ...p, approved: true } : p
    ),
  })),
  setPositioning: (positioning) => set({ positioning }),
  approvePositioning: () => set((state) => ({
    positioning: state.positioning
      ? { ...state.positioning, approved: true }
      : null,
  })),
  setTaglineOptions: (options) => set({ taglineOptions: options }),
  approveTagline: (id) => set((state) => ({
    taglineOptions: state.taglineOptions.map((t) => ({
      ...t,
      approved: t.id === id,
    })),
  })),
  
  // Creative Directions
  setCreativeDirections: (directions) => set({ creativeDirections: directions }),
  selectDirection: (id) => set({ selectedDirection: id }),
  
  // Brand System
  setBrandSystem: (system) => set({ brandSystem: system }),
  approvePalette: () => set((state) => ({
    brandSystem: state.brandSystem
      ? {
          ...state.brandSystem,
          palette: { ...state.brandSystem.palette, approved: true },
        }
      : null,
  })),
  approveTypography: () => set((state) => ({
    brandSystem: state.brandSystem
      ? {
          ...state.brandSystem,
          typography: { ...state.brandSystem.typography, approved: true },
        }
      : null,
  })),
  approveToneOfVoice: () => set((state) => ({
    brandSystem: state.brandSystem
      ? {
          ...state.brandSystem,
          toneOfVoice: { ...state.brandSystem.toneOfVoice, approved: true },
        }
      : null,
  })),
  
  // Actions
  submitBrief: () => set({ phase: 'researching' }),
  approveStrategy: () => set({ phase: 'presenting' }),
  approveCreativeDirection: () => set({ phase: 'generating' }),
  approveProduction: () => set({ phase: 'delivering' }),
  startDelivery: () => set({ phase: 'delivering' }),
}))
