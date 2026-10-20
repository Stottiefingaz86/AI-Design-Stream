'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IconUser } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

const ROULETTE_REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36])
const ROULETTE_NUMBERS = Array.from({ length: 37 }, (_, i) => i)
const BACCARAT_OPTIONS = ['B', 'B', 'P', 'B', 'P', 'T', 'P', 'B'] as const

const CHIP_SPRING = { type: 'spring' as const, stiffness: 500, damping: 30, mass: 0.8 }

function rouletteTone(num: number) {
  if (num === 0) return 'bg-[#388e3c]'
  if (ROULETTE_REDS.has(num)) return 'bg-[#b71c1c]'
  return 'bg-[#171717]'
}

/** Deterministic starter spin history so shelves don't all match. */
export function seedRouletteResults(seed: number): number[] {
  const base = [8, 20, 13, 0, 10, 32, 5, 19, 36, 2, 14, 7, 28, 11, 3, 26, 15, 4, 22, 17]
  const offset = (seed * 3) % base.length
  return Array.from({ length: 5 }, (_, i) => base[(offset + i) % base.length])
}

export function seedBaccaratResults(seed: number): string[] {
  const base = ['B', 'B', 'P', 'B', 'P', 'T', 'P', 'B', 'B', 'P', 'B', 'P']
  const offset = (seed * 2) % base.length
  return Array.from({ length: 5 }, (_, i) => base[(offset + i) % base.length])
}

/** BOL-style live roulette history — new result enters left, oldest exits. */
export function RouletteHistory({
  results: initialResults,
  className,
}: {
  results: number[]
  className?: string
}) {
  const [items, setItems] = useState(() => initialResults.map((num, i) => ({ id: i, num })))
  const nextId = useRef(initialResults.length)

  useEffect(() => {
    const delay = 3000 + Math.random() * 5000
    const interval = setInterval(() => {
      const newNum = ROULETTE_NUMBERS[Math.floor(Math.random() * ROULETTE_NUMBERS.length)]!
      nextId.current += 1
      setItems((prev) => [{ id: nextId.current, num: newNum }, ...prev].slice(0, 5))
    }, delay)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={cn('flex items-center gap-0.5 overflow-hidden', className)}>
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item) => (
          <motion.span
            key={item.id}
            initial={{ scale: 0, opacity: 0, width: 0 }}
            animate={{ scale: 1, opacity: 1, width: 18 }}
            exit={{ scale: 0, opacity: 0, width: 0 }}
            transition={CHIP_SPRING}
            className={cn(
              'inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-medium text-white',
              rouletteTone(item.num),
            )}
          >
            {item.num}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}

/** BOL-style baccarat B / P / T chips with live updates. */
export function BaccaratHistory({
  results: initialResults,
  className,
}: {
  results: string[]
  className?: string
}) {
  const [items, setItems] = useState(() => initialResults.map((result, i) => ({ id: i, result })))
  const nextId = useRef(initialResults.length)

  useEffect(() => {
    const delay = 3000 + Math.random() * 5000
    const interval = setInterval(() => {
      const newResult = BACCARAT_OPTIONS[Math.floor(Math.random() * BACCARAT_OPTIONS.length)]!
      nextId.current += 1
      setItems((prev) => [{ id: nextId.current, result: newResult }, ...prev].slice(0, 5))
    }, delay)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={cn('flex items-center gap-0.5 overflow-hidden', className)}>
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item) => (
          <motion.span
            key={item.id}
            initial={{ scale: 0, opacity: 0, width: 0 }}
            animate={{ scale: 1, opacity: 1, width: 18 }}
            exit={{ scale: 0, opacity: 0, width: 0 }}
            transition={CHIP_SPRING}
            className={cn(
              'inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white',
              item.result === 'B' && 'bg-[#b71c1c]',
              item.result === 'P' && 'bg-[#1565c0]',
              item.result === 'T' && 'bg-[#388e3c]',
            )}
          >
            {item.result}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function BlackjackSeats({
  occupied,
  total,
  className,
}: {
  occupied: number
  total: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 backdrop-blur-sm',
        className,
      )}
    >
      <IconUser className="size-3 text-white/70" strokeWidth={2} />
      <span className="text-[10px] font-semibold text-white">
        {occupied}/{total}
      </span>
    </div>
  )
}
