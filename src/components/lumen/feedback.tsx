import type { ReactNode } from 'react';
import { Button } from './index';

/* ------------------------------------------------------------------ Alert */
export type AlertTone = 'default' | 'info' | 'success' | 'warning' | 'destructive';

export function Alert({ tone = 'default', title, children }: { tone?: AlertTone; title: string; children?: ReactNode }) {
  const t = {
    default: 'border-border bg-card text-card-foreground',
    info: 'border-info bg-card text-foreground',
    success: 'border-success bg-card text-foreground',
    warning: 'border-warning bg-card text-foreground',
    destructive: 'border-destructive bg-card text-foreground',
  }[tone];
  const dot = { default: 'bg-muted-foreground', info: 'bg-info', success: 'bg-success', warning: 'bg-warning', destructive: 'bg-destructive' }[tone];
  return (
    <div role="alert" className={`flex w-full max-w-md gap-3 rounded-lg border p-4 ${t}`}>
      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} aria-hidden />
      <div className="flex flex-col gap-1">
        <strong className="text-sm font-semibold">{title}</strong>
        {children ? <p className="text-sm text-muted-foreground">{children}</p> : null}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- Dialog shells */
export function Dialog({ title, description, children, footer }: { title: string; description?: string; children?: ReactNode; footer?: ReactNode }) {
  return (
    <div className="relative grid min-h-64 w-full place-items-center rounded-lg bg-surface-muted-3 p-6">
      <div role="dialog" aria-modal className="w-full max-w-md rounded-lg border border-border bg-popover p-6 text-popover-foreground shadow-lg">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        {children ? <div className="mt-4">{children}</div> : null}
        {footer ? <div className="mt-6 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}

export function AlertDialog({ title, description, confirm = 'Continue', cancel = 'Cancel', destructive }: { title: string; description: string; confirm?: string; cancel?: string; destructive?: boolean }) {
  return (
    <Dialog
      title={title}
      description={description}
      footer={
        <>
          <Button variant="outline">{cancel}</Button>
          <Button variant={destructive ? 'destructive' : 'primary'}>{confirm}</Button>
        </>
      }
    />
  );
}

export function Sheet({ side = 'right', title, children }: { side?: 'right' | 'left' | 'bottom'; title: string; children?: ReactNode }) {
  const pos = side === 'right' ? 'right-0 top-0 h-full w-80' : side === 'left' ? 'left-0 top-0 h-full w-80' : 'bottom-0 left-0 w-full';
  return (
    <div className="relative h-80 w-full overflow-hidden rounded-lg bg-surface-muted-3">
      <aside className={`absolute ${pos} flex flex-col gap-3 border-border bg-popover p-5 text-popover-foreground shadow-lg`}>
        <h2 className="text-base font-semibold">{title}</h2>
        <div className="text-sm text-muted-foreground">{children}</div>
      </aside>
    </div>
  );
}

export function Drawer({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="relative h-80 w-full overflow-hidden rounded-lg bg-surface-muted-3">
      <section className="absolute bottom-0 left-0 w-full rounded-t-xl border-t border-border bg-popover p-5 text-popover-foreground shadow-lg">
        <span className="mx-auto mb-3 block h-1.5 w-12 rounded-full bg-muted" aria-hidden />
        <h2 className="text-base font-semibold">{title}</h2>
        <div className="mt-2 text-sm text-muted-foreground">{children}</div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------- Progress & loading */
export function Progress({ value, tone = 'primary', label }: { value: number; tone?: 'primary' | 'success' | 'vip'; label?: string }) {
  const bar = { primary: 'bg-primary', success: 'bg-success', vip: 'bg-vip-rewards' }[tone];
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="flex w-full max-w-sm flex-col gap-1">
      {label ? (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span>{v}%</span>
        </div>
      ) : null}
      <div role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${bar} transition-all`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

export function Skeleton({ className = 'h-4 w-40' }: { className?: string }) {
  return <span className={`block animate-pulse rounded-md bg-muted ${className}`} aria-hidden />;
}

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-10 w-10 border-4' }[size];
  return <span role="status" aria-label="Loading" className={`inline-block animate-spin rounded-full border-muted border-t-primary ${s}`} />;
}

export function Shimmer({ className = 'h-24 w-64' }: { className?: string }) {
  return <span className={`lm-shimmer block rounded-lg bg-muted ${className}`} aria-hidden />;
}

/* ------------------------------------------------------------- Tooltip etc */
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}

export function DotBadge({ tone = 'primary', children }: { tone?: 'primary' | 'live' | 'success' | 'warning'; children: ReactNode }) {
  const t = { primary: 'bg-primary', live: 'bg-live', success: 'bg-success', warning: 'bg-warning' }[tone];
  return (
    <span className="relative inline-flex">
      {children}
      <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${t}`} aria-hidden />
    </span>
  );
}

export function Toast({ title, description, tone = 'default' }: { title: string; description?: string; tone?: 'default' | 'success' | 'destructive' }) {
  const edge = { default: 'border-l-primary', success: 'border-l-success', destructive: 'border-l-destructive' }[tone];
  return (
    <div className={`flex w-80 items-start gap-3 rounded-lg border border-border border-l-4 bg-popover p-4 text-popover-foreground shadow-lg ${edge}`}>
      <div className="flex-1">
        <strong className="text-sm font-semibold">{title}</strong>
        {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <button type="button" className="text-xs text-muted-foreground hover:text-foreground" aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}

export function HoverCard({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {trigger}
      <span className="absolute left-0 top-full z-10 mt-2 w-64 rounded-lg border border-border bg-popover p-3 text-sm text-popover-foreground opacity-0 shadow-lg transition group-hover:opacity-100">
        {children}
      </span>
    </span>
  );
}

export function Popover({ trigger, children, open = true }: { trigger: ReactNode; children: ReactNode; open?: boolean }) {
  return (
    <span className="relative inline-flex">
      {trigger}
      {open ? (
        <span className="absolute left-0 top-full z-10 mt-2 w-64 rounded-lg border border-border bg-popover p-3 text-sm text-popover-foreground shadow-lg">{children}</span>
      ) : null}
    </span>
  );
}
