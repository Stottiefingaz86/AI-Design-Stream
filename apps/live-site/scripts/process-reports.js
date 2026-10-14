/**
 * Process Research Reports Script (JavaScript version)
 * Uses CommonJS require for pdf-parse compatibility
 */

const { processAllReports } = require('../lib/utils/reportExtractor');

require('dotenv').config({ path: '.env.local' });

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.error('❌ OPENAI_API_KEY not found in .env.local');
  process.exit(1);
}

async function main() {
  console.log('🚀 Starting research report processing...\n');
  const results = await processAllReports(openaiApiKey);
  console.log('\n✅ Processing complete!');
  console.log(`\n📊 Summary: Processed: ${results.processed}, Failed: ${results.failed}`);
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
