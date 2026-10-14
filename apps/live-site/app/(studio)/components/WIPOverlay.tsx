'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { KanbanBoard, WIPItem } from './KanbanBoard'

interface WIPOverlayProps {
  isOpen: boolean
  onClose: () => void
  currentRequest?: {
    area: string
    what: string
    deadline: string
    priority: 'high' | 'medium' | 'low'
    status: 'todo' | 'in_progress' | 'done'
  }
  designer: string | null
}

export function WIPOverlay({ isOpen, onClose, currentRequest, designer }: WIPOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-[9998] backdrop-blur-sm"
          />
          
          {/* Overlay Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-4 z-[9999] bg-background border border-white/10 rounded-xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div>
                <h2 className="text-white text-2xl font-bold sf-title">Current WIP</h2>
                <p className="text-white/40 text-sm mt-1">
                  {designer ? `${designer}'s work in progress` : 'Work in progress'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="neu-soft rounded-lg px-4 py-2 text-white/80 hover:text-white hover:neu-inset transition-all text-sm"
              >
                Close
              </button>
            </div>

            {/* Kanban Board Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {currentRequest && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 neu-inset rounded-lg border border-white/10"
                >
                  <div className="text-white/60 text-xs uppercase tracking-wider mb-2">
                    Current Request
                  </div>
                  <div className="text-white text-lg font-medium mb-1">
                    {currentRequest.what || 'New Request'}
                  </div>
                  <div className="flex items-center gap-4 text-white/40 text-sm mt-2">
                    <span className="uppercase">{currentRequest.area}</span>
                    <span>•</span>
                    <span>{currentRequest.deadline}</span>
                    <span>•</span>
                    <span className="uppercase">{currentRequest.priority} Priority</span>
                  </div>
                </motion.div>
              )}
              
              <KanbanBoard 
                designer={designer}
                currentRequest={currentRequest}
                onItemClick={(item) => {
                  console.log('Clicked WIP item:', item)
                }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
