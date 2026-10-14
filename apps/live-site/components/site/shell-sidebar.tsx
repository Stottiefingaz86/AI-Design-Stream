'use client'

import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useShell } from './shell-context'
import { ShellIcon, ShellLogo } from './shell-icons'
import { navForProduct, type ShellNavItem } from './shell-nav'
import { cn } from '@/lib/utils'

/**
 * Figma sidebar-container — 96px collapsed / 256px expanded.
 * Width eases in/out. Logo morphs wordmark → lettermark with a pop.
 * Nav items skeleton while the product route is resolving.
 */
export function ShellSidebar() {
  const { expanded, toggle, product, navigating } = useShell()
  const groups = navForProduct(product)

  return (
    <aside
      data-name="sidebar-container"
      data-state={expanded ? 'expanded' : 'collapsed'}
      className={cn(
        'fixed inset-y-0 left-0 z-40 hidden h-svh flex-col overflow-hidden border-r border-[var(--sidebar-border-inverted)] bg-[var(--sidebar-inverted)] transition-[width] duration-300 ease-in-out lg:flex',
        expanded ? 'w-64' : 'w-24'
      )}
    >
      <div className="flex h-16 w-full shrink-0 items-center justify-center p-2">
        <button
          type="button"
          onClick={toggle}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          className="shell-chrome-btn flex h-8 items-center justify-center rounded-md border-0 bg-transparent"
        >
          <ShellLogo expanded={expanded} />
        </button>
      </div>

      <nav
        className={cn(
          'shell-scroll flex flex-1 flex-col gap-2 overflow-y-auto pt-2 transition-[padding] duration-300 ease-in-out',
          expanded ? 'px-2' : 'px-6'
        )}
        aria-label={product}
      >
        {navigating ? (
          <SidebarSkeleton expanded={expanded} />
        ) : (
          groups.map((group, index) => (
            <div key={`${group.heading ?? 'group'}-${index}`} className="flex flex-col gap-1.5">
              {index > 0 ? <div className="h-px w-full bg-[var(--border-inverted)]" /> : null}
              {group.heading ? (
                <p
                  className={cn(
                    'px-2 py-1.5 text-xs font-medium leading-4 text-[var(--muted-foreground-inverted)] transition-opacity duration-200 ease-in-out',
                    expanded ? 'opacity-100' : 'h-0 overflow-hidden p-0 opacity-0'
                  )}
                >
                  {group.heading}
                </p>
              ) : null}
              {group.items.map((item) => (
                <NavItem key={`${group.heading ?? ''}-${item.label}`} item={item} expanded={expanded} />
              ))}
            </div>
          ))
        )}
      </nav>
    </aside>
  )
}

function SidebarSkeleton({ expanded }: { expanded: boolean }) {
  const widths = ['72%', '58%', '84%', '46%', '66%', '78%', '52%', '70%']

  return (
    <div className="flex flex-col gap-1.5" aria-hidden>
      {widths.map((width, index) => (
        <div
          key={width}
          className={cn(
            'flex h-10 items-center rounded-lg',
            expanded ? 'gap-2 px-2' : 'justify-center'
          )}
        >
          <span className="size-5 shrink-0 animate-pulse rounded-md bg-white/10" />
          {expanded ? (
            <span
              className="h-3 animate-pulse rounded bg-white/10"
              style={{ width }}
            />
          ) : null}
          {index === 3 && expanded ? <span className="sr-only">Loading navigation</span> : null}
        </div>
      ))}
    </div>
  )
}

function NavItem({ item, expanded }: { item: ShellNavItem; expanded: boolean }) {
  const inner = (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-current={item.active ? 'page' : undefined}
      data-state={item.active ? 'active' : 'default'}
      className={cn(
        'group relative flex w-full items-center overflow-hidden rounded-lg border-0 outline-none ring-0 text-sm leading-5 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:outline-none',
        item.emphasis ? 'h-11' : 'h-10',
        expanded ? 'justify-start gap-2' : 'justify-center',
        expanded && (item.active ? 'px-2.5' : 'px-2'),
        item.active && expanded
          ? 'bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]'
          : 'text-[var(--muted-foreground-inverted)] hover:bg-[var(--surface-muted-1-inverted)] hover:text-[var(--foreground-inverted)]'
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-md transition-colors duration-200 ease-in-out',
          item.emphasis ? 'size-8' : 'size-6',
          !item.active && item.emphasis && 'bg-[var(--surface-muted-1-inverted)]',
          item.active && !expanded && 'bg-[var(--sidebar-primary)]'
        )}
      >
        <ShellIcon
          name={item.icon}
          active={item.active}
          className="size-5"
        />
      </span>
      <span
        className={cn(
          'min-w-0 flex-1 transition-opacity duration-200 ease-in-out',
          expanded ? 'opacity-100' : 'sr-only opacity-0'
        )}
      >
        <span className={cn('block truncate', item.active ? 'font-semibold' : 'font-medium')}>
          {item.label}
        </span>
        {item.subtitle ? (
          <span className="block truncate text-[10px] font-normal leading-[14px] opacity-80">
            {item.subtitle}
          </span>
        ) : null}
      </span>
      {expanded && item.trailing ? <ShellIcon name={item.trailing} className="size-5" /> : null}
    </Link>
  )

  if (expanded) return inner

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{inner}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8} className="border-border bg-popover text-sm font-medium text-popover-foreground">
        {item.label}
      </TooltipContent>
    </Tooltip>
  )
}
