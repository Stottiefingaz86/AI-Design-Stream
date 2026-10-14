import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chip } from '../index';
const meta = { title: 'Lumen/Data Display/Chip', component: Chip } satisfies Meta<typeof Chip>;
export default meta;
export const Group: StoryObj = {
  render: () => (
    <div className="flex gap-2">
      {['10', '25', '50', '100'].map((c, i) => (
        <Chip key={c} selected={i === 1}>{c}</Chip>
      ))}
    </div>
  ),
};
