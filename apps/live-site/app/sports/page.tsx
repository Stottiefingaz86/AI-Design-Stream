import { HomeMarketsShelf } from '@/components/lumen/markets/markets-home-page'
import { V3Switch } from '@/components/lumen/markets/v3-switch'
import { SportsHomePage } from '@/components/lumen/sports-home-page'
import { ShellFrame } from '@/components/site/shell-frame'
import { ComboSportsPage } from '@/components/lumen/v5/combo-sports-page'
import { V5Switch } from '@/components/lumen/v5/v5-switch'
import { serverSiteVersion } from '@/lib/lumen/site-version-server'

/** Sports Home — V3 adds the Markets shelf under Popular. */
export default function Page() {
  return (
    <ShellFrame>
      <V5Switch initial={serverSiteVersion()} v5={<ComboSportsPage />}>
        <V3Switch
          initial={serverSiteVersion()}
          v3={<SportsHomePage markets={<HomeMarketsShelf />} />}
        >
          <SportsHomePage />
        </V3Switch>
      </V5Switch>
    </ShellFrame>
  )
}
