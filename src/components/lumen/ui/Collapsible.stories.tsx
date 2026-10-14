import type { Meta, StoryObj } from '@storybook/react-vite';
import { Collapsible } from '../navigation';
const meta = { title: 'Lumen/Data Display/Collapsible', component: Collapsible } satisfies Meta<typeof Collapsible>;
export default meta;
export const Default: StoryObj = { render: () => <Collapsible title="Bet details">Lakers ML @ 1.90 · Stake $25.00</Collapsible> };
