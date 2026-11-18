import { ATOM_STORIES } from './stories-atoms'
import { FOUNDATION_STORIES } from './stories-foundations'
import { MOTION_ICON_STORIES } from './stories-motion-icons'
import { PRODUCT_STORIES } from './stories-product'
import { SHELL_STORIES } from './stories-shell'
import type { LumenStory, LumenStoryGroup } from './types'
import { GROUP_META } from './types'

/** Same order as Lumen Storybook Coverage + live-site product. */
export const LUMEN_GROUPS: LumenStoryGroup[] = [
  'Foundations',
  'Actions',
  'Utilities',
  'Inputs',
  'System States',
  'Data Display',
  'Navigation',
  'Shell',
  'Sheets & drawers',
  'Promo & banners',
  'Casino',
  'Rewards',
  'Account',
  'Pages',
  'Motion',
  'Others',
]

export { GROUP_META }

export const LUMEN_STORIES: LumenStory[] = [
  ...FOUNDATION_STORIES,
  ...ATOM_STORIES,
  ...MOTION_ICON_STORIES,
  ...SHELL_STORIES,
  ...PRODUCT_STORIES,
]

export function storiesByGroup(group: LumenStoryGroup): LumenStory[] {
  return LUMEN_STORIES.filter((s) => s.group === group)
}

export function findStory(id: string): LumenStory | undefined {
  return LUMEN_STORIES.find((s) => s.id === id)
}
