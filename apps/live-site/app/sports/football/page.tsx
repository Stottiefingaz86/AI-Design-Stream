import { HomeMarketsShelf } from '@/components/lumen/markets/markets-home-page'
import { V3Switch } from '@/components/lumen/markets/v3-switch'
import { NflSportPage } from '@/components/lumen/nfl-sport-page'
import { ShellFrame } from '@/components/site/shell-frame'
import { ComboSportsPage } from '@/components/lumen/v5/combo-sports-page'
import { V5Switch } from '@/components/lumen/v5/v5-switch'
import { serverSiteVersion } from '@/lib/lumen/site-version-server'

/** Football — SGP mode + board promos; V3 adds Markets under the boards. */
export default function Page() {
  return (
    <ShellFrame>
      <V5Switch initial={serverSiteVersion()} v5={<ComboSportsPage sport="nfl" />}>
        <V3Switch
          initial={serverSiteVersion()}
          v3={<NflSportPage markets={<HomeMarketsShelf sport="nfl" />} />}
        >
          <NflSportPage />
        </V3Switch>
      </V5Switch>
    </ShellFrame>
  )
}
