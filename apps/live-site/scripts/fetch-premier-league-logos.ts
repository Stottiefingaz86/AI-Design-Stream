import fs from 'fs'
import path from 'path'

const PREMIER_LEAGUE_FOLDER = 'England - Premier League'
const BASE_URL = 'https://raw.githubusercontent.com/luukhopman/football-logos/master/logos'
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'logos', 'premier-league')

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

// Try to fetch the directory listing from GitHub API
async function fetchFileList() {
  const apiUrl = 'https://api.github.com/repos/luukhopman/football-logos/contents/logos/England%20-%20Premier%20League'
  
  try {
    const response = await fetch(apiUrl)
    if (response.ok) {
      const files = await response.json()
      const pngFiles = files
        .filter((file: any) => file.name.endsWith('.png'))
        .map((file: any) => file.name.replace('.png', ''))
      
      console.log('Found PNG files:', pngFiles)
      return pngFiles
    } else {
      console.error('Failed to fetch file list:', response.status)
      return []
    }
  } catch (error) {
    console.error('Error fetching file list:', error)
    return []
  }
}

async function downloadLogo(teamName: string): Promise<void> {
  const encodedFolder = encodeURIComponent(PREMIER_LEAGUE_FOLDER)
  const url = `${BASE_URL}/${encodedFolder}/${teamName}.png`
  const outputPath = path.join(OUTPUT_DIR, `${teamName}.png`)

  try {
    const response = await fetch(url)
    if (response.ok) {
      const buffer = await response.arrayBuffer()
      fs.writeFileSync(outputPath, Buffer.from(buffer))
      console.log(`✓ Downloaded: ${teamName}.png`)
      return
    } else {
      console.log(`✗ Not found: ${teamName}.png (${response.status})`)
    }
  } catch (error) {
    console.error(`✗ Error downloading ${teamName}:`, error)
  }
}

async function downloadAllLogos() {
  console.log('Fetching Premier League team logos list...\n')
  
  const teamNames = await fetchFileList()
  
  if (teamNames.length === 0) {
    console.log('No files found. Trying common team names...')
    // Fallback to trying common names
    const commonTeams = [
      'arsenal', 'bournemouth', 'brighton', 'burnley', 'chelsea',
      'crystal-palace', 'everton', 'fulham', 'liverpool', 'luton',
      'manchester-city', 'manchester-united', 'newcastle', 'nottingham',
      'sheffield', 'tottenham', 'west-ham', 'wolves', 'aston-villa',
      'brentford', 'ipswich'
    ]
    
    for (const team of commonTeams) {
      await downloadLogo(team)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  } else {
    console.log(`\nDownloading ${teamNames.length} logos...\n`)
    for (const team of teamNames) {
      await downloadLogo(team)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  console.log('\n✓ Download complete!')
  console.log(`Logos saved to: ${OUTPUT_DIR}`)
}

downloadAllLogos().catch(console.error)
