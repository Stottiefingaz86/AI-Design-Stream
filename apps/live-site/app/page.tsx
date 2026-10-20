'use client'

import { HomepageLobby } from '@/components/lumen/homepage-lobby-page'
import { ShellFrame } from '@/components/site/shell-frame'

/** Site landing — Homepage_SHADCN. Casino lobby lives at `/casino`. */
export default function Page() {
  return (
    <ShellFrame loggedIn>
      <HomepageLobby />
    </ShellFrame>
  )
}
