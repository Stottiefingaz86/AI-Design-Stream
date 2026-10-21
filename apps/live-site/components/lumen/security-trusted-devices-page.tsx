'use client'

import { Fragment, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconDeviceDesktop,
  IconDeviceLaptop,
  IconDeviceMobile,
  IconDevices,
  IconTrash,
} from '@tabler/icons-react'
import { toast } from 'sonner'
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
import { SecurityRemoveDeviceDialog } from '@/components/lumen/security-remove-device-dialog'
import { TRUSTED_DEVICES, type TrustedDevice } from '@/lib/lumen/security-central'
import { cn } from '@/lib/utils'

const ROW_HOVER = 'hover:!bg-surface-muted-3'
const ROW_OPEN = 'bg-surface-muted-3'
const EXPAND_EASE = 'duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'

function DeviceIcon({ kind }: { kind: TrustedDevice['kind'] }) {
  const Icon =
    kind === 'phone' ? IconDeviceMobile : kind === 'desktop' ? IconDeviceDesktop : IconDeviceLaptop
  return <Icon className="size-4 shrink-0 text-foreground" stroke={1.75} aria-hidden />
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

function HeaderCard() {
  return (
    <>
      <Link
        href="/account/security"
        className="inline-flex h-9 w-fit items-center gap-1 rounded-full px-1 text-sm font-medium text-foreground transition-colors hover:bg-accent lg:hidden"
      >
        <IconChevronLeft className="size-4" stroke={2} />
        Back
      </Link>

      <div
        data-name="section-header-navigation"
        className="rounded-[10px] border border-border bg-card p-4 shadow-[0_0_16px_rgba(0,0,0,0.06)]"
      >
        <div className="flex items-center gap-1 lg:gap-4">
          <Link
            href="/account/security"
            aria-label="Back to Security Central"
            className="hidden size-10 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent lg:inline-flex"
          >
            <IconChevronLeft className="size-4" stroke={2} />
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <IconDevices className="size-8 shrink-0 text-foreground" stroke={1.5} />
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-semibold leading-6 text-card-foreground">
                Trusted Devices
              </h1>
              <p className="text-sm leading-5 text-muted-foreground">
                These are the devices you wanted us to remember for faster Log-In. If you don&apos;t
                recognize a device remove it immediately or contact{' '}
                <a href="#support" className="text-[color:var(--link)] hover:underline">
                  Customer Support
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function DeviceExpanded({
  device,
  onRemove,
}: {
  device: TrustedDevice
  onRemove: () => void
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border bg-secondary/40 px-4 py-3">
      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="font-semibold text-foreground">Device Name:</dt>
          <dd className="text-right text-card-foreground">{device.name}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="font-semibold text-foreground">Browser / OS:</dt>
          <dd className="text-right text-card-foreground">{device.browserOs}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="font-semibold text-foreground">Last Seen:</dt>
          <dd
            className={cn(
              'text-right',
              device.isCurrent ? 'font-semibold text-success' : 'text-card-foreground',
            )}
          >
            {device.lastSeen}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="font-semibold text-foreground">Location:</dt>
          <dd className="text-right text-card-foreground">{device.location}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="font-semibold text-foreground">Trust Date:</dt>
          <dd className="text-right text-card-foreground">{device.trustDate}</dd>
        </div>
      </dl>
      <Button
        type="button"
        variant="secondary"
        className="h-9 w-full border border-border"
        onClick={onRemove}
      >
        <IconTrash className="size-4" stroke={1.75} />
        Remove
      </Button>
    </div>
  )
}

/**
 * Trusted Devices — Figma WIP OLtqQMwYLpOF0DfqMBK45a
 * Desktop table 8293:82725 · mobile accordion 8293:82732 · remove dialog 8298:94111
 */
export function SecurityTrustedDevicesPage({ className }: { className?: string }) {
  const [devices, setDevices] = useState(TRUSTED_DEVICES)
  const [pending, setPending] = useState<TrustedDevice | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState('10')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const perPage = Number(rowsPerPage) || 10
  const pageCount = Math.max(1, Math.ceil(devices.length / perPage) || 1)
  const safePage = Math.min(page, pageCount)
  const pageRows = useMemo(
    () => devices.slice((safePage - 1) * perPage, safePage * perPage),
    [devices, safePage, perPage],
  )

  const confirmRemove = () => {
    if (!pending) return
    setDevices((prev) => prev.filter((d) => d.id !== pending.id))
    setExpandedId((id) => (id === pending.id ? null : id))
    toast.success('Device removed from trusted list.')
    setPending(null)
  }

  const pager = (
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
  )

  return (
    <section
      data-name="section-trusted-devices"
      className={cn(
        'flex w-full flex-col gap-4 bg-background px-4 pb-14 pt-4 lg:px-6 lg:pt-6',
        className,
      )}
    >
      <HeaderCard />

      {/* Mobile accordion — Device Name + Last Seen */}
      <div
        data-name="table-trusted-devices"
        className="overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)] lg:hidden"
      >
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-border px-4 py-3 text-xs font-medium text-muted-foreground">
          <span>Device Name</span>
          <span className="pr-8">Last Seen</span>
          <span className="w-8" aria-hidden />
        </div>
        {pageRows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">No trusted devices.</p>
        ) : (
          pageRows.map((device) => {
            const open = expandedId === device.id
            return (
              <Fragment key={device.id}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setExpandedId(open ? null : device.id)}
                  className={cn(
                    'grid w-full grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-border px-4 py-3 text-left text-sm transition-colors',
                    ROW_HOVER,
                    open && ROW_OPEN,
                  )}
                >
                  <span className="inline-flex min-w-0 items-center gap-2 font-medium text-card-foreground">
                    <DeviceIcon kind={device.kind} />
                    <span className="truncate">{device.name}</span>
                  </span>
                  <span
                    className={cn(
                      'whitespace-nowrap',
                      device.isCurrent ? 'font-semibold text-success' : 'text-muted-foreground',
                    )}
                  >
                    {device.lastSeen}
                  </span>
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
                </button>
                <ExpandPanel open={open}>
                  <DeviceExpanded device={device} onRemove={() => setPending(device)} />
                </ExpandPanel>
              </Fragment>
            )
          })
        )}
        {pager}
      </div>

      {/* Desktop table */}
      <div
        data-name="table-trusted-devices"
        className="hidden overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)] lg:block"
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 text-xs">Device Name</TableHead>
              <TableHead className="h-11 text-xs">Browser / OS</TableHead>
              <TableHead className="h-11 text-xs">Last Seen</TableHead>
              <TableHead className="h-11 text-xs">Location</TableHead>
              <TableHead className="h-11 text-xs">Trust Date</TableHead>
              <TableHead className="h-11 text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No trusted devices.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((device) => (
                <TableRow key={device.id} className={cn('border-border', ROW_HOVER)}>
                  <TableCell className="py-3">
                    <span className="inline-flex items-center gap-2 font-medium text-card-foreground">
                      <DeviceIcon kind={device.kind} />
                      {device.name}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-muted-foreground">{device.browserOs}</TableCell>
                  <TableCell
                    className={cn(
                      'py-3',
                      device.isCurrent ? 'font-semibold text-success' : 'text-card-foreground',
                    )}
                  >
                    {device.lastSeen}
                  </TableCell>
                  <TableCell className="py-3 text-card-foreground">{device.location}</TableCell>
                  <TableCell className="py-3 tabular-nums text-card-foreground">
                    {device.trustDate}
                  </TableCell>
                  <TableCell className="py-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 border border-border"
                      onClick={() => setPending(device)}
                    >
                      <IconTrash className="size-3.5" stroke={1.75} />
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {pager}
      </div>

      <SecurityRemoveDeviceDialog
        open={pending !== null}
        deviceName={pending?.name ?? ''}
        onClose={() => setPending(null)}
        onConfirm={confirmRemove}
      />
    </section>
  )
}
