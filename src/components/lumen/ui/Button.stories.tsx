import type { Meta, StoryObj } from '@storybook/react-vite';
import { Loader2Icon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StateLabel, StateRow, StoryNote, StoryStack } from '../story-kit';

const VARIANTS = ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const;
const SIZES = ['xs', 'sm', 'default', 'lg'] as const;

const HOVER_CLASS: Record<(typeof VARIANTS)[number], string> = {
  default: 'bg-primary/80',
  secondary: 'bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]',
  outline: 'bg-muted text-foreground',
  ghost: 'bg-muted text-foreground',
  destructive: 'bg-destructive/20',
  link: 'underline',
};

const meta = {
  title: 'Lumen/Actions/Button',
  component: Button,
  args: { children: 'Place bet', variant: 'default', size: 'default' },
  argTypes: {
    variant: { control: 'select', options: [...VARIANTS] },
    size: { control: 'select', options: [...SIZES, 'icon'] },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Outline: Story = { args: { variant: 'outline' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Destructive: Story = { args: { variant: 'destructive', children: 'Cancel bet' } };
export const Link: Story = { args: { variant: 'link', children: 'View odds' } };

export const HoverAndStates: Story = {
  name: 'Hover / Focus / Disabled',
  render: () => (
    <StoryStack>
      <StoryNote>
        Default is live — hover it. Hover column forces the same classes the Figma / shadcn studio hover state uses.
      </StoryNote>
      {VARIANTS.map((v) => (
        <StateRow key={v} label={v}>
          <StateLabel>Default</StateLabel>
          <Button variant={v}>Place bet</Button>
          <StateLabel>Hover</StateLabel>
          <Button variant={v} className={HOVER_CLASS[v]}>
            Place bet
          </Button>
          <StateLabel>Disabled</StateLabel>
          <Button variant={v} disabled>
            Place bet
          </Button>
        </StateRow>
      ))}
    </StoryStack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {SIZES.map((s) => (
        <Button key={s} size={s}>
          {s}
        </Button>
      ))}
      <Button size="icon" aria-label="Add">
        <PlusIcon />
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button>
        <PlusIcon data-icon="inline-start" />
        Place bet
      </Button>
      <Button variant="outline">
        Odds
        <PlusIcon data-icon="inline-end" />
      </Button>
      <Button disabled>
        <Loader2Icon data-icon="inline-start" className="animate-spin" />
        Placing…
      </Button>
    </div>
  ),
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {VARIANTS.map((v) => (
        <div key={v} className="flex items-center gap-3">
          <span className="w-24 text-xs uppercase tracking-wide text-muted-foreground">{v}</span>
          {(['sm', 'default', 'lg'] as const).map((s) => (
            <Button key={s} {...args} variant={v} size={s} />
          ))}
          <Button {...args} variant={v} disabled>
            Disabled
          </Button>
        </div>
      ))}
    </div>
  ),
};
