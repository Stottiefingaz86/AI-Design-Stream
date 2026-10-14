'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Button } from '@/components/ui/button'
import { useShell } from './shell-context'
import { ShellIcon, type ShellIconName } from './shell-icons'
import { cn } from '@/lib/utils'

const ACCOUNT_ITEMS: {
  label: string
  icon: ShellIconName
  badge?: string
  badgeMuted?: boolean
  value?: string
}[] = [
  { label: 'My Account', icon: 'user' },
  { label: 'Pending Bets', icon: 'betslip', badge: '4', badgeMuted: true, value: '$40.00' },
  { label: 'Transactions History', icon: 'transactions' },
  { label: 'Bet History', icon: 'ticket' },
]

const REWARDS_ITEMS: { label: string; icon: ShellIconName }[] = [
  { label: 'My Bonus', icon: 'gift' },
  { label: 'Refer a Friend', icon: 'userPlus' },
  { label: 'VIP Hub', icon: 'crown' },
]

export function ShellUbc() {
  const { setDrawerOpen } = useShell()

  return (
    <div className="flex items-center gap-2">
      <BalanceButton onClick={() => setDrawerOpen(true)} />
      <VipButton />
      <AccountButton onClick={() => setDrawerOpen(true)} />
    </div>
  )
}

function BalanceButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shell-chrome-btn flex h-9 items-center overflow-hidden rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(250,250,250,0.05)] pl-1.5 transition-colors duration-200 ease-in-out hover:bg-white/10"
      aria-label="Account and balance"
    >
      <span className="px-1 text-xs font-medium leading-4 text-[rgba(255,255,255,0.87)]">
        $100,000.00
      </span>
      <span className="flex h-9 items-center bg-[rgba(255,255,255,0.1)] px-2.5">
        <ShellIcon name="wallet" className="size-4" />
      </span>
    </button>
  )
}

function VipButton() {
  return (
    <button
      type="button"
      aria-label="VIP level"
      className="shell-chrome-btn inline-flex size-9 items-center justify-center rounded-lg border border-[rgba(227,158,61,0.55)] bg-[rgba(227,158,61,0.18)] opacity-80 transition-[background-color,border-color,opacity] duration-200 ease-in-out hover:border-[rgba(227,158,61,0.95)] hover:bg-[rgba(227,158,61,0.42)] hover:opacity-100"
    >
      <ShellIcon name="crownGold" className="size-4 opacity-100" />
    </button>
  )
}

function AccountButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shell-chrome-btn relative inline-flex size-9 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(250,250,250,0.05)] transition-colors duration-200 ease-in-out hover:bg-white/10"
      aria-label="Account"
    >
      <ShellIcon name="account" className="size-4" />
      <span className="absolute right-0 top-0 size-1.5 rounded-full border border-[var(--header-inverted)] bg-destructive" />
    </button>
  )
}

export function UbcSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mounted, shown } = useAnimatedOpen(open)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!mounted) return null

  return (
    <>
      <DesktopUbc open={shown} onClose={onClose} />
      <MobileUbc open={shown} onClose={onClose} />
    </>
  )
}

function DesktopUbc({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      data-ubc-root="desktop"
      className={cn(
        'pointer-events-none fixed bottom-0 left-0 right-0 top-[68px] z-40 hidden lg:block',
        open && 'pointer-events-auto'
      )}
    >
      <button
        type="button"
        aria-label="Close account"
        onClick={onClose}
        className={cn(
          'absolute inset-0 border-0 bg-black/60 transition-opacity duration-300 ease-in-out',
          open ? 'opacity-100' : 'opacity-0'
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Account"
        data-name="UBC"
        className={cn(
          'absolute inset-y-0 right-0 flex w-[384px] max-w-[384px] flex-col overflow-y-auto border-l border-border bg-background p-4 shadow-lg transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <UbcPanel onClose={onClose} showClose />
      </aside>
    </div>
  )
}

function MobileUbc({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { sheetRef, offset, dragging, bind } = useDragToClose(open, onClose)
  const backdrop = open ? Math.max(0, 1 - offset / 320) : 0

  return (
    <div
      data-ubc-root="mobile"
      className={cn(
        'pointer-events-none fixed inset-0 z-[200] lg:hidden',
        open && 'pointer-events-auto'
      )}
    >
      <button
        type="button"
        aria-label="Close account"
        onClick={onClose}
        className={cn(
          'absolute inset-0 border-0 bg-black/60',
          !dragging && 'transition-opacity duration-300 ease-in-out'
        )}
        style={{ opacity: backdrop }}
      />
      <aside
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Account"
        data-name="UBC"
        {...bind}
        className={cn(
          'absolute inset-x-0 bottom-0 flex max-h-[calc(100svh-112px)] flex-col overflow-y-auto rounded-t-[10px] bg-background px-4 pb-6 pt-2 shadow-[0_0_16px_rgba(0,0,0,0.06)]',
          !dragging && 'transition-transform duration-300 ease-in-out',
          open && offset === 0 ? 'translate-y-0' : !open ? 'translate-y-full' : null
        )}
        style={offset > 0 ? { transform: `translateY(${offset}px)` } : undefined}
      >
        <div
          data-drag-handle=""
          className="flex w-full shrink-0 cursor-grab touch-none items-center justify-center py-2 active:cursor-grabbing"
        >
          <span />
        </div>
        <UbcPanel onClose={onClose} />
      </aside>
    </div>
  )
}

function useDragToClose(open: boolean, onClose: () => void) {
  const sheetRef = useRef<HTMLElement>(null)
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startY = useRef(0)
  const lastY = useRef(0)
  const lastT = useRef(0)
  const velocity = useRef(0)
  const offsetRef = useRef(0)
  const draggingRef = useRef(false)
  const pending = useRef(false)

  const setDragOffset = (value: number) => {
    offsetRef.current = value
    setOffset(value)
  }

  useEffect(() => {
    if (open) setDragOffset(0)
  }, [open])

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    const sheet = sheetRef.current
    if (!sheet || !open) return
    const fromHandle = (event.target as HTMLElement).closest('[data-drag-handle]')
    if (!fromHandle && sheet.scrollTop > 0) return
    startY.current = event.clientY
    lastY.current = event.clientY
    lastT.current = performance.now()
    velocity.current = 0
    if (fromHandle) {
      draggingRef.current = true
      setDragging(true)
      event.currentTarget.setPointerCapture(event.pointerId)
      return
    }
    pending.current = true
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const dy = event.clientY - startY.current
    if (pending.current) {
      if (dy < 8) return
      pending.current = false
      draggingRef.current = true
      setDragging(true)
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    if (!draggingRef.current) return
    const now = performance.now()
    const dt = now - lastT.current
    if (dt > 0) velocity.current = (event.clientY - lastY.current) / dt
    lastY.current = event.clientY
    lastT.current = now
    setDragOffset(Math.max(0, dy))
  }

  const endDrag = () => {
    pending.current = false
    if (!draggingRef.current) return
    draggingRef.current = false
    const height = sheetRef.current?.offsetHeight ?? 400
    const current = offsetRef.current
    const shouldClose = current > 80 || current > height * 0.22 || velocity.current > 0.55
    setDragging(false)
    setDragOffset(0)
    if (shouldClose) onClose()
  }

  return {
    sheetRef,
    offset,
    dragging,
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  }
}

export function UbcPanel({
  onClose,
  showClose = false,
}: {
  onClose: () => void
  showClose?: boolean
}) {
  const { setLoggedIn } = useShell()

  return (
    <div data-name="UBC_content" className="flex w-full flex-col gap-5 pb-6">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-1.5">
          {showClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close account"
              className="shell-chrome-btn inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors duration-200 ease-in-out hover:bg-accent"
            >
              <ShellIcon name="drawer" tone="surface" className="size-4" />
            </button>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-5 text-foreground">
              User Name &lt;Nickname&gt;
            </p>
            <p className="text-xs font-medium leading-4 text-muted-foreground">b1234567</p>
          </div>
          <ThemeToggleButton />
        </div>

        <div className="flex flex-col gap-2 rounded-[10px] border border-border bg-card px-6 py-5">
          <Row label="Available Balance" value="$10,00" />
          <Row label="Free Bet" value="$0,00" />
          <Row label="Level" value="Gold" gold />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Divider />
        <MenuRow
          item={{ label: 'Notifications', icon: 'bell', badge: '12' }}
        />
        <Divider />
        <div className="flex flex-col gap-2">
          {ACCOUNT_ITEMS.map((item) => (
            <MenuRow key={item.label} item={item} />
          ))}
        </div>
        <Divider />
        <div className="flex flex-col gap-2">
          {REWARDS_ITEMS.map((item) => (
            <MenuRow key={item.label} item={item} />
          ))}
        </div>
        <Divider />
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="h-10 w-full rounded-lg transition-colors duration-200 ease-in-out hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_8%)] focus-visible:ring-2 focus-visible:ring-ring active:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_14%)]"
          onClick={() => {
            setLoggedIn(false)
            onClose()
          }}
        >
          <ShellIcon name="signOut" tone="surface" className="size-4" />
          LogOut
        </Button>
      </div>
    </div>
  )
}

export function ThemeToggleButton({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const dark = mounted && resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className={cn(
        'shell-chrome-btn inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-foreground transition-colors duration-200 ease-in-out hover:bg-accent',
        className
      )}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <ShellIcon name={dark ? 'moon' : 'sun'} tone="surface" className="size-4" />
    </button>
  )
}

function MenuRow({
  item,
}: {
  item: {
    label: string
    icon: ShellIconName
    badge?: string
    badgeMuted?: boolean
    value?: string
  }
}) {
  return (
    <button
      type="button"
      className="shell-chrome-btn flex h-11 w-full items-center gap-2 rounded-lg px-4 text-left text-sm font-medium leading-5 text-foreground transition-colors duration-200 ease-in-out hover:bg-accent"
    >
      <span className="flex size-6 items-center justify-center">
        <ShellIcon name={item.icon} tone="surface" className="size-5" />
      </span>
      <span className="min-w-0 flex-1">{item.label}</span>
      {item.badge ? (
        <span
          className={cn(
            'inline-flex size-5 items-center justify-center rounded-full text-[11px] font-medium leading-4',
            item.badgeMuted
              ? 'border border-border bg-secondary text-secondary-foreground'
              : 'bg-destructive text-white'
          )}
        >
          {item.badge}
        </span>
      ) : null}
      {item.value ? (
        <span className="text-sm font-medium text-muted-foreground">{item.value}</span>
      ) : null}
    </button>
  )
}

function Row({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm leading-5">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className={cn('font-semibold', gold ? 'text-[#c4af3e]' : 'text-foreground')}>{value}</span>
    </div>
  )
}

function Divider() {
  return <div className="h-px w-full bg-border" />
}

function useAnimatedOpen(open: boolean) {
  const [mounted, setMounted] = useState(false)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const frame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setShown(true))
      })
      return () => window.cancelAnimationFrame(frame)
    }
    setShown(false)
    const timer = window.setTimeout(() => setMounted(false), 320)
    return () => window.clearTimeout(timer)
  }, [open])

  return { mounted, shown }
}
