'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AGENTS, BOARD_COLUMNS } from '@/lib/studio/agents';
import { DESIGN_SYSTEM, STUDIO_NAME } from '@/lib/studio/brand';
import { deriveAgentStates, tickPipeline } from '@/lib/studio/pipeline';
import {
  GENERAL_CHANNEL_ID,
  dmChannelId,
  emptyStudioStore,
  loadStudioStore,
  projectChannelId,
  subscribeStudioStore,
  unreadCount,
} from '@/lib/studio/store';
import type { StudioStoreSnapshot } from '@/lib/studio/types';
import { COLUMN_COLORS, KanbanBoard } from './KanbanBoard';
import { OfficeScene, type BoardCard, type OfficeTarget } from './OfficeScene';
import { CursorRunner, StudioChat } from './StudioChat';

const TICK_MS = 1000;
const CHAT_KEY = 'design-studio:chat';
const CHAT_WIDTH_KEY = 'design-studio:chat-width';
const CHAT_WIDTH_DEFAULT = 720;

export function OfficeView() {
  const [snap, setSnap] = useState<StudioStoreSnapshot | null>(null);
  const [selected, setSelected] = useState<OfficeTarget | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [channelId, setChannelId] = useState<string>(GENERAL_CHANNEL_ID);
  const [boardOpen, setBoardOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(() => {
    if (typeof localStorage === 'undefined') return CHAT_WIDTH_DEFAULT;
    const n = Number(localStorage.getItem(CHAT_WIDTH_KEY));
    return Number.isFinite(n) && n >= 480 && n <= 1100 ? n : CHAT_WIDTH_DEFAULT;
  });
  const [chatResizing, setChatResizing] = useState(false);

  // Load + subscribe to store changes; restore chat state.
  useEffect(() => {
    setSnap(loadStudioStore());
    try {
      const saved = JSON.parse(sessionStorage.getItem(CHAT_KEY) ?? 'null') as { open: boolean; ch: string } | null;
      if (saved) {
        setChatOpen(saved.open);
        setChannelId(saved.ch);
      }
    } catch {
      /* ignore */
    }
    return subscribeStudioStore(() => setSnap(loadStudioStore()));
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_KEY, JSON.stringify({ open: chatOpen, ch: channelId }));
    } catch {
      /* ignore */
    }
  }, [chatOpen, channelId]);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_WIDTH_KEY, String(chatWidth));
    } catch {
      /* ignore */
    }
  }, [chatWidth]);

  // Simulated work ticks while the tab is visible.
  useEffect(() => {
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = now - last;
      last = now;
      if (document.visibilityState === 'visible') tickPipeline(Math.min(dt, 5000));
    }, TICK_MS);
    tickPipeline(0);
    return () => window.clearInterval(id);
  }, []);

  const safe = snap ?? emptyStudioStore();
  const states = useMemo(() => deriveAgentStates(safe), [safe]);

  const boardCards = useMemo<BoardCard[][]>(
    () =>
      BOARD_COLUMNS.map((c, i) =>
        safe.projects
          .filter((p) => !p.archivedAt && c.statuses.includes(p.status))
          .map((p) => ({ id: p.id, title: p.title, color: COLUMN_COLORS[i]! })),
      ),
    [safe.projects],
  );

  const inboxCount = safe.approvals.filter((a) => {
    if (a.decidedAt) return false;
    const p = safe.projects.find((x) => x.id === a.projectId);
    return Boolean(p && !p.archivedAt);
  }).length;

  const unreadTotal = useMemo(() => {
    let n = 0;
    for (const c of safe.channels) {
      if (c.archived) continue;
      n += unreadCount(safe, c.id);
    }
    for (const a of AGENTS) n += unreadCount(safe, dmChannelId(a.id));
    return n;
  }, [safe]);

  // Channel validity: if a channel vanished, fall back to #general.
  useEffect(() => {
    if (!snap) return;
    const ok =
      channelId.startsWith('dm:') || snap.channels.some((c) => c.id === channelId && !c.archived);
    if (!ok) setChannelId(GENERAL_CHANNEL_ID);
  }, [snap, channelId]);

  const openChannel = useCallback((id: string) => {
    setChannelId(id);
    setChatOpen(true);
  }, []);

  const onSelect = useCallback(
    (t: OfficeTarget | null) => {
      setSelected(t);
      if (!t) return;
      if (t.type === 'agent') openChannel(dmChannelId(t.id));
      else if (t.type === 'board') setBoardOpen(true);
      else if (t.type === 'ceo') {
        // Your desk: jump to the channel with the oldest thing waiting on you.
        const a = safe.approvals
          .filter((x) => !x.decidedAt && !safe.projects.find((p) => p.id === x.projectId)?.archivedAt)
          .sort((x, y) => x.createdAt.localeCompare(y.createdAt))[0];
        const pid = a?.projectId;
        openChannel(pid ? projectChannelId(pid) : GENERAL_CHANNEL_ID);
      }
    },
    [openChannel, safe.approvals, safe.projects],
  );

  const working = AGENTS.filter((a) => states[a.id].mood === 'working').length;

  return (
    <div
      className={`ge-studio ge-studio--afternoon ${chatOpen ? 'has-chat' : ''} ${chatResizing ? 'is-resizing-chat' : ''}`}
      style={{ ['--ge-chat-width-user' as string]: `${chatWidth}px` }}
    >
      <OfficeScene states={states} boardCards={boardCards} inboxCount={inboxCount} selected={selected} onSelect={onSelect} />
      <div className="ge-studio__grade" aria-hidden="true" />
      <div className="ge-studio__vignette" aria-hidden="true" />

      <header className="ge-studio__bar">
        <a className="ge-studio__brand" href="/" title={STUDIO_NAME}>
          <strong>{STUDIO_NAME}</strong>
          <small>{DESIGN_SYSTEM.name} only</small>
        </a>
        <div className="ge-studio__stats">
          <span>
            {safe.projects.filter((p) => !p.archivedAt).length} brief{safe.projects.filter((p) => !p.archivedAt).length === 1 ? '' : 's'} in flight
          </span>
          <span>{working} working</span>
          {inboxCount ? <span className="is-warn">{inboxCount} waiting on you</span> : <span>inbox clear</span>}
        </div>
        <nav className="ge-studio__actions" aria-label="Studio">
          <button
            type="button"
            className="ge-pill ge-pill--icon"
            data-tip="Board"
            aria-label="Board"
            onClick={() => setBoardOpen(true)}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="currentColor" d="M4 4h4.5v16H4V4Zm5.75 0H14.5v10H9.75V4ZM16 4h4v16h-4V4Z" />
            </svg>
          </button>
          <a className="ge-pill ge-pill--icon" href="/projects" data-tip="Projects" aria-label="Projects">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="currentColor" d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
            </svg>
          </a>
          <a className="ge-pill ge-pill--icon ge-pill--primary" href="/new" data-tip="New brief" aria-label="New brief">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="currentColor" d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
            </svg>
          </a>
          <button
            type="button"
            className={`ge-pill ge-pill--icon ${chatOpen ? 'is-on' : ''}`}
            data-tip={chatOpen ? 'Close chat' : 'Chat'}
            onClick={() => setChatOpen((v) => !v)}
            aria-label={chatOpen ? 'Close studio chat' : 'Open studio chat'}
            aria-pressed={chatOpen}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                fill="currentColor"
                d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3 5v2h10V9H7Zm0 4v2h7v-2H7Z"
              />
            </svg>
            {unreadTotal ? <em>{unreadTotal > 99 ? '99+' : unreadTotal}</em> : null}
          </button>
        </nav>
      </header>

      <div className="ge-studio__team" role="list">
        {AGENTS.map((a) => (
          <button
            type="button"
            role="listitem"
            key={a.id}
            className={`ge-team ${selected?.type === 'agent' && selected.id === a.id ? 'is-on' : ''}`}
            onClick={() => onSelect({ type: 'agent', id: a.id })}
            data-tip={`${a.name} · ${a.role}`}
            aria-label={`${a.name}, ${a.role}`}
          >
            <span className={`ge-presence ge-presence--${states[a.id].mood}`} style={{ background: a.colorCss }} />
            {states[a.id].mood === 'working' ? (
              <i className="ge-poll" aria-hidden="true">
                <span />
                <span />
                <span />
              </i>
            ) : null}
            <span className="ge-team__who">{a.name}</span>
          </button>
        ))}
      </div>

      {snap ? <CursorRunner channelId={channelId} /> : null}

      {chatOpen && snap ? (
        <StudioChat
          snap={snap}
          states={states}
          channelId={channelId}
          onChannel={setChannelId}
          onClose={() => setChatOpen(false)}
          onWidthChange={setChatWidth}
          onResizing={setChatResizing}
        />
      ) : null}

      {boardOpen && snap ? (
        <KanbanBoard
          snap={snap}
          onClose={() => {
            setBoardOpen(false);
            setSelected(null);
          }}
          onOpenChannel={(id) => {
            setBoardOpen(false);
            openChannel(id);
          }}
        />
      ) : null}
    </div>
  );
}
