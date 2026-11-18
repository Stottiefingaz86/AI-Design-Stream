import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { GameLauncher } from '../../../../apps/live-site/components/lumen/game-launcher';
import { ORIGINALS_GAMES } from '../../../../apps/live-site/lib/lumen/casino-lobby-catalog';
import { StoryNote } from '../story-kit';

const meta = {
  title: 'Lumen/Casino/Game Launcher',
  component: GameLauncher,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof GameLauncher>;
export default meta;

export const Open: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(true);
    const game = ORIGINALS_GAMES[0] ?? null;
    return (
      <div className="relative min-h-[480px] bg-background p-4">
        <StoryNote>
          Live-site <code>GameLauncher</code> — same portal chrome as demo (jackpot ticker,
          favorite, fullscreen).
        </StoryNote>
        <button
          type="button"
          className="mt-3 rounded-lg border border-border px-3 py-2 text-sm"
          onClick={() => setOpen(true)}
        >
          Re-open launcher
        </button>
        <GameLauncher open={open} game={game} onClose={() => setOpen(false)} />
      </div>
    );
  },
};
