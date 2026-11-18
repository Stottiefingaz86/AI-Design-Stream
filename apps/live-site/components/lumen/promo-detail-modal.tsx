'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { IconChevronDown, IconPlayerPlayFilled, IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import {
  fetchPromoPage,
  type PromoCmsAction,
  type PromoCmsBlock,
  type PromoCmsPage,
} from '@/lib/lumen/promotions-cms'
import { cn } from '@/lib/utils'

const CARD = 'rounded-[10px] border border-border bg-card'

function HeroBlock({ block }: { block: Extract<PromoCmsBlock, { type: 'hero' }> }) {
  return (
    <div className="flex flex-col">
      <div className="aspect-[2/1] w-full overflow-hidden bg-surface-muted-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={block.image.src}
          alt={block.image.alt}
          className="size-full object-cover object-center"
        />
      </div>
      <div className="flex flex-col gap-2 px-5 pt-5 sm:px-6">
        {block.tag ? (
          <span className="inline-flex w-fit rounded-full bg-foreground px-2 py-0.5 text-xs font-medium leading-4 text-background">
            {block.tag}
          </span>
        ) : null}
        <Typography as="h2" shape="h3" weight="semibold" className="text-xl leading-7">
          {block.title}
        </Typography>
        {block.subtitle ? (
          <Typography as="p" shape="paragraph" variant="muted" className="text-sm leading-5">
            {block.subtitle}
          </Typography>
        ) : null}
      </div>
    </div>
  )
}

function SectionHeading({ children }: { children: string }) {
  return (
    <Typography as="h3" shape="h4" weight="semibold" className="text-base leading-6">
      {children}
    </Typography>
  )
}

function VideoBlock({ block }: { block: Extract<PromoCmsBlock, { type: 'video' }> }) {
  const [playing, setPlaying] = useState(false)
  return (
    <figure className="flex flex-col gap-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-[10px] bg-black">
        {block.provider === 'youtube' ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${block.src}`}
            title={block.caption ?? 'Video'}
            allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : playing ? (
          <video
            src={block.src}
            poster={block.poster}
            controls
            autoPlay
            playsInline
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <button
            type="button"
            aria-label={block.caption ?? 'Play video'}
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 flex items-center justify-center"
          >
            {block.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={block.poster} alt="" className="absolute inset-0 size-full object-cover" />
            ) : null}
            <span className="absolute inset-0 bg-black/35 transition-colors duration-200 group-hover:bg-black/20" />
            <span className="relative inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-transform duration-200 group-hover:scale-105">
              <IconPlayerPlayFilled className="ml-0.5 size-6" />
            </span>
          </button>
        )}
      </div>
      {block.caption ? (
        <figcaption className="text-xs leading-4 text-muted-foreground">{block.caption}</figcaption>
      ) : null}
    </figure>
  )
}

function TermsBlock({ block }: { block: Extract<PromoCmsBlock, { type: 'terms' }> }) {
  const [open, setOpen] = useState(false)
  return (
    <section className={cn(CARD, 'overflow-hidden')}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-full items-center justify-between gap-3 px-4 text-left text-sm font-medium text-foreground transition-colors duration-200 hover:bg-[var(--surface-muted-4)]"
      >
        {block.heading ?? 'Terms and Conditions'}
        <IconChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-300',
            open && 'rotate-180',
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-in-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <ol className="min-h-0 list-decimal overflow-hidden pl-9 pr-4 text-xs leading-5 text-muted-foreground [&>li:last-child]:pb-4">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function PromoBlock({ block }: { block: PromoCmsBlock }) {
  switch (block.type) {
    case 'hero':
      return <HeroBlock block={block} />
    case 'richText':
      return (
        <section className="flex flex-col gap-2">
          {block.heading ? <SectionHeading>{block.heading}</SectionHeading> : null}
          {block.paragraphs.map((p) => (
            <Typography key={p} as="p" shape="paragraph" className="text-sm leading-6 text-foreground/85">
              {p}
            </Typography>
          ))}
        </section>
      )
    case 'keyFacts':
      return (
        <dl className="grid grid-cols-3 gap-2">
          {block.items.map((item) => (
            <div key={item.label} className={cn(CARD, 'flex flex-col-reverse justify-end gap-0.5 px-3 py-3')}>
              <dt className="truncate text-xs leading-4 text-muted-foreground">{item.label}</dt>
              <dd className="text-sm font-semibold leading-5 text-foreground sm:text-base sm:leading-6">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      )
    case 'steps':
      return (
        <section className="flex flex-col gap-3">
          {block.heading ? <SectionHeading>{block.heading}</SectionHeading> : null}
          <ol className="flex flex-col gap-2">
            {block.items.map((item, i) => (
              <li key={item.title} className={cn(CARD, 'flex items-start gap-3 p-3')}>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                  {i + 1}
                </span>
                <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
                  <p className="text-sm font-medium leading-5 text-foreground">{item.title}</p>
                  <p className="text-sm leading-5 text-muted-foreground">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )
    case 'bullets':
      return (
        <section className="flex flex-col gap-2">
          {block.heading ? <SectionHeading>{block.heading}</SectionHeading> : null}
          <ul className="flex flex-col gap-1.5">
            {block.items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm leading-6 text-foreground/85">
                <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </section>
      )
    case 'image':
      return (
        <figure className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.image.src}
            alt={block.image.alt}
            className="w-full rounded-[10px] border border-border object-cover"
          />
          {block.caption ? (
            <figcaption className="text-xs leading-4 text-muted-foreground">{block.caption}</figcaption>
          ) : null}
        </figure>
      )
    case 'gallery':
      return (
        <section className="flex flex-col gap-3">
          {block.heading ? <SectionHeading>{block.heading}</SectionHeading> : null}
          <div className="grid grid-cols-2 gap-2">
            {block.images.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${img.src}-${i}`}
                src={img.src}
                alt={img.alt}
                className="aspect-square w-full rounded-[10px] border border-border bg-card object-contain p-2"
              />
            ))}
          </div>
        </section>
      )
    case 'video':
      return <VideoBlock block={block} />
    case 'terms':
      return <TermsBlock block={block} />
    default:
      return null
  }
}

function PromoPageSkeleton() {
  return (
    <div className="flex flex-col gap-5 pb-6" aria-hidden>
      <Skeleton className="aspect-[2/1] w-full rounded-none" />
      <div className="flex flex-col gap-3 px-5 sm:px-6">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-2 grid grid-cols-3 gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  )
}

/**
 * Promotion detail — CMS page served in the shell's centred dialog
 * (same chrome as Daily Spin / Join). Banner first, then blocks in CMS order.
 */
export function PromoDetailModal({
  promoId,
  fallbackTitle,
  onClose,
  onAction,
}: {
  promoId: string | null
  fallbackTitle?: string
  onClose: () => void
  onAction: (action: PromoCmsAction) => void
}) {
  const [mounted, setMounted] = useState(false)
  const [page, setPage] = useState<PromoCmsPage | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!promoId) return
    let cancelled = false
    setPage(null)
    setLoading(true)
    fetchPromoPage(promoId).then((result) => {
      if (cancelled) return
      setPage(result)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [promoId])

  useEffect(() => {
    if (!promoId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [promoId, onClose])

  if (!mounted) return null

  const title = page?.title ?? fallbackTitle ?? 'Promotion'
  const hero = page?.blocks.find((b) => b.type === 'hero')
  const rest = page?.blocks.filter((b) => b !== hero) ?? []

  return createPortal(
    <div data-promo-detail-root="" data-open={promoId ? 'true' : 'false'}>
      <AnimatePresence>
        {promoId ? (
          <motion.div
            key="promo-detail"
            className="dark absolute inset-0 flex items-center justify-center p-3 text-foreground sm:p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            role="presentation"
          >
            <div aria-hidden className="absolute inset-0 bg-black/70" />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="promo-detail-title"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'relative z-[1] flex w-full max-w-[640px] flex-col overflow-hidden',
                'h-[min(90dvh,760px)] rounded-xl border border-white/15 bg-background',
                'shadow-[0_24px_80px_rgba(0,0,0,0.55)]',
              )}
            >
              <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
                <p
                  id="promo-detail-title"
                  className="min-w-0 truncate text-[15px] font-semibold text-foreground"
                >
                  {title}
                </p>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className={cn(
                    'shell-chrome-btn inline-flex size-9 shrink-0 items-center justify-center',
                    'rounded-lg border border-border bg-secondary text-foreground shadow-sm',
                    'transition-colors hover:bg-accent active:bg-accent',
                  )}
                >
                  <IconX className="size-4" stroke={2} />
                </button>
              </header>

              <div className="shell-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {loading ? (
                  <PromoPageSkeleton />
                ) : page ? (
                  <div className="flex flex-col gap-6 pb-6">
                    {hero ? <PromoBlock block={hero} /> : null}
                    <div className="flex flex-col gap-6 px-5 sm:px-6">
                      {rest.map((block, i) => (
                        <PromoBlock key={`${block.type}-${i}`} block={block} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="px-6 py-16 text-center text-sm text-muted-foreground">
                    This promotion isn’t available right now.
                  </p>
                )}
              </div>

              {page?.cta ? (
                <footer className="flex shrink-0 items-center justify-end border-t border-border bg-background px-4 py-3 sm:px-6">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto sm:min-w-[160px]"
                    onClick={() => onAction(page.cta!.action)}
                  >
                    {page.cta.label}
                  </Button>
                </footer>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>,
    document.body,
  )
}
