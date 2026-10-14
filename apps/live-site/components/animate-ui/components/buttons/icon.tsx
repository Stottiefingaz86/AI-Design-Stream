'use client'

import * as React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface IconButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg'
}

const iconButtonVariants = {
  variant: {
    default: 'bg-white/10 hover:bg-white/20 text-white',
    ghost: 'hover:bg-white/10 text-white/70 hover:text-white',
    outline: 'border border-white/20 hover:border-white/40 text-white/70 hover:text-white',
  },
  size: {
    default: 'h-10 w-10',
    sm: 'h-8 w-8',
    lg: 'h-12 w-12',
  },
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-small transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50',
          iconButtonVariants.variant[variant],
          iconButtonVariants.size[size],
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)
IconButton.displayName = 'IconButton'
