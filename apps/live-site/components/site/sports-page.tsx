'use client'

import { Typography } from '@/components/ui/typography'

/** Sports product home — content cleared while sport-specific pages ship. */
export function SportsPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6">
      <Typography as="h1" shape="h2" weight="bold">
        Sports
      </Typography>
      <Typography as="p" shape="small" variant="muted" className="mt-2">
        Pick a sport from the side nav to browse markets.
      </Typography>
    </div>
  )
}
