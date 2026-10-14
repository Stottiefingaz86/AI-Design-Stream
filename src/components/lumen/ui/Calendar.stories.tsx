import type { Meta, StoryObj } from '@storybook/react-vite';
import { Calendar } from '../forms';
const meta = { title: 'Lumen/System States/Calendar', component: Calendar } satisfies Meta<typeof Calendar>;
export default meta;
export const Default: StoryObj = { render: () => (<Calendar />) };
