import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carousel, GameTile } from '../data';
const meta = { title: 'Lumen/Data Display/Carousel', component: Carousel } satisfies Meta<typeof Carousel>;
export default meta;
export const Default: StoryObj = {
  render: () => (
    <Carousel title="Originals" icon="dice">
      {['Blackjack', 'Roulette', 'Baccarat', 'Crash', 'Dice', 'Plinko'].map((t, i) => (
        <GameTile key={t} title={t} tag={i === 0 ? 'Originals' : i === 1 ? 'Live' : undefined} rank={i === 5 ? 1 : undefined} />
      ))}
    </Carousel>
  ),
};
