import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

const meta = { title: 'Lumen/Navigation/Command', component: Command } satisfies Meta<typeof Command>;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <Command className="max-w-md rounded-xl border border-border">
      <CommandInput placeholder="Search games, sports, pages…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Casino</CommandItem>
          <CommandItem>Sports</CommandItem>
          <CommandItem>Live betting</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Recent">
          <CommandItem>Blackjack</CommandItem>
          <CommandItem>Lakers @ Celtics</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
