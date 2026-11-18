'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { DailyRacesPage } from '@/components/lumen/daily-races-page'
import { PrototypeInitiativeFallback } from '@/components/lumen/prototype-initiative-fallback'
import { VipBenefitsPrototypePage } from '@/components/lumen/vip-benefits-prototype-page'
import { ShellFrame } from '@/components/site/shell-frame'
import {
  looksLikeBenefitsInitiative,
  prototypeEntry,
  prototypeLabel,
} from '@/lib/agent/prototype-registry'
import type { AgentJob } from '@/lib/agent/types'

/**
 * Design-lane preview — not the demo product nav.
 * Hosted: same origin. Local: :3001 with PROTOTYPE_LANE=1.
 */
export default function PrototypePage() {
  const params = useParams()
  const slug = String(params.slug ?? '')
  const entry = prototypeEntry(slug)
  const [job, setJob] = useState<AgentJob | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`/api/agent/brd/${encodeURIComponent(slug)}`)
        if (!res.ok) return
        const data = (await res.json()) as { job?: AgentJob }
        if (!cancelled && data.job) setJob(data.job)
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  const body = (() => {
    if (slug === '001-daily-races-page') return <DailyRacesPage />
    if (looksLikeBenefitsInitiative(slug, job?.title, job?.brief)) {
      return <VipBenefitsPrototypePage />
    }
    if (job) return <PrototypeInitiativeFallback job={job} />
    return (
      <div className="px-6 py-16 text-center text-sm text-muted-foreground">
        Loading prototype for <code className="text-foreground">{slug}</code>…
      </div>
    )
  })()

  const deskHref = '/designagent'

  return (
    <div data-prototype-lane="" className="min-h-svh bg-background">
      <div
        className="sticky top-0 z-[60] flex flex-wrap items-center justify-between gap-2 border-b border-border bg-[#121212] px-4 py-2 text-xs text-muted-foreground"
        data-name="prototype-chrome"
      >
        <span>
          <span className="font-semibold text-foreground">Prototype</span>
          {' · '}
          {entry?.label ?? prototypeLabel(slug)}
          {' · '}
          design lane — not demo nav
        </span>
        <div className="flex items-center gap-3">
          <Link
            href={deskHref}
            className="text-foreground underline-offset-2 hover:underline"
          >
            Design agent
          </Link>
          {entry?.livePath ? (
            <span className="tabular-nums opacity-70">
              Merge to demo later: {entry.livePath}
            </span>
          ) : null}
        </div>
      </div>
      <ShellFrame>{body}</ShellFrame>
    </div>
  )
}
