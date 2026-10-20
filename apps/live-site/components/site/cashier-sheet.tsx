'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { ShellIcon } from './shell-icons'
import { CashierSheetSkeleton } from './cashier-sheet-skeleton'
import { useDragToClose } from './use-drag-to-close'
import { cn } from '@/lib/utils'

export type CashierTab = 'deposit' | 'withdraw'
export type CashierMethod = 'crypto' | 'card' | 'others'

const ASSET = '/shell/figma/cashier'

const COINS = [
  { id: 'btc', label: 'Bitcoin', ticker: '(BTC)', src: `${ASSET}/btc.svg` },
  { id: 'eth', label: 'Ethereum', ticker: '(ETH)', src: `${ASSET}/eth.svg` },
  { id: 'ltc', label: 'Litecoin', ticker: '(LTC)', src: `${ASSET}/ltc.svg` },
  { id: 'usdc', label: 'USD Coin', ticker: '(USDC)', src: `${ASSET}/usdc.svg` },
  { id: 'usdt', label: 'Tether', ticker: '(USDT)', src: `${ASSET}/usdt.svg` },
  { id: 'xrp', label: 'Ripple', ticker: '(XRP)', src: `${ASSET}/xrp.svg`, overlay: `${ASSET}/xrp-mark.png` },
  { id: 'avax', label: 'Avalanche', ticker: '(AVAX)', src: `${ASSET}/avax.svg` },
  { id: 'ada', label: 'Cardano', ticker: '(ADA)', src: `${ASSET}/ada.svg` },
  { id: 'xlm', label: 'Stellar', ticker: '(XLM)', src: `${ASSET}/xlm.svg` },
  { id: 'doge', label: 'Dogecoin', ticker: '(DOGE)', src: `${ASSET}/doge.svg` },
  { id: 'matic', label: 'Polygon', ticker: '(MATIC)', src: `${ASSET}/matic.svg` },
  { id: 'bch', label: 'Bitcoin Cash', ticker: '(BCH)', src: `${ASSET}/bch.svg` },
  { id: 'shib', label: 'Shiba', ticker: '(SHIB)', src: `${ASSET}/shiba.svg` },
  { id: 'sol', label: 'Solana', ticker: '(SOL)', src: `${ASSET}/sol.svg` },
  { id: 'bnb', label: 'Binance Coin', ticker: '(BNB)', src: `${ASSET}/bnb.svg` },
  { id: 'trx', label: 'Tron', ticker: '(TRX)', src: `${ASSET}/trx.svg` },
  { id: 'trump', label: 'Trump Coin', ticker: '(TRUMP)', src: `${ASSET}/trump.svg` },
  { id: 'scor', label: 'Scor', ticker: '(SCOR)', src: `${ASSET}/scor.svg`, overlay: `${ASSET}/scor-mark.png` },
] as const

const OTHER_METHODS = [
  { id: 'bank-wire', label: 'Bank Wire', src: `${ASSET}/bank-wire.svg` },
  { id: 'echeck', label: 'eCheck', src: `${ASSET}/echeck.svg`, tile: '#ffffff' as const },
  { id: 'moneygram', label: 'MoneyGram', src: `${ASSET}/moneygram.svg` },
  { id: 'money-order', label: 'Money Order', src: `${ASSET}/money-order.svg`, tile: '#ffffff' as const },
  { id: 'wire-transfer', label: 'Wire Transfer', src: `${ASSET}/wire-transfer.png`, tile: '#1e67ae' as const },
  { id: 'qbdirect', label: 'QBdirect', src: `${ASSET}/qbdirect.svg`, tile: '#ffffff' as const },
  { id: 'check-courier', label: 'Check by Courier', src: `${ASSET}/check-courier.png`, tile: '#080066' as const },
  { id: 'astropay', label: 'AstroPay', src: `${ASSET}/astropay.png`, tile: '#000000' as const },
] as const

const AMOUNTS = [25, 50, 100, 500] as const
const CC_FEE = 0.0975

export function CashierSheet({
  open,
  onClose,
  initialTab = 'deposit',
  loading = false,
}: {
  open: boolean
  onClose: () => void
  initialTab?: CashierTab
  loading?: boolean
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

  /* Portal like UBC — escape Product Page + legacy body>div position:relative rules. */
  return createPortal(
    <>
      <DesktopCashier open={shown} onClose={onClose} initialTab={initialTab} loading={loading} />
      <MobileCashier open={shown} onClose={onClose} initialTab={initialTab} loading={loading} />
    </>,
    document.body,
  )
}

function DesktopCashier({
  open,
  onClose,
  initialTab,
  loading,
}: {
  open: boolean
  onClose: () => void
  initialTab: CashierTab
  loading: boolean
}) {
  return (
    <div
      data-cashier-root="desktop"
      className={cn(
        'pointer-events-none fixed bottom-0 left-0 right-0 top-[68px] z-40 hidden lg:block',
        open && 'pointer-events-auto'
      )}
    >
      <button
        type="button"
        aria-label="Close cashier"
        data-cashier-backdrop=""
        data-state={open ? 'open' : 'closed'}
        onClick={onClose}
        className="absolute inset-0 border-0 bg-black/60"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Wallet"
        data-name="Cashier"
        data-state={open ? 'open' : 'closed'}
        className="absolute inset-y-0 right-0 flex w-[384px] max-w-[384px] flex-col overflow-hidden border-l border-border bg-background shadow-lg"
      >
        <CashierPanel
          onClose={onClose}
          showClose
          initialTab={initialTab}
          loading={loading}
          className="min-h-0 flex-1"
        />
      </aside>
    </div>
  )
}

function MobileCashier({
  open,
  onClose,
  initialTab,
  loading,
}: {
  open: boolean
  onClose: () => void
  initialTab: CashierTab
  loading: boolean
}) {
  const { sheetRef, offset, dragging, bind } = useDragToClose(open, onClose)
  const backdrop = open ? Math.max(0, 1 - offset / 320) : 0

  return (
    <div
      data-cashier-root="mobile"
      className={cn(
        'pointer-events-none fixed inset-0 z-[200] lg:hidden',
        open && 'pointer-events-auto'
      )}
    >
      <button
        type="button"
        aria-label="Close cashier"
        data-cashier-backdrop=""
        data-state={open ? 'open' : 'closed'}
        onClick={onClose}
        className="absolute inset-0 border-0 bg-black/60"
        style={dragging ? { opacity: backdrop, transition: 'none' } : undefined}
      />
      <aside
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Wallet"
        data-name="Cashier"
        data-state={open ? 'open' : 'closed'}
        data-dragging={dragging ? 'true' : undefined}
        {...bind}
        className="absolute inset-x-0 bottom-0 flex max-h-[calc(100svh-112px)] flex-col overflow-hidden rounded-t-[14px] bg-background shadow-[0_0_16px_rgba(0,0,0,0.06)]"
        style={offset > 0 ? { transform: `translateY(${offset}px)`, transition: 'none' } : undefined}
      >
        <div
          data-drag-handle=""
          className="flex w-full shrink-0 cursor-grab touch-none items-center justify-center pb-2 pt-1 active:cursor-grabbing"
          aria-label="Drag down to close"
        >
          <span />
        </div>
        <CashierPanel
          onClose={onClose}
          initialTab={initialTab}
          loading={loading}
          className="min-h-0 flex-1"
        />
      </aside>
    </div>
  )
}

export function CashierPanel({
  onClose,
  showClose = false,
  initialTab = 'deposit',
  loading = false,
  className,
}: {
  onClose: () => void
  showClose?: boolean
  initialTab?: CashierTab
  loading?: boolean
  className?: string
}) {
  const [tab, setTab] = useState<CashierTab>('deposit')
  const [method, setMethod] = useState<CashierMethod>('crypto')
  const [coinId, setCoinId] = useState<string | null>(null)
  const [redirectOpen, setRedirectOpen] = useState(initialTab === 'withdraw' && showClose)
  const coin = COINS.find((item) => item.id === coinId) ?? null

  useEffect(() => {
    if (initialTab === 'withdraw' && showClose) setRedirectOpen(true)
  }, [initialTab, showClose])

  if (loading) {
    return <CashierSheetSkeleton className="min-h-0 flex-1" />
  }

  return (
    <div
      data-name="Cashier_content"
      className={cn('flex min-h-0 w-full flex-1 flex-col text-foreground', className)}
    >
      {/* Sticky glass chrome — deposit card frosts underneath as it scrolls. */}
      <div className="shell-scroll min-h-0 flex-1 overflow-x-clip overflow-y-auto overscroll-contain">
        <div
          data-name="Cashier top"
          className={cn(
            'sticky top-0 z-20 mb-3 flex w-full flex-col gap-3 border-b border-border px-3 pb-3',
            'bg-[color-mix(in_srgb,var(--container)_72%,transparent)]',
            'backdrop-blur-[32px] saturate-[1.2]',
            showClose ? 'pt-3' : 'pt-1',
          )}
        >
          {showClose ? (
            <div className="flex shrink-0 items-center gap-1.5 pr-2">
              <button
                type="button"
                onClick={onClose}
                aria-label="Close wallet"
                className="shell-chrome-btn inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors duration-200 ease-in-out hover:bg-muted"
              >
                <ShellIcon name="drawer" tone="token" className="size-4 text-foreground" />
              </button>
              <h2 className="min-w-0 flex-1 text-sm font-medium leading-5 text-foreground">Wallet</h2>
            </div>
          ) : null}

          <div
            data-name="Navigation / Cashier Menu"
            className="flex h-10 w-full shrink-0 overflow-hidden rounded-lg border border-border bg-background/80"
            role="tablist"
            aria-label="Wallet action"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'deposit'}
              onClick={() => {
                setTab('deposit')
                setRedirectOpen(false)
              }}
              className={cn(
                'inline-flex h-full flex-1 items-center justify-center gap-1.5 text-sm font-medium transition-colors duration-200',
                tab === 'deposit'
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-card text-foreground hover:bg-[var(--surface-muted-4)]',
              )}
            >
              <DepositIcon active={tab === 'deposit'} />
              Deposit
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'withdraw'}
              onClick={() => setRedirectOpen(true)}
              className={cn(
                'inline-flex h-full flex-1 items-center justify-center gap-1.5 border-l border-border text-sm font-medium transition-colors duration-200',
                tab === 'withdraw'
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-card text-foreground hover:bg-[var(--surface-muted-4)]',
              )}
            >
              <WithdrawIcon />
              Withdraw
            </button>
          </div>
        </div>

        <div
          data-name="Drawer / Deposit"
          className="mx-3 mb-3 flex min-h-[60%] flex-col gap-6 rounded-[10px] border border-border bg-card px-4 pb-4 pt-5 shadow-[0_0_16px_rgba(0,0,0,0.06)]"
        >
          <div className="flex shrink-0 justify-center">
            <DepositMethodTrack
              active={method}
              onChange={(next) => {
                setMethod(next)
                setCoinId(null)
              }}
            />
          </div>
          <div className="shrink-0">
            {method === 'crypto' && coin ? (
              <CryptoCoinView coin={coin} onOpenPicker={() => setCoinId(null)} />
            ) : null}
            {method === 'crypto' && !coin ? <CryptoHome onSelect={setCoinId} /> : null}
            {method === 'card' ? <CreditCardHome /> : null}
            {method === 'others' ? <OthersHome /> : null}
          </div>
        </div>
      </div>

      {redirectOpen ? (
        <WithdrawRedirectDialog
          onCancel={() => {
            setRedirectOpen(false)
            setTab('deposit')
          }}
        />
      ) : null}
    </div>
  )
}

const DEPOSIT_METHODS = [
  { id: 'crypto' as const, label: 'Crypto' },
  { id: 'card' as const, label: 'Credit Card' },
  { id: 'others' as const, label: 'Others' },
]

/** Figma `tab-menu-solid` — muted track + primary thumb that slides. */
function DepositMethodTrack({
  active,
  onChange,
}: {
  active: CashierMethod
  onChange: (id: CashierMethod) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState({ x: 0, w: 0, ready: false })

  const measure = useCallback(() => {
    const track = trackRef.current
    const btn = track?.querySelector<HTMLElement>('[data-method-pill][data-active="true"]')
    if (!track || !btn) return
    setThumb({ x: btn.offsetLeft, w: btn.offsetWidth, ready: true })
  }, [])

  useLayoutEffect(() => {
    measure()
    const track = trackRef.current
    if (!track) return
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    return () => ro.disconnect()
  }, [active, measure])

  return (
    <div
      ref={trackRef}
      data-name="tab-menu-solid"
      className="relative flex h-12 items-center gap-1 rounded-full bg-[var(--surface-muted-5)] p-0.5"
      role="tablist"
      aria-label="Deposit method"
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute top-0.5 z-0 h-11 rounded-full bg-primary',
          thumb.ready && 'transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        )}
        style={{ left: thumb.x, width: thumb.w, opacity: thumb.ready ? 1 : 0 }}
      />
      {DEPOSIT_METHODS.map((item) => {
        const on = item.id === active
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={on}
            data-method-pill=""
            data-active={on ? 'true' : 'false'}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative z-10 h-11 shrink-0 rounded-full px-3 text-sm leading-5 transition-colors duration-200',
              on
                ? 'text-primary-foreground'
                : 'text-foreground hover:bg-[var(--surface-muted-4)]',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

function CryptoHome({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {COINS.map((coin) => {
          return (
            <button
              key={coin.id}
              type="button"
              onClick={() => onSelect(coin.id)}
              className="flex h-[100px] flex-col items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary p-2 text-center transition-[border-color,background-color] duration-200 hover:border-foreground/20 hover:bg-[var(--surface-muted-4)]"
            >
              <span className="relative flex size-7 shrink-0 items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coin.src} alt="" width={28} height={28} className="max-w-none" />
                {'overlay' in coin && coin.overlay ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coin.overlay}
                    alt=""
                    className="pointer-events-none absolute inset-[22%] size-[56%] max-w-none object-contain"
                  />
                ) : null}
              </span>
              <span className="flex w-full flex-col gap-0.5 text-xs text-secondary-foreground">
                <span className="font-medium leading-4">{coin.label}</span>
                <span className="font-normal leading-4">{coin.ticker}</span>
              </span>
            </button>
          )
        })}
      </div>
      <a
        href="https://www.betonline.ag/crypto-tutorial"
        target="_blank"
        rel="noreferrer"
        className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-2 text-center text-xs leading-4 text-card-foreground transition-colors duration-200 hover:bg-[var(--surface-muted-4)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${ASSET}/tutorial.svg`} alt="" width={18} height={18} className="max-w-none" />
        <span>
          New to Crypto? <span className="text-info">Get Started Here</span>
        </span>
      </a>
    </div>
  )
}

type CashierCoin = (typeof COINS)[number]

async function writeClipboard(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.left = '-9999px'
  document.body.appendChild(area)
  area.select()
  document.execCommand('copy')
  document.body.removeChild(area)
}

/** Figma 7162:121387 — BTC selected: QR, address + copy tooltip, note, converter. */
function CryptoCoinView({ coin, onOpenPicker }: { coin: CashierCoin; onOpenPicker: () => void }) {
  const [copied, setCopied] = useState(false)
  const [usd, setUsd] = useState('')
  const address = DEPOSIT_ADDRESS[coin.id] ?? DEPOSIT_ADDRESS.btc
  const network = COIN_NETWORK[coin.id] ?? `${coin.label} ${coin.ticker}`
  const qrSrc = coin.id === 'btc' ? `${ASSET}/btc-qr.svg` : null

  const copyAddress = async () => {
    try {
      await writeClipboard(address)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 3000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full flex-col gap-5">
        <label className="flex w-full flex-col gap-1.5">
          <span className="px-0.5 text-sm font-medium leading-5 text-foreground">Select Crypto</span>
          <button
            type="button"
            onClick={onOpenPicker}
            className="flex h-11 items-center gap-2 rounded-lg border border-input bg-card px-3 text-left transition-colors hover:bg-[var(--surface-muted-4)]"
          >
            <CoinMark coin={coin} size={20} />
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">
              {coin.label} {coin.ticker}
            </span>
            <ShellIcon name="caretDown" tone="surface" className="size-4 opacity-70" />
          </button>
        </label>

        {/* Figma 7162:121387 — inset uses secondary (soft wash), not muted. */}
        <div className="flex w-full flex-col gap-4 rounded-lg border border-border bg-secondary p-4">
          <div className="flex w-full flex-col items-center">
            <div className="relative flex size-[150px] items-center justify-center overflow-hidden rounded-lg border border-border bg-card p-3">
              {qrSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrSrc} alt="" width={126} height={126} className="size-[126px] max-w-none" />
              ) : (
                <span className="relative size-[126px]">
                  <QrMark />
                </span>
              )}
              <span className="absolute left-1/2 top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card">
                <CoinMark coin={coin} size={28} />
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-1">
            <p className="text-[10px] font-semibold leading-[14px] text-muted-foreground">
              DEPOSIT ADDRESS
            </p>
            <div className="flex w-full items-center gap-5">
              <p className="min-w-0 flex-1 break-all text-sm leading-5 text-secondary-foreground">
                {address}
              </p>
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={copyAddress}
                  aria-label={copied ? 'Copied' : 'Copy deposit address'}
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-secondary p-2.5 text-foreground transition-colors hover:bg-[var(--surface-muted-4)]"
                >
                  {copied ? <CopyCheckIcon /> : <CopyIcon />}
                </button>
                {copied ? (
                  <span
                    role="status"
                    className="absolute bottom-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium leading-4 text-background"
                  >
                    Copied!
                    <span
                      aria-hidden
                      className="absolute left-1/2 top-full size-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-foreground"
                    />
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-border" />

          <div className="flex w-full flex-col gap-1.5">
            <span className="inline-flex h-5 w-fit items-center justify-center gap-0.5 rounded-full border border-border bg-secondary px-1.5 text-xs font-medium leading-4 text-secondary-foreground">
              <ImportantIcon />
              Important
            </span>
            <p className="text-xs leading-4 text-secondary-foreground">
              Send only <span className="font-medium">{coin.label} {coin.ticker}</span> on the{' '}
              <span className="font-medium">{network}</span> network.
            </p>
          </div>

          <p className="flex w-full items-center gap-0.5 text-xs leading-4 text-secondary-foreground">
            <span>Min. Deposit:</span>
            <span className="font-medium">$10 USD</span>
          </p>

          <div className="h-px w-full bg-border" />

          <div className="flex w-full items-center justify-center gap-2">
            <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${ASSET}/cashier-dollar.svg`}
                alt=""
                width={16}
                height={16}
                className="size-4 shrink-0"
              />
              <input
                inputMode="decimal"
                value={usd}
                onChange={(event) => setUsd(event.target.value)}
                placeholder="0.00"
                aria-label="USD amount"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </label>
            <span className="shrink-0 text-sm text-muted-foreground">=</span>
            <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3">
              <CoinMark coin={coin} size={16} />
              <input
                readOnly
                value={usdToCoin(usd)}
                aria-label={`${coin.label} amount`}
                className="w-full bg-transparent text-sm text-muted-foreground outline-none"
              />
            </label>
          </div>
        </div>
      </div>

      <a
        href="https://www.betonline.ag/crypto-tutorial"
        target="_blank"
        rel="noreferrer"
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-2 text-center text-xs leading-4 text-card-foreground transition-colors duration-200 hover:bg-[var(--surface-muted-4)]"
      >
        <CoinMark coin={coin} size={18} />
        <span>
          New to {coin.label} {coin.ticker}? <span className="text-info">Get Started Here</span>
        </span>
      </a>
    </div>
  )
}

function CoinMark({ coin, size }: { coin: CashierCoin; size: number }) {
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={coin.src} alt="" width={size} height={size} className="max-w-none" />
      {'overlay' in coin && coin.overlay ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coin.overlay}
          alt=""
          className="pointer-events-none absolute inset-[22%] size-[56%] max-w-none object-contain"
        />
      ) : null}
    </span>
  )
}

function QrMark() {
  return (
    <svg viewBox="0 0 21 21" className="size-full text-foreground" aria-hidden>
      {Array.from({ length: 21 }, (_, y) =>
        Array.from({ length: 21 }, (_, x) => {
          const on = (x * 7 + y * 3 + (x % 3) * y) % 5 < 2
          const finder =
            (x < 5 && y < 5) || (x > 15 && y < 5) || (x < 5 && y > 15)
          if (!on && !finder) return null
          return <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
        }),
      )}
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="size-4">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeOpacity="0.7" />
      <path
        d="M10.5 5.5V3.5A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9A1.5 1.5 0 0 0 3.5 10.5H5.5"
        stroke="currentColor"
        strokeOpacity="0.7"
      />
    </svg>
  )
}

function CopyCheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="size-4">
      <path
        d="M14.53 4.615 6.53 12.615a1 1 0 0 1-1.414 0L1.968 9.115a1 1 0 1 1 1.414-1.414L5.999 11.02l7.47-7.468a1 1 0 0 1 1.414 1.414Z"
        fill="currentColor"
        fillOpacity="0.7"
      />
    </svg>
  )
}

function ImportantIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className="size-3">
      <path
        d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1Zm-.385 2.692a.385.385 0 0 1 .77 0v2.693a.385.385 0 0 1-.77 0V3.692ZM6 8.692a.577.577 0 1 1 0-1.154.577.577 0 0 1 0 1.154Z"
        fill="currentColor"
      />
    </svg>
  )
}

function usdToCoin(usd: string) {
  const value = Number(usd)
  if (!usd || Number.isNaN(value)) return '0.00'
  return (value / 64000).toFixed(6).replace(/0+$/, '').replace(/\.$/, '')
}

const DEPOSIT_ADDRESS: Record<string, string> = {
  btc: '0x3c690f9497afbe256a4fa94e0f863d191e1531497afbe256aa94e0fDFG691a1',
}

const COIN_NETWORK: Record<string, string> = {
  btc: 'Binance Smart Chain (BEP20)',
  eth: 'Ethereum (ERC20)',
  ltc: 'Litecoin',
  usdc: 'Ethereum (ERC20)',
  usdt: 'Ethereum (ERC20)',
  xrp: 'XRP Ledger',
  avax: 'Avalanche C-Chain',
  ada: 'Cardano',
  xlm: 'Stellar',
  doge: 'Dogecoin',
  matic: 'Polygon',
  bch: 'Bitcoin Cash',
  shib: 'Ethereum (ERC20)',
  sol: 'Solana',
  bnb: 'BNB Smart Chain (BEP20)',
  trx: 'Tron (TRC20)',
  trump: 'Solana',
  scor: 'Ethereum (ERC20)',
}

function parseDepositAmount(raw: string) {
  const cleaned = raw.replace(/[^0-9.]/g, '')
  const parts = cleaned.split('.')
  const whole = (parts[0] ?? '').slice(0, 3)
  const frac = parts.slice(1).join('').slice(0, 2)
  const next = parts.length > 1 ? `${whole}.${frac}` : whole
  const value = Number(next)
  if (!next || Number.isNaN(value)) return { text: next, value: 0 }
  if (value > 500) return { text: '500', value: 500 }
  return { text: next, value }
}

function CreditCardHome() {
  const [amountText, setAmountText] = useState('')
  const [focused, setFocused] = useState(false)
  const amount = amountText ? Number(amountText) || 0 : 0
  const total = amount * (1 + CC_FEE)
  const display = focused ? amountText : amount ? amount.toFixed(2) : ''

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium leading-5 text-foreground">Select Credit Card</span>
          <span className="relative flex h-11 items-center gap-2 rounded-lg border border-input pl-6 pr-3">
            <span className="absolute left-3 top-1/2 flex h-[22px] w-[29px] -translate-y-1/2 items-center justify-center rounded-[4px] border border-border bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${ASSET}/mastercard.svg`} alt="" width={16} height={12} className="max-w-none" />
            </span>
            <span className="flex-1 truncate pl-6 text-sm text-foreground">Mastercard **** 0740</span>
            <ShellIcon name="caretDown" tone="surface" className="size-4 opacity-70" />
          </span>
        </label>

        <div className="flex flex-col items-center">
          <div className="flex h-10 w-full gap-3">
            {AMOUNTS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmountText(String(value))}
                className={cn(
                  'h-10 flex-1 rounded-lg border text-sm font-medium transition-colors duration-200',
                  amount === value
                    ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border-border bg-secondary text-secondary-foreground hover:border-foreground/20 hover:bg-[var(--surface-muted-4)]',
                )}
              >
                ${value}
              </button>
            ))}
          </div>
          <div className="flex w-full flex-col items-center py-12">
            <label
              className={cn(
                'flex items-center justify-center text-[36px] font-semibold leading-10',
                amount || focused ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              <span aria-hidden>$</span>
              <input
                inputMode="decimal"
                enterKeyHint="done"
                value={display}
                placeholder="0.00"
                aria-label="Deposit amount"
                onFocus={() => setFocused(true)}
                onBlur={() => {
                  setFocused(false)
                  if (amountText) {
                    const n = Number(amountText)
                    if (!Number.isNaN(n) && n > 0) setAmountText(n.toFixed(2))
                  }
                }}
                onChange={(event) => {
                  const parsed = parseDepositAmount(event.target.value)
                  setAmountText(parsed.text)
                }}
                style={{ width: `${Math.max((display || '0.00').length, 4)}ch` }}
                className="bg-transparent text-center outline-none placeholder:text-muted-foreground"
              />
            </label>
            <p className="mt-1.5 text-center text-xs leading-4 text-muted-foreground opacity-80">
              Min. $25 / Max. $500
            </p>
          </div>
          <div className="flex w-full items-center justify-center rounded-lg border border-border bg-secondary px-4 py-2">
            <div className="flex w-[286px] items-center justify-center gap-9">
              <div className="w-[100px] text-center">
                <p className="text-[10px] font-semibold leading-[14px] text-muted-foreground">FEE</p>
                <p className="text-xs font-medium leading-4 text-secondary-foreground">9.75%</p>
              </div>
              <span className="h-8 w-px bg-border" />
              <div className="w-[100px] text-center">
                <p className="text-[10px] font-semibold leading-[14px] text-muted-foreground">TOTAL AMOUNT</p>
                <p className="text-xs font-medium leading-4 text-secondary-foreground">
                  ${total.toFixed(2)} USD
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Button type="button" size="lg" disabled={amount < 25 || amount > 500} className="h-10 w-full rounded-lg text-sm font-medium">
        Deposit
      </Button>
    </div>
  )
}

function OthersHome() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-2 gap-2">
      {OTHER_METHODS.map((item) => {
        const active = selected === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(item.id)}
            className={cn(
              'flex h-[100px] flex-col items-center justify-center gap-2.5 rounded-lg border bg-secondary p-2 transition-[border-color,background-color,box-shadow] duration-200',
              active
                ? 'border-primary shadow-[0_0_0_1px_var(--primary)]'
                : 'border-border hover:border-foreground/20 hover:bg-[var(--surface-muted-4)]',
            )}
          >
            {'tile' in item && item.tile ? (
              <span
                className="flex h-9 w-12 items-center justify-center overflow-hidden rounded-[4px] border border-border"
                style={{ background: item.tile }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.src} alt="" className="h-full w-full object-cover" />
              </span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.src} alt="" width={48} height={36} className="max-w-none" />
            )}
            <span className="w-full text-center text-xs font-medium leading-4 text-secondary-foreground">
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function WithdrawRedirectDialog({ onCancel }: { onCancel: () => void }) {
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  if (!ready) return null

  return createPortal(
    <div
      data-cashier-redirect=""
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-6"
    >
      <div
        role="alertdialog"
        aria-labelledby="cashier-redirect-title"
        aria-describedby="cashier-redirect-body"
        className="flex w-full max-w-[500px] flex-col gap-4 rounded-[10px] border border-border bg-popover p-6 shadow-lg"
      >
        <div className="flex flex-col items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ASSET}/redirect.svg`} alt="" width={24} height={24} className="max-w-none" />
          <div className="w-full text-center">
            <h3 id="cashier-redirect-title" className="text-lg font-semibold leading-7 text-foreground">
              Redirecting to Cashier...
            </h3>
            <p id="cashier-redirect-body" className="mt-2 text-sm leading-5 text-muted-foreground">
              You will be redirected to the Cashier section
              <br />
              to view the withdrawal methods.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={onCancel}>
            Ok, Got It
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/** Figma `Icon / cashier-dollar` — filled circle $; inherits button text color. */
function DepositIcon({ active = false }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <path
        d="M8 0C6.41775 0 4.87103 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346628 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C15.9978 5.87895 15.1542 3.84542 13.6544 2.34562C12.1546 0.845814 10.121 0.00223986 8 0ZM8.92308 11.6923H8.61539V12.3077C8.61539 12.4709 8.55055 12.6274 8.43514 12.7428C8.31974 12.8582 8.16321 12.9231 8 12.9231C7.83679 12.9231 7.68027 12.8582 7.56486 12.7428C7.44945 12.6274 7.38462 12.4709 7.38462 12.3077V11.6923H6.15385C5.99064 11.6923 5.83411 11.6275 5.71871 11.5121C5.6033 11.3967 5.53846 11.2401 5.53846 11.0769C5.53846 10.9137 5.6033 10.7572 5.71871 10.6418C5.83411 10.5264 5.99064 10.4615 6.15385 10.4615H8.92308C9.16789 10.4615 9.40268 10.3643 9.57579 10.1912C9.7489 10.0181 9.84616 9.78327 9.84616 9.53846C9.84616 9.29364 9.7489 9.05886 9.57579 8.88575C9.40268 8.71264 9.16789 8.61538 8.92308 8.61538H7.07692C6.50569 8.61538 5.95785 8.38846 5.55393 7.98454C5.15 7.58061 4.92308 7.03277 4.92308 6.46154C4.92308 5.8903 5.15 5.34246 5.55393 4.93854C5.95785 4.53461 6.50569 4.30769 7.07692 4.30769H7.38462V3.69231C7.38462 3.5291 7.44945 3.37257 7.56486 3.25716C7.68027 3.14176 7.83679 3.07692 8 3.07692C8.16321 3.07692 8.31974 3.14176 8.43514 3.25716C8.55055 3.37257 8.61539 3.5291 8.61539 3.69231V4.30769H9.84616C10.0094 4.30769 10.1659 4.37253 10.2813 4.48793C10.3967 4.60334 10.4615 4.75987 10.4615 4.92308C10.4615 5.08629 10.3967 5.24281 10.2813 5.35822C10.1659 5.47363 10.0094 5.53846 9.84616 5.53846H7.07692C6.83211 5.53846 6.59732 5.63571 6.42421 5.80882C6.2511 5.98193 6.15385 6.21672 6.15385 6.46154C6.15385 6.70635 6.2511 6.94114 6.42421 7.11425C6.59732 7.28736 6.83211 7.38461 7.07692 7.38461H8.92308C9.49431 7.38461 10.0422 7.61154 10.4461 8.01546C10.85 8.41938 11.0769 8.96722 11.0769 9.53846C11.0769 10.1097 10.85 10.6575 10.4461 11.0615C10.0422 11.4654 9.49431 11.6923 8.92308 11.6923Z"
        fill="currentColor"
        opacity={active ? 1 : 0.9}
      />
    </svg>
  )
}

function WithdrawIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <path d="M8 12.5V3.5M8 3.5 4.5 7M8 3.5 11.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
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
