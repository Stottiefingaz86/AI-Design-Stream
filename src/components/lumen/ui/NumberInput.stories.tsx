import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, FieldLabel } from '@/components/ui/field';
import { NumberInput } from '@/components/ui/number-input';
import { StateRow, StoryNote } from '../story-kit';

const meta = { title: 'Lumen/Inputs/Number Input', component: NumberInput } satisfies Meta<typeof NumberInput>;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <Field className="w-56">
      <FieldLabel>Stake</FieldLabel>
      <NumberInput defaultValue={25} min={1} max={500} step={5} />
    </Field>
  ),
};

export const States: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-6">
      <StoryNote>Hover the +/− buttons. Figma page is marked To Review.</StoryNote>
      <StateRow label="Default">
        <NumberInput defaultValue={10} min={0} max={100} />
      </StateRow>
      <StateRow label="Disabled">
        <NumberInput defaultValue={10} disabled />
      </StateRow>
    </div>
  ),
};
