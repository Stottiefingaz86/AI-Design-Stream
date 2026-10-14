import type { Meta, StoryObj } from '@storybook/react-vite';
import { StoryNote } from '../story-kit';

const meta = { title: 'Lumen/Utilities/Instance Slot' } satisfies Meta;
export default meta;

export const Note: StoryObj = {
  render: () => (
    <div className="max-w-lg rounded-lg border border-dashed border-border p-6">
      <StoryNote>
        Instance Slot is a Figma authoring helper (swap an instance into a slot). In code the same idea is children / asChild / render props — used by Button, Item, SidebarMenuButton, and DialogTrigger.
      </StoryNote>
    </div>
  ),
};
