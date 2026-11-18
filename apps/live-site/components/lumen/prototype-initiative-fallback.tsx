'use client'

import type { AgentJob } from '@/lib/agent/types'

/** When no dedicated prototype component exists — still show the BRD, not an empty error. */
export function PrototypeInitiativeFallback({ job }: { job: AgentJob }) {
  const refs = (job.brief.match(/\/(?:api\/agent\/asset|design-agent)\/[^\s)]+/g) ?? []).slice(
    0,
    8,
  )

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8 sm:px-6">
      <div className="rounded-[10px] border border-border bg-card p-5 shadow-[0_0_16px_rgba(0,0,0,0.06)]">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {job.surface} · design lane
        </div>
        <h1 className="mt-1 text-xl font-semibold text-foreground">{job.title}</h1>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {job.brief.replace(/## Reference screenshots[\s\S]*$/i, '').trim() ||
            'No brief text — see screenshots below.'}
        </p>
      </div>
      {refs.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {refs.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              className="max-h-64 w-full rounded-[10px] border border-border object-contain bg-popover"
            />
          ))}
        </div>
      ) : null}
      <p className="text-center text-xs text-muted-foreground">
        Dedicated layout not wired for this slug yet — refine in chat / Cursor, then refresh.
      </p>
    </div>
  )
}
