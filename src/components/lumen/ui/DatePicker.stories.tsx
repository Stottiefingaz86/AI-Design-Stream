import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from '../forms';
const meta = { title: 'Lumen/Inputs/Date Picker', component: DatePicker } satisfies Meta<typeof DatePicker>;
export default meta;
export const Default: StoryObj = { render: () => (<div className="h-96"><DatePicker open /></div>) };
