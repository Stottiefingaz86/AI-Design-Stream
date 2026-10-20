import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const meta = { title: 'Lumen/System States/Tooltip', component: Tooltip } satisfies Meta<typeof Tooltip>;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-32 items-center justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary">Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>Add to favourites</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};

export const SideRight: StoryObj = {
  render: () => (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-32 items-center justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary">Hover me</Button>
          </TooltipTrigger>
          <TooltipContent side="right">Casino Lobby</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};
