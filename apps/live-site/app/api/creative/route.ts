import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { industry, targetAudience, companyPillars, colorPreferences, typographyPreference, designStyle, researchData } = body

  // Mock strategy data
  const strategy = {
    positioning: `A ${companyPillars[0] || 'innovative'} ${industry} design that empowers ${targetAudience} to achieve more through ${companyPillars[1] || 'excellence'} and ${companyPillars[2] || 'connection'}. We create meaningful experiences that resonate with ${targetAudience} through ${colorPreferences.length > 0 ? `a ${colorPreferences[0]} aesthetic` : 'thoughtful design'}.`,
    brandPillars: companyPillars.map((pillar: string, index: number) => ({
      name: pillar,
      description: `${pillar} is at the heart of everything we do. It guides our decisions, shapes our culture, and defines how we show up in the world.`
    })),
    taglineOptions: [
      `Built on ${companyPillars[0] || 'values'}.`,
      `Where ${companyPillars[0] || 'innovation'} meets ${companyPillars[1] || 'excellence'}.`,
      `${companyPillars.join(', ')}.`
    ]
  }

  // Mock creative directions
  const creativeDirections = [
    {
      name: 'Modern Minimalist',
      strategicIntent: 'Position as the refined, thoughtful choice for discerning customers',
      moodKeywords: ['Clean', 'Sophisticated', 'Timeless', 'Precise'],
      visualDirection: 'Bold typography, generous white space, subtle motion. Color palette emphasizes restraint and elegance.',
      copyDirection: 'Direct, confident, no-nonsense. Every word earns its place.'
    },
    {
      name: 'Bold Disruptor',
      strategicIntent: 'Challenge category conventions and signal innovation',
      moodKeywords: ['Dynamic', 'Energetic', 'Unexpected', 'Bold'],
      visualDirection: 'High contrast, experimental layouts, vibrant accents. Typography that commands attention.',
      copyDirection: 'Provocative, memorable, conversation-starting. Unafraid to take a stand.'
    },
    {
      name: 'Human-Centered',
      strategicIntent: 'Emphasize connection, empathy, and authentic relationships',
      moodKeywords: ['Warm', 'Approachable', 'Genuine', 'Inviting'],
      visualDirection: 'Organic shapes, natural textures, soft gradients. Photography that feels real and relatable.',
      copyDirection: 'Conversational, empathetic, story-driven. Speaks like a trusted friend.'
    }
  ]

  // Mock brand system (generated after direction selection)
  // Use color preferences if available, otherwise use defaults
  const getPaletteForPreference = (pref: string) => {
    const palettes: Record<string, { primary: string[], secondary: string[], neutrals: string[] }> = {
      'Bold & Vibrant': {
        primary: ['#FF6B6B', '#4ECDC4'],
        secondary: ['#FFE66D', '#95E1D3'],
        neutrals: ['#F5F5F5', '#E0E0E0', '#9E9E9E', '#424242']
      },
      'Minimal & Clean': {
        primary: ['#000000', '#FFFFFF'],
        secondary: ['#808080', '#E0E0E0'],
        neutrals: ['#F5F5F5', '#E0E0E0', '#9E9E9E', '#424242']
      },
      'Warm & Inviting': {
        primary: ['#FF8C42', '#FFB347'],
        secondary: ['#FFD700', '#FFA07A'],
        neutrals: ['#FFF8DC', '#F5DEB3', '#DEB887', '#CD853F']
      },
      'Cool & Professional': {
        primary: ['#2C3E50', '#3498DB'],
        secondary: ['#5DADE2', '#85C1E2'],
        neutrals: ['#ECF0F1', '#BDC3C7', '#95A5A6', '#7F8C8D']
      },
      'Nature & Organic': {
        primary: ['#27AE60', '#2ECC71'],
        secondary: ['#52BE80', '#7FB069'],
        neutrals: ['#F1F8F4', '#D5E8D4', '#A8D5BA', '#7FB3A3']
      },
      'Elegant & Sophisticated': {
        primary: ['#8B4C8F', '#9B59B6'],
        secondary: ['#BB8FCE', '#D2B4DE'],
        neutrals: ['#F4ECF7', '#E8DAEF', '#D7BDE2', '#C39BD3']
      },
      'Energetic & Dynamic': {
        primary: ['#E74C3C', '#F39C12'],
        secondary: ['#F1C40F', '#E67E22'],
        neutrals: ['#FDF2E9', '#FAD7A0', '#F8C471', '#F5B041']
      },
      'Calm & Serene': {
        primary: ['#5DADE2', '#85C1E2'],
        secondary: ['#AED6F1', '#D6EAF8'],
        neutrals: ['#EBF5FB', '#D6EAF8', '#AED6F1', '#85C1E2']
      }
    }
    return palettes[pref] || {
      primary: ['#000000', '#FFFFFF', '#808080'],
      secondary: ['#FF6B6B', '#4ECDC4', '#FFE66D'],
      neutrals: ['#F5F5F5', '#E0E0E0', '#9E9E9E', '#424242']
    }
  }

  const selectedPalette = colorPreferences.length > 0 
    ? getPaletteForPreference(colorPreferences[0])
    : {
        primary: ['#000000', '#FFFFFF', '#808080'],
        secondary: ['#FF6B6B', '#4ECDC4', '#FFE66D'],
        neutrals: ['#F5F5F5', '#E0E0E0', '#9E9E9E', '#424242']
      }

  // Use selected typography or default
  const selectedTypography = typographyPreference || 'Inter, system-ui, sans-serif'
  
  const brandSystem = {
    palette: selectedPalette,
    typography: {
      heading: selectedTypography,
      body: selectedTypography
    },
    designStyle: designStyle || 'Minimal',
    toneOfVoice: `Confident yet approachable. Built on ${companyPillars.join(' and ')}, our voice speaks directly to ${targetAudience} in the ${industry} space while remaining accessible and authentic.`,
    messagingExamples: [
      `Built for ${targetAudience} who value ${companyPillars[0] || 'excellence'} in ${industry}.`,
      `Every detail matters. That's why we've built this design with ${companyPillars.join(' and ')} at its core, specifically for ${targetAudience}.`,
      `Join ${targetAudience} who are choosing this design for a better ${industry} experience.`
    ]
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  return NextResponse.json({
    strategy,
    creativeDirections,
    brandSystem
  })
}
