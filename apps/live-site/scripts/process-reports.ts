/**
 * Process Research Reports Script
 * 
 * Extracts and processes all PDF reports from public/reports/
 * Adds them to the knowledge base for CH to reference
 * 
 * Run: npx tsx scripts/process-reports.ts
 */

import { processAllReports } from '../lib/utils/reportExtractor'

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const openaiApiKey = process.env.OPENAI_API_KEY

if (!openaiApiKey) {
  console.error('❌ OPENAI_API_KEY not found in .env.local')
  console.log('Please set OPENAI_API_KEY to process reports with AI')
  process.exit(1)
}

async function main() {
  console.log('🚀 Starting research report processing...\n')

  const results = await processAllReports(openaiApiKey)

  console.log('\n✅ Processing complete!')
  console.log(`\n📊 Summary:`)
  console.log(`  - Processed: ${results.processed} reports`)
  console.log(`  - Failed: ${results.failed} reports`)
  console.log(`  - Reports:`)
  results.reports.forEach(report => {
    console.log(`    ✓ ${report}`)
  })

  if (results.processed > 0) {
    console.log('\n✨ All reports have been added to the knowledge base!')
    console.log('CH can now reference these insights in responses.')
  }
}

main().catch(error => {
  console.error('❌ Error processing reports:', error)
  process.exit(1)
})
