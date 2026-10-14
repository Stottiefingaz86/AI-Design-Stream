import type { Meta, StoryObj } from '@storybook/react-vite';

const SWATCHES = [
  ['background', 'bg-background', 'text-foreground'],
  ['foreground', 'bg-foreground', 'text-background'],
  ['card', 'bg-card', 'text-card-foreground'],
  ['popover', 'bg-popover', 'text-popover-foreground'],
  ['primary', 'bg-primary', 'text-primary-foreground'],
  ['secondary', 'bg-secondary', 'text-secondary-foreground'],
  ['muted', 'bg-muted', 'text-muted-foreground'],
  ['accent', 'bg-accent', 'text-accent-foreground'],
  ['destructive', 'bg-destructive', 'text-destructive-foreground'],
  ['success', 'bg-success', 'text-success-foreground'],
  ['warning', 'bg-warning', 'text-warning-foreground'],
  ['info', 'bg-info', 'text-info-foreground'],
  ['border', 'bg-border', 'text-foreground'],
  ['input', 'bg-input', 'text-foreground'],
  ['ring', 'bg-ring', 'text-primary-foreground'],
] as const;

const meta = { title: 'Lumen/Foundations/Colors' } satisfies Meta;
export default meta;

export const Semantic: StoryObj = {
  render: () => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {SWATCHES.map(([name, bg, fg]) => (
        <div key={name} className={`flex h-24 flex-col justify-between rounded-lg border border-border p-3 ${bg} ${fg}`}>
          <span className="text-xs font-medium">{name}</span>
          <span className="text-[10px] opacity-70">{bg}</span>
        </div>
      ))}
    </div>
  ),
};

export const Opacity: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {[10, 20, 30, 40, 50, 60].map((n) => (
        <div
          key={n}
          className="grid size-20 place-items-center rounded-lg text-xs text-primary-foreground"
          style={{ background: `var(--opacity-primary-${n})` }}
        >
          {n}%
        </div>
      ))}
    </div>
  ),
};

export const Radius: StoryObj = {
  render: () => (
    <div className="flex flex-wrap items-end gap-4">
      {(['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const).map((r) => (
        <div key={r} className="flex flex-col items-center gap-2">
          <div className="size-16 bg-primary" style={{ borderRadius: `var(--border-radius-${r})` }} />
          <span className="text-xs text-muted-foreground">{r}</span>
        </div>
      ))}
    </div>
  ),
};
