import type { Meta, StoryObj } from '@storybook/react-vite';

const FRAMES = [
  { name: 'Desktop', width: 1440, height: 200 },
  { name: 'Tablet', width: 768, height: 200 },
  { name: 'Mobile', width: 375, height: 200 },
];

const meta = { title: 'Lumen/Foundations/Screens' } satisfies Meta;
export default meta;

export const Breakpoints: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6 overflow-x-auto">
      {FRAMES.map((f) => (
        <div key={f.name} className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            {f.name} · {f.width}px
          </p>
          <div
            className="rounded-lg border border-border bg-card p-4"
            style={{ width: Math.min(f.width, 720), maxWidth: '100%' }}
          >
            <div className="h-16 rounded bg-muted" />
            <p className="mt-3 text-sm">Content column at {f.name} width.</p>
          </div>
        </div>
      ))}
    </div>
  ),
};
