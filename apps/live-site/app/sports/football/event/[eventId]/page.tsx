import { NflEventPage } from '@/components/lumen/nfl-event-page'
import { ShellFrame } from '@/components/site/shell-frame'

/** NFL event view — live (stream + game tracker) or pregame (form + H2H). */
export default function Page({ params }: { params: { eventId: string } }) {
  return (
    <ShellFrame>
      <NflEventPage eventId={decodeURIComponent(params.eventId)} />
    </ShellFrame>
  )
}
