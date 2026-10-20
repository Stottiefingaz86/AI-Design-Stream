'use client'

import { CasinoJackpots } from '@/components/lumen/casino-lobby-page'
import { useShell } from '@/components/site/shell-context'

const JACKPOT_BLOCKS: {
  title: string
  seed: string
  hideMustDrop?: boolean
}[] = [
  { title: 'Hot Jackpots', seed: 'hot' },
  { title: 'Halloween Jackpots', seed: 'halloween', hideMustDrop: true },
  { title: 'BGaming Jackpots', seed: 'bgaming', hideMustDrop: true },
]

/** Jackpots category — three jackpot blocks (tier bar + game rail). */
export function CasinoJackpotsLobby() {
  const { launchGame } = useShell()

  return (
    <div data-name="jackpots_content" className="w-full bg-background pb-8 pt-2">
      {JACKPOT_BLOCKS.map((block) => (
        <CasinoJackpots
          key={block.seed}
          title={block.title}
          seed={block.seed}
          hideMustDrop={block.hideMustDrop}
          seeMoreHref="/casino/category/jackpots"
          onLaunch={launchGame}
        />
      ))}
    </div>
  )
}
