'use client'

import { useEffect, useState } from 'react'
import {
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheckFilled,
  IconCoins,
  IconTicket,
} from '@tabler/icons-react'
import { PromoCountdown } from '@/components/lumen/promo-countdown'
import { PROMO_HERO_CTA, PromoPageHero } from '@/components/lumen/promo-page-hero'
import { useShell } from '@/components/site/shell-context'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/components/ui/sonner'
import { Typography } from '@/components/ui/typography'
import { formatUsd } from '@/lib/lumen/challenges'
import { RAFFLE, RAFFLE_DRAWS, RAFFLE_STEPS, ticketNumber } from '@/lib/lumen/raffles'
import { cn } from '@/lib/utils'

const CARD = 'rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]'
const ROW_HOVER = 'hover:!bg-surface-muted-3'
const FREE_TICKET_KEY = `lumen-raffle-free-ticket-${RAFFLE.drawNumber}`
/** Demo: tickets already earned from wagering this week. */
const EARNED_TICKETS = 2

const STEP_ICON = {
  free: IconTicket,
  earn: IconCoins,
  draw: IconCalendarEvent,
} as const

/** V2 Promotions · Weekly Raffle — free ticket, earn more by wagering, weekly draw. */
export function RafflesPage({ className }: { className?: string }) {
  const { loggedIn, openAuth } = useShell()
  const [freeClaimed, setFreeClaimed] = useState(false)

  useEffect(() => {
    setFreeClaimed(window.localStorage.getItem(FREE_TICKET_KEY) === '1')
  }, [])

  const tickets = loggedIn ? EARNED_TICKETS + (freeClaimed ? 1 : 0) : 0

  const claimFreeTicket = () => {
    if (!loggedIn) {
      openAuth('join')
      return
    }
    window.localStorage.setItem(FREE_TICKET_KEY, '1')
    setFreeClaimed(true)
    toast.success(`Ticket ${ticketNumber(EARNED_TICKETS)} added to Draw #${RAFFLE.drawNumber}`)
  }

  return (
    <div data-name="raffles_page" className={cn('w-full bg-background px-6 pb-14 pt-6', className)}>
      <div className="flex flex-col gap-6">
        <RaffleHero claimed={loggedIn && freeClaimed} onClaim={claimFreeTicket} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {RAFFLE_STEPS.map((step) => {
            const Icon = STEP_ICON[step.id]
            return (
              <div key={step.id} className={cn(CARD, 'flex gap-3 p-4')}>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-foreground">
                  <Icon className="size-4" stroke={1.75} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="mt-0.5 text-xs leading-4 text-muted-foreground">{step.body}</p>
                </div>
              </div>
            )
          })}
        </div>

        <YourTickets tickets={tickets} loggedIn={loggedIn} onJoin={() => openAuth('join')} />

        <RaffleResults />
      </div>
    </div>
  )
}

function RaffleHero({ claimed, onClaim }: { claimed: boolean; onClaim: () => void }) {
  return (
    <PromoPageHero
      eyebrow={`Draw #${RAFFLE.drawNumber}`}
      title={`$20K ${RAFFLE.name}`}
      subtitle={`${RAFFLE.winnersPerDraw} winners · $${RAFFLE.prizePerWinnerUsd} each`}
      actions={
        claimed ? (
          <span className="inline-flex items-center gap-1.5 text-[15px] font-medium text-white/95">
            <IconCircleCheckFilled className="size-5" aria-hidden />
            Free ticket claimed · {ticketNumber(EARNED_TICKETS)}
          </span>
        ) : (
          <Button type="button" className={PROMO_HERO_CTA} onClick={onClaim}>
            <IconTicket className="size-4" stroke={2} aria-hidden />
            Claim free ticket
          </Button>
        )
      }
    >
      <PromoCountdown
        seconds={RAFFLE.drawsInSeconds}
        label="Draw in"
        onPrimary
        className="items-start md:items-end"
      />
    </PromoPageHero>
  )
}

function YourTickets({
  tickets,
  loggedIn,
  onJoin,
}: {
  tickets: number
  loggedIn: boolean
  onJoin: () => void
}) {
  const progress = Math.round((RAFFLE.wageredTowardNextUsd / RAFFLE.wagerPerTicketUsd) * 100)

  return (
    <section className={cn(CARD, 'flex flex-col gap-4 p-4 md:p-6')} data-name="raffle-your-tickets">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Typography as="h2" shape="h4" weight="semibold" className="text-base">
            Your Tickets
          </Typography>
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-primary px-1.5 text-xs font-semibold tabular-nums text-primary-foreground">
            {tickets}
          </span>
        </div>
        {loggedIn ? (
          <div className="flex w-full max-w-xs flex-col gap-1.5 sm:w-64">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Next ticket</span>
              <span className="tabular-nums">
                <span className="font-medium text-foreground">${RAFFLE.wageredTowardNextUsd}</span>{' '}
                / ${RAFFLE.wagerPerTicketUsd} wagered
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        ) : null}
      </div>

      {loggedIn ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: RAFFLE.ticketSlots }, (_, i) => (
            <li key={i}>
              <TicketStub number={i < tickets ? ticketNumber(i) : null} next={i === tickets} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-secondary/40 py-10 text-center">
          <IconTicket className="size-6 text-muted-foreground" stroke={1.5} aria-hidden />
          <p className="text-sm text-muted-foreground">Join to get your free ticket.</p>
          <Button type="button" size="sm" onClick={onJoin}>
            Join
          </Button>
        </div>
      )}
    </section>
  )
}

/** Admit-one ticket: stub + body split by a dashed perforation with half-moon notches. */
function TicketStub({ number, next = false }: { number: string | null; next?: boolean }) {
  const edge = number ? 'border-primary/40' : 'border-border'
  const notch = cn('absolute left-11 size-3.5 -translate-x-1/2 rounded-full border bg-card', edge)

  return (
    <div
      className={cn(
        'relative flex h-16 overflow-hidden rounded-lg border',
        edge,
        number ? 'bg-primary/15' : 'bg-secondary/60',
      )}
      aria-label={number ? `Ticket ${number}` : 'Empty ticket slot'}
    >
      <span
        className={cn(
          'flex w-11 shrink-0 items-center justify-center',
          number ? 'text-primary' : 'text-muted-foreground/40',
        )}
      >
        <IconTicket className="size-5 -rotate-45" stroke={1.75} aria-hidden />
      </span>
      <span aria-hidden className={cn('my-2 border-l-2 border-dashed', edge)} />
      <span className="flex min-w-0 flex-1 flex-col justify-center px-3">
        {number ? (
          <>
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Draw #{RAFFLE.drawNumber}
            </span>
            <span className="truncate text-sm font-semibold tabular-nums text-foreground">
              {number}
            </span>
          </>
        ) : next ? (
          <span className="text-xs text-muted-foreground">Next ticket</span>
        ) : null}
      </span>
      <span aria-hidden className={cn(notch, '-top-[7px]')} />
      <span aria-hidden className={cn(notch, '-bottom-[7px]')} />
    </div>
  )
}

function RaffleResults() {
  const [index, setIndex] = useState(0)
  const draw = RAFFLE_DRAWS[index]!

  return (
    <section className={cn(CARD, 'flex flex-col overflow-hidden')} data-name="raffle-results">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5">
        <Typography as="h2" shape="h4" weight="semibold" className="text-base">
          Results
        </Typography>
        <div className="flex items-center gap-0.5 text-sm text-muted-foreground">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Older draw"
            disabled={index >= RAFFLE_DRAWS.length - 1}
            onClick={() => setIndex((i) => i + 1)}
          >
            <IconChevronLeft className="size-4" stroke={2} />
          </Button>
          <div className="min-w-[7.5rem] text-center">
            <p className="text-xs font-medium text-foreground">Draw #{draw.number}</p>
            <p className="text-[11px] text-muted-foreground">{draw.date}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Newer draw"
            disabled={index <= 0}
            onClick={() => setIndex((i) => i - 1)}
          >
            <IconChevronRight className="size-4" stroke={2} />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b border-border px-4 py-2.5 text-xs font-medium text-muted-foreground">
        <span className="w-20 shrink-0">Ticket</span>
        <span className="min-w-0 flex-1">Player</span>
        <span className="shrink-0 text-right">Prize</span>
      </div>
      <ul>
        {draw.winners.map((w) => (
          <li
            key={w.ticket}
            className={cn(
              'flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0',
              ROW_HOVER,
            )}
          >
            <span className="w-20 shrink-0 text-sm tabular-nums text-muted-foreground">
              {w.ticket}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              {w.player ?? 'Hidden'}
            </span>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
              {formatUsd(w.prizeUsd)}
            </span>
          </li>
        ))}
      </ul>
      <p className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
        Showing 10 of {RAFFLE.winnersPerDraw} winners
      </p>
    </section>
  )
}
