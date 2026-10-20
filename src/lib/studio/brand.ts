/** Studio identity + the design system the team is locked to. Edit here, nowhere else. */
export const STUDIO_NAME = 'Design Studio';
export const STUDIO_TAGLINE = 'Agentic design team';

/** The only design system the team may draw from. */
export const DESIGN_SYSTEM = {
  name: 'Lumen',
  figmaLibraryName: String(import.meta.env.PUBLIC_FIGMA_DS_LIBRARY_NAME ?? 'Lumen_Desing System'),
  figmaFileKey: String(import.meta.env.PUBLIC_FIGMA_DS_FILE_KEY ?? 'vCPe93hNKDWWcpu49Vo0kU'),
  /** Figma variable collections the token engineer syncs from. */
  variableCollections: ['☀️  Mode', '🚀 Themes', '💨 Tailwind'],
};

export function figmaFileUrl(): string | null {
  return DESIGN_SYSTEM.figmaFileKey
    ? `https://www.figma.com/design/${DESIGN_SYSTEM.figmaFileKey}/`
    : null;
}

/** Folder of every live Lumen product file (Casino, Shell, PropShopX, …). */
export const LUMEN_PROJECTS_FOLDER = 'https://www.figma.com/files/1304356510223900444/folder/625743109';

/**
 * Legacy sandbox. New mockups create their own Figma file (create_new_file)
 * so existing product files and this sandbox stay untouched.
 */
export const STUDIO_MOCK_FIGMA = {
  fileKey: 'wFyCOBCR34AMrgwEbp9tML',
  url: 'https://www.figma.com/design/wFyCOBCR34AMrgwEbp9tML/Studio-mocks',
};

export const FIGMA_NEW_FILE = {
  planKey: 'organization::1304356510223900444',
  projectId: '625743109',
  editorType: 'design' as const,
};

/** Where the team's outputs live. Names only — set real values in .env. */
export const TARGETS = {
  /** Default brand the pretend live site renders in (must exist in tokens/figma). */
  liveSiteBrand: String(import.meta.env.PUBLIC_LIVE_SITE_BRAND ?? 'betonline'),
  liveSiteUrl: String(import.meta.env.PUBLIC_LIVE_SITE_URL ?? 'http://localhost:3000'),
  prototypeBaseUrl: String(import.meta.env.PUBLIC_PROTOTYPE_BASE_URL ?? 'http://localhost:4321/prototypes'),
  storybookUrl: String(import.meta.env.PUBLIC_STORYBOOK_URL ?? 'http://localhost:6006'),
};

/**
 * Real people an agent may ping for a reference when it is stuck.
 * Comma-separated names/handles in PUBLIC_HUMAN_REVIEWERS.
 */
export const HUMAN_REVIEWERS: string[] = String(import.meta.env.PUBLIC_HUMAN_REVIEWERS ?? 'Head of Design')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

/** How many times an agent gets sent back on one stage before it asks a human for a reference. */
export const ESCALATE_AFTER_REJECTIONS = 2;

export { getProjectPass as getStudioPass } from '../access';
