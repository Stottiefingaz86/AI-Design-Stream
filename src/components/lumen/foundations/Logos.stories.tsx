import type { Meta, StoryObj } from '@storybook/react-vite';

const BRANDS = [
  ['BOL', 'BetOnline'],
  ['SB', 'SportsBetting'],
  ['TG', 'TigerGaming'],
  ['LV', 'LowVig'],
  ['WC', 'WelcomeBonus'],
  ['SS', 'SuperSlots'],
];

const meta = { title: 'Lumen/Foundations/Logos' } satisfies Meta;
export default meta;

export const Wordmarks: StoryObj = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {BRANDS.map(([code, name]) => (
        <div key={code} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-6 hover:bg-muted">
          <span className="text-2xl font-black tracking-tight">
            <span className="text-primary">{code}</span>
          </span>
          <span className="text-xs text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const OnInverted: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-4 rounded-lg bg-header-inverted p-6">
      {BRANDS.map(([code]) => (
        <span key={code} className="text-xl font-black text-foreground-inverted">
          {code}
        </span>
      ))}
    </div>
  ),
};
