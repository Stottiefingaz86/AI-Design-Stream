'use client'

import { motion } from 'framer-motion'
import { ReactNode, useState } from 'react'

interface ChatInputProps {
  children?: ReactNode
  show: boolean
  onSubmit?: (value: string) => void
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  type?: 'text' | 'textarea'
  showButton?: boolean
}

export function ChatInput({ 
  children, 
  show, 
  onSubmit, 
  placeholder, 
  value: externalValue,
  onChange: externalOnChange,
  type = 'text',
  showButton = false 
}: ChatInputProps) {
  const [internalValue, setInternalValue] = useState('')
  
  // Use external value if provided, otherwise use internal state
  const value = externalValue !== undefined ? externalValue : internalValue
  const setValue = externalOnChange || setInternalValue

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit && value?.trim()) {
      onSubmit(value.trim())
    }
  }

  const handleChange = (newValue: string) => {
    setValue(newValue)
  }

  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Message/content above input */}
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 text-white/80 text-sm font-light"
        >
          {children}
        </motion.div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="neu-soft rounded-xl p-3 flex items-end gap-2">
          {type === 'textarea' ? (
            <textarea
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              rows={2}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 resize-none text-sm font-light focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
          ) : (
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 text-sm font-light focus:outline-none"
            />
          )}
          {showButton && (
            <motion.button
              type="submit"
              disabled={!value?.trim()}
              className="px-4 py-2 neu-flat rounded-lg hover:neu-inset transition-all disabled:opacity-30 disabled:cursor-not-allowed font-light text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              →
            </motion.button>
          )}
        </div>
      </form>
    </motion.div>
  )
}
