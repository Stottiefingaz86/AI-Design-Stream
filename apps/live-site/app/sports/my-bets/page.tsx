import { PortfolioHero } from '@/components/lumen/markets/portfolio-page'
import { V3Switch } from '@/components/lumen/markets/v3-switch'
import { MyBetsPage } from '@/components/lumen/my-bets-page'
import { ShellFrame } from '@/components/site/shell-frame'
import { serverSiteVersion } from '@/lib/lumen/site-version-server'

/** Sports My Bets — pending, settled, straights / parlays / SGPs. V3 adds an account-value hero. */
export default function Page() {
  return (
    <ShellFrame>
      <V3Switch initial={serverSiteVersion()} v3={<MyBetsPage hero={<PortfolioHero />} />}>
        <MyBetsPage />
      </V3Switch>
    </ShellFrame>
  )
}
