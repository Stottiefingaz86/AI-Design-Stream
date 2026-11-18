'use client'

import { SportsHomePage } from '@/components/lumen/sports-home-page'
import { ShellFrame } from '@/components/site/shell-frame'

/** Sports Home — banners, Popular live, SGP packs, Premier League + NFL. */
export default function Page() {
  return (
    <ShellFrame>
      <SportsHomePage />
    </ShellFrame>
  )
}
