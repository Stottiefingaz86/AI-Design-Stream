import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShellHeader } from '../../../../apps/live-site/components/site/shell-header';
import { ShellStory } from '../../../../.storybook/shell-harness';
import { StoryNote } from '../story-kit';

const meta = {
  title: 'Lumen/Shell/Mobile Top Tabs',
  component: ShellHeader,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ShellHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <StoryNote>apps/live-site ShellHeader. The underline product tabs are the top strip of this header — not a separate component.</StoryNote>
      <ShellStory pathname="/casino">
        <ShellHeader />
      </ShellStory>
    </div>
  ),
};

export const SportsActive: Story = {
  render: () => (
    <ShellStory pathname="/sports">
      <ShellHeader />
    </ShellStory>
  ),
};
