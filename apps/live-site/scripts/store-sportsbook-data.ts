/**
 * Store Sportsbook Figma Data in Knowledge Base
 * 
 * This script stores the extracted Sportsbook Figma data in Supabase
 */

import { extractSportsbookFigma } from './extract-sportsbook-figma'

// Variables extracted from Figma MCP
const variableDefs = {
  'borderRadius-3': '12',
  'borderRadius-4': '16',
  'borderRadius-9': '40',
  'elevation/3': 'Effect(type: DROP_SHADOW, color: #00000033, offset: (0, 3), radius: 3, spread: -2); Effect(type: DROP_SHADOW, color: #00000024, offset: (0, 3), radius: 4, spread: 0); Effect(type: DROP_SHADOW, color: #0000001F, offset: (0, 1), radius: 8, spread: 0)',
}

// Figma file information
const figmaFileInfo = {
  fileId: 'vIX39SAgC9K5eINAxErFPw',
  fileName: 'Sportbook-26',
  fileUrl: 'https://www.figma.com/design/vIX39SAgC9K5eINAxErFPw/Sportbook-26',
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
    'Playground',
  ],
}

async function main() {
  console.log('🚀 Storing Sportsbook Figma data in knowledge base...')
  console.log('')
  
  // Store design tokens
  console.log('📦 Storing design tokens...')
  const result = await extractSportsbookFigma(variableDefs)
  
  console.log('')
  console.log('✅ Storage complete!')
  console.log(`   - Design tokens stored: ${result.tokensStored}`)
  console.log(`   - Assets stored: ${result.assetsStored}`)
  console.log('')
  console.log('📋 Extracted data:')
  console.log(`   - File: ${figmaFileInfo.fileName}`)
  console.log(`   - URL: ${figmaFileInfo.fileUrl}`)
  console.log(`   - Tokens: ${Object.keys(variableDefs).length} design tokens`)
  console.log('')
  console.log('💡 The data is now available in the knowledge base for CH to use!')
}

main().catch((error) => {
  console.error('❌ Error storing data:', error)
  process.exit(1)
})
