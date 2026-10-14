import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from '../feedback';
const meta = { title: 'Lumen/Utilities/Skeleton', component: Skeleton } satisfies Meta<typeof Skeleton>;
export default meta;
export const Default: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-6 w-48" />
      <div className="flex gap-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-16 rounded-lg" />)}</div>
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  ),
};
