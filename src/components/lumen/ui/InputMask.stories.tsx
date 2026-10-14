import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputMask } from '../forms';

const meta = { title: 'Lumen/Inputs/Input Mask', component: InputMask } satisfies Meta<typeof InputMask>;
export default meta;

export const Default: StoryObj<typeof meta> = {
  args: {
    mask: '(___) ___-____',
    placeholder: '(555) 000-0000',
    replacement: { _: /\d/ },
    size: 'md',
  },
};
