'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconCheck } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { useShell } from '@/components/site/shell-context'
import {
  MISSIONS,
  formatMissionProgress,
  missionProgressPct,
  type Mission,
  type MissionCategory,
  type MissionStatus,
} from '@/lib/lumen/missions'
import { cn } from '@/lib/utils'

const CARD =
  'rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]'

/** Content-width claim — hub height/radius, never flex-1 full bleed. */
const CTA = 'h-9 w-auto shrink-0 rounded-lg px-4 disabled:opacity-100'

/** DVD / casino tile ratio (~152×207). */
const TILE_W = 64
const TILE_H = 87

const FILTERS: { id: 'all' | MissionCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'casino', label: 'Casino' },
  { id: 'sports', label: 'Sports' },
]

/**
 * VIP Hub — Missions. Casino + sports; claim uses hub confetti / toast / balance roll.
 */
export function MissionsPanel() {
  const { claimMissionReward } = useShell()
  const [missions, setMissions] = useState(MISSIONS)
  const [filter, setFilter] = useState<'all' | MissionCategory>('all')

  const visible = useMemo(
    () => (filter === 'all' ? missions : missions.filter((m) => m.category === filter)),
    [filter, missions],
  )

  const claim = (mission: Mission, button: HTMLButtonElement | null) => {
    if (mission.status !== 'claimable') return
    const amount = mission.rewardAmount > 0 ? mission.rewardAmount : 10
    claimMissionReward(amount, button)
    setMissions((prev) =>
      prev.map((m) => (m.id === mission.id ? { ...m, status: 'claimed' } : m)),
    )
  }

  return (
    <div className="flex flex-col gap-3" data-name="module-missions">
      <div
        role="tablist"
        aria-label="Mission category"
        className="flex gap-1 border-b border-border"
      >
        {FILTERS.map((f) => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.id)}
              className={cn(
                'relative -mb-px border-b-2 px-3 pb-2.5 text-sm transition-colors',
                active
                  ? 'border-primary font-medium text-foreground'
                  : 'border-transparent font-medium text-muted-foreground hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {visible.map((mission) => (
        <MissionCard key={mission.id} mission={mission} onClaim={claim} />
      ))}
    </div>
  )
}

function MissionCard({
  mission,
  onClaim,
}: {
  mission: Mission
  onClaim: (mission: Mission, button: HTMLButtonElement | null) => void
}) {
  const router = useRouter()
  const btnRef = useRef<HTMLButtonElement>(null)
  const { loggedIn, openAuth, startNavigating, setVipHubOpen } = useShell()
  const pct = missionProgressPct(mission)
  const progress = formatMissionProgress(mission)
  const done = mission.status === 'claimable' || mission.status === 'claimed'
  const canClaim = mission.status === 'claimable'

  return (
    <article className={cn(CARD, 'overflow-hidden')} data-name={`mission-${mission.id}`}>
      <div className="flex gap-3.5 p-4">
        <div
          className="relative shrink-0 overflow-hidden rounded-[10px] bg-secondary shadow-[0_0_16px_rgba(0,0,0,0.06)]"
          style={{ width: TILE_W, height: TILE_H }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mission.imageSrc}
            alt={mission.imageAlt}
            className="size-full object-cover object-center"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-0.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {mission.category === 'sports' ? 'Sports' : 'Casino'}
          </p>
          <Typography as="h3" shape="h4" weight="semibold" className="text-[15px] leading-5">
            {mission.title}
          </Typography>
          <p className="line-clamp-3 text-xs leading-4 text-muted-foreground">
            {mission.body}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-border px-4 pb-4 pt-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'flex size-5 shrink-0 items-center justify-center rounded-full border',
              done
                ? 'border-success bg-success text-success-foreground'
                : 'border-border bg-secondary text-muted-foreground',
            )}
            aria-hidden
          >
            {done ? <IconCheck className="size-3" strokeWidth={3} /> : null}
          </span>
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
            {mission.objective}
          </p>
          <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
            {progress.current} / {progress.target}
          </span>
        </div>

        <div
          className="h-2 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={mission.objective}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-0.5">
          <Button
            ref={btnRef}
            type="button"
            size="lg"
            className={cn(CTA, !canClaim && 'text-muted-foreground')}
            disabled={mission.status !== 'claimable'}
            variant={canClaim ? 'default' : 'secondary'}
            onClick={() => {
              if (!loggedIn) {
                openAuth('login')
                return
              }
              if (canClaim) onClaim(mission, btnRef.current)
            }}
          >
            {ctaLabel(mission.status, mission.rewardLabel)}
          </Button>
          <button
            type="button"
            className="shrink-0 text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            onClick={() => {
              setVipHubOpen(false)
              startNavigating('/promotions')
              router.push('/promotions')
            }}
          >
            T&amp;Cs
          </button>
        </div>
      </div>
    </article>
  )
}

function ctaLabel(status: MissionStatus, rewardLabel: string) {
  if (status === 'claimed') return 'Claimed'
  if (status === 'claimable') {
    return rewardLabel.startsWith('Claim') ? rewardLabel : `Claim ${rewardLabel}`
  }
  return 'Claim Reward'
}
