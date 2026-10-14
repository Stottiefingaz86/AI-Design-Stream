import type { Meta, StoryObj } from '@storybook/react-vite';
import { Combobox } from '../forms';
const meta = { title: 'Lumen/Inputs/Combobox', component: Combobox } satisfies Meta<typeof Combobox>;
export default meta;
export const Default: StoryObj = { render: () => (<div className="h-64"><Combobox options={["Lakers", "Celtics", "Warriors"]} placeholder="Search teams…" /></div>) };
