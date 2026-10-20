'use client'

import { PokerLandingPage } from '@/components/lumen/poker-landing-page'
import { ShellFrame } from './shell-frame'

/** Live poker — Figma Poker_Landing-Page 78:163252. Prefer app/poker/page.tsx. */
export function PokerPage() {
  return (
    <ShellFrame loggedIn>
      <PokerLandingPage />
    </ShellFrame>
  )
}
