import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTrigger,
  useStepper,
} from '@/components/ui/stepper';

const steps = [
  { id: 'account', title: 'Account' },
  { id: 'verify', title: 'Verify' },
  { id: 'done', title: 'Done' },
];

function WizardActions() {
  const { stepper } = useStepper();
  return (
    <div className="mt-6 flex gap-2">
      <Button type="button" variant="outline" disabled={stepper.state.current.data.id === 'account'} onClick={() => stepper.navigation.prev()}>
        Back
      </Button>
      <Button type="button" onClick={() => stepper.navigation.next()}>
        {stepper.state.current.data.id === 'done' ? 'Finish' : 'Continue'}
      </Button>
    </div>
  );
}

const meta = { title: 'Lumen/Data Display/Form Wizard' } satisfies Meta;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <Stepper steps={steps} className="max-w-xl">
      <StepperNav>
        {steps.map((step, i) => (
          <StepperItem key={step.id} stepId={step.id}>
            <StepperTrigger>
              <StepperIndicator>{i + 1}</StepperIndicator>
            </StepperTrigger>
            <StepperSeparator />
          </StepperItem>
        ))}
      </StepperNav>
      <StepperPanel className="pt-6">
        <StepperContent value="account">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="wiz-email">Email</FieldLabel>
              <Input id="wiz-email" placeholder="you@example.com" />
            </Field>
          </FieldGroup>
        </StepperContent>
        <StepperContent value="verify">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="wiz-code">Verification code</FieldLabel>
              <Input id="wiz-code" placeholder="000000" />
            </Field>
          </FieldGroup>
        </StepperContent>
        <StepperContent value="done">
          <p className="text-sm text-muted-foreground">Account ready. You can place bets.</p>
        </StepperContent>
        <WizardActions />
      </StepperPanel>
    </Stepper>
  ),
};
