import type { Meta, StoryObj } from '@storybook/react-vite';
import { CasinoLobby } from '../casino-lobby-page';
import { StoryNote } from '../story-kit';

const meta = {
  title: 'Lumen/Casino/Lobby',
  component: CasinoLobby,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CasinoLobby>;
export default meta;
type Story = StoryObj<typeof meta>;

export const FullPage: Story = {
  render: () => (
    <div className="min-h-svh bg-background">
      <StoryNote>
        Casino-Lumen 69:47911 — Continue Playing, Originals, New Games, Live, Top 10, Popular,
        Halloween / Christmas banners, providers, slots, VIP jackpots, activity.
      </StoryNote>
      <CasinoLobby />
    </div>
  ),
};
