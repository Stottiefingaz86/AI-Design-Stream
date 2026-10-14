'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AgencyCardProps {
  title: string
  rationale?: string
  children?: ReactNode
  approved?: boolean
  onApprove?: () => void
  showApprove?: boolean
  className?: string
}

export function AgencyCard({
  title,
  rationale,
  children,
  approved = false,
  onApprove,
  showApprove = true,
  className = '',
}: AgencyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-6 border border-white transition-all ${
        approved
          ? 'border-white bg-white/10'
          : 'border-white/20 hover:border-white/40'
      } ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        {approved && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 border-2 border-white flex items-center justify-center flex-shrink-0 ml-4"
          >
            <span className="text-white text-xs font-bold">✓</span>
          </motion.div>
        )}
      </div>

      {rationale && (
        <div className="mb-4">
          <div className="text-xs text-white/60 mb-2">Why this works:</div>
          <p className="text-sm text-white/80 leading-relaxed">
            {rationale}
          </p>
        </div>
      )}

      {children}

      {showApprove && !approved && onApprove && (
        <motion.button
          onClick={onApprove}
          className="mt-6 px-6 py-2 text-sm border border-white hover:bg-white/10 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Approve & Continue
        </motion.button>
      )}
    </motion.div>
  )
}
