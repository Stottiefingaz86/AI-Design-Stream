import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toggle } from '../forms';
const meta = { title: 'Lumen/Inputs/Toggle', component: Toggle } satisfies Meta<typeof Toggle>;
export default meta;
export const Default: StoryObj = { render: () => (<div className="flex gap-2"><Toggle pressed>Bold</Toggle><Toggle>Italic</Toggle></div>) };
