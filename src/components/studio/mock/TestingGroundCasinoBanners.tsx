'use client';

import { Component, useEffect, useState, type ReactNode } from 'react';
import { applyLumenTheme } from '@/lib/lumen/apply-theme';
import { BREAKPOINTS } from '@/lib/studio/mock';
import { CasinoProductShell } from './CasinoProductShell';

class GroundError extends Component<{ children: ReactNode }, { err: string | null }> {
  state = { err: null as string | null };
  static getDerivedStateFromError(err: Error) {
    return { err: err.message };
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

/** Testing ground — shipped shell + sub-nav + lobby banner row only (Casino-Lumen 69-47911). */
export function TestingGroundCasinoBanners({
  mode = 'light',
}: {
  title?: string;
  mode?: 'light' | 'dark';
}) {
  const [device, setDevice] = useState<number>(1440);
  const [inFrame, setInFrame] = useState(true);

  useEffect(() => {
    setInFrame(window.self !== window.top);
  }, []);

  useEffect(() => {
    applyLumenTheme('betonline', mode);
  }, [mode]);

  useEffect(() => {
    const html = document.documentElement;
    const enforce = () => {
      const wantDark = mode === 'dark';
      if (html.dataset.brand !== 'betonline') html.dataset.brand = 'betonline';
      if (html.classList.contains('dark') !== wantDark) html.classList.toggle('dark', wantDark);
    };
    enforce();
    const obs = new MutationObserver(enforce);
    obs.observe(html, { attributes: true, attributeFilter: ['class', 'data-brand'] });
    return () => obs.disconnect();
  }, [mode]);

  const shell = (
    <CasinoProductShell
      subNav={{ glass: true, sticky: true, motion: true, defaultActive: 'Lobby', defaultFavourites: false }}
    />
  );

  return (
    <GroundError>
      {inFrame ? (
        shell
      ) : (
        <div className="min-h-screen bg-surface-muted-2">
          <div className="sticky top-0 z-[90] flex flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">QA devices</span>
            {BREAKPOINTS.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`rounded-md border px-3 py-1 text-xs font-medium ${
                  device === b.width
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground'
                }`}
                onClick={() => setDevice(b.width)}
              >
                {b.label}
              </button>
            ))}
          </div>
          <div className="flex justify-center p-4">
            <div
              className="overflow-hidden rounded-lg border border-border bg-background shadow-lg"
              style={{ width: device, maxWidth: '100%' }}
            >
              {shell}
            </div>
          </div>
        </div>
      )}
    </GroundError>
  );
}
