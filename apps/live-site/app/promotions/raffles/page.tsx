'use client'

import { RafflesPage } from '@/components/lumen/raffles-page'
import { ShellFrame } from '@/components/site/shell-frame'

/** Promotions · Weekly Raffle (V2 side menu). */
export default function Page() {
  return (
    <ShellFrame>
      <RafflesPage />
    </ShellFrame>
  )
}
