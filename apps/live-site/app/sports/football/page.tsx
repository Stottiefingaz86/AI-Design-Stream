import { HomeMarketsShelf } from '@/components/lumen/markets/markets-home-page'
import { V3Switch } from '@/components/lumen/markets/v3-switch'
import { NflSportPage } from '@/components/lumen/nfl-sport-page'
import { ShellFrame } from '@/components/site/shell-frame'
import { serverSiteVersion } from '@/lib/lumen/site-version-server'

/** Football — SGP mode + board promos; V3 adds Markets under the boards. */
export default function Page() {
  return (
    <ShellFrame>
      <V3Switch
        initial={serverSiteVersion()}
        v3={<NflSportPage markets={<HomeMarketsShelf sport="nfl" />} />}
      >
        <NflSportPage />
      </V3Switch>
    </ShellFrame>
  )
}
