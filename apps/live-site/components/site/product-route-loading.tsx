import { CasinoLobbySkeleton } from '@/components/lumen/casino-lobby-skeleton'
import { PokerLandingSkeleton } from '@/components/lumen/poker-landing-skeleton'
import { PromotionsLobbySkeleton } from '@/components/lumen/promotions-lobby-skeleton'
import type { ShellProduct } from './shell-nav'
import { ShellFrame } from './shell-frame'

/** Next `loading.tsx` — real chrome + the matching product skeleton until the page chunk mounts. */
export function ProductRouteLoading({
  product = 'casino',
}: {
  product?: Extract<ShellProduct, 'casino' | 'poker' | 'promotions'>
}) {
  return (
    <ShellFrame skeleton>
      {product === 'poker' ? (
        <PokerLandingSkeleton />
      ) : product === 'promotions' ? (
        <PromotionsLobbySkeleton />
      ) : (
        <CasinoLobbySkeleton />
      )}
    </ShellFrame>
  )
}
