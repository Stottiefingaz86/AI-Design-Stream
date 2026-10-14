'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Shimmer } from './animations'

export function RewardCard({
  title = 'VIP Rewards',
  description = 'Become a VIP the moment you place your first bet. Climb every VIP rank from Bronze to Obsidian and unlock bigger rewards along the way.',
  chips = ['Rakeback', 'Refer a Friend', 'Monthly Reload', 'Weekly Boost', 'Monthly Boost', 'Post-Monthly Boost'],
  buttonLabel = 'Explore VIP Rewards',
  buttonAction,
}: {
  title?: string
  description?: string
  chips?: string[]
  buttonLabel?: string
  buttonAction?: () => void
}) {
  return (
    <Card className="overflow-hidden border-border bg-card md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <CardHeader className="pb-3">
          <Typography shape="xs" variant="primary" weight="semibold" className="uppercase tracking-wide text-vip-rewards">
            VIP Rewards
          </Typography>
          <Typography as="h2" shape="h3" weight="bold">
            {title === 'VIP Rewards' ? 'Become a VIP the moment you place your first bet.' : title}
          </Typography>
        </CardHeader>
        <CardContent>
          <Typography as="p" shape="small" variant="muted">
            {description}
          </Typography>
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((item) => (
              <span key={item} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                {item}
              </span>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Shimmer active tint="primary" trigger="hover">
            <Button onClick={buttonAction}>{buttonLabel}</Button>
          </Shimmer>
        </CardFooter>
      </div>
      <div className="relative hidden h-40 w-40 shrink-0 pr-8 md:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/shell/crown.svg" alt="" className="h-full w-full object-contain opacity-90" />
      </div>
    </Card>
  )
}
