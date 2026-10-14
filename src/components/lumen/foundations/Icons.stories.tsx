import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BellIcon,
  CrownIcon,
  Dice5Icon,
  HeartIcon,
  HomeIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
  WalletIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ICONS = [
  ['home', HomeIcon],
  ['search', SearchIcon],
  ['heart', HeartIcon],
  ['user', UserIcon],
  ['wallet', WalletIcon],
  ['crown', CrownIcon],
  ['bell', BellIcon],
  ['menu', MenuIcon],
  ['dice', Dice5Icon],
] as const;

const meta = { title: 'Lumen/Foundations/Icons' } satisfies Meta;
export default meta;

export const LucideSet: StoryObj = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
      {ICONS.map(([name, Icon]) => (
        <div key={name} className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 hover:bg-muted">
          <Icon />
          <span className="text-xs text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  ),
};

export const InButtons: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button size="icon" aria-label="Search">
        <SearchIcon />
      </Button>
      <Button size="icon" variant="outline" aria-label="Wallet">
        <WalletIcon />
      </Button>
      <Button>
        <CrownIcon data-icon="inline-start" />
        VIP
      </Button>
    </div>
  ),
};
