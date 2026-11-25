import { EventMarketsCard } from '@/components/lumen/markets/market-event-page'
import { V3Switch } from '@/components/lumen/markets/v3-switch'
import { SoccerEventPage } from '@/components/lumen/soccer-event-page'
import { ShellFrame } from '@/components/site/shell-frame'
import { serverSiteVersion } from '@/lib/lumen/site-version-server'

/** Soccer event view — live (stream + tracker) or pre-match (form + H2H). V3 adds the market card. */
export default function Page({ params }: { params: { eventId: string } }) {
  const eventId = decodeURIComponent(params.eventId)
  return (
    <ShellFrame>
      <V3Switch
        initial={serverSiteVersion()}
        v3={
          <SoccerEventPage
            eventId={eventId}
            markets={<EventMarketsCard sport="soccer" eventId={eventId} />}
          />
        }
      >
        <SoccerEventPage eventId={eventId} />
      </V3Switch>
    </ShellFrame>
  )
}
