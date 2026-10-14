import type { ComponentProps } from 'react'
import { cn } from 'cn'

function Timeline({ className, ...props }: ComponentProps<'ol'>) {
  return <ol data-slot="timeline" className={cn('flex flex-col gap-0', className)} {...props} />
}

function TimelineItem({ className, ...props }: ComponentProps<'li'>) {
  return (
    <li
      data-slot="timeline-item"
      className={cn('relative flex gap-3 pb-6 last:pb-0', className)}
      {...props}
    />
  )
}

function TimelineIndicator({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span className="relative flex flex-col items-center">
      <span
        data-slot="timeline-indicator"
        className={cn('relative z-10 size-3 rounded-full bg-primary ring-4 ring-background', className)}
        {...props}
      />
      <span className="absolute top-3 bottom-[-1.5rem] w-px bg-border last:hidden" aria-hidden />
    </span>
  )
}

function TimelineContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="timeline-content" className={cn('-mt-1 flex flex-col gap-1', className)} {...props} />
}

function TimelineTitle({ className, ...props }: ComponentProps<'h3'>) {
  return <h3 data-slot="timeline-title" className={cn('text-sm font-medium', className)} {...props} />
}

function TimelineDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p data-slot="timeline-description" className={cn('text-xs text-muted-foreground', className)} {...props} />
  )
}

export { Timeline, TimelineItem, TimelineIndicator, TimelineContent, TimelineTitle, TimelineDescription }
