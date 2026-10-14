import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toast } from '../feedback';
const meta = { title: 'Lumen/System States/Sonner', component: Toast } satisfies Meta<typeof Toast>;
export default meta;
export const Default: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Toast title="Bet placed" description="$25.00 on Lakers ML @ 1.90" tone="success" />
      <Toast title="Odds changed" description="Accept new odds to continue" />
      <Toast title="Deposit failed" description="Card declined" tone="destructive" />
    </div>
  ),
};
