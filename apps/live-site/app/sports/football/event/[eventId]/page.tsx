import { EventMarketsCard } from '@/components/lumen/markets/market-event-page'
import { V3Switch } from '@/components/lumen/markets/v3-switch'
import { NflEventPage } from '@/components/lumen/nfl-event-page'
import { ShellFrame } from '@/components/site/shell-frame'
import { serverSiteVersion } from '@/lib/lumen/site-version-server'

/** NFL event view — live (stream + game tracker) or pregame (form + H2H). V3 adds the market card. */
export default function Page({ params }: { params: { eventId: string } }) {
  const eventId = decodeURIComponent(params.eventId)
  return (
    <ShellFrame>
      <V3Switch
        initial={serverSiteVersion()}
        v3={
          <NflEventPage
            eventId={eventId}
            markets={<EventMarketsCard sport="nfl" eventId={eventId} />}
          />
        }
      >
        <NflEventPage eventId={eventId} />
      </V3Switch>
    </ShellFrame>
  )
}
