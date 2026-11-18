import { CasinoShelvesLobbySkeleton } from '@/components/lumen/casino-lobby-skeleton'

export default function Loading() {
  return (
    <CasinoShelvesLobbySkeleton
      titles={['Roulette', 'Other Table Games', 'Baccarat', 'Casino Poker']}
    />
  )
}
