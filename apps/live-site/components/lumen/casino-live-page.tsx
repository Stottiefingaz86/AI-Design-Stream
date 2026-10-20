'use client'

import {
  CasinoActivity,
  CasinoGameShelf,
  CasinoTop10,
} from '@/components/lumen/casino-lobby-page'
import { useShell } from '@/components/site/shell-context'
import {
  LIVE_BACCARAT_GAMES,
  LIVE_BLACKJACK_GAMES,
  LIVE_OTHER_GAMES,
  LIVE_POKER_GAMES,
  LIVE_ROULETTE_GAMES,
  LIVE_TOP10_GAMES,
  LIVE_VIP_TABLES,
} from '@/lib/lumen/casino-lobby-catalog'

/** Casino-Lumen Live Casino lobby — Figma 110:80910. */
export function CasinoLiveLobby() {
  const { launchGame } = useShell()

  return (
    <div data-name="live-casino_content" className="w-full bg-background pb-8">
      <CasinoGameShelf title="VIP Tables" games={LIVE_VIP_TABLES} onLaunch={launchGame} />
      <CasinoGameShelf title="Blackjack" games={LIVE_BLACKJACK_GAMES} onLaunch={launchGame} />
      <CasinoTop10 title="Top 10 Live Casino" games={LIVE_TOP10_GAMES} onLaunch={launchGame} />
      <CasinoGameShelf title="Baccarat" games={LIVE_BACCARAT_GAMES} onLaunch={launchGame} />
      <CasinoGameShelf title="Roulette" games={LIVE_ROULETTE_GAMES} onLaunch={launchGame} />
      <CasinoGameShelf
        title="Casino Poker"
        games={LIVE_POKER_GAMES}
        showPlayRandom
        onLaunch={launchGame}
      />
      <CasinoGameShelf title="Other Games" games={LIVE_OTHER_GAMES} onLaunch={launchGame} />
      <CasinoActivity />
    </div>
  )
}
