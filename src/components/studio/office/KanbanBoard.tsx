'use client';

import { useEffect, useMemo, useState } from 'react';
import { AGENT_BY_ID, BOARD_COLUMNS, KIND_LABEL, STATUS_LABEL } from '@/lib/studio/agents';
import { isAssumedQuestionKey } from '@/lib/studio/pipeline';
import { archiveProject, projectChannelId } from '@/lib/studio/store';
import type { StudioProject, StudioStoreSnapshot, StudioTask } from '@/lib/studio/types';
import { ApprovalCard, Deliverable, Progress, QuestionCard, projectHref } from './OfficePanels';

export interface KanbanBoardProps {
  snap: StudioStoreSnapshot;
  onClose: () => void;
  onOpenChannel: (channelId: string) => void;
  initialProjectId?: string | null;
}

/** Column accent colours (also used for the sticky notes on the wall). */
export const COLUMN_COLORS = [0xffe08a, 0x9fd8ff, 0xffb4a2, 0xd9b8ff, 0xb9f6ca, 0xffd6f0, 0xc8e6c9];
export const COLUMN_COLORS_CSS = COLUMN_COLORS.map((c) => `#${c.toString(16).padStart(6, '0')}`);

function colIndexFor(p: StudioProject) {
  return BOARD_COLUMNS.findIndex((c) => c.statuses.includes(p.status));
}

function TaskRow({ t }: { t: StudioTask }) {
  const a = AGENT_BY_ID[t.agentId];
  return (
    <li className={`ge-krow ge-krow--${t.status}`}>
      <span className="ge-dot" style={{ background: a.colorCss }} />
      <div>
        <div className="ge-task__row">
          <strong>{t.title}</strong>
          <span>
            {t.status === 'done' ? 'done' : t.status === 'active' ? `${Math.round(t.progress)}%` : t.status === 'blocked' ? 'blocked' : 'queued'}
          </span>
        </div>
        <small>
          {a.name} · {t.detail}
        </small>
        {t.status === 'active' ? <Progress value={t.progress} color={a.colorCss} /> : null}
      </div>
    </li>
  );
}

export function KanbanBoard({ snap, onClose, onOpenChannel, initialProjectId }: KanbanBoardProps) {
  const [openId, setOpenId] = useState<string | null>(initialProjectId ?? null);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const open = useMemo(() => snap.projects.find((p) => p.id === openId) ?? null, [snap.projects, openId]);
  const openTasks = open ? snap.tasks.filter((t) => t.projectId === open.id) : [];
  const openQs = open
    ? snap.questions.filter((q) => q.projectId === open.id && !q.answeredAt && !isAssumedQuestionKey(q.answerKey))
    : [];
  const openAs = open ? snap.approvals.filter((a) => a.projectId === open.id && !a.decidedAt) : [];
  const stageOrder = [...new Set(openTasks.map((t) => t.stage))];

  return (
    <div className="ge-modal" role="dialog" aria-modal="true" aria-label="Studio board" onClick={onClose}>
      <div className="ge-kanban" onClick={(e) => e.stopPropagation()}>
        <header className="ge-kanban__head">
          <div>
            <h2>Studio board</h2>
            <p>Every brief in flight, left to right. Click a card for tasks, progress and deliverables.</p>
          </div>
          <div className="ge-kanban__actions">
            <a className="ge-btn ge-btn--sm" href="/new">
              New brief
            </a>
            <button type="button" className="ge-iconbtn" onClick={onClose} aria-label="Close board">
              ×
            </button>
          </div>
        </header>

        <div className={`ge-kanban__body ${open ? 'has-detail' : ''}`}>
          <div className="ge-kanban__cols">
            {BOARD_COLUMNS.map((col, i) => {
              const cards = snap.projects.filter((p) => !p.archivedAt && col.statuses.includes(p.status));
              return (
                <div className="ge-kcol" key={col.id}>
                  <h4>
                    <span className="ge-kcol__swatch" style={{ background: COLUMN_COLORS_CSS[i] }} />
                    {col.label}
                    <em>{cards.length}</em>
                  </h4>
                  <div className="ge-kcol__cards">
                    {cards.map((p) => {
                      const active = snap.tasks.filter((t) => t.projectId === p.id && t.status === 'active');
                      const waiting =
                        snap.questions.filter((q) => q.projectId === p.id && !q.answeredAt).length +
                        snap.approvals.filter((a) => a.projectId === p.id && !a.decidedAt).length;
                      return (
                        <button
                          type="button"
                          key={p.id}
                          className={`ge-kcard ${openId === p.id ? 'is-on' : ''}`}
                          style={{ borderTopColor: COLUMN_COLORS_CSS[i] }}
                          onClick={() => setOpenId(p.id)}
                        >
                          <strong>{p.title}</strong>
                          <small>{STATUS_LABEL[p.status]}</small>
                          {active.map((t) => (
                            <div className="ge-kcard__task" key={t.id}>
                              <span className="ge-dot" style={{ background: AGENT_BY_ID[t.agentId].colorCss }} />
                              <span>{t.title}</span>
                              <em>{Math.round(t.progress)}%</em>
                            </div>
                          ))}
                          {waiting ? <span className="ge-kcard__needs">{waiting} waiting on you</span> : null}
                        </button>
                      );
                    })}
                    {cards.length === 0 ? <div className="ge-kcol__empty" /> : null}
                  </div>
                </div>
              );
            })}
          </div>

          {open ? (
            <aside className="ge-kdetail">
              <header>
                <div>
                  <span className="ge-status" style={{ background: COLUMN_COLORS_CSS[Math.max(0, colIndexFor(open))], color: '#1b1030' }}>
                    {STATUS_LABEL[open.status]}
                  </span>
                  <h3>{open.title}</h3>
                  <small>
                    {KIND_LABEL[open.kind]} · {open.surface || 'No surface set'}
                  </small>
                </div>
                <div className="ge-kdetail__links">
                  <button type="button" className="ge-btn ge-btn--ghost ge-btn--sm" onClick={() => onOpenChannel(projectChannelId(open.id))}>
                    # channel
                  </button>
                  <a className="ge-btn ge-btn--ghost ge-btn--sm" href={projectHref(open.id)}>
                    Project page
                  </a>
                  <button
                    type="button"
                    className="ge-btn ge-btn--ghost ge-btn--sm"
                    onClick={() => {
                      archiveProject(open.id);
                      setOpenId(null);
                    }}
                  >
                    Archive
                  </button>
                  <button type="button" className="ge-iconbtn" onClick={() => setOpenId(null)} aria-label="Close detail">
                    ×
                  </button>
                </div>
              </header>

              {openQs.length || openAs.length ? (
                <section>
                  <h5>Waiting on you</h5>
                  {openQs.map((q) => (
                    <QuestionCard key={q.id} q={q} />
                  ))}
                  {openAs.map((a) => (
                    <ApprovalCard key={a.id} a={a} tasks={a.taskIds.map((id) => snap.tasks.find((t) => t.id === id)).filter(Boolean) as StudioTask[]} />
                  ))}
                </section>
              ) : null}

              <section>
                <h5>Work</h5>
                {stageOrder.length === 0 ? <p className="ge-kdetail__empty">No tasks yet — the Design Lead picks it up on the next tick.</p> : null}
                {stageOrder.map((stage) => (
                  <div key={stage} className="ge-kstage">
                    <h6>{STATUS_LABEL[stage]}</h6>
                    <ul>
                      {openTasks
                        .filter((t) => t.stage === stage)
                        .map((t) => (
                          <TaskRow key={t.id} t={t} />
                        ))}
                    </ul>
                  </div>
                ))}
              </section>

              {openTasks.some((t) => t.deliverable) ? (
                <section>
                  <h5>Deliverables</h5>
                  <div className="ge-deliverables">
                    {openTasks
                      .filter((t) => t.deliverable)
                      .map((t) => (
                        <Deliverable key={t.id} task={t} />
                      ))}
                  </div>
                </section>
              ) : null}

              {open.briefAnswers && Object.keys(open.briefAnswers).length ? (
                <section>
                  <h5>Your calls</h5>
                  <ul className="ge-list ge-list--plain">
                    {Object.entries(open.briefAnswers).map(([k, v]) => (
                      <li key={k}>
                        <span>{k.replace(/_/g, ' ')}</span>
                        <small>{v}</small>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}
