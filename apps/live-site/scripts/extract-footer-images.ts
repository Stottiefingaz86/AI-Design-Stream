/**
 * Script to extract footer images from Figma
 * 
 * This script extracts payment logos, security badges, partner logos, and social media icons
 * from the Figma footer design and saves them to public/logos/
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'

const FOOTER_FIGMA_FILE = {
  fileId: 'In3XY2U0imsxnOuOhQeMzb',
  fileName: 'Navigation-Handoff---22-11',
  fileUrl: 'https://www.figma.com/design/In3XY2U0imsxnOuOhQeMzb/Navigation-Handoff---22-11',
}

// Footer image node IDs - these need to be identified from Figma
// Payment method logos
const PAYMENT_LOGO_NODES: { [key: string]: string } = {
  bitcoin: '', // Add node ID
  ethereum: '',
  litecoin: '',
  visa: '',
  mastercard: '',
  amex: '',
  discover: '',
  moneygram: '',
}

// Security badges
const SECURITY_BADGE_NODES: { [key: string]: string } = {
  responsibleGaming: '',
  sslSecure: '',
  ageRestriction: '',
}

// Partner logos
const PARTNER_LOGO_NODES: { [key: string]: string } = {
  laliga: '',
  lfa: '',
  matchroom: '',
  goldenBoy: '',
}

// Social media icons (if they're images, otherwise use Tabler icons)
const SOCIAL_ICON_NODES: { [key: string]: string } = {
  facebook: '',
  instagram: '',
  twitter: '',
  youtube: '',
  tiktok: '',
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
 * Extract footer images from Figma
 * 
 * This function would use Figma MCP to:
 * 1. Get screenshots of footer image components
 * 2. Download images from Figma
 * 3. Save them to public/logos/
 */
export async function extractFooterImages(
  nodeIds: { [key: string]: string } = {},
  outputDir: string = 'public/logos'
): Promise<{
  extracted: number
  saved: number
  errors: string[]
  savedFiles: string[]
}> {
  console.log('🖼️  Starting footer image extraction from Figma...')
  
  const results = {
    extracted: 0,
    saved: 0,
    errors: [] as string[],
    savedFiles: [] as string[],
  }
  
  // Ensure output directories exist
  const paymentDir = path.join(process.cwd(), outputDir, 'payment')
  const securityDir = path.join(process.cwd(), outputDir, 'security')
  const partnersDir = path.join(process.cwd(), outputDir, 'partners')
  const socialDir = path.join(process.cwd(), outputDir, 'social')
  
  ;[paymentDir, securityDir, partnersDir, socialDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
  
  // Process payment logos
  for (const [key, nodeId] of Object.entries(nodeIds)) {
    if (!nodeId) continue
    
    try {
      console.log(`📥 Extracting ${key} from node: ${nodeId}`)
      
      // Determine output directory based on key
      let targetDir = paymentDir
      let fileName = key
      
      if (key.includes('responsible') || key.includes('ssl') || key.includes('age')) {
        targetDir = securityDir
      } else if (key.includes('laliga') || key.includes('lfa') || key.includes('matchroom') || key.includes('golden')) {
        targetDir = partnersDir
      } else if (key.includes('facebook') || key.includes('instagram') || key.includes('twitter') || key.includes('youtube') || key.includes('tiktok')) {
        targetDir = socialDir
      }
      
      const filePath = path.join(targetDir, `${fileName}.png`)
      
      // Placeholder: In actual implementation, download from Figma MCP
      // const imageUrl = await getFigmaImageUrl(nodeId)
      // await downloadImage(imageUrl, filePath)
      
      console.log(`   Would save to: ${filePath}`)
      results.extracted++
      // results.saved++
      // results.savedFiles.push(`${fileName}.png`)
      
    } catch (error: any) {
      console.error(`❌ Error extracting ${key}:`, error.message)
      results.errors.push(`${key}: ${error.message}`)
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
    const allNodeIds = {
      ...PAYMENT_LOGO_NODES,
      ...SECURITY_BADGE_NODES,
      ...PARTNER_LOGO_NODES,
      ...SOCIAL_ICON_NODES,
    }
    
    const results = await extractFooterImages(allNodeIds)
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

export default extractFooterImages
