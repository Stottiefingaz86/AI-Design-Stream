import { formatClaimAmount } from '@/lib/lumen/vip-hub'

/** Toast snapshot — keep loose so shell can map without circular imports. */
export type ToastNotificationSource = {
  id: number
  amount: number
  kind?: 'vip-claim' | 'deposit' | 'deposit-polling' | 'rakeback' | 'low-balance'
  freeSpins?: number
}

export type NotificationIcon =
  | 'sports'
  | 'casino'
  | 'vip'
  | 'deposit'
  | 'claim'
  | 'rakeback'
  | 'alert'
  | 'promo'

export type InboxNotification = {
  id: string
  title: string
  body: string
  /** Bold fragments in body — optional emphasis tokens. */
  bodyBold?: string[]
  createdAt: number
  read: boolean
  icon: NotificationIcon
  /** Optional VIP progress card under the row. */
  progress?: { label: string; percent: number }
}

export type NotificationFilter = 'all' | 'unread'

export type NotificationGroupId = 'today' | 'yesterday' | 'week' | 'older'

export const NOTIFICATION_GROUP_LABEL: Record<NotificationGroupId, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  week: 'Last 7 Days',
  older: 'Older',
}

function startOfDay(ts: number) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function notificationGroup(createdAt: number, now = Date.now()): NotificationGroupId {
  const today = startOfDay(now)
  const day = startOfDay(createdAt)
  if (day === today) return 'today'
  if (day === today - 86_400_000) return 'yesterday'
  if (day > today - 7 * 86_400_000) return 'week'
  return 'older'
}

export function formatNotificationTime(createdAt: number, now = Date.now()) {
  const diff = Math.max(0, now - createdAt)
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function groupNotifications(items: InboxNotification[], now = Date.now()) {
  const order: NotificationGroupId[] = ['today', 'yesterday', 'week', 'older']
  const buckets: Record<NotificationGroupId, InboxNotification[]> = {
    today: [],
    yesterday: [],
    week: [],
    older: [],
  }
  for (const item of items) {
    buckets[notificationGroup(item.createdAt, now)].push(item)
  }
  return order
    .filter((id) => buckets[id].length > 0)
    .map((id) => ({ id, label: NOTIFICATION_GROUP_LABEL[id], items: buckets[id] }))
}

/** Map a live toast into an inbox row. */
export function notificationFromToast(toast: ToastNotificationSource): InboxNotification | null {
  if (toast.kind === 'deposit-polling') return null

  const id = `toast-${toast.id}`
  const createdAt = toast.id

  if (toast.kind === 'deposit') {
    const body = toast.freeSpins
      ? `${formatClaimAmount(toast.amount)} credited · ${toast.freeSpins} Free Spins ready.`
      : `${formatClaimAmount(toast.amount)} has been credited to your account.`
    return {
      id,
      title: 'Deposit has arrived!',
      body,
      createdAt,
      read: false,
      icon: 'deposit',
    }
  }

  if (toast.kind === 'low-balance') {
    const spins = toast.freeSpins ?? 50
    return {
      id,
      title: 'Balance running low',
      body: `${spins} Free Spins on your next deposit.`,
      createdAt,
      read: false,
      icon: 'alert',
    }
  }

  if (toast.kind === 'rakeback') {
    return {
      id,
      title: 'Casino Rakeback earned!',
      body: `${formatClaimAmount(toast.amount)} has been added to your Casino Rakeback.`,
      createdAt,
      read: false,
      icon: 'rakeback',
    }
  }

  return {
    id,
    title: 'Reward successfully claimed!',
    body: `${formatClaimAmount(toast.amount)} has been credited to your account.`,
    createdAt,
    read: false,
    icon: 'claim',
  }
}

/** Demo seed so the inbox isn’t empty before the first live toast. */
export function seedNotifications(now = Date.now()): InboxNotification[] {
  return [
    {
      id: 'seed-deposit',
      title: 'Deposit has arrived!',
      body: '$100.00 has been credited to your account.',
      createdAt: now - 2 * 60_000,
      read: false,
      icon: 'deposit',
    },
    {
      id: 'seed-claim',
      title: 'Reward successfully claimed!',
      body: '$12.50 has been credited to your account.',
      createdAt: now - 18 * 60_000,
      read: false,
      icon: 'claim',
    },
    {
      id: 'seed-rakeback',
      title: 'Casino Rakeback earned!',
      body: '$3.40 has been added to your Casino Rakeback.',
      createdAt: now - 3 * 60 * 60_000,
      read: true,
      icon: 'rakeback',
    },
    {
      id: 'seed-vip',
      title: 'Almost Platinum I',
      body: 'Keep playing to unlock Platinum I rewards.',
      createdAt: now - 2 * 86_400_000,
      read: true,
      icon: 'vip',
      progress: { label: 'Gold to Platinum I', percent: 45 },
    },
    {
      id: 'seed-low',
      title: 'Balance running low',
      body: '50 Free Spins on your next deposit.',
      createdAt: now - 3 * 86_400_000,
      read: true,
      icon: 'alert',
    },
  ]
}
