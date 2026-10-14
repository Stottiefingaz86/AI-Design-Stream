'use client'

import { motion } from 'framer-motion'
import type { PositioningMap } from '@/lib/agent/schemas'

interface PositioningMapProps {
  map: PositioningMap
}

export function PositioningMapComponent({ map }: PositioningMapProps) {
  return (
    <div className="relative w-full h-[400px] border border-white/20 rounded bg-black p-4">
      {/* Axes */}
      <div className="absolute inset-4">
        {/* Y-axis label (left) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full -rotate-90 origin-center text-xs text-white/60 whitespace-nowrap">
          {map.axisY}
        </div>
        
        {/* X-axis label (bottom) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full text-xs text-white/60 whitespace-nowrap">
          {map.axisX}
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0">
          {/* Vertical center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
          {/* Horizontal center line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
        </div>

        {/* Points */}
        {map.points.map((point, index) => (
          <motion.div
            key={point.name}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="absolute"
            style={{
              left: `${point.x}%`,
              top: `${100 - point.y}%`, // Invert Y for screen coordinates
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative">
              <div className="w-3 h-3 border-2 border-white rounded-full bg-black" />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-white/80 whitespace-nowrap">
                {point.name}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
