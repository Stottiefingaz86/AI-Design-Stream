import { Suspense } from 'react'
import { HomeMarketsShelf } from '@/components/lumen/markets/markets-home-page'
import { V3Switch } from '@/components/lumen/markets/v3-switch'
import { SoccerSportPage } from '@/components/lumen/soccer-sport-page'
import { ShellFrame } from '@/components/site/shell-frame'
import { ComboSportsPage } from '@/components/lumen/v5/combo-sports-page'
import { V5Switch } from '@/components/lumen/v5/v5-switch'
import { serverSiteVersion } from '@/lib/lumen/site-version-server'

/** Soccer — SGP mode + board promos; V3 adds Markets under the boards. */
export default function Page() {
  return (
    <ShellFrame>
      <V5Switch initial={serverSiteVersion()} v5={<ComboSportsPage sport="soccer" />}>
        <V3Switch
          initial={serverSiteVersion()}
          v3={
            <Suspense fallback={null}>
              <SoccerSportPage markets={<HomeMarketsShelf sport="soccer" />} />
            </Suspense>
          }
        >
          <Suspense fallback={null}>
            <SoccerSportPage />
          </Suspense>
        </V3Switch>
      </V5Switch>
    </ShellFrame>
  )
}
