import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShellDrawer } from '../../../../apps/live-site/components/site/shell-drawer';
import { ShellStory } from '../../../../.storybook/shell-harness';
import { StoryNote } from '../story-kit';

const meta = {
  title: 'Lumen/Shell/Side Nav',
  component: ShellDrawer,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ShellDrawer>;
export default meta;
type Story = StoryObj<typeof meta>;

function DrawerStory({ pathname }: { pathname: string }) {
  return (
    <ShellStory pathname={pathname} openNav>
      <ShellDrawer />
    </ShellStory>
  );
}

export const Casino: Story = {
  render: () => <DrawerStory pathname="/casino" />,
};
export const Sports: Story = {
  render: () => <DrawerStory pathname="/sports" />,
};
export const Poker: Story = {
  render: () => <DrawerStory pathname="/poker" />,
};
export const Promotions: Story = {
  render: () => <DrawerStory pathname="/promotions" />,
};

export const AllProducts: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <StoryNote>apps/live-site ShellDrawer. Lists come from navForProduct — not a Storybook copy.</StoryNote>
      <div className="flex flex-wrap gap-6">
        <DrawerStory pathname="/casino" />
        <DrawerStory pathname="/sports" />
        <DrawerStory pathname="/poker" />
        <DrawerStory pathname="/promotions" />
      </div>
    </div>
  ),
};
