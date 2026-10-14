import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/ui/button';
import { Shimmer, ShimmerText, TileShimmer } from '../animations';

const meta = { title: 'Lumen/Foundations/Animations/Shimmer', component: Shimmer } satisfies Meta<typeof Shimmer>;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <div className="w-80">
      <Shimmer active tint="foreground" trigger="hover">
        <Button size="lg">Claim now</Button>
      </Shimmer>
    </div>
  ),
};

export const AlwaysOn: StoryObj = {
  render: () => <Shimmer className="h-24 w-80" />,
};

export const Text: StoryObj = {
  render: () => <ShimmerText className="text-3xl">Mega Jackpot</ShimmerText>,
};

export const TileHover: StoryObj = {
  render: () => (
    <div className="relative h-36 w-56 overflow-hidden rounded-lg bg-card ring-1 ring-border">
      <TileShimmer />
      <p className="relative grid h-full place-items-center text-sm font-medium">Hover tile shimmer</p>
    </div>
  ),
};
