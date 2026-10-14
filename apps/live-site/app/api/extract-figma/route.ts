/**
 * API endpoint to extract and store Figma assets
 * 
 * This endpoint processes Figma data extracted via MCP tools
 * and stores it in Supabase knowledge base
 */

import { NextResponse } from 'next/server'
import { extractSportsbookFigma } from '@/scripts/extract-sportsbook-figma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { variableDefs, components, colors, typography } = body

    // Process and store extracted data
    const result = await extractSportsbookFigma(
      variableDefs,
      components,
      colors,
      typography
    )

    return NextResponse.json({
      success: true,
      ...result,
      message: `Extracted ${result.tokensStored} tokens and ${result.assetsStored} assets from Sportsbook Figma`,
    })
  } catch (error: any) {
    console.error('Error extracting Figma assets:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to extract Figma assets' },
      { status: 500 }
    )
  }
}
