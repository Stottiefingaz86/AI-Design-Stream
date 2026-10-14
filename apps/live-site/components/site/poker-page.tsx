'use client'

import { Typography } from '@/components/ui/typography'
import { Shelf } from './game-shelf'
import { ShellFrame } from './shell-frame'
import { SiteFooter } from './site-footer'

const TABLES = [
  { title: 'Texas Holdem', img: '/games/originals/blackjack.png', tag: 'Original' as const, vendor: 'Originals' },
  { title: 'Omaha', img: '/games/originals/video_poker.png', tag: 'Hot' as const, vendor: 'Originals' },
  { title: 'Video Poker', img: '/games/originals/video_poker.png', tag: 'New' as const, vendor: 'Originals' },
  { title: 'Sit & Go', img: '/games/originals/hilo.png', tag: 'Exclusive' as const, vendor: 'Originals' },
  { title: 'Tournaments', img: '/games/originals/wheel.png', tag: 'Early' as const, vendor: 'Originals' },
]

export function PokerPage() {
  return (
    <ShellFrame loggedIn>
      <div className="mx-auto w-full max-w-[1600px] py-6">
        <div className="mb-8 px-4 md:px-6">
          <Typography as="h1" shape="h2" weight="bold">
            Poker
          </Typography>
          <Typography as="p" shape="small" variant="muted" className="mt-2">
            Cash games, sit & gos, and tournaments on Lumen components.
          </Typography>
        </div>
        <Shelf title="Play Poker" games={TABLES} tall />
      </div>
      <SiteFooter />
    </ShellFrame>
  )
}
