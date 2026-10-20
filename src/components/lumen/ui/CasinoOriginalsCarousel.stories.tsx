import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  CASINO_ORIGINALS_GAMES,
  CasinoOriginalsCarousel,
  CasinoOriginalsGameTag,
  CasinoOriginalsGameTile,
} from '../casino-originals-carousel';
import { StoryNote, StoryStack } from '../story-kit';

const meta = {
  title: 'Lumen/Casino/Originals Carousel',
  component: CasinoOriginalsCarousel,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CasinoOriginalsCarousel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="min-h-svh bg-background py-8">
      <StoryNote>
        Casino-Lumen 69-47911 / Master 509:406894 — dice row icon, outside arrows, 152×207 tiles with vendor + Original tag.
      </StoryNote>
      <CasinoOriginalsCarousel />
    </div>
  ),
};

export const PlaceholderTiles: Story = {
  render: () => (
    <div className="min-h-svh bg-background py-8">
      <CasinoOriginalsCarousel
        games={CASINO_ORIGINALS_GAMES.map((g) => ({ ...g, imageSrc: undefined }))}
        totalCount={10}
      />
    </div>
  ),
};

export const CompactCount: Story = {
  render: () => (
    <div className="min-h-svh bg-background py-8">
      <CasinoOriginalsCarousel games={CASINO_ORIGINALS_GAMES.slice(0, 4)} totalCount={4} />
    </div>
  ),
};

export const DarkMode: Story = {
  parameters: { backgrounds: { default: 'dark' } },
  render: () => (
    <div className="dark min-h-svh bg-background py-8">
      <CasinoOriginalsCarousel />
    </div>
  ),
};

export const GameTileStates: Story = {
  render: () => (
    <div className="min-h-svh bg-background p-8">
      <StoryStack>
        <StoryNote>Single tile — vendor tag, image, and placeholder variants.</StoryNote>
        <CasinoOriginalsGameTag className="relative left-0 top-0 mb-4 inline-flex" />
        <div className="flex flex-wrap gap-4">
          <CasinoOriginalsGameTile title="Plinko" imageSrc="/games/originals/plinko.png" />
          <CasinoOriginalsGameTile title="Dice" />
        </div>
      </StoryStack>
    </div>
  ),
};
