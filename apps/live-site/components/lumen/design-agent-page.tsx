'use client'

/**
 * Design agent back office — isolated from BetOnline demo shell
 * (own root layout branch via middleware; no boot loader / footer / ShellFrame).
 * Own colors. Popups are fixed centered modals.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import {
  IconArrowLeft,
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconBook2,
  IconBrandFigma,
  IconCheck,
  IconCopy,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconExternalLink,
  IconFileUpload,
  IconFolder,
  IconInbox,
  IconLayoutDashboard,
  IconMessage,
  IconPaperclip,
  IconPlus,
  IconSend,
  IconShieldLock,
  IconSparkles,
  IconTrash,
  IconUser,
  IconUsers,
  IconWorld,
  IconX,
} from '@tabler/icons-react'
import {
  AGENT_SURFACES,
  DESIGN_AGENT,
  STAGE_ORDER,
  openQuestions,
  type AgentJob,
  type AgentJobSurface,
  type AgentMessage,
  type AgentQuestion,
} from '@/lib/agent/types'
import { cn } from '@/lib/utils'

const C = {
  /** One surface for nav / center / chat — no mismatched greys. */
  bg: '#0a0a0a',
  nav: '#0a0a0a',
  panel: '#121212',
  chat: '#0a0a0a',
  line: '#2a2a2a',
  pink: '#ff2d95',
  text: '#f5f5f5',
  muted: '#9a9a9a',
} as const

const STAGE_LABEL: Record<string, string> = {
  received: 'Received',
  speccing: 'Speccing',
  designing: 'Designing',
  preview_ready: 'Preview ready',
  needs_review: 'Refine',
  awaiting_signoff: 'Awaiting Chris',
  approved: 'Packaging',
  ready_for_dev: 'Ready for dev',
  live: 'Live',
}

type DeskRole = 'owner' | 'requester'
const DESK_ROLE_KEY = 'da-desk-role'

/** One-line “what do I do?” for every stage — never leave Chris guessing. */
function whatNow(job: AgentJob): string {
  const open = openQuestions(job).length
  if (open > 0) {
    return `Your turn — answer ${open} question${open === 1 ? '' : 's'} in chat (or the pink card).`
  }
  switch (job.status) {
    case 'received':
    case 'speccing':
      return 'Waiting on your route answer in chat before SpecKit continues.'
    case 'designing':
      return job.artifacts.previewUrl
        ? 'Preview should appear next — if empty, refresh.'
        : 'Watch … lines in chat — desk is prepping, then the preview iframe loads.'
    case 'preview_ready':
      return 'Check the preview. Refine in chat, or Request Chris sign-off when happy (does not package yet).'
    case 'needs_review':
      return 'Refine open — screenshots + notes in chat, tell Cursor to apply. Then Request Chris sign-off.'
    case 'awaiting_signoff':
      return 'Waiting on Chris final sign-off. Packaging for the requester only happens after that.'
    case 'approved':
      return 'Chris signed off — watch … packaging lines (delivery for the requester / dev).'
    case 'ready_for_dev':
      return 'Handoff packaged for the requester. Not happy? Back to refine. Demo only after Merge.'
    case 'live':
      return 'Shipped on the live site.'
    default:
      return job.note
  }
}

function isLoopbackUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname
    return host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
  } catch {
    return false
  }
}

function isLoopbackHost(host: string): boolean {
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
}

/**
 * Lumen gallery — always the in-app `/lumen` library (not Storybook).
 * Optional public override must not be loopback on hosted.
 */
const LUMEN_GALLERY_URL_ENV = process.env.NEXT_PUBLIC_LUMEN_GALLERY_URL?.trim() || ''

/** Resolve Lumen gallery link. Default `/lumen` everywhere. */
function lumenGalleryUrlForDesk(): string {
  const env = LUMEN_GALLERY_URL_ENV
  if (!env) return '/lumen'
  if (typeof window === 'undefined') {
    return isLoopbackUrl(env) ? '/lumen' : env
  }
  const local = isLoopbackHost(window.location.hostname)
  if (isLoopbackUrl(env) && !local) return '/lumen'
  return env
}

/** Desk iframe must never point at the user’s machine when hosted. */
function deskPreviewUrl(job: { slug: string; artifacts: { previewUrl?: string } }): string | undefined {
  const raw = job.artifacts.previewUrl
  if (!raw) return undefined
  if (typeof window === 'undefined') return raw
  if (
    !isLoopbackHost(window.location.hostname) &&
    (raw.includes('127.0.0.1') || raw.includes('localhost'))
  ) {
    return `/prototype/${job.slug}`
  }
  return raw
}

/** Figma Lumen folder (project) + DS file. */
const FIGMA_LUMEN_FOLDER =
  process.env.NEXT_PUBLIC_FIGMA_LUMEN_FOLDER ??
  'https://www.figma.com/files/project/625743109'
const FIGMA_LUMEN_DS =
  process.env.NEXT_PUBLIC_FIGMA_DS_URL ??
  'https://www.figma.com/design/vCPe93hNKDWWcpu49Vo0kU/Lumen_Desing-System'

const FIELD =
  'h-10 w-full rounded-lg border border-[#333] bg-[#141414] px-3 text-sm text-[#f5f5f5] placeholder:text-[#9a9a9a] outline-none focus:border-[#ff2d95]'

const LOGO = '/shell/design-agent/logo-mark.png'

/** Soft two-tone ping when Inbox count goes up (questions / Chris sign-off). */
function playInboxChime() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const now = ctx.currentTime
    const tones = [
      { f: 880, t: 0 },
      { f: 1174.7, t: 0.09 },
    ]
    for (const { f, t } of tones) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = f
      gain.gain.setValueAtTime(0.0001, now + t)
      gain.gain.exponentialRampToValueAtTime(0.08, now + t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.18)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + t)
      osc.stop(now + t + 0.2)
    }
    window.setTimeout(() => void ctx.close(), 500)
  } catch {
    /* autoplay / unsupported */
  }
}

type PreviewDevice = 'desktop' | 'tablet' | 'mobile'
const DEVICE_W: Record<PreviewDevice, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
}

type InboxItem = { job: AgentJob; question: AgentQuestion }
type SkillGroup =
  | 'skills'
  | 'patterns'
  | 'strategy'
  | 'taste'
  | 'rules'
  | 'constitution'
type SkillRow = {
  id: string
  name: string
  description: string
  path: string
  group: SkillGroup
}
type SkillDetail = SkillRow & { content: string }
type Popup = 'none' | 'brd' | 'inbox' | 'skills' | 'account'

const SKILL_GROUP_ORDER: SkillGroup[] = [
  'skills',
  'patterns',
  'strategy',
  'taste',
  'rules',
  'constitution',
]
const SKILL_GROUP_LABEL: Record<SkillGroup, string> = {
  skills: 'Project skills',
  patterns: 'Patterns',
  strategy: 'Product strategy',
  taste: 'Chris taste',
  rules: 'Cursor rules',
  constitution: 'Constitution',
}

export function DesignAgentPage() {
  return <DesignAgentApp />
}

function useDeskLinks() {
  const [localDesk, setLocalDesk] = useState(true)
  useEffect(() => {
    setLocalDesk(isLoopbackHost(window.location.hostname))
  }, [])

  /* Always in-app Lumen gallery — never Storybook :6006. */
  const gallery = lumenGalleryUrlForDesk()

  return {
    localDesk,
    lumenUrl: gallery,
    lumenHint: null,
    demoPortHint: localDesk ? ':3000' : null,
  }
}

function DesignAgentApp() {
  const [jobs, setJobs] = useState<AgentJob[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [popup, setPopup] = useState<Popup>('none')
  const [skills, setSkills] = useState<SkillRow[]>([])
  const [chatOpen, setChatOpen] = useState(true)
  const [chatWide, setChatWide] = useState(false)
  const [deskRole, setDeskRole] = useState<DeskRole>('owner')
  const links = useDeskLinks()

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DESK_ROLE_KEY)
      if (saved === 'owner' || saved === 'requester') setDeskRole(saved)
    } catch {
      /* ignore */
    }
  }, [])

  function changeDeskRole(role: DeskRole) {
    setDeskRole(role)
    try {
      localStorage.setItem(DESK_ROLE_KEY, role)
    } catch {
      /* ignore */
    }
  }

  const refreshJobs = useCallback(async () => {
    const res = await fetch('/api/agent/brd')
    if (!res.ok) return
    const data = (await res.json()) as { jobs: AgentJob[] }
    setJobs(data.jobs ?? [])
  }, [])

  const refreshSkills = useCallback(async () => {
    const res = await fetch('/api/agent/skills')
    if (!res.ok) return
    const data = (await res.json()) as { skills: SkillRow[] }
    setSkills(data.skills ?? [])
  }, [])

  useEffect(() => {
    void refreshJobs()
    void refreshSkills()
  }, [refreshJobs, refreshSkills])

  /* Keep job list fresh on Overview so Inbox / sign-off can chime. */
  useEffect(() => {
    const t = window.setInterval(() => {
      void refreshJobs()
    }, 8000)
    return () => window.clearInterval(t)
  }, [refreshJobs])

  const active = useMemo(
    () => (activeId ? jobs.find((j) => j.id === activeId) ?? null : null),
    [jobs, activeId],
  )

  useEffect(() => {
    if (!active?.id) return
    const packaging =
      active.status === 'approved' && !active.artifacts.devDeliveryPath
    const designing =
      active.status === 'designing' && !active.artifacts.previewUrl
    const ms = packaging || designing ? 1600 : 5000
    const t = window.setInterval(async () => {
      const res = await fetch(`/api/agent/brd/${active.id}`)
      if (!res.ok) return
      const data = (await res.json()) as { job: AgentJob }
      upsertJob(data.job)
    }, ms)
    return () => window.clearInterval(t)
  }, [
    active?.id,
    active?.status,
    active?.artifacts.previewUrl,
    active?.artifacts.devDeliveryPath,
  ])

  function upsertJob(job: AgentJob) {
    setJobs((prev) => {
      const rest = prev.filter((j) => j.id !== job.id)
      return [job, ...rest].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    })
  }

  const inboxItems = useMemo(() => {
    const items: InboxItem[] = []
    for (const job of jobs) {
      for (const q of openQuestions(job)) items.push({ job, question: q })
    }
    return items
  }, [jobs])

  const signOffQueue = useMemo(
    () => jobs.filter((j) => j.status === 'awaiting_signoff'),
    [jobs],
  )
  const inboxBadge =
    inboxItems.length + (deskRole === 'owner' ? signOffQueue.length : 0)

  const inboxBadgePrev = useRef<number | null>(null)
  useEffect(() => {
    const prev = inboxBadgePrev.current
    inboxBadgePrev.current = inboxBadge
    if (prev == null) return
    if (inboxBadge > prev) playInboxChime()
  }, [inboxBadge])

  async function deleteJob(id: string) {
    const res = await fetch(`/api/agent/brd/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete' }),
    })
    if (!res.ok) return
    setJobs((prev) => {
      const next = prev.filter((j) => j.id !== id)
      if (activeId === id) setActiveId(null)
      return next
    })
  }

  function goDashboard() {
    setActiveId(null)
  }

  return (
    <div
      data-design-agent-app=""
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 200000,
        display: 'grid',
        gridTemplateColumns: !active
          ? '240px 1fr'
          : chatOpen
            ? chatWide
              ? '240px 1fr minmax(420px, 42vw)'
              : '240px 1fr 340px'
            : '240px 1fr',
        gridTemplateRows: '100%',
        background: C.bg,
        transition: 'grid-template-columns 0.2s ease',
        color: C.text,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      }}
    >
      {/* LEFT NAV — grid cell, always full height */}
      <aside
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          background: C.nav,
          borderRight: `1px solid ${C.line}`,
          overflow: 'hidden',
        }}
      >
        <button
          type="button"
          onClick={goDashboard}
          title="Overview"
          aria-label="Overview"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '16px 12px',
            border: 0,
            borderBottom: `1px solid ${C.line}`,
            borderTop: `3px solid ${C.pink}`,
            flexShrink: 0,
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          <Image src={LOGO} alt="" width={40} height={40} priority />
        </button>

        <div style={{ padding: 8, borderBottom: `1px solid ${C.line}`, flexShrink: 0 }}>
          <NavLabel>Site</NavLabel>
          <NavButton onClick={goDashboard}>
            <IconLayoutDashboard size={16} stroke={1.5} />
            Overview
            {!activeId ? (
              <span
                style={{
                  marginLeft: 'auto',
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: C.pink,
                }}
              />
            ) : null}
          </NavButton>
          <NavButton onClick={() => setPopup('inbox')}>
            <IconInbox size={16} stroke={1.5} />
            Inbox
            {inboxBadge > 0 ? <Badge>{inboxBadge}</Badge> : null}
          </NavButton>
          <NavButton onClick={() => setPopup('skills')}>
            <IconSparkles size={16} stroke={1.5} />
            Skills
            <span style={{ marginLeft: 'auto', fontSize: 11, color: C.muted }}>
              {skills.length}
            </span>
          </NavButton>
        </div>

        <div style={{ padding: 8, borderBottom: `1px solid ${C.line}`, flexShrink: 0 }}>
          <NavLabel>Links</NavLabel>
          <NavButton
            onClick={() => {
              window.location.assign('/')
            }}
          >
            <IconWorld size={16} stroke={1.5} />
            Demo site
            {links.demoPortHint ? (
              <span style={{ marginLeft: 'auto', fontSize: 10, color: C.muted }}>
                {links.demoPortHint}
              </span>
            ) : null}
          </NavButton>
          {links.lumenUrl ? (
            <NavExternal href={links.lumenUrl} title="Lumen codebase — /lumen">
              <IconBook2 size={16} stroke={1.5} />
              Lumen codebase
            </NavExternal>
          ) : null}
          <NavExternal href={FIGMA_LUMEN_FOLDER} title="Figma Lumen folder">
            <IconBrandFigma size={16} stroke={1.5} />
            Figma Lumen
          </NavExternal>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              flexShrink: 0,
            }}
          >
            <NavLabel style={{ padding: 0, margin: 0 }}>Initiatives</NavLabel>
            <IconBtn aria-label="New BRD" onClick={() => setPopup('brd')}>
              <IconPlus size={16} stroke={1.5} />
            </IconBtn>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 12px' }}>
            {jobs.length === 0 ? (
              <div style={{ padding: 12, textAlign: 'center', fontSize: 12, color: C.muted }}>
                No BRDs yet
              </div>
            ) : (
              jobs.map((j) => {
                const open = openQuestions(j).length
                const selected = active?.id === j.id
                return (
                  <div key={j.id} style={{ position: 'relative', marginBottom: 4 }}>
                    <button
                      type="button"
                      onClick={() => setActiveId(j.id)}
                      onMouseEnter={(e) => {
                        if (!selected) e.currentTarget.style.background = C.panel
                      }}
                      onMouseLeave={(e) => {
                        if (!selected) e.currentTarget.style.background = 'transparent'
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 36px 8px 10px',
                        borderRadius: 8,
                        border: selected ? `1px solid ${C.line}` : '1px solid transparent',
                        background: selected ? C.panel : 'transparent',
                        color: C.text,
                        cursor: 'pointer',
                        transition: 'background 120ms ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {j.title}
                        </span>
                        {open > 0 ? (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 99,
                              background: C.pink,
                              flexShrink: 0,
                            }}
                          />
                        ) : null}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                        {j.surface} · {j.status.replace(/_/g, ' ')}
                      </div>
                    </button>
                    <button
                      type="button"
                      aria-label="Delete"
                      onClick={() => void deleteJob(j.id)}
                      style={{
                        position: 'absolute',
                        right: 6,
                        top: 8,
                        width: 28,
                        height: 28,
                        border: 0,
                        borderRadius: 6,
                        background: 'transparent',
                        color: C.muted,
                        cursor: 'pointer',
                      }}
                    >
                      <IconTrash size={14} stroke={1.5} />
                    </button>
                  </div>
                )
              })
            )}
          </div>

          <div
            style={{
              padding: 8,
              borderTop: `1px solid ${C.line}`,
              flexShrink: 0,
            }}
          >
            <NavLabel>Workspace</NavLabel>
            <NavButton onClick={() => setPopup('account')}>
              <IconUser size={16} stroke={1.5} />
              Account
              <span style={{ marginLeft: 'auto', fontSize: 10, color: C.muted }}>
                {deskRole === 'owner' ? 'Owner' : 'Requester'}
              </span>
            </NavButton>
            <NavSoon icon={<IconShieldLock size={16} stroke={1.5} />} label="Admin" />
            <NavSoon icon={<IconUsers size={16} stroke={1.5} />} label="Members" />
          </div>
        </div>
      </aside>

      {/* CENTER */}
      <main
        style={{
          height: '100%',
          overflow: 'auto',
          background: C.bg,
          minWidth: 0,
        }}
      >
        {active ? (
          <JobWorkspace
            job={active}
            onJob={upsertJob}
            chatOpen={chatOpen}
            onOpenChat={() => setChatOpen(true)}
            deskRole={deskRole}
            onBack={goDashboard}
          />
        ) : (
          <DashboardOverview
            jobs={jobs}
            deskRole={deskRole}
            signOffQueue={signOffQueue}
            inboxCount={inboxItems.length}
            onOpenJob={setActiveId}
            onNewBrd={() => setPopup('brd')}
            onOpenInbox={() => setPopup('inbox')}
          />
        )}
      </main>

      {/* RIGHT CHAT — only with active job + open */}
      {active && chatOpen ? (
        <aside
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: C.chat,
            borderLeft: `1px solid ${C.line}`,
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          <ChatDock
            job={active}
            onJob={upsertJob}
            wide={chatWide}
            onToggleWide={() => setChatWide((w) => !w)}
            onClose={() => setChatOpen(false)}
          />
        </aside>
      ) : null}

      {/* MODALS — fixed to viewport, never grid children */}
      {popup === 'brd'
        ? createPortal(
            <Modal title="New BRD" onClose={() => setPopup('none')}>
              <NewBrdForm
                onCancel={() => setPopup('none')}
                onCreated={(job) => {
                  upsertJob(job)
                  setActiveId(job.id)
                  setPopup('none')
                }}
              />
            </Modal>,
            document.body,
          )
        : null}

      {popup === 'inbox'
        ? createPortal(
            <Modal title="Inbox" onClose={() => setPopup('none')}>
              <InboxBody
                items={inboxItems}
                signOffQueue={deskRole === 'owner' ? signOffQueue : []}
                onOpenJob={(id) => {
                  setActiveId(id)
                  setPopup('none')
                }}
                onAnswered={upsertJob}
              />
            </Modal>,
            document.body,
          )
        : null}

      {popup === 'skills'
        ? createPortal(
            <Modal title="Skills" onClose={() => setPopup('none')} xl>
              <SkillsBody skills={skills} onChanged={() => void refreshSkills()} />
            </Modal>,
            document.body,
          )
        : null}

      {popup === 'account'
        ? createPortal(
            <Modal title="Account" onClose={() => setPopup('none')}>
              <AccountBody
                role={deskRole}
                onRole={changeDeskRole}
                onClose={() => setPopup('none')}
              />
            </Modal>,
            document.body,
          )
        : null}
    </div>
  )
}

/* ---------- chrome atoms ---------- */

function DaGlitchLogo({ size = 72 }: { size?: number }) {
  return (
    <div
      className="da-glitch-logo"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO}
        alt=""
        width={size}
        height={size}
        className="da-glitch-logo__layer da-glitch-logo__layer--base"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO}
        alt=""
        width={size}
        height={size}
        className="da-glitch-logo__layer da-glitch-logo__layer--pink"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO}
        alt=""
        width={size}
        height={size}
        className="da-glitch-logo__layer da-glitch-logo__layer--cyan"
      />
    </div>
  )
}

function NavLabel({
  children,
  style,
}: {
  children: ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        padding: '6px 8px',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: C.muted,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: '8px 10px',
        borderRadius: 8,
        fontSize: 13,
        color: C.muted,
        textDecoration: 'none',
      }}
    >
      {children}
    </Link>
  )
}

const NAV_ITEM: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  fontSize: 13,
  color: C.text,
  textDecoration: 'none',
  border: 0,
  background: 'transparent',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background 120ms ease',
}

function NavExternal({
  href,
  children,
  title,
}: {
  href: string
  children: ReactNode
  title?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={title}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = C.panel
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
      style={NAV_ITEM}
    >
      {children}
    </a>
  )
}

function NavButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = C.panel
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
      style={NAV_ITEM}
    >
      {children}
    </button>
  )
}

function NavSoon({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div
      title="Coming soon"
      style={{
        ...NAV_ITEM,
        cursor: 'default',
        opacity: 0.45,
      }}
    >
      {icon}
      {label}
      <span style={{ marginLeft: 'auto', fontSize: 10, color: C.muted }}>Soon</span>
    </div>
  )
}

function IconBtn({
  onClick,
  children,
  'aria-label': ariaLabel,
}: {
  onClick: () => void
  children: ReactNode
  'aria-label': string
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 0,
        borderRadius: 6,
        background: 'transparent',
        color: C.muted,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        marginLeft: 'auto',
        minWidth: 18,
        height: 18,
        padding: '0 5px',
        borderRadius: 99,
        background: C.pink,
        color: '#fff',
        fontSize: 10,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </span>
  )
}

function PinkButton({
  onClick,
  children,
  type = 'button',
  disabled,
}: {
  onClick?: () => void
  children: ReactNode
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 40,
        padding: '0 16px',
        border: 0,
        borderRadius: 8,
        background: C.pink,
        color: '#fff',
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  )
}

function Modal({
  title,
  onClose,
  children,
  wide,
  xl,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
  xl?: boolean
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      data-design-agent-modal=""
      role="presentation"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 200100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'rgba(0,0,0,0.72)',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: xl ? 880 : wide ? 640 : 480,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          background: C.panel,
          border: `1px solid ${C.line}`,
          borderRadius: 12,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          overflow: 'hidden',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: `1px solid ${C.line}`,
            flexShrink: 0,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h2>
          <IconBtn aria-label="Close" onClick={onClose}>
            <IconX size={16} stroke={1.5} />
          </IconBtn>
        </header>
        <div style={{ overflow: 'auto', flex: 1, minHeight: 0 }}>{children}</div>
      </div>
    </div>
  )
}

/* ---------- forms / panels ---------- */

function NewBrdForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void
  onCreated: (job: AgentJob) => void
}) {
  const [title, setTitle] = useState('')
  const [surface, setSurface] = useState<AgentJobSurface>('Rewards')
  const [brief, setBrief] = useState('')
  const [doc, setDoc] = useState<File | null>(null)
  const [shots, setShots] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onDoc(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setDoc(f)
    if (f && !title.trim()) {
      setTitle(
        f.name.replace(/\.(pdf|md|txt|markdown|png|jpe?g|webp|gif)$/i, ''),
      )
    }
    e.target.value = ''
  }

  function onShots(e: ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith('image/'),
    )
    setShots((prev) => [...prev, ...list].slice(0, 12))
    if (list[0] && !title.trim()) {
      setTitle(list[0].name.replace(/\.(png|jpe?g|webp|gif)$/i, ''))
    }
    e.target.value = ''
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!brief.trim() && !doc && shots.length === 0) {
      setError('Add a BRD, document, or screenshot')
      return
    }
    setBusy(true)
    try {
      let res: Response
      if (doc || shots.length > 0) {
        const form = new FormData()
        form.set('title', title)
        form.set('surface', surface)
        form.set('kind', 'feature')
        if (brief.trim()) form.set('brief', brief)
        if (doc) form.set('file', doc)
        for (const shot of shots) form.append('images', shot)
        res = await fetch('/api/agent/brd', { method: 'POST', body: form })
      } else {
        res = await fetch('/api/agent/brd', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, brief, surface, kind: 'feature' }),
        })
      }
      const data = (await res.json()) as { job?: AgentJob; error?: string }
      if (!res.ok || !data.job) {
        setError(data.error ?? 'Failed')
        return
      }
      onCreated(data.job)
    } catch {
      setError('Network error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ padding: 16, display: 'grid', gap: 14 }}>
      <Field label="Title">
        <input
          className={FIELD}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </Field>
      <Field label="Surface">
        <select
          className={FIELD}
          value={surface}
          onChange={(e) => setSurface(e.target.value as AgentJobSurface)}
        >
          {AGENT_SURFACES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Screenshots">
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: 20,
            borderRadius: 8,
            border: `1px dashed ${C.line}`,
            background: '#141414',
            cursor: 'pointer',
            color: C.muted,
            fontSize: 13,
          }}
        >
          <IconFileUpload size={20} stroke={1.5} />
          {shots.length > 0
            ? `${shots.length} image${shots.length === 1 ? '' : 's'} selected`
            : 'PNG / JPG / WebP — agent reference'}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            hidden
            onChange={onShots}
          />
        </label>
        {shots.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {shots.map((s) => (
              <span
                key={`${s.name}-${s.size}`}
                style={{
                  fontSize: 11,
                  color: C.muted,
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: `1px solid ${C.line}`,
                }}
              >
                {s.name}
              </span>
            ))}
            <button
              type="button"
              onClick={() => setShots([])}
              style={{
                fontSize: 11,
                color: C.muted,
                border: 0,
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          </div>
        ) : null}
      </Field>
      <Field label="Document (optional)">
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: 16,
            borderRadius: 8,
            border: `1px dashed ${C.line}`,
            background: '#141414',
            cursor: 'pointer',
            color: C.muted,
            fontSize: 13,
          }}
        >
          <IconFileUpload size={18} stroke={1.5} />
          {doc ? doc.name : 'PDF, Markdown, or TXT'}
          <input
            type="file"
            accept=".pdf,.md,.txt,.markdown,application/pdf,text/plain,text/markdown"
            hidden
            onChange={onDoc}
          />
        </label>
      </Field>
      <Field label="BRD">
        <textarea
          className={FIELD}
          style={{ height: 140, paddingTop: 10, resize: 'vertical' }}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Describe the work… (or rely on screenshots / doc)"
          required={!doc && shots.length === 0}
        />
      </Field>
      {error ? <div style={{ color: '#ff4d6d', fontSize: 13 }}>{error}</div> : null}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            height: 36,
            padding: '0 14px',
            borderRadius: 8,
            border: `1px solid ${C.line}`,
            background: 'transparent',
            color: C.text,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <PinkButton type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Start'}
        </PinkButton>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{label}</span>
      {children}
    </label>
  )
}

function AccountBody({
  role,
  onRole,
  onClose,
}: {
  role: DeskRole
  onRole: (role: DeskRole) => void
  onClose: () => void
}) {
  return (
    <div style={{ padding: 20, display: 'grid', gap: 16 }}>
      <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
        Designers and product managers work as Requester — they can request your
        sign-off. Only Owner (you) can Final sign-off and package for the requester.
        Admin and Members come later.
      </p>
      <div style={{ display: 'grid', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>Desk role</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {(
            [
              { id: 'owner' as const, label: 'Owner', hint: 'Final sign-off' },
              { id: 'requester' as const, label: 'Requester', hint: 'Request sign-off' },
            ] as const
          ).map((opt) => {
            const on = role === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onRole(opt.id)}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: `1px solid ${on ? C.pink : C.line}`,
                  background: on ? 'rgba(255,45,149,0.12)' : C.bg,
                  color: C.text,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600 }}>{opt.label}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{opt.hint}</div>
              </button>
            )
          })}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <PinkButton onClick={onClose}>Done</PinkButton>
      </div>
    </div>
  )
}

function InboxBody({
  items,
  signOffQueue = [],
  onOpenJob,
  onAnswered,
}: {
  items: InboxItem[]
  signOffQueue?: AgentJob[]
  onOpenJob: (id: string) => void
  onAnswered: (job: AgentJob) => void
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  async function answer(jobId: string, qid: string, text: string) {
    setBusy(true)
    try {
      const res = await fetch(`/api/agent/brd/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'answer', questionId: qid, answer: text }),
      })
      const data = (await res.json()) as { job?: AgentJob }
      if (data.job) onAnswered(data.job)
    } finally {
      setBusy(false)
    }
  }

  if (items.length === 0 && signOffQueue.length === 0) {
    return (
      <p style={{ padding: 40, textAlign: 'center', color: C.muted, fontSize: 13 }}>
        Nothing needs you.
      </p>
    )
  }

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      {signOffQueue.length > 0 ? (
        <div style={{ display: 'grid', gap: 8 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: C.muted,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Awaiting your sign-off
          </div>
          {signOffQueue.map((job) => (
            <button
              key={job.id}
              type="button"
              onClick={() => onOpenJob(job.id)}
              style={{
                border: `1px solid ${C.pink}`,
                borderRadius: 10,
                padding: 14,
                background: 'rgba(255,45,149,0.08)',
                color: C.text,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600 }}>{job.title}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                Requester liked the preview — Final sign-off packages for them.
              </div>
            </button>
          ))}
        </div>
      ) : null}
      {items.map(({ job, question: q }) => (
        <div
          key={q.id}
          style={{
            border: `1px solid ${C.line}`,
            borderRadius: 10,
            padding: 14,
            background: '#141414',
          }}
        >
          <button
            type="button"
            onClick={() => onOpenJob(job.id)}
            style={{
              border: 0,
              background: 'transparent',
              color: C.muted,
              fontSize: 12,
              cursor: 'pointer',
              padding: 0,
              marginBottom: 8,
            }}
          >
            {job.title}
          </button>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{q.text}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input
              className={FIELD}
              value={drafts[q.id] ?? ''}
              onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
              placeholder="Answer"
              disabled={busy}
            />
            <PinkButton
              disabled={busy || !(drafts[q.id] ?? '').trim()}
              onClick={() => void answer(job.id, q.id, drafts[q.id] ?? '')}
            >
              Send
            </PinkButton>
          </div>
        </div>
      ))}
    </div>
  )
}

function SkillsBody({
  skills,
  onChanged,
}: {
  skills: SkillRow[]
  onChanged: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [detail, setDetail] = useState<SkillDetail | null>(null)
  const [detailBusy, setDetailBusy] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const map = new Map<SkillGroup, SkillRow[]>()
    for (const g of SKILL_GROUP_ORDER) map.set(g, [])
    for (const s of skills) {
      const list = map.get(s.group) ?? []
      list.push(s)
      map.set(s.group, list)
    }
    return SKILL_GROUP_ORDER.map((g) => ({
      group: g,
      label: SKILL_GROUP_LABEL[g],
      items: map.get(g) ?? [],
    })).filter((g) => g.items.length > 0)
  }, [skills])

  useEffect(() => {
    if (!openId) {
      setDetail(null)
      setDetailError(null)
      return
    }
    let cancelled = false
    setDetailBusy(true)
    setDetailError(null)
    void (async () => {
      try {
        const res = await fetch(`/api/agent/skills/${encodeURIComponent(openId)}`)
        const data = (await res.json()) as { skill?: SkillDetail; error?: string }
        if (cancelled) return
        if (!res.ok || !data.skill) {
          setDetailError(data.error ?? 'Failed to load')
          setDetail(null)
          return
        }
        setDetail(data.skill)
      } catch {
        if (!cancelled) setDetailError('Network error')
      } finally {
        if (!cancelled) setDetailBusy(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [openId])

  async function addSkill(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/agent/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Failed')
        return
      }
      setName('')
      setDescription('')
      onChanged()
    } catch {
      setError('Network error')
    } finally {
      setBusy(false)
    }
  }

  if (openId) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 420, maxHeight: '70vh' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderBottom: `1px solid ${C.line}`,
            flexShrink: 0,
          }}
        >
          <IconBtn aria-label="Back to skills" onClick={() => setOpenId(null)}>
            <IconArrowLeft size={16} stroke={1.5} />
          </IconBtn>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {detail?.name ?? 'Skill'}
            </div>
            <div
              style={{
                fontSize: 11,
                color: C.muted,
                fontFamily: 'ui-monospace, monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {detail?.path ?? '…'}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 16 }}>
          {detailBusy ? (
            <div style={{ color: C.muted, fontSize: 13 }}>Loading…</div>
          ) : detailError ? (
            <div style={{ color: '#ff4d6d', fontSize: 13 }}>{detailError}</div>
          ) : detail ? (
            <pre
              style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 12,
                lineHeight: 1.55,
                color: C.text,
              }}
            >
              {detail.content}
            </pre>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 16, display: 'grid', gap: 16 }}>
      <form
        onSubmit={addSkill}
        style={{
          display: 'grid',
          gap: 10,
          padding: 14,
          borderRadius: 10,
          border: `1px solid ${C.line}`,
          background: '#141414',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600 }}>Add skill</div>
        <input
          className={FIELD}
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          className={FIELD}
          style={{ height: 72, paddingTop: 10, resize: 'vertical' }}
          placeholder="What it does"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {error ? <div style={{ color: '#ff4d6d', fontSize: 12 }}>{error}</div> : null}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <PinkButton type="submit" disabled={busy || !name.trim()}>
            {busy ? 'Adding…' : 'Add'}
          </PinkButton>
        </div>
      </form>

      <div style={{ fontSize: 12, color: C.muted }}>
        {skills.length} for this project · click to open
      </div>

      {grouped.map(({ group, label, items }) => (
        <div key={group} style={{ display: 'grid', gap: 8 }}>
          <NavLabel>{label}</NavLabel>
          {items.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setOpenId(s.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.panel
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#141414'
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: 12,
                borderRadius: 10,
                border: `1px solid ${C.line}`,
                background: '#141414',
                color: C.text,
                cursor: 'pointer',
                transition: 'background 120ms ease',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                {s.description}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: C.muted,
                  marginTop: 6,
                  fontFamily: 'ui-monospace, monospace',
                }}
              >
                {s.path}
              </div>
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

function DashboardOverview({
  jobs,
  deskRole,
  signOffQueue,
  inboxCount,
  onOpenJob,
  onNewBrd,
  onOpenInbox,
}: {
  jobs: AgentJob[]
  deskRole: DeskRole
  signOffQueue: AgentJob[]
  inboxCount: number
  onOpenJob: (id: string) => void
  onNewBrd: () => void
  onOpenInbox: () => void
}) {
  const refining = jobs.filter(
    (j) => j.status === 'needs_review' || j.status === 'preview_ready',
  )
  const packaging = jobs.filter((j) => j.status === 'approved')
  const ready = jobs.filter((j) => j.status === 'ready_for_dev')
  const building = jobs.filter(
    (j) =>
      j.status === 'received' ||
      j.status === 'speccing' ||
      j.status === 'designing',
  )

  const cards: { label: string; count: number; hint: string }[] = [
    {
      label: 'Needs sign-off',
      count: signOffQueue.length,
      hint: deskRole === 'owner' ? 'Your Final sign-off' : 'Waiting on Chris',
    },
    { label: 'In refine', count: refining.length, hint: 'Preview open' },
    { label: 'Building', count: building.length, hint: 'Spec / design' },
    { label: 'Packaging', count: packaging.length, hint: 'Dev delivery' },
    { label: 'Ready for requester', count: ready.length, hint: 'Handoff done' },
  ]

  const attention = [
    ...signOffQueue,
    ...refining.filter((j) => !signOffQueue.some((s) => s.id === j.id)),
    ...building,
  ]

  return (
    <div
      style={{
        height: '100%',
        overflow: 'auto',
        padding: '28px 32px 40px',
        background: C.bg,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>Overview</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            Pick an initiative — nothing opens until you do.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {inboxCount + (deskRole === 'owner' ? signOffQueue.length : 0) > 0 ? (
            <button
              type="button"
              onClick={onOpenInbox}
              style={{
                height: 36,
                padding: '0 14px',
                borderRadius: 8,
                border: `1px solid ${C.line}`,
                background: 'transparent',
                color: C.text,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              Inbox
              <Badge>
                {inboxCount + (deskRole === 'owner' ? signOffQueue.length : 0)}
              </Badge>
            </button>
          ) : null}
          <button
            type="button"
            aria-label="New BRD"
            onClick={onNewBrd}
            title="New BRD"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: 0,
              background: C.pink,
              color: '#fff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconPlus size={18} stroke={2} />
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 10,
          marginBottom: 28,
        }}
      >
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              padding: '14px 16px',
              borderRadius: 10,
              border: `1px solid ${C.line}`,
              background: C.panel,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 600, color: C.text }}>{c.count}</div>
            <div style={{ fontSize: 13, fontWeight: 500, marginTop: 4 }}>{c.label}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{c.hint}</div>
          </div>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: '48px 24px',
            borderRadius: 12,
            border: `1px dashed ${C.line}`,
            textAlign: 'center',
          }}
        >
          <DaGlitchLogo size={72} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>No initiatives yet</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
              Upload a BRD to start the SpecKit pipeline.
            </div>
          </div>
          <PinkButton onClick={onNewBrd}>New BRD</PinkButton>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: C.muted,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Initiatives
          </div>
          {(attention.length > 0 ? attention : jobs).map((job) => {
            const open = openQuestions(job).length
            return (
              <button
                key={job.id}
                type="button"
                onClick={() => onOpenJob(job.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1a1a1a'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = C.panel
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: `1px solid ${
                    job.status === 'awaiting_signoff' ? C.pink : C.line
                  }`,
                  background: C.panel,
                  color: C.text,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 120ms ease',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{job.title}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                    {job.surface} · {STAGE_LABEL[job.status] ?? job.status}
                    {open > 0 ? ` · ${open} open Q` : ''}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: C.muted, flexShrink: 0 }}>Open →</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function JobWorkspace({
  job,
  onJob,
  chatOpen,
  onOpenChat,
  deskRole,
  onBack,
}: {
  job: AgentJob
  onJob: (job: AgentJob) => void
  chatOpen: boolean
  onOpenChat: () => void
  deskRole: DeskRole
  onBack: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [device, setDevice] = useState<PreviewDevice>('desktop')
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [centerTab, setCenterTab] = useState<'package' | 'preview'>('preview')

  const pending = useMemo(
    () => (job.questions ?? []).filter((q) => !q.answer?.trim()),
    [job.questions],
  )
  const handedOff =
    job.status === 'ready_for_dev' || Boolean(job.artifacts.devDeliveryPath)
  const canRequestSignOff =
    Boolean(job.artifacts.previewUrl) &&
    pending.length === 0 &&
    !handedOff &&
    (job.status === 'preview_ready' || job.status === 'needs_review')
  const canFinalSignOff =
    deskRole === 'owner' && job.status === 'awaiting_signoff' && !handedOff

  useEffect(() => {
    /* Preview first whenever a prototype URL exists — Package is secondary. */
    setCenterTab(job.artifacts.previewUrl ? 'preview' : 'package')
  }, [job.id, job.artifacts.previewUrl])

  async function requestSignOff() {
    if (!canRequestSignOff) return
    setBusy(true)
    try {
      const res = await fetch(`/api/agent/brd/${job.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_signoff' }),
      })
      const data = (await res.json()) as { job?: AgentJob }
      if (data.job) onJob(data.job)
    } finally {
      setBusy(false)
    }
  }

  async function finalSignOff() {
    if (!canFinalSignOff) return
    setBusy(true)
    try {
      const res = await fetch(`/api/agent/brd/${job.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sign_off' }),
      })
      const data = (await res.json()) as { job?: AgentJob }
      if (data.job) onJob(data.job)
    } finally {
      setBusy(false)
    }
  }

  async function backToRefine() {
    setBusy(true)
    try {
      const res = await fetch(`/api/agent/brd/${job.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refine' }),
      })
      const data = (await res.json()) as { job?: AgentJob }
      if (data.job) {
        onJob(data.job)
        setCenterTab('preview')
      }
    } finally {
      setBusy(false)
    }
  }

  async function answer(questionId: string) {
    const answer = (drafts[questionId] ?? '').trim()
    if (!answer) return
    setBusy(true)
    try {
      const res = await fetch(`/api/agent/brd/${job.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'answer', questionId, answer }),
      })
      const data = (await res.json()) as { job?: AgentJob }
      if (data.job) onJob(data.job)
    } finally {
      setBusy(false)
    }
  }

  const stages = STAGE_ORDER.filter((s) => s !== 'failed')
  const idx = Math.max(0, stages.indexOf(job.status === 'failed' ? 'received' : job.status))
  const pipelineStep = job.pipelineStep ?? 0
  const packaging =
    job.status === 'approved' && !job.artifacts.devDeliveryPath
  const building =
    packaging ||
    (!job.artifacts.previewUrl &&
      job.status === 'designing' &&
      pipelineStep < 5)
  const paused =
    !packaging &&
    !job.artifacts.previewUrl &&
    job.status === 'designing' &&
    pipelineStep >= 5

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        background: C.bg,
      }}
    >
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.line}` }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <div>
            <button
              type="button"
              onClick={onBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                border: 0,
                background: 'transparent',
                color: C.muted,
                fontSize: 12,
                cursor: 'pointer',
                padding: 0,
                marginBottom: 6,
              }}
            >
              <IconLayoutDashboard size={14} stroke={1.5} />
              Overview
            </button>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{job.title}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
              {job.slug} · {job.surface}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!chatOpen ? (
              <button
                type="button"
                onClick={onOpenChat}
                style={{
                  height: 36,
                  padding: '0 12px',
                  borderRadius: 8,
                  border: `1px solid ${C.line}`,
                  background: 'transparent',
                  color: C.text,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                }}
              >
                <IconMessage size={16} stroke={1.5} />
                Chat
              </button>
            ) : null}
            {handedOff ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void backToRefine()}
                title="Reopen refine — package stays as draft"
                style={{
                  height: 36,
                  padding: '0 14px',
                  borderRadius: 8,
                  border: `1px solid ${C.line}`,
                  background: 'transparent',
                  color: C.text,
                  cursor: busy ? 'default' : 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  opacity: busy ? 0.6 : 1,
                }}
              >
                <IconArrowLeft size={16} stroke={1.5} />
                Back to refine
              </button>
            ) : null}
            {canRequestSignOff ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void requestSignOff()}
                title="Alerts Chris — does not package for dev"
                style={{
                  height: 36,
                  padding: '0 14px',
                  borderRadius: 8,
                  border: `1px solid ${C.line}`,
                  background: job.status === 'needs_review' ? 'transparent' : C.pink,
                  color: job.status === 'needs_review' ? C.muted : '#fff',
                  cursor: busy ? 'default' : 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  opacity: busy ? 0.6 : 1,
                }}
              >
                <IconCheck size={16} stroke={1.5} />
                Request Chris sign-off
              </button>
            ) : null}
            {canFinalSignOff ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void finalSignOff()}
                title="Your final sign-off — packages for the requester"
                style={{
                  height: 36,
                  padding: '0 14px',
                  borderRadius: 8,
                  border: `1px solid ${C.pink}`,
                  background: C.pink,
                  color: '#fff',
                  cursor: busy ? 'default' : 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  opacity: busy ? 0.6 : 1,
                }}
              >
                <IconCheck size={16} stroke={1.5} />
                Final sign-off
              </button>
            ) : null}
            {job.status === 'awaiting_signoff' && deskRole === 'requester' ? (
              <span
                style={{
                  height: 36,
                  padding: '0 12px',
                  borderRadius: 8,
                  border: `1px solid ${C.line}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: 12,
                  color: C.muted,
                }}
              >
                Waiting on Chris…
              </span>
            ) : null}
          </div>
        </div>

        <StageStrip
          stages={stages}
          index={idx}
          building={building}
          paused={paused}
        />
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 10,
            border: `1px solid ${C.line}`,
            background: C.panel,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: C.muted,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            What now
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.45, color: C.text }}>
            {whatNow(job)}
          </p>
          {job.note && job.note !== whatNow(job) ? (
            <p style={{ margin: '6px 0 0', fontSize: 12, color: C.muted }}>{job.note}</p>
          ) : null}
        </div>
      </div>

      <div style={{ padding: 20, flex: 1, display: 'grid', gap: 16, background: C.bg }}>
        {pending.length > 0 ? (
          <div
            style={{
              border: `1px solid ${C.pink}`,
              borderRadius: 10,
              background: C.bg,
              padding: 16,
              display: 'grid',
              gap: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.pink }}>
                Your turn — {pending.length} question{pending.length === 1 ? '' : 's'}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                SpecKit is paused until you answer. Then we design the mock.
              </div>
            </div>
            {pending.map((q) => (
              <div key={q.id} style={{ display: 'grid', gap: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{q.text}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className={FIELD}
                    style={{ flex: 1 }}
                    value={drafts[q.id] ?? ''}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [q.id]: e.target.value }))
                    }
                    placeholder="e.g. above Contests (merge later)"
                    disabled={busy}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        void answer(q.id)
                      }
                    }}
                  />
                  <PinkButton
                    disabled={busy || !(drafts[q.id] ?? '').trim()}
                    onClick={() => void answer(q.id)}
                  >
                    Send
                  </PinkButton>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {(job.artifacts.previewUrl || handedOff) && pending.length === 0 ? (
          <div
            style={{
              display: 'inline-flex',
              padding: 2,
              borderRadius: 8,
              border: `1px solid ${C.line}`,
              background: C.bg,
              width: 'fit-content',
            }}
          >
            {(
              [
                ['preview', 'Preview'],
                ['package', 'Package'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setCenterTab(id)}
                style={{
                  height: 32,
                  padding: '0 14px',
                  border: 0,
                  borderRadius: 6,
                  background: centerTab === id ? C.panel : 'transparent',
                  color: centerTab === id ? C.text : C.muted,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: centerTab === id ? 600 : 500,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}

        {centerTab === 'package' || !job.artifacts.previewUrl ? (
          handedOff || job.artifacts.brdPath ? (
            <HandoffPanel job={job} />
          ) : (
            <DesignToolCanvas
              pending={pending.length > 0}
              building={building}
              paused={paused}
              brdPath={job.artifacts.brdPath}
            />
          )
        ) : null}

        {centerTab === 'preview' && deskPreviewUrl(job) ? (
          <div>
            <PrototypeUrlBar path={deskPreviewUrl(job)!} />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
                marginTop: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {handedOff ? 'Signed-off preview' : 'Design preview'}
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                  Desk iframe — use Open for fullscreen / phone on same Wi‑Fi
                </div>
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  padding: 2,
                  borderRadius: 8,
                  border: `1px solid ${C.line}`,
                  background: C.bg,
                }}
              >
                {(
                  [
                    ['desktop', IconDeviceDesktop],
                    ['tablet', IconDeviceTablet],
                    ['mobile', IconDeviceMobile],
                  ] as const
                ).map(([id, Icon]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDevice(id)}
                    style={{
                      height: 30,
                      padding: '0 10px',
                      border: 0,
                      borderRadius: 6,
                      background: device === id ? C.panel : 'transparent',
                      color: device === id ? C.text : C.muted,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                    }}
                  >
                    <Icon size={14} stroke={1.5} />
                    {id[0]!.toUpperCase() + id.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: DEVICE_W[device],
                  maxWidth: '100%',
                  overflow: 'hidden',
                  transition: 'width 0.25s',
                  background: C.bg,
                }}
              >
                <iframe
                  title="Preview"
                  src={deskPreviewUrl(job)}
                  style={{ width: '100%', height: 560, border: 0 }}
                />
              </div>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  )
}

function PrototypeUrlBar({
  path,
  label = 'Prototype URL (design lane — not :3000 demo)',
}: {
  path: string
  label?: string
}) {
  const [copied, setCopied] = useState(false)
  const absolute =
    /^https?:\/\//i.test(path)
      ? path
      : typeof window !== 'undefined'
        ? `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`
        : path
  const [abs, setAbs] = useState(absolute)
  useEffect(() => {
    if (/^https?:\/\//i.test(path)) {
      setAbs(path)
      return
    }
    setAbs(`${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`)
  }, [path])

  async function copy() {
    try {
      await navigator.clipboard.writeText(abs)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        padding: 10,
        borderRadius: 10,
        border: `1px solid ${C.line}`,
        background: C.panel,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 2 }}>
          {label}
        </div>
        <div
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: 12,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {abs}
        </div>
      </div>
      <a
        href={abs}
        target="_blank"
        rel="noreferrer"
        style={{
          height: 32,
          padding: '0 12px',
          borderRadius: 8,
          border: `1px solid ${C.line}`,
          background: C.text,
          color: C.bg,
          textDecoration: 'none',
          fontSize: 12,
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <IconExternalLink size={14} stroke={1.5} />
        Open fullscreen
      </a>
      <button
        type="button"
        onClick={() => void copy()}
        style={{
          height: 32,
          padding: '0 12px',
          borderRadius: 8,
          border: `1px solid ${C.line}`,
          background: 'transparent',
          color: C.text,
          cursor: 'pointer',
          fontSize: 12,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <IconCopy size={14} stroke={1.5} />
        {copied ? 'Copied' : 'Copy URL'}
      </button>
    </div>
  )
}

function HandoffPanel({ job }: { job: AgentJob }) {
  const [modalFile, setModalFile] = useState<string | null>(null)
  const [content, setContent] = useState<string>('')
  const [copied, setCopied] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [portal, setPortal] = useState(false)

  useEffect(() => setPortal(true), [])

  const files =
    job.artifacts.packageFiles && job.artifacts.packageFiles.length > 0
      ? job.artifacts.packageFiles
      : [
          job.artifacts.devDeliveryPath ?? `specs/${job.slug}/dev-delivery.md`,
          `specs/${job.slug}/lumen-map.md`,
          job.artifacts.brdPath ?? `specs/${job.slug}/brd.md`,
          `specs/${job.slug}/spec.md`,
          `specs/${job.slug}/feedback.md`,
        ].filter(Boolean)

  const folder = `specs/${job.slug}`
  const proto = deskPreviewUrl(job) ?? job.artifacts.previewUrl
  const live = job.artifacts.liveUrl

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      window.setTimeout(() => setCopied(null), 1500)
    } catch {
      /* ignore */
    }
  }

  async function viewFile(relPath: string) {
    const name = relPath.split('/').pop() ?? relPath
    setLoading(true)
    setModalFile(relPath)
    setContent('')
    try {
      const res = await fetch(
        `/api/agent/brd/${job.id}?file=${encodeURIComponent(name)}`,
      )
      const data = (await res.json()) as { content?: string; error?: string }
      setContent(data.content ?? data.error ?? 'Could not load file')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        border: `1px solid ${C.line}`,
        borderRadius: 12,
        background: C.panel,
        padding: 16,
        display: 'grid',
        gap: 14,
      }}
    >
      {proto ? <PrototypeUrlBar path={proto} /> : null}
      {live ? (
        <div
          style={{
            fontSize: 12,
            color: C.muted,
            lineHeight: 1.45,
            padding: 10,
            borderRadius: 10,
            border: `1px dashed ${C.line}`,
            background: C.bg,
          }}
        >
          Planned demo route after you say <strong style={{ color: C.text }}>Merge</strong>:{' '}
          <code style={{ color: C.text }}>{live}</code>
          <div style={{ marginTop: 4 }}>
            Chris Final sign-off packages for the requester — it does{' '}
            <strong style={{ color: C.text }}>not</strong> put this on :3000.
          </div>
        </div>
      ) : null}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <IconFolder size={20} stroke={1.5} color={C.muted} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>What’s being sent to dev</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
            Prototype URL + BRD/spec + Lumen map (components, tokens, hover/motion) +
            feedback.
          </div>
        </div>
        <button
          type="button"
          onClick={() => void copy(folder, 'folder')}
          style={{
            height: 32,
            padding: '0 12px',
            borderRadius: 8,
            border: `1px solid ${C.line}`,
            background: C.bg,
            color: C.text,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
          }}
        >
          <IconCopy size={14} stroke={1.5} />
          {copied === 'folder' ? 'Copied' : 'Copy folder path'}
        </button>
      </div>

      <div
        style={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: 12,
          padding: '8px 10px',
          borderRadius: 8,
          border: `1px solid ${C.line}`,
          background: C.bg,
          color: C.text,
        }}
      >
        {folder}/
      </div>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
        {files.map((f) => (
          <li
            key={f}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              borderRadius: 8,
              border: `1px solid ${C.line}`,
              background: C.bg,
            }}
          >
            <span
              style={{
                flex: 1,
                minWidth: 0,
                fontFamily: 'ui-monospace, monospace',
                fontSize: 12,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {f}
            </span>
            <button
              type="button"
              onClick={() => void viewFile(f)}
              style={{
                height: 28,
                padding: '0 8px',
                borderRadius: 6,
                border: `1px solid ${C.line}`,
                background: 'transparent',
                color: C.text,
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              View
            </button>
            <button
              type="button"
              aria-label={`Copy ${f}`}
              onClick={() => void copy(f, f)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: `1px solid ${C.line}`,
                background: 'transparent',
                color: copied === f ? C.text : C.muted,
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <IconCopy size={14} stroke={1.5} />
            </button>
          </li>
        ))}
      </ul>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
          fontSize: 12,
          alignItems: 'center',
        }}
      >
        {lumenGalleryUrlForDesk() ? (
          <a
            href={lumenGalleryUrlForDesk()}
            target="_blank"
            rel="noreferrer"
            style={{
              color: C.muted,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              textDecoration: 'none',
            }}
          >
            <IconBook2 size={14} stroke={1.5} />
            Lumen codebase · /lumen
          </a>
        ) : null}
        <a
          href={FIGMA_LUMEN_FOLDER}
          target="_blank"
          rel="noreferrer"
          style={{
            color: C.muted,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            textDecoration: 'none',
          }}
        >
          <IconBrandFigma size={14} stroke={1.5} />
          Figma Lumen folder
        </a>
        <a
          href={FIGMA_LUMEN_DS}
          target="_blank"
          rel="noreferrer"
          style={{
            color: C.muted,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            textDecoration: 'none',
          }}
        >
          <IconBrandFigma size={14} stroke={1.5} />
          Lumen DS file
        </a>
      </div>

      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.45 }}>
        <strong style={{ color: C.text }}>Next:</strong> hand{' '}
        <code style={{ color: C.text }}>{folder}</code> to Cursor / a dev agent.
        Prototype stays on <code style={{ color: C.text }}>:3001/prototype/…</code>.
        Demo (:3000) only when you say Merge
        {live ? (
          <>
            {' '}
            → <code style={{ color: C.text }}>{live}</code>
          </>
        ) : null}
        .
      </div>

      {portal && modalFile
        ? createPortal(
            <Modal
              title={modalFile}
              xl
              onClose={() => {
                setModalFile(null)
                setContent('')
              }}
            >
              <pre
                style={{
                  margin: 0,
                  padding: 16,
                  fontSize: 12,
                  lineHeight: 1.45,
                  whiteSpace: 'pre-wrap',
                  color: C.text,
                  fontFamily: 'ui-monospace, monospace',
                }}
              >
                {loading ? 'Loading…' : content}
              </pre>
            </Modal>,
            document.body,
          )
        : null}
    </div>
  )
}

function StageStrip({
  stages,
  index,
  building,
  paused,
}: {
  stages: string[]
  index: number
  building: boolean
  paused?: boolean
}) {
  const current = stages[index] ?? stages[0]!
  const next = stages[index + 1]
  return (
    <div
      style={{
        marginTop: 14,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span
        className={building ? 'da-stage-pulse' : undefined}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          height: 32,
          padding: '0 12px',
          borderRadius: 8,
          border: `1px solid ${paused ? C.line : C.pink}`,
          background: paused ? C.panel : 'rgba(255,45,149,0.12)',
          color: C.text,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 99,
            background: paused ? C.muted : C.pink,
            boxShadow: building ? '0 0 10px #ff2d95' : undefined,
          }}
        />
        {STAGE_LABEL[current] ?? current}
        {building && !paused ? (
          <span style={{ fontSize: 11, fontWeight: 500, color: C.pink }}>
            working…
          </span>
        ) : null}
        {paused ? (
          <span style={{ fontSize: 11, fontWeight: 500, color: C.muted }}>paused</span>
        ) : null}
      </span>
      {next ? (
        <span style={{ fontSize: 12, color: C.muted }}>
          Next · {STAGE_LABEL[next] ?? next}
          {current === 'ready_for_dev' ? ' (after prod ships)' : ''}
        </span>
      ) : null}
      <span style={{ fontSize: 11, color: C.muted, marginLeft: 'auto' }}>
        {index + 1} / {stages.length}
      </span>
    </div>
  )
}

function DesignWorkingLoader() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (customElements.get('betonline-loader')) return
    const existing = document.querySelector('script[data-da-bol-loader]')
    if (existing) return
    const s = document.createElement('script')
    s.src = '/betonline-loader.js'
    s.dataset.daBolLoader = '1'
    document.head.appendChild(s)
  }, [])

  return (
    <div
      style={{
        minHeight: 420,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: '#1a1a1a',
        borderRadius: 12,
        border: `1px solid ${C.line}`,
      }}
      aria-busy
      aria-label="Design working"
    >
      <div
        dangerouslySetInnerHTML={{
          __html:
            '<betonline-loader duration="2400" style="--loader-width:min(280px,70vw)"></betonline-loader>',
        }}
      />
      <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Design working…</div>
      <div style={{ fontSize: 12, color: C.muted }}>Building the mock — preview next.</div>
    </div>
  )
}

function DesignToolCanvas({
  pending,
  building,
  paused,
  brdPath,
}: {
  pending: boolean
  building: boolean
  paused?: boolean
  brdPath?: string
}) {
  if (building && !pending) {
    return <DesignWorkingLoader />
  }

  return (
    <div
      className="da-design-canvas"
      style={{
        position: 'relative',
        minHeight: 360,
        background: C.bg,
        overflow: 'hidden',
      }}
    >
      <div className="da-design-canvas__grid" aria-hidden />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          minHeight: 360,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 32,
          textAlign: 'center',
        }}
      >
        <DaGlitchLogo size={64} />
        <div style={{ color: C.text, fontWeight: 600, fontSize: 15 }}>
          {pending
            ? 'Waiting on your answer'
            : paused
              ? 'Paused — no code writing'
              : 'No prototype yet'}
        </div>
        <div style={{ maxWidth: 420, fontSize: 13, color: C.muted, lineHeight: 1.45 }}>
          {pending
            ? 'Answer in chat. Preview appears after SpecKit builds.'
            : paused
              ? 'Ask in chat anytime for status.'
              : 'Preview appears when design prep finishes.'}
        </div>
        {brdPath ? (
          <div
            style={{
              marginTop: 8,
              fontFamily: 'ui-monospace, monospace',
              fontSize: 11,
              color: C.muted,
            }}
          >
            {brdPath}
          </div>
        ) : null}
      </div>
    </div>
  )
}

type PendingShot = { id: string; file: File; preview: string }

function ChatDock({
  job,
  onJob,
  wide,
  onToggleWide,
  onClose,
}: {
  job: AgentJob
  onJob: (job: AgentJob) => void
  wide: boolean
  onToggleWide: () => void
  onClose: () => void
}) {
  const [chat, setChat] = useState('')
  const [shots, setShots] = useState<PendingShot[]>([])
  const [busy, setBusy] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const pending = useMemo(
    () => (job.questions ?? []).filter((q) => !q.answer?.trim()),
    [job.questions],
  )
  const handedOff =
    job.status === 'ready_for_dev' || Boolean(job.artifacts.devDeliveryPath)
  const packaging =
    job.status === 'approved' && !job.artifacts.devDeliveryPath
  const refining =
    Boolean(job.artifacts.previewUrl) &&
    !handedOff &&
    !packaging &&
    (job.status === 'preview_ready' || job.status === 'needs_review')
  const working =
    packaging ||
    (job.status === 'designing' &&
      !job.artifacts.previewUrl &&
      (job.pipelineStep ?? 0) < 5)
  const paused =
    !packaging &&
    job.status === 'designing' &&
    !job.artifacts.previewUrl &&
    (job.pipelineStep ?? 0) >= 5
  const canSend = Boolean(chat.trim() || shots.length > 0)

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth' })
  }, [job.messages.length, job.id, working, shots.length])

  useEffect(() => {
    return () => {
      shots.forEach((s) => URL.revokeObjectURL(s.preview))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on unmount
  }, [])

  function addFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (list.length === 0) return
    setShots((prev) => {
      const next = [...prev]
      for (const file of list.slice(0, 8 - prev.length)) {
        next.push({
          id: `${file.name}-${file.size}-${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
        })
      }
      return next.slice(0, 8)
    })
  }

  function removeShot(id: string) {
    setShots((prev) => {
      const hit = prev.find((s) => s.id === id)
      if (hit) URL.revokeObjectURL(hit.preview)
      return prev.filter((s) => s.id !== id)
    })
  }

  async function send(e: FormEvent) {
    e.preventDefault()
    if (!canSend || busy) return
    const text = chat
    const pendingShots = shots
    setChat('')
    setShots([])
    setBusy(true)
    try {
      let res: Response
      if (pendingShots.length > 0) {
        const form = new FormData()
        form.set('action', 'feedback')
        form.set('text', text)
        for (const s of pendingShots) form.append('images', s.file)
        res = await fetch(`/api/agent/brd/${job.id}`, {
          method: 'POST',
          body: form,
        })
      } else {
        res = await fetch(`/api/agent/brd/${job.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: refining ? 'feedback' : 'message',
            text,
          }),
        })
      }
      const data = (await res.json()) as { job?: AgentJob }
      if (data.job) onJob(data.job)
    } finally {
      pendingShots.forEach((s) => URL.revokeObjectURL(s.preview))
      setBusy(false)
    }
  }

  return (
    <>
      <header
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 12px 0 16px',
          borderBottom: `1px solid ${C.line}`,
          flexShrink: 0,
        }}
      >
        <Image src={LOGO} alt="" width={24} height={24} />
        <span style={{ fontSize: 13, fontWeight: 600, flex: 1, minWidth: 0 }}>
          {DESIGN_AGENT.name}
        </span>
        {working ? (
          <span style={{ fontSize: 11, color: C.pink, marginRight: 4 }}>
            {packaging ? 'Packaging…' : 'Prep…'}
          </span>
        ) : null}
        {paused ? (
          <span style={{ fontSize: 11, color: C.muted, marginRight: 4 }}>Paused</span>
        ) : null}
        {job.status === 'needs_review' ? (
          <span style={{ fontSize: 11, color: C.pink, marginRight: 4 }}>Refine</span>
        ) : null}
        {handedOff ? (
          <span style={{ fontSize: 11, color: C.pink, marginRight: 4 }}>Handoff</span>
        ) : null}
        <IconBtn
          aria-label={wide ? 'Narrow chat' : 'Widen chat'}
          onClick={onToggleWide}
        >
          {wide ? (
            <IconArrowsMinimize size={16} stroke={1.5} />
          ) : (
            <IconArrowsMaximize size={16} stroke={1.5} />
          )}
        </IconBtn>
        <IconBtn aria-label="Close chat" onClick={onClose}>
          <IconX size={16} stroke={1.5} />
        </IconBtn>
      </header>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {pending.length > 0 ? (
          <div
            style={{
              marginBottom: 14,
              padding: 12,
              borderRadius: 10,
              border: `1px solid ${C.pink}`,
              background: C.panel,
            }}
          >
            <div style={{ fontSize: 11, color: C.pink, fontWeight: 600, marginBottom: 6 }}>
              Needs your answer
            </div>
            {pending.map((q) => (
              <div key={q.id} style={{ fontSize: 13, marginBottom: 4 }}>
                {q.text}
              </div>
            ))}
            <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
              Type below and send.
            </div>
          </div>
        ) : null}
        {handedOff && pending.length === 0 ? (
          <div
            style={{
              marginBottom: 14,
              padding: 12,
              borderRadius: 10,
              border: `1px solid ${C.pink}`,
              background: C.panel,
            }}
          >
            <div style={{ fontSize: 11, color: C.pink, fontWeight: 600, marginBottom: 6 }}>
              Handoff packaged
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.45 }}>
              Center Package has the folder (
              <code style={{ color: C.pink }}>specs/{job.slug}/</code>
              ) + prototype URL for dev. Not happy? Use{' '}
              <strong style={{ color: C.text }}>Back to refine</strong> in the
              header — then screenshots in chat again.
            </div>
          </div>
        ) : null}
        {refining && pending.length === 0 ? (
          <div
            style={{
              marginBottom: 14,
              padding: 12,
              borderRadius: 10,
              border: `1px solid ${C.pink}`,
              background: C.panel,
            }}
          >
            <div style={{ fontSize: 11, color: C.pink, fontWeight: 600, marginBottom: 6 }}>
              Refine (skip sign-off)
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.45 }}>
              Paste/attach a screenshot + what’s wrong. Cloud agent applies when
              configured; otherwise apply in Cursor on this repo.
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
              Lumen gallery{' '}
              <a
                href={lumenGalleryUrlForDesk()}
                target="_blank"
                rel="noreferrer"
                style={{ color: C.pink }}
              >
                {lumenGalleryUrlForDesk().replace(/^https?:\/\//, '') || '/lumen'}
              </a>
            </div>
          </div>
        ) : null}
        {packaging ? (
          <div
            style={{
              marginBottom: 14,
              padding: 12,
              borderRadius: 10,
              border: `1px solid ${C.pink}`,
              background: C.panel,
            }}
          >
            <div style={{ fontSize: 11, color: C.pink, fontWeight: 600, marginBottom: 6 }}>
              Packaging…
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.45 }}>
              Watch the … lines below — writing the handoff package. No click needed.
            </div>
          </div>
        ) : null}
        {(job.messages ?? []).map((m) => (
          <ChatBubble key={m.id} message={m} />
        ))}
        {working ? (
          <div
            style={{
              fontSize: 12,
              color: C.muted,
              fontStyle: 'italic',
              marginBottom: 12,
            }}
          >
            {packaging
              ? 'Packaging… lines streaming…'
              : 'Polling SpecKit / design run…'}
          </div>
        ) : null}
        <div ref={end} />
      </div>
      <form
        onSubmit={(e) => void send(e)}
        onPaste={(e) => {
          const items = e.clipboardData?.files
          if (items && items.length > 0) {
            const imgs = Array.from(items).filter((f) => f.type.startsWith('image/'))
            if (imgs.length > 0) {
              e.preventDefault()
              addFiles(imgs)
            }
          }
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: 12,
          borderTop: `1px solid ${C.line}`,
          flexShrink: 0,
        }}
      >
        {shots.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {shots.map((s) => (
              <div
                key={s.id}
                style={{
                  position: 'relative',
                  width: 72,
                  height: 72,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: `1px solid ${C.line}`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.preview}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  aria-label="Remove screenshot"
                  onClick={() => removeShot(s.id)}
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 20,
                    height: 20,
                    border: 0,
                    borderRadius: 6,
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <IconX size={12} stroke={2} />
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 10,
            border: `1px solid ${C.line}`,
            background: C.panel,
            paddingLeft: 4,
            paddingRight: 4,
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              if (e.target.files) addFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            aria-label="Attach screenshot"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            style={{
              width: 34,
              height: 34,
              border: 0,
              borderRadius: 8,
              background: 'transparent',
              color: C.muted,
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <IconPaperclip size={18} stroke={1.5} />
          </button>
          <input
            value={chat}
            onChange={(e) => setChat(e.target.value)}
            placeholder={
              pending.length > 0
                ? 'Answer here…'
                : packaging
                  ? 'Packaging — watch … lines…'
                  : handedOff
                    ? 'Ask about the package, or start a new BRD…'
                    : refining
                      ? 'What’s wrong? Paste a screenshot…'
                      : 'Message…'
            }
            disabled={busy}
            style={{
              flex: 1,
              height: 40,
              border: 0,
              outline: 'none',
              background: 'transparent',
              color: C.text,
              fontSize: 13,
            }}
          />
          <button
            type="submit"
            disabled={busy || !canSend}
            aria-label="Send"
            style={{
              width: 34,
              height: 34,
              border: 0,
              borderRadius: 8,
              background: 'transparent',
              color: canSend ? C.pink : C.muted,
              cursor: busy || !canSend ? 'default' : 'pointer',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <IconSend size={18} stroke={1.5} />
          </button>
        </div>
      </form>
    </>
  )
}

function ChatBubble({ message }: { message: AgentMessage }) {
  const you = message.role === 'you'
  const images = message.images ?? []
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: you ? 'flex-end' : 'flex-start',
        marginBottom: 12,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: C.muted,
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {you ? 'You' : DESIGN_AGENT.name}
      </div>
      <div
        style={{
          maxWidth: '90%',
          padding: '8px 12px',
          borderRadius: 8,
          background: you ? C.pink : '#1c1c1c',
          color: you ? '#fff' : C.text,
          border: you ? undefined : `1px solid ${C.line}`,
          fontSize: 13,
          whiteSpace: 'pre-wrap',
          lineHeight: 1.45,
        }}
      >
        {message.text}
        {images.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginTop: message.text ? 8 : 0,
            }}
          >
            {images.map((src) => (
              <a
                key={src}
                href={src}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'block' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt="Feedback screenshot"
                  style={{
                    width: '100%',
                    maxWidth: 280,
                    borderRadius: 6,
                    display: 'block',
                    border: you
                      ? '1px solid rgba(255,255,255,0.25)'
                      : `1px solid ${C.line}`,
                  }}
                />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
