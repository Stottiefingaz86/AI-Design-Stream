'use client'

import { CasinoActivity, CasinoGameShelf } from '@/components/lumen/casino-lobby-page'
import { useShell } from '@/components/site/shell-context'
import {
  SPECIALTY_KENO,
  SPECIALTY_OTHER_GAMES,
  SPECIALTY_SCRATCH_CARDS,
} from '@/lib/lumen/casino-lobby-catalog'

/** Specialty Games lobby — same sectioned layout as Live Casino. */
export function CasinoSpecialtyLobby() {
  const { launchGame } = useShell()

  return (
    <div data-name="specialty_content" className="w-full bg-background pb-8">
      <CasinoGameShelf title="Scratch Cards" games={SPECIALTY_SCRATCH_CARDS} onLaunch={launchGame} />
      <CasinoGameShelf title="Keno" games={SPECIALTY_KENO} onLaunch={launchGame} />
      <CasinoGameShelf title="Other Games" games={SPECIALTY_OTHER_GAMES} onLaunch={launchGame} />
      <CasinoActivity />
    </div>
  )
}
