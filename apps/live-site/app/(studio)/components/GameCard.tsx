'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GameCardProps {
  title: string
  children: ReactNode
  onApprove?: () => void
  approved?: boolean
  rationale?: string
}

export function GameCard({ title, children, onApprove, approved = false, rationale }: GameCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-6 border-2 border-white bg-black"
    >
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      {children}
      {rationale && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="text-xs text-white/60 mb-1">Why this works:</div>
          <p className="text-sm text-white/80">{rationale}</p>
        </div>
      )}
      {onApprove && !approved && (
        <motion.button
          onClick={onApprove}
          className="mt-6 w-full py-3 border-2 border-white hover:bg-white hover:text-black transition-colors font-semibold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Approve & Continue
        </motion.button>
      )}
      {approved && (
        <div className="mt-4 text-center text-white/60">✓ Approved</div>
      )}
    </motion.div>
  )
}
