import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const meta = { title: 'Lumen/Data Display/Form' } satisfies Meta;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <form
      className="max-w-md rounded-lg border border-border bg-card p-6"
      onSubmit={(e) => e.preventDefault()}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="you@example.com" />
        </Field>
        <Field>
          <FieldLabel htmlFor="stake">Default stake</FieldLabel>
          <Input id="stake" placeholder="25.00" />
          <FieldDescription>Used when you place a quick bet.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" placeholder="Optional" />
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="terms" />
          <FieldLabel htmlFor="terms">I accept the terms</FieldLabel>
        </Field>
        <div className="flex gap-2">
          <Button type="submit">Save</Button>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </div>
      </FieldGroup>
    </form>
  ),
};
