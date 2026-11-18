'use client'

import { Suspense } from 'react'
import { SoccerSportPage } from '@/components/lumen/soccer-sport-page'
import { ShellFrame } from '@/components/site/shell-frame'

/** PropShopX sport-specific — Soccer // Games. */
export default function Page() {
  return (
    <ShellFrame>
      <Suspense fallback={null}>
        <SoccerSportPage />
      </Suspense>
    </ShellFrame>
  )
}
