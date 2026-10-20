'use client'

import { CasinoLobby } from '@/components/site/casino-page'
import { ShellFrame } from '@/components/site/shell-frame'

/** Live casino at `/` — same shell + sub-nav + banner row as `/casino`. */
export default function Page() {
  return (
    <ShellFrame loggedIn>
      <CasinoLobby />
    </ShellFrame>
  )
}
