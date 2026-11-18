import { SportsHomeSkeleton } from '@/components/lumen/sports-home-skeleton'
import { ShellFrame } from '@/components/site/shell-frame'

export default function Loading() {
  return (
    <ShellFrame skeleton>
      <SportsHomeSkeleton />
    </ShellFrame>
  )
}
