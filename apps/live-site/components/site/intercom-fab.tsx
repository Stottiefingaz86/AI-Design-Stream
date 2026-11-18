'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconHome,
  IconMessageCircle2,
  IconQuestionMark,
  IconSend,
  IconX,
} from '@tabler/icons-react'
import { useShell } from '@/components/site/shell-context'
import { VIP_SILVER_UNLOCKED_LABELS } from '@/lib/lumen/vip-hub'
import {
  PRODUCT_TOUR_SUGGESTIONS,
  matchProductTour,
  startProductTour,
  type ProductTour,
} from '@/lib/lumen/product-tours'
import {
  SITE_VERSIONS,
  getSiteVersion,
  switchSiteVersion,
  useSiteVersion,
  type SiteVersionId,
} from '@/lib/lumen/site-versions'
import { cn } from '@/lib/utils'

const AGENT_NAME = 'Laura'
const LAURA_TYPING_MS = 700
const TOUR_START_MS = 1100

type ChatMessage = {
  id: number
  from: 'user' | 'laura'
  text: string
  tour?: ProductTour
}

const LAURA_GREETING: ChatMessage = {
  id: 0,
  from: 'laura',
  text: `Hi, I'm ${AGENT_NAME}. Ask me where to find anything.`,
}
const LAURA_FALLBACK = 'Thanks. Someone from the team will reply here shortly.'
function SiteVersionList({ currentId }: { currentId: SiteVersionId }) {
  return (
    <div className="flex flex-col gap-1.5">
      {SITE_VERSIONS.map((v) => {
        const current = v.id === currentId
        return (
          <button
            key={v.id}
            type="button"
            disabled={current}
            aria-current={current ? 'true' : undefined}
            onClick={() => switchSiteVersion(v.id)}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors',
              current ? 'border-primary/40 bg-primary/5' : 'border-zinc-200 hover:bg-zinc-50',
            )}
          >
            <span
              className={cn(
                'inline-flex h-6 min-w-8 shrink-0 items-center justify-center rounded-md px-1.5 text-xs font-semibold',
                current ? 'bg-primary text-primary-foreground' : 'bg-zinc-900 text-white',
              )}
            >
              {v.label}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] font-semibold leading-tight text-zinc-900">
                {v.name}
              </span>
              <span className="truncate text-xs leading-tight text-zinc-500">{v.description}</span>
            </span>
            {current ? (
              <IconCheck className="size-4 shrink-0 text-primary" strokeWidth={2.5} />
            ) : (
              <IconChevronRight className="size-4 shrink-0 text-zinc-400" strokeWidth={2.25} />
            )}
          </button>
        )
      })}
      {SITE_VERSIONS.length === 1 ? (
        <p className="px-1 text-xs text-zinc-400">More versions are on the way.</p>
      ) : null}
    </div>
  )
}

/** Classic Intercom messenger mark — squircle + tip + smile (not a chat-bubble outline). */
function IntercomMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={30}
      height={30}
      className={cn('block shrink-0', className)}
      aria-hidden
    >
      <path
        fill="#fff"
        d="M12 4h24c4.418 0 8 3.582 8 8v16c0 2.761-1.4 5.193-3.52 6.64L44 44 36.8 38.2C35.36 38.72 33.73 39 32 39H12c-4.418 0-8-3.582-8-8V12c0-4.418 3.582-8 8-8Z"
      />
      <path
        d="M15 26.5c2.8 3.1 6.1 4.7 9 4.7s6.2-1.6 9-4.7"
        fill="none"
        stroke="var(--primary, #ee3535)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Intercom-style launcher.
 * - Logged out → fake empty Messages inbox
 * - After signup + wallet close → Laura welcome inbox alert (uses username)
 * - Must use data-welcome-inbox-root so legacy body>div CSS cannot unstick `fixed`
 */
export function IntercomFab() {
  const searchParams = useSearchParams()
  /** Figma handover captures — FAB becomes a full-frame blocker in Dev Mode. */
  const hideForHandover = searchParams.has('handover')
  const {
    intercomOpen,
    setIntercomOpen,
    intercomWelcomePending,
    intercomLevelUpPending,
    intercomVipMatchPending,
    profile,
    authOpen,
    cashierOpen,
    setCashierOpen,
    setVipHubOpen,
    loggedIn,
  } = useShell()
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [inboxTab, setInboxTab] = useState<'home' | 'messages' | 'help'>('messages')
  const [vipMatchDraft, setVipMatchDraft] = useState('')
  const [vipMatchReplies, setVipMatchReplies] = useState<string[]>([])
  const [chatOpen, setChatOpen] = useState(false)
  const [chat, setChat] = useState<ChatMessage[]>([LAURA_GREETING])
  const [chatDraft, setChatDraft] = useState('')
  const [lauraTyping, setLauraTyping] = useState(false)
  const chatTimersRef = useRef<number[]>([])
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)
  const siteVersion = getSiteVersion(useSiteVersion())
  const username = profile.fullName.trim() || 'there'
  /* Laura cards — level-up > welcome > VIP status match. */
  const showLevelUpAlert = loggedIn && intercomLevelUpPending
  const showWelcomeAlert = loggedIn && intercomWelcomePending && !showLevelUpAlert
  const showVipMatchAlert = intercomVipMatchPending && !showLevelUpAlert && !showWelcomeAlert
  const showLauraAlert = showLevelUpAlert || showWelcomeAlert || showVipMatchAlert

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia('(max-width: 1023px)')
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (intercomOpen) setInboxTab('messages')
  }, [intercomOpen])

  useEffect(() => {
    if (!showVipMatchAlert) {
      setVipMatchDraft('')
      setVipMatchReplies([])
    }
  }, [showVipMatchAlert])

  useEffect(() => {
    const timers = chatTimersRef.current
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [])

  useEffect(() => {
    const el = chatScrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [chat, lauraTyping, chatOpen])

  useEffect(() => {
    if (chatOpen && intercomOpen) chatInputRef.current?.focus()
  }, [chatOpen, intercomOpen])

  const sendChat = (raw: string) => {
    const text = raw.trim()
    if (!text || lauraTyping) return
    setChat((prev) => [...prev, { id: prev.length, from: 'user', text }])
    setChatDraft('')
    setLauraTyping(true)
    const tour = matchProductTour(text)
    chatTimersRef.current.push(
      window.setTimeout(() => {
        setLauraTyping(false)
        setChat((prev) => [
          ...prev,
          { id: prev.length, from: 'laura', text: tour?.reply ?? LAURA_FALLBACK, tour: tour ?? undefined },
        ])
        if (!tour) return
        chatTimersRef.current.push(window.setTimeout(() => startProductTour(tour), TOUR_START_MS))
      }, LAURA_TYPING_MS),
    )
  }

  const sendVipMatchReply = () => {
    const text = vipMatchDraft.trim()
    if (!text) return
    setVipMatchReplies((prev) => [...prev, text])
    setVipMatchDraft('')
  }

  if (!mounted) return null
  if (hideForHandover) return null
  if (authOpen || cashierOpen) return null
  /* Mobile: show when messenger is open (Laura / inbox) — covers the dock. */
  if (isMobile && !intercomOpen) return null

  return createPortal(
    <div data-welcome-inbox-root="">
      <div
        className={cn(
          'pointer-events-none absolute flex flex-col gap-3',
          isMobile
            ? 'inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] items-stretch'
            : 'bottom-6 left-6 items-start',
        )}
      >
        <AnimatePresence>
          {intercomOpen ? (
            showLauraAlert ? (
              <motion.div
                key={
                  showLevelUpAlert
                    ? 'laura-level-up'
                    : showVipMatchAlert
                      ? 'laura-vip-match'
                      : 'laura-welcome'
                }
                role="dialog"
                aria-label={
                  showLevelUpAlert
                    ? 'Level up message'
                    : showVipMatchAlert
                      ? 'VIP status match'
                      : 'Welcome message'
                }
                initial={{ opacity: 0, y: 36, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                className={cn(
                  'pointer-events-auto relative w-full',
                  isMobile ? 'max-w-none' : 'w-[340px]',
                )}
              >
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setIntercomOpen(false)}
                  className="absolute -right-1.5 -top-1.5 z-10 inline-flex size-8 items-center justify-center rounded-full bg-white text-zinc-500 shadow-[0_4px_14px_rgba(0,0,0,0.28)]"
                >
                  <IconX className="size-3.5" strokeWidth={2.5} />
                </button>

                <article className="max-h-[min(70dvh,520px)] overflow-y-auto rounded-[18px] bg-white p-4 text-left text-zinc-900 shadow-[0_16px_48px_rgba(0,0,0,0.55)]">
                  <div className="mb-3 flex items-start gap-2.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      B
                    </span>
                    <h2 className="pt-1.5 text-[15px] font-bold leading-tight tracking-tight">
                      {showLevelUpAlert
                        ? `Congrats, ${username}!`
                        : showVipMatchAlert
                          ? 'Instant VIP Match'
                          : `Hey ${username},`}
                    </h2>
                  </div>

                  {showLevelUpAlert ? (
                    <div className="space-y-3 text-[13px] leading-[1.55] text-zinc-700">
                      <p>
                        You just leveled up to{' '}
                        <span className="font-semibold text-zinc-900">Silver</span>. Nice
                        work — here&apos;s what unlocked for you:
                      </p>
                      <ul className="space-y-1.5 rounded-xl bg-zinc-50 p-3">
                        {VIP_SILVER_UNLOCKED_LABELS.map((label) => (
                          <li
                            key={label}
                            className="flex items-start gap-2 text-[13px] font-medium text-zinc-800"
                          >
                            <span
                              className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                              aria-hidden
                            />
                            {label}
                          </li>
                        ))}
                      </ul>
                      <p>
                        Claim your level-up bonus in VIP Hub whenever you&apos;re ready.
                        Keep playing to push toward Gold.
                      </p>
                      <p className="font-semibold text-zinc-900">— {AGENT_NAME}</p>
                    </div>
                  ) : showVipMatchAlert ? (
                    <div className="flex flex-col gap-3">
                      <div className="space-y-2.5 rounded-2xl bg-zinc-100 px-3.5 py-3 text-[13px] leading-[1.55] text-zinc-700">
                        <p>
                          Want to bring your VIP status over? Tell us what you wager on
                          your other site (sports, casino, or both) and we&apos;ll start
                          a status match.
                        </p>
                        <p>
                          To prove activity, you&apos;ll need a{' '}
                          <span className="font-semibold text-zinc-900">$500 deposit</span>
                          . After that we monitor your wagering here to see what VIP level
                          you should be at.
                        </p>
                        <p>
                          Reply with where you play and roughly how much you wager. I&apos;ll
                          walk you through the next steps.
                        </p>
                        <p className="font-semibold text-zinc-900">{AGENT_NAME}</p>
                      </div>
                      {vipMatchReplies.map((msg, i) => (
                        <div
                          key={`${msg}-${i}`}
                          className="ml-8 rounded-2xl bg-primary px-3.5 py-2.5 text-[13px] leading-[1.45] text-primary-foreground"
                        >
                          {msg}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3 text-[13px] leading-[1.55] text-zinc-700">
                      <p>
                        Welcome to BetOnline! Great to have you on board. You picked a
                        great time to join.
                      </p>
                      <p>
                        We know trust matters. That&apos;s why we focus on transparency,
                        fast withdrawals, and a fair gaming experience for everyone.
                      </p>
                      <p>
                        Take a moment to discover what makes us stand out — 2,500+
                        casino games, Casino Rakeback on every bet (even losses), daily
                        rewards &amp; VIP progress, Daily Races, and progressive
                        jackpots. Deposit when you&apos;re ready and your welcome free
                        spins unlock.
                      </p>
                      <p>
                        If you ever need anything — big or small — just drop me a
                        message. Good luck, and most importantly, have fun. We&apos;re
                        happy to have you with us.
                      </p>
                      <p className="font-semibold text-zinc-900">— {AGENT_NAME}</p>
                    </div>
                  )}

                  {showVipMatchAlert ? (
                    <form
                      className="mt-4 flex items-end gap-2 border-t border-zinc-100 pt-3"
                      onSubmit={(e) => {
                        e.preventDefault()
                        sendVipMatchReply()
                      }}
                    >
                      <label className="sr-only" htmlFor="vip-match-reply">
                        Message
                      </label>
                      <textarea
                        id="vip-match-reply"
                        rows={2}
                        value={vipMatchDraft}
                        onChange={(e) => setVipMatchDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendVipMatchReply()
                          }
                        }}
                        placeholder="Tell us where you play…"
                        className="min-h-[40px] flex-1 resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/25"
                      />
                      <button
                        type="submit"
                        disabled={!vipMatchDraft.trim()}
                        aria-label="Send message"
                        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                      >
                        <IconSend className="size-4" strokeWidth={2.25} />
                      </button>
                    </form>
                  ) : showLevelUpAlert ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIntercomOpen(false)
                        setVipHubOpen(true)
                      }}
                      className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Open VIP Hub
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIntercomOpen(false)
                        setCashierOpen(true)
                      }}
                      className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Deposit now
                    </button>
                  )}

                  <p className="mt-3 text-xs text-zinc-400">
                    {AGENT_NAME} · Just now
                  </p>
                </article>
              </motion.div>
            ) : (
              <motion.div
                key="empty-inbox"
                role="dialog"
                aria-label="Messages"
                initial={{ opacity: 0, y: 36, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                className={cn(
                  'pointer-events-auto relative flex w-full flex-col overflow-hidden rounded-[18px] bg-white text-zinc-900 shadow-[0_16px_48px_rgba(0,0,0,0.55)]',
                  isMobile ? 'max-w-none' : 'w-[360px]',
                  'h-[min(72dvh,560px)]',
                )}
              >
                <header className="relative flex shrink-0 items-center justify-center border-b border-zinc-100 px-4 py-3.5">
                  {chatOpen && inboxTab === 'messages' ? (
                    <>
                      <button
                        type="button"
                        aria-label="Back to messages"
                        onClick={() => setChatOpen(false)}
                        className="absolute left-3 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                      >
                        <IconChevronLeft className="size-4" strokeWidth={2.25} />
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          B
                        </span>
                        <span className="flex flex-col text-left">
                          <span className="text-[14px] font-bold leading-tight tracking-tight">
                            {AGENT_NAME}
                          </span>
                          <span className="text-[11px] leading-tight text-zinc-400">
                            Replies instantly
                          </span>
                        </span>
                      </div>
                    </>
                  ) : (
                    <h2 className="text-[16px] font-bold tracking-tight">
                      {inboxTab === 'home' ? 'Home' : inboxTab === 'help' ? 'Help' : 'Messages'}
                    </h2>
                  )}
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => setIntercomOpen(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex size-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                  >
                    <IconX className="size-4" strokeWidth={2.25} />
                  </button>
                </header>

                {chatOpen && inboxTab === 'messages' ? (
                  <>
                    <div
                      ref={chatScrollRef}
                      className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-4"
                    >
                      {chat.map((msg) =>
                        msg.from === 'user' ? (
                          <div
                            key={msg.id}
                            className="ml-10 self-end rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-[13px] leading-[1.45] text-primary-foreground"
                          >
                            {msg.text}
                          </div>
                        ) : (
                          <div key={msg.id} className="mr-10 flex flex-col items-start gap-1.5 self-start">
                            <div className="rounded-2xl rounded-bl-md bg-zinc-100 px-3.5 py-2.5 text-[13px] leading-[1.45] text-zinc-800">
                              {msg.text}
                            </div>
                            {msg.tour ? (
                              <button
                                type="button"
                                onClick={() => startProductTour(msg.tour!)}
                                className="inline-flex h-8 items-center rounded-full border border-zinc-200 px-3 text-[12px] font-semibold text-zinc-800 transition-colors hover:bg-zinc-50"
                              >
                                Show me again
                              </button>
                            ) : null}
                          </div>
                        ),
                      )}
                      {lauraTyping ? (
                        <div
                          className="flex h-9 w-14 items-center justify-center gap-1 self-start rounded-2xl rounded-bl-md bg-zinc-100"
                          aria-label={`${AGENT_NAME} is typing`}
                        >
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              className="size-1.5 animate-bounce rounded-full bg-zinc-400"
                              style={{ animationDelay: `${i * 120}ms` }}
                            />
                          ))}
                        </div>
                      ) : null}
                      {chat.length === 1 && !lauraTyping ? (
                        <div className="mt-2 flex flex-wrap justify-end gap-1.5">
                          {PRODUCT_TOUR_SUGGESTIONS.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => sendChat(s)}
                              className="inline-flex h-8 items-center rounded-full border border-primary/40 px-3 text-[12px] font-medium text-primary transition-colors hover:bg-primary/5"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <form
                      className="flex shrink-0 items-end gap-2 border-t border-zinc-100 px-3 py-3"
                      onSubmit={(e) => {
                        e.preventDefault()
                        sendChat(chatDraft)
                      }}
                    >
                      <label className="sr-only" htmlFor="intercom-chat-input">
                        Message
                      </label>
                      <textarea
                        id="intercom-chat-input"
                        ref={chatInputRef}
                        rows={1}
                        value={chatDraft}
                        onChange={(e) => setChatDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendChat(chatDraft)
                          }
                        }}
                        placeholder="Message…"
                        className="min-h-[40px] flex-1 resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/25"
                      />
                      <button
                        type="submit"
                        disabled={!chatDraft.trim() || lauraTyping}
                        aria-label="Send message"
                        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                      >
                        <IconSend className="size-4" strokeWidth={2.25} />
                      </button>
                    </form>
                  </>
                ) : (
                inboxTab === 'home' ? (
                  <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4 pt-5">
                    <div>
                      <p className="text-[17px] font-bold tracking-tight">Hi there 👋</p>
                      <p className="mt-1 text-[13px] leading-snug text-zinc-500">
                        Ask us anything — we&apos;re here to help.
                      </p>
                    </div>
                    <section aria-labelledby="intercom-site-version" className="flex flex-col gap-2">
                      <h3
                        id="intercom-site-version"
                        className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
                      >
                        Site version
                      </h3>
                      <SiteVersionList currentId={siteVersion.id} />
                    </section>
                    <button
                      type="button"
                      onClick={() => {
                        setInboxTab('messages')
                        setChatOpen(true)
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl border border-zinc-200 px-3 py-3 text-left transition-colors hover:bg-zinc-50"
                    >
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-[13px] font-semibold leading-tight text-zinc-900">
                          Send us a message
                        </span>
                        <span className="text-xs leading-tight text-zinc-500">
                          {AGENT_NAME} replies instantly
                        </span>
                      </span>
                      <IconSend className="size-4 shrink-0 text-primary" strokeWidth={2.25} />
                    </button>
                  </div>
                ) : (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-4 pt-8 text-center">
                  {inboxTab === 'messages' ? (
                    <>
                      <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-zinc-100 text-zinc-900">
                        <IconMessageCircle2 className="size-8" strokeWidth={1.75} />
                      </span>
                      <p className="text-[17px] font-bold tracking-tight">No messages</p>
                      <p className="mt-1.5 max-w-[220px] text-[13px] leading-snug text-zinc-500">
                        Messages from the team will be shown here
                      </p>
                      <button
                        type="button"
                        onClick={() => setChatOpen(true)}
                        className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[14px] font-semibold text-primary-foreground shadow-[0_8px_20px_rgba(238,53,53,0.35)]"
                      >
                        Send us a message
                        <IconSend className="size-4" strokeWidth={2.25} />
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-[17px] font-bold tracking-tight">Help</p>
                      <p className="mt-2 max-w-[240px] text-[13px] leading-snug text-zinc-500">
                        FAQs and support articles live here in the real product.
                      </p>
                    </>
                  )}
                </div>
                )
                )}

                {chatOpen && inboxTab === 'messages' ? null : (
                <nav className="grid shrink-0 grid-cols-3 border-t border-zinc-100 bg-white px-2 pb-2 pt-1.5">
                  {(
                    [
                      { id: 'home' as const, label: 'Home', Icon: IconHome },
                      { id: 'messages' as const, label: 'Messages', Icon: IconMessageCircle2 },
                      { id: 'help' as const, label: 'Help', Icon: IconQuestionMark },
                    ]
                  ).map(({ id, label, Icon }) => {
                    const active = inboxTab === id
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setInboxTab(id)}
                        className={cn(
                          'flex flex-col items-center gap-0.5 rounded-lg py-2 text-[11px] font-medium',
                          active ? 'text-primary' : 'text-zinc-400',
                        )}
                      >
                        <Icon
                          className={cn('size-5', active && 'fill-primary/15')}
                          strokeWidth={active ? 2.25 : 1.75}
                        />
                        {label}
                      </button>
                    )
                  })}
                </nav>
                )}
              </motion.div>
            )
          ) : null}
        </AnimatePresence>

        {!isMobile ? (
          <button
            type="button"
            aria-label={intercomOpen ? 'Minimize messenger' : 'Open messenger'}
            aria-expanded={intercomOpen}
            onClick={() => setIntercomOpen(!intercomOpen)}
            className="pointer-events-auto relative inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_rgba(0,0,0,0.4)] active:scale-95"
          >
            {intercomOpen ? (
              <IconChevronDown className="size-7" strokeWidth={2.5} />
            ) : (
              <IntercomMark />
            )}
            {(intercomWelcomePending ||
              intercomLevelUpPending ||
              intercomVipMatchPending) &&
            !intercomOpen ? (
              <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-white text-[10px] font-bold text-primary ring-2 ring-[#1a1a1a]">
                1
              </span>
            ) : null}
          </button>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
