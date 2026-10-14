import type { StudioAgentId, StudioProjectStatus } from './types';

export interface StudioAgent {
  id: StudioAgentId;
  name: string;
  role: string;
  /** One-line job description shown in the agent panel. */
  blurb: string;
  /** Accent colour used by the sprite tag + UI chips. */
  color: number;
  colorCss: string;
  /** Tools / capabilities this character maps to. */
  skills: string[];
}

/**
 * The cast: Design Lead + six specialists. You are not an agent — anything
 * that touches the design system, Figma library or ships to Storybook stops
 * at your desk first.
 */
export const AGENTS: StudioAgent[] = [
  {
    id: 'lead',
    name: 'Nova',
    role: 'Design Lead',
    blurb: 'Takes your brief or product spec, writes the design brief, owns the board, hands work to the team.',
    color: 0xffc14a,
    colorCss: '#ffc14a',
    skills: ['brief-writing', 'board-ops', 'release-gates'],
  },
  {
    id: 'librarian',
    name: 'Ivo',
    role: 'DS Librarian',
    blurb: 'Audits Lumen in Figma: which components, variants and tokens exist, what is missing. Nothing ships outside the system.',
    color: 0x7dd3fc,
    colorCss: '#7dd3fc',
    skills: ['figma-search-design-system', 'figma-variables', 'coverage-audit'],
  },
  {
    id: 'designer',
    name: 'Mika',
    role: 'Product Designer',
    blurb: 'Builds frames and flows in Figma from Lumen instances only — no detached layers, no raw hex.',
    color: 0xc084fc,
    colorCss: '#c084fc',
    skills: ['figma-use', 'figma-generate-design', 'layout'],
  },
  {
    id: 'ui_engineer',
    name: 'Ren',
    role: 'Component Engineer',
    blurb: 'Builds React components that match the Lumen Figma spec and lands them in Storybook with every variant.',
    color: 0xff7a28,
    colorCss: '#ff7a28',
    skills: ['react', 'tailwind', 'storybook', 'figma-code-connect'],
  },
  {
    id: 'tokens',
    name: 'Sol',
    role: 'Token Engineer',
    blurb: 'Syncs Figma variables → CSS variables and Tailwind theme. Owns the token manifest the lint runs against.',
    color: 0x34d399,
    colorCss: '#34d399',
    skills: ['figma-variables', 'design-tokens', 'theme-sync'],
  },
  {
    id: 'engineer',
    name: 'Priya',
    role: 'Frontend Engineer',
    blurb: 'Builds features from approved product specs using only approved Storybook components.',
    color: 0xe83e8c,
    colorCss: '#e83e8c',
    skills: ['react', 'feature-build', 'integration'],
  },
  {
    id: 'qa',
    name: 'Tess',
    role: 'Design QA',
    blurb: 'Visual diff Figma vs Storybook, token lint, accessibility, responsive checks, release gates.',
    color: 0xfbbf24,
    colorCss: '#fbbf24',
    skills: ['visual-regression', 'token-lint', 'a11y'],
  },
];

export const AGENT_BY_ID: Record<StudioAgentId, StudioAgent> = Object.fromEntries(
  AGENTS.map((a) => [a.id, a]),
) as Record<StudioAgentId, StudioAgent>;

export function getAgent(id: StudioAgentId): StudioAgent {
  return AGENT_BY_ID[id];
}

/** Board columns — a readable collapse of the full status list. */
export interface BoardColumn {
  id: string;
  label: string;
  statuses: StudioProjectStatus[];
}

export const BOARD_COLUMNS: BoardColumn[] = [
  { id: 'spec', label: 'Spec', statuses: ['draft', 'needs_spec_review'] },
  { id: 'audit', label: 'DS audit', statuses: ['auditing', 'needs_audit_review'] },
  { id: 'figma', label: 'Figma', statuses: ['designing', 'needs_design_review'] },
  { id: 'prototype', label: 'Prototype', statuses: ['prototyping', 'needs_prototype_review'] },
  { id: 'storybook', label: 'Storybook', statuses: ['building_components', 'needs_storybook_review'] },
  { id: 'build', label: 'Preview', statuses: ['building_feature', 'needs_build_review'] },
  { id: 'qa', label: 'QA', statuses: ['qa_running', 'needs_signoff'] },
  { id: 'live', label: 'Live', statuses: ['launching', 'live'] },
];

export const STATUS_LABEL: Record<StudioProjectStatus, string> = {
  draft: 'Writing spec',
  needs_spec_review: 'Spec review',
  auditing: 'Auditing Lumen',
  needs_audit_review: 'Audit review',
  designing: 'In Figma',
  needs_design_review: 'Design review',
  prototyping: 'Building prototype',
  needs_prototype_review: 'Prototype review',
  building_components: 'Building components',
  needs_storybook_review: 'Storybook review',
  building_feature: 'Building preview',
  needs_build_review: 'Preview review',
  qa_running: 'QA running',
  needs_signoff: 'Needs sign-off',
  launching: 'Launching',
  live: 'Live',
  on_hold: 'On hold',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

export const KIND_LABEL = {
  component: 'Component',
  feature: 'Feature',
} as const;
