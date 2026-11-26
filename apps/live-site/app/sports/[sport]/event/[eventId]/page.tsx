import { notFound } from 'next/navigation'
import { SportsHomePage } from '@/components/lumen/sports-home-page'
import { ShellFrame } from '@/components/site/shell-frame'
import { ComboEventPage } from '@/components/lumen/v5/combo-event-page'
import { V5Switch } from '@/components/lumen/v5/v5-switch'
import { serverSiteVersion } from '@/lib/lumen/site-version-server'
import { V5_SPORT_SLUGS } from '@/lib/lumen/v5-sport-slugs'

/** Event view for every generated sport — V5 only; earlier versions fall back to Sports Home. */
export default function Page({ params }: { params: { sport: string; eventId: string } }) {
  const sport = V5_SPORT_SLUGS[params.sport]
  if (!sport) notFound()
  const eventId = decodeURIComponent(params.eventId)
  return (
    <ShellFrame>
      <V5Switch initial={serverSiteVersion()} v5={<ComboEventPage sport={sport} eventId={eventId} />}>
        <SportsHomePage />
      </V5Switch>
    </ShellFrame>
  )
}
