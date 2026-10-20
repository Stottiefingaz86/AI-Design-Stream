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
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { BREAKPOINTS, deriveMock, liveUrlFor, usesTestingGround, type MockSpec } from '@/lib/studio/mock';
import { startStudioCursorRun } from '@/lib/studio/cursor-client';
import { sendTestingGroundFeedback, signOffTestingGround } from '@/lib/studio/pipeline';
import { getProject, markPrototypeOpened } from '@/lib/studio/store';
import type { StudioProject } from '@/lib/studio/types';
import { ComponentMock } from './ComponentMock';
import { applyLumenTheme, applyLumenThemeToDocument } from '@/lib/lumen/apply-theme';
import {
  wantsBannerOnly,
  wantsCashierShell,
  wantsCasinoShell,
  wantsOriginalsShelf,
  wantsPokerShell,
} from './casino-ask';

const PrototypeMock = lazy(() => import('./PrototypeMock').then((m) => ({ default: m.PrototypeMock })));

const TestingGroundCasino = lazy(() =>
  import('./TestingGroundCasino').then((m) => ({ default: m.TestingGroundCasino })),
);
const TestingGroundCasinoBanners = lazy(() =>
  import('./TestingGroundCasinoBanners').then((m) => ({ default: m.TestingGroundCasinoBanners })),
);
const TestingGroundCasinoOriginals = lazy(() =>
  import('./TestingGroundCasinoOriginals').then((m) => ({ default: m.TestingGroundCasinoOriginals })),
);
const CasinoDesignMock = lazy(() =>
  import('./CasinoDesignMock').then((m) => ({ default: m.CasinoDesignMock })),
);
const TestingGroundPoker = lazy(() =>
  import('./TestingGroundPoker').then((m) => ({ default: m.TestingGroundPoker })),
);
const TestingGroundWallet = lazy(() =>
  import('./TestingGroundWallet').then((m) => ({ default: m.TestingGroundWallet })),
);

type Kind = 'prototype' | 'component';

function useQuery() {
  const [q, setQ] = useState<URLSearchParams | null>(null);
  useEffect(() => setQ(new URLSearchParams(window.location.search)), []);
  return q;
}

function queryTheme(q: URLSearchParams | null) {
  const mode = q?.get('mode');
  const brand = q?.get('brand');
  return {
    mode: mode === 'dark' || mode === 'light' ? (mode as 'light' | 'dark') : null,
    brand: brand || null,
  };
}

function Bare({ kind, spec, ground }: { kind: Kind; spec: MockSpec; ground?: boolean }) {
  useEffect(() => {
    applyLumenTheme(spec.brand, spec.mode);
  }, [spec.brand, spec.mode, spec.title, spec.summary, spec.kicker]);
  try {
    if (kind === 'component') return <ComponentMock spec={spec} />;
    if (ground && wantsCashierShell(spec.title, spec.summary, spec.kicker)) {
      return (
        <Suspense fallback={<main className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading wallet…</main>}>
          <TestingGroundWallet title={spec.title} mode={spec.mode} />
        </Suspense>
      );
    }
    if (ground && wantsBannerOnly(spec.title, spec.summary, spec.kicker)) {
      return (
        <Suspense fallback={<main className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading banners…</main>}>
          <TestingGroundCasinoBanners title={spec.title} mode={spec.mode} />
        </Suspense>
      );
    }
    if (ground && wantsOriginalsShelf(spec.title, spec.summary, spec.kicker)) {
      return (
        <Suspense fallback={<main className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading Originals…</main>}>
          <TestingGroundCasinoOriginals title={spec.title} mode={spec.mode} />
        </Suspense>
      );
    }
    if (ground && wantsCasinoShell(spec.title, spec.summary, spec.kicker)) {
      return (
        <Suspense fallback={<main className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading testing ground…</main>}>
          <TestingGroundCasino title={spec.title} mode={spec.mode} />
        </Suspense>
      );
    }
    if (ground && wantsPokerShell(spec.title, spec.summary, spec.kicker)) {
      return (
        <Suspense fallback={<main className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading poker testing ground…</main>}>
          <TestingGroundPoker title={spec.title} mode={spec.mode} />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<main className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading mock…</main>}>
        <PrototypeMock spec={spec} />
      </Suspense>
    );
  } catch (err) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-8 text-foreground">
        <p className="text-sm text-muted-foreground">{err instanceof Error ? err.message : 'Prototype failed to render.'}</p>
      </main>
    );
  }
}

function bareUrl(kind: Kind, project: StudioProject, brand: string, mode: string, extra = '') {
  return `/${kind}?id=${encodeURIComponent(project.id)}&bare=1&brand=${brand}&mode=${mode}${extra}`;
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
  ground,
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
  ground: boolean;
}) {
  const seg = 'inline-flex h-8 items-center rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground';
  const on = 'border-primary bg-primary text-primary-foreground';
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-border bg-surface-muted-1 px-4 py-2 text-foreground">
      <a className="text-xs text-link" href={`/project?id=${encodeURIComponent(project.id)}`}>
        ← Brief
      </a>
      <strong className="text-sm">{project.title}</strong>
      <span className="text-xs text-muted-foreground">
        {kind === 'component' ? 'Component · all variants' : frames ? 'Design mock · frames' : ground ? 'Testing ground · real shell' : 'Design mock'}
      </span>
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
            <a
              className={seg}
              href={`/prototype?id=${encodeURIComponent(project.id)}${ground ? '&ground=1' : ''}&view=frames`}
            >
              All sizes
            </a>
          </>
        ) : null}
        <a className={seg} href={bareUrl(kind, project, brand, mode, ground ? '&ground=1' : '')} target="_blank" rel="noreferrer">
          Open full ↗
        </a>
      </span>
    </div>
  );
}

function GroundReviewBar({ project }: { project: StudioProject }) {
  const [note, setNote] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<'live' | 'note' | null>(null);
  const [flash, setFlash] = useState('');
  const live = project.status === 'live';
  const liveHref = liveUrlFor(project);

  const putLive = () => {
    markPrototypeOpened(project.id);
    const result = signOffTestingGround(project.id);
    if (!result) return;
    if ('liveUrl' in result) {
      setFlash('Already live.');
      return;
    }
    setBusy('live');
    setFlash('Signing off — putting it on the live site.');
    startStudioCursorRun(result.job, result.channelId);
  };

  const sendNote = () => {
    const result = sendTestingGroundFeedback(project.id, note);
    if (!result) return;
    setBusy('note');
    setFlash('Sent to the agents. They’re revising this testing ground.');
    setNote('');
    setOpen(false);
    startStudioCursorRun(result.job, result.channelId);
  };

  return (
    <div className="sticky top-[41px] z-10 border-b border-[#12080c]/15 bg-[#ffc14a] px-4 py-2 text-[#12080c]">
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-auto text-[11px] font-bold uppercase tracking-wide">
          Testing ground — not live
          {flash ? <span className="ml-2 font-semibold normal-case tracking-normal">{flash}</span> : null}
        </p>
        <button
          type="button"
          className="inline-flex h-8 items-center rounded-md border border-[#12080c]/20 bg-white/70 px-3 text-xs font-semibold"
          onClick={() => setOpen((v) => !v)}
        >
          Send feedback
        </button>
        {live && liveHref ? (
          <a
            className="inline-flex h-8 items-center rounded-md bg-[#12080c] px-3 text-xs font-semibold text-[#ffc14a]"
            href={liveHref}
            target="_blank"
            rel="noreferrer"
          >
            Live on site ↗
          </a>
        ) : (
          <button
            type="button"
            className="inline-flex h-8 items-center rounded-md bg-[#12080c] px-3 text-xs font-semibold text-[#ffc14a] disabled:opacity-60"
            disabled={busy === 'live'}
            onClick={putLive}
          >
            {busy === 'live' ? 'Putting live…' : 'Put live'}
          </button>
        )}
      </div>
      {open ? (
        <form
          className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            sendNote();
          }}
        >
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            required
            placeholder="What’s wrong? Agents get this and revise the testing ground."
            className="min-h-[64px] w-full flex-1 rounded-md border border-[#12080c]/20 bg-white px-3 py-2 text-sm text-[#12080c] outline-none"
          />
          <button
            type="submit"
            disabled={!note.trim() || busy === 'note'}
            className="inline-flex h-8 shrink-0 items-center rounded-md bg-[#12080c] px-3 text-xs font-semibold text-[#ffc14a] disabled:opacity-60"
          >
            Send to agents
          </button>
        </form>
      ) : null}
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
    const found = id ? getProject(id) : null;
    setProject(found);
    if (id && (kind === 'prototype' || (found && usesTestingGround(found)))) markPrototypeOpened(id);
    if (q.get('brand')) setBrand(q.get('brand'));
    if (q.get('mode') === 'dark' || q.get('mode') === 'light') setMode(q.get('mode') as 'light' | 'dark');
    const fromBp = Number(q.get('bp'));
    if (BREAKPOINTS.some((b) => b.width === fromBp)) setBp(fromBp);
    if (kind === 'component' && found && usesTestingGround(found)) {
      window.location.replace(`/prototype?id=${encodeURIComponent(found.id)}&ground=1&view=frames`);
    }
  }, [q, kind]);

  const spec = useMemo(() => {
    if (!project) return null;
    const s = deriveMock(project);
    const fromUrl = queryTheme(q);
    return {
      ...s,
      brand: brandOverride ?? fromUrl.brand ?? s.brand,
      mode: modeOverride ?? fromUrl.mode ?? s.mode,
    };
  }, [project, brandOverride, modeOverride, q]);

  const groundPreview =
    Boolean(q && kind === 'prototype' && q.get('ground') === '1' && !q.get('bare') && project && spec);

  // Shell pages use the brief's theme for their own chrome too.
  useEffect(() => {
    if (spec && q && !q.get('bare')) applyLumenTheme(spec.brand, spec.mode);
  }, [spec, q]);

  // Testing ground runs in an iframe — push toolbar brand/mode into the child document immediately.
  useEffect(() => {
    if (!groundPreview || !spec || !project) return;
    const title = project.title;
    const sync = () => {
      const iframe = document.querySelector(`iframe[title="${CSS.escape(title)}"]`) as HTMLIFrameElement | null;
      applyLumenThemeToDocument(iframe?.contentDocument, spec.brand, spec.mode);
    };
    sync();
    const iframe = document.querySelector(`iframe[title="${CSS.escape(title)}"]`) as HTMLIFrameElement | null;
    iframe?.addEventListener('load', sync);
    return () => iframe?.removeEventListener('load', sync);
  }, [groundPreview, spec?.brand, spec?.mode, project?.title]);

  if (!q || project === undefined) return null;

  if (q.get('preview') === 'casino') {
    const ground = q.get('ground') === '1';
    const previewMode = q.get('mode') === 'dark' ? 'dark' : 'light';
    applyLumenTheme('betonline', previewMode);
    return (
      <Suspense fallback={<main className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading casino shell…</main>}>
        {ground ? (
          <TestingGroundCasino title="Casino lobby" mode={previewMode} />
        ) : (
          <CasinoDesignMock title="Casino lobby" />
        )}
      </Suspense>
    );
  }

  if (q.get('preview') === 'originals') {
    const previewMode = q.get('mode') === 'dark' ? 'dark' : 'light';
    applyLumenTheme('betonline', previewMode);
    return (
      <Suspense fallback={<main className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading Originals…</main>}>
        <TestingGroundCasinoOriginals title="Casino Originals" mode={previewMode} />
      </Suspense>
    );
  }

  if (q.get('preview') === 'poker') {
    const previewMode = q.get('mode') === 'dark' ? 'dark' : 'light';
    applyLumenTheme('betonline', previewMode);
    return (
      <Suspense fallback={<main className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading poker shell…</main>}>
        <TestingGroundPoker title="Poker page" mode={previewMode} />
      </Suspense>
    );
  }

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

  const ground = q.get('ground') === '1' && kind === 'prototype';
  if (q.get('bare')) return <Bare kind={kind} spec={spec} ground={ground} />;

  const frames = q.get('view') === 'frames' && kind === 'prototype';
  const src = bareUrl(kind, project, spec.brand, spec.mode, ground ? '&ground=1' : '');

  return (
    <div className="min-h-screen bg-surface-muted-2 text-foreground">
      <Toolbar
        project={project}
        kind={kind}
        brand={spec.brand}
        mode={spec.mode}
        setBrand={setBrand}
        setMode={setMode}
        bp={bp}
        setBp={setBp}
        frames={frames}
        ground={ground}
      />
      {ground ? <GroundReviewBar project={project} /> : null}
      {frames ? (
        <div className="lm-frames">
          {BREAKPOINTS.map((b) => (
            <div key={b.id} className="lm-frame" style={{ width: b.width }}>
              <header>
                <span>{b.label}</span>
                <span>
                  {ground ? 'Testing ground · QA' : `${spec.brand} · ${spec.mode}`}
                </span>
              </header>
              <iframe title={b.label} src={src} style={{ width: b.width, height: 900, border: 0, display: 'block' }} />
            </div>
          ))}
        </div>
      ) : ground ? (
        <div className="flex justify-center bg-surface-muted-2 p-4 md:p-8">
          <div className="lm-frame" style={{ width: bp, maxWidth: '100%' }}>
            <header>
              <span>{BREAKPOINTS.find((b) => b.width === bp)?.label ?? 'Desktop'}</span>
              <span>Testing ground · QA</span>
            </header>
            <iframe
              key={`${src}-${bp}`}
              title={project.title}
              src={src}
              style={{ width: '100%', height: 'calc(100vh - 8rem)', minHeight: 640, border: 0, display: 'block' }}
            />
          </div>
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
