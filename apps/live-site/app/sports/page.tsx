import { HomeMarketsShelf } from '@/components/lumen/markets/markets-home-page'
import { V3Switch } from '@/components/lumen/markets/v3-switch'
import { SportsHomePage } from '@/components/lumen/sports-home-page'
import { ShellFrame } from '@/components/site/shell-frame'
import { serverSiteVersion } from '@/lib/lumen/site-version-server'

/** Sports Home — V3 adds the Markets shelf under Popular. */
export default function Page() {
  return (
    <ShellFrame>
      <V3Switch
        initial={serverSiteVersion()}
        v3={<SportsHomePage markets={<HomeMarketsShelf />} />}
      >
        <SportsHomePage />
      </V3Switch>
    </ShellFrame>
  )
}
