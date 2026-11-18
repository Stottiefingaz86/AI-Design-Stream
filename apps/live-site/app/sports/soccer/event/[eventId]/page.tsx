import { SoccerEventPage } from '@/components/lumen/soccer-event-page'
import { ShellFrame } from '@/components/site/shell-frame'

/** Soccer event view — live (stream + tracker) or pre-match (form + H2H). */
export default function Page({ params }: { params: { eventId: string } }) {
  return (
    <ShellFrame>
      <SoccerEventPage eventId={decodeURIComponent(params.eventId)} />
    </ShellFrame>
  )
}
