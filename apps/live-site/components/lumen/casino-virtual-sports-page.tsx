'use client'

import { CasinoActivity, CasinoGameShelf } from '@/components/lumen/casino-lobby-page'
import { useShell } from '@/components/site/shell-context'
import { VIRTUAL_ESPORTS, VIRTUAL_SPORTS } from '@/lib/lumen/casino-lobby-catalog'

/** Virtual Sports lobby — same sectioned layout as Live Casino. */
export function CasinoVirtualSportsLobby() {
  const { launchGame } = useShell()

  return (
    <div data-name="virtual-sports_content" className="w-full bg-background pb-8">
      <CasinoGameShelf title="Esports" games={VIRTUAL_ESPORTS} onLaunch={launchGame} />
      <CasinoGameShelf title="Sports" games={VIRTUAL_SPORTS} onLaunch={launchGame} />
      <CasinoActivity />
    </div>
  )
}
