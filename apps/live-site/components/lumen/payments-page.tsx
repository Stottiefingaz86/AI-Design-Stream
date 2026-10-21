'use client'

import { Fragment, useMemo, useState, type ReactNode } from 'react'
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconFilter,
  IconInfoCircle,
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
import { PaymentsFiltersSheet } from '@/components/lumen/payments-filters-sheet'
import {
  EMPTY_PAYMENT_FILTERS,
  PAYMENT_ROWS,
  filterPaymentRows,
  formatMoney,
  formatPaymentAmount,
  paymentAmountStyle,
  paymentFiltersActiveCount,
  paymentStatusStyle,
  type PaymentFilters,
  type PaymentRow,
} from '@/lib/lumen/payments'
import { cn } from '@/lib/utils'

const ROW_HOVER = 'hover:!bg-surface-muted-3'
const ROW_OPEN = 'bg-surface-muted-3'
const EXPAND_EASE = 'duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'

function AmountBadge({ amount }: { amount: number }) {
  return (
    <span
      className="inline-flex h-[26px] items-center rounded-full border px-3 text-xs font-medium tabular-nums"
      style={paymentAmountStyle(amount)}
    >
      {formatPaymentAmount(amount)}
    </span>
  )
}

function StatusBadge({ status }: { status: PaymentRow['detail']['status'] }) {
  return (
    <span
      className="inline-flex h-5 items-center rounded-full border px-1.5 text-xs font-medium"
      style={paymentStatusStyle(status)}
    >
      {status}
    </span>
  )
}

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
        <Select value={rowsPerPage} onValueChange={onRowsChange}>
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

/** Figma expand — Trace ID / Date / Currency · Type / Method / Descriptor · Amount / Fee / Total · Status */
function PaymentExpanded({ row }: { row: PaymentRow }) {
  const d = row.detail
  return (
    <div className="flex flex-col gap-4 px-3 py-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-6 sm:flex-row sm:gap-10 lg:gap-16">
        <div className="flex w-full max-w-[250px] flex-col gap-2.5">
          <DetailRow label="Trace ID:">{row.id}</DetailRow>
          <DetailRow label="Date:">{d.dateTime}</DetailRow>
          <DetailRow label="Currency:">{d.currency}</DetailRow>
        </div>
        <div className="flex w-full max-w-[250px] flex-col gap-2.5">
          <DetailRow label="Type:">{row.type}</DetailRow>
          <DetailRow label="Method:">{row.method}</DetailRow>
          <DetailRow label="Descriptor:">{row.descriptor}</DetailRow>
        </div>
        <div className="flex w-full max-w-[250px] flex-col gap-2.5">
          <DetailRow label="Amount:">{formatMoney(d.amount)}</DetailRow>
          <DetailRow label="Fee:">{formatMoney(d.fee)}</DetailRow>
          <DetailRow label="Total Amount:">
            <AmountBadge amount={row.totalAmount} />
          </DetailRow>
        </div>
        <div className="flex w-full max-w-[250px] flex-col gap-2.5">
          <DetailRow label="Status:">
            <StatusBadge status={d.status} />
          </DetailRow>
        </div>
      </div>
    </div>
  )
}

function PaymentsTable({ filters }: { filters: PaymentFilters }) {
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState('10')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const rows = useMemo(() => filterPaymentRows(PAYMENT_ROWS, filters), [filters])

  const perPage = Number(rowsPerPage) || 10
  const pageCount = Math.max(1, Math.ceil(rows.length / perPage) || 1)
  const safePage = Math.min(page, pageCount)
  const pageRows = rows.slice((safePage - 1) * perPage, safePage * perPage)

  return (
    <div
      data-name="table-payments"
      className="rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]"
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="hidden h-11 text-xs md:table-cell">Trace ID</TableHead>
            <TableHead className="hidden h-11 w-[100px] text-xs sm:table-cell">Date</TableHead>
            <TableHead className="hidden h-11 text-xs lg:table-cell">Type</TableHead>
            <TableHead className="hidden h-11 text-xs lg:table-cell">Method</TableHead>
            <TableHead className="h-11 text-xs">Descriptor</TableHead>
            <TableHead className="h-11 text-xs">Total Amount</TableHead>
            <TableHead className="h-11 w-[60px] text-center text-xs">More</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                No payments match the selected filters.
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
                    <TableCell className="hidden py-3 font-medium tabular-nums md:table-cell">
                      {row.id}
                    </TableCell>
                    <TableCell className="hidden py-3 tabular-nums sm:table-cell">
                      {row.date}
                    </TableCell>
                    <TableCell className="hidden py-3 lg:table-cell">{row.type}</TableCell>
                    <TableCell className="hidden py-3 lg:table-cell">{row.method}</TableCell>
                    <TableCell className="max-w-[200px] truncate py-3 sm:max-w-[280px] lg:max-w-none">
                      {row.descriptor}
                    </TableCell>
                    <TableCell className="py-3">
                      <AmountBadge amount={row.totalAmount} />
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <span className="inline-flex size-8 items-center justify-center" aria-hidden>
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
                        <div className="border-b border-border bg-secondary/40">
                          <PaymentExpanded row={row} />
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
 * Payments — Figma WIP pLN2feuHEdp8DAjwU0h2zw
 * Desktop 6232:74149 · section 6232:74153 · Filters Type + Date Range
 */
export function PaymentsPage({ className }: { className?: string }) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [applied, setApplied] = useState<PaymentFilters>(EMPTY_PAYMENT_FILTERS)
  const [draft, setDraft] = useState<PaymentFilters>(EMPTY_PAYMENT_FILTERS)

  const activeCount = paymentFiltersActiveCount(applied)

  const openFilters = () => {
    setDraft(applied)
    setFiltersOpen(true)
  }

  const clearChip = (key: keyof PaymentFilters) => {
    if (key === 'dateRange') {
      setApplied((prev) => ({
        ...prev,
        dateRange: 'Last 30 days',
        dateFrom: '',
        dateTo: '',
      }))
      return
    }
    setApplied((prev) => ({ ...prev, [key]: '' }))
  }

  return (
    <section
      data-name="section-payments"
      className={cn('w-full bg-background px-4 pb-14 pt-4 lg:px-6 lg:pt-6', className)}
    >
      <div className="mb-4 flex items-center gap-1.5">
        <h1 className="text-xl font-semibold leading-7 text-foreground lg:text-2xl lg:leading-8">
          Payments
        </h1>
        <LumenTooltip label="Review deposits and withdrawals on your account" side="bottom">
          <button
            type="button"
            aria-label="About Payments"
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <IconInfoCircle className="size-4" stroke={1.75} aria-hidden />
          </button>
        </LumenTooltip>
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
        {applied.type ? (
          <button
            type="button"
            onClick={() => clearChip('type')}
            className="inline-flex h-[26px] items-center gap-1.5 rounded-full border border-border bg-secondary px-3 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
          >
            {applied.type}
            <IconX className="size-3" stroke={2} aria-hidden />
          </button>
        ) : null}
      </div>

      <PaymentsTable key={`${applied.type}-${applied.dateRange}`} filters={applied} />

      <PaymentsFiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        draft={draft}
        onDraftChange={setDraft}
        onClear={() => {
          setDraft({ ...EMPTY_PAYMENT_FILTERS })
          setApplied({ ...EMPTY_PAYMENT_FILTERS })
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
