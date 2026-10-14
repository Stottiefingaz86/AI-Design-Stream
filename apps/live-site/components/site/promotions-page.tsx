'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { Shimmer } from '@/components/lumen/animations'
import { RewardCard } from '@/components/lumen/reward-card'
import { ShellFrame } from './shell-frame'
import { SiteFooter } from './site-footer'

const PROMOS = [
  { title: 'Diner Match', copy: 'First deposit bonus up to 250%.', img: '/banners/dinerMatchBackground.png' },
  { title: 'Weekly Boost', copy: 'Reload every week as you climb VIP.', img: '/banners/weekly.png' },
  { title: 'Free Spins', copy: '10 free spins for 10 days.', img: '/banners/freespins.png' },
]

export function PromotionsPage() {
  return (
    <ShellFrame loggedIn>
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6">
        <Typography as="h1" shape="h2" weight="bold">
          Promotions
        </Typography>
        <Typography as="p" shape="small" variant="muted" className="mt-2 mb-8">
          Offers built from the same Storybook Card, Button, Typography, and RewardCard.
        </Typography>
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {PROMOS.map((p) => (
            <Card key={p.title} className="overflow-hidden">
              <div className="relative h-36">
                <Image src={p.img} alt="" fill className="object-cover" unoptimized />
              </div>
              <CardHeader>
                <Typography as="h2" shape="h4" weight="semibold">
                  {p.title}
                </Typography>
              </CardHeader>
              <CardContent>
                <Typography as="p" shape="small" variant="muted">
                  {p.copy}
                </Typography>
              </CardContent>
              <CardFooter>
                <Shimmer active tint="primary" trigger="hover">
                  <Button>Claim</Button>
                </Shimmer>
              </CardFooter>
            </Card>
          ))}
        </div>
        <RewardCard />
      </div>
      <SiteFooter />
    </ShellFrame>
  )
}
