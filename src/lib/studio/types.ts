/**
 * Pipeline status for a piece of design work.
 *
 * PRD/BRD → spec → DS audit → Figma → testing-ground prototype → Storybook →
 * preview branch → QA → Tess sign-off → live site
 *
 * `needs_*` statuses are review gates: work stops at your desk until you
 * approve or send it back.
 */
export type StudioProjectStatus =
  | 'draft'
  | 'needs_spec_review'
  | 'auditing'
  | 'needs_audit_review'
  | 'designing'
  | 'needs_design_review'
  | 'prototyping'
  | 'needs_prototype_review'
  | 'building_components'
  | 'needs_storybook_review'
  | 'building_feature'
  | 'needs_build_review'
  | 'qa_running'
  | 'needs_signoff'
  | 'launching'
  | 'live'
  | 'on_hold'
  | 'failed'
  | 'cancelled';

/** What kind of work a brief is. Components must be approved in Storybook before features use them. */
export type StudioProjectKind = 'component' | 'feature';

/**
 * Links the team produces along the way. Each one is set by the stage that
 * owns it and shown on the brief page / board card.
 */
export interface StudioArtifacts {
  /** `specs/<slug>/spec.md` written by the Design Lead (Spec Kit flow). */
  specPath?: string;
  /** Figma page / frame URL for the approved design. */
  figmaUrl?: string;
  /** Studio-rendered design frames (mobile / tablet / desktop). */
  framesUrl?: string;
  /** Clickable prototype (static build) URL. */
  prototypeUrl?: string;
  /** Set when you actually open the testing ground. Live ship is locked until this exists. */
  openedPrototypeAt?: string;
  /** Storybook story URL for the approved component. */
  storybookUrl?: string;
  /** Branch / PR on the live-site repo. */
  prUrl?: string;
  /** Preview branch of the feature — not production. */
  previewUrl?: string;
  /** Production URL once launched. */
  liveUrl?: string;
  /** Snapshot id so live can be rolled back to the pre-ship files. */
  rollbackId?: string;
}

/**
 * An agent has asked a real human for help. Raised automatically after
 * repeated rework, or by an agent that can't resolve a brief against Lumen.
 * Cleared when a reference / answer lands on the project.
 */
export type StudioEscalationKind = 'figma' | 'generic';

export interface StudioEscalation {
  id: string;
  agentId: StudioAgentId;
  /** Stage the agent was stuck in. */
  stage: StudioProjectStatus;
  kind?: StudioEscalationKind;
  reason: string;
  /** Who was pinged (names / handles from PUBLIC_HUMAN_REVIEWERS). */
  to: string[];
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export type StudioReferenceKind = 'url' | 'image' | 'video' | 'pdf' | 'notes';

export interface StudioReference {
  id: string;
  kind: StudioReferenceKind;
  label: string;
  /** URL or data URL for uploads (local only for now). */
  value: string;
  notes?: string;
  createdAt: string;
}

export interface StudioProject {
  id: string;
  title: string;
  kind: StudioProjectKind;
  /** Where it ships: e.g. "Sportsbook web", "Casino mobile web". */
  surface: string;
  brief: string;
  /** Product spec / PRD / Figma link, if there is one. */
  specUrl: string;
  /** `chat` = kicked off in Slack (small ask). `brief` = New brief form (bigger work). */
  origin?: 'brief' | 'chat';
  /** Channel the team talks in. Chat jobs stay where you asked. */
  homeChannelId?: string;
  status: StudioProjectStatus;
  references: StudioReference[];
  /** Answers the Design Lead collected from you (brief clarifications). */
  briefAnswers?: Record<string, string>;
  artifacts: StudioArtifacts;
  /** Open (or most recent) request for human help. */
  escalation?: StudioEscalation;
  createdAt: string;
  updatedAt: string;
  /** Set when you archive a finished brief. Hidden from the floor until restored. */
  archivedAt?: string;
}

/** The studio cast. One agent per discipline. */
export type StudioAgentId =
  | 'lead'
  | 'librarian'
  | 'designer'
  | 'ui_engineer'
  | 'tokens'
  | 'engineer'
  | 'qa';

export type StudioTaskStatus = 'blocked' | 'queued' | 'active' | 'done';

export interface StudioTask {
  id: string;
  projectId: string;
  agentId: StudioAgentId;
  /** Pipeline stage this task belongs to (the project status while it runs). */
  stage: StudioProjectStatus;
  title: string;
  detail: string;
  status: StudioTaskStatus;
  /** 0–100. Simulated progress until real jobs are wired in. */
  progress: number;
  blockedBy?: 'question' | 'approval' | 'dependency' | 'human';
  /** Markdown-ish summary the agent hands in when done. */
  deliverable?: string;
  /** Mock duration in ms for the simulated work. */
  durationMs: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface StudioQuestion {
  id: string;
  projectId: string;
  agentId: StudioAgentId;
  taskId?: string;
  text: string;
  /** Quick-reply options; free text always allowed. */
  options?: string[];
  /** Key stored into project.briefAnswers when answered. */
  answerKey?: string;
  answer?: string;
  createdAt: string;
  answeredAt?: string;
}

export interface StudioApproval {
  id: string;
  projectId: string;
  agentId: StudioAgentId;
  taskIds: string[];
  title: string;
  summary: string;
  fromStatus: StudioProjectStatus;
  toStatus: StudioProjectStatus;
  decision?: 'approved' | 'rejected';
  note?: string;
  createdAt: string;
  decidedAt?: string;
}

/** Who wrote a chat message. `ceo` is you. */
export type ChatAuthor = StudioAgentId | 'ceo' | 'system';

export type StudioMessageKind = 'text' | 'question' | 'approval' | 'system' | 'standup' | 'escalation' | 'live' | 'prototype' | 'cursor';

export interface CursorActivityLine {
  n: number;
  text: string;
  mark?: '+' | '-' | ' ';
}

export interface CursorActivityFile {
  path: string;
  lang?: string;
  add?: number;
  del?: number;
  lines?: CursorActivityLine[];
}

/** One updating Cursor-style poll block in chat (not a flood of token messages). */
export interface CursorActivity {
  summary: string;
  thinking?: string;
  files: CursorActivityFile[];
  live?: boolean;
  retryable?: boolean;
  error?: string;
}

export interface StudioAttachment {
  kind: 'image';
  name: string;
  dataUrl: string;
}

/** What a studio Cursor run is allowed to finish as. */
export type CursorRunMode = 'implement' | 'mockup' | 'journey' | 'ship';

/** Events streamed from the local Cursor agent (not cloud). */
export type CursorStreamEvent =
  | { type: 'status'; text: string }
  | { type: 'thinking'; text?: string; durationMs?: number }
  | {
      type: 'tool';
      name: string;
      status: string;
      file?: string;
      kind?: 'read' | 'search' | 'edit' | 'other';
      add?: number;
      del?: number;
      lines?: CursorActivityLine[];
    }
  | { type: 'assistant'; text: string }
  | { type: 'done'; text: string; ok: boolean }
  | { type: 'error'; text: string };

/**
 * Studio chat message. Channels: `general`, `project:<id>`, `dm:<agentId>`,
 * `custom:<slug>`.
 */
export interface StudioMessage {
  id: string;
  channelId: string;
  author: ChatAuthor;
  text: string;
  kind?: StudioMessageKind;
  attachments?: StudioAttachment[];
  /** Question / approval id for inline cards. */
  refId?: string;
  projectId?: string;
  createdAt: string;
  /** Live Cursor poll block — updated in place, not a new message per token. */
  activity?: CursorActivity;
}

export type StudioChannelKind = 'general' | 'project' | 'custom';

export interface StudioChannel {
  id: string;
  kind: StudioChannelKind;
  /** Display name without the `#`. */
  name: string;
  projectId?: string;
  topic?: string;
  createdAt: string;
  /** Hidden from the rail. Project channels stay archived so they are not recreated. */
  archived?: boolean;
}

export interface StudioStoreSnapshot {
  version: 2;
  projects: StudioProject[];
  tasks: StudioTask[];
  questions: StudioQuestion[];
  approvals: StudioApproval[];
  messages: StudioMessage[];
  channels: StudioChannel[];
  /** channelId → ISO timestamp of the last message you have seen. */
  reads: Record<string, string>;
}
