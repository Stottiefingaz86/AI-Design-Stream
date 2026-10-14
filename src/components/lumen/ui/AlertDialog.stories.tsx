import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const meta = { title: 'Lumen/System States/Alert Dialog', component: AlertDialog } satisfies Meta<typeof AlertDialog>;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cash out $1,240.00?</AlertDialogTitle>
          <AlertDialogDescription>Cashing out now locks in your return. This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Cash out</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};
