import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, AlertContent, AlertDescription, AlertTitle } from '@/components/ui/alert';

const meta = { title: 'Lumen/System States/Alert', component: Alert } satisfies Meta<typeof Alert>;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <div className="flex max-w-lg flex-col gap-3">
      <Alert variant="info">
        <AlertContent>
          <AlertTitle>Lorem ipsum</AlertTitle>
          <AlertDescription>Lorem ipsum dolor sit amet. Ut consequatur</AlertDescription>
        </AlertContent>
      </Alert>
      <Alert variant="success">
        <AlertContent>
          <AlertTitle>Lorem ipsum</AlertTitle>
          <AlertDescription>Lorem ipsum dolor sit amet. Ut consequatur</AlertDescription>
        </AlertContent>
      </Alert>
      <Alert variant="destructive">
        <AlertContent>
          <AlertTitle>Lorem ipsum</AlertTitle>
          <AlertDescription>Lorem ipsum dolor sit amet. Ut consequatur</AlertDescription>
        </AlertContent>
      </Alert>
    </div>
  ),
};
