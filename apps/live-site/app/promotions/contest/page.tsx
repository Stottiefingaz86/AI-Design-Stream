'use client'

import { ContestsLobbyPage } from '@/components/lumen/contests-lobby-page'
import { ShellFrame } from '@/components/site/shell-frame'

/** Promo26 Contest Main Lobby — 2144:393391. */
export default function Page() {
  return (
    <ShellFrame loggedIn>
      <ContestsLobbyPage />
    </ShellFrame>
  )
}
