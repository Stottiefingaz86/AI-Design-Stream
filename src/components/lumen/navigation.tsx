import { useState, type ReactNode } from 'react';

/* ------------------------------------------------------------ Breadcrumb */
export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {items.map((it, i) => (
        <span key={it} className="inline-flex items-center gap-1.5">
          {i > 0 ? <span aria-hidden>/</span> : null}
          <span className={i === items.length - 1 ? 'font-medium text-foreground' : 'hover:text-foreground'}>{it}</span>
        </span>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------ Pagination */
export function Pagination({ page = 1, pages = 5 }: { page?: number; pages?: number }) {
  const btn = 'inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm transition';
  return (
    <nav aria-label="Pagination" className="inline-flex items-center gap-1">
      <button type="button" className={`${btn} text-muted-foreground hover:bg-accent`} disabled={page === 1}>
        ‹ Prev
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button key={n} type="button" aria-current={n === page || undefined} className={`${btn} ${n === page ? 'border border-border bg-card text-foreground' : 'text-muted-foreground hover:bg-accent'}`}>
          {n}
        </button>
      ))}
      <button type="button" className={`${btn} text-muted-foreground hover:bg-accent`} disabled={page === pages}>
        Next ›
      </button>
    </nav>
  );
}

/* ------------------------------------------------------------------ Tabs */
export function Tabs({ items, value, variant = 'segmented' }: { items: { value: string; label: ReactNode; icon?: ReactNode }[]; value?: string; variant?: 'segmented' | 'underline' | 'pills' }) {
  const [cur, setCur] = useState(value ?? items[0]?.value);
  if (variant === 'pills') {
    return (
      <div role="tablist" className="inline-flex flex-wrap gap-2">
        {items.map((it) => (
          <button key={it.value} role="tab" aria-selected={cur === it.value} type="button" onClick={() => setCur(it.value)} className={`h-9 rounded-full px-4 text-sm font-medium transition ${cur === it.value ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-accent'}`}>
            {it.label}
          </button>
        ))}
      </div>
    );
  }
  if (variant === 'underline') {
    // Sport tabs (PropShopX): icon over label, active = muted bg + primary underline.
    return (
      <div role="tablist" className="inline-flex gap-1 border-b border-border">
        {items.map((it) => (
          <button key={it.value} role="tab" aria-selected={cur === it.value} type="button" onClick={() => setCur(it.value)} className={`relative flex min-w-14 flex-col items-center gap-1 rounded-t-md px-3 py-2 text-xs font-medium transition ${cur === it.value ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {it.icon ? <span className="text-base leading-none">{it.icon}</span> : null}
            <span>{it.label}</span>
            {cur === it.value ? <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" aria-hidden /> : null}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div role="tablist" className="inline-flex rounded-md bg-muted p-1">
      {items.map((it) => (
        <button key={it.value} role="tab" aria-selected={cur === it.value} type="button" onClick={() => setCur(it.value)} className={`h-8 rounded px-3 text-sm font-medium transition ${cur === it.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          {it.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------- Navigation menu */
const DEFAULT_NAV = ['Casino', 'Sports', 'Live Betting', 'Poker', 'Promotions'];

export function NavMenu({
  items = DEFAULT_NAV,
  activeIndex = 0,
  disabledIndex = -1,
  loadingIndex = -1,
  shape = 'solid',
  'aria-label': ariaLabel = 'Main',
}: {
  items?: string[];
  activeIndex?: number;
  disabledIndex?: number;
  loadingIndex?: number;
  shape?: 'solid' | 'ghost';
  'aria-label'?: string;
}) {
  return (
    <nav aria-label={ariaLabel} className="flex items-center gap-1">
      {items.map((it, i) => {
        const active = i === activeIndex;
        const disabled = i === disabledIndex;
        const loading = i === loadingIndex;
        const solid = shape === 'solid';
        return (
          <a
            key={it}
            href="#"
            aria-current={active ? 'page' : undefined}
            aria-disabled={disabled || undefined}
            aria-busy={loading || undefined}
            onClick={(e) => e.preventDefault()}
            className={[
              'inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition',
              disabled ? 'pointer-events-none opacity-50' : '',
              solid
                ? active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-foreground hover:bg-accent'
                : active
                  ? 'text-primary'
                  : 'text-foreground hover:bg-accent',
            ].join(' ')}
          >
            {loading ? (
              <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
            ) : null}
            {it}
          </a>
        );
      })}
    </nav>
  );
}

export const NavigationMenu = NavMenu;

/* -------------------------------------------------------------- Accordion */
export function Accordion({ items, defaultOpen = 0 }: { items: { title: string; body: string }[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="w-full max-w-md divide-y divide-border rounded-lg border border-border bg-card text-card-foreground">
      {items.map((it, i) => (
        <div key={it.title}>
          <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-accent">
            {it.title}
            <span className={`text-muted-foreground transition ${open === i ? 'rotate-180' : ''}`} aria-hidden>
              ⌄
            </span>
          </button>
          {open === i ? <p className="px-4 pb-4 text-sm text-muted-foreground">{it.body}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function Collapsible({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-card p-3 text-card-foreground">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{title}</span>
        <button type="button" onClick={() => setOpen(!open)} className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent">
          {open ? 'Hide' : 'Show'}
        </button>
      </div>
      {open ? <div className="mt-3 text-sm text-muted-foreground">{children}</div> : null}
    </div>
  );
}

/* --------------------------------------------------------- Dropdown menu */
export function DropdownMenu({ label = 'Other', items, open = true }: { label?: string; items: { label: string; shortcut?: string; destructive?: boolean; separator?: boolean }[]; open?: boolean }) {
  return (
    <div className="relative inline-flex">
      <button type="button" className="inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm font-medium text-foreground hover:bg-accent">
        {label} <span className="text-muted-foreground">▾</span>
      </button>
      {open ? (
        <ul role="menu" className="absolute left-0 top-full z-10 mt-1 w-56 rounded-md border border-border bg-popover p-1 text-sm text-popover-foreground shadow-lg">
          {items.map((it, i) =>
            it.separator ? (
              <li key={i} role="separator" className="my-1 h-px bg-border" />
            ) : (
              <li key={it.label} role="menuitem" className={`flex cursor-default items-center justify-between rounded px-2 py-1.5 hover:bg-accent ${it.destructive ? 'text-destructive' : ''}`}>
                <span>{it.label}</span>
                {it.shortcut ? <span className="text-xs text-muted-foreground">{it.shortcut}</span> : null}
              </li>
            ),
          )}
        </ul>
      ) : null}
    </div>
  );
}

export function ScrollArea({ children, className = 'h-40 w-64' }: { children: ReactNode; className?: string }) {
  return <div className={`overflow-auto rounded-md border border-border bg-card p-3 text-sm text-card-foreground ${className}`}>{children}</div>;
}
