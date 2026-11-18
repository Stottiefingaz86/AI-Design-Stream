/**
 * Kick a Cursor **cloud** agent from the design desk (Vercel / serverless).
 * Local studio still uses @cursor/sdk local runtime elsewhere.
 */
import { Agent, CursorAgentError } from '@cursor/sdk'
import type { AgentJob } from '@/lib/agent/types'

export type CloudKickResult = {
  ok: boolean
  agentId?: string
  runId?: string
  url?: string
  error?: string
}

function apiKey(): string {
  return (process.env.CURSOR_API_KEY ?? '').trim()
}

function repoUrl(): string {
  return (
    process.env.CURSOR_CLOUD_REPO?.trim() ||
    process.env.GITHUB_REPO_URL?.trim() ||
    ''
  )
}

function startingRef(): string {
  return process.env.CURSOR_CLOUD_REF?.trim() || 'main'
}

export function cloudAgentsConfigured(): boolean {
  return Boolean(apiKey() && repoUrl())
}

function agentUrl(agentId: string): string {
  return `https://cursor.com/agents?id=${encodeURIComponent(agentId)}`
}

function designPrompt(job: AgentJob): string {
  const route =
    job.questions.find((q) => /route|nav/i.test(q.text))?.answer?.trim() ||
    'infer from BRD'
  return [
    'You are the Design agent for BetOnline live-site (Lumen + chris-taste).',
    `Initiative slug: ${job.slug}`,
    `Title: ${job.title}`,
    `Surface: ${job.surface}`,
    `Route / nav: ${route}`,
    '',
    'BRD:',
    job.brief.trim(),
    '',
    'Hard rules:',
    '- Follow `.cursor/skills/lumen-betonline-build/SKILL.md` + `patterns.md` and `.cursor/knowledge/chris-taste/`.',
    '- Build on the design-lane prototype: `apps/live-site/app/prototype/[slug]/page.tsx` and neighbors — never invent a parallel design system.',
    '- If this is VIP Hub Benefits (incl. benifits typos): open hub on Benefits with a real level × benefits table (`VipBenefitsPanel` / prototype page).',
    '- Preview URL is `/prototype/<slug>` (same-origin on Vercel). Do not put unmerged work on demo nav.',
    '- Open a PR with the working prototype when done (`autoCreatePR` is on).',
    '- Short commit/PR summary focused on why.',
  ].join('\n')
}

function refinePrompt(job: AgentJob, note: string): string {
  return [
    'You are the Design agent applying refine feedback on BetOnline live-site.',
    `Initiative slug: ${job.slug}`,
    `Title: ${job.title}`,
    `Preview: ${job.artifacts.previewUrl ?? `/prototype/${job.slug}`}`,
    '',
    'Latest feedback from the design desk:',
    note.trim() || '(see screenshots / feedback.md in chat context)',
    '',
    'Also read `specs/<slug>/feedback.md` if present in the repo after prior syncs.',
    '',
    'Hard rules: Lumen + chris-taste only. Fix the prototype so the desk preview looks right. Open/update PR.',
  ].join('\n')
}

/**
 * Start a cloud agent and return IDs immediately (do not block on full run).
 * Safe for Vercel — the cloud VM continues after this function returns.
 */
export async function kickCursorCloudAgent(
  job: AgentJob,
  kind: 'design' | 'refine',
  refineNote = '',
): Promise<CloudKickResult> {
  const key = apiKey()
  const repo = repoUrl()
  if (!key) {
    return { ok: false, error: 'CURSOR_API_KEY missing on this host' }
  }
  if (!repo) {
    return { ok: false, error: 'CURSOR_CLOUD_REPO missing on this host' }
  }

  try {
    const agent = await Agent.create({
      apiKey: key,
      model: { id: 'composer-2.5' },
      cloud: {
        repos: [{ url: repo, startingRef: startingRef() }],
        autoCreatePR: true,
        skipReviewerRequest: true,
        metadata: {
          desk_slug: job.slug,
          desk_job_id: job.id,
          desk_kind: kind,
        },
      },
    })

    const text =
      kind === 'design' ? designPrompt(job) : refinePrompt(job, refineNote)
    const run = await agent.send({ text })
    const agentId = agent.agentId
    const runId = run.id
    const url = agentUrl(agentId)

    /* Cloud run lives on Cursor’s servers — don’t await wait() (Vercel timeout). */
    void run.wait().catch(() => {
      /* logged in Cursor dashboard */
    })

    try {
      const dispose = (agent as { [Symbol.asyncDispose]?: () => Promise<void> })[
        Symbol.asyncDispose
      ]
      if (dispose) await dispose.call(agent)
    } catch {
      /* ignore */
    }

    return { ok: true, agentId, runId, url }
  } catch (err) {
    const raw = err instanceof Error ? err.message : 'Cursor cloud kick failed'
    const scmHint =
      /SCM|repository|branch existence|access/i.test(raw)
        ? ` Grant the Cursor GitHub App access to ${repo} (cursor.com/dashboard → Integrations → GitHub → include this repo), then retry.`
        : ''
    if (err instanceof CursorAgentError) {
      return {
        ok: false,
        error: `Cursor cloud did not start: ${raw}.${scmHint}`,
      }
    }
    return {
      ok: false,
      error: `${raw}.${scmHint}`,
    }
  }
}

export function storybookLineForHost(): string {
  const hosted = Boolean(
    process.env.VERCEL ||
      process.env.NEXT_PUBLIC_VERCEL_ENV ||
      process.env.VERCEL_ENV,
  )
  if (hosted) return 'Lumen gallery: /lumen'
  return 'Lumen gallery: /lumen (hosted) · local tooling optional at :6006'
}
