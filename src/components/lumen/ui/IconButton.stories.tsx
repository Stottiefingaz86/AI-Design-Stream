import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from '../data';
const meta = { title: 'Lumen/Actions/Icon Button', component: IconButton } satisfies Meta<typeof IconButton>;
export default meta;
export const Default: StoryObj = {
  render: () => (
    <div className="flex gap-3">
      <IconButton icon="search" label="Search" variant="outline" />
      <IconButton icon="heart" label="Favourite" />
      <IconButton icon="wallet" label="Wallet" variant="secondary" />
      <IconButton icon="crown" label="VIP" variant="vip" />
      <IconButton icon="user" label="Account" variant="primary" />
    </div>
  ),
};
