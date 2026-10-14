/**
 * Supabase Client for Knowledge Base
 * 
 * Provides persistent storage for:
 * - UX Reports
 * - Figma Assets
 * - Design Tokens
 * - Stakeholders
 * - Processes
 * - Knowledge Notes
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Knowledge base will use in-memory storage.')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return supabase !== null
}
