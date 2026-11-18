'use client'

import { Typography } from '@/components/ui/typography'
import { DailyRacesPanel } from '@/components/lumen/daily-races-panel'
import { cn } from '@/lib/utils'

/** Promotions · Races — progress + leaderboard (above Contests in nav). */
export function DailyRacesPage({ className }: { className?: string }) {
  return (
    <div
      data-name="daily_races_page"
      className={cn('w-full bg-background px-6 pb-14 pt-6', className)}
    >
      <Typography as="h1" shape="h2" weight="semibold" className="mb-4">
        Races
      </Typography>
      <div className="mx-auto w-full max-w-2xl">
        <DailyRacesPanel />
      </div>
    </div>
  )
}
