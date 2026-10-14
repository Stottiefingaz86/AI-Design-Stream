import type { Meta, StoryObj } from '@storybook/react-vite';
import { Separator } from '../data';
const meta = { title: 'Lumen/Utilities/Separator', component: Separator } satisfies Meta<typeof Separator>;
export default meta;
export const Default: StoryObj = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <Separator />
      <Separator label="or continue with" />
      <div className="flex items-center gap-3">A <Separator orientation="vertical" /> B</div>
    </div>
  ),
};
