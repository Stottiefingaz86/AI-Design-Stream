/**
 * Store Sportsbook Figma Variables
 * Run this script to store extracted variables in Supabase
 */

import { extractSportsbookFigma } from './extract-sportsbook-figma'

// Variables extracted from Figma MCP
const variableDefs = {
  'borderRadius-4': '16',
  'borderRadius-3': '12',
  'elevation/3': 'Effect(type: DROP_SHADOW, color: #00000033, offset: (0, 3), radius: 3, spread: -2); Effect(type: DROP_SHADOW, color: #00000024, offset: (0, 3), radius: 4, spread: 0); Effect(type: DROP_SHADOW, color: #0000001F, offset: (0, 1), radius: 8, spread: 0)',
  'borderRadius-9': '40',
}

async function main() {
  console.log('🚀 Storing Sportsbook Figma variables...')
  
  const result = await extractSportsbookFigma(variableDefs)
  
  console.log(`✅ Stored ${result.tokensStored} design tokens`)
  console.log(`✅ Stored ${result.assetsStored} assets`)
}

main().catch(console.error)
