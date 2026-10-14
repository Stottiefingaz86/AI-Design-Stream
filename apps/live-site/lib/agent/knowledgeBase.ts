/**
 * Comprehensive Knowledge Base
 * 
 * This file contains all knowledge about:
 * - Agnostic Design System (from Figma)
 * - Stakeholders
 * - Processes
 * - Additional Figma files
 * 
 * This knowledge is used by CH to answer questions accurately.
 */

import { DesignSystemInfo, designSystem, colorTokenMap } from './designSystem'

export interface Stakeholder {
  name: string
  role: string
  responsibilities?: string[]
  contact?: string
  areas?: string[] // Areas they work on (Casino, Sports, etc.)
}

export interface Process {
  name: string
  description: string
  steps?: string[]
  stakeholders?: string[] // Names of stakeholders involved
  areas?: string[] // Areas this process applies to
  tools?: string[] // Tools used (Figma, Mattermost, Craft.io, etc.)
}

export interface FigmaFile {
  name: string
  url?: string
  description?: string
  contains?: string[] // What it contains (components, colors, patterns, etc.)
  lastUpdated?: string
}

export interface LogoVariant {
  brand: string
  type: 'Wordmark' | 'Lettermark' | 'Icon'
  color: 'Primary' | 'Primary Reversed' | 'White' | 'Black' | 'VIP Primary' | 'VIP Secondary' | 'VIP Reversed' | 'Default'
  mode?: 'Light Mode' | 'Dark Mode' | 'VIP'
  size?: 'small' | 'large'
  style?: 'Full Color' | 'Monochromatic' | 'VIP'
  description?: string
}

export interface LogoSpecs {
  brand: string
  minimumSize?: {
    wordmark?: string
    lettermark?: string
  }
  clearSpace?: string
  usage?: string[]
  variants: LogoVariant[]
}

export interface UXReport {
  id: string
  source: string // e.g., "Jurnii", "User Testing", "Analytics", "Google Web Search"
  sourceUrl?: string
  title: string
  date: string
  // Jurnii-specific sections
  executiveSummary?: string
  perception?: string | string[]
  journey?: string | any[]
  trends?: string | any[]
  performance?: string | any[]
  checking?: string | any[]
  competitorScores?: {
    competitor: string
    category: string
    score: number
    ourScore?: number
    comparison?: string
  }[]
  findings: {
    issue: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    description: string
    recommendation?: string
    affectedArea?: string // e.g., "Casino", "Sports", "Navigation"
    section?: string // Which section this finding came from (executiveSummary, perception, journey, trends, performance, checking)
  }[]
  summary?: string
  priority?: 'high' | 'medium' | 'low'
  overallRating?: number
  totalReviews?: number
  themes?: string[] // Common themes from reviews/articles
}

export interface BrandGuidelines {
  toneOfVoice: {
    principles: string[]
    do: string[]
    dont: string[]
    examples: string[]
  }
  communicationWithCustomers: {
    approach: string
    principles: string[]
    channels: string[]
    whenToEscalate: string[]
  }
  brandValues: string[]
  designPrinciples: string[]
}

export interface Website {
  name: string
  url: string
  description?: string
  type?: 'Production' | 'Staging' | 'Development'
}

export interface KnowledgeBase {
  designSystem: DesignSystemInfo
  colorTokens: typeof colorTokenMap
  stakeholders: Stakeholder[]
  processes: Process[]
  figmaFiles: FigmaFile[]
  logos: LogoSpecs[]
  brandGuidelines: BrandGuidelines
  uxReports: UXReport[]
  additionalNotes?: string[]
  websites: Website[]
}

/**
 * Comprehensive Knowledge Base
 * Add information here as you share more Figma files, stakeholder info, and processes
 */
export const knowledgeBase: KnowledgeBase = {
  designSystem,
  colorTokens: colorTokenMap,
  
  // Stakeholders - Team members, their roles, and responsibilities
  stakeholders: [
    {
      name: 'CH',
      role: 'Head of Design',
      responsibilities: [
        'Design system oversight',
        'Design reviews',
        'Team leadership',
        'Design request assignments',
        'UX/CX strategy',
      ],
      areas: ['All', 'Other area'], // Handles requests for "Other area"
    },
    {
      name: 'pjh',
      role: 'Casino Stakeholder',
      responsibilities: [
        'Casino area oversight',
        'Casino feature requests',
        'Casino design feedback',
      ],
      areas: ['Casino', 'Loyalty'],
    },
    {
      name: 'Kurt',
      role: 'Sportsbook Stakeholder',
      responsibilities: [
        'Sportsbook area oversight',
        'Sports betting feature requests',
        'Sportsbook design feedback',
      ],
      areas: ['Sports'],
    },
    {
      name: 'Dario',
      role: 'Authentication & Cashier Stakeholder',
      responsibilities: [
        'Authentication area oversight',
        'Cashier area oversight',
        'Payment flow feedback',
        'Account management feedback',
      ],
      areas: ['Authentication', 'Cashier'],
    },
    {
      name: 'Agata',
      role: 'Marketing Stakeholder',
      responsibilities: [
        'Marketing campaign oversight',
        'Brand consistency',
        'Marketing material feedback',
      ],
      areas: ['Marketing', 'All'], // Marketing touches all areas
    },
  ],
  
  // Processes - Add design processes, workflows, and procedures
  processes: [
    {
      name: 'Design Request Process',
      description: 'How design requests are submitted and processed through the design request app',
      steps: [
        'User submits design request via design request app',
        'User selects area (Sports, Casino, Loyalty, Authentication, Poker, Other)',
        'User provides PRD-style details (What, Why, Context, Goals, Use Cases)',
        'User selects deadline (ASAP, This week, Next week, etc.)',
        'Request automatically assigned to designer based on area',
        'Request submitted to Mattermost and Craft.io',
        'Designer creates Figma file using agnostic design system',
        'Design delivered as Figma file',
      ],
      stakeholders: ['CH', 'Lilly', 'Sam', 'Nek', 'Victor'],
      areas: ['All'],
      tools: ['Figma', 'Mattermost', 'Craft.io', 'Design Request App'],
    },
    {
      name: 'Designer Assignment',
      description: 'How designers are assigned to design requests based on area',
      steps: [
        'Sports area → Assigned to Sam',
        'Casino area → Assigned to Lilly',
        'Loyalty area → Assigned to Lilly',
        'Authentication area → Assigned to Nek',
        'Poker area → Assigned to Victor',
        'Other area → Assigned to CH (Head of Design)',
      ],
      stakeholders: ['CH', 'Lilly', 'Sam', 'Nek', 'Victor'],
      areas: ['All'],
    },
  ],
  
  // Figma Files - Track all Figma files in the design system
  figmaFiles: [
    {
      name: 'Agnostic Design System | MUI v5.15.0 - v5.14.12',
      url: 'https://www.figma.com/design/8Nmyws2RW2VovSvCbTd3Oh/%F0%9F%94%98.-Agnostic-Design-System-%7C-MUI-v5.15.0---v5.14.12',
      description: 'Main agnostic design system file with tokens, colors, typography, components, patterns, and logos',
      contains: ['Color tokens', 'Typography', 'Spacing', 'Components', 'Design patterns', 'Brand configurations', 'Logos'],
    },
    {
      name: 'My Account / Dashboard - MUI ADS',
      url: 'https://www.figma.com/design/jkFY1lvE3eWzXZJvMVYMFe/1.-My-Account--Dashboard----MUI-ADS',
      description: 'My Account and Dashboard designs using the MUI Agnostic Design System',
      contains: ['Dashboard components', 'Account management UI', 'User interface patterns', 'MUI ADS components'],
    },
    {
      name: 'Casino-26 - LightMode | MUI-ADS',
      url: 'https://www.figma.com/design/dsg9EC3QiVp7h80BNy47EA/Casino-26--LightMode-%7C-MUI-ADS',
      description: 'Casino area designs in light mode using the MUI Agnostic Design System, including navigation components',
      contains: ['Casino components', 'Light mode designs', 'Game tiles', 'Casino UI patterns', 'Navigation components', 'Header navigation', 'Side menu navigation', 'MUI ADS components'],
    },
    {
      name: 'Sportsbook-26 | MUI-ADS',
      url: 'https://www.figma.com/design/vIX39SAgC9K5eINAxErFPw/Sportbook-26',
      description: 'Sportsbook area designs using the MUI Agnostic Design System with comprehensive sports betting components',
      contains: [
        'Sportsbook components',
        'Sports betting UI',
        'Betting slips',
        'Odds displays',
        'Live betting components',
        'Sports event cards',
        'Bet builder components',
        'Sports navigation',
        'MUI ADS components',
        'Common Components',
        'Event Row Components',
        'Design tokens (borderRadius-3: 12px, borderRadius-4: 16px, borderRadius-9: 40px, elevation/3)',
        'Final Designs for BetOnline and Sportbetting brands',
        'Wireframes',
        'Benchmark & References',
        'Playground'
      ],
      lastUpdated: '2025-01-27',
    },
    {
      name: 'BetOnline BrandBook - Toolkit',
      url: 'https://www.figma.com/design/X4KXaJZSN23sQJHYhZlT7N/BetOnline_BrandBook---Toolkit',
      description: 'BetOnline brand book toolkit with comprehensive brand guidelines, colors, typography, spacing, and product-focused design tokens',
      contains: [
        'BetOnline brand colors',
        'BetOnline typography (Desktop & Mobile headings H1-H7, Body styles)',
        'BetOnline spacing tokens (1-12 scale)',
        'BetOnline text colors',
        'BetOnline background colors',
        'BetOnline component colors (buttons, tables, navigation, chips, etc.)',
        'BetOnline product colors (HomePage, VIP/Loyalty, Sportsbook, Cashier)',
        'BetOnline interaction states (hover, focus, disabled)',
        'BetOnline shadow/elevation tokens',
        'BetOnline brand guidelines',
      ],
    },
    // Add more Figma files here as you share them
  ],
  
  // Logos - Comprehensive logo system from Figma
  logos: [
    {
      brand: 'BetOnline',
      minimumSize: {
        wordmark: '119px width',
        lettermark: '50.79px width',
      },
      clearSpace: 'Maintain clear space around logos as specified in Figma',
      usage: ['Primary brand identity', 'Marketing materials', 'Digital applications'],
      variants: [
        { brand: 'BetOnline', type: 'Wordmark', color: 'Primary', description: 'Primary wordmark logo' },
        { brand: 'BetOnline', type: 'Wordmark', color: 'Primary Reversed', description: 'Primary reversed wordmark' },
        { brand: 'BetOnline', type: 'Wordmark', color: 'White', description: 'White wordmark for dark backgrounds' },
        { brand: 'BetOnline', type: 'Wordmark', color: 'Black', description: 'Black wordmark for light backgrounds' },
        { brand: 'BetOnline', type: 'Wordmark', color: 'VIP Primary', description: 'VIP primary wordmark' },
        { brand: 'BetOnline', type: 'Wordmark', color: 'VIP Reversed', description: 'VIP reversed wordmark' },
        { brand: 'BetOnline', type: 'Lettermark', color: 'Primary', description: 'Primary lettermark (B icon)' },
        { brand: 'BetOnline', type: 'Lettermark', color: 'White', description: 'White lettermark' },
        { brand: 'BetOnline', type: 'Lettermark', color: 'Black', description: 'Black lettermark' },
        { brand: 'BetOnline', type: 'Lettermark', color: 'VIP Primary', description: 'VIP primary lettermark' },
        { brand: 'BetOnline', type: 'Icon', color: 'Primary', description: 'BetOnline icon' },
      ],
    },
    {
      brand: 'SportsBetting',
      minimumSize: {
        wordmark: '59.53px width',
        lettermark: '26.27px width',
      },
      clearSpace: 'Maintain clear space around logos as specified in Figma',
      usage: ['Sports betting area', 'Sports-related marketing'],
      variants: [
        { brand: 'SportsBetting', type: 'Wordmark', color: 'Primary', description: 'Primary wordmark logo' },
        { brand: 'SportsBetting', type: 'Wordmark', color: 'White', description: 'White wordmark' },
        { brand: 'SportsBetting', type: 'Wordmark', color: 'Black', description: 'Black wordmark' },
        { brand: 'SportsBetting', type: 'Lettermark', color: 'Primary', description: 'Primary lettermark' },
        { brand: 'SportsBetting', type: 'Lettermark', color: 'White', description: 'White lettermark' },
        { brand: 'SportsBetting', type: 'Lettermark', color: 'Black', description: 'Black lettermark' },
      ],
    },
    {
      brand: 'LowVig',
      minimumSize: {
        wordmark: '119px width',
        lettermark: '32px width',
      },
      clearSpace: 'Maintain clear space around logos as specified in Figma',
      usage: ['LowVig brand applications', 'Marketing materials'],
      variants: [
        { brand: 'LowVig', type: 'Wordmark', color: 'Primary', description: 'Primary wordmark logo' },
        { brand: 'LowVig', type: 'Wordmark', color: 'Primary Reversed', description: 'Primary reversed wordmark' },
        { brand: 'LowVig', type: 'Wordmark', color: 'White', description: 'White wordmark' },
        { brand: 'LowVig', type: 'Wordmark', color: 'Black', description: 'Black wordmark' },
        { brand: 'LowVig', type: 'Lettermark', color: 'Primary', description: 'Primary lettermark' },
        { brand: 'LowVig', type: 'Lettermark', color: 'Primary Reversed', description: 'Primary reversed lettermark' },
        { brand: 'LowVig', type: 'Lettermark', color: 'White', description: 'White lettermark' },
        { brand: 'LowVig', type: 'Lettermark', color: 'Black', description: 'Black lettermark' },
      ],
    },
    {
      brand: 'TigerGaming',
      minimumSize: {
        wordmark: '85.4px width',
        lettermark: '19.53px width',
      },
      clearSpace: 'Maintain clear space around logos as specified in Figma',
      usage: ['Tiger Gaming brand applications', 'Marketing materials'],
      variants: [
        { brand: 'TigerGaming', type: 'Wordmark', color: 'Primary', description: 'Primary wordmark with tagline' },
        { brand: 'TigerGaming', type: 'Wordmark', color: 'Primary Reversed', description: 'Primary reversed wordmark' },
        { brand: 'TigerGaming', type: 'Wordmark', color: 'White', description: 'White wordmark' },
        { brand: 'TigerGaming', type: 'Wordmark', color: 'Black', description: 'Black wordmark' },
        { brand: 'TigerGaming', type: 'Wordmark', color: 'Primary', style: 'Full Color', description: 'Wordmark without tagline' },
        { brand: 'TigerGaming', type: 'Lettermark', color: 'Primary', description: 'Primary lettermark (T icon)' },
        { brand: 'TigerGaming', type: 'Lettermark', color: 'Primary Reversed', description: 'Primary reversed lettermark' },
        { brand: 'TigerGaming', type: 'Lettermark', color: 'White', description: 'White lettermark' },
        { brand: 'TigerGaming', type: 'Lettermark', color: 'Black', description: 'Black lettermark' },
      ],
    },
    {
      brand: 'WildCasino',
      clearSpace: 'Maintain clear space around logos as specified in Figma',
      usage: ['Wild Casino brand applications'],
      variants: [
        { brand: 'WildCasino', type: 'Wordmark', color: 'Default', mode: 'Light Mode', style: 'Full Color', description: 'Default wordmark' },
        { brand: 'WildCasino', type: 'Wordmark', color: 'White', mode: 'Light Mode', description: 'White wordmark' },
        { brand: 'WildCasino', type: 'Wordmark', color: 'Black', mode: 'Light Mode', description: 'Black wordmark' },
        { brand: 'WildCasino', type: 'Wordmark', color: 'Default', mode: 'Dark Mode', style: 'Full Color', description: 'Dark mode wordmark' },
        { brand: 'WildCasino', type: 'Wordmark', color: 'Default', mode: 'Dark Mode', style: 'Monochromatic', description: 'Dark mode monochromatic' },
        { brand: 'WildCasino', type: 'Wordmark', color: 'VIP Primary', mode: 'VIP', style: 'VIP', description: 'VIP wordmark' },
        { brand: 'WildCasino', type: 'Icon', color: 'Default', mode: 'Light Mode', size: 'small', style: 'Full Color', description: 'Small icon' },
        { brand: 'WildCasino', type: 'Icon', color: 'Default', mode: 'Dark Mode', size: 'small', style: 'Full Color', description: 'Dark mode small icon' },
        { brand: 'WildCasino', type: 'Icon', color: 'VIP Primary', mode: 'VIP', size: 'small', style: 'VIP', description: 'VIP small icon' },
      ],
    },
    {
      brand: 'HighRoller',
      clearSpace: 'Maintain clear space around logos as specified in Figma',
      usage: ['High Roller brand applications'],
      variants: [
        { brand: 'HighRoller', type: 'Wordmark', color: 'Default', mode: 'Light Mode', style: 'Full Color', description: 'Default wordmark' },
        { brand: 'HighRoller', type: 'Wordmark', color: 'White', mode: 'Light Mode', description: 'White wordmark' },
        { brand: 'HighRoller', type: 'Wordmark', color: 'Black', mode: 'Light Mode', description: 'Black wordmark' },
        { brand: 'HighRoller', type: 'Wordmark', color: 'Default', mode: 'Dark Mode', style: 'Full Color', description: 'Dark mode wordmark' },
        { brand: 'HighRoller', type: 'Wordmark', color: 'Default', mode: 'Dark Mode', style: 'Monochromatic', description: 'Dark mode monochromatic' },
        { brand: 'HighRoller', type: 'Icon', color: 'Default', mode: 'Light Mode', size: 'small', style: 'Full Color', description: 'Small icon' },
        { brand: 'HighRoller', type: 'Icon', color: 'Default', mode: 'Dark Mode', size: 'small', style: 'Full Color', description: 'Dark mode small icon' },
      ],
    },
    {
      brand: 'GamingCity',
      clearSpace: 'Maintain clear space around logos as specified in Figma',
      usage: ['Gaming City brand applications'],
      variants: [
        { brand: 'GamingCity', type: 'Wordmark', color: 'Default', mode: 'Light Mode', style: 'Full Color', description: 'Default wordmark' },
        { brand: 'GamingCity', type: 'Wordmark', color: 'White', mode: 'Light Mode', description: 'White wordmark' },
        { brand: 'GamingCity', type: 'Wordmark', color: 'Black', mode: 'Light Mode', description: 'Black wordmark' },
        { brand: 'GamingCity', type: 'Wordmark', color: 'Default', mode: 'Dark Mode', style: 'Full Color', description: 'Dark mode wordmark' },
        { brand: 'GamingCity', type: 'Wordmark', color: 'Default', mode: 'Dark Mode', style: 'Monochromatic', description: 'Dark mode monochromatic' },
        { brand: 'GamingCity', type: 'Icon', color: 'Default', mode: 'Light Mode', size: 'small', style: 'Full Color', description: 'Small icon' },
        { brand: 'GamingCity', type: 'Icon', color: 'Default', mode: 'Dark Mode', size: 'small', style: 'Full Color', description: 'Dark mode small icon' },
      ],
    },
    {
      brand: 'QueenBee',
      clearSpace: 'Maintain clear space around logos as specified in Figma',
      usage: ['Queen Bee brand applications'],
      variants: [
        { brand: 'QueenBee', type: 'Wordmark', color: 'Default', mode: 'Light Mode', style: 'Full Color', description: 'Default wordmark' },
        { brand: 'QueenBee', type: 'Wordmark', color: 'White', mode: 'Light Mode', description: 'White wordmark' },
        { brand: 'QueenBee', type: 'Wordmark', color: 'Black', mode: 'Light Mode', description: 'Black wordmark' },
        { brand: 'QueenBee', type: 'Wordmark', color: 'Default', mode: 'Dark Mode', style: 'Full Color', description: 'Dark mode wordmark' },
        { brand: 'QueenBee', type: 'Wordmark', color: 'Default', mode: 'Dark Mode', style: 'Monochromatic', description: 'Dark mode monochromatic' },
        { brand: 'QueenBee', type: 'Icon', color: 'Default', mode: 'Light Mode', size: 'small', style: 'Full Color', description: 'Small icon' },
        { brand: 'QueenBee', type: 'Icon', color: 'Default', mode: 'Dark Mode', size: 'small', style: 'Full Color', description: 'Dark mode small icon' },
      ],
    },
    {
      brand: 'SuperSlots',
      clearSpace: 'Maintain clear space around logos as specified in Figma',
      usage: ['SuperSlots brand applications'],
      variants: [
        { brand: 'SuperSlots', type: 'Wordmark', color: 'Default', mode: 'Light Mode', size: 'large', style: 'Full Color', description: 'Large full color wordmark' },
        { brand: 'SuperSlots', type: 'Wordmark', color: 'Default', mode: 'Light Mode', size: 'large', style: 'Monochromatic', description: 'Large monochromatic wordmark' },
        { brand: 'SuperSlots', type: 'Wordmark', color: 'Default', mode: 'Dark Mode', size: 'large', style: 'Full Color', description: 'Dark mode large wordmark' },
        { brand: 'SuperSlots', type: 'Wordmark', color: 'Default', mode: 'Dark Mode', size: 'large', style: 'Monochromatic', description: 'Dark mode large monochromatic' },
        { brand: 'SuperSlots', type: 'Icon', color: 'Default', mode: 'Light Mode', size: 'small', style: 'Full Color', description: 'Small icon (SS)' },
        { brand: 'SuperSlots', type: 'Icon', color: 'Default', mode: 'Light Mode', size: 'small', style: 'Monochromatic', description: 'Small monochromatic icon' },
        { brand: 'SuperSlots', type: 'Icon', color: 'Default', mode: 'Dark Mode', size: 'small', style: 'Full Color', description: 'Dark mode small icon' },
        { brand: 'SuperSlots', type: 'Icon', color: 'Default', mode: 'Dark Mode', size: 'small', style: 'Monochromatic', description: 'Dark mode small monochromatic' },
      ],
    },
  ],
  
  // Brand Guidelines - Communication principles, tone of voice, brand values
  brandGuidelines: {
    toneOfVoice: {
      principles: [
        'Direct and clear communication',
        'Professional yet approachable',
        'Helpful and solution-oriented',
        'Confident but not arrogant',
        'Respectful of user time and needs',
      ],
      do: [
        'Use clear, concise language',
        'Be specific and actionable',
        'Show expertise without being condescending',
        'Acknowledge limitations honestly',
        'Provide context when helpful',
        'Use design system terminology accurately',
      ],
      dont: [
        'Use jargon without explanation',
        'Be vague or ambiguous',
        'Make up information',
        'Overpromise or oversell',
        'Ignore user questions',
        'Use overly casual or unprofessional language',
      ],
      examples: [
        'Instead of "That color is nice", say "The primary color betRed (#ee3536) works well for CTAs because it has high contrast and aligns with our brand identity"',
        'Instead of "I think...", say "Based on our design system, the recommended spacing is 16px for this component"',
        'Instead of "I don\'t know", say "I don\'t have that specific information in our knowledge base. Can you check the Figma file or share more details?"',
      ],
    },
    communicationWithCustomers: {
      approach: 'Professional, helpful, and design-focused',
      principles: [
        'Always reference the design system when discussing design decisions',
        'Explain design choices using specific tokens, components, and patterns',
        'Be transparent about what information is available and what isn\'t',
        'Guide users to the right resources (Figma files, designers, processes)',
        'Use design system terminology consistently',
      ],
      channels: [
        'Design Request App - Primary channel for design requests',
        'Figma - Design files and collaboration',
        'Mattermost - Team communication and updates',
        'Craft.io - Project management and tracking',
      ],
      whenToEscalate: [
        'Questions about brand strategy or high-level decisions → CH (Head of Design)',
        'Questions about specific areas → Area designer (Lilly, Sam, Nek, Victor)',
        'Questions about processes → Reference process documentation',
        'Questions about design system → Use knowledge base and Figma files',
      ],
    },
    brandValues: [
      'Consistency - Using shared design tokens and components across all brands',
      'Quality - Professional, polished design that meets user needs',
      'Efficiency - Streamlined processes and clear communication',
      'Collaboration - Working together with stakeholders and designers',
      'Innovation - Building on a solid design system foundation',
    ],
    designPrinciples: [
      'Use the agnostic design system as the foundation',
      'Maintain brand consistency while allowing customization',
      'Prioritize user experience and accessibility',
      'Follow established patterns and components',
      'Document design decisions and rationale',
    ],
  },
  
  // UX Reports - User experience insights and recommendations
  uxReports: [
    // UX reports from Jurnii, user testing, analytics, etc.
    // Example structure:
    // {
    //   id: 'jurnii-001',
    //   source: 'Jurnii',
    //   sourceUrl: 'https://app.jurnii.io/user-reports/competitor/...',
    //   title: 'UX Report - Site Improvements',
    //   date: '2024-01-15',
    //   findings: [
    //     {
    //       issue: 'Navigation clarity',
    //       severity: 'high',
    //       description: 'Users struggle to find key features',
    //       recommendation: 'Improve navigation hierarchy',
    //       affectedArea: 'Navigation'
    //     }
    //   ],
    //   summary: 'Overall UX improvements needed',
    //   priority: 'high'
    // }
  ],
  
  // Additional notes - Any other important information
  additionalNotes: [
    '**Mixpanel Analytics - Session Start Events**\nSource: Mixpanel\nMetric: Total Events of Session Start\nAverage: 13.1M\nLast 12 Months (most recent first):\n- 9.49M\n- 10.55M\n- 13.03M\n- 13.21M\n- 11.38M\n- 11.5M\n- 10.72M\n- 11.59M\n- 15.07M\n- 17.33M\n- 18.45M\n- 18.06M\n- 9.91M\n\nThis metric tracks the total number of session start events across the platform, providing insights into user engagement and platform activity levels.',
    '**Mixpanel Analytics - Page Views (Last 12 Months)**\nSource: Mixpanel\nMetric: Page Views by URL - Unique Users and Total Sessions\nTimeframe: 12 Months\n\n**Top Pages (betonline.ag):**\n1. Homepage (/): 2,674,996 unique users, 14,803,369 total sessions\n2. Sportsbook (/sportsbook): 2,340,157 unique users, 22,296,555 total sessions\n3. Casino (/casino): 566,207 unique users, 6,852,011 total sessions\n4. Live Sportsbook (/sportsbook/live): 394,156 unique users, 5,291,230 total sessions\n5. Deposit Promotions (/promotions/deposit): 350,353 unique users, 1,172,914 total sessions\n6. VIP Rewards (/vip-rewards): 291,193 unique users, 1,914,917 total sessions\n7. Live Casino (/casino/games/live-casino): 277,996 unique users, 2,111,946 total sessions\n8. Poker (/poker): 217,612 unique users, 1,570,110 total sessions\n9. Contests (/contests): 149,697 unique users, 980,156 total sessions\n10. Esports (/esports): 88,134 unique users, 532,043 total sessions\n11. Horse Betting (/horse-betting): 71,365 unique users, 460,567 total sessions\n12. VIP-Rewards (/VIP-Rewards): 59 unique users, 71 total sessions\n\n**Overall Totals:**\n- Total Unique Users: 4,733,678\n- Total Sessions: 35,294,538\n\n**Key Insights:**\n- Sportsbook has the highest total sessions (22.3M) despite having fewer unique users than the homepage, indicating high engagement and repeat visits\n- Homepage has the most unique users (2.67M), showing strong initial traffic\n- Casino ranks third in unique users (566K) with 6.85M sessions, showing good engagement\n- Poker, Contests, Esports, and Horse Betting show lower unique user counts but still significant traffic\n- VIP Rewards has strong engagement (1.9M sessions from 291K users), indicating high value for loyalty programs\n\nThis data provides insights into user engagement patterns, popular sections, and areas that may require UX improvements or further investigation.',
    '**Mixpanel Analytics - Device Breakdown (Last 6 Months)**\nSource: Mixpanel\nMetric: Total Sessions of page_viewed by Device Type\nTimeframe: Last 6 Months\n\n**Device Breakdown:**\n- **Total Sessions**: 91.04M\n- **Mobile Sessions**: 64.1M (70.4% of total)\n- **Desktop Sessions**: 26.94M (29.6% of total)\n\n**Key Insights:**\n- Mobile dominates with 70.4% of all page view sessions, indicating strong mobile engagement\n- Desktop accounts for 29.6% of sessions, still significant but lower than mobile\n- Mobile sessions (64.1M) are 2.38x higher than Desktop sessions (26.94M)\n- This distribution suggests mobile-first design considerations are critical\n- The high mobile usage aligns with the importance of mobile UX optimization\n\nThis metric provides insights into device usage patterns and helps prioritize mobile vs desktop design and UX improvements.',
    '**Mixpanel Analytics - Popular Sports (Top 12)**\nSource: Mixpanel\nMetric: Sports Betting Activity by Sport Type\n\n**Top 12 Sports by Volume:**\n1. Basketball: 21.66M\n2. Football: 16.28M\n3. Baseball: 12.2M\n4. Soccer: 6.64M\n5. Martial Arts: 4.63M\n6. Tennis: 4.26M\n7. (Not Set): 3.66M\n8. Hockey: 3.36M\n9. Table Tennis: 2.19M\n10. Golf: 489.8K\n11. Boxing: 387.3K\n12. E-Sports Soccer: 248.8K\n\n**Total Top 12 Sports**: 76.52M (includes 489.8K, 387.3K, 248.8K)\n\n**Key Insights:**\n- Basketball leads with 21.66M bets (28.3% of top 12 total)\n- Football is second with 16.28M bets (21.3% of top 12 total)\n- Baseball ranks third with 12.2M bets (15.9% of top 12 total)\n- Top 3 sports (Basketball, Football, Baseball) account for 50.14M bets (65.5% of top 12 total)\n- Soccer (6.64M) and Martial Arts (4.63M) round out the top 5\n- Tennis, Hockey, and Table Tennis show moderate activity (2-4M range)\n- Golf, Boxing, and E-Sports Soccer have lower volumes but still significant\n- The "(Not Set)" category suggests some unclassified sports betting activity (3.66M)\n\n**Sports Categories:**\n- **High Volume** (10M+): Basketball, Football, Baseball\n- **Medium Volume** (4-10M): Soccer\n- **Moderate Volume** (2-5M): Martial Arts, Tennis, (Not Set), Hockey\n- **Lower Volume** (<2M): Table Tennis, Golf, Boxing, E-Sports Soccer\n\nThis data provides insights into user betting preferences, popular sports for betting, and can help prioritize sportsbook features, promotions, and UX improvements for the most popular sports.',
    '**Mixpanel Analytics - Profile Retention/Cohort Analysis**\nSource: Mixpanel\nMetric: Total Profiles with Daily Retention Percentages (Days <1 through Day 53)\nLast 12 Months (Jan 1, 2025 to Jan 1, 2026):\n\n**Weighted Average - Days <1 through Day 17:**\n- Total Profiles: 100%\n- < 1 Day: 59.91%\n- Day 1: 14.9%\n- Day 2: 13.86%\n- Day 3: 13.19%\n- Day 4: 12.66%\n- Day 5: 12.19%\n- Day 6: 11.83%\n- Day 7: 11.38%\n- Day 8: 10.95%\n- Day 9: 10.67%\n- Day 10: 10.42%\n- Day 11: 10.19%\n- Day 12: 9.96%\n- Day 13: 9.73%\n- Day 14: 9.43%\n- Day 15: 9.11%\n- Day 16: 9.22%\n- Day 17: 9.04%\n\n**Weighted Average - Days 18-26:**\n- Day 18: 8.87%\n- Day 19: 8.7%\n- Day 20: 8.53%\n- Day 21: 8.29%\n- Day 22: 8.04%\n- Day 23: 7.87%\n- Day 24: 7.71%\n- Day 25: 7.56%\n- Day 26: 7.42%\n\n**Weighted Average - Days 27-35:**\n- Day 27: 7.26%\n- Day 28: 7.04%\n- Day 29: 6.81%\n- Day 30: 6.65%\n- Day 31: 6.51%\n- Day 32: 6.37%\n- Day 33: 6.24%\n- Day 34: 6.1%\n- Day 35: 5.91%\n\n**Weighted Average - Days 36-44:**\n- Day 36: 5.7%\n- Day 37: 5.54%\n- Day 38: 5.41%\n- Day 39: 5.28%\n- Day 40: 5.15%\n- Day 41: 5.01%\n- Day 42: 4.82%\n- Day 43: 4.61%\n- Day 44: 4.45%\n\n**Weighted Average - Days 45-53:**\n- Day 45: 4.31%\n- Day 46: 4.16%\n- Day 47: 3.99%\n- Day 48: 3.84%\n- Day 49: 3.64%\n- Day 50: 3.41%\n- Day 51: 3.24%\n- Day 52: 3.08%\n- Day 53: 2.91%\n\n**Monthly Cohorts - Key Retention Metrics:**\n- Jan 1, 2025: 4.4M (Day 1: 14.66%, Day 7: 11.72%, Day 17: 9.22%, Day 26: 7.66%, Day 35: 6.24%, Day 44: 4.84%, Day 53: 3.26%)\n- Feb 1, 2025: 5.9M (Day 1: 13.59%, Day 7: 10.48%, Day 17: 8.41%, Day 26: 7.04%, Day 35: 5.7%, Day 44: 4.42%, Day 53: 3.02%)\n- Mar 1, 2025: 7.4M (Day 1: 13.69%, Day 7: 10.49%, Day 17: 8.35%, Day 26: 6.92%, Day 35: 5.45%, Day 44: 4.08%, Day 53: 2.58%)\n- Apr 1, 2025: 7.7M (Day 1: 13.3%, Day 7: 9.88%, Day 17: 7.48%, Day 26: 5.94%, Day 35: 4.67%, Day 44: 3.52%, Day 53: 2.34%)\n- May 1, 2025: 6.4M (Day 1: 13.27%, Day 7: 10.14%, Day 17: 8.06%, Day 26: 6.76%, Day 35: 5.5%, Day 44: 4.23%, Day 53: 2.7%)\n- Jun 1, 2025: 6.7M (Day 1: 12.67%, Day 7: 9.93%, Day 17: 7.79%, Day 26: 6.24%, Day 35: 4.96%, Day 44: 3.72%, Day 53: 2.44%)\n- Jul 1, 2025: 6.2M (Day 1: 13.14%, Day 7: 10.19%, Day 17: 8.11%, Day 26: 6.76%, Day 35: 5.45%, Day 44: 4.25%, Day 53: 2.89%)\n- Aug 1, 2025: 6.5M (Day 1: 13.68%, Day 7: 10.82%, Day 17: 8.59%, Day 26: 7.11%, Day 35: 5.7%, Day 44: 4.4%, Day 53: 2.99%)\n- Sep 1, 2025: 7.4M (Day 1: 17.63%, Day 7: 14.07%, Day 17: 11.08%, Day 26: 9.09%, Day 35: 7.13%, Day 44: 5.4%, Day 53: 3.64%)\n- Oct 1, 2025: 8.9M (Day 1: 16.24%, Day 7: 12.61%, Day 17: 9.8%, Day 26: 8.04%, Day 35: 6.54%, Day 44: 4.98%, Day 53: 3.27%)\n- Nov 1, 2025: 9.8M (Day 1: 17.53%, Day 7: 13.39%, Day 17: 10.35%, Day 26: 8.46%, Day 35: 6.6%, Day 44: 4.72%*, Day 53: 2.79%*)\n- Dec 1, 2025: 9.9M (Day 1: 14.83%, Day 7: 10.44%, Day 17: 6.75%*, Day 26: 4.26%*, Day 35: 2.21%*, Day 44: 0.62%*, Day 47: 0.04%*, Day 48+: incomplete)\n- Jan 1, 2026: 6.2M (Day 1: 10.15%*, Day 7: 4.58%*, Day 17+: incomplete)\n\n*Note: Values marked with asterisk (*) may be estimates or incomplete data. Jan 2026 cohort is too recent for complete retention data. Dec 2025 cohort shows incomplete data after Day 47.\n\n**Key Insights:**\n- September-November 2025 cohorts show highest retention (Day 1: 17.53%, Day 35: 6.6-7.13%, Day 53: 2.79-3.64%)\n- December 2025 cohort shows significantly lower retention (Day 44: 0.62%*, Day 47: 0.04%*), likely due to incomplete data\n- January 2026 cohort shows lower initial retention (Day 1: 10.15%*) with incomplete longer-term data\n- Overall weighted average retention declines from 14.9% (Day 1) to 2.91% (Day 53)\n- September 2025 cohort maintains highest retention through Day 53 (3.64%)\n\nThis metric tracks user retention/cohort performance over 53 days, showing how profiles retain activity from Day <1 through Day 53. Provides comprehensive insights into user engagement, retention rates, cohort performance trends, and long-term user behavior patterns.',
  ],
  
  // Website information
  websites: [
    {
      name: 'BetOnline',
      url: 'https://betonline.ag',
      description: 'Main BetOnline website - primary gambling platform',
      type: 'Production',
    },
  ],
}

/**
 * Get all knowledge as a formatted string for AI prompts
 */
export function getKnowledgeBasePrompt(): string {
  const { designSystem, colorTokens, stakeholders, processes, figmaFiles, logos, brandGuidelines, uxReports, additionalNotes, websites } = knowledgeBase
  
  // Format color tokens
  const colorTokensList = Object.entries(colorTokens)
    .map(([token, info]) => `  - ${token}: ${info.hex}${info.description ? ` (${info.description})` : ''}`)
    .join('\n')
  
  // Format stakeholders
  const stakeholdersList = stakeholders.length > 0
    ? stakeholders.map(s => {
        let desc = `  - ${s.name}: ${s.role}`
        if (s.responsibilities?.length) desc += `\n    Responsibilities: ${s.responsibilities.join(', ')}`
        if (s.areas?.length) desc += `\n    Areas: ${s.areas.join(', ')}`
        if (s.contact) desc += `\n    Contact: ${s.contact}`
        return desc
      }).join('\n\n')
    : '  (No stakeholders added yet)'
  
  // Format processes
  const processesList = processes.length > 0
    ? processes.map(p => {
        let desc = `  - ${p.name}: ${p.description}`
        if (p.steps?.length) {
          desc += `\n    Steps:\n${p.steps.map((step, i) => `      ${i + 1}. ${step}`).join('\n')}`
        }
        if (p.stakeholders?.length) desc += `\n    Stakeholders: ${p.stakeholders.join(', ')}`
        if (p.areas?.length) desc += `\n    Areas: ${p.areas.join(', ')}`
        if (p.tools?.length) desc += `\n    Tools: ${p.tools.join(', ')}`
        return desc
      }).join('\n\n')
    : '  (No processes added yet)'
  
  // Format Figma files
  const figmaFilesList = figmaFiles.map(f => {
    let desc = `  - ${f.name}`
    if (f.description) desc += `\n    Description: ${f.description}`
    if (f.contains?.length) desc += `\n    Contains: ${f.contains.join(', ')}`
    if (f.url) desc += `\n    URL: ${f.url}`
    return desc
  }).join('\n\n')
  
  // Format components
  const components = designSystem.components || {}
  const componentList = Object.entries(components)
    .map(([name, comp]) => {
      let desc = `  - ${name}: ${comp.description || 'Component'}`
      if (comp.usage) desc += `\n    Usage: ${comp.usage}`
      if (comp.variants?.length) desc += `\n    Variants: ${comp.variants.join(', ')}`
      if (comp.props?.length) desc += `\n    Props: ${comp.props.join(', ')}`
      return desc
    })
    .join('\n\n')
  
  // Format patterns
  const patterns = designSystem.patterns || {}
  const patternList = Object.entries(patterns)
    .map(([name, pattern]) => {
      let desc = `  - ${name}: ${pattern.description || 'Pattern'}`
      if (pattern.whenToUse) desc += `\n    When to use: ${pattern.whenToUse}`
      if (pattern.examples?.length) desc += `\n    Examples: ${pattern.examples.join(', ')}`
      return desc
    })
    .join('\n\n')
  
  // Format brands with comprehensive color information
  const brands = designSystem.brands || {}
  const brandList = Object.entries(brands)
    .map(([name, brand]) => {
      let desc = `  - ${name}: ${brand.description || 'Brand'}`
      if (brand.colors?.primary?.length) {
        const primaryColors = brand.colors.primary.map(c => {
          const colorInfo = colorTokens[c] || colorTokens[c.split('/')[0]]
          return colorInfo ? `${c} (${colorInfo.hex})` : c
        }).join(', ')
        desc += `\n    Primary colors: ${primaryColors}`
      }
      if (brand.colors?.secondary?.length) {
        const secondaryColors = brand.colors.secondary.map(c => {
          const colorInfo = colorTokens[c] || colorTokens[c.split('/')[0]]
          return colorInfo ? `${c} (${colorInfo.hex})` : c
        }).join(', ')
        desc += `\n    Secondary colors: ${secondaryColors}`
      }
      if (brand.colors?.accent?.length) {
        const accentColors = brand.colors.accent.map(c => {
          const colorInfo = colorTokens[c] || colorTokens[c.split('/')[0]]
          return colorInfo ? `${c} (${colorInfo.hex})` : c
        }).join(', ')
        desc += `\n    Accent colors: ${accentColors}`
      }
      if (brand.colors?.neutral?.length) {
        const neutralColors = brand.colors.neutral.map(c => {
          const colorInfo = colorTokens[c] || colorTokens[c.split('/')[0]]
          return colorInfo ? `${c} (${colorInfo.hex})` : c
        }).join(', ')
        desc += `\n    Neutral colors: ${neutralColors}`
      }
      if (brand.colors?.background?.length) {
        const backgroundColors = brand.colors.background.map(c => {
          const colorInfo = colorTokens[c] || colorTokens[c.split('/')[0]]
          return colorInfo ? `${c} (${colorInfo.hex})` : c
        }).join(', ')
        desc += `\n    Background colors: ${backgroundColors}`
      }
      return desc
    })
    .join('\n\n')
  
  return `=== COMPREHENSIVE KNOWLEDGE BASE ===

**FIGMA FILES:**
${figmaFilesList}

**COLORS (All tokens from Figma):**
${colorTokensList}

**TYPOGRAPHY (From Figma):**
- Primary font: Inter
- Secondary font: Open Sans
- Font weights: Light (300), Regular (400), Medium (500), SemiBold (600), Bold (700)
- Heading styles: 
  - Display xs (24px, Regular/Medium)
  - Text xl (20px, Regular)
  - Text lg (18px, Medium)
  - Special Headings/Display 5 (110px, Bold, Inter, -3px letter spacing) - BetOnline brand book
  - Desktop/Heading/Bold/H1-H7 (40px, 36px, 32px, 24px, 20px, 18px, 16px) - BetOnline toolkit
  - Desktop/Heading/SemiBold/H1-H7 (40px, 36px, 32px, 24px, 20px, 18px, 16px) - BetOnline toolkit
  - Desktop/Heading/Regular/H1-H2 (40px, 36px) - BetOnline toolkit
  - Desktop/Heading/ItalicRegular/H1-H6 (40px, 36px, 32px, 24px, 20px, 18px) - BetOnline toolkit
  - Mobile/Heading/Bold/H1-H7 (32px, 28px, 24px, 20px, 18px, 16px, 14px) - BetOnline toolkit
  - Mobile/Heading/SemiBold/H1-H2, H6-H7 (32px, 28px, 16px, 14px) - BetOnline toolkit
  - Mobile/Heading/Regular/H1-H7 (30px, 28px, 24px, 20px, 18px, 16px, 14px) - BetOnline toolkit
  - Mobile/Heading/Italic Regular/H1-H6 (32px, 28px, 24px, 20px, 18px, 16px) - BetOnline toolkit
- Body styles: 
  - Body/Bold/Body 4 (12px, SemiBold, Open Sans)
  - Material UI/typography/body2 (14px, Regular, Open Sans)
  - Material UI/typography/caption (12px, Regular, Open Sans)
  - Material UI/typography/h5 (24px, Light, Open Sans)
  - Text Single/100/Regular (16px, Regular, Inter, 18px line height) - BetOnline brand book
  - Text Single/100/Bold (16px, Bold, Inter, 18px line height) - BetOnline brand book
  - Desktop/Body/SemiBold/B1-B4 (18px, 16px, 14px, 12px) - BetOnline toolkit
  - Desktop/Body/Regular/B1-B4 (18px, 16px, 14px, 12px) - BetOnline toolkit
  - Desktop/Body/LightItalic/B1-B4 (18px, 16px, 14px, 12px) - BetOnline toolkit
  - Mobile/Body/SemiBold/B1-B4 (18px, 16px, 14px, 12px) - BetOnline toolkit
  - Mobile/Body/Regular/B1-B4 (18px, 16px, 14px, 12px) - BetOnline toolkit
  - Mobile/Body/Italic Regular/B1-B3 (18px, 16px, 14px) - BetOnline toolkit
- Button styles:
  - Material UI/button/large (15px, SemiBold, Open Sans)
  - Material UI/button/medium (14px, SemiBold, Open Sans)
  - Material UI/button/small (13px, SemiBold, Open Sans)
- Alert styles:
  - Material UI/alert/title (16px, SemiBold, Open Sans) - BetOnline toolkit
  - Material UI/alert/description (14px, SemiBold, Open Sans) - BetOnline toolkit
- Table styles:
  - Material UI/table/header (14px, SemiBold, Open Sans)
- Date Picker:
  - Material UI/datePicker/currentMonth (16px, SemiBold, Open Sans) - BetOnline toolkit

**SPACING (From Figma):**
- Base unit: 4px (token: "0,5" = 4)
- Spacing scale: 2px, 4px, 7px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 56px, 64px, 72px, 80px, 96px (includes BetOnline brand book and toolkit tokens)
- Grid system: 12 columns, 16px gutter, 24px margin
- BetOnline brand book spacing tokens: 2px, 4px, 7px, 12px, 16px, 32px, 56px, 96px
- BetOnline toolkit spacing tokens: 1 (8px), 2 (16px), 3 (24px), 4 (32px), 5 (40px), 6 (48px), 7 (56px), 8 (64px), 9 (72px), 10 (80px), 12 (96px)

**BORDER RADIUS (From Figma):**
- borderRadius-1: 4px
- borderRadius-2: 8px (BetOnline brand book)
- borderRadius-3: 12px (Sportsbook-26)
- borderRadius-4: 16px (Sportsbook-26)
- borderRadius-9: 40px (Sportsbook-26)
- Small: 4px
- Medium: 8px
- Large: 12px
- Extra Large: 16px
- Full: 9999px

**SHADOWS/ELEVATION (From Figma):**
- Elevation levels: elevation/1 through elevation/24
- elevation/3 (Sportsbook-26): Multi-layer shadow effect with:
  - Effect 1: DROP_SHADOW, color: #00000033, offset: (0, 3), radius: 3, spread: -2
  - Effect 2: DROP_SHADOW, color: #00000024, offset: (0, 3), radius: 4, spread: 0
  - Effect 3: DROP_SHADOW, color: #0000001F, offset: (0, 1), radius: 8, spread: 0
- Material UI shadows: --joy-shadow-xs, --joy-shadow-sm, --joy-shadow-md, --joy-shadow-lg, --joy-shadow-xl

**COMPONENTS (From Figma):**
${componentList}

**DESIGN PATTERNS (From Figma):**
${patternList}

**BRANDS (From Figma):**
${brandList}

**AREAS/PRODUCTS:**
- Sports: Sports betting area, uses Sports brand
- Casino: Casino gaming area, uses Casino brand
- Loyalty: Loyalty and rewards area, uses Loyalty brand (includes VIP tiers)
- Authentication: Authentication and account management, uses Authentication brand
- Poker: Poker gaming area, uses Poker brand

**VIP TIERS (Loyalty brand):**
- black vip, bronze vip, diamond vip, elite vip, gold vip, platinum vip, silver vip

**STAKEHOLDERS:**
${stakeholdersList}

**PROCESSES:**
${processesList}

**BRAND GUIDELINES & COMMUNICATION:**
- Tone of Voice Principles: ${brandGuidelines.toneOfVoice.principles.join(', ')}
- Communication Approach: ${brandGuidelines.communicationWithCustomers.approach}
- Communication Principles: ${brandGuidelines.communicationWithCustomers.principles.join('; ')}
- Communication Channels: ${brandGuidelines.communicationWithCustomers.channels.join(', ')}
- When to Escalate: ${brandGuidelines.communicationWithCustomers.whenToEscalate.join('; ')}
- Brand Values: ${brandGuidelines.brandValues.join(', ')}
- Design Principles: ${brandGuidelines.designPrinciples.join(', ')}
- Tone of Voice - Do: ${brandGuidelines.toneOfVoice.do.join('; ')}
- Tone of Voice - Don't: ${brandGuidelines.toneOfVoice.dont.join('; ')}
- Tone of Voice Examples: ${brandGuidelines.toneOfVoice.examples.join(' | ')}

**LOGOS (From Figma):**
${logos.length > 0
    ? logos.map(logo => {
        let desc = `  - ${logo.brand}:`
        if (logo.minimumSize) {
          if (logo.minimumSize.wordmark) desc += `\n    Minimum wordmark size: ${logo.minimumSize.wordmark}`
          if (logo.minimumSize.lettermark) desc += `\n    Minimum lettermark size: ${logo.minimumSize.lettermark}`
        }
        if (logo.clearSpace) desc += `\n    Clear space: ${logo.clearSpace}`
        if (logo.usage?.length) desc += `\n    Usage: ${logo.usage.join(', ')}`
        if (logo.variants?.length) {
          desc += `\n    Available variants:`
          logo.variants.forEach(variant => {
            let variantDesc = `      - ${variant.type}`
            if (variant.color) variantDesc += ` (${variant.color})`
            if (variant.mode) variantDesc += ` - ${variant.mode}`
            if (variant.size) variantDesc += ` - ${variant.size}`
            if (variant.style) variantDesc += ` - ${variant.style}`
            if (variant.description) variantDesc += `: ${variant.description}`
            desc += `\n${variantDesc}`
          })
        }
        return desc
      }).join('\n\n')
    : '  (No logos added yet)'}

**UX REPORTS & INSIGHTS:**

**IMPORTANT**: Reports are categorized by source:
- **Research Report** = Surveys (FTD, RND, Marketing, VoC) - These are surveys, NOT competitor analysis
- **Jurnii** = Competitor analysis and UX reports - These are NOT surveys

${uxReports.length > 0
    ? (() => {
        // Separate reports into Research Reports (surveys) and Jurnii/other reports
        const researchReports = uxReports.filter(r => r.source === 'Research Report')
        const otherReports = uxReports.filter(r => r.source !== 'Research Report')
        
        let output = ''
        
        // Research Reports (Surveys) section
        if (researchReports.length > 0) {
          output += `**RESEARCH REPORTS (SURVEYS) - These are surveys, NOT competitor analysis:**\n`
          output += researchReports.map(report => {
            // Include report type/category in description for better AI recognition
            const titleLower = (report.title || '').toLowerCase()
            const reportType = titleLower.includes('survey') || titleLower.includes('ftd') || titleLower.includes('first time deposit') ? 'Survey' : 
                               titleLower.includes('voc') || titleLower.includes('voice of customer') ? 'Voice of Customer' :
                               titleLower.includes('rnd') || titleLower.includes('r&d') ? 'R&D Survey' :
                               titleLower.includes('marketing') ? 'Marketing Survey' :
                               'Survey/Research Report' // Default to Survey for all Research Reports
            
            let desc = `  - ${report.title} (${reportType}${report.date ? `, ${report.date}` : ''})`
            if (report.sourceUrl) desc += `\n    Source: ${report.sourceUrl}`
            if (report.summary) desc += `\n    Summary: ${report.summary}`
            if (report.priority) desc += `\n    Priority: ${report.priority}`
            
            // Include executive summary - CRITICAL for Research Reports as it contains keyFindings with competitor names, statistics, insights
            // For Research Reports, executiveSummary contains all key findings and recommendations from PDF extraction
            if (report.executiveSummary) {
              desc += `\n    Key Findings & Insights: ${typeof report.executiveSummary === 'string' ? report.executiveSummary : JSON.stringify(report.executiveSummary)}`
            }
            
            // Include perception - often contains competitor comparisons
            if (report.perception) {
              desc += `\n    Perception: ${typeof report.perception === 'string' ? report.perception : Array.isArray(report.perception) ? report.perception.join(' | ') : JSON.stringify(report.perception)}`
            }
            
            // Include journey - often contains competitor names and journey insights
            if (report.journey) {
              desc += `\n    Journey: ${typeof report.journey === 'string' ? report.journey : Array.isArray(report.journey) ? report.journey.map((j: any) => typeof j === 'string' ? j : JSON.stringify(j)).join(' | ') : JSON.stringify(report.journey)}`
            }
            
            // Include trends - may contain competitor trends
            if (report.trends) {
              desc += `\n    Trends: ${typeof report.trends === 'string' ? report.trends : Array.isArray(report.trends) ? report.trends.map((t: any) => typeof t === 'string' ? t : JSON.stringify(t)).join(' | ') : JSON.stringify(report.trends)}`
            }
            
            // Include performance - may contain competitor metrics
            if (report.performance) {
              desc += `\n    Performance: ${typeof report.performance === 'string' ? report.performance : Array.isArray(report.performance) ? report.performance.map((p: any) => typeof p === 'string' ? p : JSON.stringify(p)).join(' | ') : JSON.stringify(report.performance)}`
            }
            
            // Include checking - may contain competitor checks
            if (report.checking) {
              desc += `\n    Checking: ${typeof report.checking === 'string' ? report.checking : Array.isArray(report.checking) ? report.checking.map((c: any) => typeof c === 'string' ? c : JSON.stringify(c)).join(' | ') : JSON.stringify(report.checking)}`
            }
            
            if (report.findings?.length) {
              desc += `\n    Findings:`
              report.findings.forEach((finding, idx) => {
                desc += `\n      ${idx + 1}. [${finding.severity.toUpperCase()}] ${finding.issue}`
                desc += `\n         Description: ${finding.description}`
                if (finding.recommendation) desc += `\n         Recommendation: ${finding.recommendation}`
                if (finding.affectedArea) desc += `\n         Affected Area: ${finding.affectedArea}`
                if (finding.section) desc += `\n         Section: ${finding.section}`
              })
            }
            return desc
          }).join('\n\n')
          output += '\n\n'
        }
        
        // Jurnii/Other Reports section
        if (otherReports.length > 0) {
          output += `**JURNII & OTHER UX REPORTS (COMPETITOR ANALYSIS) - These are NOT surveys:**\n`
          output += otherReports.map(report => {
            let desc = `  - ${report.title} (${report.source}${report.date ? `, ${report.date}` : ''})`
            if (report.sourceUrl) desc += `\n    Source: ${report.sourceUrl}`
            if (report.summary) desc += `\n    Summary: ${report.summary}`
            if (report.priority) desc += `\n    Priority: ${report.priority}`
            
            // Include executive summary
            if (report.executiveSummary) {
              desc += `\n    Executive Summary: ${typeof report.executiveSummary === 'string' ? report.executiveSummary : JSON.stringify(report.executiveSummary)}`
            }
            
            // Include perception - often contains competitor comparisons
            if (report.perception) {
              desc += `\n    Perception: ${typeof report.perception === 'string' ? report.perception : Array.isArray(report.perception) ? report.perception.join(' | ') : JSON.stringify(report.perception)}`
            }
            
            // Include journey - often contains competitor names and journey insights
            if (report.journey) {
              desc += `\n    Journey: ${typeof report.journey === 'string' ? report.journey : Array.isArray(report.journey) ? report.journey.map((j: any) => typeof j === 'string' ? j : JSON.stringify(j)).join(' | ') : JSON.stringify(report.journey)}`
            }
            
            // Include trends - may contain competitor trends
            if (report.trends) {
              desc += `\n    Trends: ${typeof report.trends === 'string' ? report.trends : Array.isArray(report.trends) ? report.trends.map((t: any) => typeof t === 'string' ? t : JSON.stringify(t)).join(' | ') : JSON.stringify(report.trends)}`
            }
            
            // Include performance - may contain competitor metrics
            if (report.performance) {
              desc += `\n    Performance: ${typeof report.performance === 'string' ? report.performance : Array.isArray(report.performance) ? report.performance.map((p: any) => typeof p === 'string' ? p : JSON.stringify(p)).join(' | ') : JSON.stringify(report.performance)}`
            }
            
            // Include checking - may contain competitor checks
            if (report.checking) {
              desc += `\n    Checking: ${typeof report.checking === 'string' ? report.checking : Array.isArray(report.checking) ? report.checking.map((c: any) => typeof c === 'string' ? c : JSON.stringify(c)).join(' | ') : JSON.stringify(report.checking)}`
            }
            
            if (report.findings?.length) {
              desc += `\n    Findings:`
              report.findings.forEach((finding, idx) => {
                desc += `\n      ${idx + 1}. [${finding.severity.toUpperCase()}] ${finding.issue}`
                desc += `\n         Description: ${finding.description}`
                if (finding.recommendation) desc += `\n         Recommendation: ${finding.recommendation}`
                if (finding.affectedArea) desc += `\n         Affected Area: ${finding.affectedArea}`
                if (finding.section) desc += `\n         Section: ${finding.section}`
              })
            }
            return desc
          }).join('\n\n')
        }
        
        return output || '  (No UX reports added yet)'
      })()
    : '  (No UX reports added yet)'}

${additionalNotes && additionalNotes.length > 0 ? `**ADDITIONAL NOTES:**\n${additionalNotes.map(note => `  - ${note}`).join('\n')}` : ''}

**WEBSITES:**
${websites && websites.length > 0
    ? websites.map(website => {
        let desc = `  - ${website.name}`
        if (website.url) desc += `\n    URL: ${website.url}`
        if (website.description) desc += `\n    Description: ${website.description}`
        if (website.type) desc += `\n    Type: ${website.type}`
        return desc
      }).join('\n\n')
    : '  (No websites added yet)'}
`
}

/**
 * Add a new Figma file to the knowledge base
 */
export function addFigmaFile(file: FigmaFile): void {
  knowledgeBase.figmaFiles.push(file)
}

/**
 * Add a stakeholder to the knowledge base
 */
export function addStakeholder(stakeholder: Stakeholder): void {
  knowledgeBase.stakeholders.push(stakeholder)
}

/**
 * Add a process to the knowledge base
 */
export function addProcess(process: Process): void {
  knowledgeBase.processes.push(process)
}

/**
 * Add a UX report to the knowledge base
 * Uses Supabase if available, otherwise falls back to in-memory storage
 */
export async function addUXReport(report: UXReport): Promise<void> {
  // Use in-memory storage for now
  // Supabase integration can be added later if needed
  knowledgeBase.uxReports.push(report)
}

/**
 * Add additional notes
 */
export function addNote(note: string): void {
  if (!knowledgeBase.additionalNotes) {
    knowledgeBase.additionalNotes = []
  }
  knowledgeBase.additionalNotes.push(note)
}
