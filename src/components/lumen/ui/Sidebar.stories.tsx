import type { Meta, StoryObj } from '@storybook/react-vite';
import { HomeIcon, Dice5Icon, TrophyIcon, GiftIcon, UserIcon } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from '@/components/ui/sidebar';

const items = [
  { title: 'Home', icon: HomeIcon },
  { title: 'Casino', icon: Dice5Icon },
  { title: 'Sports', icon: TrophyIcon },
  { title: 'Promos', icon: GiftIcon },
  { title: 'Account', icon: UserIcon },
];

const meta = { title: 'Lumen/Navigation/Sidebar', component: Sidebar } satisfies Meta<typeof Sidebar>;
export default meta;

export const Default: StoryObj = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <SidebarProvider>
      <div className="flex min-h-[28rem] w-full">
        <Sidebar>
          <SidebarHeader className="px-4 py-3 text-sm font-semibold">Lumen</SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Play</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <main className="flex-1 bg-background p-6 text-sm text-muted-foreground">
          Hover a nav row. Collapse with the rail.
        </main>
      </div>
    </SidebarProvider>
  ),
};
