'use client'

import { PokerLandingPage } from '@/components/lumen/poker-landing-page'
import { ShellFrame } from '@/components/site/shell-frame'

/** Live poker — Figma Poker_Landing-Page 78:163252 inside the shipped shell. */
export default function Page() {
  return (
    <ShellFrame loggedIn>
      <PokerLandingPage />
    </ShellFrame>
  )
}
