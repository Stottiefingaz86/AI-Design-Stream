import { HomepageLobbySkeleton } from '@/components/lumen/homepage-lobby-skeleton'
import { ShellFrame } from '@/components/site/shell-frame'

export default function Loading() {
  return (
    <ShellFrame skeleton>
      <HomepageLobbySkeleton />
    </ShellFrame>
  )
}
