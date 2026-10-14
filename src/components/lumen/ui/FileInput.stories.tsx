import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileInput } from '../forms';
const meta = { title: 'Lumen/Inputs/File Input', component: FileInput } satisfies Meta<typeof FileInput>;
export default meta;
export const Default: StoryObj = { render: () => (<FileInput />) };
