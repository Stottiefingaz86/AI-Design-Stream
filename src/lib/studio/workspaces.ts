/**
 * Pinned workspace links shown in each agent's DM header.
 * Token engineer → Lumen DS. Component engineer → Storybook.
 * Frontend → live site. Design Lead / Product Designer → Studio mocks in Figma.
 */
import { DESIGN_SYSTEM, STUDIO_MOCK_FIGMA, TARGETS, figmaFileUrl } from './brand';
import { LUMEN_PROJECTS_FOLDER, REFERENCE_FILES, figmaNodeUrl } from './knowledge';
import type { StudioAgentId } from './types';

export interface WorkspaceLink {
  label: string;
  href: string;
}

const ds = figmaFileUrl() ?? `https://www.figma.com/design/${DESIGN_SYSTEM.figmaFileKey}/`;
const casino = figmaNodeUrl(REFERENCE_FILES.find((f) => f.id === 'casino')!);
const shell = figmaNodeUrl(REFERENCE_FILES.find((f) => f.id === 'shell')!);
const propshop = figmaNodeUrl(REFERENCE_FILES.find((f) => f.id === 'propshopx')!);

export const AGENT_WORKSPACES: Record<StudioAgentId, WorkspaceLink[]> = {
  lead: [
    { label: 'Figma mock space', href: STUDIO_MOCK_FIGMA.url },
    { label: 'Lumen projects', href: LUMEN_PROJECTS_FOLDER },
    { label: '🐚 Shell', href: shell },
  ],
  librarian: [
    { label: 'Lumen design system', href: ds },
    { label: 'Lumen projects', href: LUMEN_PROJECTS_FOLDER },
  ],
  designer: [
    { label: 'Figma mock space', href: STUDIO_MOCK_FIGMA.url },
    { label: 'Casino-Lumen', href: casino },
    { label: '🐚 Shell', href: shell },
    { label: 'PropShopX', href: propshop },
  ],
  ui_engineer: [
    { label: 'Storybook', href: TARGETS.storybookUrl },
    { label: 'Shell / Mobile Dock', href: `${TARGETS.storybookUrl}/?path=/story/lumen-shell-mobile-dock--casino` },
    { label: 'Shell / Side Nav', href: `${TARGETS.storybookUrl}/?path=/story/lumen-shell-side-nav--casino` },
  ],
  tokens: [
    { label: 'Lumen design system', href: ds },
    { label: 'Token collections', href: `${ds}?node-id=4862-20722` },
  ],
  engineer: [
    { label: 'Live site', href: TARGETS.liveSiteUrl },
    { label: 'Design system page', href: `${TARGETS.liveSiteUrl}/design-system` },
  ],
  qa: [
    { label: 'Storybook', href: TARGETS.storybookUrl },
    { label: 'Casino-Lumen', href: casino },
    { label: 'Live site', href: TARGETS.liveSiteUrl },
  ],
};
