import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';

const meta = { title: 'Lumen/Inputs/Checkbox', component: Checkbox } satisfies Meta<typeof Checkbox>;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Field orientation="horizontal">
        <Checkbox id="odds" defaultChecked />
        <FieldLabel htmlFor="odds">Accept odds changes</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <Checkbox id="remember" />
        <FieldLabel htmlFor="remember">Remember me</FieldLabel>
      </Field>
      <Field orientation="horizontal" data-disabled>
        <Checkbox id="off" disabled />
        <FieldLabel htmlFor="off">Disabled</FieldLabel>
      </Field>
    </div>
  ),
};
