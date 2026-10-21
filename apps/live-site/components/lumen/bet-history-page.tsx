'use client'

import {
  Fragment,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
  IconInfoCircle,
  IconPrinter,
  IconX,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LumenTooltip } from '@/components/ui/lumen-tooltip'
import { BetHistoryFiltersSheet } from '@/components/lumen/bet-history-filters-sheet'
import {
  BET_HISTORY_ROWS,
  BET_STATUS_STYLE,
  BET_WAGER_TYPE_OPTIONS,
  EMPTY_BET_FILTERS,
  LAST_WEEK_FIGURES,
  THIS_WEEK_FIGURES,
  betFiltersActiveCount,
  filterBetHistoryRows,
  formatFigureAmount,
  type BetFilters,
  type BetHistoryRow,
  type BetStatus,
  type DailyFiguresWeek,
} from '@/lib/lumen/bet-history'
import { cn } from '@/lib/utils'

const ROW_HOVER = 'hover:!bg-surface-muted-3'
const ROW_OPEN = 'bg-surface-muted-3'
const EXPAND_EASE = 'duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'

type WeekTab = 'this' | 'last'

function StatusBadge({
  status,
  size = 'md',
}: {
  status: BetStatus
  size?: 'sm' | 'md'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        size === 'sm' ? 'h-5 px-1.5 text-xs' : 'h-[26px] px-3 text-xs',
      )}
      style={BET_STATUS_STYLE[status]}
    >
      {status}
    </span>
  )
}

/** Figma expand labels — semibold label + regular value on one line. */
function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1 text-xs leading-4 text-foreground">
      <span className="shrink-0 font-semibold">{label}</span>
      <span className="min-w-0 font-normal">{children}</span>
    </div>
  )
}

function ExpandPanel({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        'grid transition-[grid-template-rows] motion-reduce:transition-none',
        EXPAND_EASE,
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}

function TablePager({
  page,
  pageCount,
  rowsPerPage,
  onPageChange,
  onRowsChange,
}: {
  page: number
  pageCount: number
  rowsPerPage: string
  onPageChange: (page: number) => void
  onRowsChange: (rows: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="hidden sm:inline">Rows per page</span>
        <span className="sm:hidden">Rows per…</span>
        <Select value={rowsPerPage} onValueChange={onRowsChange} modal={false}>
          <SelectTrigger className="h-8 w-[72px] border-border bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[220]" position="popper" sideOffset={4}>
            {['10', '25', '50'].map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
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
        <span className="min-w-[7.5rem] text-center tabular-nums">
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

function figureTone(amount: number) {
  if (amount > 0) return 'text-[var(--success)]'
  if (amount < 0) return 'text-foreground'
  return 'text-muted-foreground'
}

function DailyFiguresCard({
  week,
  onWeekChange,
  figures,
  selectedDayId,
  onSelectDay,
}: {
  week: WeekTab
  onWeekChange: (week: WeekTab) => void
  figures: DailyFiguresWeek
  selectedDayId: string | null
  onSelectDay: (dayId: string | null) => void
}) {
  return (
    <div
      data-name="daily-figures-module"
      className="overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]"
    >
      <div className="border-b border-border bg-[var(--surface-muted-1,#f9fafb)] px-5 pt-3">
        <div
          role="tablist"
          aria-label="Daily figures week"
          className="flex w-max max-w-full gap-2"
        >
          {(
            [
              { id: 'this', label: 'This Week' },
              { id: 'last', label: 'Last Week' },
            ] as const
          ).map((item) => {
            const on = week === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => onWeekChange(item.id)}
                className={cn(
                  'relative -mb-px border-b-2 px-2 pb-2 text-sm transition-colors',
                  on
                    ? 'border-primary font-medium text-foreground'
                    : 'border-transparent font-medium text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div
        data-name="daily-boxes-carousel"
        className="flex items-stretch gap-2 overflow-x-auto px-5 py-4"
      >
        {figures.days.map((day) => {
          const selected = selectedDayId === day.id
          return (
            <button
              key={day.id}
              type="button"
              data-name="daily-box"
              aria-pressed={selected}
              onClick={() => onSelectDay(selected ? null : day.id)}
              className={cn(
                'flex min-w-[72px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg border p-2 transition-colors duration-150',
                selected
                  ? 'border-foreground/25 bg-accent'
                  : 'border-border bg-secondary hover:border-foreground/20 hover:bg-accent',
              )}
            >
              <p className="text-sm font-medium leading-5 text-muted-foreground">{day.label}</p>
              <p
                className={cn(
                  'text-sm font-medium leading-5 tabular-nums',
                  figureTone(day.amount),
                )}
              >
                {formatFigureAmount(day.amount)}
              </p>
            </button>
          )
        })}
        <div className="flex w-[100px] shrink-0 flex-col justify-center gap-0.5">
          <p className="text-sm font-medium leading-5 text-muted-foreground">Total Result</p>
          <p
            className={cn(
              'text-sm font-medium leading-5 tabular-nums',
              figureTone(figures.total),
            )}
          >
            {formatFigureAmount(figures.total)}
          </p>
        </div>
      </div>

      <p className="border-t border-border px-5 py-4 text-xs leading-4 text-muted-foreground">
        Daily Figures (EST) include activity from Sports, Live Betting, Racebook, Esports, and
        Casino. See full details in{' '}
        <Link
          href="/account/transactions"
          className="font-medium text-info underline-offset-2 hover:underline"
        >
          Transactions
        </Link>
        .
      </p>
    </div>
  )
}

/** Figma 4275:185619 expand — Description / Type / Comment · Bet ID / Accepted / Graded · Risk / To Win / Status · Print */
function BetExpanded({ row }: { row: BetHistoryRow }) {
  const d = row.detail
  return (
    <div className="flex flex-col gap-4 px-3 py-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-6 sm:flex-row sm:gap-10 lg:gap-16">
        <div className="flex w-full max-w-[350px] flex-col gap-2.5">
          <DetailRow label="Description:">{row.description}</DetailRow>
          <DetailRow label="Type:">{row.type}</DetailRow>
          <DetailRow label="Comment:">{d.comment}</DetailRow>
        </div>
        <div className="flex w-full max-w-[300px] flex-col gap-2.5">
          <DetailRow label="Bet ID:">{d.betId}</DetailRow>
          <DetailRow label="Accepted Date:">{d.acceptedDate}</DetailRow>
          <DetailRow label="Graded Date:">{d.gradedDate}</DetailRow>
        </div>
        <div className="flex w-full max-w-[200px] flex-col gap-2.5">
          <DetailRow label="Risk:">{row.risk}</DetailRow>
          <DetailRow label="To Win:">{row.toWin}</DetailRow>
          <DetailRow label="Status:">
            <StatusBadge status={row.status} size="sm" />
          </DetailRow>
        </div>
      </div>
      <Button
        type="button"
        size="sm"
        className="h-8 shrink-0 gap-1.5 self-start bg-info text-white hover:bg-info/90"
        onClick={() => window.print()}
      >
        <IconPrinter className="size-4" stroke={2} aria-hidden />
        Print
      </Button>
    </div>
  )
}

function BetHistoryTable({
  statusFilter,
  wagerTypeFilter,
  dayDateKey,
}: {
  statusFilter: string
  wagerTypeFilter: string
  dayDateKey: string | null
}) {
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState('10')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const rows = useMemo(
    () =>
      filterBetHistoryRows(BET_HISTORY_ROWS, {
        status: statusFilter,
        wagerType: wagerTypeFilter,
        dayDateKey,
      }),
    [statusFilter, wagerTypeFilter, dayDateKey],
  )

  const perPage = Number(rowsPerPage) || 10
  const pageCount = Math.max(1, Math.ceil(rows.length / perPage) || 1)
  const safePage = Math.min(page, pageCount)
  const pageRows = rows.slice((safePage - 1) * perPage, safePage * perPage)

  return (
    <div
      data-name="table-bet-history"
      className="rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]"
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-11 w-[120px] text-xs">Date</TableHead>
            <TableHead className="h-11 text-xs">Description</TableHead>
            <TableHead className="hidden h-11 text-xs md:table-cell">Type</TableHead>
            <TableHead className="hidden h-11 text-xs md:table-cell">Risk</TableHead>
            <TableHead className="hidden h-11 text-xs lg:table-cell">To Win</TableHead>
            <TableHead className="h-11 text-xs">Status</TableHead>
            <TableHead className="h-11 w-[60px] text-center text-xs">More</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                No bets match the selected filters.
              </TableCell>
            </TableRow>
          ) : (
            pageRows.map((row) => {
              const open = expandedId === row.id
              return (
                <Fragment key={row.id}>
                  <TableRow
                    role="button"
                    tabIndex={0}
                    aria-expanded={open}
                    className={cn(
                      'cursor-pointer border-border transition-colors',
                      ROW_HOVER,
                      open && ROW_OPEN,
                    )}
                    onClick={() => setExpandedId(open ? null : row.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setExpandedId(open ? null : row.id)
                      }
                    }}
                  >
                    <TableCell className="py-3 font-medium tabular-nums">{row.date}</TableCell>
                    <TableCell className="max-w-[280px] truncate py-3 lg:max-w-none">
                      {row.description}
                    </TableCell>
                    <TableCell className="hidden py-3 md:table-cell">{row.type}</TableCell>
                    <TableCell className="hidden py-3 tabular-nums md:table-cell">
                      {row.risk}
                    </TableCell>
                    <TableCell className="hidden py-3 tabular-nums lg:table-cell">
                      {row.toWin}
                    </TableCell>
                    <TableCell className="py-3">
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <span
                        className="inline-flex size-8 items-center justify-center"
                        aria-hidden
                      >
                        <IconChevronDown
                          className={cn(
                            'size-4 text-muted-foreground transition-transform',
                            EXPAND_EASE,
                            open && 'rotate-180',
                          )}
                          stroke={2}
                        />
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableCell colSpan={7} className="border-0 p-0">
                      <ExpandPanel open={open}>
                        <div className="border-b border-border bg-background">
                          <BetExpanded row={row} />
                        </div>
                      </ExpandPanel>
                    </TableCell>
                  </TableRow>
                </Fragment>
              )
            })
          )}
        </TableBody>
      </Table>
      <TablePager
        page={safePage}
        pageCount={pageCount}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsChange={(next) => {
          setRowsPerPage(next)
          setPage(1)
        }}
      />
    </div>
  )
}

/**
 * Bet History — Figma WIP Wqxp5CMA12JdC77cgqCLpa
 * Expanded: 4275:185619 · Filters: 4473:179048
 */
export function BetHistoryPage({ className }: { className?: string }) {
  const [week, setWeek] = useState<WeekTab>('this')
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [applied, setApplied] = useState<BetFilters>(EMPTY_BET_FILTERS)
  const [draft, setDraft] = useState<BetFilters>(EMPTY_BET_FILTERS)

  const activeCount = betFiltersActiveCount(applied)
  const figures = week === 'this' ? THIS_WEEK_FIGURES : LAST_WEEK_FIGURES
  const selectedDay = figures.days.find((day) => day.id === selectedDayId) ?? null
  const wagerLabel =
    BET_WAGER_TYPE_OPTIONS.find((item) => item.id === applied.wagerType)?.label ?? ''

  const openFilters = () => {
    setDraft(applied)
    setFiltersOpen(true)
  }

  const clearChip = (key: keyof BetFilters) => {
    setApplied((prev) => ({ ...prev, [key]: '' }))
  }

  const handleWeekChange = (next: WeekTab) => {
    setWeek(next)
    setSelectedDayId(null)
  }

  return (
    <section
      data-name="section-bet-history"
      className={cn('w-full bg-background px-4 pb-14 pt-4 lg:px-6 lg:pt-6', className)}
    >
      <div className="mb-4 flex items-center gap-1.5">
        <h1 className="text-xl font-semibold leading-7 text-foreground lg:text-2xl lg:leading-8">
          Bet History
        </h1>
        <LumenTooltip label="Review settled and open wagers" side="bottom">
          <button
            type="button"
            aria-label="About Bet History"
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <IconInfoCircle className="size-4" stroke={1.75} aria-hidden />
          </button>
        </LumenTooltip>
      </div>

      <div className="mb-4">
        <DailyFiguresCard
          week={week}
          onWeekChange={handleWeekChange}
          figures={figures}
          selectedDayId={selectedDayId}
          onSelectDay={setSelectedDayId}
        />
      </div>

      <div data-name="sort-&-filters" className="mb-4 flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={openFilters}>
          <IconFilter className="size-3.5" stroke={2} aria-hidden />
          Filters
          {activeCount > 0 ? (
            <span className="ml-0.5 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {activeCount}
            </span>
          ) : null}
        </Button>
        {selectedDay ? (
          <button
            type="button"
            onClick={() => setSelectedDayId(null)}
            className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-border bg-secondary px-3 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
          >
            {selectedDay.label}
            <IconX className="size-3" stroke={2} aria-hidden />
          </button>
        ) : null}
        {applied.dateRange ? (
          <button
            type="button"
            onClick={() => clearChip('dateRange')}
            className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-border bg-secondary px-3 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
          >
            {applied.dateRange}
            <IconX className="size-3" stroke={2} aria-hidden />
          </button>
        ) : null}
        {applied.status ? (
          <button
            type="button"
            onClick={() => clearChip('status')}
            className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-border bg-secondary px-3 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
          >
            {applied.status}
            <IconX className="size-3" stroke={2} aria-hidden />
          </button>
        ) : null}
        {applied.wagerType ? (
          <button
            type="button"
            onClick={() => clearChip('wagerType')}
            className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-border bg-secondary px-3 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
          >
            {wagerLabel}
            <IconX className="size-3" stroke={2} aria-hidden />
          </button>
        ) : null}
      </div>

      <BetHistoryTable
        key={`${selectedDay?.dateKey ?? 'all'}-${applied.status}-${applied.wagerType}`}
        statusFilter={applied.status}
        wagerTypeFilter={applied.wagerType}
        dayDateKey={selectedDay?.dateKey ?? null}
      />

      <BetHistoryFiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        draft={draft}
        onDraftChange={setDraft}
        onClear={() => {
          setDraft({ status: '', dateRange: '', dateFrom: '', dateTo: '', wagerType: '' })
          setApplied({ status: '', dateRange: '', dateFrom: '', dateTo: '', wagerType: '' })
          setFiltersOpen(false)
        }}
        onApply={() => {
          setApplied(draft)
          setFiltersOpen(false)
        }}
      />
    </section>
  )
}
