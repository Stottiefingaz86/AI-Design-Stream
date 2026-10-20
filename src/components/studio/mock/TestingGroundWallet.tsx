'use client';

import { Component, useEffect, useState, type ReactNode } from 'react';
import { useShell } from '../../../../apps/live-site/components/site/shell-context';
import { CasinoProductShell } from './CasinoProductShell';
import { cn } from '@/lib/utils';

class GroundErrorBoundary extends Component<{ children: ReactNode }, { err: string | null }> {
  state = { err: null as string | null };

  static getDerivedStateFromError(err: unknown) {
    return { err: err instanceof Error ? err.message : 'Testing ground failed.' };
  }

  render() {
    if (this.state.err) {
      return (
        <main className="grid min-h-screen place-items-center bg-background p-8 text-foreground">
          <p className="max-w-md text-sm text-muted-foreground">{this.state.err}</p>
        </main>
      );
    }
    return this.props.children;
  }
}

const BREAKPOINTS = [
  { id: 'xs', label: 'Mobile · 375', width: 375 },
  { id: 'md', label: 'Tablet · 768', width: 768 },
  { id: 'lg', label: 'Desktop · 1440', width: 1440 },
] as const;

function OpenCashierLab() {
  const { setCashierOpen } = useShell();
  useEffect(() => {
    setCashierOpen(true);
  }, [setCashierOpen]);
  return null;
}

/** Testing ground — balance opens Cashier sheet (Cashier-Widget Master 9475-199943). */
export function TestingGroundWallet({
  title = 'Wallet / Cashier',
  mode = 'dark',
}: {
  title?: string;
  mode?: 'light' | 'dark';
}) {
  const [device, setDevice] = useState<number>(375);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  return (
    <GroundErrorBoundary>
      <div className="relative min-h-screen bg-surface-muted-2 p-4 text-foreground">
        <p className="mb-3 text-center text-xs font-medium text-muted-foreground">
          Testing ground · not live · {title}
        </p>
        <p className="mb-4 text-center text-sm text-muted-foreground">
          Tap the balance pill in the header — Wallet opens as a 384px right sheet (desktop) or bottom sheet (mobile).
          Crypto, Credit Card, and Others match the Cashier Widget frames. Account still opens the UBC panel.
        </p>

        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">QA devices</span>
            {BREAKPOINTS.map((bp) => (
              <button
                key={bp.id}
                type="button"
                onClick={() => setDevice(bp.width)}
                className={cn(
                  'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                  device === bp.width
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground'
                )}
              >
                {bp.label}
              </button>
            ))}
          </div>

          <div
            className="overflow-hidden rounded-lg border border-border bg-background shadow-lg"
            style={{ width: device, maxWidth: '100%', height: device <= 375 ? 667 : 900 }}
          >
            <CasinoProductShell lab={<OpenCashierLab />} />
          </div>
        </div>
      </div>
    </GroundErrorBoundary>
  );
}
