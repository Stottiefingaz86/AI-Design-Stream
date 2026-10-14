import type { Meta, StoryObj } from '@storybook/react-vite';
import { Confetti } from '../animations';

const meta = {
  title: 'Lumen/Foundations/Animations/Confetti',
  component: Confetti,
  args: { area: 'parent', duration: 2.5, palette: 'chart', particleCount: 80 },
} satisfies Meta<typeof Confetti>;
export default meta;

export const Default: StoryObj<typeof meta> = {};
