import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const meta = { title: 'Lumen/Others/Misc' } satisfies Meta;
export default meta;

export const ProfileSidebar: StoryObj = {
  render: () => (
    <Card className="w-64">
      <CardHeader className="flex flex-row items-center gap-3">
        <Avatar>
          <AvatarFallback>CH</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-sm">Chris</CardTitle>
          <p className="text-xs text-muted-foreground">VIP Gold</p>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-2 pt-4 text-sm">
        <a className="rounded-md px-2 py-1.5 hover:bg-muted" href="#account">
          Account
        </a>
        <a className="rounded-md px-2 py-1.5 hover:bg-muted" href="#bets">
          My bets
        </a>
        <a className="rounded-md px-2 py-1.5 hover:bg-muted" href="#wallet">
          Wallet
        </a>
      </CardContent>
    </Card>
  ),
};
