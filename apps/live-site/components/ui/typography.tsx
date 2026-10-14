import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

const SHAPE = {
  xxs: 'text-[10px] leading-[14px]',
  xs: 'text-xs leading-4',
  small: 'text-sm leading-5',
  paragraph: 'text-base leading-6',
  base: 'text-base leading-6',
  lead: 'text-xl leading-7',
  h4: 'text-xl font-semibold leading-7',
  h3: 'text-2xl font-semibold leading-8',
  h2: 'text-3xl font-bold leading-9',
  h1: 'text-4xl font-bold leading-tight',
} as const

const VARIANT = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  primary: 'text-primary',
} as const

const WEIGHT = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const

export type TypographyShape = keyof typeof SHAPE
export type TypographyVariant = keyof typeof VARIANT
export type TypographyWeight = keyof typeof WEIGHT

function Typography({
  className,
  shape = 'paragraph',
  variant = 'default',
  weight = 'normal',
  as,
  asChild = false,
  ...props
}: React.ComponentProps<'p'> & {
  shape?: TypographyShape
  variant?: TypographyVariant
  weight?: TypographyWeight
  as?: React.ElementType
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : as ?? 'p'
  return (
    <Comp
      data-slot="typography"
      className={cn(SHAPE[shape], VARIANT[variant], WEIGHT[weight], className)}
      {...props}
    />
  )
}

export { Typography }
