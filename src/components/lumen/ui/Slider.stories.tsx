import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from '../forms';
const meta = { title: 'Lumen/Inputs/Slider', component: Slider } satisfies Meta<typeof Slider>;
export default meta;
export const Default: StoryObj = { render: () => (<Slider label="Stake" value={35} />) };
