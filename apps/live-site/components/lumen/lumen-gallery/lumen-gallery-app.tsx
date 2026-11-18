'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTheme } from 'next-themes'
import {
  IconCheck,
  IconCopy,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconMenu2,
  IconMoon,
  IconSearch,
  IconSun,
  IconX,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { GROUP_META, LUMEN_GROUPS, LUMEN_STORIES, findStory, storiesByGroup } from './catalog'
import {
  GalleryDeviceProvider,
  type GalleryDevice,
} from './device-context'
import type { LumenStory } from './types'

type DeviceView = GalleryDevice

/** Stories that only make sense in a phone frame (chip tuck, etc.). */
const FORCE_MOBILE_STORIES = new Set(['shell-sticky-chrome'])

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="h-8 gap-1.5"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1600)
        } catch {
          /* ignore */
        }
      }}
    >
      {copied ? <IconCheck className="size-3.5 text-success" /> : <IconCopy className="size-3.5" />}
      {copied ? 'Copied' : label}
    </Button>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const dark = !mounted || resolvedTheme !== 'light'
  return (
    <div
      role="group"
      aria-label="Theme"
      className="inline-flex h-8 items-center rounded-lg border border-border bg-secondary p-0.5"
    >
      <button
        type="button"
        aria-pressed={!dark}
        title="Light"
        onClick={() => setTheme('light')}
        className={cn(
          'inline-flex size-7 items-center justify-center rounded-md transition-colors',
          !dark ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <IconSun className="size-3.5" />
      </button>
      <button
        type="button"
        aria-pressed={dark}
        title="Dark"
        onClick={() => setTheme('dark')}
        className={cn(
          'inline-flex size-7 items-center justify-center rounded-md transition-colors',
          dark ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <IconMoon className="size-3.5" />
      </button>
    </div>
  )
}

function DeviceToggle({
  value,
  onChange,
}: {
  value: DeviceView
  onChange: (v: DeviceView) => void
}) {
  const items: { id: DeviceView; label: string; icon: typeof IconDeviceDesktop }[] = [
    { id: 'mobile', label: 'Mobile', icon: IconDeviceMobile },
    { id: 'tablet', label: 'Tablet', icon: IconDeviceTablet },
    { id: 'desktop', label: 'Desktop', icon: IconDeviceDesktop },
  ]
  return (
    <div
      role="group"
      aria-label="Device view"
      className="inline-flex h-8 items-center rounded-lg border border-border bg-secondary p-0.5"
    >
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={value === id}
          title={label}
          onClick={() => onChange(id)}
          className={cn(
            'inline-flex size-7 items-center justify-center rounded-md transition-colors',
            value === id
              ? 'bg-primary/20 text-foreground shadow-sm ring-1 ring-primary/40'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  )
}

/** Keep previews in-library — never navigate to the demo site. */
function PreviewSandbox({
  device,
  children,
}: {
  device: DeviceView
  children: ReactNode
}) {
  const maxW =
    device === 'mobile' ? 'max-w-[390px]' : device === 'tablet' ? 'max-w-[768px]' : 'max-w-none'
  return (
    <GalleryDeviceProvider device={device}>
      <div
        data-lumen-device={device}
        className={cn('mx-auto w-full transition-[max-width] duration-300', maxW)}
        onClickCapture={(e) => {
          const t = e.target as HTMLElement | null
          if (t?.closest?.('[data-lumen-allow]')) return
          const el = t?.closest?.('a[href]')
          if (!el) return
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <div
          className={cn(
            'overflow-hidden rounded-[10px] border border-border bg-background',
            device === 'mobile' ? 'p-0 min-h-[640px]' : 'p-4 sm:p-5',
            device === 'tablet' && 'min-h-[500px]',
          )}
        >
          {children}
        </div>
        {device === 'mobile' ? (
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            390px phone frame — chrome uses gallery device, not browser width
          </p>
        ) : null}
      </div>
    </GalleryDeviceProvider>
  )
}

function SidebarNav({
  activeId,
  onSelect,
  query,
}: {
  activeId: string
  onSelect: (id: string) => void
  query: string
}) {
  const q = query.trim().toLowerCase()
  return (
    <nav className="space-y-5 px-3 pb-10 pt-2">
      {LUMEN_GROUPS.map((group) => {
        const items = storiesByGroup(group).filter((s) => {
          if (!q) return true
          return (
            s.title.toLowerCase().includes(q) ||
            s.id.includes(q) ||
            s.importPath.toLowerCase().includes(q) ||
            (s.description?.toLowerCase().includes(q) ?? false)
          )
        })
        if (items.length === 0) return null
        return (
          <div key={group}>
            <p className="mb-1.5 px-2 text-[11px] font-semibold tracking-[0.04em] text-muted-foreground">
              {GROUP_META[group].emoji ? (
                <span className="mr-1">{GROUP_META[group].emoji}</span>
              ) : null}
              {GROUP_META[group].label}
            </p>
            <ul className="space-y-0.5">
              {items.map((story) => {
                const active = story.id === activeId
                return (
                  <li key={story.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(story.id)}
                      className={cn(
                        'flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors',
                        active
                          ? 'bg-primary/15 font-semibold text-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                      )}
                    >
                      <span className="text-[11px] text-muted-foreground/70" aria-hidden>
                        ↳
                      </span>
                      {story.title}
                    </button>
                  </li>
                )
              })}
            </ul>
            <div className="my-3 border-t border-border/60" />
          </div>
        )
      })}
    </nav>
  )
}

function StoryCanvas({
  story,
  device,
}: {
  story: LumenStory
  device: DeviceView
}) {
  const importLine = `import { … } from '${story.importPath}'`
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-border px-5 py-4 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {story.group}
            </p>
            <h1 className="mt-1 text-[22px] font-bold tracking-tight text-foreground">{story.title}</h1>
            {story.description ? (
              <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{story.description}</p>
            ) : null}
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">{story.importPath}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={importLine} label="Copy import" />
            <CopyButton text={story.code} label="Copy code" />
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <section className="border-b border-border px-5 py-8 sm:px-8">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Preview
          </p>
          <PreviewSandbox key={story.id} device={device}>
            {story.render()}
          </PreviewSandbox>
        </section>

        <section className="px-5 py-8 sm:px-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Code
            </p>
            <CopyButton text={story.code} />
          </div>
          <pre className="overflow-x-auto rounded-[10px] border border-border bg-card p-4 text-[12px] leading-relaxed text-foreground shadow-[0_0_16px_rgba(0,0,0,0.06)]">
            <code>{story.code}</code>
          </pre>
        </section>
      </div>
    </div>
  )
}

/**
 * Lumen codebase — extract library. No demo redirects. Sticky nav · theme · device.
 */
export function LumenGalleryApp() {
  const firstId = 'foundations-typography'
  const [activeId, setActiveId] = useState(firstId)
  const [query, setQuery] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const [device, setDevice] = useState<DeviceView>('desktop')

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : ''
    if (hash && findStory(hash)) {
      setActiveId(hash)
      if (FORCE_MOBILE_STORIES.has(hash)) setDevice('mobile')
    }
  }, [])

  const select = (id: string) => {
    setActiveId(id)
    setMobileNav(false)
    if (FORCE_MOBILE_STORIES.has(id)) setDevice('mobile')
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${id}`)
    }
  }

  const story = useMemo(() => findStory(activeId) ?? LUMEN_STORIES[0]!, [activeId])

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background text-foreground">
      <header className="z-20 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-3 sm:gap-3 sm:px-4">
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-secondary text-foreground transition-colors hover:bg-accent md:hidden"
          aria-label="Menu"
          onClick={() => setMobileNav(true)}
        >
          <IconMenu2 className="size-4" />
        </button>
        <div className="min-w-0 shrink">
          <p className="truncate text-sm font-semibold text-foreground">Lumen codebase</p>
          <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
            Live modules · copy &amp; extract — stays in this library
          </p>
        </div>
        <div className="mx-auto hidden max-w-[220px] flex-1 md:block">
          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="h-8 rounded-lg border border-input bg-popover pl-8 text-xs"
            />
          </div>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <DeviceToggle value={device} onChange={setDevice} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Library left nav — always on from sm; drawer below. Never covered by previews. */}
        <aside
          data-lumen-gallery-nav=""
          className="sticky top-0 z-10 hidden h-[calc(100svh-3rem)] w-[240px] shrink-0 flex-col overflow-y-auto border-r border-border bg-[#101010] sm:flex lg:w-[260px] dark:bg-[#101010]"
        >
          <SidebarNav activeId={story.id} onSelect={select} query={query} />
        </aside>

        <main className="relative z-0 flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
          <StoryCanvas story={story} device={device} />
        </main>
      </div>

      {mobileNav ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close menu"
            onClick={() => setMobileNav(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(100%,280px)] flex-col bg-[#101010] shadow-xl">
            <div className="flex h-12 items-center justify-between border-b border-border px-3">
              <p className="text-sm font-semibold">Lumen codebase</p>
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-accent"
                aria-label="Close"
                onClick={() => setMobileNav(false)}
              >
                <IconX className="size-4" />
              </button>
            </div>
            <div className="border-b border-border p-3">
              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="h-8 rounded-lg border border-input bg-popover pl-8 text-xs"
                />
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <SidebarNav activeId={story.id} onSelect={select} query={query} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
