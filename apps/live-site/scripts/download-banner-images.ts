/**
 * Script to download banner images from Figma design context
 * 
 * Extracts banner images from the Figma design and saves them to public/banners/
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'

// Banner image URLs from Figma design context
const BANNER_IMAGES = {
  // Diner Match Banner
  dinerMatchBackground: 'http://localhost:3845/assets/460d5c1e13097b427dafc0cd9dab68651d9cd354.png',
  dinerMatchLogo: 'http://localhost:3845/assets/9f14801ebf2a9a52e47ef12c91370ff32f19d5cc.png',
  dinerMatchP61: 'http://localhost:3845/assets/9d884cf5e65f15a78d6ab6256fed77b85d3e278c.png',
  dinerMatchP5: 'http://localhost:3845/assets/4a1a9c869a1de349b8daf7dfc3dd65e7dabb30a5.png',
  dinerMatchP4: 'http://localhost:3845/assets/e7a87bb7e90d8b98a7cc83816666a430d6c1f455.png',
  dinerMatchP3: 'http://localhost:3845/assets/c94e1c1547028b4432e3209f746b46360e78872c.png',
  
  // Originals Banner
  originalsBackground: 'http://localhost:3845/assets/1f2ab036df37d7ee8267a9b21e4cd466c77e96be.png',
  originalsDiamonds: 'http://localhost:3845/assets/60aece07be8d3eb0174711a47fa3b99950654867.png',
  
  // VIP Rewards (if any images)
  // Daily Races (if any images)
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
 * Download all banner images
 */
async function downloadBannerImages(): Promise<void> {
  console.log('🎨 Downloading banner images from Figma...')
  
  const bannersDir = path.join(process.cwd(), 'public', 'banners')
  
  // Ensure directory exists
  if (!fs.existsSync(bannersDir)) {
    fs.mkdirSync(bannersDir, { recursive: true })
  }
  
  const results = {
    downloaded: 0,
    errors: [] as string[],
  }
  
  for (const [name, url] of Object.entries(BANNER_IMAGES)) {
    try {
      const fileName = `${name}.png`
      const filePath = path.join(bannersDir, fileName)
      
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
  downloadBannerImages()
    .then(() => {
      console.log('🎉 All banner images downloaded!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error)
      process.exit(1)
    })
}

export default downloadBannerImages
