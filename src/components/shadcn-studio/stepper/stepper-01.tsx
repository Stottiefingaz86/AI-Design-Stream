import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperNav
} from '@/components/ui/stepper'

const steps = [{ id: 'details' }, { id: 'review' }, { id: 'done' }]

const StepperDemo = () => {
  return (
    <Stepper steps={steps} className='flex items-center max-md:w-xs md:w-full md:max-w-xl'>
      <StepperNav>
        {steps.map(step => (
          <StepperItem key={step.id} stepId={step.id}>
            <StepperTrigger>
              <StepperIndicator>{steps.indexOf(step) + 1}</StepperIndicator>
            </StepperTrigger>
            <StepperSeparator />
          </StepperItem>
        ))}
      </StepperNav>
    </Stepper>
  )
}

export default StepperDemo
