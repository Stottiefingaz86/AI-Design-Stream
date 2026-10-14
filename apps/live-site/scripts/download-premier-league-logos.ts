import fs from 'fs'
import path from 'path'

const PREMIER_LEAGUE_FOLDER = 'England - Premier League'
const BASE_URL = 'https://raw.githubusercontent.com/luukhopman/football-logos/master/logos'
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'logos', 'premier-league')

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

// List of Premier League teams (common file names in the repository)
const premierLeagueTeams = [
  'arsenal',
  'afc-bournemouth',
  'brighton-hove-albion',
  'burnley',
  'chelsea',
  'crystal-palace',
  'everton',
  'fulham',
  'liverpool-fc',
  'luton-town',
  'manchester-city',
  'manchester-united',
  'newcastle-united',
  'nottingham-forest',
  'sheffield-united',
  'tottenham-hotspur',
  'west-ham-united',
  'wolverhampton-wanderers',
  'aston-villa',
  'brentford',
  'ipswich-town',
]

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
    } else {
      console.log(`✗ Not found: ${teamName}.png (${response.status})`)
    }
  } catch (error) {
    console.error(`✗ Error downloading ${teamName}:`, error)
  }
}

async function downloadAllLogos() {
  console.log('Downloading Premier League team logos...\n')
  
  for (const team of premierLeagueTeams) {
    await downloadLogo(team)
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log('\n✓ Download complete!')
  console.log(`Logos saved to: ${OUTPUT_DIR}`)
}

downloadAllLogos().catch(console.error)
