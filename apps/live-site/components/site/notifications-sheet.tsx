'use client'

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import {
  IconAlertTriangle,
  IconBellOff,
  IconCheck,
  IconChevronLeft,
  IconCoins,
  IconCrown,
  IconDots,
  IconGift,
  IconSettings,
  IconSparkles,
  IconTrash,
} from '@tabler/icons-react'
import { Typography } from '@/components/ui/typography'
import { ShellIcon } from '@/components/site/shell-icons'
import { useShell } from '@/components/site/shell-context'
import { useDragToClose } from '@/components/site/use-drag-to-close'
import { useBackdropClose } from '@/components/site/use-tap-action'
import {
  formatNotificationTime,
  groupNotifications,
  type InboxNotification,
  type NotificationFilter,
  type NotificationIcon,
} from '@/lib/lumen/notifications'
import { cn } from '@/lib/utils'

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

function ScopePillTrack({
  filter,
  unreadCount,
  onChange,
}: {
  filter: NotificationFilter
  unreadCount: number
  onChange: (f: NotificationFilter) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState({ x: 0, w: 0, ready: false })
  const [coveredId, setCoveredId] = useState(filter)

  const measureThumb = useCallback(() => {
    const track = trackRef.current
    const btn = track?.querySelector<HTMLElement>(
      '[data-sub-menu-pill][data-active="true"]',
    )
    if (!track || !btn) return
    setThumb({ x: btn.offsetLeft, w: btn.offsetWidth, ready: true })
  }, [])

  useLayoutEffect(() => {
    measureThumb()
    const track = trackRef.current
    if (!track) return
    const ro = new ResizeObserver(measureThumb)
    ro.observe(track)
    return () => ro.disconnect()
  }, [filter, unreadCount, measureThumb])

  useEffect(() => {
    const t = window.setTimeout(() => setCoveredId(filter), 160)
    return () => window.clearTimeout(t)
  }, [filter])

  const items: { id: NotificationFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
  ]

  return (
    <div
      ref={trackRef}
      data-name="sub-menu-pill-track"
      className="relative flex h-12 w-full items-center gap-1 rounded-full bg-secondary p-0.5"
      role="tablist"
      aria-label="Notification filters"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-0.5 h-11 rounded-full bg-primary transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ left: thumb.x, width: thumb.w, opacity: thumb.ready ? 1 : 0 }}
      />
      {items.map((item) => {
        const on = item.id === filter
        const covered = item.id === coveredId
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={on}
            data-sub-menu-pill=""
            data-active={on ? 'true' : 'false'}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative z-10 flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-transparent px-3 text-sm leading-5 transition-colors duration-150',
              covered
                ? 'font-medium text-primary-foreground'
                : 'font-normal text-muted-foreground hover:text-foreground',
            )}
          >
            {item.label}
            {item.id === 'unread' && unreadCount > 0 ? (
              <span
                className={cn(
                  'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold leading-5',
                  covered
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-foreground/10 text-muted-foreground',
                )}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

const ICON_WRAP: Record<NotificationIcon, string> = {
  sports: 'bg-success text-success-foreground',
  casino: 'bg-secondary text-foreground',
  vip: 'bg-muted text-foreground',
  deposit: 'bg-success text-success-foreground',
  claim: 'bg-success text-success-foreground',
  rakeback: 'bg-primary/15 text-primary',
  alert: 'bg-warning/20 text-warning',
  promo: 'bg-primary/15 text-primary',
}

function NotificationAvatar({ icon }: { icon: NotificationIcon }) {
  const cls = 'size-4'
  const glyph =
    icon === 'sports' ? (
      <ShellIcon name="football" className={cls} />
    ) : icon === 'casino' || icon === 'promo' ? (
      <IconSparkles className={cls} strokeWidth={2} />
    ) : icon === 'vip' ? (
      <IconCrown className={cls} strokeWidth={2} />
    ) : icon === 'deposit' ? (
      <IconCoins className={cls} strokeWidth={2} />
    ) : icon === 'rakeback' ? (
      <IconGift className={cls} strokeWidth={2} />
    ) : icon === 'alert' ? (
      <IconAlertTriangle className={cls} strokeWidth={2} />
    ) : (
      <IconCheck className={cls} strokeWidth={2.25} />
    )

  return (
    <span
      className={cn(
        'mt-0.5 grid size-8 shrink-0 place-items-center rounded-full',
        ICON_WRAP[icon],
      )}
    >
      {glyph}
    </span>
  )
}

function NotificationActionsMenu({
  item,
  onRead,
  onDismiss,
}: {
  item: InboxNotification
  onRead: (id: string) => void
  onDismiss: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [portalReady, setPortalReady] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  useEffect(() => {
    setPortalReady(true)
  }, [])

  const updateCoords = () => {
    const el = btnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const width = 200
    const height = item.read ? 88 : 128
    let left = r.right - width
    if (left < 8) left = 8
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8
    let top = r.bottom + 6
    if (top + height > window.innerHeight - 8) {
      top = Math.max(8, r.top - height - 6)
    }
    setCoords({ top, left })
  }

  useLayoutEffect(() => {
    if (!open) return
    updateCoords()
  }, [open, item.read])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      e.stopImmediatePropagation()
      setOpen(false)
    }
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const onReposition = () => updateCoords()
    /* Defer so the opening click doesn’t immediately close (pick-a-game pattern). */
    const attachId = window.setTimeout(() => {
      document.addEventListener('pointerdown', onPointer, true)
    }, 0)
    document.addEventListener('keydown', onKey, true)
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    return () => {
      window.clearTimeout(attachId)
      document.removeEventListener('pointerdown', onPointer, true)
      document.removeEventListener('keydown', onKey, true)
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open, item.read])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label="Notification actions"
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          'inline-flex size-8 shrink-0 items-center justify-center rounded-full',
          'text-muted-foreground outline-none',
          'hover:bg-accent hover:text-foreground',
          'focus-visible:ring-2 focus-visible:ring-ring',
          open && 'bg-accent text-foreground',
        )}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (open) {
            setOpen(false)
            return
          }
          updateCoords()
          setOpen(true)
        }}
      >
        <IconDots className="size-4" strokeWidth={2} />
      </button>
      {open && portalReady
        ? createPortal(
            <div
              ref={menuRef}
              data-notifications-menu=""
              data-brand="betonline"
              role="menu"
              aria-label="Notification actions"
              className="dark min-w-[200px] overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
              style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                zIndex: 260,
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {!item.read ? (
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm outline-none hover:bg-accent"
                  onClick={() => {
                    onRead(item.id)
                    setOpen(false)
                  }}
                >
                  <IconCheck className="size-4 text-primary" strokeWidth={2.25} />
                  Mark as read
                </button>
              ) : null}
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm outline-none hover:bg-accent"
                onClick={() => {
                  onDismiss(item.id)
                  setOpen(false)
                }}
              >
                <IconTrash className="size-4" strokeWidth={1.75} />
                Delete
              </button>
              <button
                type="button"
                role="menuitem"
                disabled
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-muted-foreground opacity-60"
              >
                <IconBellOff className="size-4" strokeWidth={1.75} />
                Turn off notifications
              </button>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

function NotificationRow({
  item,
  onRead,
  onDismiss,
}: {
  item: InboxNotification
  onRead: (id: string) => void
  onDismiss: (id: string) => void
}) {
  return (
    <article
      data-name="notification-row"
      data-unread={!item.read ? 'true' : 'false'}
      className={cn(
        'group relative flex w-full gap-3 px-4 py-3 text-left transition-colors',
        !item.read ? 'bg-surface-muted-3' : 'bg-transparent hover:bg-surface-muted-3',
      )}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 gap-3 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => onRead(item.id)}
      >
        <NotificationAvatar icon={item.icon} />
        <div className="min-w-0 flex-1">
          <p className="pr-10 text-sm font-semibold leading-5 text-foreground">
            {item.title}
          </p>
          <p className="mt-0.5 pr-6 text-sm leading-5 text-foreground/90">
            {item.body}
          </p>
          {item.progress ? (
            <div className="mt-2 rounded-lg border border-border bg-card px-3 py-2.5">
              <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                <span className="font-medium text-foreground">{item.progress.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {item.progress.percent}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#d4a017,#f0c14b)]"
                  style={{ width: `${item.progress.percent}%` }}
                />
              </div>
            </div>
          ) : null}
          <p className="mt-1.5 text-xs text-muted-foreground">
            {formatNotificationTime(item.createdAt)}
          </p>
        </div>
      </button>
      <div className="absolute right-2 top-2.5 flex items-start gap-1.5">
        {!item.read ? (
          <span
            className="mt-2.5 size-2 shrink-0 rounded-full bg-primary"
            aria-label="Unread"
          />
        ) : (
          <span className="mt-2.5 size-2 shrink-0" aria-hidden />
        )}
        <NotificationActionsMenu
          item={item}
          onRead={onRead}
          onDismiss={onDismiss}
        />
      </div>
    </article>
  )
}

function NotificationsChrome({ onClose }: { onClose: () => void }) {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
  } = useShell()
  const [filter, setFilter] = useState<NotificationFilter>('all')

  const visible =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications
  const groups = groupNotifications(visible)

  return (
    <div
      data-name="Notifications"
      className="flex h-full min-h-0 flex-col bg-background text-foreground"
    >
      <header className="flex h-14 shrink-0 items-center gap-1 border-b border-border px-2">
        <button
          type="button"
          aria-label="Back"
          onClick={onClose}
          className="inline-flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent"
        >
          <IconChevronLeft className="size-5" strokeWidth={1.75} />
        </button>
        <Typography
          as="h2"
          shape="h4"
          weight="semibold"
          className="min-w-0 flex-1 text-center text-lg"
        >
          Notifications
        </Typography>
        <button
          type="button"
          aria-label="Mark all read"
          title="Mark all read"
          onClick={markAllNotificationsRead}
          className="inline-flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent"
        >
          <IconSettings className="size-5" strokeWidth={1.75} />
        </button>
      </header>

      <div className="shrink-0 px-4 py-2">
        <ScopePillTrack
          filter={filter}
          unreadCount={unreadNotificationCount}
          onChange={setFilter}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <p className="text-sm font-medium text-foreground">No notifications yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Claims, deposits, and offers will show up here.
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.id} className="pt-4">
              <h3 className="px-4 pb-2 text-lg font-semibold leading-snug text-muted-foreground">
                {group.label}
              </h3>
              <div className="flex flex-col">
                {group.items.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    onRead={markNotificationRead}
                    onDismiss={dismissNotification}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  )
}

function DesktopNotifications({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeBackdrop = useBackdropClose(open, onClose)
  return (
    <div
      data-notifications-root="desktop"
      data-open={open ? 'true' : 'false'}
      className={cn(
        'pointer-events-none fixed bottom-0 left-0 right-0 top-[68px] z-40 hidden lg:block',
        open && 'pointer-events-auto',
      )}
      aria-hidden={!open}
      {...(!open ? ({ inert: '' } as unknown as React.HTMLAttributes<HTMLDivElement>) : {})}
    >
      <button
        type="button"
        aria-label="Close notifications"
        data-notifications-backdrop=""
        data-state={open ? 'open' : 'closed'}
        onClick={closeBackdrop}
        className="absolute inset-0 border-0 bg-black/60"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        data-name="Notifications panel"
        data-brand="betonline"
        data-state={open ? 'open' : 'closed'}
        className="dark absolute inset-y-0 right-0 flex w-[359px] max-w-[359px] flex-col overflow-hidden border-l border-border bg-background text-foreground shadow-lg"
      >
        <NotificationsChrome onClose={onClose} />
      </aside>
    </div>
  )
}

function MobileNotifications({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { sheetRef, offset, dragging, bind } = useDragToClose(open, onClose)
  const closeBackdrop = useBackdropClose(open, onClose)
  const backdrop = open ? Math.max(0, 1 - offset / 320) : 0

  return (
    <div
      data-notifications-root="mobile"
      data-open={open ? 'true' : 'false'}
      className={cn(
        'pointer-events-none fixed inset-0 z-[200] lg:hidden',
        open && 'pointer-events-auto',
      )}
      aria-hidden={!open}
      {...(!open ? ({ inert: '' } as unknown as React.HTMLAttributes<HTMLDivElement>) : {})}
    >
      <button
        type="button"
        aria-label="Close notifications"
        data-notifications-backdrop=""
        data-state={open ? 'open' : 'closed'}
        onClick={closeBackdrop}
        className="absolute inset-0 border-0 bg-black/60"
        style={dragging ? { opacity: backdrop, transition: 'none' } : undefined}
      />
      <aside
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        data-name="Notifications panel"
        data-brand="betonline"
        data-state={open ? 'open' : 'closed'}
        data-dragging={dragging ? 'true' : undefined}
        {...bind}
        className="dark absolute inset-x-0 bottom-0 flex max-h-[calc(100svh-72px)] flex-col overflow-hidden rounded-t-[10px] bg-background text-foreground shadow-[0_0_16px_rgba(0,0,0,0.06)]"
        style={offset > 0 ? { transform: `translateY(${offset}px)`, transition: 'none' } : undefined}
      >
        <div
          data-drag-handle=""
          className="flex w-full shrink-0 cursor-grab touch-none items-center justify-center px-4 pb-1 pt-2 active:cursor-grabbing"
          aria-label="Drag down to close"
        >
          <span className="h-1 w-10 rounded-full bg-muted-foreground/40" />
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <NotificationsChrome onClose={onClose} />
        </div>
      </aside>
    </div>
  )
}

/** Inbox — toast history. Figma Inbox_Web-Notification 3841:67147. */
export function NotificationsSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
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
      <DesktopNotifications open={shown} onClose={onClose} />
      <MobileNotifications open={shown} onClose={onClose} />
    </>,
    document.body,
  )
}
