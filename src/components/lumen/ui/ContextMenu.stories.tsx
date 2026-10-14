import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

const meta = { title: 'Lumen/Data Display/Context Menu', component: ContextMenu } satisfies Meta<typeof ContextMenu>;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="grid h-40 w-80 place-items-center rounded-lg border border-dashed border-border bg-muted/40 text-sm text-muted-foreground hover:bg-muted">
        Right-click this board
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuItem>
            Copy odds
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>Add to betslip</ContextMenuItem>
          <ContextMenuItem disabled>Cash out</ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked>Pin market</ContextMenuCheckboxItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};
