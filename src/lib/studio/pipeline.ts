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
import { detectTasteAsk, recordTaste, suggestMoment } from './taste';
import { deriveMock, liveUrlFor, prototypeUrlFor, qaUrlFor, storybookStoryUrl, usesTestingGround } from './mock';
import {
  GENERAL_CHANNEL_ID,
  addReference,
  activeProjects,
  createChatJob,
  clearAgentChat,
  createCustomChannel,
  dmChannelId,
  removeChannel,
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
  StudioAttachment,
  StudioEscalation,
  StudioProject,
  StudioProjectStatus,
  StudioQuestion,
  StudioStoreSnapshot,
  StudioTask,
  CursorRunMode,
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
  /** Only spawn for these origins (default: all). */
  origins?: Array<'brief' | 'chat'>;
}

interface QuestionTemplate {
  agentId: StudioAgentId;
  answerKey: string;
  text: string;
  options: string[];
  kinds?: StudioProject['kind'][];
  origins?: Array<'brief' | 'chat'>;
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
  /** Skip for chat-started jobs (small asks stay in-thread). */
  skipForOrigin?: Array<'brief' | 'chat'>;
  /** Block and ask for a Figma Dev Mode selection if the brief has none. */
  needsFigma?: boolean;
}

const ans = (p: StudioProject, key: string, fallback = '—') => p.briefAnswers?.[key] || fallback;
const DS = DESIGN_SYSTEM.name;
const SEC = 1000;
const slug = (p: StudioProject) => slugify(p.title);

/** Always true for this studio — never ask these in chat or on the brief. */
const ASSUMED_ANSWER: Record<string, string> = {
  platform: 'Desktop, tablet, and mobile',
  theme: `${TARGETS.liveSiteBrand} light + dark`,
  pattern: `Reuse existing ${DS}`,
  done_looks_like: `Match ${DS} on mobile, tablet, and desktop`,
  density: 'Match the nearest existing screen',
  stories: 'Match the Figma component set exactly',
};

export function isAssumedQuestionKey(key: string) {
  return Object.prototype.hasOwnProperty.call(ASSUMED_ANSWER, key);
}

function fillAssumedAnswers(project: StudioProject) {
  project.briefAnswers = { ...ASSUMED_ANSWER, ...(project.briefAnswers ?? {}) };
}

function assumedBriefAnswers(extra?: Record<string, string>) {
  return { ...ASSUMED_ANSWER, ...extra };
}

function resolveAssumedQuestions(snap: StudioStoreSnapshot) {
  for (const q of snap.questions) {
    if (q.answeredAt) continue;
    const answer = ASSUMED_ANSWER[q.answerKey];
    if (!answer) continue;
    q.answer = answer;
    q.answeredAt = nowIso();
    const project = snap.projects.find((p) => p.id === q.projectId);
    if (project) {
      fillAssumedAnswers(project);
      project.briefAnswers = { ...project.briefAnswers, [q.answerKey]: answer };
      project.updatedAt = nowIso();
    }
  }
  for (const p of snap.projects) fillAssumedAnswers(p);
  unblock(snap);
}

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
        answerKey: 'scope',
        text: 'How big is this?',
        options: ['Single screen', 'Flow (2–5 screens)', 'Whole area', "Lead's call"],
        kinds: ['feature'],
        origins: ['brief'],
      },
      {
        agentId: 'lead',
        answerKey: 'variants',
        text: 'Variant coverage for the component?',
        options: ['All sizes + states', 'Core states only', `Match an existing ${DS} component`],
        kinds: ['component'],
        origins: ['brief'],
      },
    ],
    tasks: [
      {
        agentId: 'lead',
        title: 'Specify from PRD',
        origins: ['brief'],
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
      {
        agentId: 'lead',
        title: 'Scope the chat request',
        origins: ['chat'],
        detail: 'Turn the Slack ask into a one-screen scope the team can build — no PRD, no new brief form.',
        durationMs: 18 * SEC,
        artifacts: (p) => ({ specPath: `specs/${slug(p)}/chat-scope.md` }),
        deliverable: (p) =>
          [
            `# Chat scope — ${p.title}`,
            `Asked in chat: ${p.brief}`,
            `Surface: ${p.surface || 'TBD'} · ${DS} only · Desktop, tablet, and mobile.`,
            `Constitution: ${DS} only. Same shipped shell. Content area only.`,
            agentKnowledgeBrief(),
          ].join('\n'),
      },
    ],
    approval: {
      agentId: 'lead',
      title: 'Approve spec',
      summary: (p) =>
        p.origin === 'chat'
          ? `Scope for “${p.title}” is ready from this thread. Approving starts the ${DS} audit. Still not live.`
          : `spec.md for “${p.title}” is ready (user stories, acceptance criteria, ${DS}-only constitution). Approving starts the ${DS} coverage audit. Nothing touches Figma yet.`,
    },
  },
  {
    work: 'auditing',
    review: 'needs_audit_review',
    next: (p) => (p.kind === 'component' ? 'building_components' : 'designing'),
    skipForOrigin: ['chat'],
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
    skipForOrigin: ['chat'],
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
    skipForOrigin: ['chat'],
    needsFigma: true,
    tasks: [
      {
        agentId: 'ui_engineer',
        title: 'Clickable prototype',
        detail: `Static build of the approved frames using ${DS} tokens + approved components; deployed to a URL.`,
        durationMs: 50 * SEC,
        artifacts: (p) => ({ prototypeUrl: `/prototype?id=${encodeURIComponent(p.id)}&ground=1` }),
        deliverable: (p) =>
          [
            `# Prototype — ${p.title}`,
            `URL: /prototype?id=${p.id}&ground=1`,
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
    skipForOrigin: ['chat'],
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
          usesTestingGround(p)
            ? `# QA sheet — ${p.title}\nTesting ground (mobile / tablet / desktop): ${qaUrlFor(p)}\nThis is a page change — not a /component variant sheet.`
            : `# Storybook — ${p.title}\n${storybookStoryUrl(deriveMock(p).archetype)}\nProject sheet (every variant × size × state): /component?id=${p.id}\nAll values resolve to Lumen tokens — lint 0 violations.`,
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
    skipForOrigin: ['chat'],
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
        detail: 'Same testing ground at mobile 375, tablet 768, desktop 1440. Visual diff vs Figma, token lint, a11y. Never a /component sheet for page work.',
        durationMs: 40 * SEC,
        artifacts: (p) => ({ prototypeUrl: prototypeUrlFor(p) }),
        deliverable: (p) =>
          usesTestingGround(p)
            ? `# QA — ${p.title}\nReview the testing ground at every device size: ${qaUrlFor(p)}\nMobile 375 · Tablet 768 · Desktop 1440. This is the casino/page build — not /component.`
            : `# QA — ${p.title}\nVisual diff within tolerance · token lint 0 · a11y 0 critical · breakpoints OK · acceptance criteria met.`,
      },
    ],
    approval: {
      agentId: 'qa',
      title: 'Sign off for launch',
      summary: (p) =>
        usesTestingGround(p)
          ? `QA is the same testing ground you already saw — now at mobile / tablet / desktop: ${qaUrlFor(p)}. Approving ships it to the live site.`
          : p.kind === 'component'
            ? `QA passed for “${p.title}”. Approving publishes the component (Storybook + package) for features to use.`
            : `QA passed for “${p.title}”. This is the last gate. Approving is what ships it to the live site.`,
    },
  },
  {
    work: 'launching',
    review: null,
    next: 'live',
    skipForOrigin: ['chat'],
    tasks: [
      {
        agentId: 'engineer',
        title: 'Merge + deploy',
        detail: 'Merge the approved PR, wait for the production deploy, smoke-check the URL.',
        durationMs: 20 * SEC,
        artifacts: (p) => {
          if (usesTestingGround(p)) {
            const casino = /casino|sub[- ]?nav/i.test(`${p.title} ${p.surface}`);
            return { liveUrl: casino ? `${TARGETS.liveSiteUrl.replace(/\/$/, '')}/casino` : TARGETS.liveSiteUrl };
          }
          return p.kind === 'component'
            ? { liveUrl: `/component?id=${encodeURIComponent(p.id)}` }
            : { liveUrl: TARGETS.liveSiteUrl };
        },
        deliverable: (p) =>
          usesTestingGround(p) || p.kind !== 'component'
            ? `# Live — ${p.title}\nNow on the live site: ${liveUrlFor({ ...p, status: 'live' }) ?? TARGETS.liveSiteUrl}\nTesting ground stays at ${prototypeUrlFor(p)}.`
            : `# Published — ${p.title}\nComponent is approved and importable by feature builds.`,
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

function applies<T extends { kinds?: StudioProject['kind'][]; origins?: Array<'brief' | 'chat'> }>(t: T, p: StudioProject) {
  if (t.kinds && !t.kinds.includes(p.kind)) return false;
  if (t.origins && !t.origins.includes(p.origin ?? 'brief')) return false;
  return true;
}

function jobChannel(p: StudioProject) {
  return p.homeChannelId ?? projectChannelId(p.id);
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
    if (isAssumedQuestionKey(q.answerKey)) continue;
    if (project.briefAnswers?.[q.answerKey]) continue;
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
      channelId: jobChannel(project),
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

function abandonSimulatedTheater(snap: StudioStoreSnapshot, project: StudioProject) {
  const stamp = nowIso();
  for (const t of snap.tasks) {
    if (t.projectId !== project.id || t.status === 'done' || isCursorTask(t)) continue;
    t.status = 'done';
    t.progress = 100;
    t.completedAt = stamp;
    t.updatedAt = stamp;
    t.deliverable = 'Skipped. Chat / page jobs stay on the testing ground — Tess does not open a /component sheet.';
  }
}

function coercePageKind(project: StudioProject) {
  if (project.kind === 'component' && usesTestingGround(project)) {
    project.kind = 'feature';
    project.updatedAt = nowIso();
  }
}

/** Make sure every project has tasks/questions for its current stage; skip stages that don't apply. */
function ensureProject(snap: StudioStoreSnapshot, project: StudioProject) {
  fillAssumedAnswers(project);
  coercePageKind(project);
  if (
    project.origin === 'chat' &&
    ['needs_prototype_review', 'needs_signoff', 'qa_running', 'launching', 'live', 'cancelled', 'failed'].includes(project.status)
  ) {
    abandonSimulatedTheater(snap, project);
    return;
  }

  let def = STAGE_BY_WORK.get(project.status);
  let guard = 0;
  while (
    def &&
    (def.skipFor?.includes(project.kind) || def.skipForOrigin?.includes(project.origin ?? 'brief')) &&
    guard++ < 8
  ) {
    // Chat jobs must not walk skip-for stages into launching/live — that invented a /component page.
    if (project.origin === 'chat') {
      setStatus(project, 'needs_prototype_review');
      abandonSimulatedTheater(snap, project);
      return;
    }
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
        channelId: jobChannel(project),
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
    channelId: jobChannel(project),
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

  resolveAssumedQuestions(snap);
  for (const p of snap.projects) {
    if (p.archivedAt) continue;
    ensureProject(snap, p);
  }
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
        const project = snap.projects.find((p) => p.id === active!.projectId);
        if (project?.archivedAt) continue;
        if (project?.origin === 'chat' && !isCursorTask(active)) {
          abandonSimulatedTheater(snap, project);
          continue;
        }
        active.status = 'active';
        active.updatedAt = stamp;
        if (project) {
          pushMessage(snap, {
            channelId: jobChannel(project),
            author: agentId,
            text: `Starting “${active.title}” on ${project.title}. I'll post here as I go — stay in this thread for the fine detail.`,
            projectId: project.id,
          });
        }
      }
    }
    if (!active) continue;
    if (snap.projects.find((p) => p.id === active.projectId)?.archivedAt) continue;
    if (isCursorTask(active)) continue;
    const chatProject = snap.projects.find((p) => p.id === active.projectId);
    if (chatProject?.origin === 'chat') {
      abandonSimulatedTheater(snap, chatProject);
      continue;
    }

    const before = active.progress;
    active.progress = Math.min(100, active.progress + (dtMs / active.durationMs) * 100);
    active.updatedAt = stamp;
    if (before < 42 && active.progress >= 42 && isRevisionTask(active)) {
      const project = snap.projects.find((p) => p.id === active!.projectId);
      if (project) {
        pushMessage(snap, {
          channelId: jobChannel(project),
          author: agentId,
          text:
            agentId === 'designer'
              ? `Screenshot vs Figma: the bar isn’t the frame. Search/heart aren’t the library icons, Lobby pill and item order are off. I’m marking the gaps for Ren.`
              : `Rebuilding the testing-ground bar to the Figma frame — shipped Button, search, heart. I’ll post the link when it’s in.`,
          projectId: project.id,
        });
      }
    }
    if (active.progress >= 100) {
      const project = snap.projects.find((p) => p.id === active!.projectId);
      const def = STAGE_BY_WORK.get(active.stage);
      const tpl = def?.tasks.find((t) => t.title === active!.title && t.agentId === agentId);
      active.status = 'done';
      active.completedAt = stamp;
      active.deliverable = project && tpl ? tpl.deliverable(project) : `Done: ${active.title}`;
      if (project && tpl?.artifacts && project.origin !== 'chat') {
        project.artifacts = { ...project.artifacts, ...tpl.artifacts(project) };
        project.updatedAt = stamp;
      }
      if (project && isRevisionTask(active)) {
        pushMessage(snap, {
          channelId: jobChannel(project),
          author: agentId,
          projectId: project.id,
          text:
            agentId === 'designer'
              ? `Diff is in the thread. Waiting on Ren’s Cursor run — I will not post a prototype until Figma MCP has been used.`
              : `Cursor is on it. I will not post a testing-ground link until the files actually change.`,
        });
      } else if (project) {
        const postedProto = Boolean(tpl?.artifacts?.(project).prototypeUrl);
        if (postedProto && project.origin === 'chat') {
          pushMessage(snap, {
            channelId: jobChannel(project),
            author: agentId,
            projectId: project.id,
            text: `Still on the Cursor run for “${project.title}”. I will post the testing-ground link only after Figma MCP has been used and the files change.`,
          });
        } else if (postedProto) {
          pushMessage(snap, {
            channelId: jobChannel(project),
            author: agentId,
            kind: 'prototype',
            projectId: project.id,
            text: `Testing ground is up for “${project.title}”. Open ${prototypeUrlFor(project)}, click through it, then approve in this thread. The live site stays locked until you do.`,
          });
        } else if (agentId === 'qa' && usesTestingGround(project)) {
          pushMessage(snap, {
            channelId: jobChannel(project),
            author: agentId,
            kind: 'prototype',
            projectId: project.id,
            text: `QA is the same testing ground — not a new page. Check Mobile 375, Tablet 768, Desktop 1440: ${qaUrlFor(project)}`,
          });
        } else {
          pushMessage(snap, {
            channelId: jobChannel(project),
            author: agentId,
            text: handoffLine(active, project, def),
            projectId: project.id,
          });
        }
      }
    }
  }

  for (const p of snap.projects) {
    if (p.origin === 'chat' || p.archivedAt) continue;
    completeStageIfDone(snap, p);
  }

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
    channelId: project ? jobChannel(project) : projectChannelId(q.projectId),
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

  const project = snap.projects.find((p) => p.id === a.projectId);
  if (!project) {
    saveStudioStore(snap);
    return;
  }

  a.decision = decision;
  a.note = note?.trim() || undefined;
  a.decidedAt = nowIso();

  recordTaste({
    kind: decision === 'approved' ? 'like' : 'hate',
    text: `${decision} “${project.title}”${note ? `: ${note}` : ''}`,
    surface: project.surface,
    source: 'approval',
  });

  if (decision === 'approved') {
    const shouldShip = a.toStatus === 'launching' || a.fromStatus === 'needs_signoff';
    setStatus(project, shouldShip ? 'launching' : a.toStatus);
    if (!shouldShip) ensureProject(snap, project);
    const note = a.note ? ` Noted: “${a.note}”.` : '';
    const after =
      shouldShip
        ? `Approved. Shipping “${project.title}” to the live site now — I’ll drop the link in a second. Rollback stays in this thread if it goes wrong.${note}`
        : a.fromStatus === 'needs_prototype_review'
          ? `Approved the testing ground. Priya can take “${project.title}” onto a live-site branch — still not production until Tess signs off.${note}`
          : a.fromStatus === 'needs_build_review'
            ? `Preview approved. Tess will QA it. Live site is still locked.${note}`
            : `Approved — moving “${project.title}” to ${STATUS_LABEL[project.status]}.${note}`;
    pushMessage(snap, {
      channelId: jobChannel(project),
      author: a.agentId,
      projectId: project.id,
      text: after,
    });
    saveStudioStore(snap);
    if (shouldShip) void publishLive(project.id);
    return;
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
        channelId: jobChannel(project),
        author: a.agentId,
        projectId: project.id,
        text: `Understood${a.note ? ` — “${a.note}”` : ''}. Reworking now.`,
      });
    }
  }
  saveStudioStore(snap);
}

export async function publishLive(projectId: string) {
  const before = loadStudioStore();
  const project = before.projects.find((p) => p.id === projectId);
  if (!project) return;
  const blob = `${project.title} ${project.surface} ${project.brief}`;
  const origin = TARGETS.liveSiteUrl.replace(/\/$/, '');
  const poker =
    /\bpoker\b/i.test(blob.replace(/video[\s-]*poker/gi, ' ')) &&
    !/originals|casino|lobby|banner/i.test(blob);
  const liveUrl = poker ? `${origin}/poker` : `${origin}/casino`;
  try {
    const res = await fetch('/api/studio/ship', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        title: project.title,
        surface: project.surface,
        brief: project.brief,
        liveUrl,
      }),
    });
    const data = (await res.json()) as { ok?: boolean; liveUrl?: string; rollbackId?: string; error?: string };
    const snap = loadStudioStore();
    const next = snap.projects.find((p) => p.id === projectId);
    if (!next) return;
    if (!res.ok || !data.ok) {
      pushMessage(snap, {
        channelId: jobChannel(next),
        author: 'system',
        kind: 'system',
        projectId,
        text: data.error || 'Live ship failed. Testing ground is still up; live was not changed.',
      });
      setStatus(next, 'needs_prototype_review');
      saveStudioStore(snap);
      requestChatSignoff(projectId);
      return;
    }
    setStatus(next, 'live');
    next.artifacts = {
      ...next.artifacts,
      liveUrl: data.liveUrl ?? liveUrl,
      rollbackId: data.rollbackId ?? projectId,
      figmaUrl: next.artifacts.figmaUrl,
    };
    pushMessage(snap, {
      channelId: jobChannel(next),
      author: 'lead',
      kind: 'live',
      projectId,
      text: `“${next.title}” is on the live site. Open it, and roll back from this thread if it’s wrong.`,
    });
    saveStudioStore(snap);
  } catch (err) {
    const snap = loadStudioStore();
    const next = snap.projects.find((p) => p.id === projectId);
    if (!next) return;
    pushMessage(snap, {
      channelId: jobChannel(next),
      author: 'system',
      kind: 'system',
      projectId,
      text: err instanceof Error ? err.message : 'Live ship failed.',
    });
    saveStudioStore(snap);
  }
}

export async function rollbackLive(projectId: string) {
  const snap = loadStudioStore();
  const project = snap.projects.find((p) => p.id === projectId);
  if (!project) return;
  try {
    const res = await fetch('/api/studio/rollback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    const next = loadStudioStore();
    const p = next.projects.find((x) => x.id === projectId);
    if (!p) return;
    if (!res.ok || !data.ok) {
      pushMessage(next, {
        channelId: jobChannel(p),
        author: 'system',
        kind: 'system',
        projectId,
        text: data.error || 'Rollback failed — live files were not changed.',
      });
      saveStudioStore(next);
      return;
    }
    p.artifacts = { ...p.artifacts, liveUrl: undefined, rollbackId: undefined };
    setStatus(p, 'needs_prototype_review');
    pushMessage(next, {
      channelId: jobChannel(p),
      author: 'lead',
      projectId,
      text: `Rolled “${p.title}” off the live site. It’s back on your desk — approve again when the testing ground is right.`,
    });
    saveStudioStore(next);
    requestChatSignoff(projectId);
  } catch (err) {
    const next = loadStudioStore();
    const p = next.projects.find((x) => x.id === projectId);
    if (!p) return;
    pushMessage(next, {
      channelId: jobChannel(p),
      author: 'system',
      kind: 'system',
      projectId,
      text: err instanceof Error ? err.message : 'Rollback failed.',
    });
    saveStudioStore(next);
  }
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
  const home = jobChannel(project);
  pushMessage(snap, {
    channelId: home,
    author: agentId,
    kind: 'escalation',
    refId: esc.id,
    text: ask,
    projectId: project.id,
  });
  if (home !== GENERAL_CHANNEL_ID) {
    pushMessage(snap, {
      channelId: GENERAL_CHANNEL_ID,
      author: agentId,
      kind: 'escalation',
      refId: esc.id,
      text:
        kind === 'figma'
          ? `${who} — need a Figma frame selection for “${project.title}” before I can build. How-to is in this thread.`
          : `${who} — stuck on “${project.title}” (${STATUS_LABEL[stage]}). Asked for a reference in this thread.`,
      projectId: project.id,
    });
  }
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
    const openQs = snap.questions.filter(
      (q) => q.agentId === agentId && !q.answeredAt && !isAssumedQuestionKey(q.answerKey),
    );
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
  if (/doing|happen(ing)?|anything|working|see (them|it)|are they/.test(q)) {
    if (t) {
      return `Yes — “${t.title}” is ${Math.round(t.progress)}% on ${s.projectTitle ?? 'this job'}. Watch the trace in this thread (files, +/-). I’ll post again when the testing ground updates.`;
    }
    return s.queue.length
      ? `Yes — “${s.queue[0]!.title}” is next. It’ll show in this thread the second they pick it up.`
      : `Nobody is on a task right now. Send the Figma miss or a screenshot and I’ll put Mika and Ren on a revision you can watch.`;
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
  return `Yeah — drop what you need here and I'll get the right people on it. Small change is fine in this thread; save New brief for a whole area.`;
}

/* ------------------------------------------------------------------ */
/* Studio chat: routing + slash commands                               */
/* ------------------------------------------------------------------ */

export const CHAT_COMMANDS: { cmd: string; args?: string; help: string }[] = [
  { cmd: '/standup', help: 'Daily stand-up — everyone posts what they did, what’s next, blockers.' },
  { cmd: '/meeting', args: '<topic>', help: 'Call a meeting on a topic; each discipline weighs in.' },
  { cmd: '/status', help: 'Design Lead summarises the board and what’s waiting on you.' },
  { cmd: '/reference', args: '<url> [note]', help: 'Attach a reference to this brief — unblocks an agent waiting on a human.' },
  { cmd: '/figma', help: 'Figma jobs: paste a frame to implement, /mockup to design in Lumen, /journey for FigJam flows.' },
  { cmd: '/ask-human', args: '[@Agent] <why>', help: 'Make an agent stop and wait for a human reference on this brief.' },
  { cmd: '/channel', args: '<name>', help: 'Create a channel (briefs get one automatically).' },
  { cmd: '/remove', help: 'Remove this channel from the sidebar (#general stays).' },
  { cmd: '/stop', help: 'Force-stop the agent that is running Cursor.' },
  { cmd: '/clear', help: 'Clear this DM thread.' },
  { cmd: '/mockup', args: '<title>', help: 'Design in Figma with Lumen_Desing System. New file in the Lumen folder. Posts the link.' },
  { cmd: '/journey', args: '<title>', help: 'FigJam flowchart of a user journey using real Lumen surfaces. Posts the board link.' },
  { cmd: '/approve', help: 'Sign off, write the live site, and create a new Figma file.' },
  { cmd: '/rollback', help: 'Take this job off the live site and bring it back to sign-off.' },
  { cmd: '/like', args: '<what>', help: 'Save a like — agents will keep doing this.' },
  { cmd: '/hate', args: '<what>', help: 'Save a dislike — agents will stop doing this.' },
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

const WORK_ASK =
  /\b(can you|could you|please|i (need|want)|we need|add|build|make|create|design|implement|ship|put|do we|fix|change|update|mock[\s-]?up|wireframe)\b/i;

function isJourneyAsk(text: string) {
  return /\b(user journey|customer journey|journey map|user flow|ux flow|flow map|figjam|service blueprint|happy path|onboarding flow)\b/i.test(text);
}

function isMockupAsk(text: string) {
  if (isJourneyAsk(text)) return false;
  const buildingFromLink =
    /https?:\/\/(?:www\.)?figma\.com\//i.test(text) &&
    /\b(build|implement|code|match|from this)\b/i.test(text);
  if (buildingFromLink) return false;
  return /\b(mock[\s-]?up|wireframe|figma (page|file|frame)s?|design (this|it|a|the) in figma|new figma file|draw (this|it|a screen) in figma|create (a )?(new )?figma)\b/i.test(text);
}

function figmaJobMode(text: string): CursorRunMode {
  if (isJourneyAsk(text)) return 'journey';
  if (isMockupAsk(text)) return 'mockup';
  return 'implement';
}

function figmaJobAgent(mode: CursorRunMode): StudioAgentId {
  return mode === 'mockup' || mode === 'journey' ? 'designer' : 'ui_engineer';
}
const SMALL_TALK = /^(hi|hello|hey|thanks|thank you|ok|okay|cool|nice|yo)\b/i;

function isWorkAsk(text: string) {
  if (SMALL_TALK.test(text.trim())) return false;
  if (text.startsWith('/')) return false;
  return WORK_ASK.test(text);
}

const REVISION_ASK =
  /\b(not (how|what|like)|doesn'?t (match|look|work)|wrong|off|redo|revis|again|look at|compare|closer|not the same|nothing like|this isn'?t|not matching|figma)\b/i;

function isRevisionAsk(text: string, imageCount: number, project: StudioProject | null) {
  if (!project) return false;
  if (imageCount > 0) return true;
  if (!text.trim()) return false;
  return REVISION_ASK.test(text) || isWorkAsk(text);
}

function isRevisionTask(task: StudioTask) {
  return /diff vs figma|rebuild.*figma|revise from/i.test(task.title);
}

function isCursorTask(task: StudioTask) {
  return task.title.startsWith('Cursor run');
}

/** Put Ren (or whoever) on an active Cursor job so the floor shows working. */
export function beginCursorJob(input: {
  agentId: StudioAgentId;
  projectId: string;
  title: string;
  channelId: string;
}): string {
  const snap = loadStudioStore();
  const stamp = nowIso();
  for (const t of snap.tasks) {
    if (t.agentId === input.agentId && t.status === 'active' && isCursorTask(t)) {
      t.status = 'done';
      t.completedAt = stamp;
      t.updatedAt = stamp;
    }
  }
  snap.tasks.push({
    id: uid('task'),
    projectId: input.projectId,
    agentId: input.agentId,
    stage: 'prototyping',
    title: `Cursor run · ${input.title}`,
    detail: 'Local Cursor + Figma MCP. Tool calls post in this thread.',
    status: 'active',
    progress: 8,
    durationMs: 24 * 60 * 60 * 1000,
    createdAt: stamp,
    updatedAt: stamp,
  });
  const msg = pushMessage(snap, {
    channelId: input.channelId,
    author: input.agentId,
    projectId: input.projectId,
    kind: 'cursor',
    text: '',
    activity: { summary: '', thinking: 'Thinking…', files: [], live: true },
  });
  saveStudioStore(snap);
  return msg.id;
}

export function pulseCursorJob(agentId: StudioAgentId) {
  const snap = loadStudioStore();
  for (const t of snap.tasks) {
    if (t.agentId === agentId && t.status === 'active' && isCursorTask(t)) {
      t.progress = Math.min(92, t.progress + 4);
      t.updatedAt = nowIso();
    }
  }
  saveStudioStore(snap);
}

/** Nova already said Ren is running, but the Cursor process never started. */
export function stalledCursorJob(channelId: string): CursorJob | null {
  const snap = loadStudioStore();
  const claim = [...snap.messages]
    .filter((m) => m.channelId === channelId && /running Cursor/i.test(m.text))
    .at(-1);
  if (!claim) return null;
  if (snap.tasks.some((t) => isCursorTask(t) && t.createdAt >= claim.createdAt)) return null;
  const project =
    (claim.projectId ? snap.projects.find((p) => p.id === claim.projectId) : null) ??
    chatJobInChannel(snap, channelId);
  if (!project) return null;
  const lastCeo = [...snap.messages].filter((m) => m.channelId === channelId && m.author === 'ceo').at(-1);
  const figmaUrls = [
    project.artifacts.figmaUrl,
    ...project.references.filter((r) => /figma\.com\//i.test(r.value)).map((r) => r.value),
    ...(`${project.brief} ${lastCeo?.text ?? ''}`.match(/https?:\/\/(?:www\.)?figma\.com\/[^\s)]+/gi) ?? []),
  ].filter((u): u is string => Boolean(u)).filter((url, i, all) => all.indexOf(url) === i);
  return {
    agentId: 'ui_engineer',
    title: project.title,
    prompt: lastCeo?.text || project.briefAnswers?.revisionNote || project.brief,
    figmaUrls,
    attachments: lastCeo?.attachments,
    projectId: project.id,
  };
}

/** Rebuild the last chat job so Retry works after a drop, even if a Cursor task already exists. */
export function recoverCursorJob(channelId: string): CursorJob | null {
  const snap = loadStudioStore();
  const project =
    channelProject(snap, channelId) ??
    chatJobInChannel(snap, channelId) ??
    snap.projects.find((p) => p.origin === 'chat' && !p.archivedAt && !['live', 'cancelled', 'failed'].includes(p.status)) ??
    null;
  if (!project) return null;
  const lastCeo = [...snap.messages].filter((m) => m.channelId === channelId && m.author === 'ceo').at(-1);
  const figmaUrls = [
    project.artifacts.figmaUrl,
    ...project.references.filter((r) => /figma\.com\//i.test(r.value)).map((r) => r.value),
    ...(`${project.brief} ${lastCeo?.text ?? ''}`.match(/https?:\/\/(?:www\.)?figma\.com\/[^\s)]+/gi) ?? []),
  ].filter((u): u is string => Boolean(u)).filter((url, i, all) => all.indexOf(url) === i);
  const images = lastCeo?.attachments?.length
    ? lastCeo.attachments
    : project.references
        .filter((r) => r.kind === 'image')
        .slice(0, 2)
        .map((r) => ({ kind: 'image' as const, name: r.label, dataUrl: r.value }));
  return {
    agentId: 'ui_engineer',
    title: project.title,
    prompt: lastCeo?.text || project.briefAnswers?.revisionNote || project.brief,
    figmaUrls,
    attachments: images,
    projectId: project.id,
  };
}

/** Force-stop every active Cursor run (or one agent). Marks the floor idle. */
export function stopCursorJob(agentId?: StudioAgentId, note = 'Stopped by you.') {
  const snap = loadStudioStore();
  const stamp = nowIso();
  for (const t of snap.tasks) {
    if (t.status === 'active' && isCursorTask(t) && (!agentId || t.agentId === agentId)) {
      t.status = 'done';
      t.progress = t.progress || 0;
      t.completedAt = stamp;
      t.updatedAt = stamp;
      t.deliverable = note;
    }
  }
  for (const m of snap.messages) {
    if (m.kind === 'cursor' && m.activity?.live && (!agentId || m.author === agentId)) {
      m.activity = { ...m.activity, live: false, thinking: note, error: note, retryable: false };
      if (!m.text) m.text = note;
    }
  }
  saveStudioStore(snap);
}

export function finishCursorJob(agentId: StudioAgentId, ok: boolean, note?: string, mode?: CursorRunMode) {
  const snap = loadStudioStore();
  const stamp = nowIso();
  let projectId = '';
  for (const t of snap.tasks) {
    if (t.agentId === agentId && t.status === 'active' && isCursorTask(t)) {
      t.status = 'done';
      t.progress = 100;
      t.completedAt = stamp;
      t.updatedAt = stamp;
      t.deliverable = note ?? (ok ? 'Cursor run finished.' : 'Cursor run failed.');
      projectId = t.projectId;
    }
  }
  saveStudioStore(snap);
  if (ok && projectId && mode !== 'mockup' && mode !== 'journey') {
    const project = snap.projects.find((p) => p.id === projectId);
    if (project && project.status !== 'live' && project.status !== 'launching') {
      requestChatSignoff(projectId);
    }
  }
}

/** Put a sign-off card in the thread so you can approve the testing ground. */
export function requestChatSignoff(projectId: string) {
  const snap = loadStudioStore();
  const project = snap.projects.find((p) => p.id === projectId);
  if (
    !project ||
    project.status === 'live' ||
    project.status === 'launching' ||
    project.status === 'cancelled' ||
    project.status === 'failed'
  )
    return null;
  const existing = pendingApproval(snap, project.id);
  if (existing) return existing;

  project.artifacts = {
    ...project.artifacts,
    prototypeUrl: prototypeUrlFor(project),
    openedPrototypeAt: project.artifacts.openedPrototypeAt ?? nowIso(),
  };
  setStatus(project, 'needs_prototype_review');
  const approval: StudioApproval = {
    id: uid('appr'),
    projectId: project.id,
    agentId: 'lead',
    taskIds: snap.tasks.filter((t) => t.projectId === project.id && isCursorTask(t)).map((t) => t.id).slice(-3),
    title: `Sign off “${project.title}”`,
    summary: `Testing ground is ready for “${project.title}”. Open it in the shell, then approve — that is what unlocks live. Send it back if it still misses Figma.`,
    fromStatus: 'needs_prototype_review',
    toStatus: project.origin === 'chat' ? 'launching' : 'building_feature',
    createdAt: nowIso(),
  };
  snap.approvals.push(approval);
  pushMessage(snap, {
    channelId: jobChannel(project),
    author: 'lead',
    kind: 'approval',
    refId: approval.id,
    text: approval.summary,
    projectId: project.id,
  });
  saveStudioStore(snap);
  return approval;
}

/** Write live-site files now. Figma spec is a follow-up — it must not block the ship. */
export function goLiveNow(projectId: string): { channelId: string; job: CursorJob } | null {
  const snap = loadStudioStore();
  const project = snap.projects.find((p) => p.id === projectId);
  if (!project || project.archivedAt) return null;
  project.artifacts = {
    ...project.artifacts,
    prototypeUrl: prototypeUrlFor(project),
    openedPrototypeAt: project.artifacts.openedPrototypeAt ?? nowIso(),
  };
  for (const a of snap.approvals) {
    if (a.projectId === project.id && !a.decidedAt) {
      a.decision = 'approved';
      a.decidedAt = nowIso();
    }
  }
  if (project.status !== 'live') setStatus(project, 'launching');
  const channelId = jobChannel(project);
  pushMessage(snap, {
    channelId,
    author: 'lead',
    projectId: project.id,
    kind: 'text',
    text: `Shipping “${project.title}” to the live site now. The Figma spec file is next — live does not wait on it.`,
  });
  saveStudioStore(snap);
  void publishLive(project.id);
  return { channelId, job: shipCursorJob(project) };
}

export function signOffTestingGround(projectId: string): { channelId: string; job: CursorJob } | { liveUrl: string } | null {
  return goLiveNow(projectId);
}

export function sendTestingGroundFeedback(projectId: string, note: string): { channelId: string; job: CursorJob } | null {
  const text = note.trim();
  if (!text) return null;
  const snap = loadStudioStore();
  const project = snap.projects.find((p) => p.id === projectId);
  if (!project || project.archivedAt) return null;
  startRevision(snap, project, text, false);
  project.artifacts = {
    ...project.artifacts,
    openedPrototypeAt: project.artifacts.openedPrototypeAt ?? nowIso(),
    prototypeUrl: prototypeUrlFor(project),
  };
  const channelId = jobChannel(project);
  pushMessage(snap, {
    channelId,
    author: 'ceo',
    projectId: project.id,
    kind: 'text',
    text: `Testing-ground feedback: ${text}`,
  });
  pushMessage(snap, {
    channelId,
    author: 'lead',
    projectId: project.id,
    kind: 'text',
    text: `Got the note on “${project.title}”. Ren is revising the testing ground — live stays locked.`,
  });
  saveStudioStore(snap);
  const figmaUrls = [
    project.artifacts.figmaUrl,
    ...project.references.filter((r) => /figma\.com\//i.test(r.value)).map((r) => r.value),
  ].filter((u): u is string => Boolean(u));
  return {
    channelId,
    job: {
      agentId: 'ui_engineer',
      title: project.title,
      prompt: text,
      figmaUrls,
      projectId: project.id,
    },
  };
}

export function ensureChatSignoff(channelId: string) {
  const snap = loadStudioStore();
  const jobs = [
    channelProject(snap, channelId),
    ...snap.projects.filter(
      (p) =>
        p.origin === 'chat' &&
        !p.archivedAt &&
        p.homeChannelId === channelId &&
        !['live', 'cancelled', 'failed'].includes(p.status),
    ),
  ].filter((p, i, all): p is StudioProject => Boolean(p) && all.findIndex((x) => x?.id === p?.id) === i);
  let last = null as ReturnType<typeof requestChatSignoff>;
  for (const project of jobs) {
    if (project.status === 'live' || project.status === 'cancelled') continue;
    const hasCursorWork = snap.tasks.some((t) => t.projectId === project.id && isCursorTask(t) && t.status === 'done');
    const ready = hasCursorWork || Boolean(project.artifacts.prototypeUrl) || project.status === 'needs_prototype_review';
    if (!ready && project.origin !== 'chat') continue;
    if (!ready && !hasCursorWork && !project.artifacts.prototypeUrl) continue;
    last = pendingApproval(snap, project.id) ?? requestChatSignoff(project.id);
  }
  return last;
}

function isSignoffAsk(text: string) {
  const t = text.trim();
  if (/\b(don'?t|do not|not yet|hold|wait)\b.{0,24}\b(ship|live|approve)\b/i.test(t)) return false;
  if (
    /^(ok[,.\s]+)?(please\s+)?(approve[d]?|lgtm|ship(\s+it)?|make it live|go live|sign[- ]?off|looks good|ship to live)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  return /\b(go live|make it live|ship (it |this )?(to )?(the )?live|put (it|this) (on )?(the )?live|publish (it|this|to live))\b/i.test(
    t,
  );
}

function shipCursorJob(job: StudioProject): CursorJob {
  return {
    agentId: 'ui_engineer',
    title: job.title,
    prompt: `GO LIVE for “${job.title}”${job.surface ? ` (${job.surface})` : ''}. Mount the approved testing-ground UI on the live site, then create a NEW Figma Design file of what shipped. Both are required.`,
    figmaUrls: [],
    projectId: job.id,
    mode: 'ship',
  };
}

function startRevision(snap: StudioStoreSnapshot, project: StudioProject, note: string, hasImage: boolean) {
  const nextRev = (Number(project.briefAnswers?.revision) || 0) + 1;
  project.brief = `${project.brief}\n\nRevision ${nextRev}: ${note || (hasImage ? 'Screenshot — not matching Figma.' : 'Doesn’t match Figma.')}`.trim();
  project.briefAnswers = {
    ...(project.briefAnswers ?? {}),
    revision: String(nextRev),
    revisionNote: note || (hasImage ? 'Screenshot' : 'Figma mismatch'),
  };
  project.updatedAt = nowIso();
  for (const a of snap.approvals) {
    if (a.projectId === project.id && !a.decidedAt) {
      a.decision = 'rejected';
      a.note = 'CEO sent a revision';
      a.decidedAt = nowIso();
    }
  }
}

function parseChatAsk(text: string) {
  let rest = text
    .replace(/@\w+/g, '')
    .replace(/^(can|could) you\s+/i, '')
    .replace(/^please\s+/i, '')
    .replace(/\?+$/g, '')
    .trim();
  rest = rest.replace(/^(build|add|make|create|design|implement|ship|put|fix|change|update)\s+(a|an|the)\s+/i, '');

  const surface = /casino/i.test(text)
    ? 'Casino'
    : /sport/i.test(text)
      ? 'Sportsbook'
      : /poker/i.test(text)
        ? 'Poker'
        : /promo/i.test(text)
          ? 'Promotions'
          : /account|wallet|vip/i.test(text)
            ? 'My account'
            : /home\s*page|homepage/i.test(text)
              ? 'Homepage'
              : '';

  const kind: StudioProject['kind'] =
    /\bcomponent\b/i.test(text) &&
    !/\b(page|feature|nav|navigation|lobby|sub[- ]?nav|submenu|shell|header)\b/i.test(text)
      ? 'component'
      : 'feature';

  let title = rest
    .replace(/\s+on the\s+.+$/i, '')
    .replace(/\s+on (the )?(casino|sports(?:book)?|poker|homepage|promotions?)(\s+page)?.*$/i, '')
    .trim();
  if (!title) title = rest.slice(0, 56) || 'Chat request';
  if (surface && !new RegExp(surface, 'i').test(title)) title = `${surface} ${title}`;
  title = title.replace(/^./, (c) => c.toUpperCase());

  const platform = ASSUMED_ANSWER.platform;

  const mode = figmaJobMode(text);
  return { title, surface, kind, platform, raw: text, mockup: mode === 'mockup', journey: mode === 'journey', mode };
}

function chatJobInChannel(snap: StudioStoreSnapshot, channelId: string) {
  return (
    snap.projects
      .filter(
        (p) =>
          p.origin === 'chat' &&
          !p.archivedAt &&
          p.homeChannelId === channelId &&
          !['live', 'cancelled', 'failed'].includes(p.status),
      )
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0] ?? null
  );
}

function latestJobInChannel(snap: StudioStoreSnapshot, channelId: string) {
  const pinned = channelProject(snap, channelId);
  if (pinned && !pinned.archivedAt) return pinned;
  return (
    snap.projects
      .filter((p) => !p.archivedAt && (p.homeChannelId === channelId || projectChannelId(p.id) === channelId))
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0] ?? null
  );
}

function huddleFor(parsed: ReturnType<typeof parseChatAsk>): { id: StudioAgentId; text: string }[] {
  const bit = parsed.surface ? ` on ${parsed.surface}` : '';
  if (parsed.journey) {
    return [
      {
        id: 'designer',
        text: `I’ll put “${parsed.title}” on a FigJam board — flowchart of the real Lumen path, not a made-up mermaid journey. Board link lands here.`,
      },
      {
        id: 'librarian',
        text: `Steps have to be surfaces we already have in ${DS} (Shell, Casino, Poker…). I’ll flag anything that isn’t in the library.`,
      },
      {
        id: 'ui_engineer',
        text: `I wait. A journey is not a prototype — I don’t open the testing ground until you ask to build a screen.`,
      },
    ];
  }
  if (parsed.mockup) {
    return [
      {
        id: 'designer',
        text: `I’ll open a brand-new Figma file in the Lumen folder for “${parsed.title}” — frames plus happy path, error / empty / loading, and the flow, annotated. Lumen_Desing System instances only — not Studio-mocks, not the file you pasted. Link lands here when the frames are in.`,
      },
      {
        id: 'librarian',
        text: `I’ll point Mika at ${DS} only — <Button>, <IconButton>, text-input, search-box, ☀️ Mode tokens. No Kraken, no MUI.`,
      },
      {
        id: 'ui_engineer',
        text: `I wait for that Figma link. I won’t touch the testing ground until you say build it.`,
      },
    ];
  }
  if (parsed.kind === 'component') {
    return [
      { id: 'librarian', text: `Before Ren builds “${parsed.title}” I’ll check what ${DS} already has. If it’s a variant of something we ship, we extend that — no one-off.` },
      { id: 'ui_engineer', text: `If Ivo says it’s new I’ll put it in Storybook with every variant. Features don’t import it until you approve the stories.` },
      { id: 'tokens', text: `Any new colour or spacing is a Figma variable first. I won’t let a hex sneak in.` },
    ];
  }
  return [
    {
      id: 'librarian',
      text: parsed.surface === 'Casino'
        ? `Casino already has the pill sub-menu under the header (search, favourites, section pills). We reuse that ${DS} pattern — no new component.`
        : `I’ll audit ${DS} for “${parsed.title}”${bit}. If a pattern exists we reuse it. A gap becomes a component job, not a one-off.`,
    },
    {
      id: 'designer',
      text: `I’ll read the source you pasted, then create a new Lumen-folder file for “${parsed.title}” — happy path, errors, empty/loading, and the flow, annotated. That new file is the Design mock, not the link you dropped. ${DS} on mobile, tablet, and desktop.`,
    },
    {
      id: 'engineer',
      text: `Once the testing-ground prototype is approved I’ll take it onto a preview branch. Live site stays locked until Tess signs off.`,
    },
  ];
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
export type CursorJob = {
  agentId: StudioAgentId;
  title: string;
  prompt: string;
  figmaUrls: string[];
  attachments?: StudioAttachment[];
  projectId?: string;
  mode?: CursorRunMode;
};

export function sendCeoMessage(
  channelId: string,
  raw: string,
  attachments?: StudioAttachment[],
): { command: boolean; typing: StudioAgentId[]; cursor?: CursorJob } {
  const text = raw.trim();
  const images = attachments?.filter((a) => a.kind === 'image') ?? [];
  if (!text && !images.length) return { command: false, typing: [] };
  const snap = loadStudioStore();
  const dmEarly = channelId.startsWith('dm:') ? (channelId.slice(3) as StudioAgentId) : null;
  const activeForDm = dmEarly
    ? snap.tasks.find((t) => t.agentId === dmEarly && (t.status === 'active' || t.status === 'queued'))
    : undefined;
  const project =
    channelProject(snap, channelId) ??
    (activeForDm ? (snap.projects.find((p) => p.id === activeForDm.projectId) ?? null) : null)
      ?? chatJobInChannel(snap, channelId);

  const body = text || (images.length === 1 ? 'Pasted a screenshot.' : `Pasted ${images.length} screenshots.`);
  pushMessage(snap, { channelId, author: 'ceo', text: body, projectId: project?.id, attachments: images.length ? images : undefined });
  saveStudioStore(snap);
  if (project && images.length) {
    for (const img of images) {
      addReference(project.id, { kind: 'image', label: img.name, value: img.dataUrl, notes: 'Pasted in chat' });
    }
  }

  const figmaUrls = [
    ...(text.match(/https?:\/\/(?:www\.)?figma\.com\/[^\s)]+/gi) ?? []),
    ...((project?.references ?? [])
      .map((r) => r.value)
      .filter((v): v is string => typeof v === 'string' && /figma\.com\//i.test(v))),
  ].filter((url, i, all) => all.indexOf(url) === i);
  if (project && figmaUrls.length) {
    for (const url of figmaUrls) {
      if ((project.references ?? []).some((r) => r.value === url)) continue;
      addReference(project.id, { kind: 'url', label: 'Figma', value: url, notes: 'Dropped in chat' });
    }
  }

  const later = (ms: number, fn: () => void) => window.setTimeout(fn, ms);
  const post = (
    author: StudioAgentId | 'system',
    body: string,
    kind: 'text' | 'standup' | 'system' = 'text',
    projectId = project?.id,
  ) => {
    const s = loadStudioStore();
    pushMessage(s, { channelId, author, text: body, kind, projectId });
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
        const cols = BOARD_COLUMNS.map((c) => `${c.label} ${activeProjects(s).filter((p) => c.statuses.includes(p.status)).length}`).join(' · ');
        const qs = s.questions.filter((q) => !q.answeredAt && !isAssumedQuestionKey(q.answerKey)).length;
        const ap = s.approvals.filter((a) => !a.decidedAt).length;
        post(
          'lead',
          ap
            ? `Board: ${cols}. Needs you: ${ap} approval${ap === 1 ? '' : 's'}${qs ? `, ${qs} question${qs === 1 ? '' : 's'}` : ''}.`
            : `Board: ${cols}. Inbox clear${qs ? ` — ${qs} question${qs === 1 ? '' : 's'} still open` : ''}.`,
        );
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
          `Three Figma jobs:\n• Implement — paste a Dev Mode frame selection and we build it. Example: ${FIGMA_SELECTION_EXAMPLE}\n• Design — /mockup <title> or “design this in Figma”. Mika opens a new file in the Lumen folder and assembles Lumen_Desing System instances.\n• Journey — /journey <title> or “user flow / journey map”. Mika posts a FigJam flowchart of real Lumen surfaces.`,
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
    if (lower === '/remove') {
      saveStudioStore(snap);
      if (channelId === GENERAL_CHANNEL_ID) {
        later(150, () => post('system', 'You can’t remove #general.', 'system'));
        return { command: true, typing: [] };
      }
      if (channelId.startsWith('dm:')) {
        clearAgentChat(channelId.slice(3));
        return { command: true, typing: [] };
      }
      removeChannel(channelId);
      later(120, () => post('system', 'Channel removed from the sidebar.', 'system'));
      return { command: true, typing: [] };
    }
    if (lower === '/clear') {
      saveStudioStore(snap);
      if (!channelId.startsWith('dm:')) {
        later(150, () => post('system', ' /clear is for DMs. Hover × on a channel to remove it.', 'system'));
        return { command: true, typing: [] };
      }
      clearAgentChat(channelId.slice(3));
      return { command: true, typing: [] };
    }
    if (lower === '/stop') {
      saveStudioStore(snap);
      const who = (dmEarly && AGENT_BY_ID[dmEarly] ? dmEarly : undefined) ??
        snap.tasks.find((t) => t.status === 'active' && isCursorTask(t))?.agentId;
      stopCursorJob(who, 'Stopped by you.');
      later(80, () => post('system', who ? `Stopped ${AGENT_BY_ID[who].name}.` : 'Stopped the running agent.', 'system'));
      return { command: true, typing: [] };
    }
    if (lower === '/mockup') {
      saveStudioStore(snap);
      const parsed = parseChatAsk(arg || 'Studio mockup');
      const job = createChatJob({
        title: parsed.title,
        kind: 'feature',
        surface: parsed.surface,
        brief: arg || 'Figma mockup',
        homeChannelId: channelId,
        briefAnswers: assumedBriefAnswers({ scope: 'Figma mockup' }),
      });
      later(200, () =>
        post(
          'designer',
          `New Figma file in the Lumen folder for “${parsed.title}” — frames plus happy path, error states, and the flow. Lumen_Desing System instances only — I won’t touch Casino-Lumen, Shell, or Studio-mocks. Link lands in this thread when the frames are in.`,
          'text',
          job.id,
        ),
      );
      return {
        command: true,
        typing: ['designer'],
        cursor: {
          agentId: 'designer',
          title: parsed.title,
          prompt: `Design in Figma with the Lumen library: create a new Design file and mock “${parsed.title}”${parsed.surface ? ` (${parsed.surface})` : ''}. ${arg || ''}`.trim(),
          figmaUrls: [],
          projectId: job.id,
          mode: 'mockup',
        },
      };
    }
    if (lower === '/journey') {
      saveStudioStore(snap);
      const parsed = parseChatAsk(arg || 'User journey');
      const job = createChatJob({
        title: parsed.title,
        kind: 'feature',
        surface: parsed.surface,
        brief: arg || 'Figma journey',
        homeChannelId: channelId,
        briefAnswers: assumedBriefAnswers({ scope: 'Figma journey' }),
      });
      later(200, () =>
        post(
          'designer',
          `FigJam flowchart for “${parsed.title}”. Real Lumen surfaces only — board link lands here.`,
          'text',
          job.id,
        ),
      );
      return {
        command: true,
        typing: ['designer'],
        cursor: {
          agentId: 'designer',
          title: parsed.title,
          prompt: `Create a FigJam user-journey flowchart for “${parsed.title}”${parsed.surface ? ` (${parsed.surface})` : ''}. ${arg || ''}`.trim(),
          figmaUrls: [],
          projectId: job.id,
          mode: 'journey',
        },
      };
    }
    if (lower === '/rollback') {
      saveStudioStore(snap);
      const job = project ?? chatJobInChannel(snap, channelId);
      if (!job) {
        later(150, () => post('system', 'Nothing live to roll back in this channel.', 'system'));
        return { command: true, typing: [] };
      }
      void rollbackLive(job.id);
      return { command: true, typing: ['lead'] };
    }
    if (lower === '/approve') {
      saveStudioStore(snap);
      const job = project ?? latestJobInChannel(snap, channelId);
      if (!job) {
        later(150, () => post('system', 'Nothing to sign off in this channel.', 'system'));
        return { command: true, typing: [] };
      }
      const launched = goLiveNow(job.id);
      return {
        command: true,
        typing: ['lead', 'ui_engineer', 'designer'],
        cursor: launched?.job ?? shipCursorJob(job),
      };
    }
    if (lower === '/like' || lower === '/hate') {
      saveStudioStore(snap);
      if (!arg) {
        later(150, () => post('system', `Usage: ${lower} <what to remember>`, 'system'));
        return { command: true, typing: [] };
      }
      const kind = lower === '/like' ? 'like' : 'hate';
      recordTaste({ kind, text: arg, surface: project?.surface, source: 'chat' });
      later(280, () =>
        post(
          'lead',
          kind === 'like'
            ? `Logged. We’ll keep doing “${arg}” — that’s now part of how we design.`
            : `Logged. We won’t do “${arg}” again.`,
        ),
      );
      return { command: true, typing: ['lead'] };
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

  const dm = channelId.startsWith('dm:') ? (channelId.slice(3) as StudioAgentId) : null;
  const mentioned = AGENTS.filter((a) => new RegExp(`@${a.name}\\b`, 'i').test(text)).map((a) => a.id);
  const owner: StudioAgentId = (dm && AGENT_BY_ID[dm] ? dm : mentioned[0]) ?? 'lead';
  const inProject = channelProject(snap, channelId);
  const openChat = chatJobInChannel(snap, channelId);

  if (isSignoffAsk(text)) {
    const job = inProject ?? openChat ?? latestJobInChannel(snap, channelId);
    if (!job) {
      later(200, () => post('lead', 'Nothing in this thread to sign off yet.'));
      return { command: false, typing: ['lead'] };
    }
    const launched = goLiveNow(job.id);
    return {
      command: false,
      typing: ['lead', 'ui_engineer', 'designer'],
      cursor: launched?.job ?? shipCursorJob(job),
    };
  }

  const taste = detectTasteAsk(text);
  if (taste && !isWorkAsk(text)) {
    recordTaste({ kind: taste.kind, text: taste.text, surface: (inProject ?? openChat)?.surface, source: 'chat' });
    later(300, () =>
      post(
        owner,
        taste.kind === 'like'
          ? `Got it — I’ll remember “${taste.text}”. Next time there’s no Figma I’ll still reach for that.`
          : `Got it — “${taste.text}” is off the table. I’ll stop doing that.`,
      ),
    );
    return { command: false, typing: [owner] };
  }

  const openJob = inProject ?? openChat;
  if (isRevisionAsk(text, images.length, openJob)) {
    startRevision(snap, openJob!, body, images.length > 0);
    saveStudioStore(snap);
    later(350, () =>
      post(
        owner,
        images.length
          ? `Got the screenshot of “${openJob!.title}”. Ren is running Cursor against Figma MCP and that image. No prototype link until the files change.`
          : `Got it — “${openJob!.title}” isn’t matching Figma. Ren is running Cursor against the frame. No prototype link until the files change.`,
        'text',
        openJob!.id,
      ),
    );
    return {
      command: false,
      typing: [owner, 'designer', 'ui_engineer'],
      cursor: {
        agentId: 'ui_engineer',
        title: openJob!.title,
        prompt: body,
        figmaUrls,
        attachments: images.length ? images : undefined,
        projectId: openJob!.id,
      },
    };
  }

  if (isWorkAsk(text) && !inProject) {
    const parsed = parseChatAsk(text);
    if (openChat && !/^(new|another)\b/i.test(text.trim())) {
      openChat.brief = `${openChat.brief}\n\n${text}`.trim();
      openChat.updatedAt = nowIso();
      saveStudioStore(snap);
      const huddle = huddleFor(parsed);
      later(400, () =>
        post(owner, `Adding that to “${openChat.title}”. Same thread — no new brief.`, 'text', openChat.id),
      );
      huddle.forEach((h, i) => later(1000 + i * 700, () => post(h.id, h.text, 'text', openChat.id)));
      return { command: false, typing: [owner, ...huddle.map((h) => h.id)] };
    }

    const job = createChatJob({
      title: parsed.title,
      kind: parsed.kind,
      surface: parsed.surface,
      brief: parsed.raw,
      homeChannelId: channelId,
      briefAnswers: assumedBriefAnswers({ scope: 'Single screen' }),
    });
    const next = loadStudioStore();
    const fresh = next.projects.find((p) => p.id === job.id);
    if (fresh) ensureProject(next, fresh);
    if (images.length) {
      for (const img of images) {
        addReference(job.id, { kind: 'image', label: img.name, value: img.dataUrl, notes: 'Pasted in chat' });
      }
    }
    saveStudioStore(next);

    const huddle = huddleFor(parsed);
    const names = huddle.map((h) => AGENT_BY_ID[h.id].name).join(', ');
    const ack =
      owner === 'lead'
        ? `Yes — “${parsed.title}”. I’ll keep it in this thread; New brief is for a whole area.${images.length ? ' Got the screenshot — I’ll use it as the reference.' : ''} ${names} — jump in. ${DS} on mobile, tablet, and desktop.`
        : `On it — “${parsed.title}”. I’ll pull Nova and the others in here. No giant brief.${images.length ? ' Screenshot attached.' : ''} ${DS} on mobile, tablet, and desktop.`;
    later(350, () => post(owner, ack, 'text', job.id));
    huddle.forEach((h, i) => later(1200 + i * 750, () => post(h.id, h.text, 'text', job.id)));
    return {
      command: false,
      typing: [owner, ...huddle.map((h) => h.id)],
      cursor: {
        agentId: figmaJobAgent(parsed.mode),
        title: parsed.title,
        prompt: body,
        figmaUrls,
        attachments: images.length ? images : undefined,
        projectId: job.id,
        mode: parsed.mode,
      },
    };
  }

  if (isWorkAsk(text) && inProject) {
    inProject.brief = `${inProject.brief}\n\n${text}`.trim();
    inProject.updatedAt = nowIso();
    saveStudioStore(snap);
    const huddle = huddleFor(parseChatAsk(text));
    const mode = figmaJobMode(text);
    later(400, () =>
      post(
        owner,
        mode === 'journey'
          ? `Got it — Mika is putting “${inProject.title}” on a FigJam journey board.`
          : mode === 'mockup'
            ? `Got it — Mika is opening a new Figma file in the Lumen folder for “${inProject.title}”. Existing product files stay untouched.`
            : `Got it — folding that into “${inProject.title}”. Ren reads the source, builds the testing ground, and creates a new annotated Figma file in the Lumen folder (happy path, errors, flow).`,
        'text',
        inProject.id,
      ),
    );
    huddle.forEach((h, i) => later(1000 + i * 700, () => post(h.id, h.text, 'text', inProject.id)));
    return {
      command: false,
      typing: [owner, ...huddle.map((h) => h.id)],
      cursor: {
        agentId: figmaJobAgent(mode),
        title: inProject.title,
        prompt: body,
        figmaUrls,
        attachments: images.length ? images : undefined,
        projectId: inProject.id,
        mode,
      },
    };
  }

  const responders: StudioAgentId[] = dm && AGENT_BY_ID[dm] ? [dm] : mentioned.length ? mentioned : ['lead'];
  if (images.length && !text) {
    later(400, () =>
      post(owner, `Got the screenshot. I’ll treat that as the reference — same shipped shell, content area only.`),
    );
    return { command: false, typing: [owner] };
  }
  responders.forEach((id, i) =>
    later(450 + i * 500 + Math.random() * 400, () => {
      const s = loadStudioStore();
      const reply = agentReply(id, text, s);
      post(id, images.length ? `Got the screenshot. ${reply}` : reply);
    }),
  );
  return { command: false, typing: responders };
}

/** Channel you should open for an agent: their DM. */
export const agentDmChannel = (agentId: StudioAgentId) => dmChannelId(agentId);
