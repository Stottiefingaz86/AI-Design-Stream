import type { Meta, StoryObj } from '@storybook/react-vite';
import { Drawer } from '../feedback';
const meta = { title: 'Lumen/Data Display/Drawer', component: Drawer } satisfies Meta<typeof Drawer>;
export default meta;
export const Default: StoryObj = { render: () => <Drawer title="Filters">Sport, league, market type.</Drawer> };
