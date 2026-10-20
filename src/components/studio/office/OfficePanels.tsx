'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { STATUS_LABEL, getAgent } from '@/lib/studio/agents';
import { BREAKPOINTS, mockUrlFor, usesTestingGround } from '@/lib/studio/mock';
import { answerQuestion, decideApproval } from '@/lib/studio/pipeline';
import { getProject } from '@/lib/studio/store';
import type { StudioApproval, StudioQuestion, StudioTask } from '@/lib/studio/types';

export function projectHref(id: string) {
  return `/project?id=${encodeURIComponent(id)}`;
}

/* ---------------- inline mock preview ---------------- */

const PREVIEW_HEIGHT = 900;

/**
 * Scaled iframe of a mock page so you can see what you're approving without
 * leaving the chat. Picks a device width; scales to the card's width.
 */
export function MockPreview({ url, label }: { url: string; label?: string }) {
  const isFigma = /figma\.com\//i.test(url);
  const [bp, setBp] = useState<number>(BREAKPOINTS[0].width);
  const [w, setW] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e?.contentRect.width ?? 0));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  if (isFigma) {
    return (
      <div className="ge-mock">
        <div className="ge-mock__bar">
          <span>{label ?? 'Figma'}</span>
          <a href={url} target="_blank" rel="noreferrer">
            Open in Figma ↗
          </a>
        </div>
        <a className="ge-mock__figma" href={url} target="_blank" rel="noreferrer">
          Design mock — open the Figma file
        </a>
      </div>
    );
  }
  const base = url.replace(/[&?]view=frames/, '');
  const bare = base.includes('?') ? `${base}&bare=1` : `${base}?bare=1`;
  const useW = bp;
  const useScale = w ? Math.min(1, w / bp) : 0;
  return (
    <div className="ge-mock">
      <div className="ge-mock__bar">
        <span>{label ?? 'Preview'}</span>
        <span className="ge-mock__bps">
          {BREAKPOINTS.map((b) => (
            <button key={b.id} type="button" className={bp === b.width ? 'is-on' : ''} onClick={() => setBp(b.width)}>
              {b.id}
            </button>
          ))}
        </span>
        <a href={url} target="_blank" rel="noreferrer">
          Open full size ↗
        </a>
      </div>
      <div className="ge-mock__viewport" ref={ref} style={{ height: useScale ? PREVIEW_HEIGHT * useScale : 240 }}>
        {useScale ? (
          <iframe
            title={label ?? 'Mock preview'}
            src={bare}
            loading="lazy"
            style={{ width: useW, height: PREVIEW_HEIGHT, transform: `scale(${useScale})`, transformOrigin: 'top left' }}
          />
        ) : null}
      </div>
    </div>
  );
}

export function Progress({ value, color }: { value: number; color: string }) {
  return (
    <div className="ge-progress" role="progressbar" aria-valuenow={Math.round(value)}>
      <span style={{ width: `${Math.max(2, Math.min(100, value))}%`, background: color }} />
    </div>
  );
}

export function Deliverable({ task }: { task: StudioTask }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ge-deliverable">
      <button type="button" onClick={() => setOpen((v) => !v)}>
        <span>{task.title}</span>
        <small>{open ? 'hide' : 'view'}</small>
      </button>
      {open && task.deliverable ? <pre>{task.deliverable}</pre> : null}
    </div>
  );
}

/* ---------------- question card (inline in chat) ---------------- */

export function QuestionCard({ q }: { q: StudioQuestion }) {
  const [custom, setCustom] = useState('');
  const agent = getAgent(q.agentId);
  if (q.answeredAt) {
    return (
      <div className="ge-card ge-card--done">
        <span className="ge-card__kicker">Question · answered</span>
        <p>{q.text}</p>
        <strong>→ {q.answer}</strong>
      </div>
    );
  }
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!custom.trim()) return;
    answerQuestion(q.id, custom);
    setCustom('');
  };
  return (
    <div className="ge-card ge-card--question" style={{ borderColor: `${agent.colorCss}66` }}>
      <span className="ge-card__kicker">Needs your answer</span>
      <p>{q.text}</p>
      {q.options?.length ? (
        <div className="ge-chips">
          {q.options.map((o) => (
            <button key={o} type="button" className="ge-chip" onClick={() => answerQuestion(q.id, o)}>
              {o}
            </button>
          ))}
        </div>
      ) : null}
      <form onSubmit={submit} className="ge-inline-form">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Or answer in your own words…"
          aria-label="Answer"
        />
        <button className="ge-btn ge-btn--ghost ge-btn--sm" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}

/* ---------------- approval card (inline in chat) ---------------- */

const MOCK_LABEL: Partial<Record<StudioApproval['fromStatus'], string>> = {
  needs_design_review: 'Design frames · mobile / tablet / desktop',
  needs_prototype_review: 'Testing ground · prototype',
  needs_storybook_review: 'Component · every variant',
  needs_build_review: 'Preview branch — not live',
  needs_signoff: 'Testing ground · mobile / tablet / desktop',
};

function approveLabel(from: StudioApproval['fromStatus']) {
  if (from === 'needs_prototype_review') return 'Approve testing ground';
  if (from === 'needs_build_review') return 'Approve preview';
  if (from === 'needs_signoff') return 'Ship to live site';
  return 'Approve';
}

function openLabel(from: StudioApproval['fromStatus'], pageJob?: boolean) {
  if (from === 'needs_prototype_review') return 'Open testing ground';
  if (from === 'needs_build_review') return 'Open preview (not live)';
  if (from === 'needs_signoff') return pageJob ? 'Open testing ground · all sizes' : 'Open QA build';
  if (from === 'needs_design_review') return 'Open frames';
  if (from === 'needs_storybook_review') return pageJob ? 'Open testing ground' : 'Open Storybook';
  return 'Open';
}

export function ApprovalCard({ a, tasks }: { a: StudioApproval; tasks: StudioTask[] }) {
  const [note, setNote] = useState('');
  const project = getProject(a.projectId);
  const mock = project ? mockUrlFor(project, a.fromStatus) : null;
  const mustSee =
    a.fromStatus === 'needs_prototype_review' ||
    a.fromStatus === 'needs_build_review' ||
    a.fromStatus === 'needs_signoff';
  const seen = Boolean(project?.artifacts.openedPrototypeAt);
  if (a.decidedAt) {
    return (
      <div className={`ge-card ge-card--done ${a.decision === 'rejected' ? 'is-rejected' : 'is-approved'}`}>
        <span className="ge-card__kicker">{a.decision === 'approved' ? 'Approved' : 'Sent back'}</span>
        <p>{a.title}</p>
        {a.note ? <strong>“{a.note}”</strong> : null}
        {mock ? (
          <a className="ge-card__link" href={mock} target="_blank" rel="noreferrer">
            View what was {a.decision === 'approved' ? 'approved' : 'sent back'} ↗
          </a>
        ) : null}
      </div>
    );
  }
  return (
    <div className="ge-card ge-card--approval" id={`signoff-${a.id}`}>
      <span className="ge-card__kicker">Needs your sign-off</span>
      <h4>{a.title}</h4>
      <p>{a.summary}</p>
      <div className="ge-card__meta">
        {STATUS_LABEL[a.fromStatus]} → {STATUS_LABEL[a.toStatus]}
      </div>
      {mock ? (
        <>
          <a className="ge-btn ge-btn--sm" href={mock} target="_blank" rel="noreferrer">
            {openLabel(a.fromStatus, project ? usesTestingGround(project) : false)} ↗
          </a>
          <MockPreview url={mock} label={MOCK_LABEL[a.fromStatus]} />
        </>
      ) : null}
      {tasks.length ? (
        <div className="ge-deliverables">
          {tasks.map((t) => (
            <Deliverable key={t.id} task={t} />
          ))}
        </div>
      ) : null}
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note for the team (required to send back)"
        aria-label="Decision note"
      />
      {mustSee && !seen ? (
        <p className="ge-card__warn">Open the testing ground first. Nothing ships until you’ve clicked through it in the shell.</p>
      ) : null}
      <div className="ge-inline-actions">
        <button
          className="ge-btn ge-btn--sm"
          type="button"
          disabled={mustSee && !seen}
          onClick={() => decideApproval(a.id, 'approved', note)}
        >
          {approveLabel(a.fromStatus)}
        </button>
        <button
          className="ge-btn ge-btn--ghost ge-btn--sm"
          type="button"
          disabled={!note.trim()}
          onClick={() => decideApproval(a.id, 'rejected', note)}
        >
          Send back
        </button>
      </div>
    </div>
  );
}
