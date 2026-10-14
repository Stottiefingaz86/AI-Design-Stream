import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table } from '../data';
const meta = { title: 'Lumen/Data Display/Table', component: Table } satisfies Meta<typeof Table>;
export default meta;
export const Default: StoryObj = {
  render: () => (
    <Table
      columns={[{ key: 'game', header: 'Game' }, { key: 'stakes', header: 'Stakes' }, { key: 'seats', header: 'Seats', align: 'right' }]}
      rows={[{ game: 'Vegas 1', stakes: '$0.25/$0.50', seats: '6/9' }, { game: 'Rio', stakes: '$1/$2', seats: '4/6' }]}
    />
  ),
};
