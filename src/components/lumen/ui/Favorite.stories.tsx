import type { Meta, StoryObj } from '@storybook/react-vite';
import { Favorite } from '../casino';
import { StoryNote } from '../story-kit';

const meta = {
  title: 'Lumen/Casino/Favorite',
  component: Favorite,
  args: {
    favoriteLabel: 'Add game to favorites',
    isFavorited: false,
    unfavoriteLabel: 'Remove game from favorites',
  },
} satisfies Meta<typeof Favorite>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <StoryNote>Click to favorite — heart sprite burst + particle burst, same as the product tile.</StoryNote>
      <div className="relative size-40 overflow-hidden rounded-lg bg-surface-muted-3">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/70" />
        <span className="absolute right-2 top-2">
          <Favorite {...args} />
        </span>
      </div>
    </div>
  ),
};

export const Favorited: Story = {
  args: { isFavorited: true },
  render: (args) => (
    <div className="relative size-40 overflow-hidden rounded-lg bg-surface-muted-3">
      <span className="absolute right-2 top-2">
        <Favorite {...args} />
      </span>
    </div>
  ),
};
