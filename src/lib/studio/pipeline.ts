/**
 * Studio pipeline.
 *
 * Drives the office: which agent works on what, when they ask you a
 * question, and when work lands on your desk for approval.
 *
 * Work is SIMULATED for now (progress ticks in the browser, deliverables are
 * templated text). The state machine, task shapes, question/approval flow and
 * stage transitions are the real contract that Figma / Storybook jobs plug
 * into next.
 */
import { AGENTS, AGENT_BY_ID, BOARD_COLUMNS, KIND_LABEL, STATUS_LABEL } from './agents';
import { DESIGN_SYSTEM, ESCALATE_AFTER_REJECTIONS, HUMAN_REVIEWERS, TARGETS } from './brand';
import { agentKnowledgeBrief, FIGMA_SELECTION_EXAMPLE, isFigmaSelectionUrl } from './knowledge';
import { deriveMock, prototypeUrlFor, storybookStoryUrl } from './mock';
import {
  GENERAL_CHANNEL_ID,
  addReference,
  createCustomChannel,
  dmChannelId,
  loadStudioStore,
  nowIso,
  projectChannelId,
  pushMessage,
  saveStudioStore,
  slugify,
  uid,
} from './store';
import type {
  StudioAgentId,
  StudioApproval,
  StudioArtifacts,
  StudioEscalation,
  StudioProject,
  StudioProjectStatus,
  StudioQuestion,
  StudioStoreSnapshot,
  StudioTask,
} from './types';

/* ------------------------------------------------------------------ */
/* Stage plan                                                          */
/* ------------------------------------------------------------------ */

interface TaskTemplate {
  agentId: StudioAgentId;
  title: string;
  detail: string;
  durationMs: number;
  deliverable: (p: StudioProject) => string;
  /** Links this task publishes onto the brief when it lands. */
  artifacts?: (p: StudioProject) => Partial<StudioArtifacts>;
  /** Block this task until the agent's open questions for the project are answered. */
  needsAnswers?: boolean;
  /** Only spawn for these kinds (default: all). */
  kinds?: StudioProject['kind'][];
}

interface QuestionTemplate {
  agentId: StudioAgentId;
  answerKey: string;
  text: string;
  options: string[];
  kinds?: StudioProject['kind'][];
}

interface StageDef {
  /** Status while agents are working. */
  work: StudioProjectStatus;
  /** Status while you review (null = stays on `work`). */
  review: StudioProjectStatus | null;
  /** Status after approval. */
  next: StudioProjectStatus | ((p: StudioProject) => StudioProjectStatus);
  /** Whether you must approve before moving to `next`. */
  approval?: {
    agentId: StudioAgentId;
    title: string;
    summary: (p: StudioProject, tasks: StudioTask[]) => string;
  };
  tasks: TaskTemplate[];
  /** Questions asked on entering the stage (before work can start). */
  questions?: QuestionTemplate[];
  /** Skip this stage entirely for these kinds. */
  skipFor?: StudioProject['kind'][];
  /** Block and ask for a Figma Dev Mode selection if the brief has none. */
  needsFigma?: boolean;
}

const ans = (p: StudioProject, key: string, fallback = '—') => p.briefAnswers?.[key] || fallback;
const DS = DESIGN_SYSTEM.name;
const SEC = 1000;
const slug = (p: StudioProject) => slugify(p.title);

/**
 * The flow. Every arrow with a ✋ is an approval you give in chat.
 *
 *   PRD/BRD ─▶ spec ✋ ─▶ Lumen audit ✋ ─▶ Figma ✋ ─▶ testing-ground prototype ✋
 *     ─▶ Storybook component ✋ (component briefs)
 *     ─▶ preview branch ✋ (feature briefs) ─▶ QA ✋ ─▶ Tess sign-off ✋ ─▶ live site
 */
const STAGES: StageDef[] = [
  {
    work: 'draft',
    review: 'needs_spec_review',
    next: 'auditing',
    questions: [
      {
        agentId: 'lead',
        answerKey: 'platform',
        text: 'Which platform is this for?',
        options: ['Desktop web', 'Mobile web', 'Both', "Lead's call"],
      },
      {
        agentId: 'lead',
        answerKey: 'theme',
        text: `Which ${DS} brand / mode should we design in?`,
        options: [`${TARGETS.liveSiteBrand} light + dark`, 'Default light + dark', 'All brand themes', 'Ask the librarian'],
      },
      {
        agentId: 'lead',
        answerKey: 'scope',
        text: 'How big is this?',
        options: ['Single screen', 'Flow (2–5 screens)', 'Whole area', "Lead's call"],
        kinds: ['feature'],
      },
      {
        agentId: 'lead',
        answerKey: 'variants',
        text: 'Variant coverage for the component?',
        options: ['All sizes + states', 'Core states only', `Match an existing ${DS} component`],
        kinds: ['component'],
      },
    ],
    tasks: [
      {
        agentId: 'lead',
        title: 'Specify from PRD',
        detail: 'Read the PRD/BRD, run specify + clarify, write spec.md with user stories and acceptance criteria.',
        durationMs: 30 * SEC,
        needsAnswers: true,
        artifacts: (p) => ({ specPath: `specs/${slug(p)}/spec.md` }),
        deliverable: (p) =>
          [
            `# spec.md — ${p.title}`,
            `Kind: ${KIND_LABEL[p.kind]} · Surface: ${p.surface || 'TBD'} · Source: ${p.specUrl || 'brief only'}`,
            `Platform: ${ans(p, 'platform')} · Theme: ${ans(p, 'theme')} · ${p.kind === 'feature' ? `Scope: ${ans(p, 'scope')}` : `Variants: ${ans(p, 'variants')}`}`,
            `User stories + acceptance criteria written; clarifications resolved: ${Object.keys(p.briefAnswers ?? {}).length}.`,
            `Constitution: ${DS} only — library components, variables and styles; no detached layers, no raw values.`,
            agentKnowledgeBrief(),
            `Written to specs/${slug(p)}/spec.md.`,
          ].join('\n'),
      },
    ],
    approval: {
      agentId: 'lead',
      title: 'Approve spec',
      summary: (p) =>
        `spec.md for “${p.title}” is ready (user stories, acceptance criteria, ${DS}-only constitution). Approving starts the ${DS} coverage audit. Nothing touches Figma yet.`,
    },
  },
  {
    work: 'auditing',
    review: 'needs_audit_review',
    next: (p) => (p.kind === 'component' ? 'building_components' : 'designing'),
    tasks: [
      {
        agentId: 'librarian',
        title: `${DS} coverage audit`,
        detail: `Search the ${DS} library for every component, variant and token the spec needs; list gaps.`,
        durationMs: 45 * SEC,
        deliverable: (p) =>
          [
            `# ${DS} audit — ${p.title}`,
            `Library: ${DESIGN_SYSTEM.figmaLibraryName}`,
            'Covered: Button, IconButton, cell, Table cell, drawer, link (component sets with variants).',
            `Tokens: ${DESIGN_SYSTEM.variableCollections.join(', ')} collections; brand ${TARGETS.liveSiteBrand} present in tokens/figma.`,
            'Gaps: none blocking — anything missing becomes a component brief, never an ad-hoc layer.',
          ].join('\n'),
      },
      {
        agentId: 'tokens',
        title: 'Token manifest check',
        detail: 'Confirm the Figma variables the spec needs exist in tokens/dist/manifest.json (npm run tokens:sync).',
        durationMs: 25 * SEC,
        deliverable: (p) =>
          `# Token check — ${p.title}\nAll referenced variables resolve to CSS vars in the manifest. Drift vs Figma: 0.`,
      },
    ],
    approval: {
      agentId: 'librarian',
      title: 'Approve audit',
      summary: (p) =>
        p.kind === 'component'
          ? `Audit for “${p.title}”: this is a new ${DS} component. Approving sends it to Storybook build with the Figma component set as source of truth.`
          : `Audit for “${p.title}”: everything needed exists in ${DS}. Approving lets Mika start the Figma frames.`,
    },
  },
  {
    work: 'designing',
    review: 'needs_design_review',
    next: 'prototyping',
    skipFor: ['component'],
    questions: [
      {
        agentId: 'designer',
        answerKey: 'density',
        text: 'Layout density?',
        options: ['Compact', 'Comfortable', 'Match the nearest existing screen'],
      },
    ],
    tasks: [
      {
        agentId: 'designer',
        title: 'Figma frames',
        detail: `New page in the ${DS} project file; frames built from library instances with auto-layout and variable bindings.`,
        durationMs: 55 * SEC,
        needsAnswers: true,
        artifacts: (p) => ({
          figmaUrl: DESIGN_SYSTEM.figmaFileKey
            ? `https://www.figma.com/design/${DESIGN_SYSTEM.figmaFileKey}/?page=${encodeURIComponent(p.title)}`
            : undefined,
          framesUrl: `/prototype?id=${encodeURIComponent(p.id)}&view=frames`,
        }),
        deliverable: (p) =>
          [
            `# Figma — ${p.title}`,
            `Density: ${ans(p, 'density')} · Platform: ${ans(p, 'platform')} · Theme: ${ans(p, 'theme')}`,
            `Frames: ${ans(p, 'scope', 'Single screen')} · every layer is a ${DS} instance or bound to a ${DS} variable.`,
            'Detached layers: 0 · Raw hex: 0 · Local styles: 0.',
          ].join('\n'),
      },
      {
        agentId: 'librarian',
        title: 'Instance lint',
        detail: 'Walk the frames: flag any node not from the library or any unbound colour/spacing.',
        durationMs: 20 * SEC,
        deliverable: (p) => `# Lint — ${p.title}\n0 violations. Frames are 100% ${DS}.`,
      },
    ],
    approval: {
      agentId: 'designer',
      title: 'Approve Figma design',
      summary: (p) => `Frames for “${p.title}” are in Figma and lint clean. Approving freezes design v1 and Ren builds the clickable prototype.`,
    },
  },
  {
    work: 'prototyping',
    review: 'needs_prototype_review',
    next: 'building_feature',
    skipFor: ['component'],
    needsFigma: true,
    tasks: [
      {
        agentId: 'ui_engineer',
        title: 'Clickable prototype',
        detail: `Static build of the approved frames using ${DS} tokens + approved components; deployed to a URL.`,
        durationMs: 50 * SEC,
        artifacts: (p) => ({ prototypeUrl: `/prototype?id=${encodeURIComponent(p.id)}` }),
        deliverable: (p) =>
          [
            `# Prototype — ${p.title}`,
            `URL: /prototype?id=${p.id}`,
            `Brand: ${TARGETS.liveSiteBrand} · light + dark · breakpoints from tokens.`,
            'Imports: approved Storybook components only · token lint 0.',
            'Reuse the shipped shell (header / sidebar / mobile drawer / dock / UBC) — do not invent a second chrome.',
          ].join('\n'),
      },
      {
        agentId: 'qa',
        title: 'Prototype vs Figma diff',
        detail: 'Screenshot the prototype at each breakpoint and diff against the approved frames.',
        durationMs: 20 * SEC,
        deliverable: (p) => `# Diff — ${p.title}\nWithin tolerance at xs/sm/md/lg/xl. No off-system values.`,
      },
    ],
    approval: {
      agentId: 'ui_engineer',
      title: 'Approve testing ground',
      summary: (p) =>
        `Testing ground for “${p.title}” is ready — open the prototype, click through it. Approve only if it matches. Nothing goes on the live site until you say so.`,
    },
  },
  {
    work: 'building_components',
    review: 'needs_storybook_review',
    next: 'qa_running',
    skipFor: ['feature'],
    needsFigma: true,
    questions: [
      {
        agentId: 'ui_engineer',
        answerKey: 'stories',
        text: 'Story coverage in Storybook?',
        options: ['Every variant + state', 'Primary variants only', 'Match the Figma component set exactly'],
      },
    ],
    tasks: [
      {
        agentId: 'ui_engineer',
        title: 'Build component',
        detail: `React + Tailwind component matching the ${DS} Figma spec; props mirror the variant properties.`,
        durationMs: 60 * SEC,
        needsAnswers: true,
        deliverable: (p) =>
          [
            `# Component — ${p.title}`,
            `Props mirror Figma variant properties · ${ans(p, 'stories')}.`,
            `Styling: token classes only (no arbitrary values). Code Connect mapping added to the ${DS} component set.`,
          ].join('\n'),
      },
      {
        agentId: 'tokens',
        title: 'Token bindings',
        detail: `Verify every colour / spacing / radius in the component resolves to a ${DS} token.`,
        durationMs: 20 * SEC,
        deliverable: (p) => `# Tokens — ${p.title}\nAll values map to tokens. Lint: 0 violations.`,
      },
      {
        agentId: 'ui_engineer',
        title: 'Storybook stories',
        detail: 'Stories per variant with controls; Figma frame linked on each story.',
        durationMs: 30 * SEC,
        artifacts: (p) => ({ storybookUrl: storybookStoryUrl(deriveMock(p).archetype) }),
        deliverable: (p) =>
          `# Storybook — ${p.title}\n${storybookStoryUrl(deriveMock(p).archetype)}\nProject sheet (every variant × size × state): /component?id=${p.id}\nAll values resolve to Lumen tokens — lint 0 violations.`,
      },
    ],
    approval: {
      agentId: 'ui_engineer',
      title: 'Approve in Storybook',
      summary: (p) =>
        `“${p.title}” is in Storybook with stories and a Figma side-by-side. Approving marks it an approved ${DS} component that features can use.`,
    },
  },
  {
    work: 'building_feature',
    review: 'needs_build_review',
    next: 'qa_running',
    skipFor: ['component'],
    needsFigma: true,
    tasks: [
      {
        agentId: 'engineer',
        title: 'Build preview from approved prototype',
        detail: `Branch on the live-site repo from the approved testing ground. Preview only — production is locked until Tess signs off.`,
        durationMs: 70 * SEC,
        artifacts: (p) => ({
          previewUrl: `/prototype?id=${encodeURIComponent(p.id)}&brand=${TARGETS.liveSiteBrand}`,
        }),
        deliverable: (p) =>
          [
            `# Preview — ${p.title}`,
            `Branch: feature/${slug(p)} · preview only. Not on ${TARGETS.liveSiteUrl} yet.`,
            'Reuse apps/live-site/components/site/shell-*.tsx. Imports outside the approved component library: 0 · token lint 0 · typecheck clean.',
          ].join('\n'),
      },
    ],
    approval: {
      agentId: 'engineer',
      title: 'Approve preview (still not live)',
      summary: (p) =>
        `Preview of “${p.title}” is on a branch. This is still the testing ground. Approving sends it to Tess — live site stays untouched.`,
    },
  },
  {
    work: 'qa_running',
    review: 'needs_signoff',
    next: 'launching',
    tasks: [
      {
        agentId: 'qa',
        title: 'Design QA',
        detail: 'Visual diff vs Figma, token lint, a11y (contrast, focus, labels), responsive breakpoints, spec acceptance criteria.',
        durationMs: 40 * SEC,
        deliverable: (p) =>
          `# QA — ${p.title}\nVisual diff within tolerance · token lint 0 · a11y 0 critical · breakpoints OK · acceptance criteria met.`,
      },
    ],
    approval: {
      agentId: 'qa',
      title: 'Sign off for launch',
      summary: (p) =>
        p.kind === 'component'
          ? `QA passed for “${p.title}”. Approving publishes the component (Storybook + package) for features to use.`
          : `QA passed for “${p.title}”. This is the last gate. Approving is what ships it to the live site.`,
    },
  },
  {
    work: 'launching',
    review: null,
    next: 'live',
    tasks: [
      {
        agentId: 'engineer',
        title: 'Merge + deploy',
        detail: 'Merge the approved PR, wait for the production deploy, smoke-check the URL.',
        durationMs: 20 * SEC,
        artifacts: (p) =>
          p.kind === 'component'
            ? { liveUrl: `/component?id=${encodeURIComponent(p.id)}` }
            : { liveUrl: TARGETS.liveSiteUrl },
        deliverable: (p) =>
          p.kind === 'component'
            ? `# Published — ${p.title}\nComponent is approved and importable by feature builds.`
            : `# Live — ${p.title}\nNow on the live site: ${TARGETS.liveSiteUrl}\nTesting ground stays at /prototype?id=${p.id}.`,
      },
    ],
  },
];

const STAGE_BY_WORK = new Map(STAGES.map((s) => [s.work, s]));
const STAGE_BY_REVIEW = new Map(
  STAGES.filter((s) => s.review).map((s) => [s.review as StudioProjectStatus, s]),
);

function nextStatus(def: StageDef, p: StudioProject): StudioProjectStatus {
  return typeof def.next === 'function' ? def.next(p) : def.next;
}

function applies<T extends { kinds?: StudioProject['kind'][] }>(t: T, p: StudioProject) {
  return !t.kinds || t.kinds.includes(p.kind);
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function stageTasks(snap: StudioStoreSnapshot, projectId: string, stage: StudioProjectStatus) {
  return snap.tasks.filter((t) => t.projectId === projectId && t.stage === stage);
}

function openQuestions(snap: StudioStoreSnapshot, projectId: string, agentId: StudioAgentId) {
  return snap.questions.filter((q) => q.projectId === projectId && q.agentId === agentId && !q.answeredAt);
}

function pendingApproval(snap: StudioStoreSnapshot, projectId: string) {
  return snap.approvals.find((a) => a.projectId === projectId && !a.decidedAt);
}

function spawnStage(snap: StudioStoreSnapshot, project: StudioProject, def: StageDef) {
  const stamp = nowIso();
  for (const q of def.questions ?? []) {
    if (!applies(q, project)) continue;
    const already = snap.questions.some(
      (x) => x.projectId === project.id && x.answerKey === q.answerKey && x.answeredAt,
    );
    if (already) continue;
    const open = snap.questions.some(
      (x) => x.projectId === project.id && x.answerKey === q.answerKey && !x.answeredAt,
    );
    if (open) continue;
    const question: StudioQuestion = {
      id: uid('q'),
      projectId: project.id,
      agentId: q.agentId,
      answerKey: q.answerKey,
      text: q.text,
      options: q.options,
      createdAt: stamp,
    };
    snap.questions.push(question);
    pushMessage(snap, {
      channelId: projectChannelId(project.id),
      author: q.agentId,
      kind: 'question',
      refId: question.id,
      text: q.text,
      projectId: project.id,
    });
  }
  for (const t of def.tasks) {
    if (!applies(t, project)) continue;
    const blocked = t.needsAnswers && openQuestions(snap, project.id, t.agentId).length > 0;
    const task: StudioTask = {
      id: uid('task'),
      projectId: project.id,
      agentId: t.agentId,
      stage: def.work,
      title: t.title,
      detail: t.detail,
      status: blocked ? 'blocked' : 'queued',
      blockedBy: blocked ? 'question' : undefined,
      progress: 0,
      durationMs: t.durationMs,
      createdAt: stamp,
      updatedAt: stamp,
    };
    snap.tasks.push(task);
  }
  if (def.needsFigma && !hasFigmaSelection(project) && !(project.escalation && !project.escalation.resolvedAt)) {
    escalate(
      snap,
      project,
      def.tasks.find((t) => applies(t, project))?.agentId ?? 'designer',
      def.work,
      `I don't have a Figma frame selection for “${project.title}”, so I can't build it without guessing.`,
      'figma',
    );
  }
}

function setStatus(project: StudioProject, status: StudioProjectStatus) {
  project.status = status;
  project.updatedAt = nowIso();
}

/** Make sure every project has tasks/questions for its current stage; skip stages that don't apply. */
function ensureProject(snap: StudioStoreSnapshot, project: StudioProject) {
  let def = STAGE_BY_WORK.get(project.status);
  let guard = 0;
  while (def && def.skipFor?.includes(project.kind) && guard++ < 8) {
    setStatus(project, nextStatus(def, project));
    def = STAGE_BY_WORK.get(project.status);
  }
  if (!def) return; // review / terminal statuses: nothing to spawn

  if (stageTasks(snap, project.id, def.work).length === 0) {
    spawnStage(snap, project, def);
  }
}

/** Unblock tasks whose agent questions are now all answered. */
function unblock(snap: StudioStoreSnapshot) {
  for (const t of snap.tasks) {
    if (t.status === 'blocked' && t.blockedBy === 'question') {
      if (openQuestions(snap, t.projectId, t.agentId).length === 0) {
        t.status = 'queued';
        t.blockedBy = undefined;
        t.updatedAt = nowIso();
      }
    }
  }
}

function completeStageIfDone(snap: StudioStoreSnapshot, project: StudioProject) {
  const def = STAGE_BY_WORK.get(project.status);
  if (!def) return;
  const tasks = stageTasks(snap, project.id, def.work);
  if (tasks.length === 0 || tasks.some((t) => t.status !== 'done')) return;

  if (!def.approval) {
    setStatus(project, nextStatus(def, project));
    if (project.status === 'live') {
      const url = project.artifacts.liveUrl;
      pushMessage(snap, {
        channelId: projectChannelId(project.id),
        author: 'engineer',
        kind: 'live',
        projectId: project.id,
        text: `“${project.title}” is live${url ? ` → ${url}` : ''}. Nice work, everyone.`,
      });
      pushMessage(snap, {
        channelId: GENERAL_CHANNEL_ID,
        author: 'lead',
        kind: 'live',
        projectId: project.id,
        text: `Shipped: “${project.title}”${url ? ` → ${url}` : ''}.`,
      });
    }
    ensureProject(snap, project);
    return;
  }

  if (pendingApproval(snap, project.id)) return;
  if (def.review) setStatus(project, def.review);
  const approval: StudioApproval = {
    id: uid('appr'),
    projectId: project.id,
    agentId: def.approval.agentId,
    taskIds: tasks.map((t) => t.id),
    title: def.approval.title,
    summary: def.approval.summary(project, tasks),
    fromStatus: project.status,
    toStatus: nextStatus(def, project),
    createdAt: nowIso(),
  };
  snap.approvals.push(approval);
  pushMessage(snap, {
    channelId: projectChannelId(project.id),
    author: def.approval.agentId,
    kind: 'approval',
    refId: approval.id,
    text: approval.summary,
    projectId: project.id,
  });
}

/** Short hand-off line an agent posts in the project channel when a task lands. */
function handoffLine(task: StudioTask, project: StudioProject, def: StageDef | undefined) {
  const others =
    def?.tasks
      .filter((t) => t.agentId !== task.agentId && applies(t, project))
      .map((t) => AGENT_BY_ID[t.agentId].name) ?? [];
  const to = def?.approval ? 'your review' : others.length ? [...new Set(others)].join(' / ') : 'the next stage';
  return `Done: “${task.title}” for ${project.title}. Handing to ${to}.`;
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/** Advance simulated work by `dtMs`. Call from a ticker while the office is open. */
export function tickPipeline(dtMs: number) {
  const snap = loadStudioStore();
  const stamp = nowIso();

  for (const p of snap.projects) ensureProject(snap, p);
  unblock(snap);

  // One active task per agent; promote oldest queued if idle.
  const agents = Object.keys(AGENT_BY_ID) as StudioAgentId[];
  for (const agentId of agents) {
    const mine = snap.tasks
      .filter((t) => t.agentId === agentId && t.status !== 'done')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    let active = mine.find((t) => t.status === 'active');
    if (!active) {
      active = mine.find((t) => t.status === 'queued');
      if (active) {
        active.status = 'active';
        active.updatedAt = stamp;
        const project = snap.projects.find((p) => p.id === active!.projectId);
        if (project) {
          pushMessage(snap, {
            channelId: projectChannelId(project.id),
            author: agentId,
            text: `Starting “${active.title}” on ${project.title}. I'll post here as I go — stay in this thread for the fine detail.`,
            projectId: project.id,
          });
        }
      }
    }
    if (!active) continue;

    active.progress = Math.min(100, active.progress + (dtMs / active.durationMs) * 100);
    active.updatedAt = stamp;
    if (active.progress >= 100) {
      const project = snap.projects.find((p) => p.id === active!.projectId);
      const def = STAGE_BY_WORK.get(active.stage);
      const tpl = def?.tasks.find((t) => t.title === active!.title && t.agentId === agentId);
      active.status = 'done';
      active.completedAt = stamp;
      active.deliverable = project && tpl ? tpl.deliverable(project) : `Done: ${active.title}`;
      if (project && tpl?.artifacts) {
        project.artifacts = { ...project.artifacts, ...tpl.artifacts(project) };
        project.updatedAt = stamp;
      }
      if (project) {
        const postedProto = Boolean(tpl?.artifacts?.(project).prototypeUrl);
        if (postedProto) {
          pushMessage(snap, {
            channelId: projectChannelId(project.id),
            author: agentId,
            kind: 'prototype',
            projectId: project.id,
            text: `Testing ground is up for “${project.title}”. Open ${prototypeUrlFor(project)}, click through it, then approve in this thread. The live site stays locked until you do.`,
          });
        } else {
          pushMessage(snap, {
            channelId: projectChannelId(project.id),
            author: agentId,
            text: handoffLine(active, project, def),
            projectId: project.id,
          });
        }
      }
    }
  }

  for (const p of snap.projects) completeStageIfDone(snap, p);

  saveStudioStore(snap);
}

export function answerQuestion(questionId: string, answer: string) {
  const snap = loadStudioStore();
  const q = snap.questions.find((x) => x.id === questionId);
  if (!q || q.answeredAt) return;
  q.answer = answer.trim();
  q.answeredAt = nowIso();
  const project = snap.projects.find((p) => p.id === q.projectId);
  if (project && q.answerKey) {
    project.briefAnswers = { ...(project.briefAnswers ?? {}), [q.answerKey]: q.answer };
    project.updatedAt = nowIso();
  }
  pushMessage(snap, {
    channelId: projectChannelId(q.projectId),
    author: q.agentId,
    projectId: q.projectId,
    text: `Got it — ${q.answer}. Back to it.`,
  });
  unblock(snap);
  saveStudioStore(snap);
}

export function decideApproval(approvalId: string, decision: 'approved' | 'rejected', note?: string) {
  const snap = loadStudioStore();
  const a = snap.approvals.find((x) => x.id === approvalId);
  if (!a || a.decidedAt) return;
  a.decision = decision;
  a.note = note?.trim() || undefined;
  a.decidedAt = nowIso();

  const project = snap.projects.find((p) => p.id === a.projectId);
  if (!project) {
    saveStudioStore(snap);
    return;
  }

  if (decision === 'approved') {
    setStatus(project, a.toStatus);
    ensureProject(snap, project);
    const note = a.note ? ` Noted: “${a.note}”.` : '';
    const after =
      a.fromStatus === 'needs_prototype_review'
        ? `Approved the testing ground. Priya can take “${project.title}” onto a live-site branch — still not production until Tess signs off.${note}`
        : a.fromStatus === 'needs_build_review'
          ? `Preview approved. Tess will QA it. Live site is still locked.${note}`
          : a.fromStatus === 'needs_signoff'
            ? `Signed off. Shipping “${project.title}” to the live site now.${note}`
            : `Approved — moving “${project.title}” to ${STATUS_LABEL[project.status]}.${note}`;
    pushMessage(snap, {
      channelId: projectChannelId(project.id),
      author: a.agentId,
      projectId: project.id,
      text: after,
    });
  } else {
    // Rework: find the working stage that produced this approval, wipe its tasks, respawn.
    const def = STAGE_BY_REVIEW.get(a.fromStatus) ?? STAGE_BY_WORK.get(a.fromStatus);
    if (def) {
      snap.tasks = snap.tasks.filter((t) => !(t.projectId === project.id && t.stage === def.work));
      setStatus(project, def.work);
      spawnStage(snap, project, def);
    }
    const rejections = snap.approvals.filter(
      (x) => x.projectId === project.id && x.fromStatus === a.fromStatus && x.decision === 'rejected',
    ).length;
    if (def && rejections >= ESCALATE_AFTER_REJECTIONS) {
      escalate(
        snap,
        project,
        a.agentId,
        def.work,
        `Sent back ${rejections}× on “${a.title}”${a.note ? ` (last note: “${a.note}”)` : ''}. I need a clearer Figma selection before I guess again.`,
        'figma',
      );
    } else {
      pushMessage(snap, {
        channelId: projectChannelId(project.id),
        author: a.agentId,
        projectId: project.id,
        text: `Understood${a.note ? ` — “${a.note}”` : ''}. Reworking now.`,
      });
    }
  }
  saveStudioStore(snap);
}

/* ------------------------------------------------------------------ */
/* Human escalation                                                    */
/* ------------------------------------------------------------------ */

/**
 * An agent stops and asks a real person for a reference. Its tasks for the
 * stage are blocked on `human` until a reference is added to the brief
 * (project page, or `/reference <url>` in the channel).
 */
function hasFigmaSelection(project: StudioProject) {
  const urls = [project.artifacts.figmaUrl, project.specUrl, project.brief, ...project.references.map((r) => r.value)];
  return urls.some((u) => u && isFigmaSelectionUrl(u));
}

function escalate(
  snap: StudioStoreSnapshot,
  project: StudioProject,
  agentId: StudioAgentId,
  stage: StudioProjectStatus,
  reason: string,
  kind: StudioEscalation['kind'] = 'generic',
) {
  const esc: StudioEscalation = {
    id: uid('esc'),
    agentId,
    stage,
    kind,
    reason,
    to: HUMAN_REVIEWERS,
    createdAt: nowIso(),
  };
  project.escalation = esc;
  project.updatedAt = esc.createdAt;
  for (const t of snap.tasks) {
    if (t.projectId === project.id && t.stage === stage && t.status !== 'done') {
      t.status = 'blocked';
      t.blockedBy = 'human';
      t.updatedAt = esc.createdAt;
    }
  }
  const who = HUMAN_REVIEWERS.map((h) => `@${h}`).join(' ');
  const ask =
    kind === 'figma'
      ? `${who} — could you give me a Figma reference for “${project.title}”? ${reason} I need the Dev Mode link to the frame (Copy link to selection), pasted in this chat.`
      : `${who} — I need a human reference on “${project.title}”. ${reason} Drop a Figma link, screenshot or a sentence on what “good” looks like (here with /reference <url> <note>, or on the brief page) and I'll pick it back up. Holding until then.`;
  pushMessage(snap, {
    channelId: projectChannelId(project.id),
    author: agentId,
    kind: 'escalation',
    refId: esc.id,
    text: ask,
    projectId: project.id,
  });
  pushMessage(snap, {
    channelId: GENERAL_CHANNEL_ID,
    author: agentId,
    kind: 'escalation',
    refId: esc.id,
    text:
      kind === 'figma'
        ? `${who} — need a Figma frame selection for “${project.title}” before I can build. How-to is in #${slugify(project.title)}.`
        : `${who} — stuck on “${project.title}” (${STATUS_LABEL[stage]}). Asked for a reference in #${slugify(project.title)}.`,
    projectId: project.id,
  });
}

/** You (or another human) ask an agent to stop and wait for a reference. */
export function requestHumanReference(projectId: string, agentId: StudioAgentId, reason: string) {
  const snap = loadStudioStore();
  const project = snap.projects.find((p) => p.id === projectId);
  if (!project) return;
  const stage = STAGE_BY_REVIEW.get(project.status)?.work ?? project.status;
  escalate(snap, project, agentId, stage, reason || 'Flagged from chat.', 'figma');
  saveStudioStore(snap);
}

/* ------------------------------------------------------------------ */
/* Agent presentation state (for the scene + panels)                  */
/* ------------------------------------------------------------------ */

export type AgentMood = 'idle' | 'working' | 'waiting_ceo' | 'handoff';

export interface AgentState {
  agentId: StudioAgentId;
  mood: AgentMood;
  activeTask: StudioTask | null;
  queue: StudioTask[];
  recentDone: StudioTask[];
  openQuestions: StudioQuestion[];
  pendingApprovals: StudioApproval[];
  projectTitle: string | null;
}

export function deriveAgentStates(snap: StudioStoreSnapshot): Record<StudioAgentId, AgentState> {
  const titles = new Map(snap.projects.map((p) => [p.id, p.title]));
  const out = {} as Record<StudioAgentId, AgentState>;
  for (const agentId of Object.keys(AGENT_BY_ID) as StudioAgentId[]) {
    const mine = snap.tasks.filter((t) => t.agentId === agentId);
    const activeTask = mine.find((t) => t.status === 'active') ?? null;
    const queue = mine
      .filter((t) => t.status === 'queued' || t.status === 'blocked')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const recentDone = mine
      .filter((t) => t.status === 'done')
      .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
      .slice(0, 5);
    const openQs = snap.questions.filter((q) => q.agentId === agentId && !q.answeredAt);
    const pendingAppr = snap.approvals.filter((a) => a.agentId === agentId && !a.decidedAt);

    const waitingHuman = mine.some((t) => t.status === 'blocked' && t.blockedBy === 'human');

    let mood: AgentMood = 'idle';
    if (openQs.length || pendingAppr.length || waitingHuman) mood = 'waiting_ceo';
    else if (activeTask) mood = 'working';
    else if (recentDone[0] && Date.now() - Date.parse(recentDone[0].completedAt ?? '') < 8000) mood = 'handoff';

    const projectId = activeTask?.projectId ?? openQs[0]?.projectId ?? pendingAppr[0]?.projectId;
    out[agentId] = {
      agentId,
      mood,
      activeTask,
      queue,
      recentDone,
      openQuestions: openQs,
      pendingApprovals: pendingAppr,
      projectTitle: projectId ? (titles.get(projectId) ?? null) : null,
    };
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Agent chat (rule-based, until real agents are wired in)             */
/* ------------------------------------------------------------------ */

const FIGMA_URL = /https?:\/\/(?:www\.)?figma\.com\/[^\s)]+/i;

export function agentReply(agentId: StudioAgentId, text: string, snap: StudioStoreSnapshot): string {
  const agent = AGENT_BY_ID[agentId];
  const s = deriveAgentStates(snap)[agentId];
  const q = text.toLowerCase();
  const t = s.activeTask;
  const figma = text.match(FIGMA_URL)?.[0];

  if (figma) {
    const selection = isFigmaSelectionUrl(figma);
    return selection
      ? `Got the Dev Mode selection. That's the frame I'll build from — shipped shell, content area only, Lumen tokens. I'll pick the work back up now.`
      : `That's a Figma file, but I need the frame itself. Open Dev Mode (Shift+D), select the frame, Copy link to selection, paste that here. Example: ${FIGMA_SELECTION_EXAMPLE}`;
  }
  if (/figma|dev.?mode|link to selection|reference|not enough|context|frame/.test(q) && /give|need|how|copy|paste|send|reference/.test(q)) {
    return `I need a Figma frame selection, not a screenshot.\n1. Build or select the frame.\n2. Dev Mode (Shift+D).\n3. Select the frame.\n4. Right-click → Copy link to selection.\n5. Paste it in this chat.\nExample: ${FIGMA_SELECTION_EXAMPLE}`;
  }
  if (/prototype|testing.?ground|where.*(look|see|click|preview)/.test(q)) {
    const pid = t?.projectId ?? s.pendingApprovals[0]?.projectId;
    const project = (pid && snap.projects.find((p) => p.id === pid)) || snap.projects.find((p) => p.artifacts.prototypeUrl);
    if (project?.artifacts.prototypeUrl) {
      return `Testing ground: ${prototypeUrlFor(project)}. Open that, click through it, then approve in this thread if it matches. Live site stays locked until Tess signs off.`;
    }
    return `No testing ground yet — I post the /prototype link in this channel when the clickable build is up. Approve that first. Live site only after Tess signs off.`;
  }
  if (/nudge|tighter|looser|too (big|small|close|far)|8px|spacing|padding|hover|wrong|fix|move|align/.test(q)) {
    return t
      ? `Noted — I'll apply that on “${t.title}” (${s.projectTitle}). Stay here and I'll show you when it's in.`
      : `Noted. I'll put that on the next pass in this channel. Same shell, content area only.`;
  }
  if (/shell|mobile|drawer|dock|ubc|header|sidebar|live.?site|what.*(built|shipped|know|done)/.test(q)) {
    return `${agentKnowledgeBrief()}\nThat's the current product chrome. New work sits inside it — we don't rebuild header, nav, UBC or the dock unless the brief is explicitly a shell change.`;
  }
  if (/lumen|design system|token|outside|off.?system|hex|detach/.test(q)) {
    return `Everything we make is ${DS}-only: library instances in Figma, token classes in code, and the lint blocks anything else before it reaches you. If ${DS} is missing something, it becomes a component brief — we never improvise a one-off.`;
  }
  if (/figma|frame|file/.test(q)) {
    return agentId === 'designer' || agentId === 'librarian'
      ? `I work in the ${DS} file (${DESIGN_SYSTEM.figmaLibraryName}). New work goes on its own page; every node is a library instance or bound to a variable.`
      : `Figma is Mika and Ivo's desk — ask them. I pick up once the frames are approved.`;
  }
  if (/storybook|story|stories/.test(q)) {
    return agentId === 'ui_engineer'
      ? `Each component gets a story per variant, a Figma link, and lands in the preview build for your sign-off before any feature can import it.`
      : `Storybook is Ren's. Nothing I build imports a component that isn't approved there.`;
  }
  if (/eta|when|how long|ready/.test(q)) {
    if (t) {
      const left = Math.max(1, Math.round(((100 - t.progress) / 100) * (t.durationMs / 1000)));
      return `“${t.title}” is ${Math.round(t.progress)}% — about ${left}s left on ${s.projectTitle ?? 'this project'}.`;
    }
    return s.queue.length
      ? `Nothing active. Next up: “${s.queue[0]!.title}”.`
      : `Desk is clear. Brief something new or approve the pending work and I'll pick it up.`;
  }
  if (/block|stuck|waiting|why/.test(q)) {
    const held = s.queue.find((x) => x.blockedBy === 'human');
    if (held) return `Holding “${held.title}” until a human drops a reference — /reference <url> <note> in the brief's channel unblocks me.`;
    if (s.openQuestions.length) return `I'm waiting on you: “${s.openQuestions[0]!.text}” Answer it in the channel and I'll move.`;
    if (s.pendingApprovals.length) {
      const waiting = s.pendingApprovals[0]!;
      const brief = snap.projects.find((p) => p.id === waiting.projectId);
      const proto =
        waiting.fromStatus === 'needs_prototype_review' && brief?.artifacts.prototypeUrl
          ? ` Testing ground: ${prototypeUrlFor(brief)}.`
          : '';
      return `My work is on your desk: “${waiting.title}”.${proto} Approve or send it back.`;
    }
    return t ? `Not blocked — heads down on “${t.title}”.` : `Not blocked, just idle.`;
  }
  if (/next|queue|after/.test(q)) {
    return s.queue.length ? `Queue: ${s.queue.map((x) => `“${x.title}”`).join(', ')}.` : `Queue is empty after this.`;
  }
  if (/skill|how do you|what do you do|role/.test(q)) {
    return `${agent.role}. ${agent.blurb} Tools: ${agent.skills.join(', ')}.`;
  }
  if (/hi|hello|hey/.test(q)) {
    return `Hey. ${t ? `On “${t.title}” for ${s.projectTitle}.` : 'Nothing on my desk right now.'}`;
  }
  if (s.mood === 'waiting_ceo')
    return s.openQuestions.length
      ? `Quick one for you first: “${s.openQuestions[0]!.text}”`
      : `Waiting on your call: “${s.pendingApprovals[0]!.title}”.`;
  if (t) return `Working on “${t.title}” for ${s.projectTitle} — ${Math.round(t.progress)}%. ${t.detail}`;
  return `Idle. ${agent.blurb}`;
}

/* ------------------------------------------------------------------ */
/* Studio chat: routing + slash commands                               */
/* ------------------------------------------------------------------ */

export const CHAT_COMMANDS: { cmd: string; args?: string; help: string }[] = [
  { cmd: '/standup', help: 'Daily stand-up — everyone posts what they did, what’s next, blockers.' },
  { cmd: '/meeting', args: '<topic>', help: 'Call a meeting on a topic; each discipline weighs in.' },
  { cmd: '/status', help: 'Design Lead summarises the board and what’s waiting on you.' },
  { cmd: '/reference', args: '<url> [note]', help: 'Attach a reference to this brief — unblocks an agent waiting on a human.' },
  { cmd: '/figma', help: 'How to copy a Figma Dev Mode selection link for an agent.' },
  { cmd: '/ask-human', args: '[@Agent] <why>', help: 'Make an agent stop and wait for a human reference on this brief.' },
  { cmd: '/channel', args: '<name>', help: 'Create a channel (briefs get one automatically).' },
  { cmd: '/help', help: 'List commands.' },
];

function standupLine(s: AgentState): string {
  const did = s.recentDone[0] ? `Yesterday: “${s.recentDone[0].title}”.` : 'Yesterday: nothing shipped.';
  const now = s.activeTask
    ? `Today: “${s.activeTask.title}” for ${s.projectTitle} (${Math.round(s.activeTask.progress)}%).`
    : s.queue.length
      ? `Today: picking up “${s.queue[0]!.title}”.`
      : 'Today: free — can pair or take a brief.';
  const blockers = s.openQuestions.length
    ? `Blocker: need your answer — “${s.openQuestions[0]!.text}”`
    : s.pendingApprovals.length
      ? `Blocker: “${s.pendingApprovals[0]!.title}” is on your desk.`
      : 'No blockers.';
  return `${did} ${now} ${blockers}`;
}

const MEETING_TAKES: Record<StudioAgentId, (topic: string) => string> = {
  lead: (t) => `Scope check on “${t}”: fine as long as it ships through the normal gates. I'll put it on the board.`,
  librarian: (t) => `Before anyone designs “${t}” I'll check what ${DS} already has for it — I'd rather reuse than add.`,
  designer: (t) => `“${t}” is a frame or two from existing ${DS} instances. If it needs a new pattern that's a component brief first.`,
  ui_engineer: (t) => `If “${t}” needs a new component it goes to Storybook with every variant before a feature touches it.`,
  tokens: (t) => `Any new colour or spacing for “${t}” has to be a Figma variable first, then it syncs to code. No one-off values.`,
  engineer: (t) => `I can build “${t}” once the frames and components are approved — approved Storybook imports only.`,
  qa: (t) => `I'll add “${t}” to the QA list: Figma diff, token lint, contrast, keyboard, breakpoints.`,
};

function channelProject(snap: StudioStoreSnapshot, channelId: string): StudioProject | null {
  const ch = snap.channels.find((c) => c.id === channelId);
  return ch?.projectId ? (snap.projects.find((p) => p.id === ch.projectId) ?? null) : null;
}

/** Standups and meetings: the whole studio shows up, even on a project channel. */
function agentsForChannel(_snap: StudioStoreSnapshot, _channelId: string): StudioAgentId[] {
  return AGENTS.map((a) => a.id);
}

/**
 * You send a message to a channel. Persists the message, then schedules
 * replies (agents answer with a short human-ish delay). Returns true if a
 * slash command was recognised.
 */
export function sendCeoMessage(channelId: string, raw: string): { command: boolean; typing: StudioAgentId[] } {
  const text = raw.trim();
  if (!text) return { command: false, typing: [] };
  const snap = loadStudioStore();
  const dmEarly = channelId.startsWith('dm:') ? (channelId.slice(3) as StudioAgentId) : null;
  const activeForDm = dmEarly
    ? snap.tasks.find((t) => t.agentId === dmEarly && (t.status === 'active' || t.status === 'queued'))
    : undefined;
  const project =
    channelProject(snap, channelId) ??
    (activeForDm ? (snap.projects.find((p) => p.id === activeForDm.projectId) ?? null) : null);

  pushMessage(snap, { channelId, author: 'ceo', text, projectId: project?.id });
  saveStudioStore(snap);

  const figmaLinks = text.match(/https?:\/\/(?:www\.)?figma\.com\/[^\s)]+/gi) ?? [];
  if (project && figmaLinks.length) {
    for (const url of figmaLinks) {
      addReference(project.id, { kind: 'url', label: 'Figma', value: url, notes: 'Dropped in chat' });
    }
  }

  const later = (ms: number, fn: () => void) => window.setTimeout(fn, ms);
  const post = (author: StudioAgentId | 'system', body: string, kind: 'text' | 'standup' | 'system' = 'text') => {
    const s = loadStudioStore();
    pushMessage(s, { channelId, author, text: body, kind, projectId: project?.id });
    saveStudioStore(s);
  };

  if (text.startsWith('/')) {
    const [cmd, ...rest] = text.split(/\s+/);
    const arg = rest.join(' ').trim();
    const lower = (cmd ?? '').toLowerCase();

    if (lower === '/standup') {
      pushMessage(snap, {
        channelId,
        author: 'system',
        kind: 'system',
        text: `Stand-up${project ? ` · ${project.title}` : ''} — ${new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}`,
        projectId: project?.id,
      });
      saveStudioStore(snap);
      agentsForChannel(snap, channelId).forEach((id, i) =>
        later(500 + i * 650, () => post(id, standupLine(deriveAgentStates(loadStudioStore())[id]), 'standup')),
      );
      return { command: true, typing: agentsForChannel(snap, channelId) };
    }
    if (lower === '/meeting') {
      const topic = arg || project?.title || 'the roadmap';
      pushMessage(snap, {
        channelId,
        author: 'system',
        kind: 'system',
        text: `Meeting called: “${topic}”. Everyone in.`,
        projectId: project?.id,
      });
      saveStudioStore(snap);
      agentsForChannel(snap, channelId).forEach((id, i) => later(600 + i * 700, () => post(id, MEETING_TAKES[id](topic))));
      later(700 + agentsForChannel(snap, channelId).length * 700, () =>
        post('lead', `Actions captured on the board. Anything you want changed, tell me here.`),
      );
      return { command: true, typing: agentsForChannel(snap, channelId) };
    }
    if (lower === '/status') {
      saveStudioStore(snap);
      later(500, () => {
        const s = loadStudioStore();
        const cols = BOARD_COLUMNS.map((c) => `${c.label} ${s.projects.filter((p) => c.statuses.includes(p.status)).length}`).join(' · ');
        const qs = s.questions.filter((q) => !q.answeredAt).length;
        const ap = s.approvals.filter((a) => !a.decidedAt).length;
        post('lead', `Board: ${cols}. Waiting on you: ${qs} question${qs === 1 ? '' : 's'}, ${ap} approval${ap === 1 ? '' : 's'}.`);
      });
      return { command: true, typing: ['lead'] };
    }
    if (lower === '/reference') {
      saveStudioStore(snap);
      if (!project) {
        later(150, () => post('system', 'Use /reference inside a brief’s channel.', 'system'));
        return { command: true, typing: [] };
      }
      const [url, ...noteParts] = arg.split(/\s+/);
      if (!url || !/^https?:\/\//i.test(url)) {
        later(150, () => post('system', 'Usage: /reference <https://…> [note]', 'system'));
        return { command: true, typing: [] };
      }
      addReference(project.id, { kind: 'url', label: url, value: url, notes: noteParts.join(' ') || undefined });
      return { command: true, typing: [] };
    }
    if (lower === '/figma') {
      saveStudioStore(snap);
      later(150, () =>
        post(
          'lead',
          `Need a frame, not a file.\n1. Build or select the frame in Figma.\n2. Dev Mode (Shift+D).\n3. Select that frame.\n4. Right-click → Copy link to selection.\n5. Paste it in this chat.\nExample: ${FIGMA_SELECTION_EXAMPLE}`,
        ),
      );
      return { command: true, typing: ['lead'] };
    }
    if (lower === '/ask-human') {
      saveStudioStore(snap);
      if (!project) {
        later(150, () => post('system', 'Use /ask-human inside a brief’s channel.', 'system'));
        return { command: true, typing: [] };
      }
      const target = AGENTS.find((a) => new RegExp(`@${a.name}\\b`, 'i').test(arg))?.id ?? 'lead';
      const why = arg.replace(/@\w+/g, '').trim();
      requestHumanReference(project.id, target, why || 'Flagged from chat.');
      return { command: true, typing: [target] };
    }
    if (lower === '/channel') {
      saveStudioStore(snap);
      if (!arg) {
        later(200, () => post('system', 'Usage: /channel <name>', 'system'));
        return { command: true, typing: [] };
      }
      createCustomChannel(arg);
      return { command: true, typing: [] };
    }
    if (lower === '/help') {
      saveStudioStore(snap);
      later(150, () => post('system', CHAT_COMMANDS.map((c) => `${c.cmd}${c.args ? ` ${c.args}` : ''} — ${c.help}`).join('\n'), 'system'));
      return { command: true, typing: [] };
    }
    saveStudioStore(snap);
    later(150, () => post('system', `Unknown command ${cmd}. Try /help.`, 'system'));
    return { command: true, typing: [] };
  }

  saveStudioStore(snap);

  // Plain message: in a DM the agent replies; in a channel, @mentions reply,
  // otherwise the Design Lead picks it up.
  const dm = channelId.startsWith('dm:') ? (channelId.slice(3) as StudioAgentId) : null;
  const mentioned = AGENTS.filter((a) => new RegExp(`@${a.name}\\b`, 'i').test(text)).map((a) => a.id);
  const responders: StudioAgentId[] = dm && AGENT_BY_ID[dm] ? [dm] : mentioned.length ? mentioned : ['lead'];

  responders.forEach((id, i) =>
    later(450 + i * 500 + Math.random() * 400, () => {
      const s = loadStudioStore();
      post(id, agentReply(id, text, s));
    }),
  );
  return { command: false, typing: responders };
}

/** Channel you should open for an agent: their DM. */
export const agentDmChannel = (agentId: StudioAgentId) => dmChannelId(agentId);
