import { SoccerEventSkeleton } from '@/components/lumen/soccer-event-skeleton'
import { ShellFrame } from '@/components/site/shell-frame'

export default function Loading() {
  return (
    <ShellFrame skeleton>
      <SoccerEventSkeleton />
    </ShellFrame>
  )
}
