import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../index';

const meta = {
  title: 'Lumen/Data Display/Badge',
  component: Badge,
  args: { children: 'Live', tone: 'live' },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { tone: 'muted', children: 'Default' } };
export const Live: Story = {};
export const Featured: Story = { args: { tone: 'featured', children: 'Featured' } };
export const Vip: Story = { args: { tone: 'vip', children: 'VIP' } };
export const AllTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge>Default</Badge>
      <Badge tone="live">Live</Badge>
      <Badge tone="featured">Featured</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="warning">Warning</Badge>
      <Badge tone="info">Info</Badge>
      <Badge tone="vip">VIP</Badge>
    </div>
  ),
};
