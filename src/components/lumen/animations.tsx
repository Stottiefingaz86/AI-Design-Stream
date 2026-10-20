import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

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

const BRAND_TONES = ['bg-primary', 'bg-success', 'bg-warning', 'bg-info', 'bg-vip-rewards', 'bg-featured'];

const CHART_VARS = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'] as const;
const BRAND_VARS = ['--primary', '--success', '--warning', '--info', '--vip-rewards', '--featured'] as const;

function tokenColors(vars: readonly string[]): string[] {
  const styles = getComputedStyle(document.documentElement);
  return vars
    .map((name) => {
      const raw = styles.getPropertyValue(name).trim();
      if (raw.startsWith('#')) return raw;
      const probe = document.createElement('span');
      probe.style.color = `var(${name})`;
      document.body.appendChild(probe);
      const computed = getComputedStyle(probe).color;
      probe.remove();
      return computed;
    })
    .filter((c) => c && c !== 'rgba(0, 0, 0, 0)');
}

export type ConfettiHandle = { fire: () => void };

export type ConfettiProps = {
  area?: 'parent' | 'viewport';
  duration?: number;
  palette?: 'chart' | 'brand';
  particleCount?: number;
  className?: string;
};

/** Lumen Confetti — canvas burst. Call `ref.fire()`. Overlay only; parent must be `relative`. */
export const Confetti = forwardRef<ConfettiHandle, ConfettiProps>(function Confetti(
  { area = 'parent', duration = 2.5, palette = 'chart', particleCount = 80, className },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useRef<confetti.CreateTypes | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    engine.current = confetti.create(canvas, { resize: true, useWorker: false });
    return () => {
      engine.current?.reset();
      engine.current = null;
    };
  }, []);

  const fire = () => {
    const colors = tokenColors(palette === 'chart' ? CHART_VARS : BRAND_VARS);
    const ticks = Math.round(duration * 60);
    const shoot = (origin: { x: number; y: number }, count: number, angle: number) =>
      engine.current?.({
        particleCount: count,
        angle,
        spread: 68,
        startVelocity: 42,
        ticks,
        gravity: 0.85,
        decay: 0.92,
        scalar: 0.95,
        colors,
        origin,
        disableForReducedMotion: true,
      });
    const y = area === 'viewport' ? 0.25 : 0.15;
    const half = Math.max(8, Math.round(particleCount / 2));
    shoot({ x: 0.28, y }, half, 75);
    shoot({ x: 0.72, y }, half, 105);
  };

  useImperativeHandle(ref, () => ({ fire }), [area, duration, palette, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        'pointer-events-none',
        area === 'viewport' ? 'fixed inset-0 z-50' : 'absolute inset-0 size-full',
        className,
      )}
    />
  );
});

export function ParticleBurst({
  count = 16,
  playing = true,
  children,
}: {
  count?: number;
  playing?: boolean;
  children?: ReactNode;
}) {
  if (!playing) return <>{children}</>;
  return (
    <span className="relative inline-flex">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className={`lm-particle pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 rounded-full ${BRAND_TONES[i % BRAND_TONES.length]}`}
          style={{ ['--lm-angle' as string]: `${(360 / count) * i}deg`, animationDelay: `${(i % 4) * 0.05}s` }}
        />
      ))}
      <span className="relative">{children}</span>
    </span>
  );
}
