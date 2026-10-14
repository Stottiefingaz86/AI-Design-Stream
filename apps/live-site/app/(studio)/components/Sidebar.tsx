'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface SidebarProps {
  children: ReactNode
  title?: string
}

export function Sidebar({ children, title }: SidebarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="w-96 border-l border-white/5 bg-background h-full overflow-y-auto"
      style={{ zIndex: 40 }}
    >
      <div className="p-6 space-y-6">
        {title && (
          <h2 className="text-white/40 text-xs uppercase tracking-wider font-light mb-6">
            {title}
          </h2>
        )}
        {children}
      </div>
    </motion.div>
  )
}
