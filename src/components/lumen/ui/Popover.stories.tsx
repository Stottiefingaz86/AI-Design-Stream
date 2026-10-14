import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover } from '../feedback';
import { Button } from '../index';
const meta = { title: 'Lumen/System States/Popover', component: Popover } satisfies Meta<typeof Popover>;
export default meta;
export const Default: StoryObj = {
  render: () => <div className="h-40"><Popover trigger={<Button variant="outline">Deposit</Button>}>Crypto, cards, bank. Min $20.</Popover></div>,
};
