import { NextResponse } from 'next/server'
import { knowledgeBase } from '@/lib/agent/knowledgeBase'

export async function GET() {
  try {
    const suggestions: string[] = []
    
    // Try to load UX reports from Supabase first for more up-to-date data
    let uxReports = knowledgeBase.uxReports
    try {
      const { isSupabaseConfigured } = await import('@/lib/supabase/client')
      const supabaseKnowledgeBase = await import('@/lib/supabase/knowledgeBase')
      
      if (isSupabaseConfigured() && (supabaseKnowledgeBase as any).getUXReports) {
        uxReports = await (supabaseKnowledgeBase as any).getUXReports()
      }
    } catch (error) {
      // Fallback to in-memory knowledge base
      console.log('Using in-memory knowledge base for suggestions')
    }
    
    // Add suggestions based on what's available in knowledge base
    const { logos, brandGuidelines, additionalNotes } = knowledgeBase
    
    // Design request
    suggestions.push('Make a design request')
    
    // Brand book / Tone of voice
    if (brandGuidelines) {
      suggestions.push('Tell me about our tone of voice')
      suggestions.push('What are our brand guidelines?')
    }
    
    // Logos
    if (logos && logos.length > 0) {
      const uniqueBrands = [...new Set(logos.map(l => l.brand))]
      if (uniqueBrands.length > 0) {
        suggestions.push(`Show me the ${uniqueBrands[0]} logo`)
      }
    }
    
    // Retention data / Analytics
    if (additionalNotes && additionalNotes.length > 0) {
      const hasRetentionData = additionalNotes.some(note => 
        note.toLowerCase().includes('retention') || 
        note.toLowerCase().includes('cohort') ||
        note.toLowerCase().includes('mixpanel')
      )
      if (hasRetentionData) {
        suggestions.push('Do you need retention data?')
      }
    }
    
    // UX Reports - Check for competitor data
    if (uxReports && uxReports.length > 0) {
      // Check if any reports contain competitor data
      const hasCompetitorData = uxReports.some(report => 
        report.source?.toLowerCase().includes('jurnii') ||
        report.title?.toLowerCase().includes('competitor') ||
        report.summary?.toLowerCase().includes('competitor') ||
        (report.competitorScores && Array.isArray(report.competitorScores) && report.competitorScores.length > 0) ||
        (typeof report.executiveSummary === 'string' && (
          report.executiveSummary.toLowerCase().includes('stake') ||
          report.executiveSummary.toLowerCase().includes('draftkings') ||
          report.executiveSummary.toLowerCase().includes('competitor')
        )) ||
        (typeof report.journey === 'string' && report.journey.toLowerCase().includes('competitor')) ||
        (typeof report.perception === 'string' && report.perception.toLowerCase().includes('competitor'))
      )
      
      if (hasCompetitorData) {
        suggestions.push('Who are our competitors?')
        suggestions.push('How do we compare against Stake?')
      } else {
        suggestions.push('What UX issues affect mobile users?')
      }
    }
    
    // Design system
    suggestions.push('Tell me about our design system tokens')
    suggestions.push('What are BetOnline\'s primary colors?')
    
    // Fill remaining slots with generic suggestions if needed
    const defaultSuggestions = [
      'Show me typography examples',
      'What are our competitors\' strengths?',
    ]
    
    // Combine and return up to 6 suggestions
    const allSuggestions = [...suggestions, ...defaultSuggestions].slice(0, 6)
    
    return NextResponse.json({ suggestions: allSuggestions })
  } catch (error) {
    console.error('Error getting suggestions:', error)
    // Return default suggestions on error
    return NextResponse.json({
      suggestions: [
        'Make a design request',
        'Tell me about our tone of voice',
        'What are our brand guidelines?',
        'Do you need retention data?',
        'Tell me about our design system tokens',
        'What are BetOnline\'s primary colors?',
      ]
    })
  }
}
