'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { IconChevronLeft, IconChevronRight, IconTrophy } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { LoyaltyInfoTip } from '@/components/lumen/loyalty-info-tip'
import { useShell } from '@/components/site/shell-context'
import {
  DAILY_RACE_HOW_IT_WORKS,
  DAILY_RACE_LEADERBOARD,
  DAILY_RACE_PAGE_SIZE,
  DAILY_RACE_STATUS,
  formatRaceCountdown,
  formatRaceMoney,
  formatRaceWagered,
  type DailyRaceLeaderboardRow,
} from '@/lib/lumen/daily-races'
import { VIP_LEVEL_COLOR } from '@/lib/lumen/my-account'
import { cn } from '@/lib/utils'

const CARD =
  'rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]'

const ROW_HOVER = 'hover:!bg-surface-muted-3'

const RANK_METAL: Record<number, string> = {
  1: VIP_LEVEL_COLOR.Gold,
  2: VIP_LEVEL_COLOR.Silver,
  3: VIP_LEVEL_COLOR.Bronze,
}

/**
 * VIP Hub — $25k Daily Race: status + leaderboard.
 * You row lives inside the rounded card (last child) so corners aren’t clipped square.
 */
export function DailyRacesPanel() {
  return (
    <div className="flex flex-col gap-4" data-name="module-daily-races">
      <RaceStatusCard />
      <RaceLeaderboard />
    </div>
  )
}

function RaceStatusCard() {
  const [remaining, setRemaining] = useState(DAILY_RACE_STATUS.endsInSeconds)

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining((s) => (s <= 0 ? DAILY_RACE_STATUS.endsInSeconds : s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  const cells: [string, string][] = [
    [DAILY_RACE_STATUS.position, 'Position'],
    [DAILY_RACE_STATUS.wagered, 'Wagered'],
    [DAILY_RACE_STATUS.prize, 'Current Prize'],
  ]

  return (
    <section className={cn(CARD, 'p-4')} data-name="daily-races-status">
      <div className="mb-3 flex items-start justify-between gap-3">
        <Typography as="h2" shape="h4" weight="semibold" className="text-base">
          $25k Daily Race
        </Typography>
        <p
          className="font-mono text-base font-semibold tabular-nums tracking-wide text-foreground sm:text-lg"
          aria-live="polite"
          aria-label={`Race ends in ${formatRaceCountdown(remaining)}`}
        >
          {formatRaceCountdown(remaining)}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {cells.map(([value, label]) => (
          <div
            key={label}
            className="flex min-h-[72px] flex-col justify-center rounded-md border border-border bg-secondary px-2.5 py-2"
          >
            <p className="text-sm font-semibold leading-tight tabular-nums text-foreground sm:text-base">
              {value}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function RaceLeaderboard() {
  const { loggedIn, profile } = useShell()
  const nickname = profile.fullName.trim()
  const [page, setPage] = useState(1)
  const pageSize = DAILY_RACE_PAGE_SIZE
  const pageCount = Math.max(1, Math.ceil(DAILY_RACE_LEADERBOARD.length / pageSize))
  const withNickname = useCallback(
    (row: DailyRaceLeaderboardRow): DailyRaceLeaderboardRow =>
      row.isYou && nickname
        ? { ...row, player: nickname }
        : row,
    [nickname],
  )
  const youRow = useMemo(() => {
    const base = DAILY_RACE_LEADERBOARD.find((r) => r.isYou) ?? null
    return base ? withNickname(base) : null
  }, [withNickname])

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return DAILY_RACE_LEADERBOARD.slice(start, start + pageSize).map(withNickname)
  }, [page, pageSize, withNickname])

  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  return (
    <section
      className={cn(CARD, 'flex flex-col overflow-hidden')}
      data-name="daily-races-leaderboard"
    >
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
          title={DAILY_RACE_HOW_IT_WORKS.title}
          body={DAILY_RACE_HOW_IT_WORKS.body}
          label="How it works"
          showLabel
        />
      </div>

      <div
        className="flex items-center gap-3 border-b border-border px-3 py-2.5 sm:px-4"
        role="row"
      >
        <span className="w-10 shrink-0 text-xs font-medium text-muted-foreground">
          Rank
        </span>
        <span className="min-w-0 flex-1 text-xs font-medium text-muted-foreground">
          Player
        </span>
        <span className="shrink-0 text-right text-xs font-medium text-muted-foreground">
          Prize
        </span>
      </div>

      <ul className="flex flex-col">
        {pageRows.map((row) => (
          <LeaderboardRow key={row.id} row={row} />
        ))}
      </ul>

      <LeaderboardPager
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
      />

      {/* Inside rounded card — last child inherits card radius via overflow-hidden. */}
      {loggedIn && youRow ? (
        <div
          className="sticky bottom-0 z-10 border-t border-border bg-card"
          data-name="daily-races-you"
        >
          <LeaderboardRow row={youRow} stickyYou />
        </div>
      ) : null}
    </section>
  )
}

function LeaderboardRow({
  row,
  stickyYou = false,
}: {
  row: DailyRaceLeaderboardRow
  stickyYou?: boolean
}) {
  return (
    <li
      data-race-you={row.isYou || stickyYou ? '' : undefined}
      className={cn(
        'flex items-center gap-3 border-b border-border px-3 py-3 last:border-b-0 sm:px-4',
        !stickyYou && ROW_HOVER,
        (row.isYou || stickyYou) && 'bg-surface-muted-3',
        stickyYou && 'border-b-0',
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
        <p className="truncate text-xs tabular-nums text-muted-foreground">
          {formatRaceWagered(row.wageredUsd)}
        </p>
      </div>

      <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
        {row.prizeUsd > 0 ? formatRaceMoney(row.prizeUsd) : '—'}
      </p>
    </li>
  )
}

function LeaderboardPager({
  page,
  pageCount,
  onPageChange,
}: {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2.5 sm:px-4">
      <p className="text-xs text-muted-foreground sm:text-sm">
        {DAILY_RACE_PAGE_SIZE} per page
      </p>
      <div className="flex items-center gap-0.5 text-sm text-muted-foreground">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <IconChevronLeft className="size-4" stroke={2} />
        </Button>
        <span className="min-w-[6.5rem] text-center text-xs tabular-nums sm:text-sm">
          Page {page} of {pageCount}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          <IconChevronRight className="size-4" stroke={2} />
        </Button>
      </div>
    </div>
  )
}

/** Wider crest so leaves aren’t squashed around the numeral. */
export function RankCrest({ rank }: { rank: number }) {
  const metal = RANK_METAL[rank]
  if (!metal) {
    return (
      <span className="inline-flex size-10 shrink-0 items-center justify-center text-sm font-semibold tabular-nums text-foreground">
        {rank}
      </span>
    )
  }

  return (
    <span
      className="relative inline-flex size-10 shrink-0 items-center justify-center"
      style={{ color: metal }}
      aria-label={`Rank ${rank}`}
    >
      <LaurelCrest className="absolute inset-0 size-10" />
      <span className="relative z-10 text-sm font-bold tabular-nums leading-none text-foreground">
        {rank}
      </span>
    </span>
  )
}

function LaurelCrest({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g fill="currentColor">
        {/* Left leaves — roomier arc */}
        <ellipse cx="11" cy="8" rx="1.55" ry="2.55" transform="rotate(-48 11 8)" />
        <ellipse cx="7.8" cy="13" rx="1.5" ry="2.45" transform="rotate(-28 7.8 13)" />
        <ellipse cx="6.4" cy="18.5" rx="1.45" ry="2.35" transform="rotate(-6 6.4 18.5)" />
        <ellipse cx="7.2" cy="24.2" rx="1.4" ry="2.25" transform="rotate(18 7.2 24.2)" />
        <ellipse cx="10.2" cy="29" rx="1.35" ry="2.15" transform="rotate(40 10.2 29)" />
        <ellipse cx="14.4" cy="32.2" rx="1.3" ry="2" transform="rotate(62 14.4 32.2)" />
        <path
          d="M17.5 33c-2.6-1.5-4.9-3.8-6.2-6.8-1.4-3.1-1.7-6.5-1-9.7.5-2.1 1.5-4 3-5.6"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
        {/* Right leaves */}
        <ellipse cx="29" cy="8" rx="1.55" ry="2.55" transform="rotate(48 29 8)" />
        <ellipse cx="32.2" cy="13" rx="1.5" ry="2.45" transform="rotate(28 32.2 13)" />
        <ellipse cx="33.6" cy="18.5" rx="1.45" ry="2.35" transform="rotate(6 33.6 18.5)" />
        <ellipse cx="32.8" cy="24.2" rx="1.4" ry="2.25" transform="rotate(-18 32.8 24.2)" />
        <ellipse cx="29.8" cy="29" rx="1.35" ry="2.15" transform="rotate(-40 29.8 29)" />
        <ellipse cx="25.6" cy="32.2" rx="1.3" ry="2" transform="rotate(-62 25.6 32.2)" />
        <path
          d="M22.5 33c2.6-1.5 4.9-3.8 6.2-6.8 1.4-3.1 1.7-6.5 1-9.7-.5-2.1-1.5-4-3-5.6"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
      </g>
    </svg>
  )
}
