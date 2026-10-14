/**
 * Supabase Knowledge Base Operations
 * 
 * CRUD operations for storing knowledge in Supabase:
 * - UX Reports
 * - Figma Assets
 * - Design Tokens
 * - Stakeholders
 * - Processes
 * - Knowledge Notes
 */

import { supabase, isSupabaseConfigured } from './client'
import { UXReport } from '@/lib/agent/knowledgeBase'

/**
 * Knowledge Notes Operations
 */
export interface KnowledgeNote {
  title: string
  content: string
  category?: string
  tags?: string[]
}

/**
 * UX Reports Operations
 */
export async function getUXReports(): Promise<UXReport[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  try {
    const { data, error } = await supabase!
      .from('ux_reports')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching UX reports:', error)
      return []
    }

    // Convert Supabase format to UXReport format
    return (data || []).map((row: any) => ({
      id: row.id,
      source: row.source,
      sourceUrl: row.source_url,
      title: row.title,
      date: row.date,
      summary: row.summary,
      executiveSummary: row.executive_summary,
      perception: row.perception,
      journey: row.journey,
      trends: row.trends,
      performance: row.performance,
      checking: row.checking,
      competitorScores: row.competitor_scores || [],
      priority: row.priority,
      overallRating: row.overall_rating,
      totalReviews: row.total_reviews,
      themes: row.themes || [],
      findings: row.findings || [],
    }))
  } catch (error) {
    console.error('Error fetching UX reports:', error)
    return []
  }
}

export async function addUXReport(report: UXReport): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false
  }

  try {
    const { error } = await supabase!
      .from('ux_reports')
      .upsert({
        id: report.id,
        source: report.source,
        source_url: report.sourceUrl,
        title: report.title,
        date: report.date,
        summary: report.summary,
        executive_summary: report.executiveSummary,
        perception: report.perception,
        journey: report.journey,
        trends: report.trends,
        performance: report.performance,
        checking: report.checking,
        competitor_scores: report.competitorScores || [],
        priority: report.priority,
        overall_rating: report.overallRating,
        total_reviews: report.totalReviews,
        themes: report.themes || [],
        findings: report.findings || [],
      }, { onConflict: 'id' })

    if (error) {
      console.error('Error adding UX report:', error)
      return false
    }
    return true
  } catch (error) {
    console.error('Error adding UX report:', error)
    return false
  }
}

export async function addKnowledgeNote(note: KnowledgeNote): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false
  }

  try {
    const { error } = await supabase!
      .from('knowledge_notes')
      .upsert({
        id: note.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        title: note.title,
        content: note.content,
        category: note.category,
        tags: note.tags || [],
      }, { onConflict: 'id' })

    if (error) {
      console.error('Error adding knowledge note:', error)
      return false
    }
    return true
  } catch (error) {
    console.error('Error adding knowledge note:', error)
    return false
  }
}
