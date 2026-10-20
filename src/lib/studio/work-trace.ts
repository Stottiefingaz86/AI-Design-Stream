import { AGENT_BY_ID } from './agents';
import type { AgentState } from './pipeline';
import type { StudioAgentId, StudioProject, StudioTask } from './types';

export interface TraceFile {
  name: string;
  add?: number;
  del?: number;
}

export interface TraceStep {
  id: string;
  label: string;
  files?: TraceFile[];
}

const DESK: Record<StudioAgentId, string[]> = {
  lead: ['specs/chat-scope.md', 'src/lib/studio/pipeline.ts'],
  librarian: ['tokens/figma/brand-betonline.json', 'src/lib/studio/knowledge.ts'],
  designer: ['Figma / Casino-Lumen', 'Figma / 🐚 Shell'],
  ui_engineer: ['src/components/lumen/sub-nav.tsx', '.storybook/lumen-ui.mdx'],
  tokens: ['tokens/figma/tailwind.json', 'src/styles/lumen.css'],
  engineer: ['apps/live-site/app/casino/page.tsx', 'apps/live-site/components/site/shell-nav.tsx'],
  qa: ['qa/visual-diff.md', 'qa/a11y.md'],
};

function filesFor(agentId: StudioAgentId, task: StudioTask | null, project?: StudioProject | null): TraceFile[] {
  const names = [...(DESK[agentId] ?? ['src/lib/studio/pipeline.ts'])];
  const title = `${task?.title ?? ''} ${project?.title ?? ''}`.toLowerCase();
  if (/nav|sub.?nav|menu/.test(title)) names.unshift('apps/live-site/components/site/casino-subnav.tsx');
  if (/casino/.test(title)) names.unshift('apps/live-site/app/casino/page.tsx');
  const uniq = [...new Set(names)].slice(0, 3);
  return uniq.map((name, i) => ({
    name,
    add: 2 + i * 3,
    del: i === 0 ? 1 : i === 1 ? 1 : 0,
  }));
}

/** Cursor-style steps that unlock as the simulated task progresses. */
export function traceSteps(state: AgentState, project?: StudioProject | null): TraceStep[] {
  const p = Math.round(
    state.activeTask?.progress ?? (state.mood === 'working' ? 12 : state.mood === 'waiting_ceo' ? 22 : 8),
  );
  const files = filesFor(state.agentId, state.activeTask, project);
  const agent = AGENT_BY_ID[state.agentId];
  const steps: TraceStep[] = [];

  if (p >= 4) {
    const revision = Number(project?.briefAnswers?.revision ?? 0) > 0;
    steps.push({
      id: 'read',
      label: revision
        ? `Reading your screenshot against the Figma frame${project ? ` · ${project.title}` : ''}`
        : state.activeTask
          ? `Reading “${state.activeTask.title}”${project ? ` · ${project.title}` : ''}`
          : `Reading the ask — ${agent.role}`,
    });
  }
  if (p >= 18) {
    steps.push({
      id: 'explore',
      label: `Explored ${files.length} files`,
      files: files.map(({ name }) => ({ name })),
    });
  }
  if (p >= 42) {
    steps.push({
      id: 'edit',
      label: project?.origin === 'chat' ? 'Building in the shipped shell' : 'Editing',
      files,
    });
  }
  if (p >= 68) {
    steps.push({ id: 'lint', label: 'Explored lints' });
  }
  if (p >= 88) {
    steps.push({
      id: 'check',
      label: state.agentId === 'qa' ? 'Diffing against Figma' : 'Checking Lumen tokens · content area only',
    });
  }
  return steps;
}
