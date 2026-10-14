import type { Meta, StoryObj } from '@storybook/react-vite';
import { Favorite } from '../casino';

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

export const Default: StoryObj<typeof meta> = {};
