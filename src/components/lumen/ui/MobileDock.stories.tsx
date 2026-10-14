import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShellMobileNav } from '../../../../apps/live-site/components/site/shell-mobile-nav';
import { ShellStory } from '../../../../.storybook/shell-harness';
import { StoryNote } from '../story-kit';

const meta = {
  title: 'Lumen/Shell/Mobile Dock',
  component: ShellMobileNav,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ShellMobileNav>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Casino: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <StoryNote>apps/live-site ShellMobileNav. Casino dock. Hover and press — there is no second implementation.</StoryNote>
      <ShellStory pathname="/casino">
        <ShellMobileNav />
      </ShellStory>
    </div>
  ),
};

export const Sports: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <StoryNote>Same component. Path `/sports` selects Search / Bets from the live-site dock map.</StoryNote>
      <ShellStory pathname="/sports">
        <ShellMobileNav />
      </ShellStory>
    </div>
  ),
};
