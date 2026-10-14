import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputGroup } from '../forms';
const meta = { title: 'Lumen/Inputs/Input Group', component: InputGroup } satisfies Meta<typeof InputGroup>;
export default meta;
export const Default: StoryObj = { render: () => (<InputGroup prefix="$" suffix="USD" />) };
