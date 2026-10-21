'use client'

import { IconInfoCircle } from '@tabler/icons-react'
import { LumenTooltip } from '@/components/ui/lumen-tooltip'

/** Placeholder for account sections beyond Home until those Figma frames ship. */
export function MyAccountSectionStub({ title }: { title: string }) {
  return (
    <section className="flex w-full flex-col gap-4 bg-background px-4 pb-6 pt-4 lg:px-6 lg:pb-10 lg:pt-6">
      <div className="flex items-center gap-1.5">
        <h1 className="text-xl font-semibold leading-7 text-foreground lg:text-2xl lg:leading-8">
          {title}
        </h1>
        <LumenTooltip label={`${title} — coming soon`} side="bottom">
          <button
            type="button"
            aria-label={`About ${title}`}
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <IconInfoCircle className="size-4" stroke={1.75} aria-hidden />
          </button>
        </LumenTooltip>
      </div>
      <div className="rounded-[10px] border border-border bg-card p-6 shadow-[0_0_16px_rgba(0,0,0,0.06)]">
        <p className="text-sm font-medium leading-5 text-muted-foreground">
          This section is next in the My Account Figma set. Home is live now.
        </p>
      </div>
    </section>
  )
}
