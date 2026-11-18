import { ReferAFriendSkeleton } from '@/components/lumen/refer-a-friend-skeleton'
import { ShellFrame } from '@/components/site/shell-frame'

export default function Loading() {
  return (
    <ShellFrame skeleton>
      <ReferAFriendSkeleton />
    </ShellFrame>
  )
}
