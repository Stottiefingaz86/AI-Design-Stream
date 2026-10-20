import { CasinoLobbySkeleton } from '@/components/lumen/casino-lobby-skeleton'
import { PokerLandingSkeleton } from '@/components/lumen/poker-landing-skeleton'
import { ShellFrame } from './shell-frame'

/** Next `loading.tsx` — real chrome + the matching product skeleton until the page chunk mounts. */
export function ProductRouteLoading({ product = 'casino' }: { product?: 'casino' | 'poker' }) {
  return (
    <ShellFrame skeleton>
      {product === 'poker' ? <PokerLandingSkeleton /> : <CasinoLobbySkeleton />}
    </ShellFrame>
  )
}
