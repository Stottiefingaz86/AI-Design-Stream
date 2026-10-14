/**
 * Script to extract game tile images from Casino Figma file
 * 
 * This script uses Figma MCP to extract game tile images
 * and saves them to public/games/ directory
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'

const CASINO_FIGMA_FILE = {
  fileId: 'dsg9EC3QiVp7h80BNy47EA',
  fileName: 'Casino-26--LightMode--MUI-ADS',
  fileUrl: 'https://www.figma.com/design/dsg9EC3QiVp7h80BNy47EA/Casino-26--LightMode-%7C-MUI-ADS',
}

// Game tile node IDs from the Figma file
// These would need to be identified from the Figma design
const GAME_TILE_NODES: string[] = [
  // Most Played games
  // Popular games
  // Originals games
  // Live Casino games
  // Add specific node IDs here once identified
]

/**
 * Download image from URL and save to file
 */
function downloadImage(url: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const file = fs.createWriteStream(filePath)
    
    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        return downloadImage(response.headers.location!, filePath)
          .then(resolve)
          .catch(reject)
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`))
        return
      }
      
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}) // Delete the file on error
      reject(err)
    })
  })
}

/**
 * Extract game tile images from Figma using MCP tools
 * 
 * This function uses Figma MCP to:
 * 1. Get screenshots of game tile components
 * 2. Download images from Figma
 * 3. Save them to public/games/
 */
export async function extractGameTiles(
  nodeIds: string[] = [],
  outputDir: string = 'public/games',
  figmaFileUrl: string = CASINO_FIGMA_FILE.fileUrl
): Promise<{
  extracted: number
  saved: number
  errors: string[]
  savedFiles: string[]
}> {
  console.log('🎮 Starting game tile extraction from Figma...')
  
  const results = {
    extracted: 0,
    saved: 0,
    errors: [] as string[],
    savedFiles: [] as string[],
  }
  
  // Ensure output directory exists
  const gamesDir = path.join(process.cwd(), outputDir)
  if (!fs.existsSync(gamesDir)) {
    fs.mkdirSync(gamesDir, { recursive: true })
  }
  
  // If no node IDs provided, use the main lobby node
  if (nodeIds.length === 0) {
    console.log('📋 No specific node IDs provided, will extract from main lobby node (3:23052)...')
    // The main node contains all game tiles, we'd need to traverse children
    // For now, return early and suggest providing specific node IDs
    console.log('💡 Tip: Provide specific game tile node IDs for better extraction')
    return results
  }
  
  // Process each game tile node
  for (let i = 0; i < nodeIds.length; i++) {
    const nodeId = nodeIds[i]
    try {
      console.log(`📥 [${i + 1}/${nodeIds.length}] Extracting game tile from node: ${nodeId}`)
      
      // In production, this would:
      // 1. Call Figma MCP get_screenshot(nodeId) to get image
      // 2. The MCP server would return an image URL or base64
      // 3. Download/save the image
      
      // For now, we'll create a placeholder structure
      // The actual extraction would happen via API endpoint that has access to MCP tools
      
      const fileName = `game-tile-${nodeId.replace(/:/g, '-')}.png`
      const filePath = path.join(gamesDir, fileName)
      
      // Placeholder: In actual implementation, download from Figma MCP
      console.log(`   Would save to: ${filePath}`)
      
      results.extracted++
      // results.saved++ // Uncomment when actual download works
      // results.savedFiles.push(fileName)
      
    } catch (error: any) {
      console.error(`❌ Error extracting node ${nodeId}:`, error.message)
      results.errors.push(`Node ${nodeId}: ${error.message}`)
    }
  }
  
  console.log(`✅ Extraction complete: ${results.saved} images saved`)
  if (results.errors.length > 0) {
    console.log(`⚠️  ${results.errors.length} errors occurred`)
  }
  
  return results
}

/**
 * Main execution
 */
async function main() {
  try {
    const results = await extractGameTiles(GAME_TILE_NODES)
    console.log('\n📊 Extraction Summary:')
    console.log(`   Extracted: ${results.extracted}`)
    console.log(`   Saved: ${results.saved}`)
    console.log(`   Errors: ${results.errors.length}`)
    
    if (results.errors.length > 0) {
      console.log('\n❌ Errors:')
      results.errors.forEach((error) => console.log(`   - ${error}`))
    }
  } catch (error: any) {
    console.error('💥 Fatal error:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export default extractGameTiles
