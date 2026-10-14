import type { Meta, StoryObj } from '@storybook/react-vite';
import { UbcSheet } from '../../../../apps/live-site/components/site/shell-ubc';
import { ShellStory } from '../../../../.storybook/shell-harness';
import { StoryNote } from '../story-kit';

const meta = {
  title: 'Lumen/Shell/Account Sheet',
  component: UbcSheet,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof UbcSheet>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <StoryNote>apps/live-site UbcSheet — the mobile bottom sheet, including the live drag handle.</StoryNote>
      <ShellStory pathname="/casino">
        <UbcSheet open onClose={() => undefined} />
      </ShellStory>
    </div>
  ),
};

export const Closed: Story = {
  render: () => (
    <ShellStory pathname="/casino">
      <UbcSheet open={false} onClose={() => undefined} />
    </ShellStory>
  ),
};
