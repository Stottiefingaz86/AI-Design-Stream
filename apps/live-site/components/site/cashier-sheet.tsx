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
      {/* Fixed chrome — never scrolls away (Instagram-style sheet header). */}
      <div
        data-name="Cashier top"
        className="flex w-full shrink-0 flex-col gap-3 border-b border-border bg-[var(--container)] px-3 pb-3 pt-1"
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

      <div className="shell-scroll min-h-0 flex-1 overflow-x-clip overflow-y-auto overscroll-contain">
        <div
          data-name="Drawer / Deposit"
          className="mx-3 mb-3 mt-3 flex min-h-full flex-col gap-6 rounded-[10px] border border-border bg-card px-4 pb-4 pt-5 shadow-[0_0_16px_rgba(0,0,0,0.06)]"
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

/** Figma 7162:119086 — coin selected: address, QR, network note, converter. */
function CryptoCoinView({ coin, onOpenPicker }: { coin: CashierCoin; onOpenPicker: () => void }) {
  const [copied, setCopied] = useState(false)
  const [usd, setUsd] = useState('')
  const address = DEPOSIT_ADDRESS[coin.id] ?? DEPOSIT_ADDRESS.btc
  const network = COIN_NETWORK[coin.id] ?? `${coin.label} ${coin.ticker}`

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5">
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

      <div className="flex flex-col items-center gap-4">
        <div className="relative flex size-[126px] items-center justify-center rounded-md border border-border bg-white p-2">
          <QrMark />
          <span className="absolute flex size-8 items-center justify-center rounded-full bg-white">
            <CoinMark coin={coin} size={28} />
          </span>
        </div>

        <div className="flex w-full flex-col gap-1">
          <p className="text-[10px] font-semibold leading-[14px] tracking-wide text-muted-foreground">
            DEPOSIT ADDRESS
          </p>
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 break-all text-xs leading-4 text-foreground">{address}</p>
            <button
              type="button"
              onClick={copyAddress}
              aria-label={copied ? 'Copied' : 'Copy deposit address'}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground transition-colors hover:bg-[var(--surface-muted-4)]"
            >
              <CopyIcon />
            </button>
          </div>
          {copied ? <p className="text-xs text-info">Copied</p> : null}
        </div>

        <p className="w-full text-xs leading-4 text-foreground">
          <span className="mr-1.5 inline-flex rounded bg-foreground px-1.5 py-0.5 text-[10px] font-semibold leading-[14px] text-background">
            Important
          </span>
          Send only {coin.label} {coin.ticker} on the {network} network.
        </p>
        <p className="w-full text-xs leading-4 text-muted-foreground">Min. Deposit: $10 USD</p>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3">
          <span className="text-sm text-foreground">$</span>
          <input
            inputMode="decimal"
            value={usd}
            onChange={(event) => setUsd(event.target.value)}
            placeholder="0.00"
            aria-label="USD amount"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
        <span className="text-sm text-muted-foreground">=</span>
        <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3">
          <CoinMark coin={coin} size={16} />
          <input
            readOnly
            value={usdToCoin(usd)}
            aria-label={`${coin.label} amount`}
            className="w-full bg-transparent text-sm text-foreground outline-none"
          />
        </label>
      </div>

      <a
        href="https://www.betonline.ag/crypto-tutorial"
        target="_blank"
        rel="noreferrer"
        className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-2 text-center text-xs leading-4 text-card-foreground transition-colors duration-200 hover:bg-[var(--surface-muted-4)]"
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
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" />
      <path d="M10.5 5.5V3.5A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9A1.5 1.5 0 0 0 3.5 10.5H5.5" stroke="currentColor" />
    </svg>
  )
}

function usdToCoin(usd: string) {
  const value = Number(usd)
  if (!usd || Number.isNaN(value)) return '0.00'
  return (value / 64000).toFixed(6).replace(/0+$/, '').replace(/\.$/, '')
}

const DEPOSIT_ADDRESS: Record<string, string> = {
  btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
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

function CreditCardHome() {
  const [amount, setAmount] = useState(0)
  const total = amount * (1 + CC_FEE)

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
                onClick={() => setAmount(value)}
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
            <p
              className={cn(
                'text-center text-[36px] font-semibold leading-10',
                amount ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              ${amount.toFixed(2)}
            </p>
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
      <Button type="button" size="lg" disabled={amount < 25} className="h-10 w-full rounded-lg text-sm font-medium">
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

function DepositIcon({ active = false }: { active?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      {active ? (
        <>
          <circle cx="8" cy="8" r="7" fill="currentColor" />
          <path
            d="M8 4.25v7.5M6.2 6c.4-.65 1.05-1 1.8-1 1.05 0 1.85.6 1.85 1.5 0 2-3.65 1.15-3.65 3.15 0 .9.85 1.55 1.85 1.55.75 0 1.4-.35 1.8-.9"
            stroke="var(--primary)"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M8 4.4v7.2M6.3 6.15c.4-.6 1-.9 1.7-.9 1 0 1.75.55 1.75 1.4 0 1.9-3.5 1.1-3.5 3 0 .85.8 1.45 1.75 1.45.7 0 1.3-.3 1.7-.85"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
        </>
      )}
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
