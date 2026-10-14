/**
 * Extract Sportsbook Figma Assets
 * 
 * Extracts all assets from the Sportsbook-26 Figma file using Figma MCP tools
 * and stores them in Supabase knowledge base
 */

import { isSupabaseConfigured } from '@/lib/supabase/client'
import { supabase } from '@/lib/supabase/client'

interface FigmaVariable {
  name: string
  value: string
  type: 'color' | 'spacing' | 'typography' | 'shadow' | 'border-radius'
}

interface FigmaAsset {
  figmaFileId: string
  figmaFileName: string
  figmaFileUrl: string
  assetType: string
  assetName: string
  assetData: any
}

const SPORTSBOOK_FIGMA_FILE = {
  fileId: 'vIX39SAgC9K5eINAxErFPw',
  fileName: 'Sportbook-26',
  fileUrl: 'https://www.figma.com/design/vIX39SAgC9K5eINAxErFPw/Sportbook-26',
}

/**
 * Store extracted variables as design tokens
 */
async function storeDesignTokens(variables: FigmaVariable[]): Promise<number> {
  if (!isSupabaseConfigured()) {
    console.log('⚠️  Supabase not configured, skipping storage')
    return 0
  }

  let stored = 0
  for (const variable of variables) {
    try {
      const { error } = await supabase!
        .from('design_tokens')
        .upsert({
          id: `sportsbook-${variable.name.toLowerCase().replace(/\s+/g, '-')}`,
          token_type: variable.type,
          token_name: variable.name,
          token_value: variable.value,
          description: `Extracted from ${SPORTSBOOK_FIGMA_FILE.fileName}`,
          figma_link: `${SPORTSBOOK_FIGMA_FILE.fileUrl}?node-id=25-8`,
          brand: 'Sportsbook',
        }, { onConflict: 'token_name' })

      if (error) {
        console.error(`Error storing token ${variable.name}:`, error)
      } else {
        stored++
      }
    } catch (error) {
      console.error(`Error storing token ${variable.name}:`, error)
    }
  }

  return stored
}

/**
 * Store extracted assets
 */
async function storeFigmaAssets(assets: FigmaAsset[]): Promise<number> {
  if (!isSupabaseConfigured()) {
    console.log('⚠️  Supabase not configured, skipping storage')
    return 0
  }

  let stored = 0
  for (const asset of assets) {
    try {
      const { error } = await supabase!
        .from('figma_assets')
        .upsert({
          id: `figma-${SPORTSBOOK_FIGMA_FILE.fileId}-${asset.assetName.toLowerCase().replace(/\s+/g, '-')}`,
          figma_file_id: asset.figmaFileId,
          figma_file_name: asset.figmaFileName,
          figma_file_url: asset.figmaFileUrl,
          asset_type: asset.assetType,
          asset_name: asset.assetName,
          asset_data: asset.assetData,
        }, { onConflict: 'id' })

      if (error) {
        console.error(`Error storing asset ${asset.assetName}:`, error)
      } else {
        stored++
      }
    } catch (error) {
      console.error(`Error storing asset ${asset.assetName}:`, error)
    }
  }

  return stored
}

/**
 * Process extracted variables from Figma MCP
 */
export async function processExtractedVariables(variableDefs: Record<string, string>): Promise<void> {
  console.log('📦 Processing extracted variables from Sportsbook Figma...')
  
  const variables: FigmaVariable[] = []
  
  // Process each variable definition
  for (const [name, value] of Object.entries(variableDefs)) {
    let type: FigmaVariable['type'] = 'border-radius'
    
    if (name.includes('borderRadius')) {
      type = 'border-radius'
    } else if (name.includes('elevation') || name.includes('shadow')) {
      type = 'shadow'
    } else if (name.includes('spacing') || name.includes('gap') || name.includes('padding') || name.includes('margin')) {
      type = 'spacing'
    } else if (name.includes('color') || name.includes('colour')) {
      type = 'color'
    } else if (name.includes('font') || name.includes('typography') || name.includes('text')) {
      type = 'typography'
    }
    
    variables.push({
      name,
      value,
      type,
    })
  }
  
  console.log(`📊 Found ${variables.length} variables`)
  
  // Store in Supabase
  const stored = await storeDesignTokens(variables)
  console.log(`✅ Stored ${stored} design tokens`)
}

/**
 * Main extraction function
 * This should be called with data extracted from Figma MCP tools
 */
export async function extractSportsbookFigma(
  variableDefs?: Record<string, string>,
  components?: any[],
  colors?: any[],
  typography?: any[]
): Promise<{
  tokensStored: number
  assetsStored: number
}> {
  console.log('🚀 Starting Sportsbook Figma extraction...')
  
  let tokensStored = 0
  let assetsStored = 0
  
  // Process variables if provided
  if (variableDefs) {
    tokensStored = await storeDesignTokens(
      Object.entries(variableDefs).map(([name, value]) => {
        let type: FigmaVariable['type'] = 'border-radius'
        if (name.includes('borderRadius')) type = 'border-radius'
        else if (name.includes('elevation') || name.includes('shadow')) type = 'shadow'
        else if (name.includes('spacing') || name.includes('gap')) type = 'spacing'
        else if (name.includes('color')) type = 'color'
        else if (name.includes('font') || name.includes('typography')) type = 'typography'
        
        return { name, value, type }
      })
    )
  }
  
  // Process components if provided
  if (components && components.length > 0) {
    const assets: FigmaAsset[] = components.map(component => ({
      figmaFileId: SPORTSBOOK_FIGMA_FILE.fileId,
      figmaFileName: SPORTSBOOK_FIGMA_FILE.fileName,
      figmaFileUrl: SPORTSBOOK_FIGMA_FILE.fileUrl,
      assetType: 'component',
      assetName: component.name || 'Unknown Component',
      assetData: component,
    }))
    
    assetsStored = await storeFigmaAssets(assets)
  }
  
  console.log(`✅ Extraction complete: ${tokensStored} tokens, ${assetsStored} assets`)
  
  return { tokensStored, assetsStored }
}
