// Type definitions for research and creative outputs

// Brief Data
export interface BriefData {
  brandName: string
  industry: string
  targetAudience: string
  adjectives: string[]
  competitors: string[]
  moodPreference: string
}

// Research Output
export interface Competitor {
  name: string
  url: string
  headline: string
  valueProps: string[]
  toneTags: string[]
  visualTags: string[]
}

export interface PositioningPoint {
  name: string
  x: number // 0-100
  y: number // 0-100
}

export interface PositioningMap {
  axisX: string // e.g., "Premium ↔ Accessible"
  axisY: string // e.g., "Traditional ↔ Innovative"
  points: PositioningPoint[]
}

export interface WhitespaceOpportunity {
  title: string
  insight: string
  recommendedAngle: string
  visualDirection: string
}

export interface ResearchOutput {
  categoryDefinition: string
  competitors: Competitor[]
  messagingPatterns: {
    commonClaims: string[]
    overusedWords: string[]
  }
  whitespaceOpportunities: WhitespaceOpportunity[]
  positioningMap: PositioningMap
}

// Strategy Output
export interface BrandPillar {
  id: string
  name: string
  description: string
  rationale: string
  approved: boolean
}

export interface Positioning {
  statement: string
  rationale: string
  approved: boolean
}

export interface TaglineOption {
  id: string
  text: string
  rationale: string
  approved: boolean
}

// Creative Output
export interface CreativeDirection {
  id: string
  name: string
  strategicIntent: string
  moodKeywords: string[]
  visualDirection: string
  copyDirection: string
  selected: boolean
}

export interface BrandSystem {
  palette: {
    primary: string[]
    secondary: string[]
    rationale: string
    approved: boolean
  }
  typography: {
    primary: {
      name: string
      rationale: string
    }
    secondary: {
      name: string
      rationale: string
    }
    approved: boolean
  }
  toneOfVoice: {
    principles: string[]
    do: string[]
    dont: string[]
    rationale: string
    approved: boolean
  }
  messagingExamples: {
    id: string
    context: string
    message: string
    rationale: string
  }[]
  logoDirection: {
    notes: string
    rationale: string
  }
  visualSystemNotes: string
}
