import { notFound } from 'next/navigation'
import { SportsHomePage } from '@/components/lumen/sports-home-page'
import { ShellFrame } from '@/components/site/shell-frame'
import { ComboSportsPage } from '@/components/lumen/v5/combo-sports-page'
import { V5Switch } from '@/components/lumen/v5/v5-switch'
import { serverSiteVersion } from '@/lib/lumen/site-version-server'
import { V5_SPORT_SLUGS } from '@/lib/lumen/v5-sport-slugs'

/**
 * Every other sport in the side nav (basketball, hockey, tennis, golf, racing…).
 * V5 · Combos owns them; earlier versions keep landing on Sports Home as before.
 */
export default function Page({ params }: { params: { sport: string } }) {
  const sport = V5_SPORT_SLUGS[params.sport]
  if (!sport) notFound()
  return (
    <ShellFrame>
      <V5Switch initial={serverSiteVersion()} v5={<ComboSportsPage sport={sport} />}>
        <SportsHomePage />
      </V5Switch>
    </ShellFrame>
  )
}
