'use client'

import { useMemo, type ReactNode } from 'react'
import { EventMissing, SportsEventView } from '@/components/lumen/sports-event-view'
import { findNflEvent, nflEventModel } from '@/lib/lumen/nfl-sport'

export function NflEventPage({ eventId, markets }: { eventId: string; markets?: ReactNode }) {
  const model = useMemo(() => {
    const found = findNflEvent(eventId)
    return found ? nflEventModel(found.event, found.section) : null
  }, [eventId])
  if (!model) return <EventMissing sportLabel="Football" href="/sports/football" />
  return <SportsEventView model={model} marketsCard={markets} />
}
