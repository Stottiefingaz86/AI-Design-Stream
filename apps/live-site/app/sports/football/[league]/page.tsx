'use client'

import { notFound } from 'next/navigation'
import { NflSportPage } from '@/components/lumen/nfl-sport-page'
import { ShellFrame } from '@/components/site/shell-frame'
import { FOOTBALL_LEAGUES, type FootballLeague } from '@/lib/lumen/nfl-sport'

/** Football // league page (NFL, NCAA Football). */
export default function Page({ params }: { params: { league: string } }) {
  const league = FOOTBALL_LEAGUES.find((l) => l.id === params.league)?.id as
    FootballLeague | undefined
  if (!league) notFound()
  return (
    <ShellFrame>
      <NflSportPage initialLeague={league} />
    </ShellFrame>
  )
}
