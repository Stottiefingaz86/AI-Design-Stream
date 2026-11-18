import { NextResponse } from 'next/server'
import { resolveDialCountryIso } from '@/lib/lumen/dial-countries'

/**
 * Country from edge geo headers (Vercel / Cloudflare).
 * Localhost falls back to US — no third-party IP call required.
 */
export async function GET(request: Request) {
  const headers = request.headers
  const raw =
    headers.get('x-vercel-ip-country') ||
    headers.get('cf-ipcountry') ||
    headers.get('x-country-code') ||
    null
  const country = resolveDialCountryIso(raw)
  return NextResponse.json({ country })
}
