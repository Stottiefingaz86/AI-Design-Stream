import { useId, useState, type ReactNode } from 'react';

const control = 'h-4 w-4 shrink-0 rounded border border-input bg-background text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';

/* ------------------------------------------------------------- Field group */
export function Field({ label, hint, error, required, children }: { label: string; hint?: string; error?: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="flex w-64 flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

export function FieldGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
      {title ? <legend className="px-1 text-sm font-semibold">{title}</legend> : null}
      {children}
    </fieldset>
  );
}

/* --------------------------------------------------------------- Checkbox */
export function Checkbox({ label, checked, disabled, onChange }: { label: string; checked?: boolean; disabled?: boolean; onChange?: (v: boolean) => void }) {
  const id = useId();
  return (
    <label htmlFor={id} className={`inline-flex items-center gap-2 text-sm ${disabled ? 'opacity-50' : ''}`}>
      <input id={id} type="checkbox" className={`${control} accent-primary`} checked={checked} disabled={disabled} onChange={(e) => onChange?.(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function Radio({ name, options, value, onChange }: { name: string; options: { value: string; label: string; disabled?: boolean }[]; value?: string; onChange?: (v: string) => void }) {
  return (
    <div role="radiogroup" className="flex flex-col gap-2">
      {options.map((o) => (
        <label key={o.value} className={`inline-flex items-center gap-2 text-sm ${o.disabled ? 'opacity-50' : ''}`}>
          <input type="radio" name={name} className={`${control} rounded-full accent-primary`} checked={value === o.value} disabled={o.disabled} onChange={() => onChange?.(o.value)} />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}

export function Switch({ label, checked = false, disabled, onChange }: { label?: string; checked?: boolean; disabled?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <label className={`inline-flex items-center gap-2 text-sm ${disabled ? 'opacity-50' : ''}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${checked ? 'bg-primary' : 'bg-input'}`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-background shadow transition ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
      {label ? <span>{label}</span> : null}
    </label>
  );
}

export function Toggle({ children, pressed, onPressedChange, disabled }: { children: ReactNode; pressed?: boolean; onPressedChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={() => onPressedChange?.(!pressed)}
      className={`inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition hover:bg-accent disabled:opacity-50 ${pressed ? 'bg-accent text-accent-foreground' : 'bg-transparent text-foreground'}`}
    >
      {children}
    </button>
  );
}

export function ToggleGroup({ items, value, onChange }: { items: { value: string; label: ReactNode }[]; value?: string; onChange?: (v: string) => void }) {
  return (
    <div role="group" className="inline-flex rounded-md border border-border bg-card p-1">
      {items.map((it) => (
        <Toggle key={it.value} pressed={value === it.value} onPressedChange={() => onChange?.(it.value)}>
          {it.label}
        </Toggle>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- Text inputs */
export function Textarea({ placeholder = 'Write something…', rows = 3, disabled, value }: { placeholder?: string; rows?: number; disabled?: boolean; value?: string }) {
  return (
    <textarea
      rows={rows}
      placeholder={placeholder}
      disabled={disabled}
      defaultValue={value}
      className="w-64 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
    />
  );
}

export function Select({ options, value, placeholder = 'Select…', disabled }: { options: string[]; value?: string; placeholder?: string; disabled?: boolean }) {
  return (
    <select
      defaultValue={value ?? ''}
      disabled={disabled}
      className="h-10 w-64 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

export function Combobox({ options, placeholder = 'Search…', open = true }: { options: string[]; placeholder?: string; open?: boolean }) {
  const [q, setQ] = useState('');
  const list = options.filter((o) => o.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="relative w-64">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {open ? (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-popover p-1 text-sm text-popover-foreground shadow-lg">
          {list.length ? list.map((o, i) => <li key={o} className={`rounded px-2 py-1.5 ${i === 0 ? 'bg-accent text-accent-foreground' : 'hover:bg-accent'}`}>{o}</li>) : <li className="px-2 py-1.5 text-muted-foreground">No results</li>}
        </ul>
      ) : null}
    </div>
  );
}

export function InputGroup({ prefix, suffix, placeholder = '0.00' }: { prefix?: ReactNode; suffix?: ReactNode; placeholder?: string }) {
  return (
    <div className="flex h-10 w-64 items-stretch overflow-hidden rounded-md border border-input bg-background text-sm focus-within:ring-2 focus-within:ring-ring">
      {prefix ? <span className="flex items-center border-r border-input bg-muted px-3 text-muted-foreground">{prefix}</span> : null}
      <input className="min-w-0 flex-1 bg-transparent px-3 text-foreground placeholder:text-muted-foreground focus:outline-none" placeholder={placeholder} />
      {suffix ? <span className="flex items-center border-l border-input bg-muted px-3 text-muted-foreground">{suffix}</span> : null}
    </div>
  );
}

export function InputMask({
  mask = '(___) ___-____',
  placeholder = '(555) 000-0000',
  replacement = { _: /\d/ },
  size = 'md',
  value = '',
}: {
  mask?: string
  placeholder?: string
  replacement?: Record<string, RegExp>
  size?: 'sm' | 'md' | 'lg'
  value?: string
}) {
  return (
    <input
      defaultValue={value}
      placeholder={placeholder ?? mask}
      data-size={size}
      className="h-10 w-64 rounded-md border border-input bg-background px-3 font-mono text-sm tracking-wider text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}

export function OTPInput({ length = 6, value = '' }: { length?: number; value?: string }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          maxLength={1}
          defaultValue={value[i] ?? ''}
          inputMode="numeric"
          className={`h-12 w-10 rounded-md border bg-background text-center text-lg font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${i === value.length ? 'border-ring' : 'border-input'}`}
        />
      ))}
    </div>
  );
}

export function FileInput({ label = 'Drop a file or click to upload', hint = 'PNG, JPG up to 5 MB' }: { label?: string; hint?: string }) {
  return (
    <label className="flex w-72 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-input bg-surface-muted-1 p-6 text-center text-sm hover:bg-accent">
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">{hint}</span>
      <input type="file" className="sr-only" />
    </label>
  );
}

export function Slider({ value = 50, min = 0, max = 100, label }: { value?: number; min?: number; max?: number; label?: string }) {
  const [v, setV] = useState(value);
  return (
    <div className="flex w-64 flex-col gap-1 text-xs text-muted-foreground">
      {label ? (
        <div className="flex justify-between">
          <span>{label}</span>
          <span>{v}</span>
        </div>
      ) : null}
      <input type="range" min={min} max={max} value={v} onChange={(e) => setV(Number(e.target.value))} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary" />
    </div>
  );
}

/* ------------------------------------------------------- Calendar / dates */
export function Calendar({ month = 'October 2026', selected = 13 }: { month?: string; selected?: number }) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <div className="w-72 rounded-lg border border-border bg-popover p-3 text-popover-foreground">
      <div className="mb-2 flex items-center justify-between text-sm font-semibold">
        <button type="button" className="rounded px-2 hover:bg-accent" aria-label="Previous month">
          ‹
        </button>
        <span>{month}</span>
        <button type="button" className="rounded px-2 hover:bg-accent" aria-label="Next month">
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
        <span className="col-span-3" />
        {days.map((d) => (
          <button key={d} type="button" className={`h-8 rounded-md text-sm ${d === selected ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'}`}>
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DatePicker({ value = '13 Oct 2026', open = false }: { value?: string; open?: boolean }) {
  return (
    <div className="relative w-64">
      <button type="button" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm text-foreground">
        <span>{value}</span>
        <span className="text-muted-foreground">▾</span>
      </button>
      {open ? (
        <div className="absolute z-10 mt-1">
          <Calendar />
        </div>
      ) : null}
    </div>
  );
}
