'use client'

import { motion } from 'framer-motion'
import { useStudioStore } from '@/lib/store/studioStore'
import { fadeIn } from '@/lib/motion/transitions'

export function DeliverablesVault() {
  const brandSystem = useStudioStore((state) => state.brandSystem)

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Deliverables Vault</h2>
        <p className="text-white/60">Your complete brand book is ready</p>
      </div>

      {brandSystem && (
        <div className="space-y-6">
          {/* Brand Book PDF */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 border-2 border-white text-center"
          >
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-bold mb-2">Brand Book PDF</h3>
            <p className="text-white/60 mb-6">
              Complete brand guidelines, strategy, and identity system
            </p>
            <motion.button
              onClick={() => {
                // TODO: Implement PDF generation
                alert('PDF download will be implemented here')
              }}
              className="px-8 py-4 border-2 border-white hover:bg-white hover:text-black transition-colors font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Download Brand Book
            </motion.button>
          </motion.div>

          {/* Asset Pack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 border border-white/20"
          >
            <h3 className="text-lg font-bold mb-4">Asset Pack</h3>
            <div className="space-y-2 text-sm text-white/60">
              <div>• Logo files (SVG, PNG)</div>
              <div>• Color palette swatches</div>
              <div>• Typography files</div>
              <div>• Messaging examples</div>
              <div>• Visual system guidelines</div>
            </div>
            <motion.button
              onClick={() => {
                // TODO: Implement asset pack download
                alert('Asset pack download will be implemented here')
              }}
              className="mt-4 px-6 py-2 border border-white/20 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Download Assets
            </motion.button>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
