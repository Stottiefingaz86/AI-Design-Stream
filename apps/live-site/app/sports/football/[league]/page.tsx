import { notFound } from 'next/navigation'
import { HomeMarketsShelf } from '@/components/lumen/markets/markets-home-page'
import { V3Switch } from '@/components/lumen/markets/v3-switch'
import { NflSportPage } from '@/components/lumen/nfl-sport-page'
import { ShellFrame } from '@/components/site/shell-frame'
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
      <V3Switch
        initial={serverSiteVersion()}
        v3={<NflSportPage initialLeague={league} markets={<HomeMarketsShelf sport="nfl" />} />}
      >
        <NflSportPage initialLeague={league} />
      </V3Switch>
    </ShellFrame>
  )
}
