'use client'

import { CasinoActivity, CasinoGameShelf } from '@/components/lumen/casino-lobby-page'
import { useShell } from '@/components/site/shell-context'
import {
  TABLE_BACCARAT_GAMES,
  TABLE_CASINO_POKER_GAMES,
  TABLE_OTHER_GAMES,
  TABLE_ROULETTE_GAMES,
} from '@/lib/lumen/casino-lobby-catalog'

/** Table Games lobby — same sectioned layout as Live Casino. */
export function CasinoTableGamesLobby() {
  const { launchGame } = useShell()

  return (
    <div data-name="table-games_content" className="w-full bg-background pb-8">
      <CasinoGameShelf
        title="Roulette"
        games={TABLE_ROULETTE_GAMES}
        seeMoreHref="/casino/category/roulette"
        onLaunch={launchGame}
      />
      <CasinoGameShelf
        title="Other Table Games"
        games={TABLE_OTHER_GAMES}
        seeMoreHref="/casino/category/table-other"
        onLaunch={launchGame}
      />
      <CasinoGameShelf
        title="Baccarat"
        games={TABLE_BACCARAT_GAMES}
        seeMoreHref="/casino/category/baccarat"
        onLaunch={launchGame}
      />
      <CasinoGameShelf
        title="Casino Poker"
        games={TABLE_CASINO_POKER_GAMES}
        seeMoreHref="/casino/category/casino-poker"
        onLaunch={launchGame}
      />
      <CasinoActivity />
    </div>
  )
}
