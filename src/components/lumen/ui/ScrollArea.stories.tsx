import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScrollArea } from '../navigation';
const meta = { title: 'Lumen/Utilities/Scroll Area', component: ScrollArea } satisfies Meta<typeof ScrollArea>;
export default meta;
export const Default: StoryObj = {
  render: () => <ScrollArea>{Array.from({ length: 20 }).map((_, i) => <p key={i} className="py-1 text-muted-foreground">League {i + 1}</p>)}</ScrollArea>,
};
