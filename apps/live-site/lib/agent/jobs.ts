import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import type {
  AgentJob,
  AgentJobSurface,
  AgentMessage,
  AgentQuestion,
  CreateAgentJobInput,
} from '@/lib/agent/types'
import { asDesignRole } from '@/lib/agent/types'
import {
  inferRouteFromBrief,
  livePathForSlug,
  normalizePrototypeUrl,
  prototypePath,
} from '@/lib/agent/prototype-registry'
import {
  blobAppendFeedback,
  blobDeleteJob,
  blobGetJob,
  blobListJobs,
  blobPutAsset,
  blobPutJob,
  blobPutSpecFile,
  blobReadAsset,
  isBlobJobStoreEnabled,
} from '@/lib/agent/blob-job-store'
import {
  kickCursorCloudAgent,
  storybookLineForHost,
} from '@/lib/agent/cursor-cloud'

export type {
  AgentJob,
  AgentJobStatus,
  AgentJobSurface,
  CreateAgentJobInput,
} from '@/lib/agent/types'

function repoRoot(): string {
  const cwd = process.cwd()
  if (cwd.includes(`${path.sep}apps${path.sep}live-site`)) {
    return path.resolve(cwd, '../..')
  }
  return cwd
}

/** Vercel / Lambda — only `/tmp` is writable. */
function isServerlessFs(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
}

function liveSiteRoot(): string {
  const cwd = process.cwd()
  /* Deploy + `npm run` from apps/live-site — `public/` lives under cwd. */
  if (
    process.env.VERCEL ||
    cwd.endsWith(`${path.sep}live-site`) ||
    cwd.endsWith(`${path.sep}live-site${path.sep}`)
  ) {
    return cwd
  }
  return path.join(repoRoot(), 'apps', 'live-site')
}

/**
 * Specs / job.json root.
 * Local → `<repo>/specs`. Hosted → `/tmp/design-agent/specs` (read-only deploy FS).
 */
function specsRoot(): string {
  if (isServerlessFs()) {
    return path.join('/tmp', 'design-agent', 'specs')
  }
  return path.join(repoRoot(), 'specs')
}

function agentAssetDiskDir(
  kind: 'feedback' | 'references',
  slug: string,
): string {
  if (isServerlessFs()) {
    return path.join('/tmp', 'design-agent', kind, slug)
  }
  return path.join(liveSiteRoot(), 'public', 'design-agent', kind, slug)
}

function agentAssetUrl(
  kind: 'feedback' | 'references',
  slug: string,
  file: string,
): string {
  if (isServerlessFs()) {
    return `/api/agent/asset/${kind}/${encodeURIComponent(slug)}/${encodeURIComponent(file)}`
  }
  return `/design-agent/${kind}/${slug}/${file}`
}

/** Resolve a saved agent asset for the media API (serverless + local fallback). */
export async function readAgentAsset(
  kind: 'feedback' | 'references',
  slug: string,
  file: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (!slug || !file || file.includes('..') || file.includes('/') || file.includes('\\')) {
    return null
  }
  if (kind !== 'feedback' && kind !== 'references') return null
  const fromBlob = await blobReadAsset(kind, slug, file)
  if (fromBlob) return fromBlob
  const abs = path.join(agentAssetDiskDir(kind, slug), file)
  try {
    const buffer = await fs.readFile(abs)
    const lower = file.toLowerCase()
    const contentType = lower.endsWith('.png')
      ? 'image/png'
      : lower.endsWith('.webp')
        ? 'image/webp'
        : lower.endsWith('.gif')
          ? 'image/gif'
          : 'image/jpeg'
    return { buffer, contentType }
  } catch {
    return null
  }
}

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return base || 'initiative'
}

async function nextSlug(title: string): Promise<string> {
  const root = specsRoot()
  await fs.mkdir(root, { recursive: true })
  const entries = await fs.readdir(root).catch(() => [] as string[])
  const nums = entries
    .map((e) => /^(\d{3})-/.exec(e)?.[1])
    .filter(Boolean)
    .map((n) => Number(n))
  const next = String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0')
  return `${next}-${slugify(title)}`
}

function jobDir(slug: string): string {
  return path.join(specsRoot(), slug)
}

function jobPath(slug: string): string {
  return path.join(jobDir(slug), 'job.json')
}

function nowIso() {
  return new Date().toISOString()
}

/** Only ask what the agent cannot infer. Lumen reuse / breakpoints / error
 *  coverage are decided during build — ask then only if stuck. */
function seedDesignQuestions(surface: AgentJobSurface): AgentQuestion[] {
  const t = nowIso()
  return [
    {
      id: randomUUID(),
      agent: 'design',
      text: `Where does this live in ${surface}? Exact route or nav entry.`,
      createdAt: t,
    },
  ]
}

const DROP_QUESTION_MATCHERS = [
  /lumen components we must reuse/i,
  /mobile-first or desktop-first/i,
  /error \/ empty states/i,
]

function pruneUpfrontNoise(questions: AgentQuestion[]): AgentQuestion[] {
  return questions.filter(
    (q) => !DROP_QUESTION_MATCHERS.some((re) => re.test(q.text)) || Boolean(q.answer?.trim()),
  )
}

function seedMessages(title: string, questionText: string): AgentMessage[] {
  const t = nowIso()
  return [
    {
      id: randomUUID(),
      role: 'design',
      text: `Got “${title}”. One thing before SpecKit continues:`,
      createdAt: t,
    },
    {
      id: randomUUID(),
      role: 'design',
      text: `❓ ${questionText}\n\nReply here in chat (or the card above).`,
      createdAt: t,
    },
  ]
}

/** Progress lines streamed to chat while status === designing. */
const DESIGN_PIPELINE: string[] = [
  'Locked your route / nav answer.',
  'Reading BRD against current Promotions structure…',
  'SpecKit specify — drafting screens (lobby nav, races page, leaderboard)…',
  'Checking Lumen + chris-taste patterns for shelves / tables / VIP race panel…',
]

export function isDesignPipelineRunning(job: {
  status: string
  pipelineStep?: number
  artifacts?: { previewUrl?: string }
}): boolean {
  if (job.artifacts?.previewUrl) return false
  if (job.status !== 'designing') return false
  return (job.pipelineStep ?? 0) < DESIGN_PIPELINE.length
}

export function isDesignPipelinePaused(job: {
  status: string
  pipelineStep?: number
  artifacts?: { previewUrl?: string }
}): boolean {
  /* Legacy: old jobs paused before preview was wired. New flow publishes. */
  if (job.artifacts?.previewUrl) return false
  if (job.status !== 'designing') return false
  return (job.pipelineStep ?? 0) >= DESIGN_PIPELINE.length
}

/** Design-lane absolute URL on :3001 — never a :3000 demo product route. */
function resolvePreviewUrl(job: AgentJob): string {
  return prototypePath(job.slug)
}

/** Planned product route — only on :3000 after Chris says Merge (not Approve). */
function resolveLiveUrl(job: AgentJob): string {
  return livePathForSlug(job.slug) ?? `/promotions/${job.slug.replace(/^\d+-/, '')}`
}

async function writeSpecArtifacts(job: AgentJob): Promise<void> {
  const dir = jobDir(job.slug)
  await fs.mkdir(dir, { recursive: true })
  const routeAnswer =
    job.questions.find((q) => /route|nav/i.test(q.text))?.answer?.trim() ||
    'Races above Contests → /promotions/races'
  const previewUrl = resolvePreviewUrl(job)
  const specBody = [
    `# Feature Specification: ${job.title}`,
    '',
    `**Feature Branch**: \`${job.slug}\``,
    `**Created**: ${job.createdAt.slice(0, 10)}`,
    `**Status**: Design preview`,
    `**Surface**: ${job.surface}`,
    `**Input**: [brd.md](./brd.md)`,
    '',
    '## Clarifications',
    '',
    `- **Route / nav:** ${routeAnswer}`,
    '',
    '## Brief',
    '',
    job.brief.trim(),
    '',
    '## Preview',
    '',
    `- Desk iframe: \`${previewUrl}\``,
    '',
  ].join('\n')

  const specPath = path.join(dir, 'spec.md')
  const existing = await fs.readFile(specPath, 'utf8').catch(() => '')
  /* Don’t clobber a fuller hand-authored SpecKit spec. */
  if (!existing || existing.length < 400) {
    await fs.writeFile(specPath, specBody, 'utf8')
    if (isBlobJobStoreEnabled()) await blobPutSpecFile(job.slug, 'spec.md', specBody)
  }
  if (!job.artifacts.brdPath) {
    /* ensure brd exists for older jobs */
    const brdBody = [
      `# ${job.title}`,
      '',
      `Surface: ${job.surface}`,
      `Kind: ${job.kind}`,
      `Id: ${job.id}`,
      `Created: ${job.createdAt}`,
      '',
      '---',
      '',
      job.brief,
      '',
    ].join('\n')
    await fs.writeFile(path.join(dir, 'brd.md'), brdBody, 'utf8')
    if (isBlobJobStoreEnabled()) await blobPutSpecFile(job.slug, 'brd.md', brdBody)
  }
}

async function publishDesignPreview(job: AgentJob): Promise<AgentJob> {
  const previewUrl = resolvePreviewUrl(job)
  await writeSpecArtifacts(job)

  const liveUrl = resolveLiveUrl(job)
  const msg: AgentMessage = {
    id: randomUUID(),
    role: 'design',
    text: [
      `Prototype URL (not demo): ${previewUrl}`,
      `Planned demo route (Merge only — not Approve): ${liveUrl}`,
      '',
      'Wrote:',
      `• specs/${job.slug}/brd.md`,
      `• specs/${job.slug}/spec.md`,
      '',
      'Refine on the prototype URL — paste screenshots in chat.',
      storybookLineForHost(),
      'Request Chris sign-off when happy — packaging waits for Final sign-off.',
    ].join('\n'),
    createdAt: nowIso(),
  }

  return writeJob({
    ...job,
    status: 'preview_ready',
    pipelineStep: DESIGN_PIPELINE.length,
    note: 'Prototype ready — not on demo nav. Refine, then Approve.',
    artifacts: {
      ...job.artifacts,
      brdPath: job.artifacts.brdPath ?? `specs/${job.slug}/brd.md`,
      specPath: `specs/${job.slug}`,
      previewUrl,
      liveUrl,
    },
    screens: [
      {
        id: randomUUID(),
        label: 'Prototype',
        src: previewUrl,
        note: 'Design lane — not demo product',
      },
    ],
    messages: [...job.messages, msg],
  })
}

function replyToChat(job: AgentJob, userText: string): string {
  const askingStatus =
    /what.?s happ|whats happ|status|hung|stuck|progress|doing|code|wired|build|running|loading|prototype|preview|paused|files|brd|spec/i.test(
      userText,
    )

  if (job.artifacts.previewUrl) {
    if (askingStatus) {
      return [
        `Preview is up: ${job.artifacts.previewUrl}`,
        '',
        `Files: specs/${job.slug}/brd.md + spec.md (repo root).`,
        'Refine step: paste/attach screenshots + write what’s wrong in chat.',
        storybookLineForHost(),
        'Approve when the preview looks right.',
      ].join('\n')
    }
    return [
      'Got it — logged as design feedback.',
      'Keep dropping screenshots + notes in chat until it looks right, then Approve.',
      `Preview: ${job.artifacts.previewUrl}`,
    ].join('\n')
  }

  if (isDesignPipelineRunning(job)) {
    const step = job.pipelineStep ?? 0
    return `Design prep ${step + 1}/${DESIGN_PIPELINE.length} — then preview publishes. Watch the … lines.`
  }

  if (isDesignPipelinePaused(job) || (askingStatus && job.status === 'designing')) {
    return 'Finishing SpecKit write + preview publish on the next poll — refresh if the iframe is still empty.'
  }

  if (job.status === 'speccing') {
    return 'Waiting on your design answer in this chat before SpecKit continues.'
  }

  return `Status: ${job.status.replace(/_/g, ' ')}. ${job.note}`
}

export async function advanceDesignPipeline(
  idOrSlug: string,
): Promise<AgentJob | null> {
  const job = await getAgentJob(idOrSlug)
  if (!job) return null
  if (job.artifacts.previewUrl) return job
  if (job.status !== 'designing') return job

  const step = job.pipelineStep ?? 0

  /* Checklist done (or legacy paused) → write specs + ship preview URL. */
  if (step >= DESIGN_PIPELINE.length) {
    return publishDesignPreview(job)
  }

  const line = DESIGN_PIPELINE[step]!
  const already = (job.messages ?? []).some(
    (m) =>
      m.role === 'design' &&
      (m.text === line || m.text === `… ${line}` || m.text.endsWith(line)),
  )
  if (already) {
    const nextStep = step + 1
    if (nextStep >= DESIGN_PIPELINE.length) {
      return publishDesignPreview({ ...job, pipelineStep: nextStep })
    }
    return writeJob({ ...job, pipelineStep: nextStep })
  }

  const msg: AgentMessage = {
    id: randomUUID(),
    role: 'design',
    text: `… ${line}`,
    createdAt: nowIso(),
  }

  const nextStep = step + 1
  const withMsg = {
    ...job,
    pipelineStep: nextStep,
    note: `Design prep ${nextStep}/${DESIGN_PIPELINE.length}`,
    messages: [...job.messages, msg],
  }

  if (nextStep >= DESIGN_PIPELINE.length) {
    return publishDesignPreview(withMsg)
  }

  return writeJob(withMsg)
}

function normalizeJob(raw: AgentJob): { job: AgentJob; dirty: boolean } {
  const questions = raw.questions ?? []
  const messages = raw.messages ?? []
  const screens = raw.screens ?? []
  // Older jobs from Phase 0 stub — seed desk fields once when empty.
  if (questions.length === 0 && messages.length === 0) {
    return {
      dirty: true,
      job: {
        ...raw,
        questions: seedDesignQuestions(raw.surface ?? 'Other'),
        messages: seedMessages(
          raw.title,
          seedDesignQuestions(raw.surface ?? 'Other')[0]?.text ??
            'Where does this live?',
        ),
        screens:
          screens.length > 0
            ? screens
            : [
                {
                  id: randomUUID(),
                  label: 'Build',
                  note: 'Screens appear here once the prototype branch deploys.',
                },
              ],
        artifacts: raw.artifacts ?? {},
        status: raw.status === 'received' ? 'speccing' : raw.status,
        note:
          raw.note?.includes('not wired')
            ? 'Waiting on your design answers before SpecKit continues.'
            : raw.note,
      },
    }
  }
  const mappedQuestions = pruneUpfrontNoise(
    questions.map((q) => ({
      ...q,
      agent: asDesignRole(String(q.agent)),
    })),
  )
  const mappedMessages = messages.map((m) => ({
    ...m,
    role: asDesignRole(String(m.role)),
  }))
  const dirtyRoles =
    mappedQuestions.length !== questions.length ||
    mappedQuestions.some((q, i) => q.agent !== questions[i]?.agent) ||
    mappedMessages.some((m, i) => m.role !== messages[i]?.role)

  const artifacts = { ...(raw.artifacts ?? {}) }
  let dirtyArtifacts = false
  let dirtyRoute = false
  let nextStatus = raw.status
  let nextNote = raw.note
  let nextPipeline = raw.pipelineStep
  let nextMessages = mappedMessages

  if (
    (raw.status === 'ready_for_dev' || artifacts.devDeliveryPath) &&
    (!artifacts.packageFiles || artifacts.packageFiles.length === 0)
  ) {
    artifacts.packageFiles = packageFileList(raw.slug)
    artifacts.devDeliveryPath =
      artifacts.devDeliveryPath ?? `specs/${raw.slug}/dev-delivery.md`
    dirtyArtifacts = true
  }

  /* BRD already said where (e.g. VIP Hub) — stop blocking on “Where does this live?” */
  const whereQ = mappedQuestions.find(
    (q) => /where does this live/i.test(q.text) && !q.answer?.trim(),
  )
  if (whereQ) {
    const inferred = inferRouteFromBrief(raw.title, raw.brief, raw.surface)
    if (inferred) {
      whereQ.answer = inferred
      dirtyRoute = true
      if (raw.status === 'speccing' || raw.status === 'received') {
        nextStatus = 'designing'
        nextPipeline = 0
        nextNote = 'Designing — watch the prep loader, then preview.'
        nextMessages = [
          ...mappedMessages,
          {
            id: randomUUID(),
            role: 'design',
            text: `Route from your BRD: **${inferred}** — designing the mock…`,
            createdAt: nowIso(),
          },
        ]
      }
    }
  }

  /* Hosted desk must never iframe 127.0.0.1 — rewrite to same-origin /prototype. */
  if (
    artifacts.previewUrl ||
    raw.status === 'preview_ready' ||
    raw.status === 'needs_review' ||
    raw.status === 'awaiting_signoff' ||
    raw.status === 'approved' ||
    raw.status === 'ready_for_dev'
  ) {
    const nextPreview = normalizePrototypeUrl(raw.slug, artifacts.previewUrl)
    if (nextPreview !== artifacts.previewUrl) {
      artifacts.previewUrl = nextPreview
      dirtyArtifacts = true
    }
  }

  const nextScreens = screens.map((s) => {
    if (!s.src) return s
    if (
      s.src.includes('127.0.0.1') ||
      s.src.includes('localhost') ||
      s.src.includes('/prototype/')
    ) {
      return { ...s, src: normalizePrototypeUrl(raw.slug, s.src) }
    }
    return s
  })

  return {
    dirty: dirtyRoles || dirtyArtifacts || dirtyRoute,
    job: {
      ...raw,
      status: nextStatus,
      pipelineStep: nextPipeline,
      questions: mappedQuestions,
      messages: nextMessages,
      screens: nextScreens,
      artifacts,
      note:
        mappedQuestions.filter((q) => !q.answer?.trim()).length === 0 &&
        raw.note?.includes('Waiting on your design answers')
          ? 'Design answers locked. SpecKit design run next.'
          : nextNote,
    },
  }
}

export async function createAgentJob(input: CreateAgentJobInput): Promise<AgentJob> {
  const title = input.title.trim()
  const brief = input.brief.trim()
  if (!title) throw new Error('Title is required')
  if (!brief) throw new Error('BRD is required')

  const slug = await nextSlug(title)
  const dir = jobDir(slug)
  await fs.mkdir(dir, { recursive: true })

  const refUrls: string[] = []
  const refs = input.referenceImages ?? []
  if (refs.length > 0) {
    const assetDir = agentAssetDiskDir('references', slug)
    await fs.mkdir(assetDir, { recursive: true })
    for (const img of refs.slice(0, 12)) {
      const id = randomUUID()
      const ext = extForMime(img.mime || 'image/png')
      const file = `${id}.${ext}`
      await fs.writeFile(path.join(assetDir, file), img.buffer)
      if (isBlobJobStoreEnabled()) {
        refUrls.push(
          await blobPutAsset(
            'references',
            slug,
            file,
            img.buffer,
            img.mime || 'image/png',
          ),
        )
      } else {
        refUrls.push(agentAssetUrl('references', slug, file))
      }
    }
  }

  const surface = input.surface ?? 'Other'
  const now = nowIso()
  const inferredRoute = inferRouteFromBrief(title, brief, surface)
  const routeQ = seedDesignQuestions(surface)[0]!
  const questions: AgentQuestion[] = inferredRoute
    ? [{ ...routeQ, answer: inferredRoute }]
    : [routeQ]
  const briefWithRefs =
    refUrls.length > 0
      ? `${brief}\n\n## Reference screenshots\n${refUrls.map((u) => `- ${u}`).join('\n')}`
      : brief

  const messages: AgentMessage[] = inferredRoute
    ? [
        {
          id: randomUUID(),
          role: 'design',
          text: [
            `Got “${title}”.`,
            `Route from your BRD: **${inferredRoute}** — not asking again.`,
            'Designing the mock…',
          ].join('\n'),
          createdAt: now,
        },
      ]
    : seedMessages(title, questions[0]?.text ?? 'Where does this live?')

  if (refUrls.length > 0) {
    messages.push({
      id: randomUUID(),
      role: 'you',
      text: `Attached ${refUrls.length} reference screenshot${refUrls.length === 1 ? '' : 's'}.`,
      createdAt: now,
      images: refUrls,
    })
  }

  const job: AgentJob = {
    id: randomUUID(),
    slug,
    title,
    surface,
    kind: input.kind ?? 'feature',
    brief: briefWithRefs,
    status: inferredRoute ? 'designing' : 'speccing',
    createdAt: now,
    updatedAt: now,
    note: inferredRoute
      ? 'Designing — watch the prep loader, then preview.'
      : 'Answer the design question in chat to unlock the next stage.',
    sourceFile: input.sourceFile,
    artifacts: {
      brdPath: `specs/${slug}/brd.md`,
      specPath: `specs/${slug}`,
    },
    questions,
    messages,
    pipelineStep: inferredRoute ? 0 : undefined,
    screens: [
      {
        id: randomUUID(),
        label: 'Build',
        note: 'Screens appear here once the prototype branch deploys.',
      },
    ],
  }

  const brdBody = [
    `# ${title}`,
    '',
    `Surface: ${job.surface}`,
    `Kind: ${job.kind}`,
    `Id: ${job.id}`,
    `Created: ${now}`,
    input.sourceFile ? `Source: ${input.sourceFile}` : null,
    '',
    '---',
    '',
    briefWithRefs,
    '',
  ]
    .filter((line) => line !== null)
    .join('\n')

  await fs.writeFile(path.join(dir, 'brd.md'), brdBody, 'utf8')
  await fs.writeFile(jobPath(slug), JSON.stringify(job, null, 2), 'utf8')
  if (isBlobJobStoreEnabled()) {
    await blobPutJob(job)
    await blobPutSpecFile(slug, 'brd.md', brdBody)
  }

  if (job.status === 'designing') {
    return attachCloudKick(job, 'design')
  }
  return job
}

async function attachCloudKick(
  job: AgentJob,
  kind: 'design' | 'refine',
  refineNote = '',
): Promise<AgentJob> {
  const kick = await kickCursorCloudAgent(job, kind, refineNote)
  const stamp = nowIso()
  const design: AgentMessage = {
    id: randomUUID(),
    role: 'design',
    text: kick.ok
      ? [
          kind === 'design'
            ? 'Cloud Design agent started — building in Cursor.'
            : 'Cloud Design agent started — applying your feedback.',
          kick.url ? `Track: ${kick.url}` : `Agent: ${kick.agentId}`,
          'Preview will update when the PR lands / you refresh after the agent ships.',
        ].join('\n')
      : [
          kind === 'design'
            ? 'Could not start the cloud Design agent.'
            : 'Could not start a cloud refine agent.',
          kick.error ?? 'Unknown error',
          'Fix CURSOR_API_KEY / CURSOR_CLOUD_REPO on the host, or apply in Cursor chat.',
        ].join('\n'),
    createdAt: stamp,
  }
  return writeJob({
    ...job,
    note: kick.ok
      ? kind === 'design'
        ? 'Cloud agent building — watch Cursor + the design loader.'
        : 'Cloud agent applying refine feedback.'
      : job.note,
    artifacts: {
      ...job.artifacts,
      cursorAgentId: kick.agentId ?? job.artifacts.cursorAgentId,
      cursorAgentUrl: kick.url ?? job.artifacts.cursorAgentUrl,
      cursorKickError: kick.ok ? undefined : kick.error,
    },
    messages: [...job.messages, design],
  })
}

export async function listAgentJobs(): Promise<AgentJob[]> {
  const bySlug = new Map<string, AgentJob>()

  if (isBlobJobStoreEnabled()) {
    for (const raw of await blobListJobs()) {
      const { job, dirty } = normalizeJob(raw)
      bySlug.set(job.slug, job)
      if (dirty) await writeJob(job)
    }
  }

  const root = specsRoot()
  const entries = await fs.readdir(root).catch(() => [] as string[])
  for (const entry of entries) {
    try {
      const raw = await fs.readFile(path.join(root, entry, 'job.json'), 'utf8')
      const { job, dirty } = normalizeJob(JSON.parse(raw) as AgentJob)
      const existing = bySlug.get(job.slug)
      if (!existing || job.updatedAt >= existing.updatedAt) {
        bySlug.set(job.slug, job)
      }
      if (dirty) await writeJob(job)
    } catch {
      /* skip */
    }
  }
  return [...bySlug.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
}

export async function getAgentJob(idOrSlug: string): Promise<AgentJob | null> {
  if (isBlobJobStoreEnabled() && !idOrSlug.includes('/')) {
    const fromBlob = await blobGetJob(idOrSlug)
    if (fromBlob) {
      const { job, dirty } = normalizeJob(fromBlob)
      if (dirty) return writeJob(job)
      return job
    }
  }
  const jobs = await listAgentJobs()
  return jobs.find((j) => j.id === idOrSlug || j.slug === idOrSlug) ?? null
}

async function writeJob(job: AgentJob): Promise<AgentJob> {
  const next = { ...job, updatedAt: nowIso() }
  await fs.mkdir(jobDir(next.slug), { recursive: true })
  await fs.writeFile(jobPath(next.slug), JSON.stringify(next, null, 2), 'utf8')
  if (isBlobJobStoreEnabled()) {
    await blobPutJob(next)
  }
  return next
}

export async function updateAgentJob(
  idOrSlug: string,
  patch: Partial<
    Pick<AgentJob, 'status' | 'note' | 'artifacts' | 'questions' | 'messages' | 'screens'>
  >,
): Promise<AgentJob | null> {
  const job = await getAgentJob(idOrSlug)
  if (!job) return null
  return writeJob({
    ...job,
    ...patch,
    artifacts: { ...job.artifacts, ...patch.artifacts },
    questions: patch.questions ?? job.questions,
    messages: patch.messages ?? job.messages,
    screens: patch.screens ?? job.screens,
  })
}

export async function answerQuestion(
  idOrSlug: string,
  questionId: string,
  answer: string,
): Promise<AgentJob | null> {
  const job = await getAgentJob(idOrSlug)
  if (!job) return null
  const trimmed = answer.trim()
  if (!trimmed) throw new Error('Answer is required')

  const questions = job.questions.map((q) =>
    q.id === questionId ? { ...q, answer: trimmed } : q,
  )
  const open = questions.filter((q) => !q.answer?.trim()).length
  const reply: AgentMessage = {
    id: randomUUID(),
    role: 'you',
    text: trimmed,
    createdAt: nowIso(),
  }
  const ack: AgentMessage = {
    id: randomUUID(),
    role: 'design',
    text:
      open === 0
        ? 'Got it. Starting SpecKit design run — progress will stream here.'
        : `${open} design question${open === 1 ? '' : 's'} still open — answer in this chat.`,
    createdAt: nowIso(),
  }

  const next = await writeJob({
    ...job,
    questions,
    messages: [...job.messages, reply, ack],
    status: open === 0 ? 'designing' : 'speccing',
    pipelineStep: open === 0 ? 0 : job.pipelineStep ?? 0,
    note:
      open === 0
        ? 'Designing — watch the chat for progress.'
        : `Waiting on ${open} design answer${open === 1 ? '' : 's'} in chat.`,
  })
  if (open === 0) return attachCloudKick(next, 'design')
  return next
}

function extForMime(mime: string): string {
  if (mime.includes('png')) return 'png'
  if (mime.includes('webp')) return 'webp'
  if (mime.includes('gif')) return 'gif'
  return 'jpg'
}

export type FeedbackImageInput = {
  buffer: Buffer
  mime: string
  name?: string
}

/** Refine step — text and/or screenshots while preview is up. */
export async function postFeedback(
  idOrSlug: string,
  text: string,
  images: FeedbackImageInput[] = [],
): Promise<AgentJob | null> {
  const job = await getAgentJob(idOrSlug)
  if (!job) return null
  const trimmed = text.trim()
  if (!trimmed && images.length === 0) {
    throw new Error('Add a note or at least one screenshot')
  }

  const pending = job.questions.filter((q) => !q.answer?.trim())
  if (pending[0] && trimmed && images.length === 0) {
    return answerQuestion(idOrSlug, pending[0].id, trimmed)
  }

  const savedUrls: string[] = []
  if (images.length > 0) {
    const dir = agentAssetDiskDir('feedback', job.slug)
    await fs.mkdir(dir, { recursive: true })
    for (const img of images.slice(0, 8)) {
      const id = randomUUID()
      const ext = extForMime(img.mime || 'image/png')
      const file = `${id}.${ext}`
      await fs.writeFile(path.join(dir, file), img.buffer)
      if (isBlobJobStoreEnabled()) {
        savedUrls.push(
          await blobPutAsset(
            'feedback',
            job.slug,
            file,
            img.buffer,
            img.mime || 'image/png',
          ),
        )
      } else {
        savedUrls.push(agentAssetUrl('feedback', job.slug, file))
      }
    }
  }

  const feedbackLog = path.join(jobDir(job.slug), 'feedback.md')
  const stamp = nowIso()
  const logBlock = [
    '',
    `## ${stamp}`,
    trimmed || '(screenshot only)',
    ...savedUrls.map((u) => `- ${u}`),
    '',
  ].join('\n')
  await fs.mkdir(jobDir(job.slug), { recursive: true })
  await fs.appendFile(feedbackLog, logBlock, 'utf8').catch(async () => {
    await fs.writeFile(feedbackLog, logBlock, 'utf8')
  })
  if (isBlobJobStoreEnabled()) {
    await blobAppendFeedback(job.slug, logBlock)
  }

  const you: AgentMessage = {
    id: randomUUID(),
    role: 'you',
    text: trimmed || '(screenshot)',
    createdAt: stamp,
    images: savedUrls.length ? savedUrls : undefined,
  }

  const screenAdds: AgentJob['screens'] = savedUrls.map((src, i) => ({
    id: randomUUID(),
    label: `Issue ${i + 1}`,
    src,
    note: trimmed || 'Screenshot feedback',
  }))

  const locked =
    job.status === 'awaiting_signoff' ||
    job.status === 'approved' ||
    job.status === 'ready_for_dev' ||
    job.status === 'live'

  const logged: AgentJob = {
    ...job,
    status: job.artifacts.previewUrl && !locked ? 'needs_review' : job.status,
    note: trimmed
      ? `Refine: ${trimmed.slice(0, 100)}${trimmed.length > 100 ? '…' : ''}`
      : `Refine: ${savedUrls.length} screenshot${savedUrls.length === 1 ? '' : 's'}`,
    messages: [
      ...job.messages,
      you,
      {
        id: randomUUID(),
        role: 'design',
        text: [
          savedUrls.length
            ? `Logged ${savedUrls.length} screenshot${savedUrls.length === 1 ? '' : 's'}${trimmed ? ' + notes' : ''}.`
            : 'Logged your notes.',
          'Starting cloud Design agent to apply this…',
          storybookLineForHost(),
        ].join('\n'),
        createdAt: stamp,
      },
    ],
    screens: [...(job.screens ?? []), ...screenAdds],
  }

  const written = await writeJob(logged)
  return attachCloudKick(
    written,
    'refine',
    trimmed || `(${savedUrls.length} screenshot${savedUrls.length === 1 ? '' : 's'})`,
  )
}

export async function postMessage(
  idOrSlug: string,
  text: string,
  images: FeedbackImageInput[] = [],
): Promise<AgentJob | null> {
  const job = await getAgentJob(idOrSlug)
  if (!job) return null
  const trimmed = text.trim()
  if (!trimmed && images.length === 0) throw new Error('Message is required')

  const pending = job.questions.filter((q) => !q.answer?.trim())
  if (pending[0] && trimmed && images.length === 0) {
    return answerQuestion(idOrSlug, pending[0].id, trimmed)
  }

  /* Preview up → every chat note/screenshot is refine feedback. */
  if (job.artifacts.previewUrl || images.length > 0) {
    return postFeedback(idOrSlug, trimmed, images)
  }

  const you: AgentMessage = {
    id: randomUUID(),
    role: 'you',
    text: trimmed,
    createdAt: nowIso(),
  }
  const design: AgentMessage = {
    id: randomUUID(),
    role: 'design',
    text: replyToChat(job, trimmed),
    createdAt: nowIso(),
  }

  return writeJob({
    ...job,
    messages: [...job.messages, you, design],
  })
}

export async function deleteAgentJob(idOrSlug: string): Promise<boolean> {
  const job = await getAgentJob(idOrSlug)
  if (!job) return false
  const dir = jobDir(job.slug)
  await fs.rm(dir, { recursive: true, force: true })
  if (isBlobJobStoreEnabled()) await blobDeleteJob(job.slug)
  return true
}

/** Progress lines after Approve — streamed on desk poll like design prep. */
const PACKAGING_PIPELINE: string[] = [
  'Collecting signed-off preview URL + feedback log…',
  'Mapping Lumen / shell pieces used on this screen…',
  'Drafting acceptance checks from spec.md…',
  'Writing specs/…/dev-delivery.md for the next agent…',
]

export function isPackagingRunning(job: {
  status: string
  packagingStep?: number
  artifacts?: { devDeliveryPath?: string }
}): boolean {
  if (job.artifacts?.devDeliveryPath) return false
  if (job.status !== 'approved') return false
  return true
}

function lumenMapForJob(job: AgentJob): {
  components: string[]
  tokens: string[]
  motion: string[]
  notes: string
} {
  const race = /race/i.test(job.slug + job.title)
  const sharedMotion = [
    'Row / list hover: `hover:!bg-surface-muted-3` (whisper — not heavy stripes)',
    'Soft-nav: `startNavigating` + `TileSpinner` before route unmount',
    'Countdown / NumberFlow: respect existing timers; no custom tick invent',
    'Sheet / drawer close: `rounded-lg` + `hover:bg-accent`',
    'Mobile carousels: swipe only — no edge chevrons on touch',
  ]
  if (race || job.surface === 'Promotions') {
    return {
      components: [
        '`DailyRacesPage` → `apps/live-site/components/lumen/daily-races-page.tsx`',
        '`DailyRacesPanel` (status + leaderboard) — also VIP Hub',
        '`ShellFrame` + promotions product nav',
        '`Typography`, `Button`, `LoyaltyInfoTip`',
        'Table pager pattern (shared with RAF / My Bonus)',
      ],
      tokens: [
        '`bg-background`, `bg-card`, `bg-secondary`, `bg-popover`',
        '`border-border`, `border-input`',
        '`text-foreground`, `text-muted-foreground`',
        '`rounded-[10px]` content cards + `hover:!bg-surface-muted-3` rows',
        'VIP metal colors via `VIP_LEVEL_COLOR` (Gold / Silver / Bronze crests)',
      ],
      motion: [
        ...sharedMotion,
        'Leaderboard “you” row: same hover as other rows; keep sticky you-row if already in panel',
        'Status card countdown: live tick from panel seed — match VIP Hub Daily Races panel',
      ],
      notes:
        'Reuse existing Daily Races panel — do not invent a parallel leaderboard. Prototype only on :3001 until Chris says Merge.',
    }
  }
  return {
    components: ['Map to existing Lumen / shell neighbors for this surface.'],
    tokens: ['`bg-card`, `border-border`, `text-muted-foreground`, `primary`'],
    motion: sharedMotion,
    notes: 'Fill during refine if new primitives are required (Lumen gallery first).',
  }
}

async function writeDevDelivery(job: AgentJob): Promise<string> {
  const dir = jobDir(job.slug)
  await fs.mkdir(dir, { recursive: true })
  const routeAnswer =
    job.questions.find((q) => /route|nav/i.test(q.text))?.answer?.trim() || '—'
  const feedback = await fs
    .readFile(path.join(dir, 'feedback.md'), 'utf8')
    .catch(() => '')
  const map = lumenMapForJob(job)
  const preview = job.artifacts.previewUrl ?? resolvePreviewUrl(job)
  const plannedLive = job.artifacts.liveUrl ?? resolveLiveUrl(job)
  const body = [
    `# Dev delivery — ${job.title}`,
    '',
    `**Slug:** \`${job.slug}\``,
    `**Surface:** ${job.surface}`,
    `**Signed off:** ${nowIso()}`,
    '',
    '## Prototype (required for dev)',
    '',
    `Open / device-test this first — **not** demo \`:3000\` until Chris says Merge:`,
    '',
    `\`${preview}\``,
    '',
    `_Start lane: \`npm run dev:3001\` in \`apps/live-site\`._`,
    '',
    '## Intent',
    '',
    job.brief.trim(),
    '',
    '## Nav / route',
    '',
    routeAnswer,
    '',
    `Planned demo path after **Merge** (not Approve): \`${plannedLive}\``,
    '',
    '## Lumen components',
    '',
    ...map.components.map((c) => `- ${c}`),
    '',
    '## Tokens',
    '',
    ...map.tokens.map((t) => `- ${t}`),
    '',
    '## Motion / hover / transitions',
    '',
    ...map.motion.map((m) => `- ${m}`),
    '',
    `_${map.notes}_`,
    '',
    '## Artifacts',
    '',
    `- BRD: \`specs/${job.slug}/brd.md\``,
    `- Spec: \`specs/${job.slug}/spec.md\``,
    `- Lumen map: \`specs/${job.slug}/lumen-map.md\``,
    `- Feedback: \`specs/${job.slug}/feedback.md\``,
    `- **Prototype URL:** \`${preview}\``,
    '',
    '## Refine log (taste notes)',
    '',
    feedback.trim() || '_No screenshot feedback logged._',
    '',
    '## Handoff',
    '',
    'Dev agents implement from this package **and** the prototype URL above (match motion / hover / tokens).',
    'If Chris hits **Back to refine**, treat package as draft until Approve again.',
    '',
  ].join('\n')

  const lumenMapBody = [
    `# Lumen map — ${job.title}`,
    '',
    '## Prototype',
    '',
    `\`${preview}\``,
    '',
    '## Components',
    '',
    ...map.components.map((c) => `- ${c}`),
    '',
    '## Tokens',
    '',
    ...map.tokens.map((t) => `- ${t}`),
    '',
    '## Motion / hover / transitions',
    '',
    ...map.motion.map((m) => `- ${m}`),
    '',
    map.notes,
    '',
    'Lumen gallery: `/lumen` (hosted). Local DS tooling optional at `:6006`.',
    '',
  ].join('\n')

  const rel = `specs/${job.slug}/dev-delivery.md`
  await fs.writeFile(path.join(dir, 'dev-delivery.md'), body, 'utf8')
  await fs.writeFile(path.join(dir, 'lumen-map.md'), lumenMapBody, 'utf8')
  return rel
}

export function packageFileList(slug: string): string[] {
  return [
    `specs/${slug}/dev-delivery.md`,
    `specs/${slug}/lumen-map.md`,
    `specs/${slug}/brd.md`,
    `specs/${slug}/spec.md`,
    `specs/${slug}/feedback.md`,
    `specs/${slug}/job.json`,
  ]
}

export async function readJobPackageFile(
  idOrSlug: string,
  fileName: string,
): Promise<{ path: string; content: string } | null> {
  const job = await getAgentJob(idOrSlug)
  if (!job) return null
  const safe = path.basename(fileName)
  if (!safe || safe.includes('..')) return null
  const full = path.join(jobDir(job.slug), safe)
  const content = await fs.readFile(full, 'utf8').catch(() => null)
  if (content === null) return null
  return { path: `specs/${job.slug}/${safe}`, content }
}

export async function advancePackagingPipeline(
  idOrSlug: string,
): Promise<AgentJob | null> {
  const job = await getAgentJob(idOrSlug)
  if (!job) return null
  if (job.artifacts.devDeliveryPath) {
    return job.status === 'ready_for_dev'
      ? job
      : writeJob({ ...job, status: 'ready_for_dev' })
  }
  if (job.status !== 'approved') return job

  const step = job.packagingStep ?? 0
  const runId = job.packagingRunId ?? 'pack'

  if (step >= PACKAGING_PIPELINE.length) {
    const deliveryPath = await writeDevDelivery(job)
    const files = packageFileList(job.slug)
    const liveUrl = job.artifacts.liveUrl ?? resolveLiveUrl(job)
    return writeJob({
      ...job,
      status: 'ready_for_dev',
      packagingStep: PACKAGING_PIPELINE.length,
      note: `Handoff ready — Preview first. Demo on :3000 only after Merge (${liveUrl}).`,
      artifacts: {
        ...job.artifacts,
        devDeliveryPath: deliveryPath,
        packageFiles: files,
        brdPath: job.artifacts.brdPath ?? `specs/${job.slug}/brd.md`,
        specPath: job.artifacts.specPath ?? `specs/${job.slug}`,
        liveUrl,
        /* Keep prototype URL for history; live is the demo site path. */
        previewUrl: job.artifacts.previewUrl ?? resolvePreviewUrl(job),
      },
      messages: [
        ...job.messages,
        {
          id: randomUUID(),
          role: 'design',
          text: [
            'Handoff ready — Design Agent is done.',
            '',
            `Prototype (design lane): ${job.artifacts.previewUrl ?? resolvePreviewUrl(job)}`,
            `Demo (:3000) only after Chris says Merge: ${liveUrl}`,
            '',
            'Package (repo root):',
            ...files.map((f) => `• ${f}`),
            '',
            'Open the Package tab — View opens a modal. Hand the folder to Cursor / a dev agent.',
          ].join('\n'),
          createdAt: nowIso(),
        },
      ],
    })
  }

  const line = PACKAGING_PIPELINE[step]!
  const text = `… ${line}`
  /* Only dedupe against messages after the latest Approve sign-off. */
  const signOff = [...(job.messages ?? [])]
    .reverse()
    .find(
      (m) =>
        m.role === 'design' &&
        m.text.includes('Packaging the dev delivery — watch the … lines'),
    )
  const afterSignOff = signOff
    ? (job.messages ?? []).filter((m) => m.createdAt >= signOff.createdAt)
    : []
  const posted = afterSignOff.some((m) => m.role === 'design' && m.text === text)

  if (posted) {
    return writeJob({
      ...job,
      packagingStep: step + 1,
      packagingRunId: runId,
      note: `Packaging ${step + 1}/${PACKAGING_PIPELINE.length} — watch … lines`,
    })
  }

  return writeJob({
    ...job,
    packagingStep: step + 1,
    packagingRunId: runId,
    note: `Packaging ${step + 1}/${PACKAGING_PIPELINE.length} — watch … lines`,
    messages: [
      ...job.messages,
      {
        id: randomUUID(),
        role: 'design',
        text,
        createdAt: nowIso(),
      },
    ],
  })
}

/**
 * Chris not happy after package — reopen refine without wiping the prototype.
 * Keeps package files; status → needs_review so chat feedback + Approve work again.
 */
export async function reopenForRefine(idOrSlug: string): Promise<AgentJob | null> {
  const job = await getAgentJob(idOrSlug)
  if (!job) return null
  if (!job.artifacts.previewUrl) {
    return writeJob({
      ...job,
      note: 'No prototype yet — finish design preview before refine.',
    })
  }
  const stamp = nowIso()
  const design: AgentMessage = {
    id: randomUUID(),
    role: 'design',
    text: [
      'Back to refine — package stays in specs/ as draft.',
      'Paste/attach what’s wrong in chat, then tell Cursor to apply.',
      `Prototype: ${job.artifacts.previewUrl}`,
      'When happy: Request Chris sign-off (requester) → Chris Final sign-off packages.',
      'Demo still only after Merge.',
    ].join('\n'),
    createdAt: stamp,
  }
  return writeJob({
    ...job,
    status: 'needs_review',
    note: 'Refine reopened — preview first; then request Chris sign-off again.',
    packagingStep: undefined,
    messages: [...job.messages, design],
    updatedAt: stamp,
  })
}

/**
 * Requester / designer / PM liked the preview — alerts Chris.
 * Does **not** package for dev.
 */
export async function requestSignOff(idOrSlug: string): Promise<AgentJob | null> {
  const job = await getAgentJob(idOrSlug)
  if (!job) return null
  const open = job.questions.filter((q) => !q.answer?.trim()).length
  if (open > 0) {
    return writeJob({
      ...job,
      note: `Still ${open} open design question${open === 1 ? '' : 's'} — answer in chat first.`,
    })
  }
  if (!job.artifacts.previewUrl) {
    return writeJob({
      ...job,
      note: 'Nothing to request yet — wait for the prototype URL.',
    })
  }
  if (job.status === 'awaiting_signoff') {
    return writeJob({
      ...job,
      note: 'Already waiting on Chris’s final sign-off.',
    })
  }
  if (job.status === 'ready_for_dev' || job.artifacts.devDeliveryPath) {
    return writeJob({
      ...job,
      status: 'ready_for_dev',
      note: 'Already packaged — handoff ready.',
    })
  }
  const stamp = nowIso()
  return writeJob({
    ...job,
    status: 'awaiting_signoff',
    note: 'Waiting on Chris final sign-off — not packaged for dev yet.',
    messages: [
      ...job.messages,
      {
        id: randomUUID(),
        role: 'you',
        text: 'Requested Chris sign-off.',
        createdAt: stamp,
      },
      {
        id: randomUUID(),
        role: 'design',
        text: [
          'Requester likes this preview.',
          'Chris: open Account as Owner → Final sign-off to package for dev.',
          'Until then nothing goes to the requester as a delivery package.',
          `Prototype: ${job.artifacts.previewUrl}`,
        ].join('\n'),
        createdAt: stamp,
      },
    ],
  })
}

/** Chris final sign-off → packaging → ready_for_dev. */
export async function finalizeSignOff(idOrSlug: string): Promise<AgentJob | null> {
  const job = await getAgentJob(idOrSlug)
  if (!job) return null
  if (!job.artifacts.previewUrl) {
    return writeJob({
      ...job,
      note: 'No prototype — can’t sign off.',
    })
  }
  if (job.artifacts.devDeliveryPath && job.status === 'ready_for_dev') {
    return writeJob({
      ...job,
      note: 'Already packaged — handoff ready.',
    })
  }
  const stamp = nowIso()
  return writeJob({
    ...job,
    status: 'approved',
    packagingStep: 0,
    packagingRunId: randomUUID().slice(0, 8),
    note: 'Chris signed off — packaging for the requester / dev.',
    artifacts: {
      ...job.artifacts,
      devDeliveryPath: undefined,
    },
    messages: [
      ...job.messages,
      {
        id: randomUUID(),
        role: 'design',
        text: [
          'Chris final sign-off.',
          'Packaging the delivery for the requester — watch the … lines.',
          'Then hand specs/<slug>/ + prototype URL to Cursor / a dev agent.',
        ].join('\n'),
        createdAt: stamp,
      },
    ],
  })
}

/** @deprecated Prefer requestSignOff — kept for older clients. */
export async function approveAgentJob(idOrSlug: string): Promise<AgentJob | null> {
  return requestSignOff(idOrSlug)
}

export async function extractBriefFromUpload(
  fileName: string,
  buffer: Buffer,
): Promise<string> {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.pdf')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
    const parsed = await pdfParse(buffer)
    const text = (parsed.text || '').trim()
    if (!text) throw new Error('Could not read text from PDF')
    return text
  }
  if (lower.endsWith('.md') || lower.endsWith('.txt') || lower.endsWith('.markdown')) {
    return buffer.toString('utf8').trim()
  }
  if (/\.(png|jpe?g|webp|gif)$/i.test(lower)) {
    /* Binary kept as reference image — note only for the brief text. */
    return `(Reference screenshot attached: ${fileName})`
  }
  throw new Error('Use PDF, Markdown, TXT, or an image (PNG / JPG / WebP / GIF)')
}
