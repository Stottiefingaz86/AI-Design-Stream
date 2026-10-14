import type { Meta, StoryObj } from '@storybook/react-vite';
import { OTPInput } from '../forms';
const meta = { title: 'Lumen/Inputs/OTP Input', component: OTPInput } satisfies Meta<typeof OTPInput>;
export default meta;
export const Default: StoryObj = { render: () => (<OTPInput value="482" />) };
