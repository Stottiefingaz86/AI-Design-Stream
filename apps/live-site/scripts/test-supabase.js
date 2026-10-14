/**
 * Test Supabase Connection
 * 
 * Run this to verify Supabase is configured correctly
 * node scripts/test-supabase.js
 */

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env.local')
  process.exit(1)
}

console.log('✅ Supabase URL:', supabaseUrl)
console.log('✅ Supabase Key:', supabaseKey.substring(0, 20) + '...')

// Test connection
async function testConnection() {
  try {
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Try to query the ux_reports table (it might not exist yet, that's okay)
    const { data, error } = await supabase
      .from('ux_reports')
      .select('count')
      .limit(1)
    
    if (error) {
      if (error.code === '42P01') {
        console.log('⚠️  Tables not created yet. Run the migration SQL in Supabase SQL Editor.')
        console.log('   See: supabase/migrations/001_initial_schema.sql')
      } else {
        console.error('❌ Error:', error.message)
      }
    } else {
      console.log('✅ Supabase connection successful!')
      console.log('✅ Tables exist and are accessible')
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message)
  }
}

testConnection()
