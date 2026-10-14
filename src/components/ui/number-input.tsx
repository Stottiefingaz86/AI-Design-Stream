import { MinusIcon, PlusIcon } from 'lucide-react'
import { useState, type ComponentProps } from 'react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function NumberInput({
  className,
  value,
  defaultValue = 0,
  min,
  max,
  step = 1,
  disabled,
  onValueChange,
  ...props
}: Omit<ComponentProps<'input'>, 'type' | 'onChange' | 'value' | 'defaultValue'> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
}) {
  const [internal, setInternal] = useState(defaultValue)
  const current = value ?? internal

  const commit = (next: number) => {
    const clamped = Math.min(max ?? next, Math.max(min ?? next, next))
    if (value === undefined) setInternal(clamped)
    onValueChange?.(clamped)
  }

  return (
    <div data-slot="number-input" className={cn('inline-flex items-center gap-1', className)}>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={disabled || (min !== undefined && current <= min)}
        onClick={() => commit(current - step)}
        aria-label="Decrease"
      >
        <MinusIcon />
      </Button>
      <Input
        type="number"
        className="w-20 text-center"
        value={current}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => commit(Number(e.target.value))}
        {...props}
      />
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={disabled || (max !== undefined && current >= max)}
        onClick={() => commit(current + step)}
        aria-label="Increase"
      >
        <PlusIcon />
      </Button>
    </div>
  )
}

export { NumberInput }
