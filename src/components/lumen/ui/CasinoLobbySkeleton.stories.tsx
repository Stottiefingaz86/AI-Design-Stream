import type { Meta, StoryObj } from '@storybook/react-vite';
import { CasinoLobbySkeleton } from '@/components/lumen/casino-lobby-skeleton';
import { StoryNote } from '../story-kit';

const meta = {
  title: 'Lumen/Casino/Lobby Skeleton',
  component: CasinoLobbySkeleton,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CasinoLobbySkeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="min-h-svh bg-background">
      <StoryNote>
        Casino-Lumen loading layout. Same as <code>Lumen/Utilities/Skeleton</code>:
        <code>--skeleton</code> fill and <code>lm-shimmer</code>.
      </StoryNote>
      <CasinoLobbySkeleton />
    </div>
  ),
};

export const WithOriginalsShelf: Story = {
  render: () => (
    <div className="min-h-svh bg-background">
      <StoryNote>Banner row plus Originals shelf flat blocks (152×207).</StoryNote>
      <CasinoLobbySkeleton withOriginalsShelf />
    </div>
  ),
};
