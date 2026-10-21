import { SecurityCentralSkeleton } from '@/components/lumen/security-central-skeleton'

/** Layout already owns ShellFrame — only swap page content. */
export default function Loading() {
  return <SecurityCentralSkeleton />
}