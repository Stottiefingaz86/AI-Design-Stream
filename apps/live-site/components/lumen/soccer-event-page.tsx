'use client'

import { useMemo } from 'react'
import { EventMissing, SportsEventView } from '@/components/lumen/sports-event-view'
import { findSoccerEvent, soccerEventModel } from '@/lib/lumen/soccer-event'

export function SoccerEventPage({ eventId }: { eventId: string }) {
  const model = useMemo(() => {
    const found = findSoccerEvent(eventId)
    return found ? soccerEventModel(found.event, found.section) : null
  }, [eventId])
  if (!model) return <EventMissing sportLabel="Soccer" href="/sports/soccer" />
  return <SportsEventView model={model} />
}
