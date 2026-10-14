import { useState, type CSSProperties, type ReactNode } from 'react';

/** Keyframes live in src/styles/lumen.css (.lm-shimmer, .lm-spotlight, .lm-confetti, .lm-particle, .lm-slide). */

export function Shimmer({
  className = '',
  active = true,
  tint = 'foreground',
  trigger = 'always',
  children,
}: {
  className?: string;
  active?: boolean;
  tint?: 'foreground' | 'primary' | 'muted';
  trigger?: 'hover' | 'always';
  children?: ReactNode;
}) {
  if (!children) {
    return <span className={`lm-shimmer block rounded-lg bg-muted ${className || 'h-24 w-64'}`} aria-hidden />;
  }
  return (
    <span
      data-slot="shimmer"
      data-active={active || undefined}
      data-tint={tint}
      data-trigger={trigger}
      className={`lm-shimmer-wrap ${className}`}
    >
      {children}
    </span>
  );
}

export function Spotlight({ children }: { children: ReactNode }) {
  return (
    <div className="lm-spotlight relative overflow-hidden rounded-lg border border-border bg-card p-6 text-card-foreground">
      <span className="lm-spotlight__beam pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative">{children}</div>
    </div>
  );
}

/** Tab underline that slides between items (sport tabs, segmented controls). */
export function SlidingIndicator({
  items,
  initial = 0,
  variant = 'segmented',
}: {
  items: string[];
  initial?: number;
  variant?: 'segmented' | 'pills' | 'underline';
}) {
  const [i, setI] = useState(initial);
  if (variant === 'underline') {
    return (
      <div className="relative inline-flex gap-1 border-b border-border">
        {items.map((it, idx) => (
          <button
            key={it}
            type="button"
            onClick={() => setI(idx)}
            className={`relative h-9 px-3 text-sm font-medium transition hover:text-foreground ${idx === i ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            {it}
            {idx === i ? <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" /> : null}
          </button>
        ))}
      </div>
    );
  }
  if (variant === 'pills') {
    return (
      <div className="relative inline-flex rounded-3xl bg-muted p-0.5">
        <span
          className="lm-slide-pill absolute bottom-0.5 top-0.5 rounded-2xl bg-primary shadow-sm"
          style={{ width: `calc((100% - 0.25rem) / ${items.length})`, left: `calc(0.125rem + (100% - 0.25rem) / ${items.length} * ${i})` }}
          aria-hidden
        />
        {items.map((it, idx) => (
          <button
            key={it}
            type="button"
            onClick={() => setI(idx)}
            className={`relative z-10 h-9 flex-1 px-4 text-xs font-medium transition ${idx === i ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {it}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="relative inline-flex rounded-md bg-muted p-1">
      <span className="lm-slide absolute bottom-1 top-1 rounded bg-card shadow-sm" style={{ width: `calc((100% - 0.5rem) / ${items.length})`, left: `calc(0.25rem + (100% - 0.5rem) / ${items.length} * ${i})` }} aria-hidden />
      {items.map((it, idx) => (
        <button key={it} type="button" onClick={() => setI(idx)} className={`relative z-10 h-8 flex-1 px-4 text-sm font-medium transition hover:text-foreground ${idx === i ? 'text-foreground' : 'text-muted-foreground'}`}>
          {it}
        </button>
      ))}
    </div>
  );
}

export function ShimmerText({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`lm-shimmer-text font-bold ${className}`}>{children}</span>;
}

export function TileShimmer({ className = '' }: { className?: string }) {
  return <span className={`lm-tile-shimmer pointer-events-none absolute inset-0 ${className}`} aria-hidden />;
}

const CHART_TONES = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5'];
const BRAND_TONES = ['bg-primary', 'bg-success', 'bg-warning', 'bg-info', 'bg-vip-rewards', 'bg-featured'];

export function Confetti({
  area = 'parent',
  duration = 2.5,
  palette = 'chart',
  particleCount = 80,
  children,
}: {
  area?: 'parent' | 'viewport';
  duration?: number;
  palette?: 'chart' | 'brand';
  particleCount?: number;
  children?: ReactNode;
}) {
  const tones = palette === 'chart' ? CHART_TONES : BRAND_TONES;
  const layer = area === 'viewport' ? 'fixed inset-0 z-50' : 'absolute inset-0';
  return (
    <div className="relative grid h-56 w-full place-items-center overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
      {Array.from({ length: particleCount }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className={`lm-confetti ${layer} top-0 h-2 w-1.5 rounded-sm ${tones[i % tones.length]}`}
          style={
            {
              left: `${(i * 97) % 100}%`,
              position: area === 'viewport' ? 'fixed' : 'absolute',
              animationDelay: `${(i % 10) * 0.08}s`,
              animationDuration: `${duration}s`,
            } as CSSProperties
          }
        />
      ))}
      <div className="relative text-center">{children ?? <strong className="text-xl font-bold">You won $2,231.30</strong>}</div>
    </div>
  );
}

export function ParticleBurst({ count = 16, children }: { count?: number; children?: ReactNode }) {
  return (
    <div className="relative grid h-56 w-full place-items-center overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
      <span className="relative inline-flex">
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            aria-hidden
            className={`lm-particle absolute left-1/2 top-1/2 h-2 w-2 rounded-full ${BRAND_TONES[i % BRAND_TONES.length]}`}
            style={{ ['--lm-angle' as string]: `${(360 / count) * i}deg`, animationDelay: `${(i % 4) * 0.05}s` }}
          />
        ))}
        <span className="relative">{children ?? <span className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Jackpot!</span>}</span>
      </span>
    </div>
  );
}
