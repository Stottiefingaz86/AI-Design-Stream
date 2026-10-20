'use client'

import { MyBonusPage } from '@/components/lumen/my-bonus-page'
import { ShellFrame } from '@/components/site/shell-frame'

/** Promo26 My Bonus — Sports / Casino tables inside the shipped shell. */
export default function Page() {
  return (
    <ShellFrame loggedIn>
      <MyBonusPage />
    </ShellFrame>
  )
}
