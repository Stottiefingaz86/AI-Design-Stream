import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search } from '@/components/ui/search';
import { StoryNote } from '../story-kit';

const meta = { title: 'Lumen/Inputs/Search Box', component: Search } satisfies Meta<typeof Search>;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-4">
      <StoryNote>Hover the field — focus ring is the studio hover/focus treatment.</StoryNote>
      <Search placeholder="Search games, sports, players…" />
    </div>
  ),
};

export const WithVoice: StoryObj = {
  render: () => <Search voice placeholder="Search…" />,
};

export const Disabled: StoryObj = {
  render: () => <Search disabled defaultValue="blackjack" />,
};
