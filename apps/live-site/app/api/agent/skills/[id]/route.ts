import { NextResponse } from 'next/server'
import { getAgentSkill } from '@/lib/agent/skills'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }
  const skill = await getAgentSkill(decodeURIComponent(id))
  if (!skill) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ skill })
}
