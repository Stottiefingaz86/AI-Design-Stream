import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const meta = { title: 'Lumen/Inputs/Text Input', component: Input } satisfies Meta<typeof Input>;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-6">
      <Field>
        <FieldLabel>Stake</FieldLabel>
        <Input placeholder="0.00" />
        <FieldDescription>Minimum $1.00</FieldDescription>
      </Field>
      <Field data-invalid>
        <FieldLabel>Email</FieldLabel>
        <Input placeholder="you@example.com" aria-invalid defaultValue="nope" />
        <FieldError>Enter a valid email.</FieldError>
      </Field>
      <Field data-disabled>
        <FieldLabel>Disabled</FieldLabel>
        <Input disabled defaultValue="25.00" />
      </Field>
    </div>
  ),
};
