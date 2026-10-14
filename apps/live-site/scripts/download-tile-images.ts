/**
 * Script to download game tile images from Figma design context
 * 
 * Extracts square tiles (1:1) and long rectangle Originals tiles (2:1) from Figma
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'

// Tile image URLs from Figma design context
// Square tiles (1:1) for regular games
const SQUARE_TILES = {
  // Compressed slot images
  goldNuggetRush: 'http://localhost:3845/assets/2a4269e244b7710b1653d67fee280c8b811ca9e1.png',
  megacrush: 'http://localhost:3845/assets/a66953f933a2e376299bb7ccd67177b516210628.png',
  goldNuggetRush2: 'http://localhost:3845/assets/1916fc28d2a7a34ef70ed69d6ad09421f925beaa.png',
  mrMammoth: 'http://localhost:3845/assets/445dde7cbf492da3098173676221362956a94d67.png',
  cocktailWheel: 'http://localhost:3845/assets/1ffe910acb6f440470d10024460df1731b14c216.png',
  takeTheBank: 'http://localhost:3845/assets/4beeb6f30c23eda70872bc2bfbbbc265a1693684.png',
  hookedOnFishing: 'http://localhost:3845/assets/a1e1d4ec7fd64bc380ec969a12d40db7480801b1.png',
  
  // Live casino images
  roulette: 'http://localhost:3845/assets/e5f6c332021b1b082bd7e55f0b3e34f2d3f79be6.png',
  blackjack: 'http://localhost:3845/assets/eff7738ab9f32831c0c8a05387e8790328ee0e6b.png',
  baccarat: 'http://localhost:3845/assets/9c7102da69bd5f118a6390262c4e71ae64f98d76.png',
  autoBaccarat: 'http://localhost:3845/assets/de5929924e6fd745c03668e207343b709bec6b1b.png',
  
  // Other game images
  game8: 'http://localhost:3845/assets/4b873d885969dd64259a5d21e393c53335a67e0c.png',
  game17: 'http://localhost:3845/assets/262bd4a79703a3905c3586304f58f6e87dc8c5fd.png',
  game18: 'http://localhost:3845/assets/ceb1c8b0a029e61a9b8b1aaeea8ced88b37bda07.png',
  game20: 'http://localhost:3845/assets/d4127f137ade2cab5ea3d06b85273ab15be05f5f.png',
  game21: 'http://localhost:3845/assets/d118bea196e4a32304ca516e80b6e901690fb6c8.png',
  game23: 'http://localhost:3845/assets/3544a2e6df38caf6099947ee48df55c1f833db80.png',
  game24: 'http://localhost:3845/assets/add0a48b9e3fccd91b1523f4698454ae8edfe1b1.png',
}

// Long rectangle Originals tiles (2:1)
const ORIGINALS_TILES = {
  // Dice
  dice: 'http://localhost:3845/assets/65189038e37b247f5b7731df5e507346c02293f0.png',
  diceShadow: 'http://localhost:3845/assets/2825d2ecf960fdd1d07aec0c097ef5670b0a14db.png',
  
  // Plinko
  plinko: 'http://localhost:3845/assets/977a3eee4ccbc8ea38ec0b7e8c2593cb5d872679.png',
  plinkoCircles: 'http://localhost:3845/assets/44bfd38656e95aadb606e0b95222206165fd1f84.png',
  plinkoElements: 'http://localhost:3845/assets/95c53b52ddd850bd7abe128f30884925867a80df.png',
  plinkoElements2: 'http://localhost:3845/assets/ae428c8b71d1885b7d8301bff80f46e8bf115ab4.png',
  plinkoElements3: 'http://localhost:3845/assets/647ad2ffce5c705c892e52770f650bc0aef1effa.png',
  plinkoElements4: 'http://localhost:3845/assets/653e1032eb2d857a8e8df677a05403fc123a925c.png',
  
  // Blackjack
  blackjackCard: 'http://localhost:3845/assets/cac1867b5e03bd817652c5fa2206ab2dc7a33232.png',
  blackjackCard2: 'http://localhost:3845/assets/1cfffac18477d91538827bfe148aea0981c62ff1.png',
  blackjackCard3: 'http://localhost:3845/assets/2751cd5a876970a21c9d39335bcf8f264a7fbdf3.png',
  blackjackCard4: 'http://localhost:3845/assets/82d93426881125b03ccdde46316eddca5a338f8e.png',
  blackjackCard5: 'http://localhost:3845/assets/c0aea175836c3ee40dea87cfb4db9d9ff4cd6a4a.png',
  blackjackCard6: 'http://localhost:3845/assets/437fb8d4d97566e291083448eee66665de0ee849.png',
  blackjackCard7: 'http://localhost:3845/assets/427c7c2bd222ed85a23fb28215c549e8977b16ac.png',
  blackjackCard8: 'http://localhost:3845/assets/2fef6073f136f28b3559c40b9fbcef3000b27470.png',
  blackjackCard9: 'http://localhost:3845/assets/8254bfd1bac195da21486aee419a0e061baf9691.png',
  blackjackCard10: 'http://localhost:3845/assets/b24a4b53466cd3189ecc29d7ceab7fd73747a7e1.png',
  blackjackCard11: 'http://localhost:3845/assets/dbed30598e6ea67874ae67e188bd899d888e5e6a.png',
  blackjackCard12: 'http://localhost:3845/assets/c45408f02d08914e96ee983866c71ab35330d5dc.png',
  blackjackCard13: 'http://localhost:3845/assets/684e5969ad8c413e8d9fa698cb052575c2583437.png',
  blackjackCard14: 'http://localhost:3845/assets/92704cff6ca67010487d50e69c4552176a9c686c.png',
  blackjackCard15: 'http://localhost:3845/assets/6ddbf954635a24b64b8ef437b148320db298a9c6a.png',
  blackjackCard16: 'http://localhost:3845/assets/e2b19479c0f844e18f4f0a199e28534ac6d93bd0.png',
  blackjackCard17: 'http://localhost:3845/assets/72e974e4ec03a3184322e4d61d0690be247783.png',
  blackjackCard18: 'http://localhost:3845/assets/bae68008e59643e4d55e6ee901d5e8a79719304a.png',
  blackjackCard19: 'http://localhost:3845/assets/1d56d1079e643c06f4f212028220bea9b0d47c72.png',
  blackjackCard20: 'http://localhost:3845/assets/d06c82d5a55c34fcde3f333b240e04bad40ff7fb.png',
  blackjackCard21: 'http://localhost:3845/assets/a3ca86f8ec5023fb6b49dd4ebdea7cffcffbc4a2.png',
  blackjackCard22: 'http://localhost:3845/assets/8318dcd0c6c70523c5dbdd324b8711c2a7d9b738.png',
  blackjackCard23: 'http://localhost:3845/assets/6841dfe09e9fa314bbe1e7c279ec1e1ae05ddf83.png',
  blackjackCard24: 'http://localhost:3845/assets/ef9fb091c551f0a3c78bf06b529126ba11c52e04.png',
  blackjackCard25: 'http://localhost:3845/assets/69ccd97693428c12ce35d2ffab6c9caa8aa5466e.png',
  blackjackCard26: 'http://localhost:3845/assets/1a3abffbdde7ba3a2666e0d8a1412f6325c13128.png',
  blackjackCard27: 'http://localhost:3845/assets/1a76ce20cd20c97f21e75656de996f48f99c985c.png',
  blackjackCard28: 'http://localhost:3845/assets/cccc7ef5141bd7da11c2b759ebfbf49cc160797e.png',
  blackjackCard29: 'http://localhost:3845/assets/8e8571d5fe03a7e568556f11f2f27ba1e5ce1f19.png',
  blackjackCard30: 'http://localhost:3845/assets/a729084f2a47bbcca54fab31d047cf18ce6a8177.png',
  blackjackCard31: 'http://localhost:3845/assets/1a06cf07556b39bfcc406f1b7033d7501d14b024.png',
  
  // Diamonds
  diamonds: 'http://localhost:3845/assets/8cd5ad5d204577299a2429d2640ec352fdf07d67.png',
  diamonds2: 'http://localhost:3845/assets/e9aaeb8a3687441f30efaa8c619663bea3e6f301.png',
  diamonds3: 'http://localhost:3845/assets/6286fd356f3d6833f3a73d10557aecd0233f2791.png',
  diamonds4: 'http://localhost:3845/assets/9aeaa2930da771a0242772305608d14c3545b8b5.png',
  diamonds5: 'http://localhost:3845/assets/11f3825506d2afc8505a89c72a9a53608449ee00.png',
  diamonds6: 'http://localhost:3845/assets/d42ad3af8f49af22abeae89dad31ffbf8325ad31.png',
  diamonds7: 'http://localhost:3845/assets/fa2f6e3118266db06cc4be9e952eb9ca5b87257a.png',
  diamonds8: 'http://localhost:3845/assets/5dc9623c1b1b465852b33e2388bf9e8d1cfc9820.png',
  diamonds9: 'http://localhost:3845/assets/61a2b0036fd748b4d52264285587a983cee98e02.png',
  diamonds10: 'http://localhost:3845/assets/4359c86cc43622a031f4576466c9294c12f17139.png',
  diamonds11: 'http://localhost:3845/assets/2d8a4cf23c95644ede4f8e66227324e991981bbb.png',
  diamonds12: 'http://localhost:3845/assets/989447b2a1e6c52c1adc40777928abb03c475a13.png',
  diamonds13: 'http://localhost:3845/assets/9d552b15b49cc7101577f26974ab676ed664c2ed.png',
  diamonds14: 'http://localhost:3845/assets/de675b1e991c5404ad19a7a3ce91063d5d058e95.png',
  diamonds15: 'http://localhost:3845/assets/4300779d3c2d8c79108a89be165e7c41fb3d7f21.png',
  diamonds16: 'http://localhost:3845/assets/aa5d1932fb25665e63f92184a39a5ee9fe7f072a.png',
  diamonds17: 'http://localhost:3845/assets/8650de479eda3b2c6faa334a63d9c6486623ce01.png',
  diamonds18: 'http://localhost:3845/assets/cc4cee8e130ee8287555440c9269b290bce44e46.png',
  diamonds19: 'http://localhost:3845/assets/7181269824e6bd9146fd80df198254be86bbcbf8.png',
  diamonds20: 'http://localhost:3845/assets/24344070305a5ebdbe5703f66d83e5995f11800a.png',
  diamonds21: 'http://localhost:3845/assets/ce3446712b303a458a0af35fab175b3ff051cd79.png',
  diamonds22: 'http://localhost:3845/assets/c378562e01b12ee8981b1f77998b2a2a78f06ff2.png',
  diamonds23: 'http://localhost:3845/assets/ff199a9c2f56c0ed91901c1e125bb0eba63dcb02.png',
  diamonds24: 'http://localhost:3845/assets/48c6b930f2de99b3124d1b4e6213dc9639feeb05.png',
  diamonds25: 'http://localhost:3845/assets/a0507226ba6631c5d917aab61a1021f9fba53722.png',
  diamonds26: 'http://localhost:3845/assets/7bfa44cc7f0ab325e6d23ab4d7eeff3487c8443e.png',
  diamonds27: 'http://localhost:3845/assets/ca7f465ae6fee01b24bd68f333bb6a71176b1cd2.png',
  diamonds28: 'http://localhost:3845/assets/8bbb95b868bf53062b5f0676ddef021394d2e748.png',
  diamonds29: 'http://localhost:3845/assets/84012767b9fda9249463477ab4f8db3917ff8ad9.png',
  diamonds30: 'http://localhost:3845/assets/1861266a826933f9c8f4c505eed75568f48d44f2.png',
  diamonds31: 'http://localhost:3845/assets/07fae3f9fc5a7be665334de8d815f07287b60840.png',
  diamonds32: 'http://localhost:3845/assets/5d6de5bcb203f97dbe4748f042b7d9287e58ad55.png',
  diamonds33: 'http://localhost:3845/assets/1445fee988bfb7b8aabde0826683bf1616bd26cb.png',
  diamonds34: 'http://localhost:3845/assets/b3c569ba5cef1a0c2fa02cc7fc5d1842bb9e34a6.png',
  diamonds35: 'http://localhost:3845/assets/53737c6746d6eae0f57364df11265495fe106eba.png',
  diamonds36: 'http://localhost:3845/assets/dfaecf4cba400677444a73489c928b4938f45366.png',
  diamonds37: 'http://localhost:3845/assets/002637d2769dd7f19598f4419e9297ebfdbb7f30.png',
  diamonds38: 'http://localhost:3845/assets/710b3d19d8c413779bf656a21e89e36c7e1f70dc.png',
  
  // Mines
  mines: 'http://localhost:3845/assets/8cd5ad5d204577299a2429d2640ec352fdf07d67.png',
  
  // Keno
  keno: 'http://localhost:3845/assets/8cd5ad5d204577299a2429d2640ec352fdf07d67.png',
  
  // Limbo
  limbo: 'http://localhost:3845/assets/8cd5ad5d204577299a2429d2640ec352fdf07d67.png',
  
  // Wheel
  wheel: 'http://localhost:3845/assets/8cd5ad5d204577299a2429d2640ec352fdf07d67.png',
  
  // Hilo
  hilo: 'http://localhost:3845/assets/8cd5ad5d204577299a2429d2640ec352fdf07d67.png',
  
  // Video Poker
  videoPoker: 'http://localhost:3845/assets/8cd5ad5d204577299a2429d2640ec352fdf07d67.png',
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
 * Download all tile images
 */
async function downloadTileImages(): Promise<void> {
  console.log('🎮 Downloading game tile images from Figma...')
  
  const squareTilesDir = path.join(process.cwd(), 'public', 'games', 'square')
  const originalsTilesDir = path.join(process.cwd(), 'public', 'games', 'originals')
  
  // Ensure directories exist
  if (!fs.existsSync(squareTilesDir)) {
    fs.mkdirSync(squareTilesDir, { recursive: true })
  }
  if (!fs.existsSync(originalsTilesDir)) {
    fs.mkdirSync(originalsTilesDir, { recursive: true })
  }
  
  const results = {
    downloaded: 0,
    errors: [] as string[],
  }
  
  // Download square tiles
  console.log('\n📦 Downloading square tiles (1:1)...')
  for (const [name, url] of Object.entries(SQUARE_TILES)) {
    try {
      const fileName = `${name}.png`
      const filePath = path.join(squareTilesDir, fileName)
      
      console.log(`📥 Downloading ${name}...`)
      await downloadImage(url, filePath)
      console.log(`✅ Saved: ${fileName}`)
      results.downloaded++
    } catch (error: any) {
      console.error(`❌ Error downloading ${name}:`, error.message)
      results.errors.push(`${name}: ${error.message}`)
    }
  }
  
  // Download Originals tiles
  console.log('\n📦 Downloading Originals tiles (2:1)...')
  for (const [name, url] of Object.entries(ORIGINALS_TILES)) {
    try {
      const fileName = `${name}.png`
      const filePath = path.join(originalsTilesDir, fileName)
      
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
  downloadTileImages()
    .then(() => {
      console.log('🎉 All tile images downloaded!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error)
      process.exit(1)
    })
}

export default downloadTileImages
