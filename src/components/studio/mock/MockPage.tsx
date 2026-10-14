'use client';

/**
 * /prototype and /component pages.
 *
 *   ?id=<brief>                 toolbar (brand · mode · breakpoint) + the mock in an iframe
 *   ?id=<brief>&view=frames     mobile / tablet / desktop frames side by side (design review)
 *   ?id=<brief>&bare=1          just the mock (what the iframes load)
 *
 * Brand/mode come from the brief's answers unless overridden with &brand= / &mode=.
 */
import { useEffect, useMemo, useState } from 'react';
import { BREAKPOINTS, deriveMock, type MockSpec } from '@/lib/studio/mock';
import { getProject } from '@/lib/studio/store';
import type { StudioProject } from '@/lib/studio/types';
import { ComponentMock } from './ComponentMock';
import { PrototypeMock } from './PrototypeMock';

type Kind = 'prototype' | 'component';

function useQuery() {
  const [q, setQ] = useState<URLSearchParams | null>(null);
  useEffect(() => setQ(new URLSearchParams(window.location.search)), []);
  return q;
}

function applyTheme(brand: string, mode: 'light' | 'dark') {
  const html = document.documentElement;
  html.dataset.brand = brand;
  html.classList.toggle('dark', mode === 'dark');
}

function Bare({ kind, spec }: { kind: Kind; spec: MockSpec }) {
  useEffect(() => applyTheme(spec.brand, spec.mode), [spec.brand, spec.mode]);
  return kind === 'component' ? <ComponentMock spec={spec} /> : <PrototypeMock spec={spec} />;
}

function bareUrl(kind: Kind, project: StudioProject, brand: string, mode: string) {
  return `/${kind}?id=${encodeURIComponent(project.id)}&bare=1&brand=${brand}&mode=${mode}`;
}

function Toolbar({
  project,
  kind,
  brand,
  mode,
  setBrand,
  setMode,
  bp,
  setBp,
  frames,
}: {
  project: StudioProject;
  kind: Kind;
  brand: string;
  mode: 'light' | 'dark';
  setBrand: (b: string) => void;
  setMode: (m: 'light' | 'dark') => void;
  bp: number;
  setBp: (w: number) => void;
  frames: boolean;
}) {
  const seg = 'inline-flex h-8 items-center rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground';
  const on = 'border-primary bg-primary text-primary-foreground';
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-border bg-surface-muted-1 px-4 py-2 text-foreground">
      <a className="text-xs text-link" href={`/project?id=${encodeURIComponent(project.id)}`}>
        ← Brief
      </a>
      <strong className="text-sm">{project.title}</strong>
      <span className="text-xs text-muted-foreground">{kind === 'component' ? 'Component · all variants' : frames ? 'Design frames' : 'Prototype'}</span>
      <span className="ml-auto flex flex-wrap items-center gap-2">
        {['betonline', 'default'].map((b) => (
          <button key={b} type="button" className={`${seg} ${brand === b ? on : ''}`} onClick={() => setBrand(b)}>
            {b}
          </button>
        ))}
        <span className="w-px self-stretch bg-border" />
        {(['light', 'dark'] as const).map((m) => (
          <button key={m} type="button" className={`${seg} ${mode === m ? on : ''}`} onClick={() => setMode(m)}>
            {m}
          </button>
        ))}
        {!frames && kind === 'prototype' ? (
          <>
            <span className="w-px self-stretch bg-border" />
            {BREAKPOINTS.map((b) => (
              <button key={b.id} type="button" className={`${seg} ${bp === b.width ? on : ''}`} onClick={() => setBp(b.width)}>
                {b.label}
              </button>
            ))}
            <a className={`${seg} ${frames ? on : ''}`} href={`/prototype?id=${encodeURIComponent(project.id)}&view=frames`}>
              All frames
            </a>
          </>
        ) : null}
        <a className={seg} href={bareUrl(kind, project, brand, mode)} target="_blank" rel="noreferrer">
          Open full ↗
        </a>
      </span>
    </div>
  );
}

export function MockPage({ kind }: { kind: Kind }) {
  const q = useQuery();
  const [project, setProject] = useState<StudioProject | null | undefined>(undefined);
  const [brandOverride, setBrand] = useState<string | null>(null);
  const [modeOverride, setMode] = useState<'light' | 'dark' | null>(null);
  const [bp, setBp] = useState<number>(1440);

  useEffect(() => {
    if (!q) return;
    const id = q.get('id');
    setProject(id ? getProject(id) : null);
    if (q.get('brand')) setBrand(q.get('brand'));
    if (q.get('mode') === 'dark' || q.get('mode') === 'light') setMode(q.get('mode') as 'light' | 'dark');
  }, [q]);

  const spec = useMemo(() => {
    if (!project) return null;
    const s = deriveMock(project);
    return { ...s, brand: brandOverride ?? s.brand, mode: modeOverride ?? s.mode };
  }, [project, brandOverride, modeOverride]);

  // Shell pages use the brief's theme for their own chrome too.
  useEffect(() => {
    if (spec && q && !q.get('bare')) applyTheme(spec.brand, spec.mode);
  }, [spec, q]);

  if (!q || project === undefined) return null;
  if (!project || !spec) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-8 text-foreground">
        <div className="text-center">
          <h1 className="text-xl font-bold">No brief found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Open a mock from an approval card or a brief page.{' '}
            <a className="text-link" href="/projects">
              All briefs
            </a>
          </p>
        </div>
      </main>
    );
  }

  if (q.get('bare')) return <Bare kind={kind} spec={spec} />;

  const frames = q.get('view') === 'frames' && kind === 'prototype';
  const src = bareUrl(kind, project, spec.brand, spec.mode);

  return (
    <div className="min-h-screen bg-surface-muted-2 text-foreground">
      <Toolbar project={project} kind={kind} brand={spec.brand} mode={spec.mode} setBrand={setBrand} setMode={setMode} bp={bp} setBp={setBp} frames={frames} />
      {frames ? (
        <div className="lm-frames">
          {BREAKPOINTS.map((b) => (
            <div key={b.id} className="lm-frame" style={{ width: b.width }}>
              <header>
                <span>{b.label}</span>
                <span>
                  {spec.brand} · {spec.mode}
                </span>
              </header>
              <iframe title={b.label} src={src} style={{ width: b.width, height: 900, border: 0, display: 'block' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center p-4 md:p-8">
          <div className="lm-frame" style={{ width: kind === 'component' ? '100%' : bp, maxWidth: '100%' }}>
            <iframe
              title={project.title}
              src={src}
              style={{ width: '100%', height: 'calc(100vh - 7rem)', minHeight: 600, border: 0, display: 'block' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
