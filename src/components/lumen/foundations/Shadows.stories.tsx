import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = { title: 'Lumen/Foundations/Shadows' } satisfies Meta;
export default meta;

export const Elevation: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-8 bg-background p-8">
      {['sm', 'md', 'lg', 'xl'].map((level) => (
        <div
          key={level}
          className="grid h-28 w-40 place-items-center rounded-lg bg-card text-sm"
          style={{ boxShadow: `var(--shadow-${level}, 0 4px 16px var(--shadow-color))` }}
        >
          shadow-{level}
        </div>
      ))}
    </div>
  ),
};
