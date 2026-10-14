import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field } from '../forms';
import { Input } from '../index';
const meta = { title: 'Lumen/Inputs/Field', component: Field } satisfies Meta<typeof Field>;
export default meta;
export const Default: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      <Field label="Email" hint="We never share it" required><Input placeholder="you@example.com" /></Field>
      <Field label="Stake" error="Minimum stake is $1.00"><Input value="0.50" state="error" /></Field>
    </div>
  ),
};
