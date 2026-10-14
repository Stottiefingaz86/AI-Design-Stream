/**
 * Script to download live casino tile images from Figma design context
 * 
 * Extracts live casino game tiles from the Figma design node 44-464687
 * and saves them to public/games/live/
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'

// Live tile image URLs from Figma design context
// These will be populated from the Figma MCP get_design_context response
const LIVE_TILES: { [key: string]: string } = {
  // VIP BLACKJACK tiles
  vipBlackjack1: 'http://localhost:3845/assets/...',
  vipBlackjack2: 'http://localhost:3845/assets/...',
  
  // AUTO BACCARAT tiles
  autoBaccarat1: 'http://localhost:3845/assets/...',
  autoBaccarat2: 'http://localhost:3845/assets/...',
  
  // LIVE BETONLINE ROUETTE tiles
  liveRoulette1: 'http://localhost:3845/assets/...',
  liveRoulette2: 'http://localhost:3845/assets/...',
  
  // Casino Poker tiles
  casinoPoker1: 'http://localhost:3845/assets/...',
  casinoPoker2: 'http://localhost:3845/assets/...',
}

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
        file.close()
        fs.unlink(filePath, () => {}) // Delete the file on error
        reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`))
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
 * Download all live tile images
 */
async function downloadLiveTiles(): Promise<void> {
  console.log('🎮 Downloading live casino tile images from Figma...')
  
  const liveTilesDir = path.join(process.cwd(), 'public', 'games', 'live')
  
  // Ensure directory exists
  if (!fs.existsSync(liveTilesDir)) {
    fs.mkdirSync(liveTilesDir, { recursive: true })
  }
  
  const results = {
    downloaded: 0,
    errors: [] as string[],
  }
  
  for (const [name, url] of Object.entries(LIVE_TILES)) {
    if (!url || url.includes('...')) {
      console.log(`⏭️  Skipping ${name} (no URL provided)`)
      continue
    }
    
    try {
      const fileName = `${name}.png`
      const filePath = path.join(liveTilesDir, fileName)
      
      console.log(`📥 Downloading ${name}...`)
      await downloadImage(url, filePath)
      console.log(`✅ Saved: ${fileName}`)
      results.downloaded++
    } catch (error: any) {
      console.error(`❌ Error downloading ${name}:`, error.message)
      results.errors.push(`${name}: ${error.message}`)
    }
  }
  
  console.log(`\n✅ Download complete: ${results.downloaded} images saved`)
  if (results.errors.length > 0) {
    console.log(`⚠️  ${results.errors.length} errors:`)
    results.errors.forEach(err => console.log(`   - ${err}`))
  }
}

// Run if called directly
if (require.main === module) {
  downloadLiveTiles()
    .then(() => {
      console.log('🎉 All live tile images downloaded!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error)
      process.exit(1)
    })
}

export default downloadLiveTiles
