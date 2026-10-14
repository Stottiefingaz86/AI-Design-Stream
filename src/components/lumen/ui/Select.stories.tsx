import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from '../forms';
const meta = { title: 'Lumen/Inputs/Select', component: Select } satisfies Meta<typeof Select>;
export default meta;
export const Default: StoryObj = { render: () => (<Select options={["NFL", "NBA", "MLB"]} placeholder="Choose a league" />) };
