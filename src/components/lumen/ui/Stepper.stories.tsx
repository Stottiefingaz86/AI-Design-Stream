import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTrigger,
} from '@/components/ui/stepper';
import { StoryNote } from '../story-kit';

const steps = [
  { id: 'details', title: 'Details' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Confirm' },
];

const meta = { title: 'Lumen/Data Display/Stepper', component: Stepper } satisfies Meta<typeof Stepper>;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-3">
      <StoryNote>Click a step. Hover indicators for the studio scale treatment. From @ss-components/stepper-01.</StoryNote>
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
      </Stepper>
    </div>
  ),
};
