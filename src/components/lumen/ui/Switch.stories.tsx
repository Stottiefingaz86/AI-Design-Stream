import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from '../forms';
const meta = { title: 'Lumen/Inputs/Switch', component: Switch } satisfies Meta<typeof Switch>;
export default meta;
export const Default: StoryObj = { render: () => (<div className="flex flex-col gap-3"><Switch label="Dark mode" checked /><Switch label="Sound effects" /><Switch label="Disabled" disabled /></div>) };
