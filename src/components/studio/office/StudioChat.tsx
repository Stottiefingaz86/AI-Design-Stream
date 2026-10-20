'use client';

import { useEffect, useMemo, useRef, useState, type ClipboardEvent, type DragEvent, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { AGENTS, AGENT_BY_ID, STATUS_LABEL } from '@/lib/studio/agents';
import { STUDIO_NAME } from '@/lib/studio/brand';
import { FIGMA_ASK_STEPS, FIGMA_SELECTION_EXAMPLE } from '@/lib/studio/knowledge';
import { AGENT_WORKSPACES } from '@/lib/studio/workspaces';
import { streamCursorRun } from '@/lib/studio/cursor-client';
import { applyCursorEvent, emptyCursorActivity, isRetryableCursorError, originalAsk, resumeCursorPrompt, sanitizeAssistant } from '@/lib/studio/cursor-activity';
import { beginCursorJob, CHAT_COMMANDS, ensureChatSignoff, finishCursorJob, isAssumedQuestionKey, pulseCursorJob, recoverCursorJob, rollbackLive, sendCeoMessage, stalledCursorJob, stopCursorJob, type AgentState, type CursorJob } from '@/lib/studio/pipeline';
import { GENERAL_CHANNEL_ID, clearAgentChat, dmChannelId, loadStudioStore, markChannelRead, patchMessage, persistFigmaUrl, pushMessage, removeChannel, saveStudioStore, unreadCount } from '@/lib/studio/store';
import { traceSteps } from '@/lib/studio/work-trace';
import type {
  ChatAuthor,
  StudioAgentId,
  StudioAttachment,
  StudioChannel,
  StudioMessage,
  StudioProject,
  CursorActivity,
  StudioStoreSnapshot,
  StudioTask,
} from '@/lib/studio/types';
import { liveUrlFor, prototypeUrlFor } from '@/lib/studio/mock';
import { ApprovalCard, MockPreview, Progress, QuestionCard, projectHref } from './OfficePanels';

export interface StudioChatProps {
  snap: StudioStoreSnapshot;
  states: Record<StudioAgentId, AgentState>;
  channelId: string;
  onChannel: (id: string) => void;
  onClose: () => void;
  onWidthChange?: (width: number) => void;
  onResizing?: (resizing: boolean) => void;
}

const MOOD_LABEL: Record<AgentState['mood'], string> = {
  idle: 'idle',
  working: 'working',
  waiting_ceo: 'waiting on you',
  handoff: 'handing off',
};

function hhmm(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const same = d.toDateString() === today.toDateString();
  if (same) return 'Today';
  const y = new Date(today);
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
}

function authorMeta(author: ChatAuthor) {
  if (author === 'ceo') return { name: 'You', sub: 'Head of Design', color: 'linear-gradient(180deg,#ffc14a,#e83e8c)', initial: 'C' };
  if (author === 'system') return { name: 'Studio', sub: '', color: 'rgba(255,255,255,0.12)', initial: '•' };
  const a = AGENT_BY_ID[author];
  return { name: a.name, sub: a.role, color: a.colorCss, initial: a.name[0]! };
}

function Avatar({ author, size = 34 }: { author: ChatAuthor; size?: number }) {
  const m = authorMeta(author);
  return (
    <span className="ge-avatar" style={{ background: m.color, width: size, height: size, fontSize: size * 0.46 }}>
      {m.initial}
    </span>
  );
}

function FigmaAskCard() {
  return (
    <div className="ge-figma-ask">
      <strong>How to send the frame</strong>
      <ol>
        {FIGMA_ASK_STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <span>Example — 🐚 Shell, Dev Mode selection:</span>
      <a href={FIGMA_SELECTION_EXAMPLE} target="_blank" rel="noreferrer">
        {FIGMA_SELECTION_EXAMPLE}
      </a>
    </div>
  );
}

function WorkspacePins({ agentId }: { agentId: StudioAgentId }) {
  const links = AGENT_WORKSPACES[agentId] ?? [];
  if (!links.length) return null;
  return (
    <nav className="ge-workspace" aria-label={`${AGENT_BY_ID[agentId].name} workspace`}>
      {links.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
          {l.label} ↗
        </a>
      ))}
    </nav>
  );
}

/* ---------------- rail ---------------- */

function Rail({
  snap,
  states,
  channelId,
  onChannel,
  onClose,
}: StudioChatProps) {
  const channels = snap.channels.filter((c) => !c.archived);
  const general = channels.find((c) => c.id === GENERAL_CHANNEL_ID);
  const projects = new Map(snap.projects.map((p) => [p.id, p]));
  const projectChannels = channels.filter((c) => {
    if (c.kind !== 'project') return false;
    const p = c.projectId ? projects.get(c.projectId) : undefined;
    return !p?.archivedAt;
  });
  const custom = channels.filter((c) => c.kind === 'custom');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const item = (c: StudioChannel) => {
    const n = unreadCount(snap, c.id);
    const needs =
      c.projectId && snap.approvals.some((a) => a.projectId === c.projectId && !a.decidedAt);
    const removable = c.kind !== 'general';
    return (
      <div
        key={c.id}
        className={`ge-rail__row ${channelId === c.id ? 'is-on' : ''} ${n ? 'has-unread' : ''}`}
      >
        <button type="button" className="ge-rail__item" onClick={() => onChannel(c.id)}>
          <span className="ge-rail__hash">#</span>
          <span className="ge-rail__name">{c.name}</span>
          {needs ? <span className="ge-rail__needs" title="Waiting on you" /> : null}
          {n ? <span className="ge-rail__badge">{n}</span> : null}
        </button>
        {removable ? (
          <button
            type="button"
            className="ge-rail__remove"
            aria-label={`Remove #${c.name}`}
            title="Remove channel"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!removeChannel(c.id)) return;
              if (channelId === c.id) onChannel(GENERAL_CHANNEL_ID);
            }}
          >
            ×
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <div className="ge-rail">
      <header className="ge-rail__head">
        <div>
          <strong>{STUDIO_NAME}</strong>
          <small>7 online · you sign off</small>
        </div>
        <button type="button" className="ge-iconbtn" onClick={onClose} aria-label="Close chat">
          ×
        </button>
      </header>

      <section>
        <h5>Channels</h5>
        {general ? item(general) : null}
        {projectChannels.map((c) => item(c))}
        {custom.map((c) => item(c))}
        {adding ? (
          <form
            className="ge-rail__add"
            onSubmit={(e) => {
              e.preventDefault();
              if (newName.trim()) {
                sendCeoMessage(channelId, `/channel ${newName.trim()}`);
                setNewName('');
                setAdding(false);
              }
            }}
          >
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="channel-name"
              aria-label="New channel name"
            />
          </form>
        ) : (
          <div className="ge-rail__actions">
            <button type="button" className="ge-rail__item ge-rail__item--ghost" onClick={() => setAdding(true)}>
              <span className="ge-rail__hash">+</span>
              <span className="ge-rail__name">New channel</span>
            </button>
            <a className="ge-rail__item ge-rail__item--ghost" href="/new">
              <span className="ge-rail__hash">+</span>
              <span className="ge-rail__name">New brief</span>
            </a>
          </div>
        )}
      </section>

      <section>
        <h5>Direct messages</h5>
        {AGENTS.map((a) => {
          const id = dmChannelId(a.id);
          const n = unreadCount(snap, id);
          const s = states[a.id];
          return (
            <div key={a.id} className={`ge-rail__row ${channelId === id ? 'is-on' : ''} ${n ? 'has-unread' : ''}`}>
              <button
                type="button"
                className="ge-rail__item"
                onClick={() => onChannel(id)}
              >
                <span className={`ge-presence ge-presence--${s.mood}`} style={{ background: a.colorCss }} />
                {s.mood === 'working' ? (
                  <i className="ge-poll" aria-hidden="true" title="Working">
                    <span />
                    <span />
                    <span />
                  </i>
                ) : null}
                <span className="ge-rail__name">
                  {a.name} <small>{a.role}</small>
                </span>
                {s.mood === 'waiting_ceo' ? <span className="ge-rail__needs" title="Waiting on you" /> : null}
                {n ? <span className="ge-rail__badge">{n}</span> : null}
              </button>
              {n || snap.messages.some((m) => m.channelId === id) ? (
                <button
                  type="button"
                  className="ge-rail__remove"
                  aria-label={`Clear chat with ${a.name}`}
                  title="Clear chat"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    clearAgentChat(a.id);
                    if (channelId === id) onChannel(GENERAL_CHANNEL_ID);
                  }}
                >
                  ×
                </button>
              ) : null}
            </div>
          );
        })}
      </section>

      <footer className="ge-rail__foot">
        <span>{projects.size} brief{projects.size === 1 ? '' : 's'} in flight</span>
        <span>Lumen-only · simulated work</span>
      </footer>
    </div>
  );
}

/* ---------------- thread ---------------- */

function ThreadHeader({
  snap,
  states,
  channelId,
}: {
  snap: StudioStoreSnapshot;
  states: Record<StudioAgentId, AgentState>;
  channelId: string;
}) {
  if (channelId.startsWith('dm:')) {
    const id = channelId.slice(3) as StudioAgentId;
    const a = AGENT_BY_ID[id];
    const s = states[id];
    if (!a) return null;
    return (
      <header className="ge-thread__head ge-thread__head--agent">
        <Avatar author={id} size={40} />
        <div className="ge-thread__who">
          <strong>
            {a.name} <small>{a.role}</small>
          </strong>
          <span className={`ge-mood ge-mood--${s.mood}`}>{MOOD_LABEL[s.mood]}</span>
        </div>
        <div className="ge-thread__doing">
          {s.activeTask ? (
            <>
              <div className="ge-task__row">
                <span>{s.activeTask.title}</span>
                <span>{Math.round(s.activeTask.progress)}%</span>
              </div>
              <Progress value={s.activeTask.progress} color={a.colorCss} />
              <small>{s.projectTitle}</small>
            </>
          ) : (
            <small>{s.queue.length ? `Next: ${s.queue[0]!.title}` : a.blurb}</small>
          )}
        </div>
        {s.mood === 'working' ? (
          <button type="button" className="ge-status ge-status--action" onClick={() => stopActiveCursor(id)}>
            Stop
          </button>
        ) : null}
        <button
          type="button"
          className="ge-status"
          title="Clear this DM"
          onClick={() => {
            clearAgentChat(id);
          }}
        >
          Clear
        </button>
        <WorkspacePins agentId={id} />
      </header>
    );
  }
  const ch = snap.channels.find((c) => c.id === channelId);
  const project =
    (ch?.projectId ? snap.projects.find((p) => p.id === ch.projectId) : null) ??
    snap.projects.find((p) => p.homeChannelId === channelId) ??
    null;
  const active = project ? snap.tasks.filter((t) => t.projectId === project.id && t.status === 'active') : [];
  const pending = project ? snap.approvals.find((a) => a.projectId === project.id && !a.decidedAt) : null;
  const proto = project ? prototypeUrlFor(project) : null;
  return (
    <header className="ge-thread__head">
      <div className="ge-thread__who">
        <strong>
          <span className="ge-rail__hash">#</span>
          {ch?.name ?? channelId}
        </strong>
        <small>{ch?.topic}</small>
      </div>
      {project ? (
        <div className="ge-thread__project">
          {pending ? (
            <button
              type="button"
              className="ge-status ge-status--action"
              onClick={() => document.getElementById(`signoff-${pending.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            >
              {STATUS_LABEL[project.status]}
            </button>
          ) : (
            <span className="ge-status">{STATUS_LABEL[project.status]}</span>
          )}
          {active.map((t) => (
            <span key={t.id} className="ge-thread__active" title={t.title}>
              <span className="ge-dot" style={{ background: AGENT_BY_ID[t.agentId].colorCss }} />
              {Math.round(t.progress)}%
            </span>
          ))}
          <a href={projectHref(project.id)}>Open project</a>
          {proto ? (
            <a href={proto} target="_blank" rel="noreferrer">
              Testing ground ↗
            </a>
          ) : null}
          {project.status === 'live' && liveUrlFor(project) ? (
            <a href={liveUrlFor(project)!} target="_blank" rel="noreferrer">
              Live site ↗
            </a>
          ) : null}
          {active.some((t) => t.title.startsWith('Cursor run')) ? (
            <button type="button" className="ge-status ge-status--action" onClick={() => stopActiveCursor()}>
              Stop
            </button>
          ) : null}
          {project.status === 'live' ? (
            <button type="button" className="ge-status ge-status--action" onClick={() => void rollbackLive(project.id)}>
              Rollback
            </button>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

const streamedSeen = new Set<string>();

function StreamedText({ id, text, createdAt }: { id: string; text: string; createdAt: string }) {
  const prev = useRef(text);
  const growing = text.startsWith(prev.current) && text.length > prev.current.length;
  prev.current = text;
  const stale = Date.now() - Date.parse(createdAt) > 12_000;
  const [shown, setShown] = useState(() => (stale || streamedSeen.has(id) || growing ? text : ''));

  useEffect(() => {
    if (growing) {
      streamedSeen.add(id);
      setShown(text);
      return;
    }
    if (stale || streamedSeen.has(id)) {
      setShown(text);
      return;
    }
    let cancelled = false;
    const parts = text.match(/[^\n]+|\n+/g) ?? [text];
    let i = 0;
    let acc = '';
    const typeLine = () => {
      if (cancelled) return;
      if (i >= parts.length) {
        streamedSeen.add(id);
        setShown(text);
        return;
      }
      const part = parts[i++]!;
      if (/^\n+$/.test(part)) {
        acc += part;
        setShown(acc);
        window.setTimeout(typeLine, 70);
        return;
      }
      const words = part.split(/(\s+)/);
      let w = 0;
      const tick = () => {
        if (cancelled) return;
        if (w >= words.length) {
          window.setTimeout(typeLine, 140);
          return;
        }
        acc += words[w++]!;
        setShown(acc);
        window.setTimeout(tick, 22);
      };
      tick();
    };
    typeLine();
    return () => {
      cancelled = true;
    };
  }, [id, text, createdAt, growing, stale]);

  const live = shown !== text || growing;
  return (
    <p>
      {shown}
      {live ? <span className="ge-caret" aria-hidden="true" /> : null}
    </p>
  );
}

function MessageBody({ m, snap, channelId }: { m: StudioMessage; snap: StudioStoreSnapshot; channelId: string }) {
  if (m.kind === 'question' && m.refId) {
    const q = snap.questions.find((x) => x.id === m.refId);
    if (!q || isAssumedQuestionKey(q.answerKey)) return null;
    return <QuestionCard q={q} />;
  }
  if (m.kind === 'approval' && m.refId) {
    const a = snap.approvals.find((x) => x.id === m.refId);
    if (a) {
      const tasks = a.taskIds.map((id) => snap.tasks.find((t) => t.id === id)).filter(Boolean) as StudioTask[];
      return <ApprovalCard a={a} tasks={tasks} />;
    }
  }
  if (m.kind === 'prototype') {
    const project = m.projectId ? snap.projects.find((p) => p.id === m.projectId) : null;
    const url = project ? `/prototype?id=${encodeURIComponent(project.id)}&ground=1` : null;
    return (
      <div className="ge-msg__text ge-msg__text--prototype">
        <small>Testing ground</small>
        <p>{m.text}</p>
        {url ? (
          <a className="ge-btn ge-btn--sm" href={url} target="_blank" rel="noreferrer">
            Open the prototype ↗
          </a>
        ) : null}
        {url ? <MockPreview url={url} label="Testing ground" /> : null}
      </div>
    );
  }
  if (m.kind === 'live') {
    const project = m.projectId ? snap.projects.find((p) => p.id === m.projectId) : null;
    const url = project ? liveUrlFor(project) : null;
    return (
      <div className="ge-msg__text ge-msg__text--live">
        <small>Live site</small>
        <p>{m.text.replace(/\s*→\s*\S+?(?=\.(\s|$))/, '')}</p>
        {url ? (
          <a className="ge-btn ge-btn--sm" href={url} target="_blank" rel="noreferrer">
            Open the live site ↗
          </a>
        ) : null}
        {project?.artifacts.rollbackId || project?.status === 'live' ? (
          <button type="button" className="ge-btn ge-btn--ghost ge-btn--sm" onClick={() => void rollbackLive(project!.id)}>
            Rollback
          </button>
        ) : null}
        {url ? <MockPreview url={url} label="Live site" /> : null}
      </div>
    );
  }
  if (m.kind === 'escalation') {
    const project = m.projectId ? snap.projects.find((p) => p.id === m.projectId) : null;
    const esc = project?.escalation?.id === m.refId ? project.escalation : project?.escalation;
    const resolved = Boolean(esc?.resolvedAt && esc.id === m.refId);
    return (
      <div className={`ge-msg__text ge-msg__text--escalation ${resolved ? 'is-resolved' : ''} ${esc?.kind === 'figma' ? 'is-figma' : ''}`}>
        <small>{resolved ? 'Got the reference' : esc?.kind === 'figma' ? 'Needs a Figma frame' : 'Needs a human'}</small>
        <p>{m.text}</p>
        {!resolved && esc?.kind === 'figma' ? <FigmaAskCard /> : null}
        {!resolved && project && esc?.kind !== 'figma' ? <a href={projectHref(project.id)}>Add a reference on the brief →</a> : null}
      </div>
    );
  }
  if (m.kind === 'cursor' && m.activity) {
    return <CursorActivityCard activity={m.activity} channelId={channelId} />;
  }
  return (
    <div className={`ge-msg__text ${m.kind === 'standup' ? 'ge-msg__text--standup' : ''}`}>
      {m.text ? (
        m.author === 'ceo' ? (
          <p>{m.text}</p>
        ) : (
          <StreamedText id={m.id} text={m.text} createdAt={m.createdAt} />
        )
      ) : null}
      {m.attachments?.length ? (
        <div className="ge-msg__shots">
          {m.attachments.map((a) => (
            <a key={a.dataUrl.slice(-24)} href={a.dataUrl} target="_blank" rel="noreferrer">
              <img src={a.dataUrl} alt={a.name} />
              <span>{a.name}</span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

const launching = new Set<string>();
const lastJobs = new Map<string, CursorJob>();
const autoAttempts = new Map<string, number>();
const LAST_JOB_KEY = 'design-studio:last-cursor';
let activeAbort: AbortController | null = null;
let runGen = 0;

export function stopActiveCursor(agentId?: StudioAgentId) {
  activeAbort?.abort();
  activeAbort = null;
  runGen += 1;
  launching.clear();
  autoAttempts.clear();
  stopCursorJob(agentId, 'Stopped by you.');
  void fetch('/api/studio/stop', { method: 'POST' }).catch(() => {
    /* server may already have dropped the run */
  });
}

function slimImages(imgs?: StudioAttachment[]) {
  return (imgs ?? []).filter((a) => a.dataUrl.length < 400_000).slice(0, 1);
}

function rememberJob(channelId: string, job: CursorJob) {
  const stored = { ...job, prompt: originalAsk(job.prompt) };
  lastJobs.set(channelId, stored);
  lastJobs.set('__last__', stored);
  try {
    sessionStorage.setItem(LAST_JOB_KEY, JSON.stringify({ channelId, job: { ...stored, attachments: undefined } }));
  } catch {
    /* quota */
  }
}

function recalledJob(channelId: string): CursorJob | null {
  const mem = lastJobs.get(channelId) ?? lastJobs.get('__last__');
  if (mem) return mem;
  try {
    const raw = sessionStorage.getItem(LAST_JOB_KEY);
    if (!raw) return recoverCursorJob(channelId);
    const parsed = JSON.parse(raw) as { channelId: string; job: CursorJob };
    if (parsed.job?.prompt) return parsed.job;
  } catch {
    /* ignore */
  }
  return recoverCursorJob(channelId);
}

export function retryLastCursorJob(channelId: string) {
  activeAbort?.abort();
  launching.clear();
  const job = recalledJob(channelId);
  if (!job) {
    const s = loadStudioStore();
    pushMessage(s, {
      channelId,
      author: 'system',
      kind: 'system',
      text: 'Nothing to retry — send the ask again.',
    });
    saveStudioStore(s);
    return false;
  }
  const snap = loadStudioStore();
  const project = job.projectId ? snap.projects.find((p) => p.id === job.projectId) : null;
  const images = slimImages(
    job.attachments ??
      project?.references
        .filter((r) => r.kind === 'image')
        .slice(0, 1)
        .map((r) => ({ kind: 'image' as const, name: r.label, dataUrl: r.value })),
  );
  launchCursorJob(
    {
      ...job,
      attachments: images.length ? images : undefined,
      prompt: resumeCursorPrompt(job.prompt),
    },
    channelId,
    { resume: true },
  );
  return true;
}

export function launchCursorJob(job: CursorJob, channelId: string, opts?: { resume?: boolean }) {
  activeAbort?.abort();
  const ac = new AbortController();
  activeAbort = ac;
  const seq = ++runGen;
  const key = `${channelId}:${job.projectId ?? ''}:${job.title}`;
  launching.clear();
  launching.add(key);
  rememberJob(channelId, job);
  const existing = opts?.resume
    ? [...loadStudioStore().messages].reverse().find((m) => m.channelId === channelId && m.kind === 'cursor')?.id
    : undefined;
  const msgId =
    existing ??
    beginCursorJob({
      agentId: job.agentId,
      projectId: job.projectId ?? '',
      title: job.title,
      channelId,
    });
  if (existing) {
    patchMessage(existing, { activity: emptyCursorActivity(), text: 'Reconnecting…' });
  }
  let activity = emptyCursorActivity();
  let assistant = '';
  let replyId: string | null = null;
  const commit = () =>
    patchMessage(msgId, { activity: { ...activity, files: activity.files.map((f) => ({ ...f })) }, text: activity.summary });
  const streamReply = (raw: string) => {
    const clean = sanitizeAssistant(raw).trim();
    if (!clean) return;
    if (!replyId) {
      const s = loadStudioStore();
      replyId = pushMessage(s, {
        channelId,
        author: job.agentId,
        text: clean,
        kind: 'text',
        projectId: job.projectId,
      }).id;
      saveStudioStore(s);
      streamedSeen.add(replyId);
      return;
    }
    patchMessage(replyId, { text: clean });
  };

  const stale = () => seq !== runGen || ac.signal.aborted;

  const failOut = (text: string) => {
    if (stale()) return;
    const attempt = autoAttempts.get(key) ?? 0;
    if (isRetryableCursorError(text) && attempt < 5) {
      autoAttempts.set(key, attempt + 1);
      activity = { ...activity, live: true, thinking: 'Reconnecting…', retryable: false, error: undefined };
      commit();
      window.setTimeout(() => {
        if (seq === runGen) retryLastCursorJob(channelId);
      }, 2000 + attempt * 600);
      return;
    }
    finishCursorJob(job.agentId, false, text, job.mode);
    launching.delete(key);
    if (/Figma MCP was never called|generate_diagram never ran|never designed in-file/i.test(text)) {
      const s = loadStudioStore();
      pushMessage(s, {
        channelId,
        author: job.agentId,
        text,
        kind: 'text',
        projectId: job.projectId,
      });
      saveStudioStore(s);
    }
  };

  void streamCursorRun(
    job,
    (ev) => {
      if (stale()) return;
      if (ev.type === 'tool' || ev.type === 'thinking' || ev.type === 'status') pulseCursorJob(job.agentId);
      if (ev.type === 'status' && /^(CREATING|RUNNING|FINISHED|CANCELLED|heartbeat)$/i.test(ev.text ?? '')) return;
      if (ev.type === 'assistant') {
        assistant += ev.text ?? '';
        streamReply(assistant);
        return;
      }
      activity = applyCursorEvent(activity, ev);
      commit();
      if (ev.type === 'done') {
        autoAttempts.delete(key);
        finishCursorJob(job.agentId, true, ev.text, job.mode);
        launching.delete(key);
        const reply = sanitizeAssistant((assistant || ev.text || '').trim());
        if (reply) {
          streamReply(reply);
          if (job.projectId) persistFigmaUrl(job.projectId, reply);
        }
      }
      if (ev.type === 'error') failOut(ev.text);
    },
    ac.signal,
  )
    .catch((err) => {
      if (stale()) return;
      const text = err instanceof Error ? err.message : 'Connection dropped mid-run.';
      activity = applyCursorEvent(activity, { type: 'error', text });
      commit();
      failOut(text);
    })
    .finally(() => {
      if (seq === runGen) launching.delete(key);
    });
}

/** Starts a stalled Cursor job even when the chat drawer is closed. */
export function CursorRunner({ channelId }: { channelId: string }) {
  useEffect(() => {
    const snap = loadStudioStore();
    const ids = new Set<string>([channelId, ...snap.channels.map((c) => c.id), ...snap.messages.map((m) => m.channelId)]);
    for (const id of ids) {
      const job = stalledCursorJob(id);
      if (job) {
        launchCursorJob(job, id);
        break;
      }
    }
  }, [channelId]);
  return null;
}

function CursorActivityCard({ activity, channelId }: { activity: CursorActivity; channelId: string }) {
  return (
    <div className="ge-cursor">
      {activity.summary ? <p className="ge-cursor__sum">{activity.summary}</p> : null}
      {activity.files.map((f) => (
        <article key={f.path} className="ge-cursor__file">
          <header>
            <span className="ge-cursor__lang">{f.lang ?? 'file'}</span>
            <strong>{f.path.split('/').pop()}</strong>
            {f.add != null ? <b>+{f.add}</b> : null}
            {f.del ? <i>-{f.del}</i> : null}
          </header>
          {f.lines?.length ? (
            <pre>
              {f.lines.map((l, i) => (
                <div key={`${l.n}-${i}`} className={l.mark === '+' ? 'is-add' : l.mark === '-' ? 'is-del' : undefined}>
                  <em>{l.n}</em>
                  <span>
                    {l.mark && l.mark !== ' ' ? `${l.mark} ` : ''}
                    {l.text}
                  </span>
                </div>
              ))}
            </pre>
          ) : null}
        </article>
      ))}
      {activity.thinking ? (
        <p className="ge-cursor__think">
          {activity.live && activity.thinking === 'Thinking…' ? <PollDots /> : null}
          {activity.thinking}
        </p>
      ) : activity.live ? (
        <p className="ge-cursor__think">
          <PollDots />
          Thinking…
        </p>
      ) : null}
      {activity.live ? (
        <div className="ge-cursor__fail">
          <button type="button" className="ge-cursor__retry" onClick={() => stopActiveCursor()}>
            Stop
          </button>
        </div>
      ) : null}
      {activity.retryable && !activity.live ? (
        <div className="ge-cursor__fail">
          <span>{activity.error || 'Connection dropped mid-run.'}</span>
          <button type="button" onClick={() => retryLastCursorJob(channelId)}>
            Retry
          </button>
        </div>
      ) : null}
    </div>
  );
}

function PollDots() {
  return (
    <i className="ge-poll" aria-hidden="true">
      <span />
      <span />
      <span />
    </i>
  );
}

function WorkTrace({
  states,
  snap,
  channelId,
  typing,
}: {
  states: Record<StudioAgentId, AgentState>;
  snap: StudioStoreSnapshot;
  channelId: string;
  typing: StudioAgentId[];
}) {
  const project =
    snap.channels.find((c) => c.id === channelId)?.projectId
      ? snap.projects.find((p) => p.id === snap.channels.find((c) => c.id === channelId)?.projectId)
      : snap.projects.find((p) => p.homeChannelId === channelId && !['live', 'cancelled', 'failed'].includes(p.status));

  const ids = AGENTS.map((a) => a.id).filter((id) => {
    const s = states[id];
    const queuedHere = s.queue.some((t) => project && t.projectId === project.id && (t.status === 'queued' || t.status === 'active'));
    if (typing.includes(id)) return true;
    if (queuedHere) return true;
    if (s.activeTask?.title.startsWith('Cursor run')) return false;
    if (s.mood !== 'working' || !s.activeTask) return false;
    if (channelId === `dm:${id}`) return true;
    if (project && s.activeTask.projectId === project.id) return true;
    if (s.activeTask && snap.projects.find((p) => p.id === s.activeTask!.projectId)?.homeChannelId === channelId) return true;
    return channelId === GENERAL_CHANNEL_ID;
  });
  if (!ids.length) return null;

  return (
    <div className="ge-traces" aria-live="polite">
      {ids.map((id) => {
        const s = states[id];
        const agent = AGENT_BY_ID[id];
        const job =
          (s.activeTask && snap.projects.find((p) => p.id === s.activeTask!.projectId)) ?? (project as StudioProject | undefined) ?? null;
        const steps = traceSteps(s, job);
        return (
          <article key={id} className="ge-trace">
            <header>
              <Avatar author={id} size={22} />
              <strong>{agent.name}</strong>
              <small>{agent.role}</small>
              <PollDots />
              <em>{s.activeTask ? `${Math.round(s.activeTask.progress)}%` : 'thinking'}</em>
            </header>
            {s.activeTask ? (
              <p className="ge-trace__doing">{s.activeTask.title}</p>
            ) : s.queue[0] ? (
              <p className="ge-trace__doing">Up next · {s.queue[0].title}</p>
            ) : null}
            <ul>
              {steps.map((step) => (
                <li key={step.id}>
                  <span>{step.label}</span>
                  {step.files?.map((f) => (
                    <button type="button" key={f.name} className="ge-trace__file" tabIndex={-1}>
                      <code>{f.name.split('/').pop()}</code>
                      {f.add != null ? <b>+{f.add}</b> : null}
                      {f.del ? <i>-{f.del}</i> : null}
                    </button>
                  ))}
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}

async function filesToImages(files: File[]): Promise<StudioAttachment[]> {
  const out: StudioAttachment[] = [];
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const bitmap = await createImageBitmap(file);
    const max = 1280;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
    out.push({
      kind: 'image',
      name: file.name || 'paste.png',
      dataUrl: canvas.toDataURL('image/jpeg', 0.76),
    });
  }
  return out;
}

function Thread(props: StudioChatProps) {
  const { snap, channelId } = props;
  const logRef = useRef<HTMLDivElement | null>(null);
  const stickRef = useRef(true);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<StudioAttachment[]>([]);
  const [typing, setTyping] = useState<StudioAgentId[]>([]);
  const messages = useMemo(
    () => snap.messages.filter((m) => m.channelId === channelId),
    [snap.messages, channelId],
  );
  const lastId = messages.at(-1)?.id;

  const stickIfNeeded = (force = false) => {
    const el = logRef.current;
    if (!el) return;
    if (!force && !stickRef.current) return;
    el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    markChannelRead(channelId);
  }, [channelId, lastId]);

  useEffect(() => {
    stickRef.current = true;
    stickIfNeeded(true);
  }, [channelId]);

  useEffect(() => {
    stickIfNeeded();
  }, [lastId, typing]);

  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    const inner = el.firstElementChild;
    if (!inner) return;
    const ro = new ResizeObserver(() => stickIfNeeded());
    ro.observe(inner);
    return () => ro.disconnect();
  }, [channelId]);

  useEffect(() => {
    setTyping([]);
  }, [channelId]);

  useEffect(() => {
    const last = messages.find((m) => m.id === lastId);
    if (!last || last.author === 'ceo' || last.author === 'system') return;
    setTyping((ids) => ids.filter((id) => id !== last.author));
  }, [lastId, messages]);

  const addFiles = async (list: FileList | File[]) => {
    const imgs = await filesToImages(Array.from(list));
    if (imgs.length) setPending((cur) => [...cur, ...imgs].slice(0, 6));
  };

  useEffect(() => {
    const job = stalledCursorJob(channelId);
    if (job) {
      setTyping((ids) => (ids.includes(job.agentId) ? ids : [...ids, job.agentId]));
      launchCursorJob(job, channelId);
    }
    ensureChatSignoff(channelId);
  }, [channelId]);

  const send = () => {
    const text = draft.trim();
    if (!text && !pending.length) return;
    stickRef.current = true;
    if (/^\/stop\b/i.test(text)) {
      const who = channelId.startsWith('dm:') ? (channelId.slice(3) as StudioAgentId) : undefined;
      stopActiveCursor(who);
    }
    const result = sendCeoMessage(channelId, text, pending);
    setDraft('');
    setPending([]);
    if (result.typing.length) setTyping(result.typing);
    if (result.cursor) launchCursorJob(result.cursor, channelId);
    requestAnimationFrame(() => stickIfNeeded(true));
  };

  const onPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    e.preventDefault();
    void addFiles(files);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('image/'));
    if (files.length) void addFiles(files);
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const showCmds = draft.startsWith('/') && !draft.includes(' ');
  const cmdMatches = showCmds ? CHAT_COMMANDS.filter((c) => c.cmd.startsWith(draft.toLowerCase())) : [];

  const dmAgent = channelId.startsWith('dm:') ? (channelId.slice(3) as StudioAgentId) : null;
  const channelProjectId =
    snap.channels.find((c) => c.id === channelId)?.projectId ??
    snap.projects.find((p) => p.homeChannelId === channelId)?.id;
  const pinnedA = (dmAgent
    ? snap.approvals.filter((a) => a.agentId === dmAgent && !a.decidedAt)
    : snap.approvals.filter((a) => {
        if (a.decidedAt) return false;
        const p = snap.projects.find((x) => x.id === a.projectId);
        if (!p || p.archivedAt) return false;
        if (channelProjectId && a.projectId === channelProjectId) return true;
        return p.homeChannelId === channelId;
      })
  );
  const visible = messages.filter((m) => {
    if (m.kind !== 'question' || !m.refId) return true;
    const q = snap.questions.find((x) => x.id === m.refId);
    return Boolean(q && !isAssumedQuestionKey(q.answerKey));
  });

  let lastAuthor: ChatAuthor | null = null;
  let lastTime = 0;
  let lastDay = '';
  const dmName = dmAgent ? AGENT_BY_ID[dmAgent]?.name : null;
  const chName = snap.channels.find((c) => c.id === channelId)?.name;

  return (
    <div className="ge-thread">
      <ThreadHeader snap={snap} states={props.states} channelId={channelId} />
      {pinnedA.length ? (
        <div className="ge-attention" role="status">
          <strong>Needs you</strong>
          {pinnedA.map((a) => (
            <div key={a.id} className="ge-attention__row">
              <span>{a.title}</span>
              <button
                type="button"
                onClick={() =>
                  document.getElementById(`signoff-${a.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
              >
                Review
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <div
        className="ge-thread__log"
        ref={logRef}
        onScroll={() => {
          const el = logRef.current;
          if (!el) return;
          stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 96;
        }}
      >
        <div className="ge-thread__log-inner">
        {visible.length === 0 ? (
          <div className="ge-thread__empty">
            {dmName ? (
              <>
                <p>This is the start of your DM with {dmName}.</p>
                <small>Try “what are you doing?”, “ETA?”, “is this all Lumen?”</small>
              </>
            ) : (
              <>
                <p>Welcome to #{chName}.</p>
                <small>Ask the team to do something — “can you add a sub-nav on casino?” — or /standup /status /help</small>
              </>
            )}
          </div>
        ) : null}
        {visible.map((m) => {
          const t = Date.parse(m.createdAt);
          const day = dayLabel(m.createdAt);
          const showDay = day !== lastDay;
          lastDay = day;
          const grouped = !showDay && m.author === lastAuthor && t - lastTime < 3 * 60_000 && m.kind !== 'system';
          lastAuthor = m.author;
          lastTime = t;
          if (m.author === 'system' || m.kind === 'system') {
            const retryable = isRetryableCursorError(m.text);
            return (
              <div key={m.id}>
                {showDay ? <div className="ge-thread__day">{day}</div> : null}
                <div className={`ge-msg ge-msg--system ${retryable ? 'ge-msg--fail' : ''}`}>
                  <span>{retryable ? 'Connection dropped mid-run.' : m.text}</span>
                  {retryable ? (
                    <button type="button" className="ge-cursor__retry" onClick={() => retryLastCursorJob(channelId)}>
                      Retry
                    </button>
                  ) : null}
                </div>
              </div>
            );
          }
          const meta = authorMeta(m.author);
          return (
            <div key={m.id}>
              {showDay ? <div className="ge-thread__day">{day}</div> : null}
              <div className={`ge-msg ${grouped ? 'ge-msg--grouped' : ''} ${m.author === 'ceo' ? 'ge-msg--ceo' : ''}`}>
                <div className="ge-msg__gutter">
                  {grouped ? <time>{hhmm(m.createdAt)}</time> : <Avatar author={m.author} />}
                </div>
                <div className="ge-msg__main">
                  {grouped ? null : (
                    <div className="ge-msg__head">
                      <strong>{meta.name}</strong>
                      {meta.sub ? <small>{meta.sub}</small> : null}
                      <time>{hhmm(m.createdAt)}</time>
                    </div>
                  )}
                  <MessageBody m={m} snap={snap} channelId={channelId} />
                </div>
              </div>
            </div>
          );
        })}
        <WorkTrace states={props.states} snap={snap} channelId={channelId} typing={typing} />
        </div>
      </div>
      <div className="ge-composer">
        {cmdMatches.length ? (
          <div className="ge-composer__cmds">
            {cmdMatches.map((c) => (
              <button
                key={c.cmd}
                type="button"
                onClick={() => setDraft(`${c.cmd}${c.args ? ' ' : ''}`)}
              >
                <code>
                  {c.cmd} {c.args ?? ''}
                </code>
                <span>{c.help}</span>
              </button>
            ))}
          </div>
        ) : null}
        <div
          className="ge-composer__box"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          {pending.length ? (
            <div className="ge-composer__shots">
              {pending.map((img, i) => (
                <button
                  key={`${img.name}-${i}`}
                  type="button"
                  className="ge-composer__shot"
                  onClick={() => setPending((cur) => cur.filter((_, j) => j !== i))}
                  title="Remove"
                >
                  <img src={img.dataUrl} alt={img.name} />
                </button>
              ))}
            </div>
          ) : null}
          <div className="ge-composer__row">
            <textarea
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKey}
              onPaste={onPaste}
              placeholder={dmName ? `Message ${dmName} — paste a screenshot or Figma link` : `Message #${chName ?? ''} — paste a screenshot or Figma selection`}
              aria-label="Message"
            />
            <button type="button" className="ge-btn ge-btn--sm" onClick={send} disabled={!draft.trim() && !pending.length}>
              Send
            </button>
          </div>
        </div>
        <small className="ge-composer__hint">Paste or drop an image · Enter to send · Shift+Enter newline · / for commands</small>
      </div>
    </div>
  );
}

/* ---------------- dock ---------------- */

const CHAT_MIN = 480;
const CHAT_MAX = 1100;

export function StudioChat(props: StudioChatProps) {
  const drag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    props.onResizing?.(true);
    const move = (ev: PointerEvent) => {
      const max = Math.min(CHAT_MAX, window.innerWidth - 220);
      props.onWidthChange?.(Math.round(Math.min(max, Math.max(CHAT_MIN, window.innerWidth - ev.clientX))));
    };
    const up = () => {
      props.onResizing?.(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <aside className="ge-slack" aria-label="Studio chat">
      <div
        className="ge-slack__resize"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize chat"
        onPointerDown={drag}
      />
      <Rail {...props} />
      <Thread {...props} />
    </aside>
  );
}
