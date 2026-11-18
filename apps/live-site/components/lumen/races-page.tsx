'use client'

import { useMemo, useState } from 'react'
import { IconTrophy } from '@tabler/icons-react'
import { RankCrest } from '@/components/lumen/daily-races-panel'
import { LoyaltyInfoTip } from '@/components/lumen/loyalty-info-tip'
import { PromoCountdown } from '@/components/lumen/promo-countdown'
import { PROMO_HERO_CTA, PromoPageHero } from '@/components/lumen/promo-page-hero'
import { useShell } from '@/components/site/shell-context'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Typography } from '@/components/ui/typography'
import {
  RACES,
  formatRaceMoney,
  type DailyRaceLeaderboardRow,
  type RaceConfig,
  type RaceId,
} from '@/lib/lumen/daily-races'
import { cn } from '@/lib/utils'

const CARD = 'rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]'
const ROW_HOVER = 'hover:!bg-surface-muted-3'

/** V2 Promotions · Races — Daily / Weekly status card + leaderboard. */
export function RacesPage({ className }: { className?: string }) {
  const { loggedIn, profile, openAuth } = useShell()
  const [raceId, setRaceId] = useState<RaceId>('daily')
  const race = RACES[raceId]
  const nickname = profile.fullName.trim()

  const rows = useMemo(
    () =>
      race.leaderboard.map((row) => {
        if (!row.isYou) return row
        if (!loggedIn) return { ...row, isYou: false, player: null }
        return { ...row, player: nickname || row.player }
      }),
    [race, loggedIn, nickname],
  )
  const you = rows.find((r) => r.isYou) ?? null

  return (
    <div data-name="races_page" className={cn('w-full bg-background px-6 pb-14 pt-6', className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Typography as="h1" shape="h2" weight="semibold">
          Races
        </Typography>
        <Tabs value={raceId} onValueChange={(v) => setRaceId(v as RaceId)}>
          <TabsList>
            {Object.values(RACES).map((r) => (
              <TabsTrigger key={r.id} value={r.id} className="min-w-20">
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-4">
        <RaceStatusCard race={race} you={you} onJoin={() => openAuth('join')} />

        <section className={cn(CARD, 'flex flex-col overflow-hidden')} data-name="race-leaderboard">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground">
                <IconTrophy className="size-3.5" strokeWidth={1.75} aria-hidden />
              </span>
              <Typography as="h2" shape="h4" weight="semibold" className="text-base">
                Leaderboard
              </Typography>
            </div>
            <LoyaltyInfoTip
              title={race.howItWorks.title}
              body={race.howItWorks.body}
              label="How it works"
              showLabel
            />
          </div>

          <div className="flex items-center gap-3 border-b border-border px-3 py-2.5 text-xs font-medium text-muted-foreground sm:px-4">
            <span className="w-10 shrink-0">Rank</span>
            <span className="min-w-0 flex-1">Player</span>
            <span className="hidden w-32 shrink-0 text-right sm:block">Wagered</span>
            <span className="w-24 shrink-0 text-right">Prize</span>
          </div>
          <ul>
            {rows.map((row) => (
              <LeaderboardRow key={row.id} row={row} />
            ))}
          </ul>
          {you ? (
            <div className="sticky bottom-0 z-10 border-t border-border bg-card" data-race-you="">
              <ul>
                <LeaderboardRow row={you} pinned />
              </ul>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}

function RaceStatusCard({
  race,
  you,
  onJoin,
}: {
  race: RaceConfig
  you: DailyRaceLeaderboardRow | null
  onJoin: () => void
}) {
  const cells: { label: string; value: string }[] = [
    { label: 'Position', value: you ? `#${you.rank}` : '—' },
    { label: 'Wagered', value: you ? `$${you.wageredUsd.toLocaleString('en-US')}` : '—' },
    {
      label: 'Current Prize',
      value: you && you.prizeUsd > 0 ? formatRaceMoney(you.prizeUsd) : '—',
    },
  ]

  return (
    <PromoPageHero
      as="h2"
      title={`${race.poolLabel} ${race.title}`}
      subtitle="Top 10 get paid in cash."
      actions={
        you ? null : (
          <Button type="button" className={PROMO_HERO_CTA} onClick={onJoin}>
            Join to race
          </Button>
        )
      }
      footer={
        <div className="grid grid-cols-3 gap-2">
          {cells.map((cell) => (
            <div
              key={cell.label}
              className="flex flex-col justify-center rounded-[10px] bg-black/20 px-3 py-2.5"
            >
              <p className="text-[11px] text-white/70">{cell.label}</p>
              <p
                className={cn(
                  'mt-0.5 text-base font-semibold leading-tight tabular-nums text-white sm:text-lg',
                )}
              >
                {cell.value}
              </p>
            </div>
          ))}
        </div>
      }
    >
      <PromoCountdown
        key={race.id}
        seconds={race.endsInSeconds}
        label="Race ends in"
        onPrimary
        className="items-start md:items-end"
      />
    </PromoPageHero>
  )
}

function LeaderboardRow({
  row,
  pinned = false,
}: {
  row: DailyRaceLeaderboardRow
  pinned?: boolean
}) {
  return (
    <li
      className={cn(
        'flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-b-0 sm:px-4',
        !pinned && ROW_HOVER,
        (row.isYou || pinned) && 'bg-surface-muted-3',
        pinned && 'border-b-0',
      )}
    >
      <RankCrest rank={row.rank} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {row.player ?? 'Hidden'}
          {row.isYou ? (
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">You</span>
          ) : null}
        </p>
        <p className="truncate text-xs tabular-nums text-muted-foreground sm:hidden">
          ${row.wageredUsd.toLocaleString('en-US')} wagered
        </p>
      </div>
      <p className="hidden w-32 shrink-0 text-right text-sm tabular-nums text-muted-foreground sm:block">
        ${row.wageredUsd.toLocaleString('en-US')}
      </p>
      <p className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
        {row.prizeUsd > 0 ? formatRaceMoney(row.prizeUsd) : '—'}
      </p>
    </li>
  )
}
