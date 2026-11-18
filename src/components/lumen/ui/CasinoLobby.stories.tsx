import type { Meta, StoryObj } from '@storybook/react-vite';
import { CasinoLobby } from '../../../../apps/live-site/components/lumen/casino-lobby-page';
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
        Live-site CasinoLobby (same as :3000). Requires Storybook staticDirs for /games, /casino,
        /vendot_logos — otherwise Live tiles show broken icons.
      </StoryNote>
      <CasinoLobby />
    </div>
  ),
};
