import { NextResponse } from 'next/server'
import type { GeoapifyAutocompleteResponse } from '@/lib/lumen/geoapify-address'

/**
 * Server proxy for Geoapify address autocomplete (credit-card KYC).
 * Keeps the API key off the client bundle.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const text = searchParams.get('text')?.trim() ?? ''

  if (text.length < 2) {
    return NextResponse.json({ type: 'FeatureCollection', features: [] } satisfies GeoapifyAutocompleteResponse)
  }

  const apiKey =
    process.env.GEOAPIFY_API_KEY ||
    process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ||
    '003f1ccbb3aa493386c064147b95edbb'

  const url = new URL('https://api.geoapify.com/v1/geocode/autocomplete')
  url.searchParams.set('text', text)
  url.searchParams.set('apiKey', apiKey)
  url.searchParams.set('limit', '6')
  url.searchParams.set('format', 'geojson')

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { type: 'FeatureCollection', features: [], error: `Geoapify ${res.status}` },
        { status: 502 },
      )
    }

    const data = (await res.json()) as GeoapifyAutocompleteResponse
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { type: 'FeatureCollection', features: [], error: 'Geoapify unreachable' },
      { status: 502 },
    )
  }
}
