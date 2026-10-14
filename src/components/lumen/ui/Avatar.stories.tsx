import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '../data';
const meta = { title: 'Lumen/Data Display/Avatar', component: Avatar } satisfies Meta<typeof Avatar>;
export default meta;
export const Default: StoryObj = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar name="Chris Hunt" size="sm" />
      <Avatar name="Chris Hunt" status="online" />
      <Avatar name="Chris Hunt" size="lg" status="away" />
    </div>
  ),
};
