import type { ReactNode } from 'react'

/**
 * Mirrors Lumen Storybook Coverage (`src/components/lumen/Coverage.stories.tsx`)
 * + live-site product modules.
 */
export type LumenStoryGroup =
  | 'Foundations'
  | 'Actions'
  | 'Utilities'
  | 'Inputs'
  | 'System States'
  | 'Data Display'
  | 'Navigation'
  | 'Shell'
  | 'Sheets & drawers'
  | 'Promo & banners'
  | 'Casino'
  | 'Rewards'
  | 'Account'
  | 'Pages'
  | 'Motion'
  | 'Others'

export type LumenStory = {
  id: string
  title: string
  group: LumenStoryGroup
  description?: string
  importPath: string
  code: string
  render: () => ReactNode
  demoHref?: string
}

export const GROUP_META: Record<
  LumenStoryGroup,
  { label: string; emoji?: string }
> = {
  Foundations: { label: 'Foundations', emoji: '🎨' },
  Actions: { label: 'Actions', emoji: '⚡️' },
  Utilities: { label: 'Utilities', emoji: '🛠️' },
  Inputs: { label: 'Inputs', emoji: '⌨️' },
  'System States': { label: 'System States', emoji: '🔔' },
  'Data Display': { label: 'Data Display', emoji: '📊' },
  Navigation: { label: 'Navigation', emoji: '🧭' },
  Shell: { label: 'Shell', emoji: '★' },
  'Sheets & drawers': { label: 'Sheets & drawers' },
  'Promo & banners': { label: 'Promo & banners' },
  Casino: { label: 'Casino' },
  Rewards: { label: 'Rewards' },
  Account: { label: 'Account' },
  Pages: { label: 'Pages' },
  Motion: { label: 'Motion' },
  Others: { label: 'Others' },
}
