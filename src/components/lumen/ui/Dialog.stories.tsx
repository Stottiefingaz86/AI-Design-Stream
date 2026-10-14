import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const meta = { title: 'Lumen/System States/Dialog', component: Dialog } satisfies Meta<typeof Dialog>;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set a deposit limit</DialogTitle>
          <DialogDescription>Choose a daily, weekly or monthly limit. Increases take 24 hours.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button>Save limit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
