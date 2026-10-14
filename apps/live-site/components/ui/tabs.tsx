'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/index'

const tabsVariants = cva('group/tabs flex gap-2 data-[orientation=horizontal]:flex-col', {
  variants: {
    variant: {
      primary: '',
      default: '',
    },
    shape: {
      solid: '',
      line: '',
    },
  },
  defaultVariants: {
    variant: 'primary',
    shape: 'solid',
  },
})

function Tabs({
  className,
  orientation = 'horizontal',
  variant = 'primary',
  shape = 'solid',
  activationMode = 'automatic',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root> &
  VariantProps<typeof tabsVariants> & {
    shape?: 'solid' | 'line'
  }) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      data-variant={variant}
      data-shape={shape}
      activationMode={activationMode}
      className={cn(tabsVariants({ variant, shape }), className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  'inline-flex items-center justify-center rounded-lg bg-muted p-0.5 text-muted-foreground',
  {
    variants: {
      width: {
        fit: 'w-fit',
        full: 'w-full',
      },
    },
    defaultVariants: {
      width: 'fit',
    },
  }
)

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>
>(({ className, width = 'fit', ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ width }), className)}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all',
      'text-muted-foreground hover:text-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm',
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('mt-2 outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
