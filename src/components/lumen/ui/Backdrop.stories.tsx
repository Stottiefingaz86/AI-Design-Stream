import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/ui/button';
import { Backdrop } from '@/components/ui/backdrop';

const meta = { title: 'Lumen/Utilities/Backdrop', component: Backdrop } satisfies Meta<typeof Backdrop>;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <div className="relative h-64 overflow-hidden rounded-lg border border-border bg-card">
      <div className="p-6 text-sm text-muted-foreground">Page content sits underneath.</div>
      <Backdrop />
      <div className="absolute inset-0 grid place-items-center">
        <Button>Dismiss</Button>
      </div>
    </div>
  ),
};

export const NoBlur: StoryObj = {
  render: () => (
    <div className="relative h-64 overflow-hidden rounded-lg border border-border bg-card">
      <Backdrop blur={false} />
    </div>
  ),
};
