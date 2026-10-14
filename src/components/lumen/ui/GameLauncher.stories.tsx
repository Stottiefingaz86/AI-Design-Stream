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
        gameName="Take the Bank"
        onClose={() => {}}
        onFavoriteChange={() => {}}
        onFullscreen={() => {}}
        testId="game-launcher"
      >
        <iframe className="size-full border-0" src="about:blank" title="Game content" />
      </GameLauncher>
    </div>
  ),
};
