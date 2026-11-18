import { RafflesSkeleton } from '@/components/lumen/v2-promos-skeleton'
import { ShellFrame } from '@/components/site/shell-frame'

export default function Loading() {
  return (
    <ShellFrame skeleton>
      <RafflesSkeleton />
    </ShellFrame>
  )
}
