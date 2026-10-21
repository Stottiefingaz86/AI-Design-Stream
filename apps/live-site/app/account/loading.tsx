import { MyAccountSkeleton } from '@/components/lumen/my-account-skeleton'

/** Layout already owns ShellFrame — only swap page content. */
export default function Loading() {
  return <MyAccountSkeleton />
}
