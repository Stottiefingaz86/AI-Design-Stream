import { ProfileSettingsSkeleton } from '@/components/lumen/profile-settings-skeleton'

/** Layout already owns ShellFrame — only swap page content. */
export default function Loading() {
  return <ProfileSettingsSkeleton />
}