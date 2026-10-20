import { MyBonusSkeleton } from '@/components/lumen/my-bonus-skeleton'
import { ShellFrame } from '@/components/site/shell-frame'

export default function Loading() {
  return (
    <ShellFrame skeleton>
      <MyBonusSkeleton />
    </ShellFrame>
  )
}
