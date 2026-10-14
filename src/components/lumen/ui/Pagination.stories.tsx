import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pagination } from '../navigation';
const meta = { title: 'Lumen/Data Display/Pagination', component: Pagination } satisfies Meta<typeof Pagination>;
export default meta;
export const Default: StoryObj = { render: () => <Pagination page={2} pages={6} /> };
