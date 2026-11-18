'use client'

import { MyBetsPage } from '@/components/lumen/my-bets-page'
import { ShellFrame } from '@/components/site/shell-frame'

/** Sports My Bets — pending, settled, straights / parlays / SGPs. */
export default function Page() {
  return (
    <ShellFrame>
      <MyBetsPage />
    </ShellFrame>
  )
}
