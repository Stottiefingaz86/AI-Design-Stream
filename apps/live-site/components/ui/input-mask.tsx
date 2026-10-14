'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type Replacement = Record<string, RegExp>

function applyMask(raw: string, mask: string, replacement: Replacement) {
  const digits = raw.replace(/\D+/g, '')
  let di = 0
  let out = ''
  for (const ch of mask) {
    const rule = replacement[ch]
    if (rule) {
      if (di >= digits.length) break
      const next = digits[di]
      if (!rule.test(next)) break
      out += next
      di += 1
    } else {
      out += ch
    }
  }
  return out
}

export function InputMask({
  mask = '(___) ___-____',
  placeholder,
  replacement = { _: /\d/ },
  size = 'md',
  className,
  value,
  defaultValue,
  onChange,
  ...props
}: Omit<React.ComponentProps<typeof Input>, 'size'> & {
  mask?: string
  replacement?: Replacement
  size?: 'sm' | 'md' | 'lg'
}) {
  const [inner, setInner] = React.useState(String(defaultValue ?? value ?? ''))

  React.useEffect(() => {
    if (value !== undefined) setInner(String(value))
  }, [value])

  return (
    <Input
      {...props}
      value={inner}
      placeholder={placeholder ?? mask}
      className={cn(
        size === 'sm' && 'h-8 text-sm',
        size === 'md' && 'h-10',
        size === 'lg' && 'h-11',
        'font-mono tracking-wider',
        className
      )}
      onChange={(e) => {
        const next = applyMask(e.target.value, mask, replacement)
        setInner(next)
        onChange?.({ ...e, target: { ...e.target, value: next } })
      }}
    />
  )
}
