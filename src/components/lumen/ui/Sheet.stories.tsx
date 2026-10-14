import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sheet } from '../feedback';
const meta = { title: 'Lumen/Data Display/Sheet', component: Sheet } satisfies Meta<typeof Sheet>;
export default meta;
export const Default: StoryObj = { render: () => <Sheet title="Bet slip">2 selections · odds 4.20</Sheet> };
