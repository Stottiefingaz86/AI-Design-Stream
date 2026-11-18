import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavMenu } from '../navigation';
import { StoryNote } from '../story-kit';

/**
 * Atom only — product header/sidebar is under Lumen/Shell + Lumen/★ Demo site.
 */
const meta = {
  title: 'Lumen/Navigation/Nav Menu',
  component: NavMenu,
  args: {
    activeIndex: 0,
    disabledIndex: -1,
    loadingIndex: -1,
    shape: 'solid',
    'aria-label': 'Main',
  },
} satisfies Meta<typeof NavMenu>;
export default meta;

export const Default: StoryObj<typeof meta> = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <StoryNote>
        Primitive Nav Menu — <strong>not</strong> the BetOnline shell. Use{' '}
        <code>Lumen/Shell/Product Sidebar</code> or <code>Lumen/★ Demo site</code>.
      </StoryNote>
      <NavMenu {...args} />
    </div>
  ),
};
