'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface GameInputProps {
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'textarea'
}

export function GameInput({ label, placeholder, value, onChange, type = 'text' }: GameInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm text-white/80">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-4 py-3 bg-black border-2 border-white focus:outline-none focus:bg-white focus:text-black transition-colors resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-black border-2 border-white focus:outline-none focus:bg-white focus:text-black transition-colors"
        />
      )}
    </div>
  )
}
