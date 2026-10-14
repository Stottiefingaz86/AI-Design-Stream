/**
 * API endpoint to extract game tile images from Figma
 * 
 * This endpoint uses Figma MCP to extract game tile images
 * and saves them to the public/games/ directory
 * 
 * Usage:
 * POST /api/extract-game-tiles
 * Body: { nodeIds: ['3:12345', '3:12346'], outputDir: 'public/games' }
 */

import { NextResponse } from 'next/server'
import { extractGameTiles } from '@/scripts/extract-casino-game-tiles'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nodeIds, outputDir, figmaFileUrl } = body

    console.log('🎮 Extracting game tiles from Figma...')
    console.log(`   Node IDs: ${nodeIds?.length || 0}`)
    console.log(`   Output: ${outputDir || 'public/games'}`)

    // Extract game tiles from Figma
    const results = await extractGameTiles(
      nodeIds || [],
      outputDir || 'public/games',
      figmaFileUrl
    )

    return NextResponse.json({
      success: true,
      ...results,
      message: `Extracted ${results.extracted} game tiles, saved ${results.saved} images`,
      note: 'To extract actual images, provide specific game tile node IDs from Figma. Use Figma MCP tools to identify node IDs.',
    })
  } catch (error: any) {
    console.error('Error extracting game tiles:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to extract game tiles' },
      { status: 500 }
    )
  }
}
