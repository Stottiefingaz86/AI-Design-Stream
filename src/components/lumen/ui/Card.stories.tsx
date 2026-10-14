import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../index';
const meta = { title: 'Lumen/Data Display/Card', component: Card } satisfies Meta<typeof Card>;
export default meta;
export const Variants: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Card title="Texas Hold'em" action="Play" />
      <Card title="Weekend Freeroll" action="Register" variant="featured" description="$10k guaranteed" />
      <Card title="Lakers @ Celtics" action="Bet now" variant="live" />
    </div>
  ),
};
