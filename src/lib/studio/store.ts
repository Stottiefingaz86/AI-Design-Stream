import type {
  StudioApproval,
  StudioChannel,
  StudioMessage,
  StudioProject,
  StudioQuestion,
  StudioReference,
  StudioStoreSnapshot,
  StudioTask,
} from './types';

const STORAGE_KEY = 'design-studio:v1';
const CHANGE_EVENT = 'design-studio:change';

export const GENERAL_CHANNEL_ID = 'general';

export function nowIso() {
  return new Date().toISOString();
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

export function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32) || 'channel'
  );
}

export const projectChannelId = (projectId: string) => `project:${projectId}`;
export const dmChannelId = (agentId: string) => `dm:${agentId}`;

function generalChannel(): StudioChannel {
  return {
    id: GENERAL_CHANNEL_ID,
    kind: 'general',
    name: 'general',
    topic: 'Studio-wide. Stand-ups, announcements, anything not tied to one brief.',
    createdAt: nowIso(),
  };
}

export function emptyStudioStore(): StudioStoreSnapshot {
  return {
    version: 2,
    projects: [],
    tasks: [],
    questions: [],
    approvals: [],
    messages: [],
    channels: [generalChannel()],
    reads: {},
  };
}

/** Ensure every project has its own channel; returns true when something changed. */
function ensureChannels(snap: StudioStoreSnapshot): boolean {
  let changed = false;
  if (!snap.channels.some((c) => c.id === GENERAL_CHANNEL_ID)) {
    snap.channels.unshift(generalChannel());
    changed = true;
  }
  for (const p of snap.projects) {
    const id = projectChannelId(p.id);
    if (!snap.channels.some((c) => c.id === id)) {
      snap.channels.push({
        id,
        kind: 'project',
        name: slugify(p.title),
        projectId: p.id,
        topic: p.surface ? `${p.title} — ${p.surface}` : p.title,
        createdAt: p.createdAt,
      });
      changed = true;
    }
  }
  return changed;
}

function migrate(parsed: unknown): StudioStoreSnapshot {
  if (!parsed || typeof parsed !== 'object') return emptyStudioStore();
  const p = parsed as Partial<StudioStoreSnapshot>;
  if (!Array.isArray(p.projects) || p.version !== 2) return emptyStudioStore();

  const snap: StudioStoreSnapshot = {
    version: 2,
    projects: p.projects.map((pr) => ({ ...pr, artifacts: pr.artifacts ?? {} })),
    tasks: Array.isArray(p.tasks) ? p.tasks : [],
    questions: Array.isArray(p.questions) ? p.questions : [],
    approvals: Array.isArray(p.approvals) ? p.approvals : [],
    messages: Array.isArray(p.messages) ? (p.messages as StudioMessage[]) : [],
    channels: Array.isArray(p.channels) ? p.channels : [],
    reads: p.reads && typeof p.reads === 'object' ? (p.reads as Record<string, string>) : {},
  };
  ensureChannels(snap);
  return snap;
}

export function loadStudioStore(): StudioStoreSnapshot {
  if (typeof localStorage === 'undefined') return emptyStudioStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStudioStore();
    return migrate(JSON.parse(raw));
  } catch {
    return emptyStudioStore();
  }
}

export function saveStudioStore(snapshot: StudioStoreSnapshot) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }
}

/** Subscribe to any store write in this tab (and other tabs via `storage`). */
export function subscribeStudioStore(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener('storage', onStorage);
  };
}

/** Run a mutation against the snapshot and persist it. */
export function mutateStudioStore<T>(fn: (snap: StudioStoreSnapshot) => T): T {
  const snap = loadStudioStore();
  const result = fn(snap);
  saveStudioStore(snap);
  return result;
}

/* ---------------- projects ---------------- */

export function listProjects(): StudioProject[] {
  return loadStudioStore().projects.sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function getProject(id: string): StudioProject | null {
  return loadStudioStore().projects.find((p) => p.id === id) ?? null;
}

export function createProject(input: {
  title: string;
  kind: StudioProject['kind'];
  surface: string;
  brief: string;
  specUrl: string;
}): StudioProject {
  const stamp = nowIso();
  const project: StudioProject = {
    id: uid('proj'),
    title: input.title.trim() || 'Untitled brief',
    kind: input.kind,
    surface: input.surface.trim(),
    brief: input.brief.trim(),
    specUrl: input.specUrl.trim(),
    status: 'draft',
    references: [],
    briefAnswers: {},
    artifacts: {},
    createdAt: stamp,
    updatedAt: stamp,
  };
  mutateStudioStore((snap) => {
    snap.projects.unshift(project);
    const channelId = projectChannelId(project.id);
    snap.channels.push({
      id: channelId,
      kind: 'project',
      name: slugify(project.title),
      projectId: project.id,
      topic: project.surface ? `${project.title} — ${project.surface}` : project.title,
      createdAt: stamp,
    });
    const figma = /figma\.com\//i.test(project.specUrl);
    if (figma) {
      project.references.push({
        id: uid('ref'),
        kind: 'url',
        label: 'Figma',
        value: project.specUrl,
        notes: 'Attached on the brief',
        createdAt: stamp,
      });
    }
    snap.messages.push({
      id: uid('msg'),
      channelId,
      author: 'system',
      kind: 'system',
      text: `#${slugify(project.title)} created for “${project.title}”. The whole team is in.${figma ? ' Figma attached.' : ''}`,
      projectId: project.id,
      createdAt: stamp,
    });
    snap.messages.push({
      id: uid('msg'),
      channelId,
      author: 'lead',
      kind: 'text',
      text: figma
        ? `Got “${project.title}”${project.surface ? ` (${project.surface})` : ''}. I'll work from the Figma you attached — same shell, content area only, Lumen tokens. Ask here if you want something nudged. A couple of questions first.`
        : `Got the ${project.kind} brief for “${project.title}”${project.surface ? ` (${project.surface})` : ''}. No Figma yet — drop a link here anytime and we'll build from it. A couple of questions first.`,
      projectId: project.id,
      createdAt: stamp,
    });
  });
  return project;
}

export function updateProject(
  id: string,
  patch: Partial<
    Pick<StudioProject, 'title' | 'kind' | 'surface' | 'brief' | 'specUrl' | 'status' | 'briefAnswers' | 'artifacts'>
  >,
): StudioProject | null {
  return mutateStudioStore((snap) => {
    const idx = snap.projects.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    const next: StudioProject = { ...snap.projects[idx]!, ...patch, updatedAt: nowIso() };
    snap.projects[idx] = next;
    return next;
  });
}

export function addReference(
  projectId: string,
  ref: Omit<StudioReference, 'id' | 'createdAt'>,
): StudioReference | null {
  return mutateStudioStore((snap) => {
    const project = snap.projects.find((p) => p.id === projectId);
    if (!project) return null;
    const reference: StudioReference = { ...ref, id: uid('ref'), createdAt: nowIso() };
    project.references = [reference, ...project.references];
    project.updatedAt = nowIso();
    if (/figma\.com/i.test(reference.value) && /[?&]node-id=/.test(reference.value)) {
      project.artifacts = { ...project.artifacts, figmaUrl: reference.value };
    }
    // A reference is exactly what an escalated agent asked for: unblock them.
    if (project.escalation && !project.escalation.resolvedAt) {
      project.escalation.resolvedAt = nowIso();
      project.escalation.resolvedBy = 'reference';
      for (const t of snap.tasks) {
        if (t.projectId === projectId && t.status === 'blocked' && t.blockedBy === 'human') {
          t.status = 'queued';
          t.blockedBy = undefined;
          t.updatedAt = nowIso();
        }
      }
      snap.messages.push({
        id: uid('msg'),
        channelId: projectChannelId(projectId),
        author: project.escalation.agentId,
        kind: 'text',
        text: /figma\.com/i.test(reference.value)
          ? `Thanks — got the Figma selection. Picking “${project.title}” back up now.`
          : `Thanks — got the reference (${reference.label}). Picking “${project.title}” back up now.`,
        projectId,
        createdAt: nowIso(),
      });
    }
    return reference;
  });
}

export function removeReference(projectId: string, referenceId: string): boolean {
  return mutateStudioStore((snap) => {
    const project = snap.projects.find((p) => p.id === projectId);
    if (!project) return false;
    const before = project.references.length;
    project.references = project.references.filter((r) => r.id !== referenceId);
    if (project.references.length === before) return false;
    project.updatedAt = nowIso();
    return true;
  });
}

/* ---------------- tasks / questions / approvals / messages ---------------- */

export function listTasks(filter?: { projectId?: string; agentId?: StudioTask['agentId'] }) {
  return loadStudioStore().tasks.filter(
    (t) =>
      (!filter?.projectId || t.projectId === filter.projectId) &&
      (!filter?.agentId || t.agentId === filter.agentId),
  );
}

export function listOpenQuestions(): StudioQuestion[] {
  return loadStudioStore()
    .questions.filter((q) => !q.answeredAt)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function listPendingApprovals(): StudioApproval[] {
  return loadStudioStore()
    .approvals.filter((a) => !a.decidedAt)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function listMessages(channelId: string): StudioMessage[] {
  return loadStudioStore()
    .messages.filter((m) => m.channelId === channelId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

const MAX_PER_CHANNEL = 150;

/** Push a message into a snapshot (no persist). Bounds channel history. */
export function pushMessage(
  snap: StudioStoreSnapshot,
  msg: Omit<StudioMessage, 'id' | 'createdAt'> & { createdAt?: string },
): StudioMessage {
  const full: StudioMessage = { kind: 'text', ...msg, id: uid('msg'), createdAt: msg.createdAt ?? nowIso() };
  snap.messages.push(full);
  const inChannel = snap.messages.filter((m) => m.channelId === msg.channelId);
  if (inChannel.length > MAX_PER_CHANNEL) {
    const dropIds = new Set(inChannel.slice(0, inChannel.length - MAX_PER_CHANNEL).map((m) => m.id));
    snap.messages = snap.messages.filter((m) => !dropIds.has(m.id));
  }
  return full;
}

export function appendMessage(msg: Omit<StudioMessage, 'id' | 'createdAt'>): StudioMessage {
  return mutateStudioStore((snap) => pushMessage(snap, msg));
}

export function createCustomChannel(name: string, topic?: string): StudioChannel {
  const slug = slugify(name);
  return mutateStudioStore((snap) => {
    const id = `custom:${slug}`;
    const existing = snap.channels.find((c) => c.id === id);
    if (existing) return existing;
    const ch: StudioChannel = { id, kind: 'custom', name: slug, topic, createdAt: nowIso() };
    snap.channels.push(ch);
    pushMessage(snap, { channelId: id, author: 'system', kind: 'system', text: `#${slug} created.` });
    return ch;
  });
}

/** Mark a channel as read up to now. No-op if nothing new (avoids write churn). */
export function markChannelRead(channelId: string) {
  const snap = loadStudioStore();
  const last = snap.messages.filter((m) => m.channelId === channelId).at(-1)?.createdAt;
  if (!last || snap.reads[channelId] === last) return;
  snap.reads[channelId] = last;
  saveStudioStore(snap);
}

export function unreadCount(snap: StudioStoreSnapshot, channelId: string): number {
  const since = snap.reads[channelId] ?? '';
  let n = 0;
  for (const m of snap.messages) {
    if (m.channelId === channelId && m.author !== 'ceo' && m.createdAt > since) n++;
  }
  return n;
}

export { isProjectAuthed as isStudioAuthed, setProjectAuthed as setStudioAuthed } from '../access';
