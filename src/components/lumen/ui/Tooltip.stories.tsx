import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from '../feedback';
import { Button } from '../index';
const meta = { title: 'Lumen/System States/Tooltip', component: Tooltip } satisfies Meta<typeof Tooltip>;
export default meta;
export const Default: StoryObj = {
  render: () => <div className="pt-10"><Tooltip label="Add to favourites"><Button variant="secondary">Hover me</Button></Tooltip></div>,
};
