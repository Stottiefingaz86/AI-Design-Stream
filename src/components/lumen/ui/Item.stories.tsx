import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronRightIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item';
import { StoryNote } from '../story-kit';

const meta = { title: 'Lumen/Actions/Item', component: Item } satisfies Meta<typeof Item>;
export default meta;

export const Default: StoryObj = {
  render: () => (
    <Item className="max-w-md hover:bg-muted">
      <ItemMedia>
        <Avatar>
          <AvatarFallback>PG</AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Play_Gusto</ItemTitle>
        <ItemDescription>Last bet $25 · 2 minutes ago</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" size="icon-sm" aria-label="Open">
          <ChevronRightIcon />
        </Button>
      </ItemActions>
    </Item>
  ),
};

export const Variants: StoryObj = {
  render: () => (
    <ItemGroup className="max-w-md">
      <StoryNote>Hover each row — outline/muted items use the studio hover wash.</StoryNote>
      <Item variant="outline" className="hover:bg-muted">
        <ItemContent>
          <ItemTitle>Outline</ItemTitle>
          <ItemDescription>Default list row with border.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="muted" className="hover:bg-muted">
        <ItemContent>
          <ItemTitle>Muted</ItemTitle>
          <ItemDescription>Quiet background for selected or secondary rows.</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
};
