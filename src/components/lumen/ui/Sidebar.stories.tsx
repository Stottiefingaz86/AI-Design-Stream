import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShellSidebar } from '../../../../apps/live-site/components/site/shell-sidebar';
import { ShellDrawer } from '../../../../apps/live-site/components/site/shell-drawer';
import { DesktopShellStory, ShellStory } from '../../../../.storybook/shell-harness';
import { StoryNote } from '../story-kit';

/**
 * Demo truth = apps/live-site ShellSidebar / ShellDrawer.
 * The old shadcn “Home / Casino / Sports” rail is gone — that was not BetOnline.
 */
const meta = {
  title: 'Lumen/Shell/Product Sidebar',
  component: ShellSidebar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ShellSidebar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const DesktopCasino: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <StoryNote>
        Live-site <code>ShellSidebar</code> — same icons/nav as :3000. Collapse/expand via shell
        state. Not the generic Lumen Navigation/Sidebar primitive.
      </StoryNote>
      <DesktopShellStory pathname="/casino">
        <ShellSidebar />
        <main className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground lg:pl-24">
          Casino product sidebar (demo).
        </main>
      </DesktopShellStory>
    </div>
  ),
};

export const DesktopPromotions: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <StoryNote>Promotions nav from <code>navForProduct</code> — All Promotions, My Bonus, Contests, RAF…</StoryNote>
      <DesktopShellStory pathname="/promotions">
        <ShellSidebar />
        <main className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground lg:pl-24">
          Promotions product sidebar (demo).
        </main>
      </DesktopShellStory>
    </div>
  ),
};

export const MobileDrawer: Story = {
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <StoryNote>Mobile drawer = same nav source as desktop sidebar.</StoryNote>
      <ShellStory pathname="/casino" openNav>
        <ShellDrawer />
      </ShellStory>
    </div>
  ),
};
