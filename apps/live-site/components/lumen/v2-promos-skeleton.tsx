'use client'

import { DailyRacesSkeleton } from '@/components/lumen/daily-races-skeleton'
import { useSiteVersion } from '@/lib/lumen/site-versions'
import { cn } from '@/lib/utils'

function Block({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-[10px] bg-surface-muted-2', className)} />
}

export function ChallengesSkeleton() {
  return (
    <div data-name="challenges_skeleton" className="w-full bg-background px-6 pb-14 pt-6">
      <Block className="mb-6 h-[104px] w-full rounded-[14px]" />
      <Block className="mb-6 h-9 w-48" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 12 }, (_, i) => (
          <Block key={i} className="h-[178px] w-full" />
        ))}
      </div>
    </div>
  )
}

export function RafflesSkeleton() {
  return (
    <div data-name="raffles_skeleton" className="w-full bg-background px-6 pb-14 pt-6">
      <div className="flex flex-col gap-6">
        <Block className="h-[154px] w-full rounded-[14px]" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Block key={i} className="h-20 w-full" />
          ))}
        </div>
        <Block className="h-44 w-full" />
        <Block className="h-80 w-full" />
      </div>
    </div>
  )
}

export function RacesV2Skeleton() {
  return (
    <div data-name="races_skeleton" className="w-full bg-background px-6 pb-14 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <Block className="h-8 w-28" />
        <Block className="h-8 w-44" />
      </div>
      <div className="flex flex-col gap-4">
        <Block className="h-[164px] w-full rounded-[14px]" />
        <Block className="h-[420px] w-full" />
      </div>
    </div>
  )
}

/** /promotions/races is the V1 panel or the V2 page depending on site version. */
export function RacesRouteSkeleton() {
  return useSiteVersion() === 'v2' ? <RacesV2Skeleton /> : <DailyRacesSkeleton />
}
