'use client'

import { useMemo, useRef, useState } from 'react'
import {
  IconChevronLeft,
  IconChevronRight,
  IconCopy,
  IconLink,
  IconSearch,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { CasinoLiveWinsCarousel } from '@/components/lumen/casino-live-wins-carousel'
import { useShell } from '@/components/site/shell-context'
import {
  claimButtonLabel,
  formatClaimAmount,
} from '@/lib/lumen/vip-hub'
import {
  RAF_FILTER_OPTIONS,
  RAF_REFERRAL_LINK,
  RAF_REFERRAL_ROWS,
  RAF_SORT_OPTIONS,
  RAF_STATS,
  filterRafRows,
  formatRafMoney,
  formatRafSigned,
  type RafFilterId,
  type RafReferralRow,
  type RafSortId,
} from '@/lib/lumen/refer-a-friend'
import { cn } from '@/lib/utils'

const ROW_HOVER = 'hover:!bg-surface-muted-3'
const CARD =
  'rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]'
/** Match cashier BTC converter fields — solid elevated fill, not bg-background/card wash. */
const FIELD = 'rounded-lg border border-input bg-popover'
const RAF_ICON = '/shell/figma/raf'

function RafIcon({
  name,
  className,
  invertInDark = false,
}: {
  name: string
  className?: string
  /** Mono Figma icons ship as black — invert in dark mode. */
  invertInDark?: boolean
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${RAF_ICON}/${name}.svg`}
      alt=""
      width={16}
      height={16}
      className={cn('size-4 shrink-0', invertInDark && 'dark:invert', className)}
    />
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
          <SelectTrigger className={cn(FIELD, 'h-8 w-[72px]')}>
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

function CommissionBadge({ row }: { row: RafReferralRow }) {
  if (row.commission.kind === 'pending') {
    return (
      <span
        className="inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium"
        style={{
          backgroundColor: 'var(--opacity-warning-10)',
          borderColor: 'var(--opacity-warning-60)',
          color: 'var(--warning)',
        }}
      >
        Pending
      </span>
    )
  }
  return (
    <span
      className="inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium tabular-nums"
      style={{
        backgroundColor: 'var(--opacity-success-10)',
        borderColor: 'var(--opacity-success-60)',
        color: 'var(--success)',
      }}
    >
      {formatRafSigned(row.commission.amount)}
    </span>
  )
}

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function ClaimStatCard() {
  const { vipRewards, claimVipReward } = useShell()
  const btnRef = useRef<HTMLButtonElement>(null)
  const reward = vipRewards.find((r) => r.id === 'refer-friend')
  const amount = reward?.amount ?? 0
  const state = reward?.state ?? 'claimed'
  const canClaim = state === 'enable'
  const claiming = state === 'landing'

  return (
    <div className={cn(CARD, 'flex flex-col gap-3 p-4')}>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-1">
          <RafIcon name="claim-token" />
          <p className="text-sm font-medium text-muted-foreground">Claim</p>
        </div>
        <p className="truncate text-2xl font-semibold leading-9 tabular-nums text-foreground" title={formatClaimAmount(amount)}>
          {formatClaimAmount(amount)}
        </p>
      </div>
      <Button
        ref={btnRef}
        type="button"
        size="sm"
        className="w-full"
        disabled={!canClaim || claiming}
        aria-busy={claiming}
        onClick={() => claimVipReward('refer-friend', btnRef.current)}
      >
        {claiming ? 'Claiming…' : canClaim ? 'Claim' : reward ? claimButtonLabel(reward) : 'Claimed'}
      </Button>
    </div>
  )
}

function ShareLinkCard() {
  const { earnReferShare } = useShell()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(RAF_REFERRAL_LINK)
    } catch {
      /* demo — ignore clipboard failures */
    }
    earnReferShare()
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className={cn(CARD, 'flex flex-col gap-3 p-4')}>
      <div>
        <Typography as="h2" shape="h4" weight="semibold">
          Share to Link
        </Typography>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Copy and share anywhere friends will see it.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <IconLink
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            stroke={2}
            aria-hidden
          />
          <Input
            readOnly
            value={RAF_REFERRAL_LINK}
            aria-label="Referral link"
            className={cn(FIELD, 'h-10 truncate pl-9 pr-3 font-mono text-xs sm:text-sm')}
          />
        </div>
        <Button type="button" variant="secondary" className="shrink-0 gap-1.5" onClick={copy}>
          <IconCopy className="size-4" stroke={2} aria-hidden />
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  )
}

function ReferralsTable() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<RafFilterId>('all')
  const [sort, setSort] = useState<RafSortId>('newest')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState('10')

  const rows = useMemo(
    () => filterRafRows(RAF_REFERRAL_ROWS, { search, filter, sort }),
    [search, filter, sort],
  )

  const perPage = Number(rowsPerPage) || 10
  const pageCount = Math.max(1, Math.ceil(rows.length / perPage) || 1)
  const safePage = Math.min(page, pageCount)
  const pageRows = rows.slice((safePage - 1) * perPage, safePage * perPage)

  return (
    <div data-name="raf-table" className={CARD}>
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <IconSearch
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            stroke={2}
            aria-hidden
          />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search"
            aria-label="Search referrals"
            className={cn(FIELD, 'h-9 pl-9')}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={filter}
            onValueChange={(value) => {
              setFilter(value as RafFilterId)
              setPage(1)
            }}
          >
            <SelectTrigger className={cn(FIELD, 'h-9 w-[148px]')}>
              <span className="truncate text-muted-foreground">
                Filter by:{' '}
                <span className="text-foreground">
                  {RAF_FILTER_OPTIONS.find((o) => o.id === filter)?.label}
                </span>
              </span>
            </SelectTrigger>
            <SelectContent className="z-[220]" position="popper" sideOffset={4}>
              {RAF_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(value) => {
              setSort(value as RafSortId)
              setPage(1)
            }}
          >
            <SelectTrigger className={cn(FIELD, 'h-9 w-[156px]')}>
              <span className="truncate text-muted-foreground">
                Sort by:{' '}
                <span className="text-foreground">
                  {RAF_SORT_OPTIONS.find((o) => o.id === sort)?.label}
                </span>
              </span>
            </SelectTrigger>
            <SelectContent className="z-[220]" position="popper" sideOffset={4}>
              {RAF_SORT_OPTIONS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-11 text-xs">Name</TableHead>
            <TableHead className="hidden h-11 text-xs sm:table-cell">Registered</TableHead>
            <TableHead className="hidden h-11 text-xs md:table-cell">VIP</TableHead>
            <TableHead className="hidden h-11 text-xs lg:table-cell">Deposited</TableHead>
            <TableHead className="hidden h-11 text-xs lg:table-cell">Wagered</TableHead>
            <TableHead className="hidden h-11 text-xs xl:table-cell">Rate</TableHead>
            <TableHead className="hidden h-11 text-xs md:table-cell">Claimed</TableHead>
            <TableHead className="h-11 text-xs">Commission</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                No referrals match the selected filters.
              </TableCell>
            </TableRow>
          ) : (
            pageRows.map((row) => (
              <TableRow key={row.id} className={cn('border-border transition-colors', ROW_HOVER)}>
                <TableCell className="max-w-[120px] truncate py-3 font-medium">{row.name}</TableCell>
                <TableCell className="hidden py-3 tabular-nums text-muted-foreground sm:table-cell">
                  {row.registered}
                </TableCell>
                <TableCell className="hidden py-3 md:table-cell">{row.vip}</TableCell>
                <TableCell className="hidden py-3 tabular-nums lg:table-cell">
                  {formatRafMoney(row.deposited)}
                </TableCell>
                <TableCell className="hidden py-3 tabular-nums lg:table-cell">
                  {formatRafMoney(row.wagered)}
                </TableCell>
                <TableCell className="hidden py-3 tabular-nums xl:table-cell">{row.rate}%</TableCell>
                <TableCell className="hidden py-3 tabular-nums md:table-cell">
                  {formatRafMoney(row.claimed)}
                </TableCell>
                <TableCell className="py-3">
                  <CommissionBadge row={row} />
                </TableCell>
              </TableRow>
            ))
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

function StickyShareColumn() {
  const { earnReferShare } = useShell()
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const canSend = firstName.trim().length > 0 && email.includes('@')

  return (
    <aside className="flex w-full flex-col gap-4">
      <div className={cn(CARD, 'flex flex-col gap-3 p-4')}>
        <div>
          <Typography as="h2" shape="h4" weight="semibold">
            Share on social
          </Typography>
          <p className="mt-0.5 text-sm text-muted-foreground">Post your link on X in one click.</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="w-full gap-2"
          onClick={() => {
            earnReferShare()
            const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(RAF_REFERRAL_LINK)}&text=${encodeURIComponent('Join me on BetOnline')}`
            window.open(url, '_blank', 'noopener,noreferrer')
          }}
        >
          <XLogo className="size-4" />
          Share on X
        </Button>
      </div>

      <div className={cn(CARD, 'flex flex-col gap-3 p-4')}>
        <div>
          <Typography as="h2" shape="h4" weight="semibold">
            Share to email
          </Typography>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Send your referral link to friends via email. (*) Required Fields
          </p>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">First Name*</span>
          <Input
            value={firstName}
            onChange={(event) => {
              setFirstName(event.target.value)
              setSent(false)
            }}
            placeholder="John"
            autoComplete="given-name"
            className={FIELD}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">Email*</span>
          <Input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setSent(false)
            }}
            placeholder="j.doe@gmail.com"
            autoComplete="email"
            className={FIELD}
          />
        </label>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={!canSend}
          onClick={() => {
            earnReferShare()
            setSent(true)
          }}
        >
          {sent ? 'Sent' : 'Send'}
        </Button>
      </div>
    </aside>
  )
}

/** Promo26 Refer a Friend — sticky share column + shared table/filter chrome. */
export function ReferAFriendPage({ className }: { className?: string }) {
  return (
    <div data-name="refer_a_friend" className={cn('w-full bg-background px-6 pb-14 pt-6', className)}>
      <Typography as="h1" shape="h2" weight="semibold" className="mb-4">
        Refer-A-Friend
      </Typography>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <ShareLinkCard />

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <ClaimStatCard />
            <div className={cn(CARD, 'flex flex-col gap-1 p-4')}>
              <div className="flex items-center gap-1">
                <RafIcon name="referrals-sent" invertInDark />
                <p className="text-sm font-medium text-muted-foreground">Referrals Sent</p>
              </div>
              <p className="text-2xl font-semibold leading-9 tabular-nums text-foreground">
                {RAF_STATS.referralsSent}
              </p>
            </div>
            <div className={cn(CARD, 'flex flex-col gap-1 p-4')}>
              <div className="flex items-center gap-1">
                <RafIcon name="joined" invertInDark />
                <p className="text-sm font-medium text-muted-foreground">Joined</p>
              </div>
              <p className="text-2xl font-semibold leading-9 tabular-nums text-foreground">
                {RAF_STATS.joined}
              </p>
            </div>
            <div className={cn(CARD, 'flex flex-col gap-1 p-4')}>
              <div className="flex items-center gap-1">
                <RafIcon name="lifetime-commission" invertInDark />
                <p className="text-sm font-medium text-muted-foreground">Lifetime Commission</p>
              </div>
              <p
                className="truncate text-2xl font-semibold leading-9 tabular-nums text-foreground"
                title={formatRafMoney(RAF_STATS.lifetimeCommission)}
              >
                {formatRafMoney(RAF_STATS.lifetimeCommission)}
              </p>
            </div>
          </div>

          <ReferralsTable />
        </div>

        {/* Sticky on the flex item itself — wrapper mustn’t shrink to content height. */}
        <div className="w-full shrink-0 lg:sticky lg:top-[76px] lg:w-[320px] lg:self-start lg:z-10">
          <StickyShareColumn />
        </div>
      </div>

      <div className="-mx-6 mt-8">
        <CasinoLiveWinsCarousel />
      </div>
    </div>
  )
}
