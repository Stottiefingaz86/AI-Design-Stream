'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AGENT_BY_ID, KIND_LABEL, STATUS_LABEL } from '@/lib/studio/agents';
import { DESIGN_SYSTEM, STUDIO_NAME, STUDIO_TAGLINE, figmaFileUrl, getStudioPass, TARGETS } from '@/lib/studio/brand';
import { FIGMA_ASK_STEPS, FIGMA_SELECTION_EXAMPLE } from '@/lib/studio/knowledge';
import {
  addReference,
  createProject,
  getProject,
  isStudioAuthed,
  listProjects,
  removeReference,
  setStudioAuthed,
} from '@/lib/studio/store';
import { deriveMock, storybookIframeUrl, storybookStoryUrl } from '@/lib/studio/mock';
import type { StudioArtifacts, StudioProject, StudioProjectKind, StudioReferenceKind } from '@/lib/studio/types';
import { MockPreview } from './office/OfficePanels';
import { OfficeView } from './office/OfficeView';
import '@/styles/studio.css';
import '@/styles/studio-floor.css';

export type StudioView = 'office' | 'dashboard' | 'new' | 'project' | 'design-system' | 'storybook' | 'settings';

const NAV: { href: string; label: string; view: StudioView; soon?: boolean; external?: boolean }[] = [
  { href: '/', label: 'Studio floor', view: 'office' },
  { href: '/projects', label: 'Briefs', view: 'dashboard' },
  { href: '/new', label: 'New brief', view: 'new' },
  { href: '/design-system', label: `${DESIGN_SYSTEM.name} coverage`, view: 'design-system', soon: true },
  { href: TARGETS.storybookUrl, label: 'Storybook', view: 'storybook', external: true },
  { href: TARGETS.liveSiteUrl, label: 'Live site', view: 'storybook', external: true },
  { href: '/settings', label: 'Studio settings', view: 'settings', soon: true },
];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function LoginGate({ onAuthed }: { onAuthed: () => void }) {
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const expected = getStudioPass();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!expected || pass === expected) {
      setStudioAuthed(true);
      onAuthed();
      return;
    }
    setError('Incorrect password.');
  };

  return (
    <div className="ge-root ge-login">
      <form className="ge-login-card" onSubmit={submit}>
        <h1>{STUDIO_NAME}</h1>
        <p>Private studio. Enter the passcode to continue.</p>
        <div className="ge-field">
          <label htmlFor="ge-pass">Passcode</label>
          <input
            id="ge-pass"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Enter passcode"
          />
        </div>
        {error ? <p className="ge-error">{error}</p> : null}
        <div style={{ marginTop: '1rem' }}>
          <button className="ge-btn" type="submit">
            Enter
          </button>
        </div>
      </form>
    </div>
  );
}

function Shell({ view, projectId, children }: { view: StudioView; projectId?: string; children: React.ReactNode }) {
  return (
    <div className="ge-root">
      <div className="ge-shell">
        <aside className="ge-nav">
          <div className="ge-brand">
            <strong>{STUDIO_NAME.toUpperCase()}</strong>
            <span>{STUDIO_TAGLINE}</span>
          </div>
          <nav className="ge-nav-list" aria-label="Studio">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={[view === item.view ? 'is-active' : '', item.soon ? 'ge-soon' : ''].filter(Boolean).join(' ')}
                aria-disabled={item.soon || undefined}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
                onClick={item.soon ? (e) => e.preventDefault() : undefined}
              >
                {item.label}
                {item.soon ? ' · soon' : item.external ? ' ↗' : ''}
              </a>
            ))}
            {projectId ? (
              <a href={`/project?id=${encodeURIComponent(projectId)}`} className={view === 'project' ? 'is-active' : ''}>
                Current brief
              </a>
            ) : null}
          </nav>
          <p className="ge-nav-foot">
            Locked to {DESIGN_SYSTEM.name} ({DESIGN_SYSTEM.figmaLibraryName}). Local storage only — agent work is
            simulated until Figma and Storybook jobs are wired in.
          </p>
        </aside>
        <main className={view === 'office' ? 'ge-main ge-main--office' : 'ge-main'}>{children}</main>
      </div>
    </div>
  );
}

function DashboardView() {
  const [projects, setProjects] = useState<StudioProject[]>([]);

  useEffect(() => {
    setProjects(listProjects());
  }, []);

  const components = projects.filter((p) => p.kind === 'component').length;
  const approved = projects.filter((p) => p.status === 'live').length;

  return (
    <>
      <header className="ge-header">
        <div>
          <h1>Briefs</h1>
          <p>
            Every component and feature the studio has been briefed on. Day-to-day progress lives on the{' '}
            <a href="/" style={{ color: '#ffc14a' }}>
              studio floor
            </a>
            .
          </p>
        </div>
        <a className="ge-btn" href="/new">
          New brief
        </a>
      </header>

      <p className="ge-brief-meta">
        <span>{projects.length} brief{projects.length === 1 ? '' : 's'}</span>
        <span>{components} component{components === 1 ? '' : 's'}</span>
        <span>{approved} live</span>
      </p>

      {projects.length === 0 ? (
        <div className="ge-empty">
          No briefs yet.{' '}
          <a href="/new" style={{ color: '#ffc14a' }}>
            Write one
          </a>
          .
        </div>
      ) : (
        <ul className="ge-brief-list">
          {projects.map((p) => (
            <li key={p.id}>
              <a href={`/project?id=${encodeURIComponent(p.id)}`}>
                <span>
                  <strong>{p.title}</strong>
                  <span className="ge-brief-list__sub">
                    {p.surface || 'No surface'}
                    {p.specUrl ? ' · Figma / spec attached' : ''}
                    {p.references.length ? ` · ${p.references.length} ref${p.references.length === 1 ? '' : 's'}` : ''}
                  </span>
                </span>
                <span className="ge-brief-list__kind">{KIND_LABEL[p.kind]}</span>
                <span className="ge-badge ge-badge--draft">{STATUS_LABEL[p.status]}</span>
                <time className="ge-brief-list__when" dateTime={p.updatedAt}>
                  {new Date(p.updatedAt).toLocaleString()}
                </time>
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function NewBriefView() {
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<StudioProjectKind>('component');
  const [surface, setSurface] = useState('');
  const [brief, setBrief] = useState('');
  const [specUrl, setSpecUrl] = useState('');
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    createProject({ title, kind, surface, brief, specUrl });
    // Back to the floor: the Design Lead picks the brief up and will have questions.
    window.location.href = '/';
  };

  return (
    <>
      <header className="ge-header">
        <div>
          <h1>Brief the Design Lead</h1>
          <p>
            Start from a PRD/BRD. Nova writes the spec, Ivo audits {DESIGN_SYSTEM.name}, Mika designs in Figma, Ren ships
            a prototype URL, Priya builds it on the live site, Tess runs QA. You approve each hand-off in chat; a stuck
            agent asks a real human for a reference instead of guessing.
          </p>
        </div>
      </header>

      <form className="ge-form ge-card" onSubmit={submit}>
        <div className="ge-field">
          <label htmlFor="ge-title">Title</label>
          <input id="ge-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Bet slip empty state" required />
        </div>
        <div className="ge-field">
          <label>Kind</label>
          <div className="ge-chips">
            {(Object.keys(KIND_LABEL) as StudioProjectKind[]).map((k) => (
              <button
                key={k}
                type="button"
                className="ge-chip"
                aria-pressed={kind === k}
                style={kind === k ? { background: 'rgba(255, 193, 74, 0.25)', borderColor: '#ffc14a' } : undefined}
                onClick={() => setKind(k)}
              >
                {KIND_LABEL[k]}
              </button>
            ))}
          </div>
        </div>
        <div className="ge-field">
          <label htmlFor="ge-surface">Surface</label>
          <input id="ge-surface" value={surface} onChange={(e) => setSurface(e.target.value)} placeholder="Sportsbook web, Casino mobile web, Account…" />
        </div>
        <div className="ge-field">
          <label htmlFor="ge-brief">Brief</label>
          <textarea
            id="ge-brief"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder={
              kind === 'component'
                ? 'What does it do? Which Lumen components is it closest to? Which states and sizes?'
                : 'What should the user be able to do? Entry points, edge cases, success state.'
            }
          />
        </div>
        <div className="ge-field">
          <label htmlFor="ge-spec">Figma (or PRD) link</label>
          <input
            id="ge-spec"
            type="url"
            value={specUrl}
            onChange={(e) => setSpecUrl(e.target.value)}
            placeholder="https://www.figma.com/design/… — paste the frame if designs exist"
          />
        </div>
        {error ? <p className="ge-error">{error}</p> : null}
        <div>
          <button className="ge-btn" type="submit">
            Create brief
          </button>
        </div>
      </form>
    </>
  );
}

function ProjectView({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<StudioProject | null>(null);
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const reload = () => setProject(getProject(projectId));

  useEffect(() => {
    reload();
  }, [projectId]);

  const addUrl = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    addReference(projectId, { kind: 'url', label: url.trim(), value: url.trim(), notes: notes.trim() || undefined });
    setUrl('');
    setNotes('');
    reload();
  };

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError('');
    for (const file of Array.from(files)) {
      if (file.size > 4_500_000) {
        setError(`Skipped ${file.name} — keep uploads under ~4.5MB for local storage.`);
        continue;
      }
      const kind: StudioReferenceKind = file.type.startsWith('video/') ? 'video' : file.type === 'application/pdf' ? 'pdf' : 'image';
      try {
        const value = await readFileAsDataUrl(file);
        addReference(projectId, { kind, label: file.name, value, notes: notes.trim() || undefined });
      } catch {
        setError(`Failed to read ${file.name}`);
      }
    }
    setNotes('');
    reload();
  };

  if (!project) {
    return (
      <div className="ge-empty">
        Brief not found.{' '}
        <a href="/" style={{ color: '#ffc14a' }}>
          Back to the floor
        </a>
      </div>
    );
  }

  return (
    <>
      <header className="ge-header">
        <div>
          <h1>{project.title}</h1>
          <p>
            {KIND_LABEL[project.kind]} · {project.surface || 'No surface yet'} · status{' '}
            <span className="ge-badge ge-badge--draft">{STATUS_LABEL[project.status]}</span>
          </p>
        </div>
        <a className="ge-btn ge-btn--ghost" href="/projects">
          All briefs
        </a>
      </header>

      <EscalationBanner project={project} />

      <OutputsGallery project={project} />

      <div className="ge-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="ge-card">
          <h3>Brief</h3>
          <p>{project.brief || '—'}</p>
        </div>
        <ArtifactsCard project={project} />
        <div className="ge-card">
          <h3>Spec</h3>
          {project.specUrl ? (
            <p>
              <a href={project.specUrl} target="_blank" rel="noreferrer" style={{ color: '#ffc14a', wordBreak: 'break-all' }}>
                {project.specUrl}
              </a>
            </p>
          ) : (
            <p>No product spec attached.</p>
          )}
        </div>
        <div className="ge-card">
          <h3>Your calls</h3>
          {project.briefAnswers && Object.keys(project.briefAnswers).length ? (
            <ul className="ge-list ge-list--plain">
              {Object.entries(project.briefAnswers).map(([k, v]) => (
                <li key={k}>
                  <span>{k.replace(/_/g, ' ')}</span>
                  <small>{v}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>The Design Lead will ask you on the studio floor.</p>
          )}
        </div>
      </div>

      <section className="ge-card" style={{ marginBottom: '1rem' }}>
        <h2>References</h2>
        <p style={{ marginBottom: '1rem' }}>
          Product specs, screenshots, competitor flows, existing screens. References inform the brief — the only source of
          UI is {DESIGN_SYSTEM.name}.
        </p>

        <form className="ge-form" onSubmit={addUrl} style={{ marginBottom: '1rem' }}>
          <div className="ge-field">
            <label htmlFor="ge-ref-url">Reference URL</label>
            <input id="ge-ref-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
          </div>
          <div className="ge-field">
            <label htmlFor="ge-ref-notes">Notes (optional)</label>
            <input id="ge-ref-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What to take from it: flow, hierarchy, copy — not styling" />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            <button className="ge-btn" type="submit">
              Add URL
            </button>
            <label className="ge-btn ge-btn--ghost" style={{ cursor: 'pointer' }}>
              Upload file
              <input
                type="file"
                accept="image/*,video/*,application/pdf"
                multiple
                hidden
                onChange={(e) => {
                  void onUpload(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
          {error ? <p className="ge-error">{error}</p> : null}
        </form>

        {project.references.length === 0 ? (
          <div className="ge-empty">No references attached yet.</div>
        ) : (
          <div className="ge-ref-list">
            {project.references.map((ref) => (
              <div className="ge-ref-item" key={ref.id}>
                {ref.kind === 'image' ? (
                  <img src={ref.value} alt="" />
                ) : (
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.06)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 11,
                      color: 'var(--ge-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {ref.kind}
                  </div>
                )}
                <div className="ge-ref-meta">
                  <strong>{ref.label}</strong>
                  {ref.kind === 'url' ? (
                    <a href={ref.value} target="_blank" rel="noreferrer">
                      {ref.value}
                    </a>
                  ) : (
                    <span>{ref.kind} upload · local only</span>
                  )}
                  {ref.notes ? <span>{ref.notes}</span> : null}
                </div>
                <button
                  type="button"
                  className="ge-btn ge-btn--ghost"
                  onClick={() => {
                    removeReference(projectId, ref.id);
                    reload();
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

/** Static page: the brief id comes from `?id=` (pages are prerendered, no SSR). */
function ProjectRoute({ projectId }: { projectId?: string }) {
  const [id, setId] = useState<string | null | undefined>(projectId ?? undefined);
  useEffect(() => {
    if (projectId) return;
    setId(new URLSearchParams(window.location.search).get('id'));
  }, [projectId]);
  if (id === undefined) return <div className="ge-empty">Loading…</div>;
  if (!id) {
    return (
      <div className="ge-empty">
        No brief selected.{' '}
        <a href="/projects" style={{ color: '#ffc14a' }}>
          All briefs
        </a>
      </div>
    );
  }
  return <ProjectView projectId={id} />;
}

const ARTIFACT_LABEL: Record<keyof StudioArtifacts, string> = {
  specPath: 'Spec',
  figmaUrl: 'Figma',
  framesUrl: 'Design frames',
  prototypeUrl: 'Prototype',
  storybookUrl: 'Storybook',
  prUrl: 'Pull request',
  previewUrl: 'Preview',
  liveUrl: 'Live',
};

function ArtifactsCard({ project }: { project: StudioProject }) {
  const entries = (Object.keys(ARTIFACT_LABEL) as (keyof StudioArtifacts)[])
    .map((k) => [k, project.artifacts?.[k]] as const)
    .filter(([, v]) => Boolean(v));
  return (
    <div className="ge-card">
      <h3>Outputs</h3>
      {entries.length ? (
        <ul className="ge-list ge-list--plain">
          {entries.map(([k, v]) => (
            <li key={k}>
              <span>{ARTIFACT_LABEL[k]}</span>
              {/^(https?:\/\/|\/)/.test(v!) ? (
                <a href={v} target="_blank" rel="noreferrer" style={{ color: '#ffc14a', wordBreak: 'break-all' }}>
                  Open {ARTIFACT_LABEL[k].toLowerCase()} ↗
                </a>
              ) : (
                <small style={{ wordBreak: 'break-all' }}>{v}</small>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Spec → Figma → prototype → Storybook → preview → live. Visuals appear in the gallery above as each stage finishes.</p>
      )}
    </div>
  );
}

/** Always-visible mocks / Storybook / live delivery so the brief page is never just text. */
function OutputsGallery({ project }: { project: StudioProject }) {
  const id = encodeURIComponent(project.id);
  const spec = deriveMock(project);
  const frames = project.artifacts.framesUrl ?? `/prototype?id=${id}&view=frames`;
  const proto = project.artifacts.prototypeUrl ?? `/prototype?id=${id}`;
  const story = project.artifacts.storybookUrl ?? (project.kind === 'component' ? storybookStoryUrl(spec.archetype) : `/component?id=${id}`);
  const storyIframe = storybookIframeUrl(story);
  const delivered = project.artifacts.liveUrl ?? project.artifacts.previewUrl;
  return (
    <section className="ge-outputs" aria-label="What was made">
      <header className="ge-outputs__head">
        <h2>What was made</h2>
        <p>Design frames, Storybook, and the live delivery — not just chat text.</p>
      </header>
      <div className="ge-outputs__grid">
        <article className="ge-outputs__cell">
          <h3>Design mock</h3>
          <MockPreview url={frames} label="Frames · 375 / 1200 / 1440" />
        </article>
        <article className="ge-outputs__cell">
          <h3>Testing ground</h3>
          <MockPreview url={proto} label={spec.title} />
        </article>
        <article className="ge-outputs__cell">
          <h3>Storybook</h3>
          <MockPreview url={storyIframe} label={project.kind === 'component' ? `lumen-ui / ${spec.archetype}` : 'Component sheet'} />
        </article>
        {delivered ? (
          <article className="ge-outputs__cell">
            <h3>Delivered</h3>
            <MockPreview url={delivered} label="Live / preview" />
          </article>
        ) : (
          <article className="ge-outputs__cell ge-outputs__cell--empty">
            <h3>Delivered</h3>
            <p>Nothing on the live site yet. Approve the testing-ground prototype first — then a preview branch, then Tess signs off before it ships.</p>
          </article>
        )}
      </div>
    </section>
  );
}

function EscalationBanner({ project }: { project: StudioProject }) {
  const e = project.escalation;
  if (!e || e.resolvedAt) return null;
  const agent = AGENT_BY_ID[e.agentId];
  return (
    <div
      className="ge-card"
      style={{ marginBottom: '1.25rem', borderColor: 'rgba(232, 62, 140, 0.6)', background: 'rgba(232, 62, 140, 0.08)' }}
    >
      <h3 style={{ color: '#e83e8c' }}>
        {agent.name} needs a human reference
      </h3>
      <p>
        {e.reason} Pinged: {e.to.join(', ')}.{' '}
        {e.kind === 'figma'
          ? 'Build or select the frame in Figma, switch to Dev Mode (Shift+D), Copy link to selection, and paste that link in the brief’s chat.'
          : 'Add a reference below (or paste a Figma link in the channel)'}{' '}
        and {agent.name} resumes automatically.
      </p>
      {e.kind === 'figma' ? (
        <ol style={{ margin: '0.75rem 0 0', paddingLeft: '1.2rem', fontSize: '0.85rem', lineHeight: 1.45 }}>
          {FIGMA_ASK_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
      {e.kind === 'figma' ? (
        <p style={{ marginTop: '0.6rem', fontSize: '0.8rem' }}>
          Example:{' '}
          <a href={FIGMA_SELECTION_EXAMPLE} target="_blank" rel="noreferrer">
            {FIGMA_SELECTION_EXAMPLE}
          </a>
        </p>
      ) : null}
    </div>
  );
}

function PlaceholderView({ title, body, link }: { title: string; body: string; link?: { href: string; label: string } }) {
  return (
    <>
      <header className="ge-header">
        <div>
          <h1>{title}</h1>
          <p>{body}</p>
        </div>
        {link ? (
          <a className="ge-btn ge-btn--ghost" href={link.href} target="_blank" rel="noreferrer">
            {link.label}
          </a>
        ) : null}
      </header>
      <div className="ge-empty">Scaffolded for the next phase.</div>
    </>
  );
}

export function StudioApp({ view, projectId }: { view: StudioView; projectId?: string }) {
  const passConfigured = Boolean(getStudioPass());
  const [ready, setReady] = useState(() => !passConfigured || isStudioAuthed());

  useEffect(() => {
    if (!passConfigured) setStudioAuthed(true);
  }, [passConfigured]);

  const shellProjectId = useMemo(() => projectId, [projectId]);

  if (!ready) {
    return <LoginGate onAuthed={() => setReady(true)} />;
  }

  // The studio floor is a full-screen scene — no admin chrome.
  if (view === 'office') {
    return (
      <div className="ge-root ge-root--studio">
        <OfficeView />
      </div>
    );
  }

  let body: React.ReactNode = null;
  if (view === 'dashboard') body = <DashboardView />;
  else if (view === 'new') body = <NewBriefView />;
  else if (view === 'project') body = <ProjectRoute projectId={projectId} />;
  else if (view === 'design-system') {
    const url = figmaFileUrl();
    body = (
      <PlaceholderView
        title={`${DESIGN_SYSTEM.name} coverage`}
        body={`Live view of the ${DESIGN_SYSTEM.figmaLibraryName} library: components, variants, variable collections (${DESIGN_SYSTEM.variableCollections.join(', ')}) and which have code + stories. Arrives with the Figma sync job.`}
        link={url ? { href: url, label: 'Open in Figma' } : undefined}
      />
    );
  } else if (view === 'storybook')
    body = (
      <PlaceholderView
        title="Storybook"
        body="Approved components, each with a Figma side-by-side and the approval that let it in. Arrives with the component build job."
      />
    );
  else
    body = (
      <PlaceholderView
        title="Studio settings"
        body="Figma file keys, Storybook URL, token manifest path, and who can approve. Arrives with server-side jobs."
      />
    );

  return (
    <Shell view={view} projectId={shellProjectId}>
      {body}
    </Shell>
  );
}
