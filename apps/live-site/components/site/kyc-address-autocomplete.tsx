'use client'

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react'
import { Input } from '@/components/ui/input'
import {
  suggestionFromFeature,
  type AddressSuggestion,
  type GeoapifyAutocompleteResponse,
} from '@/lib/lumen/geoapify-address'
import { cn } from '@/lib/utils'

const DEBOUNCE_MS = 280

async function fetchSuggestions(text: string): Promise<AddressSuggestion[]> {
  const res = await fetch(`/api/geoapify/autocomplete?text=${encodeURIComponent(text)}`)
  if (!res.ok) return []
  const data = (await res.json()) as GeoapifyAutocompleteResponse
  return (data.features ?? []).map(suggestionFromFeature)
}

/**
 * Address field with Geoapify autocomplete — credit-card KYC only.
 * Selecting a hit fills street, city, state, and postal code.
 */
export function KycAddressAutocomplete({
  value,
  onChange,
  onSelect,
  className,
  placeholder = 'Street address',
  'aria-label': ariaLabel = 'Address',
}: {
  value: string
  onChange: (value: string) => void
  onSelect: (suggestion: AddressSuggestion) => void
  className?: string
  placeholder?: string
  'aria-label'?: string
}) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<AddressSuggestion[]>([])
  const [active, setActive] = useState(-1)
  const skipFetchRef = useRef(false)

  useEffect(() => {
    if (skipFetchRef.current) {
      skipFetchRef.current = false
      return
    }
    const query = value.trim()
    if (query.length < 2) {
      setItems([])
      setOpen(false)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    const timer = window.setTimeout(() => {
      void fetchSuggestions(query).then((next) => {
        if (cancelled) return
        setItems(next)
        setOpen(next.length > 0)
        setActive(-1)
        setLoading(false)
      })
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [value])

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (rootRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [])

  const pick = useCallback(
    (item: AddressSuggestion) => {
      skipFetchRef.current = true
      onSelect(item)
      setItems([])
      setOpen(false)
      setActive(-1)
    },
    [onSelect],
  )

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open || items.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => (i + 1) % items.length)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1))
      return
    }
    if (event.key === 'Enter' && active >= 0) {
      event.preventDefault()
      const item = items[active]
      if (item) pick(item)
      return
    }
    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <Input
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        onFocus={() => {
          if (items.length > 0) setOpen(true)
        }}
        onKeyDown={onKeyDown}
        autoComplete="off"
        placeholder={placeholder}
        className={className}
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open}
        role="combobox"
      />
      {open && items.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className={cn(
            'absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-56 overflow-y-auto',
            'rounded-lg border border-input bg-popover py-1 shadow-[0_0_16px_rgba(0,0,0,0.12)]',
          )}
        >
          {items.map((item, index) => (
            <li key={item.id} role="option" aria-selected={index === active}>
              <button
                type="button"
                className={cn(
                  'flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm transition-colors',
                  index === active ? 'bg-accent text-foreground' : 'text-foreground hover:bg-accent',
                )}
                onMouseEnter={() => setActive(index)}
                onClick={() => pick(item)}
              >
                <span className="line-clamp-2 font-medium leading-5">{item.label}</span>
                {item.addressLine1 && item.addressLine1 !== item.label ? (
                  <span className="text-xs text-muted-foreground">{item.addressLine1}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {loading && value.trim().length >= 2 && !open ? (
        <p className="mt-1 text-[11px] text-muted-foreground">Searching addresses…</p>
      ) : null}
    </div>
  )
}
