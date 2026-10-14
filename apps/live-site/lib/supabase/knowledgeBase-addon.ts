/**
 * Knowledge Notes Operations (addon to knowledgeBase.ts)
 */

import { supabase, isSupabaseConfigured } from './client'

export interface KnowledgeNote {
  title: string
  content: string
  category?: string
  tags?: string[]
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
