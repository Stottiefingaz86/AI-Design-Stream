import type { Meta, StoryObj } from '@storybook/react-vite';
import { HoverCard } from '../feedback';
import { Button } from '../index';
const meta = { title: 'Lumen/System States/Hover Card', component: HoverCard } satisfies Meta<typeof HoverCard>;
export default meta;
export const Default: StoryObj = {
  render: () => <div className="h-40"><HoverCard trigger={<Button variant="ghost">@Play_Gusto</Button>}>Player stats and recent bets.</HoverCard></div>,
};
