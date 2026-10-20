'use client'

import { CasinoActivity, CasinoGameShelf } from '@/components/lumen/casino-lobby-page'
import { useShell } from '@/components/site/shell-context'
import {
  VIDEO_POKER_MULTI_HAND,
  VIDEO_POKER_SINGLE_HAND,
} from '@/lib/lumen/casino-lobby-catalog'

/** Video Poker lobby — same sectioned layout as Live Casino. */
export function CasinoVideoPokerLobby() {
  const { launchGame } = useShell()

  return (
    <div data-name="video-poker_content" className="w-full bg-background pb-8">
      <CasinoGameShelf title="Multi Hand" games={VIDEO_POKER_MULTI_HAND} onLaunch={launchGame} />
      <CasinoGameShelf title="Single Hand" games={VIDEO_POKER_SINGLE_HAND} onLaunch={launchGame} />
      <CasinoActivity />
    </div>
  )
}
