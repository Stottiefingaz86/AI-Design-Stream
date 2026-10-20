import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameLauncher } from '../casino';

const meta = { title: 'Lumen/Casino/Game Launcher', component: GameLauncher } satisfies Meta<typeof GameLauncher>;
export default meta;

export const Default: StoryObj = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="h-screen w-full">
      <GameLauncher
        closeLabel="Close game"
        exitFullscreenLabel="Exit fullscreen"
        favoriteLabel="Favorite game"
        fullscreenLabel="Enter fullscreen"
        gameName="Take The Bank"
        showJackpot
        onClose={() => {}}
        onFavoriteChange={() => {}}
        onFullscreen={() => {}}
        testId="game-launcher"
      >
        <div className="flex size-full items-center justify-center bg-black/80 text-sm text-white/70">
          Game viewport
        </div>
      </GameLauncher>
    </div>
  ),
};

export const WithoutJackpot: StoryObj = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="h-screen w-full">
      <GameLauncher gameName="Take The Bank" showJackpot={false} onClose={() => {}}>
        <div className="flex size-full items-center justify-center bg-black/80 text-sm text-white/70">
          Game viewport
        </div>
      </GameLauncher>
    </div>
  ),
};
