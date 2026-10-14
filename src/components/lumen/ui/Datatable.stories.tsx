import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataTable } from '../data';
const meta = { title: 'Lumen/Data Display/Data Table', component: DataTable } satisfies Meta<typeof DataTable>;
export default meta;
export const Default: StoryObj = { render: () => <DataTable /> };
