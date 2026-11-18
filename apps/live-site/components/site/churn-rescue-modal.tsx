'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { CasinoGameTile } from '@/components/lumen/casino-game-tile'
import { ORIGINALS_GAMES } from '@/lib/lumen/casino-lobby-catalog'
import {
  LOW_BALANCE_FREE_SPINS,
  useShell,
} from '@/components/site/shell-context'
import { cn } from '@/lib/utils'

/** Same Originals set as the casino lobby / wallpaper. */
const CHURN_GAMES = ORIGINALS_GAMES

/**
 * After 3 demo losses: recommend games + deposit path.
 * Wallpaper grid (not side-scroll). Must use data-churn-rescue-root so legacy
 * body>div CSS cannot unstick `fixed`.
 */
export function ChurnRescueModal() {
  const {
    churnRescueOpen,
    dismissChurnRescue,
    launchGame,
    openDepositFromLowBalance,
    loggedIn,
  } = useShell()
  const [portalReady, setPortalReady] = useState(false)

  useEffect(() => {
    setPortalReady(true)
  }, [])

  if (!portalReady || !churnRescueOpen || !loggedIn) return null

  return createPortal(
    <div data-churn-rescue-root="" className="pointer-events-none">
      <div className="pointer-events-auto fixed inset-0 z-[240] flex items-end justify-center p-3 sm:items-center sm:p-6">
        <button
          type="button"
          aria-label="Dismiss"
          className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
          onClick={dismissChurnRescue}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="churn-rescue-title"
          className={cn(
            'relative z-10 flex max-h-[min(92svh,720px)] w-full max-w-[520px] flex-col',
            'rounded-[14px] border border-border bg-background text-foreground',
            'shadow-[0_24px_80px_rgba(0,0,0,0.55)]',
            'animate-in fade-in-0 zoom-in-95 duration-300',
          )}
        >
          <button
            type="button"
            onClick={dismissChurnRescue}
            aria-label="Close"
            className="absolute right-2.5 top-2.5 z-20 inline-flex size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent"
          >
            <IconX className="size-4" />
          </button>

          <div className="flex min-h-0 flex-1 flex-col pt-9 sm:pt-10">
            <div className="shrink-0 px-5 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Keep playing
              </p>
              <h2
                id="churn-rescue-title"
                className="mt-1.5 text-[22px] font-bold tracking-tight text-foreground"
              >
                Tough run?
              </h2>
              <p className="mt-2 text-sm leading-5 text-muted-foreground">
                Try one of these next, or deposit and get{' '}
                <span className="font-semibold text-foreground">
                  {LOW_BALANCE_FREE_SPINS} Free Spins
                </span>
                .
              </p>
            </div>

            {/* Wallpaper grid — padding inside the scrollport so favorite hover isn’t clipped. */}
            <div
              data-name="churn-wallpaper-grid"
              className="shell-scroll mt-4 min-h-0 flex-1 overflow-y-auto px-4 pb-2 pt-1 sm:px-5"
            >
              <div className="grid grid-cols-3 gap-x-3 gap-y-4 p-1.5">
                {CHURN_GAMES.map((game, index) => (
                  <div
                    key={game.id}
                    className="lm-tile-enter relative aspect-[152/207] w-full min-w-0 overflow-visible"
                    style={{ ['--lm-tile-i' as `--lm-tile-i`]: index }}
                  >
                    <CasinoGameTile
                      game={game}
                      hideTitle
                      className="!h-full !w-full"
                      onLaunch={(g, el) => {
                        dismissChurnRescue()
                        launchGame(g, el)
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-border bg-background px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-2.5">
                <Button
                  type="button"
                  className="h-12 w-full text-sm font-semibold"
                  onClick={openDepositFromLowBalance}
                >
                  Deposit & Get {LOW_BALANCE_FREE_SPINS} Free Spins
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full text-sm font-semibold"
                  onClick={dismissChurnRescue}
                >
                  Maybe later
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
