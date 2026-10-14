import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumb } from '../navigation';
const meta = { title: 'Lumen/Navigation/Breadcrumbs', component: Breadcrumb } satisfies Meta<typeof Breadcrumb>;
export default meta;
export const Default: StoryObj = { render: () => <Breadcrumb items={['Home', 'Sports', 'Soccer', 'Premier League']} /> };
