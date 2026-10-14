import type { Meta, StoryObj } from '@storybook/react-vite';
import { Typography } from '@/components/ui/typography';
import { TypeScale } from '../data';

const meta = {
  title: 'Lumen/Foundations/Typography',
  component: Typography,
  args: { children: 'The quick brown fox jumps over the lazy dog', shape: 'paragraph', variant: 'default', weight: 'normal' },
} satisfies Meta<typeof Typography>;
export default meta;

export const Default: StoryObj<typeof meta> = {};
export const Scale: StoryObj = { render: () => <TypeScale /> };
