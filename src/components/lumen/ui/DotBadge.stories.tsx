import type { Meta, StoryObj } from '@storybook/react-vite';
import { DotBadge, NumberBadge } from '@/components/ui/dot-badge';

const meta = { title: 'Lumen/Data Display/Dot Badge', component: DotBadge } satisfies Meta<typeof DotBadge>;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <DotBadge>Live</DotBadge>
      <DotBadge tone="live">In play</DotBadge>
      <DotBadge tone="success">Settled</DotBadge>
      <DotBadge tone="warning">Pending</DotBadge>
      <DotBadge tone="info">Info</DotBadge>
      <DotBadge tone="destructive">Void</DotBadge>
      <DotBadge tone="muted">Offline</DotBadge>
    </div>
  ),
};

export const NumberBadges: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <NumberBadge>3</NumberBadge>
      <NumberBadge>12</NumberBadge>
      <NumberBadge>99+</NumberBadge>
    </div>
  ),
};
