import { MyBetsSkeleton } from '@/components/lumen/my-bets-skeleton'
import { ShellFrame } from '@/components/site/shell-frame'

export default function Loading() {
  return (
    <ShellFrame skeleton>
      <MyBetsSkeleton />
    </ShellFrame>
  )
}
