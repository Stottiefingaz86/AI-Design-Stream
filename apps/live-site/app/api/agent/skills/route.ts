import { NextResponse } from 'next/server'
import { createAgentSkill, listAgentSkills } from '@/lib/agent/skills'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const skills = await listAgentSkills()
  return NextResponse.json({ skills })
}

export async function POST(request: Request) {
  let body: { name?: string; description?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  try {
    const skill = await createAgentSkill({
      name: body.name ?? '',
      description: body.description ?? '',
    })
    return NextResponse.json({ skill }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
