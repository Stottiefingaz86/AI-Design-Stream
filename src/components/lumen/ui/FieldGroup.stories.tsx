import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, FieldGroup, InputGroup, Switch } from '../forms';
const meta = { title: 'Lumen/Inputs/Field Group', component: FieldGroup } satisfies Meta<typeof FieldGroup>;
export default meta;
export const Default: StoryObj = {
  render: () => (
    <FieldGroup title="Deposit limits">
      <Field label="Daily"><InputGroup prefix="$" placeholder="500.00" /></Field>
      <Switch label="Email me at 80%" checked />
    </FieldGroup>
  ),
};
