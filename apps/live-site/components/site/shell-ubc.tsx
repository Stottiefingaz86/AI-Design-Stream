'use client'

import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import NumberFlow from '@number-flow/react'
import { Button } from '@/components/ui/button'
import { useShell } from './shell-context'
import { ShellIcon, type ShellIconName } from './shell-icons'
import { useDragToClose } from './use-drag-to-close'
import { cn } from '@/lib/utils'

type UbcMenuItem = {
  label: string
  icon: ShellIconName
  badge?: string
  badgeMuted?: boolean
  value?: string
  /** Soft-nav href. Omit for non-route actions (VIP Hub) or not-yet-built (RAF). */
  href?: string
  action?: 'vip-hub'
}

const ACCOUNT_ITEMS: UbcMenuItem[] = [
  { label: 'My Account', icon: 'user', href: '/account' },
  {
    label: 'Pending Bets',
    icon: 'betslip',
    badge: '4',
    badgeMuted: true,
    value: '$40.00',
    href: '/account/bet-history?status=Pending',
  },
  { label: 'Transactions History', icon: 'transactions', href: '/account/transactions' },
  { label: 'Bet History', icon: 'accountBetHistory', href: '/account/bet-history' },
]

const REWARDS_ITEMS: UbcMenuItem[] = [
  { label: 'My Bonus', icon: 'gift', href: '/promotions/my-bonus' },
  /* RAF not shipped yet — keep visible, no navigation. */
  { label: 'Refer a Friend', icon: 'userPlus' },
  { label: 'VIP Hub', icon: 'crown', action: 'vip-hub' },
]

export function ShellUbc() {
  const {
    drawerOpen,
    setDrawerOpen,
    cashierOpen,
    setCashierOpen,
    vipHubOpen,
    setVipHubOpen,
  } = useShell()

  const toggleCashier = () => {
    setCashierOpen(!cashierOpen)
  }

  const toggleAccount = () => {
    setDrawerOpen(!drawerOpen)
  }

  const toggleVip = () => {
    setVipHubOpen(!vipHubOpen)
  }

  return (
    <div className="flex items-center gap-2">
      <BalanceButton onClick={toggleCashier} open={cashierOpen} />
      <VipButton onClick={toggleVip} open={vipHubOpen} />
      <AccountButton onClick={toggleAccount} open={drawerOpen} />
    </div>
  )
}

function BalanceButton({ onClick, open = false }: { onClick: () => void; open?: boolean }) {
  const { displayBalance } = useShell()

  return (
    <button
      type="button"
      data-shell-balance=""
      onClick={onClick}
      aria-expanded={open}
      aria-label={open ? 'Close wallet' : 'Open wallet'}
      className="shell-chrome-btn flex h-9 items-center overflow-hidden rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(250,250,250,0.05)] pl-1.5 transition-colors duration-200 ease-in-out hover:bg-white/10"
    >
      <span className="px-1 text-xs font-medium leading-4 text-[rgba(255,255,255,0.87)]">
        $
        <NumberFlow
          value={displayBalance}
          format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
        />
      </span>
      <span className="flex h-9 items-center bg-[rgba(255,255,255,0.1)] px-2.5">
        <ShellIcon name="wallet" className="size-4" />
      </span>
    </button>
  )
}

/**
 * Header crown — Shell Figma:
 * - `loggedOut`: muted IconButton (secondary fill + white/60 crown)
 * - `default` / claimable: gold bronze VIP chrome
 */
export function VipButton({
  onClick,
  open = false,
  variant = 'default',
}: {
  onClick: () => void
  open?: boolean
  /** Shell header logged-out VIP IconButton (3191:780450). */
  variant?: 'loggedOut' | 'default'
}) {
  const { vipClaimCount, loggedIn } = useShell()
  const needsAttention = loggedIn && vipClaimCount > 0
  const loggedOut = variant === 'loggedOut'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-label={
        needsAttention
          ? `VIP Hub, ${vipClaimCount} reward${vipClaimCount === 1 ? '' : 's'} ready to claim`
          : 'VIP Hub'
      }
      className={cn(
        'shell-chrome-btn relative inline-flex size-9 items-center justify-center rounded-lg transition-[background-color,border-color,opacity] duration-200 ease-in-out',
        loggedOut
          ? 'border border-[rgba(255,255,255,0.08)] bg-[rgba(250,250,250,0.05)] hover:bg-white/10'
          : 'border border-[rgba(227,158,61,0.55)] bg-[rgba(227,158,61,0.18)] opacity-80 hover:border-[rgba(227,158,61,0.95)] hover:bg-[rgba(227,158,61,0.42)] hover:opacity-100',
        needsAttention && !loggedOut && 'vip-crown-wobble opacity-100',
      )}
    >
      {loggedOut ? (
        /* Shell 3191:780450 — secondary IconButton + white/60 crown */
        <ShellIcon name="crownMuted" className="size-4" />
      ) : (
        <ShellIcon name="crownGold" className="size-4 opacity-100" />
      )}
      {needsAttention && !loggedOut ? (
        <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-white">
          {vipClaimCount > 9 ? '9+' : vipClaimCount}
        </span>
      ) : null}
    </button>
  )
}

function AccountButton({ onClick, open = false }: { onClick: () => void; open?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-label="Account"
      className="shell-chrome-btn relative inline-flex size-9 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(250,250,250,0.05)] transition-colors duration-200 ease-in-out hover:bg-white/10"
    >
      <ShellIcon name="account" className="size-4" />
      <span className="absolute right-0 top-0 size-1.5 rounded-full border border-[var(--header-inverted)] bg-destructive" />
    </button>
  )
}

export function UbcSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mounted, shown } = useAnimatedOpen(open)
  const [portalReady, setPortalReady] = useState(false)

  useEffect(() => {
    setPortalReady(true)
  }, [])

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

  if (!mounted || !portalReady) return null

  return createPortal(
    <>
      <DesktopUbc open={shown} onClose={onClose} />
      <MobileUbc open={shown} onClose={onClose} />
    </>,
    document.body,
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
        data-ubc-backdrop=""
        data-state={open ? 'open' : 'closed'}
        onClick={onClose}
        className="absolute inset-0 border-0 bg-black/60"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Account"
        data-name="UBC"
        data-state={open ? 'open' : 'closed'}
        className="absolute inset-y-0 right-0 flex w-[384px] max-w-[384px] flex-col overflow-y-auto border-l border-border bg-background p-4 shadow-lg"
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
        data-ubc-backdrop=""
        data-state={open ? 'open' : 'closed'}
        onClick={onClose}
        className="absolute inset-0 border-0 bg-black/60"
        style={dragging ? { opacity: backdrop, transition: 'none' } : undefined}
      />
      <aside
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Account"
        data-name="UBC"
        data-state={open ? 'open' : 'closed'}
        data-dragging={dragging ? 'true' : undefined}
        {...bind}
        className="absolute inset-x-0 bottom-0 flex max-h-[calc(100svh-112px)] flex-col overflow-hidden rounded-t-[10px] bg-background shadow-[0_0_16px_rgba(0,0,0,0.06)]"
        style={offset > 0 ? { transform: `translateY(${offset}px)`, transition: 'none' } : undefined}
      >
        <div
          data-drag-handle=""
          className="flex w-full shrink-0 cursor-grab touch-none items-center justify-center px-4 pb-1 pt-2 active:cursor-grabbing"
          aria-label="Drag down to close"
        >
          <span />
        </div>
        <div className="shell-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
          <UbcPanel onClose={onClose} />
        </div>
      </aside>
    </div>
  )
}

export function UbcPanel({
  onClose,
  showClose = false,
}: {
  onClose: () => void
  showClose?: boolean
}) {
  const router = useRouter()
  const { setLoggedIn, setVipHubOpen, vipClaimCount, displayBalance, startNavigating } =
    useShell()

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
              <ShellIcon name="drawer" tone="token" className="size-4 text-foreground" />
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
          <Row
            label="Available Balance"
            value={`$${displayBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          />
          <Row label="Free Bet" value="$0.00" />
          <Row label="Level" value="Bronze" gold />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Divider />
        <MenuRow item={{ label: 'Notifications', icon: 'bell', badge: '12' }} />
        <Divider />
        <div className="flex flex-col gap-2">
          {ACCOUNT_ITEMS.map((item) => (
            <MenuRow
              key={item.label}
              item={item}
              onClick={
                item.href
                  ? () => {
                      onClose()
                      const path = item.href!.split('?')[0]!
                      startNavigating(path)
                      router.push(item.href!)
                    }
                  : undefined
              }
            />
          ))}
        </div>
        <Divider />
        <div className="flex flex-col gap-2">
          {REWARDS_ITEMS.map((item) => (
            <MenuRow
              key={item.label}
              item={{
                ...item,
                ...(item.action === 'vip-hub' && vipClaimCount > 0
                  ? { badge: String(vipClaimCount) }
                  : null),
              }}
              onClick={
                item.action === 'vip-hub'
                  ? () => {
                      onClose()
                      window.setTimeout(() => setVipHubOpen(true), 180)
                    }
                  : item.href
                    ? () => {
                        onClose()
                        const path = item.href!.split('?')[0]!
                        startNavigating(path)
                        router.push(item.href!)
                      }
                    : undefined
              }
            />
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
          <ShellIcon name="signOut" tone="token" className="size-4 bg-current" />
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
      <ShellIcon name={dark ? 'moon' : 'sun'} tone="token" className="size-4" />
    </button>
  )
}

function MenuRow({
  item,
  onClick,
}: {
  item: {
    label: string
    icon: ShellIconName
    badge?: string
    badgeMuted?: boolean
    value?: string
  }
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shell-chrome-btn group flex h-11 w-full items-center gap-2 rounded-lg px-4 text-left text-sm font-medium leading-5 text-muted-foreground transition-colors duration-200 ease-in-out hover:bg-accent hover:text-foreground active:text-foreground"
    >
      <span className="flex size-6 items-center justify-center text-muted-foreground group-hover:text-foreground group-active:text-foreground">
        {/* Mask icons: muted by default → full on hover/press (solid SVG alpha; color from text-*). */}
        <ShellIcon name={item.icon} tone="token" className="size-5 !bg-current" />
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
      setShown(false)
      let timeout = 0
      const frame = window.requestAnimationFrame(() => {
        timeout = window.setTimeout(() => setShown(true), 24)
      })
      return () => {
        window.cancelAnimationFrame(frame)
        window.clearTimeout(timeout)
      }
    }
    setShown(false)
    const timer = window.setTimeout(() => setMounted(false), 320)
    return () => window.clearTimeout(timer)
  }, [open])

  return { mounted, shown }
}
