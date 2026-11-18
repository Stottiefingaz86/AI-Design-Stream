import { SoccerSportSkeleton } from '@/components/lumen/soccer-sport-skeleton'
import { ShellFrame } from '@/components/site/shell-frame'

export default function Loading() {
  return (
    <ShellFrame skeleton>
      <SoccerSportSkeleton />
    </ShellFrame>
  )
}
