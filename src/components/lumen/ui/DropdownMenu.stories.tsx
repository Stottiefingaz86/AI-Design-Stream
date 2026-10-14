import type { Meta, StoryObj } from '@storybook/react-vite';
import { DropdownMenu } from '../navigation';
const meta = { title: 'Lumen/Navigation/Dropdown Menu', component: DropdownMenu } satisfies Meta<typeof DropdownMenu>;
export default meta;
export const Default: StoryObj = {
  render: () => (
    <div className="h-64">
      <DropdownMenu items={[{ label: 'Racebook' }, { label: 'Esports' }, { label: 'VIP Rewards' }, { separator: true, label: '' }, { label: 'Log out', destructive: true }]} />
    </div>
  ),
};
