import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = { title: 'Lumen/Foundations/Favicons' } satisfies Meta;
export default meta;

export const Current: StoryObj = {
  render: () => (
    <div className="flex items-center gap-6">
      <img src="/favicon.svg" alt="Favicon" width={32} height={32} className="rounded" />
      <img src="/favicon.svg" alt="Favicon 64" width={64} height={64} className="rounded-lg" />
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <img src="/favicon.svg" alt="" width={16} height={16} />
        <span className="text-sm">Lumen · tab preview</span>
      </div>
    </div>
  ),
};
