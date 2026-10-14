import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress } from '../feedback';
const meta = { title: 'Lumen/System States/Progress', component: Progress } satisfies Meta<typeof Progress>;
export default meta;
export const Default: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Progress value={64} label="Bronze → Silver" tone="vip" />
      <Progress value={30} label="Upload" />
      <Progress value={100} label="Verified" tone="success" />
    </div>
  ),
};
