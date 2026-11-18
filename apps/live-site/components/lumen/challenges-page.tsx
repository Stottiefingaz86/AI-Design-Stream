'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import { IconPlayerPlayFilled } from '@tabler/icons-react'
import { PromoPageHero } from '@/components/lumen/promo-page-hero'
import { useShell } from '@/components/site/shell-context'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CHALLENGES,
  formatMultiplier,
  formatUsd,
  type Challenge,
  type ChallengeStatus,
} from '@/lib/lumen/challenges'
import { cn } from '@/lib/utils'

const CARD = 'rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]'

/** V2 Promotions · Challenges — first to hit the multiplier wins the cash reward. */
export function ChallengesPage({ className }: { className?: string }) {
  const { launchGame } = useShell()
  const [status, setStatus] = useState<ChallengeStatus>('active')

  const active = useMemo(() => CHALLENGES.filter((c) => c.status === 'active'), [])
  const pool = useMemo(() => active.reduce((sum, c) => sum + c.rewardUsd, 0), [active])
  const shown = useMemo(() => CHALLENGES.filter((c) => c.status === status), [status])

  return (
    <div
      data-name="challenges_page"
      className={cn('flex w-full flex-col gap-6 bg-background px-6 pb-14 pt-6', className)}
    >
      <PromoPageHero
        title="Casino Challenges"
        subtitle="First to hit the target multiplier wins the prize."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={status} onValueChange={(v) => setStatus(v as ChallengeStatus)}>
          <TabsList>
            <TabsTrigger value="active" className="min-w-24">
              Active
            </TabsTrigger>
            <TabsTrigger value="finished" className="min-w-24">
              Finished
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold tabular-nums text-foreground">{active.length}</span> active
          · <span className="font-semibold tabular-nums text-foreground">{formatUsd(pool)}</span> in
          prizes
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((challenge, index) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            index={index}
            onPlay={(el) => launchGame(challenge.game, el)}
          />
        ))}
      </div>
    </div>
  )
}

function ChallengeCard({
  challenge,
  index,
  onPlay,
}: {
  challenge: Challenge
  index: number
  onPlay: (el: HTMLElement) => void
}) {
  const finished = challenge.status === 'finished'

  return (
    <article
      data-name="challenge-card"
      className={cn(
        CARD,
        'lm-tile-enter flex gap-4 p-3 transition-colors',
        !finished && 'hover:border-foreground/15',
      )}
      style={{ '--lm-tile-i': index } as CSSProperties}
    >
      <img
        src={challenge.game.imageSrc}
        alt=""
        className={cn(
          'aspect-[152/207] w-28 shrink-0 rounded-lg object-cover',
          finished && 'opacity-50 grayscale',
        )}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-base font-semibold text-foreground">{challenge.game.title}</p>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          First to hit{' '}
          <span className="font-semibold text-foreground">
            {formatMultiplier(challenge.multiplier)}
          </span>{' '}
          with a minimum bet of{' '}
          <span className="font-semibold text-foreground">{formatUsd(challenge.minBetUsd)}</span>
        </p>

        <dl className="mt-3 flex flex-col gap-1 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Prize</dt>
            <dd className="font-semibold tabular-nums text-foreground">
              {formatUsd(challenge.rewardUsd)}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">{finished ? 'Winner' : 'Provider'}</dt>
            <dd className="truncate text-foreground">
              {finished ? (challenge.winner ?? 'Hidden') : challenge.game.vendor}
            </dd>
          </div>
        </dl>

        <div className="mt-auto pt-3">
          {finished ? (
            <Button type="button" variant="secondary" size="lg" className="w-full" disabled>
              Finished
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={(e) => onPlay(e.currentTarget)}
            >
              <IconPlayerPlayFilled className="size-4" aria-hidden />
              Play Game
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
