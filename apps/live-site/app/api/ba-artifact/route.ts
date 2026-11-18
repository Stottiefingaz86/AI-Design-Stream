import { NextResponse } from 'next/server'
import { BA_ARTIFACT_BY_KEY } from '@/lib/ba/artifact-bundle.generated'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_CHARS = 120_000

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get('path')?.trim() ?? ''
  const key = raw.replace(/^\/+/, '')
  const entry = BA_ARTIFACT_BY_KEY[key] ?? BA_ARTIFACT_BY_KEY[raw]
  if (!entry) {
    return NextResponse.json({ error: 'Unknown artifact' }, { status: 404 })
  }

  let text = entry.text
  let truncated = false
  if (text.length > MAX_CHARS) {
    text = `${text.slice(0, MAX_CHARS)}\n\n/* … truncated … */\n`
    truncated = true
  }

  return NextResponse.json({
    path: entry.path,
    label: key,
    language: entry.path.split('.').pop() ?? 'txt',
    truncated,
    text,
  })
}
