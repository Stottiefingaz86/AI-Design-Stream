import type { ComponentProps } from 'react'
import { cn } from 'cn'

function Backdrop({
  className,
  blur = true,
  ...props
}: ComponentProps<'div'> & { blur?: boolean }) {
  return (
    <div
      data-slot="backdrop"
      className={cn(
        'absolute inset-0 bg-black/50 transition-opacity hover:bg-black/60',
        blur && 'backdrop-blur-sm',
        className
      )}
      {...props}
    />
  )
}

export { Backdrop }
