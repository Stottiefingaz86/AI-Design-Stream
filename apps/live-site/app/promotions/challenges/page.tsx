'use client'

import { ChallengesPage } from '@/components/lumen/challenges-page'
import { ShellFrame } from '@/components/site/shell-frame'

/** Promotions · Challenges (V2 side menu). */
export default function Page() {
  return (
    <ShellFrame>
      <ChallengesPage />
    </ShellFrame>
  )
}
