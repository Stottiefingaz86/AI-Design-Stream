import { NextResponse } from 'next/server'
import { readAgentAsset } from '@/lib/agent/jobs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Params = { kind: string; slug: string; file: string }

export async function GET(
  _request: Request,
  context: { params: Params },
) {
  const kind = context.params.kind
  const slug = decodeURIComponent(context.params.slug ?? '')
  const file = decodeURIComponent(context.params.file ?? '')
  if (kind !== 'feedback' && kind !== 'references') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const asset = await readAgentAsset(kind, slug, file)
  if (!asset) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return new NextResponse(new Uint8Array(asset.buffer), {
    status: 200,
    headers: {
      'Content-Type': asset.contentType,
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
