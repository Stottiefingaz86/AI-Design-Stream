'use client'

import { DailyRacesPage } from '@/components/lumen/daily-races-page'
import { RacesPage } from '@/components/lumen/races-page'
import { ShellFrame } from '@/components/site/shell-frame'
import { useSiteVersion } from '@/lib/lumen/site-versions'

/** Promotions · Races — V1 SpecKit panel; V2 Daily / Weekly race page. */
export default function Page() {
  const version = useSiteVersion()
  return <ShellFrame>{version === 'v2' ? <RacesPage /> : <DailyRacesPage />}</ShellFrame>
}
