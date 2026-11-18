'use client'

import { LumenGalleryApp } from '@/components/lumen/lumen-gallery/lumen-gallery-app'
import { DailySpinModal } from '@/components/lumen/daily-spin-modal'
import { AuthModal } from '@/components/site/auth-modal'
import { CashierSheet } from '@/components/site/cashier-sheet'
import { ChurnRescueModal } from '@/components/site/churn-rescue-modal'
import { NotificationsSheet } from '@/components/site/notifications-sheet'
import { useShell } from '@/components/site/shell-context'
import { UbcSheet } from '@/components/site/shell-ubc'
import { VipHubSheet } from '@/components/site/vip-hub-sheet'

/**
 * Lumen codebase — extract library for what’s live on the demo site.
 * Hosts real sheets/modals so “Sheets & drawers” stories can open them.
 */
function LumenGalleryHosts() {
  const {
    cashierOpen,
    setCashierOpen,
    drawerOpen,
    setDrawerOpen,
    vipHubOpen,
    setVipHubOpen,
    notificationsOpen,
    setNotificationsOpen,
    dailySpinOpen,
    closeDailySpin,
    resolveDailySpin,
  } = useShell()

  return (
    <>
      <AuthModal />
      <CashierSheet open={cashierOpen} onClose={() => setCashierOpen(false)} />
      <UbcSheet open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <VipHubSheet open={vipHubOpen} onClose={() => setVipHubOpen(false)} />
      <NotificationsSheet
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
      <ChurnRescueModal />
      <DailySpinModal
        open={dailySpinOpen}
        onClose={closeDailySpin}
        onResult={resolveDailySpin}
      />
    </>
  )
}

export default function LumenGalleryPage() {
  return (
    <>
      <LumenGalleryApp />
      <LumenGalleryHosts />
    </>
  )
}
