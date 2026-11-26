import { notFound } from 'next/navigation'
import { HomeMarketsShelf } from '@/components/lumen/markets/markets-home-page'
import { V3Switch } from '@/components/lumen/markets/v3-switch'
import { NflSportPage } from '@/components/lumen/nfl-sport-page'
import { ShellFrame } from '@/components/site/shell-frame'
import { ComboSportsPage } from '@/components/lumen/v5/combo-sports-page'
import { V5Switch } from '@/components/lumen/v5/v5-switch'
import { FOOTBALL_LEAGUES, type FootballLeague } from '@/lib/lumen/nfl-sport'
import { serverSiteVersion } from '@/lib/lumen/site-version-server'

/** Football // league page (NFL, NCAA Football). */
export default function Page({ params }: { params: { league: string } }) {
  const league = FOOTBALL_LEAGUES.find((l) => l.id === params.league)?.id as
    | FootballLeague
    | undefined
  if (!league) notFound()
  return (
    <ShellFrame>
      {/* V5 · league page (NFL, NCAA Football); V1–V4 unchanged. */}
      <V5Switch initial={serverSiteVersion()} v5={<ComboSportsPage sport="nfl" leagueSlug={league} />}>
        <V3Switch
          initial={serverSiteVersion()}
          v3={<NflSportPage initialLeague={league} markets={<HomeMarketsShelf sport="nfl" />} />}
        >
          <NflSportPage initialLeague={league} />
        </V3Switch>
      </V5Switch>
    </ShellFrame>
  )
}
