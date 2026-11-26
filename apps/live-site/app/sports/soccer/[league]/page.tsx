import { Suspense } from 'react'
import { SoccerSportPage } from '@/components/lumen/soccer-sport-page'
import { ShellFrame } from '@/components/site/shell-frame'
import { ComboSportsPage } from '@/components/lumen/v5/combo-sports-page'
import { V5Switch } from '@/components/lumen/v5/v5-switch'
import { serverSiteVersion } from '@/lib/lumen/site-version-server'

/** V5 · soccer league page — /sports/soccer/premier-league. Earlier versions keep the soccer board. */
export default function Page({ params }: { params: { league: string } }) {
  return (
    <ShellFrame>
      <V5Switch initial={serverSiteVersion()} v5={<ComboSportsPage sport="soccer" leagueSlug={params.league} />}>
        <Suspense fallback={null}>
          <SoccerSportPage />
        </Suspense>
      </V5Switch>
    </ShellFrame>
  )
}
