import type { Meta, StoryObj } from '@storybook/react-vite';
import { CashierPanel, CashierSheet } from '../../../../apps/live-site/components/site/cashier-sheet';
import { ShellStory } from '../../../../.storybook/shell-harness';
import { StoryNote } from '../story-kit';

const meta = {
  title: 'Lumen/Shell/Cashier Sheet',
  component: CashierSheet,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof CashierSheet>;
export default meta;
type Story = StoryObj<typeof meta>;

export const OpenDeposit: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <StoryNote>
        Balance pill opens the Wallet sheet from Cashier-Widget Master — 384px right sheet, Crypto / Credit Card / Others.
      </StoryNote>
      <ShellStory pathname="/casino">
        <CashierSheet open initialTab="deposit" onClose={() => undefined} />
      </ShellStory>
    </div>
  ),
};

export const OpenWithdraw: Story = {
  render: () => (
    <ShellStory pathname="/casino">
      <CashierSheet open initialTab="withdraw" onClose={() => undefined} />
    </ShellStory>
  ),
};

export const Loading: Story = {
  render: () => (
    <ShellStory pathname="/casino">
      <CashierSheet open loading onClose={() => undefined} />
    </ShellStory>
  ),
};

export const Closed: Story = {
  render: () => (
    <ShellStory pathname="/casino">
      <CashierSheet open={false} onClose={() => undefined} />
    </ShellStory>
  ),
};

export const PanelDeposit: Story = {
  render: () => (
    <div className="w-[384px] rounded-lg border border-border bg-background p-4">
      <CashierPanel onClose={() => undefined} showClose initialTab="deposit" />
    </div>
  ),
};

export const PanelWithdraw: Story = {
  render: () => (
    <div className="w-[384px] rounded-lg border border-border bg-background p-4">
      <CashierPanel onClose={() => undefined} showClose initialTab="withdraw" />
    </div>
  ),
};

export const PanelLoading: Story = {
  render: () => (
    <div className="w-[384px] rounded-lg border border-border bg-background p-4">
      <CashierPanel onClose={() => undefined} showClose loading />
    </div>
  ),
};
