import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from '../forms';
const meta = { title: 'Lumen/Inputs/Text Area', component: Textarea } satisfies Meta<typeof Textarea>;
export default meta;
export const Default: StoryObj = { render: () => (<Textarea placeholder="Tell support what happened…" />) };
