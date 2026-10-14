'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { AGENTS, AGENT_BY_ID, STATUS_LABEL } from '@/lib/studio/agents';
import { STUDIO_NAME } from '@/lib/studio/brand';
import { FIGMA_ASK_STEPS, FIGMA_SELECTION_EXAMPLE } from '@/lib/studio/knowledge';
import { AGENT_WORKSPACES } from '@/lib/studio/workspaces';
import { CHAT_COMMANDS, sendCeoMessage, type AgentState } from '@/lib/studio/pipeline';
import { GENERAL_CHANNEL_ID, dmChannelId, markChannelRead, unreadCount } from '@/lib/studio/store';
import type {
  ChatAuthor,
  StudioAgentId,
  StudioChannel,
  StudioMessage,
  StudioStoreSnapshot,
  StudioTask,
} from '@/lib/studio/types';
import { ApprovalCard, MockPreview, Progress, QuestionCard, projectHref } from './OfficePanels';

export interface StudioChatProps {
  snap: StudioStoreSnapshot;
  states: Record<StudioAgentId, AgentState>;
  channelId: string;
  onChannel: (id: string) => void;
  onClose: () => void;
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
  const channels = snap.channels;
  const general = channels.find((c) => c.id === GENERAL_CHANNEL_ID);
  const projectChannels = channels.filter((c) => c.kind === 'project');
  const custom = channels.filter((c) => c.kind === 'custom');
  const projects = new Map(snap.projects.map((p) => [p.id, p]));
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const item = (c: StudioChannel, extra?: React.ReactNode) => {
    const n = unreadCount(snap, c.id);
    const needs =
      c.projectId &&
      (snap.questions.some((q) => q.projectId === c.projectId && !q.answeredAt) ||
        snap.approvals.some((a) => a.projectId === c.projectId && !a.decidedAt));
    return (
      <button
        key={c.id}
        type="button"
        className={`ge-rail__item ${channelId === c.id ? 'is-on' : ''} ${n ? 'has-unread' : ''}`}
        onClick={() => onChannel(c.id)}
      >
        <span className="ge-rail__hash">#</span>
        <span className="ge-rail__name">{c.name}</span>
        {needs ? <span className="ge-rail__needs" title="Waiting on you" /> : null}
        {n ? <span className="ge-rail__badge">{n}</span> : null}
        {extra}
      </button>
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
            <button
              key={a.id}
              type="button"
              className={`ge-rail__item ${channelId === id ? 'is-on' : ''} ${n ? 'has-unread' : ''}`}
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
        <WorkspacePins agentId={id} />
      </header>
    );
  }
  const ch = snap.channels.find((c) => c.id === channelId);
  const project = ch?.projectId ? snap.projects.find((p) => p.id === ch.projectId) : null;
  const active = project ? snap.tasks.filter((t) => t.projectId === project.id && t.status === 'active') : [];
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
          <span className="ge-status">{STATUS_LABEL[project.status]}</span>
          {active.map((t) => (
            <span key={t.id} className="ge-thread__active" title={t.title}>
              <span className="ge-dot" style={{ background: AGENT_BY_ID[t.agentId].colorCss }} />
              {Math.round(t.progress)}%
            </span>
          ))}
          <a href={projectHref(project.id)}>Open project</a>
          {project.artifacts.prototypeUrl ? (
            <a href={project.artifacts.prototypeUrl} target="_blank" rel="noreferrer">
              Testing ground ↗
            </a>
          ) : null}
          {project.status === 'live' && project.artifacts.liveUrl ? (
            <a href={project.artifacts.liveUrl} target="_blank" rel="noreferrer">
              Live site ↗
            </a>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

function MessageBody({ m, snap }: { m: StudioMessage; snap: StudioStoreSnapshot }) {
  if (m.kind === 'question' && m.refId) {
    const q = snap.questions.find((x) => x.id === m.refId);
    if (q) return <QuestionCard q={q} />;
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
    const url = project?.artifacts.prototypeUrl ?? (project ? `/prototype?id=${encodeURIComponent(project.id)}` : null);
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
    const url = project?.artifacts.liveUrl;
    return (
      <div className="ge-msg__text ge-msg__text--live">
        <small>Live site</small>
        <p>{m.text.replace(/\s*→\s*\S+?(?=\.(\s|$))/, '')}</p>
        {url ? (
          <a className="ge-btn ge-btn--sm" href={url} target="_blank" rel="noreferrer">
            Open the live site ↗
          </a>
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
  return <p className={`ge-msg__text ${m.kind === 'standup' ? 'ge-msg__text--standup' : ''}`}>{m.text}</p>;
}

function Thread(props: StudioChatProps) {
  const { snap, channelId } = props;
  const logRef = useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState<StudioAgentId[]>([]);
  const messages = useMemo(
    () => snap.messages.filter((m) => m.channelId === channelId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [snap.messages, channelId],
  );
  const lastId = messages.at(-1)?.id;

  useEffect(() => {
    markChannelRead(channelId);
  }, [channelId, lastId]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [channelId, lastId, snap.questions, snap.approvals, typing]);

  useEffect(() => {
    setTyping([]);
  }, [channelId]);

  useEffect(() => {
    const last = messages.find((m) => m.id === lastId);
    if (!last || last.author === 'ceo' || last.author === 'system') return;
    setTyping((ids) => ids.filter((id) => id !== last.author));
  }, [lastId, messages]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const result = sendCeoMessage(channelId, text);
    setDraft('');
    if (result.typing.length) setTyping(result.typing);
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const showCmds = draft.startsWith('/') && !draft.includes(' ');
  const cmdMatches = showCmds ? CHAT_COMMANDS.filter((c) => c.cmd.startsWith(draft.toLowerCase())) : [];

  // pinned: things this DM agent is waiting on (they live in project channels)
  const dmAgent = channelId.startsWith('dm:') ? (channelId.slice(3) as StudioAgentId) : null;
  const pinnedQ = dmAgent ? snap.questions.filter((q) => q.agentId === dmAgent && !q.answeredAt) : [];
  const pinnedA = dmAgent ? snap.approvals.filter((a) => a.agentId === dmAgent && !a.decidedAt) : [];

  let lastAuthor: ChatAuthor | null = null;
  let lastTime = 0;
  let lastDay = '';
  const dmName = dmAgent ? AGENT_BY_ID[dmAgent]?.name : null;
  const chName = snap.channels.find((c) => c.id === channelId)?.name;

  return (
    <div className="ge-thread">
      <ThreadHeader snap={snap} states={props.states} channelId={channelId} />
      <div className="ge-thread__log" ref={logRef}>
        {pinnedQ.length || pinnedA.length ? (
          <div className="ge-pinned">
            <h5>Waiting on you</h5>
            {pinnedQ.map((q) => (
              <QuestionCard key={q.id} q={q} />
            ))}
            {pinnedA.map((a) => (
              <ApprovalCard
                key={a.id}
                a={a}
                tasks={a.taskIds.map((id) => snap.tasks.find((t) => t.id === id)).filter(Boolean) as StudioTask[]}
              />
            ))}
          </div>
        ) : null}
        {messages.length === 0 ? (
          <div className="ge-thread__empty">
            {dmName ? (
              <>
                <p>This is the start of your DM with {dmName}.</p>
                <small>Try “what are you doing?”, “ETA?”, “is this all Lumen?”</small>
              </>
            ) : (
              <>
                <p>Welcome to #{chName}.</p>
                <small>Try /standup, /meeting empty states, /status, /help</small>
              </>
            )}
          </div>
        ) : null}
        {messages.map((m) => {
          const t = Date.parse(m.createdAt);
          const day = dayLabel(m.createdAt);
          const showDay = day !== lastDay;
          lastDay = day;
          const grouped = !showDay && m.author === lastAuthor && t - lastTime < 3 * 60_000 && m.kind !== 'system';
          lastAuthor = m.author;
          lastTime = t;
          if (m.author === 'system' || m.kind === 'system') {
            return (
              <div key={m.id}>
                {showDay ? <div className="ge-thread__day">{day}</div> : null}
                <div className="ge-msg ge-msg--system">
                  {m.text.split('\n').map((line, i) => (
                    <span key={i}>{line}</span>
                  ))}
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
                  <MessageBody m={m} snap={snap} />
                </div>
              </div>
            </div>
          );
        })}
        {typing.length ? (
          <div className="ge-typing" aria-live="polite">
            <i aria-hidden="true">
              <span />
              <span />
              <span />
            </i>
            {typing.map((id) => AGENT_BY_ID[id].name).join(', ')} {typing.length === 1 ? 'is' : 'are'} working…
          </div>
        ) : null}
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
        <div className="ge-composer__box">
          <textarea
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            placeholder={dmName ? `Message ${dmName} — paste a Figma Dev Mode link` : `Message #${chName ?? ''} — paste a Figma selection to unblock`}
            aria-label="Message"
          />
          <button type="button" className="ge-btn ge-btn--sm" onClick={send} disabled={!draft.trim()}>
            Send
          </button>
        </div>
        <small className="ge-composer__hint">Enter to send · Shift+Enter newline · / for commands · @Name to ask someone in a channel</small>
      </div>
    </div>
  );
}

/* ---------------- dock ---------------- */

export function StudioChat(props: StudioChatProps) {
  return (
    <aside className="ge-slack" aria-label="Studio chat">
      <Rail {...props} />
      <Thread {...props} />
    </aside>
  );
}
