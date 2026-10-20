'use client'

import { Fragment, useMemo, useState, type ReactNode } from 'react'
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
  IconInfoCircle,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Typography } from '@/components/ui/typography'
import { useShell } from '@/components/site/shell-context'
import { MyBonusFiltersSheet } from '@/components/lumen/my-bonus-filters-sheet'
import {
  ORIGINALS_GAMES,
  pickRandomLobbyGame,
  type CasinoLobbyGame,
} from '@/lib/lumen/casino-lobby-catalog'
import {
  BONUS_STATUS_STYLE,
  EMPTY_BONUS_FILTERS,
  MY_BONUS_CASINO_ROWS,
  MY_BONUS_SPORTS_ROWS,
  bonusFiltersActiveCount,
  type BonusFilters,
  type BonusStatus,
  type CasinoBonusRow,
  type SportsBonusRow,
} from '@/lib/lumen/my-bonus'
import { cn } from '@/lib/utils'

const PICK_A_GAME_OPTIONS = ORIGINALS_GAMES.slice(0, 8)
/** Figma table hover — whisper grey, not muted stripe. */
const ROW_HOVER = 'hover:!bg-surface-muted-3'
const ROW_OPEN = 'bg-surface-muted-3'
const EXPAND_EASE = 'duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'

type BonusTab = 'casino' | 'sports'

function StatusBadge({ status }: { status: BonusStatus }) {
  return (
    <span
      className="inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium"
      style={BONUS_STATUS_STYLE[status]}
    >
      {status}
    </span>
  )
}

function CasinoActionCell({
  action,
  onLaunch,
}: {
  action: CasinoBonusRow['action']
  onLaunch: (game: CasinoLobbyGame) => void
}) {
  if (action === 'play') {
    return (
      <Button
        type="button"
        size="sm"
        className="min-w-[5.5rem]"
        onClick={() => onLaunch(pickRandomLobbyGame())}
      >
        Play Now
      </Button>
    )
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="min-w-[5.5rem]">
          Pick a game
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="z-[220] min-w-[12rem]"
      >
        {PICK_A_GAME_OPTIONS.map((game) => (
          <DropdownMenuItem
            key={game.id}
            className="cursor-pointer"
            onSelect={() => onLaunch(game)}
          >
            {game.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-wrap items-baseline gap-1 text-xs leading-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{children}</span>
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
        <Select value={rowsPerPage} onValueChange={onRowsChange}>
          <SelectTrigger className="h-8 w-[72px] border-border bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[220]">
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

function SportsExpanded({ row }: { row: SportsBonusRow }) {
  const d = row.detail
  return (
    <div className="grid gap-x-8 gap-y-3 px-3 py-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-3">
        <DetailField label="Name">{d.name}</DetailField>
        <DetailField label="Amount">{d.amount}</DetailField>
      </div>
      <div className="flex flex-col gap-3">
        <DetailField label="Rollover Amount">{d.rolloverAmount}</DetailField>
        <DetailField label="Remaining">{d.remaining}</DetailField>
      </div>
      <div className="flex flex-col gap-3">
        <DetailField label="Date">{d.dateTime}</DetailField>
        <DetailField label="Status">
          <StatusBadge status={d.status} />
        </DetailField>
      </div>
      <div className="flex flex-col gap-3">
        <DetailField label="Notes">{d.notes}</DetailField>
      </div>
    </div>
  )
}

function CasinoExpanded({ row }: { row: CasinoBonusRow }) {
  const d = row.detail
  return (
    <div className="flex flex-col gap-3 px-3 py-3">
      <div className="flex flex-col gap-3 sm:hidden">
        <DetailField label="Name">{row.name}</DetailField>
        <DetailField label="Code">{row.code}</DetailField>
        <DetailField label="Bonus Fund">{row.bonusFund}</DetailField>
        <DetailField label="Expiry Date">{row.expiryDate}</DetailField>
        <DetailField label="Rollover">{row.rollover}</DetailField>
        <DetailField label="Free Spins">{row.freeSpins}</DetailField>
      </div>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
        <DetailField label="Initial Amount">{d.initialAmount}</DetailField>
        <DetailField label="Remaining Amount">{d.remainingAmount}</DetailField>
        <DetailField label="Redeemed On">{d.redeemedOn}</DetailField>
        <DetailField label="Notes">{d.notes}</DetailField>
      </div>
    </div>
  )
}

function SportsBonusTable({ statusFilter }: { statusFilter: string }) {
  const [page, setPage] = useState(10)
  const [rowsPerPage, setRowsPerPage] = useState('10')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const rows = useMemo(() => {
    if (!statusFilter) return MY_BONUS_SPORTS_ROWS
    return MY_BONUS_SPORTS_ROWS.filter((row) => row.status === statusFilter)
  }, [statusFilter])

  return (
    <div className="rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-11 text-xs">Code</TableHead>
            <TableHead className="hidden h-11 text-xs md:table-cell">Amount</TableHead>
            <TableHead className="hidden h-11 text-xs lg:table-cell">Rollover</TableHead>
            <TableHead className="h-11 text-xs">Date</TableHead>
            <TableHead className="h-11 text-xs">Status</TableHead>
            <TableHead className="h-11 w-12 text-right text-xs">More</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const open = expandedId === row.id
            return (
              <Fragment key={row.id}>
                <TableRow
                  className={cn(
                    'border-border transition-colors',
                    ROW_HOVER,
                    open && ROW_OPEN,
                  )}
                >
                  <TableCell className="py-3 font-medium">{row.code}</TableCell>
                  <TableCell className="hidden py-3 tabular-nums md:table-cell">{row.amount}</TableCell>
                  <TableCell className="hidden py-3 tabular-nums lg:table-cell">{row.rollover}</TableCell>
                  <TableCell className="py-3 tabular-nums text-muted-foreground">{row.date}</TableCell>
                  <TableCell className="py-3">
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-expanded={open}
                      aria-label={open ? `Collapse ${row.code}` : `Expand ${row.code}`}
                      onClick={() => setExpandedId(open ? null : row.id)}
                    >
                      <IconChevronDown
                        className={cn(
                          'size-4 text-muted-foreground transition-transform',
                          EXPAND_EASE,
                          open && 'rotate-180',
                        )}
                        stroke={2}
                      />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableCell colSpan={6} className="border-0 p-0">
                    <ExpandPanel open={open}>
                      <div className="border-b border-border bg-background">
                        <SportsExpanded row={row} />
                      </div>
                    </ExpandPanel>
                  </TableCell>
                </TableRow>
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
      <TablePager
        page={page}
        pageCount={100}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsChange={setRowsPerPage}
      />
    </div>
  )
}

function CasinoBonusTable() {
  const { launchGame } = useShell()
  const [page, setPage] = useState(10)
  const [rowsPerPage, setRowsPerPage] = useState('10')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-11 text-xs">Name</TableHead>
            <TableHead className="hidden h-11 text-xs sm:table-cell">Code</TableHead>
            <TableHead className="hidden h-11 text-xs md:table-cell">Bonus Fund</TableHead>
            <TableHead className="hidden h-11 text-xs lg:table-cell">Expiry Date</TableHead>
            <TableHead className="hidden h-11 text-xs lg:table-cell">Rollover</TableHead>
            <TableHead className="hidden h-11 text-xs md:table-cell">Free Spins</TableHead>
            <TableHead className="h-11 text-xs">Action</TableHead>
            <TableHead className="h-11 w-12 text-right text-xs">More</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MY_BONUS_CASINO_ROWS.map((row) => {
            const open = expandedId === row.id
            return (
              <Fragment key={row.id}>
                <TableRow
                  className={cn(
                    'border-border transition-colors',
                    ROW_HOVER,
                    open && ROW_OPEN,
                  )}
                >
                  <TableCell className="py-3 font-medium">{row.name}</TableCell>
                  <TableCell className="hidden py-3 tabular-nums sm:table-cell">{row.code}</TableCell>
                  <TableCell className="hidden py-3 tabular-nums md:table-cell">{row.bonusFund}</TableCell>
                  <TableCell className="hidden py-3 tabular-nums text-muted-foreground lg:table-cell">
                    {row.expiryDate}
                  </TableCell>
                  <TableCell className="hidden py-3 tabular-nums lg:table-cell">{row.rollover}</TableCell>
                  <TableCell className="hidden py-3 tabular-nums md:table-cell">{row.freeSpins}</TableCell>
                  <TableCell className="py-3">
                    <CasinoActionCell action={row.action} onLaunch={launchGame} />
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-expanded={open}
                      aria-label={open ? `Collapse ${row.name}` : `Expand ${row.name}`}
                      onClick={() => setExpandedId(open ? null : row.id)}
                    >
                      <IconChevronDown
                        className={cn(
                          'size-4 text-muted-foreground transition-transform',
                          EXPAND_EASE,
                          open && 'rotate-180',
                        )}
                        stroke={2}
                      />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableCell colSpan={8} className="border-0 p-0">
                    <ExpandPanel open={open}>
                      <div className="border-b border-border bg-background">
                        <CasinoExpanded row={row} />
                      </div>
                    </ExpandPanel>
                  </TableCell>
                </TableRow>
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
      <TablePager
        page={page}
        pageCount={100}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsChange={setRowsPerPage}
      />
    </div>
  )
}

/** Promo26 My Bonus — Casino first, expanded rows, filter sheet/drawer. */
export function MyBonusPage({ className }: { className?: string }) {
  const [tab, setTab] = useState<BonusTab>('casino')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [applied, setApplied] = useState<BonusFilters>(EMPTY_BONUS_FILTERS)
  const [draft, setDraft] = useState<BonusFilters>(EMPTY_BONUS_FILTERS)

  const activeCount = bonusFiltersActiveCount(applied)

  const openFilters = () => {
    setDraft(applied)
    setFiltersOpen(true)
  }

  return (
    <div data-name="my_bonus" className={cn('w-full bg-background px-6 pb-14 pt-6', className)}>
      <div className="mb-4 flex items-center gap-1.5">
        <Typography as="h1" shape="h2" weight="semibold">
          My Bonus
        </Typography>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="rounded-full text-muted-foreground"
          aria-label="About My Bonus"
        >
          <IconInfoCircle className="size-4" stroke={1.75} />
        </Button>
      </div>

      <div
        role="tablist"
        aria-label="Bonus product"
        className="mb-4 flex gap-6 border-b border-border"
      >
        {(
          [
            { id: 'casino', label: 'Casino' },
            { id: 'sports', label: 'Sports' },
          ] as const
        ).map((item) => {
          const on = tab === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setTab(item.id)}
              className={cn(
                'relative -mb-px pb-2 text-sm transition-colors',
                on
                  ? 'font-semibold text-foreground'
                  : 'font-medium text-muted-foreground hover:text-foreground',
              )}
            >
              {item.label}
              {on ? (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
              ) : null}
            </button>
          )
        })}
      </div>

      {tab === 'sports' ? (
        <div className="mb-4 flex items-center gap-3">
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={openFilters}>
            <IconFilter className="size-3.5" stroke={2} aria-hidden />
            Filters
            {activeCount > 0 ? (
              <span className="ml-0.5 inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {activeCount}
              </span>
            ) : null}
          </Button>
          <span className="text-sm text-muted-foreground">
            {activeCount > 0
              ? `${activeCount} filter${activeCount === 1 ? '' : 's'} applied`
              : 'No filters applied'}
          </span>
        </div>
      ) : null}

      {tab === 'casino' ? (
        <CasinoBonusTable />
      ) : (
        <SportsBonusTable statusFilter={applied.status} />
      )}

      <MyBonusFiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        draft={draft}
        onDraftChange={setDraft}
        onClear={() => {
          setDraft(EMPTY_BONUS_FILTERS)
          setApplied(EMPTY_BONUS_FILTERS)
          setFiltersOpen(false)
        }}
        onApply={() => {
          setApplied(draft)
          setFiltersOpen(false)
        }}
      />
    </div>
  )
}
