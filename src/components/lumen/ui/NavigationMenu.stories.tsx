import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavMenu } from '../navigation';

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

export const Default: StoryObj<typeof meta> = {};
